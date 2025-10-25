export interface JwtUser {
  userId: string;
  username: string;
  role : string | null;
}


export interface JwtData {
  sub: string;
    username: string;
    role : string | null;
}