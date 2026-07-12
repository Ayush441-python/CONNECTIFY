import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// -------------------------------------------------------------
// The new GoogleAuthButton component for Register page
// -------------------------------------------------------------
function dashboardPathForRole(role?: string) {
  if (role === 'BRAND') return '/brand';
  if (role === 'INFLUENCER') return '/influencer';
  if (role === 'ADMIN') return '/admin';
  return '/';
}

interface Props {
  role?: 'BRAND' | 'INFLUENCER';
}

export default function GoogleAuthButton({ role }: Props) {
  const { googleAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        if (!credentialResponse.credential) {
          toast.error('Google sign-in did not return a credential');
          return;
        }
        try {
          const result = await googleAuth(credentialResponse.credential);
          if ('isNewUser' in result && result.isNewUser) {
            navigate('/auth/google/finish', { state: { ...result, role } });
            return;
          }
          toast.success('Welcome back!');
          const user = result as any;
          navigate(dashboardPathForRole(user.role), { replace: true });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
        }
      }}
      onError={() => toast.error('Google sign-in failed')}
      shape="pill"
      width="200"
    />
  );
}

// -------------------------------------------------------------
// The original GoogleButton component for Login page
// -------------------------------------------------------------
interface GoogleButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: any) => void;
}

export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  return (
    <div className="flex justify-center w-full my-4">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            onSuccess(credentialResponse.credential);
          }
        }}
        onError={() => {
          if (onError) onError(new Error('Google Login Failed'));
        }}
        theme="outline"
        size="large"
        text="continue_with"
        width="100%"
      />
    </div>
  );
}