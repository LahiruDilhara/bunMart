import { Link } from "react-router-dom";
import {
  AuthHeader,
  AuthInput,
  AuthErrorBanner,
  AuthDivider,
  SocialButtons,
  AuthFooterLinks,
  SubmitButton,
} from "@/components/auth";
import { useSignInViewModel } from "@/viewmodel/useSignInViewModel";

const HEADER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAppii0ADHDhP9P19JLrDfWOD9Jub7SVPymqSCNCPk5az3kB0rmM3BSpy9t71xEgpnafSBdkilMlGdOiMwSNI0fOSPB0VjsVL6JOQ4l5_GP2XOTeU-woRnIyb9j3iW0eqeTyAq9sWuztdq7lKkja0j3kEGxGY-HYqY48MTxgCo5fNS3nqHnwUa-cx3qnNeG2MmS2JQ4MLyNKAoT8Lzu3xoezSYtnf5SAWEOcccxKP2DfdTb194jGdMyv3iFE4M60naqLnCodJWsv2cR";

export function SignInPage() {
  const {
    form,
    fieldErrors,
    apiError,
    loading,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useSignInViewModel();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to store
          </Link>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl overflow-hidden border border-stone-200 dark:border-stone-800">
          <AuthHeader imageUrl={HEADER_IMAGE} linkToHome />
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Welcome back</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Freshly baked delights are just a login away.
              </p>
            </div>
            {apiError && (
              <div className="mb-4">
                <AuthErrorBanner message={apiError} />
              </div>
            )}
            <div className="space-y-5">
              <AuthInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
                error={fieldErrors.email}
                icon="mail"
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Password
                  </label>
                </div>
                <AuthInput
                  id="password"
                  label=""
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(v) => handleChange("password", v)}
                  error={fieldErrors.password}
                  icon="lock"
                  rightSlot={
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  }
                />
              </div>
              <SubmitButton label="Sign In" loading={loading} onClick={handleSubmit} />
            </div>
            <AuthDivider />
            <SocialButtons />
            <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
              Don&apos;t have an account?{" "}
              <Link to="/auth/signup" className="font-bold text-primary hover:opacity-80">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        <AuthFooterLinks />
      </div>
    </div>
  );
}
