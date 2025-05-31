import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-notification-popover',
  standalone: true,
  imports: [CommonModule, OverlayPanelModule, ButtonModule],
  templateUrl: './notification-popover.component.html',
  styleUrls: ['./notification-popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPopoverComponent implements OnInit, OnDestroy {
  @ViewChild('op') overlayPanel!: OverlayPanel;

  notifications$!: Observable<Notification[]>;
  unreadCount$!: Observable<number>;

  private subscriptions = new Subscription();

  constructor(
    public notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.notificationService.getNotifications().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  onNotificationClick(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/articles', notification.article]);
    this.overlayPanel.hide();
  }

  onShowPopover(): void {
    this.notificationService.markNotificationsAsRead();
    this.cdr.markForCheck();
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification._id;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
