import { z } from "zod";

// Base email and password validation
const email = z.string().email("Please enter a valid email address");
const password = z.string().min(8, "Password must be at least 8 characters");

// Login form schema
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// Registration form schema
export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dealership: z.string().min(1, "Dealership name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email,
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// TypeScript types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Combined auth form data (for the toggle component)
export type AuthFormData = LoginFormData | RegisterFormData;