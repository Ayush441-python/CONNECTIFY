import { SignIn } from '@clerk/react';

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-fade px-6 py-12">
      <SignIn routing="path" path="/login" signUpUrl="/register" fallbackRedirectUrl="/onboarding" forceRedirectUrl="/onboarding" />
    </div>
  );
}
