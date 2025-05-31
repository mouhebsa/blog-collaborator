export interface Notification {
  _id: string;
  user: string;
  comment?: string;
  article: string;
  type: 'new_comment' | 'new_reply';
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
