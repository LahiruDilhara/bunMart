import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signUp, setAuthToken, setStoredUserId } from "@/service/authService";
import type { SignUpRequest } from "@/model/auth";

export interface SignUpFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export function useSignUpViewModel() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignUpFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<SignUpFormState>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(field: keyof SignUpFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  }

  function validate(): boolean {
    const errors: Partial<SignUpFormState> = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Enter a valid email address.";
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const payload: SignUpRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      };
      const response = await signUp(payload);
      setAuthToken(response.token);
      setStoredUserId(String(response.userId));
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.errors && typeof data.errors === "object") {
          const mapped: Partial<SignUpFormState> = {};
          for (const [key, msg] of Object.entries(data.errors)) {
            if (key in form) (mapped as Record<string, unknown>)[key] = msg;
          }
          setFieldErrors(mapped);
        } else {
          setApiError(data?.message ?? "Sign up failed. Please try again.");
        }
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
    showConfirmPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword: () => setShowPassword((v) => !v),
    toggleShowConfirmPassword: () => setShowConfirmPassword((v) => !v),
  };
}
