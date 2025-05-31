import { Injectable } from '@angular/core';
import {
  webSocket,
  WebSocketSubject,
  WebSocketSubjectConfig,
} from 'rxjs/webSocket';
import { Subject, Observable, EMPTY, timer, BehaviorSubject } from 'rxjs';
import { catchError, tap, retryWhen, delayWhen, share } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { Notification } from '../models/notification.interface';

const WS_ENDPOINT = 'ws://localhost:3000';
const RECONNECT_INTERVAL = 5000;
const MAX_RETRY_ATTEMPTS = 5;

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private messagesSubject = new Subject<Notification>();
  public notifications$: Observable<Notification> =
    this.messagesSubject.asObservable();

  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$: Observable<boolean> =
    this.connectionStatus.asObservable();

  private retryAttempts = 0;

  constructor(private authService: AuthService) {}

  public connect(): void {
    if (this.socket$ && !this.socket$.closed) {
      console.log('WebSocket already connected.');
      return;
    }

    const userId =
      this.authService.getCurrentUser()?._id ||
      this.authService.getCurrentUser();
    if (!userId) {
      console.error('WebSocketService: User ID not available. Cannot connect.');
      return;
    }

    console.log('WebSocketService: Attempting to connect...');
    this.retryAttempts = 0;

    const config: WebSocketSubjectConfig<any> = {
      url: WS_ENDPOINT,
      deserializer: (msg) => JSON.parse(msg.data),
      serializer: (msg) => JSON.stringify(msg),
      openObserver: {
        next: () => {
          console.log('WebSocket connection established.');
          this.connectionStatus.next(true);
          this.retryAttempts = 0;
          this.sendMessage({ type: 'REGISTER', userId: userId });
        },
      },
      closeObserver: {
        next: (closeEvent) => {
          console.warn('WebSocket connection closed:', closeEvent);
          this.connectionStatus.next(false);
          this.socket$ = null;
        },
      },
    };

    this.socket$ = webSocket(config);

    this.socket$
      .pipe(
        tap({
          error: (error) => console.error('WebSocket error:', error),
        }),
        retryWhen((errors) =>
          errors.pipe(
            delayWhen(() => {
              this.retryAttempts++;
              if (this.retryAttempts > MAX_RETRY_ATTEMPTS) {
                console.error(
                  `WebSocket: Max retry attempts (${MAX_RETRY_ATTEMPTS}) reached. Giving up.`
                );
                this.connectionStatus.next(false);
                this.socket$ = null;
                return EMPTY;
              }
              console.log(
                `WebSocket: Attempting to reconnect... (Attempt ${this.retryAttempts})`
              );
              this.connectionStatus.next(false);
              return timer(RECONNECT_INTERVAL);
            })
          )
        ),
        catchError((error) => {
          console.error('WebSocket stream error after retries:', error);
          this.connectionStatus.next(false);
          this.socket$ = null;
          return EMPTY;
        }),
        share()
      )
      .subscribe(
        (message: any) => {
          if (
            message &&
            (message.type === 'new_comment' ||
              message.type === 'new_reply' ||
              message.type === 'notification_batch')
          ) {
            if (
              message.type === 'notification_batch' &&
              Array.isArray(message.data)
            ) {
              message.data.forEach((notification: Notification) =>
                this.messagesSubject.next(notification)
              );
            } else if (message._id) {
              this.messagesSubject.next(message as Notification);
            }
          } else if (message.type === 'REGISTER_SUCCESS') {
            console.log('WebSocket: Client registration successful.');
          } else if (message.type === 'ERROR') {
            console.error(
              'WebSocket: Received error message from server:',
              message.message
            );
          } else {
            console.log(
              'WebSocket: Received unhandled message type or format:',
              message
            );
          }
        },
        (err) => {
          console.error('WebSocket subscription error:', err);
          this.connectionStatus.next(false);
          if (this.socket$) {
            this.socket$.complete();
            this.socket$ = null;
          }
        },
        () => {
          console.log('WebSocket stream completed.');
          this.connectionStatus.next(false);
          if (this.socket$) {
            this.socket$.complete();
            this.socket$ = null;
          }
        }
      );
  }

  public sendMessage(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
    }
  }

  public disconnect(): void {
    if (this.socket$) {
      console.log('Disconnecting WebSocket.');
      this.socket$.complete();
      this.socket$ = null;
      this.connectionStatus.next(false);
    }
  }
}
