import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  _id: string;
  text: string;
  author: {
    _id: string;
    username: string;
    email?: string;
  };
  article: string;
  parentComment?: any;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  constructor(private http: HttpClient) {}

  getComments(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/article/${articleId}`);
  }

  postComment(
    articleId: string,
    text: string,
    parentCommentId?: string
  ): Observable<Comment> {
    const payload: any = {
      articleId,
      text,
    };
    if (parentCommentId) {
      payload.parentCommentId = parentCommentId;
    }
    return this.http.post<Comment>(this.apiUrl, payload);
  }

  updateComment(commentId: string, text: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, { text });
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${commentId}`);
  }
}
