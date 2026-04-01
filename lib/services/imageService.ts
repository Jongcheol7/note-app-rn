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

const R2_WORKER_URL = process.env.EXPO_PUBLIC_R2_WORKER_URL || '';
const R2_API_KEY = process.env.EXPO_PUBLIC_R2_API_KEY || '';

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

async function uploadToR2(
  fileBody: Blob | ArrayBuffer,
  fileName: string
): Promise<string> {
  const body = fileBody instanceof Blob ? await fileBody.arrayBuffer() : fileBody;

  const response = await fetch(`${R2_WORKER_URL}/${fileName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
      Authorization: `Bearer ${R2_API_KEY}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.url;
}

async function deleteFromR2(fileUrl: string): Promise<void> {
  const url = new URL(fileUrl);
  const key = url.pathname.slice(1);

  await fetch(`${R2_WORKER_URL}/${key}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${R2_API_KEY}`,
    },
  });
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
  const fileName = `prod/users/${userId}/notes/${Date.now()}.jpg`;

  let fileBody: Blob | ArrayBuffer;
  if (Platform.OS === 'web') {
    const response = await fetch(compressed.uri);
    fileBody = await response.blob();
  } else {
    const response = await fetch(compressed.uri);
    fileBody = await response.arrayBuffer();
  }

  const fileSize = fileBody instanceof Blob ? fileBody.size : fileBody.byteLength;
  let publicUrl: string;

  if (R2_WORKER_URL) {
    // R2 업로드
    publicUrl = await uploadToR2(fileBody, fileName);
  } else {
    // Supabase Storage 폴백
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

    publicUrl = urlData.publicUrl;
  }

  await supabase.from('image').insert({
    userId,
    fileUrl: publicUrl,
    fileSize,
  });

  return { url: publicUrl, fileSize };
}

/** HTML에서 img src URL 추출 */
function extractImageUrls(html: string): string[] {
  const matches = html.match(/<img[^>]+src="([^"]+)"/g) || [];
  return matches.map(m => {
    const src = m.match(/src="([^"]+)"/);
    return src ? src[1] : '';
  }).filter(Boolean);
}

/** 저장 시 이전 content와 비교하여 삭제된 이미지 정리 */
export async function cleanupRemovedImages(
  oldContent: string,
  newContent: string,
  userId: string
) {
  const oldUrls = extractImageUrls(oldContent);
  const newUrls = new Set(extractImageUrls(newContent));

  const removed = oldUrls.filter(url => !newUrls.has(url));
  await Promise.all(removed.map(url => deleteImage(url, userId)));
}

/** 노트 영구 삭제 시 해당 노트의 이미지 전체 삭제 */
export async function deleteAllNoteImages(noteContent: string, userId: string) {
  const urls = extractImageUrls(noteContent);
  await Promise.all(urls.map(url => deleteImage(url, userId)));
}

export async function deleteImage(fileUrl: string, userId: string) {
  if (!supabase) return;

  if (R2_WORKER_URL && fileUrl.includes(R2_WORKER_URL)) {
    await deleteFromR2(fileUrl);
  } else {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/notes/');
    if (pathParts.length >= 2) {
      await supabase.storage.from('notes').remove([pathParts[1]]);
    }
  }

  await supabase
    .from('image')
    .delete()
    .eq('fileUrl', fileUrl)
    .eq('userId', userId);
}
