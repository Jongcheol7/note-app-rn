// User
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  nickname: string | null;
  profileImage: string | null;
  bio: string | null;
  plan: string;
}

// Note
export interface Note {
  noteNo: number;
  userId: string;
  title: string;
  content: string;
  plainText: string | null;
  categoryNo: number | null;
  color: string | null;
  isPublic: boolean;
  isPinned: boolean;
  pinDatetime: string | null;
  alarmDatetime: string | null;
  modDatetime: string;
  inputDatetime: string;
  delDatetime: string | null;
  sortOrder: number | null;
  user?: User;
  like?: Like[];
  comment?: { count: number }[];
  category?: Category;
}

// Category
export interface Category {
  categoryNo: number;
  name: string;
  userId: string;
  sortOrder: number;
}

// Like
export interface Like {
  likeNo: number;
  userId: string;
  noteNo: number;
}

// Comment
export interface Comment {
  commentNo: number;
  userId: string;
  noteNo: number;
  content: string;
  inputDatetime: string;
  modDatetime: string;
  user?: User;
}

// Image (storage tracking)
export interface ImageRecord {
  imageNo: number;
  userId: string;
  fileUrl: string;
  fileSize: number;
  inputDatetime: string;
}

// Chat
export interface Conversation {
  convNo: number;
  user1Id: string;
  user2Id: string;
  lastMessage: string | null;
  lastDatetime: string | null;
  user1?: User;
  user2?: User;
  unreadCount?: number;
}

export interface Message {
  msgNo: number;
  convNo: number;
  senderId: string;
  content: string;
  isRead: boolean;
  inputDatetime: string;
  sender?: User;
}

// Block & Report
export interface Block {
  blockNo: number;
  blockerId: string;
  blockedId: string;
}

export interface Report {
  reportNo: number;
  reporterId: string;
  targetUserId: string | null;
  targetNoteNo: number | null;
  reason: string;
  inputDatetime: string;
}
