export interface Article {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  tags?: string[];
  author?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
