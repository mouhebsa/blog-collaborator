import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { UserRole } from '../../../auth/models/roles.enum';
import { User } from '../../../auth/models/user.interface';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { Article } from '../../models/article.interface';
import { ArticleService } from '../../services/article.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { availableTags } from '../../models/tags.model';

@Component({
  selector: 'app-article-form',
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    TextareaModule,
    MultiSelectModule,
  ],
})
export class ArticleFormComponent implements OnInit {
  articleForm!: FormGroup;
  editMode = false;
  articleId: string | null = null;
  currentArticle: Article | null = null;
  currentUser: User | null = null;
  submitting = false;
  errorMessage: string | null = null;
  availableTags = availableTags;
  inputValue: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUser = currentUser;

    this.articleId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.articleId;

    this.initForm();

    if (this.editMode && this.articleId) {
      this.loadArticleForEditing(this.articleId);
    } else {
      if (!this.currentUser) {
        this.errorMessage = 'Vous devez être connecté pour créer un article.';
        this.articleForm.disable();
      }
    }
  }

  private initForm(): void {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      image: [''],
      tags: [[]],
    });
  }

  private loadArticleForEditing(id: string): void {
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.currentArticle = article;
        if (!this.canEditExistingArticle(article)) {
          this.errorMessage =
            "Vous n'avez pas la permission de modifier cet article.";
          this.articleForm.disable();
          return;
        }

        const existingTags =
          article.tags?.map((tag) => {
            const foundTag = this.availableTags.find((t) => t.value === tag);
            return foundTag ? foundTag.value : tag;
          }) || [];

        this.articleForm.patchValue({
          title: article.title,
          content: article.content,
          image: article.image,
          tags: existingTags,
        });
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.errorMessage =
          "Erreur lors du chargement de l'article pour modification.";
      },
    });
  }

  private canEditExistingArticle(article: Article): boolean {
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

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    if (!this.currentUser) {
      this.errorMessage =
        'Vous devez être connecté pour effectuer cette action.';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const formValue = this.articleForm.value;
    const articleData: Partial<Article> = {
      title: formValue.title,
      content: formValue.content,
      image: formValue.image || '',
      tags: [
        ...new Set(
          (formValue.tags as (string | { value: string })[]).map((tag) =>
            typeof tag === 'object' ? tag.value : tag
          )
        ),
      ],
    };

    if (!this.editMode) {
      if (this.currentUser?._id) {
        articleData.author._id = this.currentUser._id;
      } else {
        this.errorMessage =
          "ID utilisateur non trouvé. Impossible de définir l'auteur.";
        this.submitting = false;
        return;
      }
    }

    if (this.editMode && this.articleId) {
      if (!this.canEditExistingArticle(this.currentArticle!)) {
        this.errorMessage = 'Permission refusée pour modifier cet article.';
        this.submitting = false;
        return;
      }
      this.articleService.updateArticle(this.articleId, articleData).subscribe({
        next: () => this.router.navigate(['/articles']),
        error: (err) => {
          console.error('Error updating article:', err);
          this.errorMessage =
            err.error?.message || "Erreur lors de la mise à jour de l'article.";
          this.submitting = false;
        },
        complete: () => (this.submitting = false),
      });
    } else {
      this.articleService.createArticle(articleData).subscribe({
        next: () => this.router.navigate(['/articles']),
        error: (err) => {
          console.error('Error creating article:', err);
          this.errorMessage =
            err.error?.message || "Erreur lors de la création de l'article.";
          this.submitting = false;
        },
        complete: () => (this.submitting = false),
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
