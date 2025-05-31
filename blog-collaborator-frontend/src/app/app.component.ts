import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth/services/auth.service';
import { UserRole } from './auth/models/roles.enum';

import { NotificationService } from './notifications/services/notification.service';
import { WebSocketService } from './notifications/services/websocket.service';
import { Notification } from './notifications/models/notification.interface';
import { MessageService } from 'primeng/api';

import { NotificationsModule } from './notifications/notifications.module';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { NotificationPopoverComponent } from './notifications/components/notification-popover/notification-popover.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NotificationsModule,
    ToastModule,
    BadgeModule,
    ButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('notificationPopover')
  notificationPopover!: NotificationPopoverComponent;

  title = 'blog-collaborator-frontend';
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  unreadCount$!: Observable<number>;
  private notificationToastSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private webSocketService: WebSocketService,
    private messageService: MessageService
  ) {
    this.isLoggedIn$ = this.authService.authState;
    this.isAdmin$ = this.authService.authState.pipe(
      map((loggedIn) => {
        if (loggedIn) {
          return this.authService.hasAnyRole([UserRole.Admin]);
        }
        return false;
      })
    );
  }

  ngOnInit(): void {
    this.unreadCount$ = this.notificationService.unreadCount$;

    this.notificationToastSubscription =
      this.webSocketService.notifications$.subscribe(
        (notification: Notification) => {
          if (
            notification &&
            (notification.type === 'new_comment' ||
              notification.type === 'new_reply')
          ) {
            this.messageService.add({
              severity: 'info',
              summary: 'New Notification',
              detail: notification.message,
              life: 5000,
            });
          }
        }
      );

    this.authService.authState.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.notificationService.reconnectWebSocket();
        this.notificationService.getNotifications().subscribe();
      } else {
        this.webSocketService.disconnect();
      }
    });
  }

  toggleNotificationPopover(event: Event): void {
    this.notificationPopover.overlayPanel.toggle(event);
  }

  logout(): void {
    this.authService.logout();
    this.webSocketService.disconnect();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    if (this.notificationToastSubscription) {
      this.notificationToastSubscription.unsubscribe();
    }
  }
}
