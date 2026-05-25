import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

export const AuthPage = () => {
  const { currentUser, login, signup, continueDemo, mode, setMode, isFirebaseReady } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('Avery');
  const [email, setEmail] = useState('demo@nexus.ai');
  const [password, setPassword] = useState('password123');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setStatus(null);
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(180deg,#020617,#111827)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-100">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/75">Access layer</p>
          <h1 className="mt-4 font-display text-5xl text-white">Sign in to the NEXUS control plane</h1>
          <p className="mt-4 text-base text-slate-300">
            Use demo mode for zero-key exploration, or switch to Firebase auth once your project config is ready.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-5">
              <p className="text-sm text-cyan-100">Current auth mode</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm ${
                    mode === 'demo' ? 'bg-cyan-300 text-slate-950' : 'border border-white/10 text-white'
                  }`}
                  onClick={() => setMode('demo')}
                >
                  Demo
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm ${
                    mode === 'firebase' ? 'bg-fuchsia-300 text-slate-950' : 'border border-white/10 text-white'
                  } ${!isFirebaseReady ? 'cursor-not-allowed opacity-60' : ''}`}
                  disabled={!isFirebaseReady}
                  onClick={() => setMode('firebase')}
                >
                  Firebase
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge tone={isFirebaseReady ? 'success' : 'warning'}>
                {isFirebaseReady ? 'Firebase config detected' : 'Firebase placeholders only'}
              </Badge>
              <Badge tone="accent">Hosting-ready MVP</Badge>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_20px_80px_rgba(3,7,18,0.45)]">
          <div className="flex gap-3">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${!isSignup ? 'bg-white text-slate-950' : 'border border-white/10 text-white'}`}
              onClick={() => setIsSignup(false)}
            >
              Login
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${isSignup ? 'bg-white text-slate-950' : 'border border-white/10 text-white'}`}
              onClick={() => setIsSignup(true)}
            >
              Signup
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {isSignup ? (
              <label className="form-field">
                <span>Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
            ) : null}
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <button className="primary-button w-full justify-center" disabled={submitting} type="submit">
              {submitting ? 'Working...' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <button
            type="button"
            className="ghost-button mt-4 w-full justify-center"
            onClick={() => void continueDemo(name, email).then(() => navigate('/dashboard'))}
          >
            Continue in demo mode
          </button>

          <p className="mt-4 text-sm text-slate-400">
            API keys are intentionally not accepted here. Live model credentials should be stored in a backend secret manager or Firebase Functions config.
          </p>
          {status ? <p className="mt-4 text-sm text-fuchsia-200">{status}</p> : null}
        </section>
      </div>
    </div>
  );
};
