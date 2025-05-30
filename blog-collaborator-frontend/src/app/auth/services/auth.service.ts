import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';
import { UserRole } from '../models/roles.enum';
import { User } from '../models/user.interface';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, RefreshTokenResponse } from '../models/auth-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly JWT_TOKEN_KEY = 'jwt_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private authStateChanged = new BehaviorSubject<boolean>(this.isAuthenticatedInternal());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());

  public authState = this.authStateChanged.asObservable();
  public currentUser = this.currentUserSubject.asObservable();

  private apiUrl = `http://localhost:3000/api/auth`;

  constructor(private http: HttpClient) { }

  private isAuthenticatedInternal(): boolean {
    return !!localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  private getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(this.JWT_TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    const user: User = {
      _id: response._id,
      username: response.username,
      email: response.email,
      roles: response.roles
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.authStateChanged.next(true);
    this.currentUserSubject.next(user);
  }

  login(credentials: { email: string, password: string }): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setAuthData(response)),
      map(() => true)
    );
  }

  register(userInfo: {
    username: string,
    email: string,
    password: string,
    roles?: string[]
  }): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userInfo).pipe(
      tap(response => this.setAuthData(response)),
      map(() => true)
    );
  }

  logout(): void {
    localStorage.removeItem(this.JWT_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.authStateChanged.next(false);
    this.currentUserSubject.next(null);
    console.log('User logged out, tokens cleared.');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedInternal();
  }

  getCurrentUser(): User | null {
    return this.getCurrentUserFromStorage();
  }

  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user ? user.roles : [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  getToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return new Observable(subscriber => {
        subscriber.next(false);
        subscriber.complete();
      });
    }

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh-token`, {
      token: refreshToken
    }).pipe(
      tap((response) => {
        localStorage.setItem(this.JWT_TOKEN_KEY, response.token);
        this.authStateChanged.next(true);
        console.log('Token refreshed successfully.');
      }),
      map(() => true)
    );
  }
}
