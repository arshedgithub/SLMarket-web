export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerified: boolean;
  role: "ADMIN" | "USER";
  avatarUrl?: string;
  district?: string;
  createdAt: Date;
  updatedAt: Date;
}
