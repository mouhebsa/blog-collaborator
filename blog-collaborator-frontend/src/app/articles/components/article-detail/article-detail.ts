import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.interface';
import { AuthService } from '../../../auth/services/auth.service';
import {
  CommentService,
  Comment,
} from '../../../home/services/comment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.html',
  styleUrls: ['./article-detail.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ImageModule,
    TextareaModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    TagModule,
  ],
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  comments: Comment[] = [];
  newCommentText: string = '';
  replyingToCommentId: string | null = null;
  isSubmittingComment: boolean = false;
  commentError: string | null = null;

  editingCommentId: string | null = null;
  editedCommentText: string = '';
  isUpdatingComment: boolean = false;
  updateCommentError: string | null = null;

  isDeletingCommentId: string | null = null;
  deleteCommentError: string | null = null;

  constructor(
    public route: ActivatedRoute,
    private articleService: ArticleService,
    public authService: AuthService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.fetchArticle(articleId);
    } else {
      this.error = 'Article ID not found in route.';
      this.isLoading = false;
    }
  }

  fetchArticle(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.articleService.getArticleById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.isLoading = false;
        this.loadComments();
      },
      error: (err) => {
        console.error('Error fetching article:', err);
        this.error = 'Failed to load article. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  loadComments(): void {
    if (!this.article || !this.article._id) {
      console.error('Article not loaded, cannot fetch comments.');
      return;
    }
    this.commentService.getComments(this.article._id).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
        this.commentError = 'Failed to load comments.';
      },
    });
  }

  submitComment(): void {
    if (!this.article || !this.article._id || !this.newCommentText.trim()) {
      this.commentError = 'Cannot submit empty comment or article not loaded.';
      return;
    }

    this.isSubmittingComment = true;
    this.commentError = null;

    const articleId = this.article._id;
    const text = this.newCommentText;

    let submissionObservable: Observable<Comment>;

    if (this.replyingToCommentId) {
      submissionObservable = this.commentService.postComment(
        articleId,
        text,
        this.replyingToCommentId
      );
    } else {
      submissionObservable = this.commentService.postComment(articleId, text);
    }

    submissionObservable.subscribe({
      next: (_newComment: any) => {
        this.loadComments();
        this.newCommentText = '';
        this.replyingToCommentId = null;
        this.isSubmittingComment = false;
      },
      error: (err: any) => {
        console.error('Error submitting comment:', err);
        this.commentError = 'Failed to submit comment. Please try again.';
        this.isSubmittingComment = false;
      },
    });
  }

  startReply(commentId: string): void {
    this.replyingToCommentId = commentId;
    this.newCommentText = '';
  }

  cancelReply(): void {
    this.replyingToCommentId = null;
    this.newCommentText = '';
  }

  canEditOrDelete(commentAuthorId: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser._id === commentAuthorId : false;
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId = comment._id;
    this.editedCommentText = comment.text;
    this.updateCommentError = null;
    this.cancelReply();
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editedCommentText = '';
    this.updateCommentError = null;
  }

  saveEditComment(commentToSave: Comment): void {
    if (!this.editedCommentText.trim()) {
      this.updateCommentError = 'Comment text cannot be empty.';
      return;
    }

    this.isUpdatingComment = true;
    this.updateCommentError = null;

    this.commentService
      .updateComment(commentToSave._id, this.editedCommentText)
      .subscribe({
        next: (updatedComment) => {
          this.loadComments();

          this.cancelEditComment();
          this.isUpdatingComment = false;
        },
        error: (err) => {
          console.error('Error updating comment:', err);
          this.updateCommentError =
            'Failed to update comment. Please try again.';
          this.isUpdatingComment = false;
        },
      });
  }

  confirmDeleteComment(comment: Comment): void {
    const confirmationMessage =
      comment.replies && comment.replies.length > 0
        ? 'Are you sure you want to delete this comment? This action cannot be undone and will also delete all its replies.'
        : 'Are you sure you want to delete this comment? This action cannot be undone.';

    if (window.confirm(confirmationMessage)) {
      this.executeDeleteComment(comment._id);
    }
  }

  executeDeleteComment(commentId: string): void {
    this.isDeletingCommentId = commentId;
    this.deleteCommentError = null;
    this.commentError = null;
    this.updateCommentError = null;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.loadComments();
        this.isDeletingCommentId = null;
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        this.deleteCommentError = 'Failed to delete comment. Please try again.';
        this.isDeletingCommentId = null;
      },
    });
  }
}
