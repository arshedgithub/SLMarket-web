import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(1, "Phone number is required"),
  district: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "This field is required"),
  method: z.enum(["email", "phone"]).default("email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyPhoneSchema = z.object({
  idToken: z.string().min(1, "Firebase ID token required"),
});

export const sendEmailOtpSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
