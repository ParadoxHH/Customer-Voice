import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { Container } from '../components/Container';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { GradientUnderline } from '../components/GradientUnderline';
import { useAuth } from '../lib/auth';

export default function Register() {
  const { register, pending } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [adminInvite, setAdminInvite] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const result = await register({
      email,
      password,
      display_name: displayName || undefined,
      admin_invite: adminInvite || undefined,
    });

    if (result.success) {
      navigate(result.user.is_admin ? '/admin' : '/app', { replace: true });
      return;
    }

    setError(result.message);
  };

  return (
    <div className="min-h-screen bg-section py-16">
      <Container className="max-w-xl">
        <Card
          icon={<ShieldCheck className="h-6 w-6" aria-hidden />}
          title="Create your Customer Voice account"
          description="Spin up a secure workspace to monitor reviews, collaborate with stakeholders, and stay ahead of emerging themes."
        >
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-heading">
                Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Jordan Lee"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-heading shadow-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-heading">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
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
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-heading shadow-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
              <p className="text-xs text-muted">Use at least eight characters to keep your workspace secure.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="adminInvite" className="text-sm font-medium text-heading">
                Admin invite code <span className="text-xs font-normal text-muted">(optional)</span>
              </label>
              <input
                id="adminInvite"
                type="text"
                value={adminInvite}
                onChange={(event) => setAdminInvite(event.target.value)}
                placeholder="Provided by workspace owner"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-heading shadow-sm focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
            </div>

            {error ? (
              <p className="rounded-2xl border border-ruby/40 bg-ruby/10 px-4 py-3 text-sm text-ruby">{error}</p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={pending}
              startIcon={<UserPlus className="h-4 w-4" aria-hidden />}
            >
              {pending ? 'Setting up your workspace…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Already have access?{' '}
            <Link to="/login" className="font-medium text-heading underline decoration-emerald decoration-2 underline-offset-4">
              Log in
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-muted">
            <GradientUnderline>No invite code?</GradientUnderline> The first person to sign up without a code becomes the administrator.
          </p>
        </Card>
      </Container>
    </div>
  );
}
