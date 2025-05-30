export interface Article {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  authorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
