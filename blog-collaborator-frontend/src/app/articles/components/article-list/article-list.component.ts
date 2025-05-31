import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { UserRole } from '../../../auth/models/roles.enum';
import { User } from '../../../auth/models/user.interface';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Article } from '../../models/article.interface';
import { ArticleService } from '../../services/article.service';
import { NgIf, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  standalone: true,
  imports: [ButtonModule, TableModule, SlicePipe, NgIf],
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  loading: boolean = true;
  currentUser: User | null = null;

  constructor(
    private articleService: ArticleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUser = currentUser;
    }
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching articles:', err);
        this.loading = false;
      },
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/articles/new']);
  }

  editArticle(article: Article): void {
    if (this.canEdit(article)) {
      this.router.navigate(['/articles/edit', article._id]);
    } else {
      console.warn('User does not have permission to edit this article.');
    }
  }

  canEdit(article: Article): boolean {
    if (!this.currentUser) return false;

    const roles = this.currentUser.roles;

    if (roles.includes(UserRole.Admin) || roles.includes(UserRole.Editor)) {
      return true;
    }
    if (
      roles.includes(UserRole.Redactor) &&
      article?.author?._id === this.currentUser?._id
    ) {
      return true;
    }
    return false;
  }

  canDelete(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.roles.includes(UserRole.Admin);
  }

  deleteArticle(article: Article): void {
    if (!article._id) {
      console.error('Article ID is missing, cannot delete.');
      return;
    }
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer l'article "${article.title}" ?`
      )
    ) {
      this.articleService.deleteArticle(article._id).subscribe({
        next: () => {
          this.articles = this.articles.filter((a) => a._id !== article._id);
        },
        error: (err) => {
          console.error('Error deleting article:', err);
        },
      });
    }
  }
}
