import * as yup from "yup";

// Login validation schema
export const loginSchema = yup.object().shape({
    username: yup
        .string()
        .trim()
        .required("Username or email is required"),

    password: yup
        .string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must not exceed 100 characters"),
    rememberMe: yup.boolean().optional().default(false),
});

// Type inference
export type LoginFormData = yup.InferType<typeof loginSchema>;

// Default values for login form
export const loginDefaultValues: LoginFormData = {
    username: "",
    password: "",
    rememberMe: false,
};
