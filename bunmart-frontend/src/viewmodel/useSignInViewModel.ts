import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signIn, setAuthToken, setStoredUserId } from "@/service/authService";
import type { SignInRequest } from "@/model/auth";

export interface SignInFormState {
  email: string;
  password: string;
}

export function useSignInViewModel() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignInFormState>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<SignInFormState>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof SignInFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  }

  function validate(): boolean {
    const errors: Partial<SignInFormState> = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload: SignInRequest = { email: form.email, password: form.password };
      const response = await signIn(payload);
      setAuthToken(response.token);
      setStoredUserId(String(response.userId));
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        const msg = data && typeof data === "object" && "error" in data
          ? (data as { error?: string }).error
          : data && typeof data === "object" && "message" in data
            ? (data as { message?: string }).message
            : undefined;
        setApiError(
          msg ??
            (err.response?.status === 401
              ? "Invalid email or password."
              : err.response?.status === 403
                ? "Access denied."
                : "Sign in failed. Please try again.")
        );
      } else {
        setApiError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    fieldErrors,
    apiError,
    loading,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword: () => setShowPassword((v) => !v),
  };
}
