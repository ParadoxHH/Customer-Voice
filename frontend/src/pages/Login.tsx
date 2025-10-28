import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { GradientUnderline } from '../components/GradientUnderline';
import { useAuth } from '../lib/auth';

type LocationState = {
  from?: Location;
};

export default function Login() {
  const { login, pending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const result = await login({ email, password });
    if (result.success) {
      const redirectTo = state?.from?.pathname ?? '/app';
      navigate(redirectTo, { replace: true });
      return;
    }

    setError(result.message);
  };

  return (
    <div className="min-h-screen bg-section py-16">
      <Container className="max-w-lg">
        <Card
          icon={<Lock className="h-6 w-6" aria-hidden />}
          title="Log in to Customer Voice"
          description="Access your listening workspace and keep every stakeholder in sync."
        >
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-heading">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-heading shadow-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-heading">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-heading shadow-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
            </div>

            {error ? (
              <p className="rounded-2xl border border-ruby/40 bg-ruby/10 px-4 py-3 text-sm text-ruby">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending} startIcon={<LogIn className="h-4 w-4" aria-hidden />}>
              {pending ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Need an account?{' '}
            <Link to="/register" className="font-medium text-heading underline decoration-emerald decoration-2 underline-offset-4">
              Create one now
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-muted">
            <GradientUnderline>Forgot your password?</GradientUnderline> Contact your workspace administrator to reset access.
          </p>
        </Card>
      </Container>
    </div>
  );
}
