import { SignUp } from '@clerk/react';

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-fade px-6 py-12">
      <SignUp routing="path" path="/register" signInUrl="/login" fallbackRedirectUrl="/onboarding" forceRedirectUrl="/onboarding" />
    </div>
  );
}
