import { supabase } from '../supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const MAX_WIDTH = 1200;

const STORAGE_LIMITS: Record<string, number> = {
  free: 30 * 1024 * 1024,
  plus: 1024 * 1024 * 1024,
  pro: 3 * 1024 * 1024 * 1024,
  unlimited: Infinity,
};

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export async function compressImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result;
}

export async function uploadImage(
  uri: string,
  userId: string,
  userPlan: string = 'free'
): Promise<{ url: string; fileSize: number } | null> {
  if (!supabase) return null;

  // Check storage quota
  const { data: images } = await supabase
    .from('image')
    .select('fileSize')
    .eq('userId', userId);

  const currentUsage = images?.reduce((sum, img) => sum + img.fileSize, 0) ?? 0;
  const limit = STORAGE_LIMITS[userPlan] ?? STORAGE_LIMITS.free;

  if (currentUsage >= limit) {
    throw new Error('저장 용량이 부족합니다. 플랜을 업그레이드해주세요.');
  }

  const compressed = await compressImage(uri);
  const fileName = `${userId}/${Date.now()}.jpg`;

  let fileBody: Blob | ArrayBuffer;
  if (Platform.OS === 'web') {
    const response = await fetch(compressed.uri);
    fileBody = await response.blob();
  } else {
    const response = await fetch(compressed.uri);
    fileBody = await response.arrayBuffer();
  }

  const { data, error } = await supabase.storage
    .from('notes')
    .upload(fileName, fileBody, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('notes')
    .getPublicUrl(data.path);

  const fileSize = fileBody instanceof Blob ? fileBody.size : fileBody.byteLength;

  await supabase.from('image').insert({
    userId,
    fileUrl: urlData.publicUrl,
    fileSize,
  });

  return { url: urlData.publicUrl, fileSize };
}

export async function deleteImage(fileUrl: string, userId: string) {
  if (!supabase) return;

  const url = new URL(fileUrl);
  const pathParts = url.pathname.split('/storage/v1/object/public/notes/');
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];

  await supabase.storage.from('notes').remove([filePath]);
  await supabase
    .from('image')
    .delete()
    .eq('fileUrl', fileUrl)
    .eq('userId', userId);
}
