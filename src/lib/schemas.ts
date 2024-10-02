import { UserRole } from "@prisma/client";
import * as z from "zod";

// ################################################################################################
// Primitives

const name = z.string().min(1, { message: "Name is required" });

const emailAddress = z.string().email({
  message: "Email is required",
});

const password = {
  login: z.string().min(1, { message: "Password is required" }),
  new: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
};

// ################################################################################################
// Refinements

const passwordsMatch = (data: {
  newPassword?: string;
  confirmNewPassword?: string;
}) => {
  if (data.newPassword || data.confirmNewPassword) {
    return data.newPassword === data.confirmNewPassword;
  }
  return true;
};

// ################################################################################################
// Utility Schemas

const requiredPasswordSchema = z
  .object({
    newPassword: password.new,
    confirmNewPassword: password.new,
  })
  .refine(passwordsMatch, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

const optionalPasswordSchema = z
  .object({
    newPassword: password.new.optional().or(z.literal("")),
    confirmNewPassword: password.new.optional().or(z.literal("")),
  })
  .refine(passwordsMatch, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// ################################################################################################
// Model Schemas (should match Prisma models)

const modelSchemas = {
  user: z.object({
    id: z.string().cuid(),
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    emailVerified: z.date().optional().nullable(),
    image: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    isTwoFactorEnabled: z.boolean(),
    role: z.enum(["ADMIN", "USER"]),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  token: z.object({
    id: z.string().cuid(),
    email: z.string(),
    token: z.string().uuid(),
    expires: z.date(),
    createdAt: z.date(),
  }),
};

// ################################################################################################
// Form Schemas

const formSchemas = {
  login: z.object({
    email: emailAddress,
    password: password.login,
    code: z.optional(z.string()),
  }),
  register: z
    .object({
      name: name,
      email: emailAddress,
    })
    .and(requiredPasswordSchema),
  verifyEmail: z.object({
    email: emailAddress,
  }),
  settings: z
    .object({
      name: z.optional(name),
      email: z.optional(emailAddress),
      role: z.enum([UserRole.USER, UserRole.ADMIN]),
      isTwoFactorEnabled: z.optional(z.boolean()),
    })
    .and(optionalPasswordSchema),
  createPassword: requiredPasswordSchema,
  email: z.object({ email: emailAddress }),
};

export type TFormLogin = z.infer<typeof s.form.login>;
export type TFormRegister = z.infer<typeof s.form.register>;
export type TFormVerifyEmail = z.infer<typeof s.form.verifyEmail>;
export type TFormSettings = z.infer<typeof s.form.settings>;
export type TFormCreatePassword = z.infer<typeof s.form.createPassword>;
export type TFormEmail = z.infer<typeof s.form.email>;

// ################################################################################################
// Action Schemas

const actionSchemas = {
  login: z.object({
    email: emailAddress,
    password: password.login,
    code: z.optional(
      z.union([
        z.string().refine((val) => val === ""),
        z.coerce
          .number()
          .int()
          .gte(1)
          .lte(999999)
          .transform((num) => num.toString().padStart(6, "0")),
      ]),
    ),
  }),
  sendToken: emailAddress,
  resetPassword: emailAddress,
  updateUserSettings: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
    isTwoFactorEnabled: z.boolean().optional(),
  }),
};

export type TActionLogin = z.infer<typeof s.action.login>;
export type TActionSendToken = z.infer<typeof s.action.sendToken>;
export type TActionResetPassword = z.infer<typeof s.action.resetPassword>;

// ################################################################################################

// Export 's' as a short alias for schema
export const s = {
  model: modelSchemas,
  form: formSchemas,
  action: actionSchemas,
};
