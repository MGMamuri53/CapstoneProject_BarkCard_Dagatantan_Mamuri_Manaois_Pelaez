import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,240,209,0.92),_rgba(245,238,226,0.98)_42%,_#e4e8ef_100%)] px-4 py-8 font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed md:px-8 md:py-12">
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,42,76,0.08),transparent_42%),linear-gradient(315deg,rgba(203,160,82,0.14),transparent_34%)]"></div>
      <div aria-hidden="true" className="absolute left-[-8rem] top-[-7rem] h-72 w-72 rounded-full bg-primary/12 blur-3xl"></div>
      <div aria-hidden="true" className="absolute bottom-[-9rem] right-[-6rem] h-80 w-80 rounded-full bg-secondary-container/60 blur-3xl"></div>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-white/55 bg-surface-container-lowest/88 shadow-[0_28px_90px_-36px_rgba(29,44,70,0.5)] backdrop-blur md:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f4d36f_0%,#efc65a_100%)] px-8 py-10 text-primary md:px-14 md:py-14">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),transparent_38%),linear-gradient(145deg,transparent_55%,rgba(255,255,255,0.12)_100%)]"></div>
            <div aria-hidden="true" className="absolute -left-16 bottom-[-5.5rem] h-56 w-56 rounded-full border border-white/30"></div>
            <div aria-hidden="true" className="absolute right-[-3rem] top-10 h-36 w-36 rounded-full bg-white/12 blur-2xl"></div>

            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <div className="mt-10 max-w-md space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">BarkCard Admin</p>
                  <h1 className="font-headline text-4xl font-extrabold leading-tight md:text-5xl">Welcome back to the campus dining portal.</h1>
                  <p className="max-w-sm text-base leading-7 text-primary/72 md:text-lg">
                    Manage menus, orders, and analytics from one clear dashboard built for day-to-day campus operations.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-primary/10 bg-white/28 p-5 backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/60">Fast access</p>
                  <p className="mt-3 text-lg font-semibold text-primary">Sign in once and move straight into service monitoring.</p>
                </div>
                <div className="rounded-[24px] border border-primary/10 bg-primary/90 p-5 text-primary-fixed">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-fixed/70">Operations</p>
                  <p className="mt-3 text-lg font-semibold text-white">Built for administrators handling active food service workflows.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest px-6 py-8 md:px-12 md:py-14">
            <div className="mx-auto flex h-full max-w-md flex-col justify-center">
              <div className="mb-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Secure access</p>
                  <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface">Sign in</h2>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="username">Username or campus email</label>
                  <div className="group relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">person</span>
                    <input
                      className="block w-full rounded-2xl border border-outline-variant/60 bg-[#fbf8f2] py-3.5 pl-12 pr-4 text-on-surface outline-none transition duration-200 placeholder:text-outline focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      id="username"
                      name="username"
                      placeholder="admin@barkcard.edu"
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                    <a className="text-sm font-semibold text-secondary transition-colors hover:text-primary" href="#">Forgot password?</a>
                  </div>
                  <div className="group relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">lock</span>
                    <input
                      className="block w-full rounded-2xl border border-outline-variant/60 bg-[#fbf8f2] py-3.5 pl-12 pr-12 text-on-surface outline-none transition duration-200 placeholder:text-outline focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1 text-sm text-on-surface-variant">
                  <label className="flex items-center gap-3">
                    <input className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" id="remember" name="remember" type="checkbox" />
                    <span>Keep me signed in</span>
                  </label>
                  <span className="rounded-full bg-secondary-container px-3 py-1 font-medium text-secondary">Admin only</span>
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#17315b_0%,#22436f_100%)] px-4 py-3.5 font-headline text-base font-bold text-white shadow-[0_18px_28px_-18px_rgba(23,49,91,0.75)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_34px_-18px_rgba(23,49,91,0.85)] active:translate-y-0" type="submit">
                  <span>Login to Dashboard</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </form>

              <div className="mt-8 grid gap-3 text-sm text-secondary sm:grid-cols-2">
                <a className="rounded-2xl border border-outline-variant/50 bg-[#fbf8f2] px-4 py-3 font-medium transition-colors hover:border-primary/40 hover:text-primary" href="#">Request account access</a>
                <a className="rounded-2xl border border-outline-variant/50 bg-[#fbf8f2] px-4 py-3 font-medium transition-colors hover:border-primary/40 hover:text-primary" href="#">Need help signing in?</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
