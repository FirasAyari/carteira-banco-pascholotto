export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresAtUtc: string;
  user: UserProfile;
};

export type SessionState = {
  accessToken: string;
  expiresAtUtc: string;
  user: UserProfile;
};
