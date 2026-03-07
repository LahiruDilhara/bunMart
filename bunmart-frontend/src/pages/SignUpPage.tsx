import { Link } from "react-router-dom";
import {
  AuthInput,
  AuthErrorBanner,
  AuthFooterLinks,
  SubmitButton,
} from "@/components/auth";
import { useSignUpViewModel } from "@/viewmodel/useSignUpViewModel";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA7P56xybWig2aq_F2xNDtW_nPlFAzgFGSNGMZaX24WdEf-t-ITXXJABS4WWEXLZQAq348TeSPUv11E2Rd3FkFbu2ZhEAThyHr-oAKcnaMnK_SaXL6JMcQIMdIQXSEADAQPscjA3mc5IKpFZv3Xrlcsq_ofQfD6GBFyCqh3aY5rrky8G0p1305g-W0co47VYLDX9Ecx727mVV3_IHZzmAXi2eB58xFXJ0JzF4O5Yfkx0-AQ6pbtH6JzuyZbcKJXgBgdrq_BBgcUsFep";

export function SignUpPage() {
  const {
    form,
    fieldErrors,
    apiError,
    loading,
    showPassword,
    showConfirmPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useSignUpViewModel();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <div className="flex items-center bg-background-light dark:bg-background-dark px-4 py-3">
        <Link
          to="/"
          className="text-stone-900 dark:text-stone-100 flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          aria-label="Back to store"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <h2 className="flex-1 text-center pr-10 text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Create Account
        </h2>
      </div>
      <div className="w-full">
        <div
          className="w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE}")`, minHeight: "220px" }}
          role="img"
          aria-label="Freshly baked artisanal bread"
        />
      </div>
      <div className="px-4 pt-8 pb-4 text-center">
        <h1 className="text-stone-900 dark:text-stone-100 text-3xl font-bold tracking-tight">
          Join BunMart
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-base mt-2">
          Start your artisanal bread journey today
        </p>
      </div>
      <div className="flex flex-col gap-4 px-4 py-3 max-w-[480px] mx-auto w-full pb-10">
        {apiError && <AuthErrorBanner message={apiError} />}
        <AuthInput
          id="firstName"
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={form.firstName}
          onChange={(v) => handleChange("firstName", v)}
          error={fieldErrors.firstName}
        />
        <AuthInput
          id="lastName"
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={form.lastName}
          onChange={(v) => handleChange("lastName", v)}
          error={fieldErrors.lastName}
        />
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(v) => handleChange("email", v)}
          error={fieldErrors.email}
        />
        <AuthInput
          id="phone"
          label="Phone Number (optional)"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={form.phone}
          onChange={(v) => handleChange("phone", v)}
        />
        <AuthInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password (min. 6 characters)"
          value={form.password}
          onChange={(v) => handleChange("password", v)}
          error={fieldErrors.password}
          rightSlot={
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-sm">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          }
        />
        <AuthInput
          id="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(v) => handleChange("confirmPassword", v)}
          error={fieldErrors.confirmPassword}
          rightSlot={
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-sm">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          }
        />
        <div className="mt-2">
          <SubmitButton label="Create Account" loading={loading} onClick={handleSubmit} />
        </div>
        <div className="py-4 text-center">
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            Already have an account?{" "}
            <Link to="/auth/signin" className="text-primary font-bold hover:opacity-80 ml-1">
              Log In
            </Link>
          </p>
        </div>
      </div>
      <AuthFooterLinks />
      <div className="h-8" />
    </div>
  );
}
