import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError, Observable } from 'rxjs';

import { ArticleDetailComponent } from './article-detail';
import { ArticleService } from '../../services/article.service';
import { CommentService, Comment } from '../../../home/services/comment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Article } from '../../models/article.interface';
import { User } from '../../../auth/models/user.interface'; // Import User interface

// Helper function to query elements, helps reduce boilerplate
const getElement = <T extends HTMLElement>(fixture: ComponentFixture<any>, selector:string): T | null => {
  return fixture.nativeElement.querySelector(selector);
};

const getElements = <T extends HTMLElement>(fixture: ComponentFixture<any>, selector: string): NodeListOf<T> | null => {
    return fixture.nativeElement.querySelectorAll(selector);
};

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let mockArticleService: jasmine.SpyObj<ArticleService>;
  let mockCommentService: jasmine.SpyObj<CommentService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockActivatedRoute: any;

  const testArticleId = 'test-article-123';
  const loggedInUserId = 'user123';
  const otherUserId = 'user456';

  const mockArticle: Article = {
    _id: testArticleId,
    title: 'Test Article Title',
    content: 'Test article content.',
    author: { _id: 'author1', username: 'TestAuthor' },
    createdAt: new Date(),
    tags: ['test', 'angular'],
  };

  const mockLoggedInUser: User = {
    _id: loggedInUserId,
    username: 'CurrentUser',
    email: 'current@test.com',
    roles: ['user']
  };

  let mockComments: Comment[]; // Define here, initialize in beforeEach

  beforeEach(async () => {
    // Reset comments for each test to avoid modification issues
    mockComments = [
      { _id: 'c1', text: 'First comment', author: { _id: loggedInUserId, username: 'CurrentUser' }, article: testArticleId, createdAt: new Date(), replies: [] },
      { _id: 'c2', text: 'Second comment', author: { _id: otherUserId, username: 'OtherUser' }, article: testArticleId, createdAt: new Date(), replies: [
        { _id: 'c3', text: 'Reply to second', author: { _id: loggedInUserId, username: 'CurrentUser' }, article: testArticleId, parentComment: 'c2', createdAt: new Date() }
      ]},
    ];

    mockArticleService = jasmine.createSpyObj('ArticleService', ['getArticleById']);
    mockCommentService = jasmine.createSpyObj('CommentService', ['getComments', 'postComment', 'updateComment', 'deleteComment']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: testArticleId }),
        url: [{ path: 'articles' }, { path: testArticleId }]
      }
    };

    await TestBed.configureTestingModule({
      // For Standalone: Component goes into imports. No declarations needed for the component itself.
      imports: [
        ArticleDetailComponent, // Import the standalone component
        FormsModule,
        RouterTestingModule, // For routerLink in login prompt
        CommonModule
      ],
      providers: [
        { provide: ArticleService, useValue: mockArticleService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;

    // Default mock implementations
    mockArticleService.getArticleById.and.returnValue(of(mockArticle));
    mockCommentService.getComments.and.returnValue(of(JSON.parse(JSON.stringify(mockComments)))); // Deep copy
    mockCommentService.updateComment.and.callFake((_commentId, text) => of({ ...mockComments[0], text }));
    mockCommentService.deleteComment.and.returnValue(of({})); // Default successful delete
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.getCurrentUser.and.returnValue(mockLoggedInUser);
  });

  // ... (keep existing 'should create' and 'Article Fetching and Display' tests, ensure they pass) ...
  // Previous tests from step 5 would be here. I'll re-add a few essential ones for context.

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Article Fetching and Display', () => {
    it('should fetch article and comments on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockArticleService.getArticleById).toHaveBeenCalledWith(testArticleId);
      expect(component.article).toEqual(mockArticle);
      expect(mockCommentService.getComments).toHaveBeenCalledWith(testArticleId);
      expect(component.comments).toEqual(mockComments);
    }));
  });


  describe('canEditOrDelete', () => {
    it('should return true if current user is the author', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockLoggedInUser);
      expect(component.canEditOrDelete(loggedInUserId)).toBeTrue();
    });

    it('should return false if current user is not the author', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockLoggedInUser);
      expect(component.canEditOrDelete(otherUserId)).toBeFalse();
    });

    it('should return false if no user is logged in', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      expect(component.canEditOrDelete(loggedInUserId)).toBeFalse();
    });
  });

  describe('Update Comment Logic', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges(); // Load initial article & comments
      tick();
    }));

    it('startEditComment should set editing state', () => {
      const commentToEdit = mockComments[0];
      component.startEditComment(commentToEdit);
      expect(component.editingCommentId).toBe(commentToEdit._id);
      expect(component.editedCommentText).toBe(commentToEdit.text);
      expect(component.updateCommentError).toBeNull();
    });

    it('cancelEditComment should reset editing state', () => {
      component.startEditComment(mockComments[0]); // Enter edit mode
      component.cancelEditComment();
      expect(component.editingCommentId).toBeNull();
      expect(component.editedCommentText).toBe('');
      expect(component.updateCommentError).toBeNull();
    });

    it('saveEditComment should update comment successfully', fakeAsync(() => {
      const commentToEdit = mockComments[0];
      component.startEditComment(commentToEdit);
      component.editedCommentText = 'Updated comment text';

      mockCommentService.updateComment.and.returnValue(of({ ...commentToEdit, text: component.editedCommentText }));
      mockCommentService.getComments.and.returnValue(of(JSON.parse(JSON.stringify(mockComments)))); // For reload

      component.saveEditComment(commentToEdit);
      tick();

      expect(mockCommentService.updateComment).toHaveBeenCalledWith(commentToEdit._id, 'Updated comment text');
      expect(mockCommentService.getComments).toHaveBeenCalledTimes(2); // Initial + after update
      expect(component.editingCommentId).toBeNull();
      expect(component.isUpdatingComment).toBeFalse();
    }));

    it('saveEditComment should handle error during update', fakeAsync(() => {
      const commentToEdit = mockComments[0];
      component.startEditComment(commentToEdit);
      component.editedCommentText = 'Updated text';
      mockCommentService.updateComment.and.returnValue(throwError(() => new Error('Update failed')));

      component.saveEditComment(commentToEdit);
      tick();

      expect(component.updateCommentError).toContain('Failed to update comment');
      expect(component.isUpdatingComment).toBeFalse();
      expect(component.editingCommentId).toBe(commentToEdit._id); // Should remain in edit mode
    }));

    it('saveEditComment should not call service if edited text is empty', () => {
      const commentToEdit = mockComments[0];
      component.startEditComment(commentToEdit);
      component.editedCommentText = '   '; // Empty or whitespace
      component.saveEditComment(commentToEdit);

      expect(mockCommentService.updateComment).not.toHaveBeenCalled();
      expect(component.updateCommentError).toContain('Comment text cannot be empty');
    });
  });

  describe('Update Comment UI', () => {
    beforeEach(fakeAsync(() => {
        fixture.detectChanges();
        tick();
        fixture.detectChanges(); // for UI to render comments
    }));

    it('should show Edit button if user can edit and is authenticated', () => {
        mockAuthService.isAuthenticated.and.returnValue(true);
        mockAuthService.getCurrentUser.and.returnValue(mockLoggedInUser); // User is author of mockComments[0]
        fixture.detectChanges();

        const editButton = getElement(fixture, `.comment-item button.text-secondary`); // Assuming Edit is secondary
        expect(editButton).toBeTruthy();
        expect(editButton?.textContent).toContain('Edit');
    });

    it('should hide Edit button if user cannot edit', () => {
        mockAuthService.isAuthenticated.and.returnValue(true);
        // User is NOT author of mockComments[1]
        mockAuthService.getCurrentUser.and.returnValue({_id: 'anotherUserId', username: 'test', email:'test@test.com', roles: ['user'] });
        fixture.detectChanges();

        // Find the comment item for mockComments[1] and check its edit button
        const commentElements = getElements(fixture, '.comment-item');
        const otherUserCommentItem = Array.from(commentElements!).find(el => el.textContent?.includes(mockComments[1].text));
        const editButton = otherUserCommentItem?.querySelector('button.text-secondary');
        expect(editButton).toBeFalsy();
    });

    it('should display edit form when Edit button is clicked', fakeAsync(() => {
        const commentToEdit = mockComments[0];
        mockAuthService.isAuthenticated.and.returnValue(true);
        mockAuthService.getCurrentUser.and.returnValue(mockLoggedInUser);
        fixture.detectChanges();

        const editButton = getElement(fixture, `.comment-item button.text-secondary`);
        editButton?.click();
        tick();
        fixture.detectChanges();

        expect(component.editingCommentId).toBe(commentToEdit._id);
        const textarea = getElement(fixture, `textarea[name="editedCommentText_${commentToEdit._id}"]`);
        const saveButton = getElement(fixture, `.edit-comment-form button.btn-primary`);
        expect(textarea).toBeTruthy();
        expect(saveButton).toBeTruthy();
        expect((textarea as HTMLTextAreaElement).value).toBe(commentToEdit.text);
    }));
  });

  describe('Delete Comment Logic', () => {
    let confirmSpy: jasmine.Spy;

    beforeEach(fakeAsync(() => {
      fixture.detectChanges(); // Load initial article & comments
      tick();
      confirmSpy = spyOn(window, 'confirm');
    }));

    it('confirmDeleteComment should call executeDeleteComment if user confirms', () => {
      confirmSpy.and.returnValue(true);
      const commentToDelete = mockComments[0];
      spyOn(component, 'executeDeleteComment'); // Spy on the method to check if it's called

      component.confirmDeleteComment(commentToDelete);

      expect(window.confirm).toHaveBeenCalled();
      expect(component.executeDeleteComment).toHaveBeenCalledWith(commentToDelete._id);
    });

    it('confirmDeleteComment should NOT call executeDeleteComment if user cancels', () => {
      confirmSpy.and.returnValue(false);
      const commentToDelete = mockComments[0];
      spyOn(component, 'executeDeleteComment');

      component.confirmDeleteComment(commentToDelete);

      expect(window.confirm).toHaveBeenCalled();
      expect(component.executeDeleteComment).not.toHaveBeenCalled();
    });

    it('executeDeleteComment should delete comment successfully', fakeAsync(() => {
      const commentIdToDelete = mockComments[0]._id;
      mockCommentService.deleteComment.and.returnValue(of({})); // Simulate successful deletion
      mockCommentService.getComments.and.returnValue(of([])); // Simulate comments reloaded (empty)

      component.executeDeleteComment(commentIdToDelete);
      tick();

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(commentIdToDelete);
      expect(mockCommentService.getComments).toHaveBeenCalledTimes(2); // Initial + after delete
      expect(component.isDeletingCommentId).toBeNull();
    }));

    it('executeDeleteComment should handle error during deletion', fakeAsync(() => {
      const commentIdToDelete = mockComments[0]._id;
      mockCommentService.deleteComment.and.returnValue(throwError(() => new Error('Delete failed')));

      component.executeDeleteComment(commentIdToDelete);
      tick();

      expect(component.deleteCommentError).toContain('Failed to delete comment');
      expect(component.isDeletingCommentId).toBeNull();
    }));
  });

  describe('Delete Comment UI', () => {
    beforeEach(fakeAsync(() => {
        mockAuthService.isAuthenticated.and.returnValue(true);
        mockAuthService.getCurrentUser.and.returnValue(mockLoggedInUser); // Author of mockComments[0]
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
    }));

    it('should show Delete button if user can delete', () => {
        const deleteButton = getElement(fixture, `.comment-item button.text-danger`); // Delete button
        expect(deleteButton).toBeTruthy();
        expect(deleteButton?.textContent).toContain('Delete');
    });

    it('should call window.confirm on delete button click', () => {
        spyOn(window, 'confirm').and.returnValue(false); // Prevent actual delete logic
        const deleteButton = getElement(fixture, `.comment-item button.text-danger`);
        deleteButton?.click();
        expect(window.confirm).toHaveBeenCalled();
    });
  });

  // Ensure existing tests for Authentication (comment form visibility) are also present and pass.
  // From previous step:
  describe('Authentication Checks (UI)', () => {
    it('should show comment form if authenticated', fakeAsync(() => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      fixture.detectChanges();
      tick(); // article, comments
      fixture.detectChanges(); // UI update

      const form = getElement(fixture, '.comment-form-container form');
      expect(form).toBeTruthy();
    }));

    it('should hide comment form and show login prompt if not authenticated', fakeAsync(() => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const form = getElement(fixture, '.comment-form-container form');
      const loginPrompt = getElement(fixture, '.login-prompt');
      expect(form).toBeFalsy();
      expect(loginPrompt).toBeTruthy();
    }));
  });

});
