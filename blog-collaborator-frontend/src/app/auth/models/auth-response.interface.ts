export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
}
