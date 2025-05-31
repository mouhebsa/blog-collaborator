import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Notification } from '../models/notification.interface';
import { WebSocketService } from './websocket.service';

const API_URL = 'http://localhost:3000/api/notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> =
    this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> =
    this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private websocketService: WebSocketService
  ) {
    this.websocketService.connect();
    this.websocketService.notifications$.subscribe({
      next: (notification) => {
        this.addNotificationToList(notification);
      },
      error: (err) => {
        console.error(
          'Error receiving notification from WebSocketService:',
          err
        );
      },
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(API_URL).pipe(
      tap((notifications) => {
        this.notificationsSubject.next(notifications);
        const currentUnread = notifications.filter((n) => !n.read).length;
        this.unreadCountSubject.next(currentUnread);
      }),
      catchError((error) => {
        console.error('Failed to fetch notifications:', error);
        return of([]);
      })
    );
  }

  private addNotificationToList(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.getValue();
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    if (!notification.read) {
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    }
  }

  markNotificationsAsRead(): void {
    this.unreadCountSubject.next(0);
    const currentNotifications = this.notificationsSubject
      .getValue()
      .map((n) => ({ ...n, read: true }));
    this.notificationsSubject.next(currentNotifications);
  }

  reconnectWebSocket(): void {
    this.websocketService.disconnect();
    this.websocketService.connect();
  }
}
