import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
    <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/75">404</p>
      <h1 className="mt-4 font-display text-4xl text-white">No blank screens here</h1>
      <p className="mt-4 text-slate-300">
        The route you requested does not exist, but the control plane is intact.
      </p>
      <Link className="primary-button mt-8 justify-center" to="/dashboard">
        Return to dashboard
      </Link>
    </div>
  </div>
);
