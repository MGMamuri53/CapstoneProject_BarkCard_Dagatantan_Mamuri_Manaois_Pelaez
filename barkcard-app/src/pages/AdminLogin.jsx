export default function AdminLogin() {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed-dim selection:text-on-primary-fixed min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Pattern Element */}
      <div aria-hidden="true" className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"></path>
            </pattern>
          </defs>
          <rect fill="url(#grid)" height="100%" width="100%"></rect>
        </svg>
      </div>

      {/* Decorative Organic Shape */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-tertiary-fixed-dim/20 rounded-full blur-3xl z-0"></div>

      <main className="relative z-10 w-full max-w-[440px]">
        {/* Brand Identity */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-primary to-primary-container rounded-xl mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <h1 className="font-headline font-extrabold text-3xl tracking-tight text-primary mb-2">BarkCard</h1>
          <p className="font-body text-secondary text-sm tracking-wide uppercase font-medium">Academic Dining Administration</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest editorial-shadow rounded-xl p-8 md:p-10">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Admin Portal</h2>
            <p className="font-body text-on-secondary-container text-sm">Please enter your credentials to manage the academic dining ecosystem.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block font-label text-sm font-semibold text-on-surface-variant ml-1" htmlFor="username">Username or Campus Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">person</span>
                </div>
                <input className="block w-full pl-10 pr-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline" id="username" name="username" placeholder="admin.name@university.edu" type="text" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block font-label text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-xs font-medium text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input className="block w-full pl-10 pr-12 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline" id="password" name="password" placeholder="••••••••••••" type="password" />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" type="button">
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center ml-1">
              <input className="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary" id="remember" name="remember" type="checkbox" />
              <label className="ml-2 block text-sm text-on-surface-variant" htmlFor="remember">
                Stay signed in for this session
              </label>
            </div>

            {/* Submit Button */}
            <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
              <span>Login</span>
              <span className="material-symbols-outlined text-xl">login</span>
            </button>
          </form>

          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-surface-container flex items-center justify-center gap-2 text-outline">
            <span className="material-symbols-outlined text-sm">encrypted</span>
            <span className="text-[10px] uppercase tracking-widest font-bold">Secure Academic Gateway</span>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center mt-8 text-on-secondary-container text-sm">
          Need assistance? <a className="font-bold text-primary hover:underline" href="#">Contact IT Support</a>
        </p>

        {/* Illustration (Bottom) */}
        <div className="mt-12 opacity-40">
          <img alt="Academic background" className="w-full h-32 object-cover rounded-xl grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhxZADxiKS-DTKshVCKln9DWMWYzwzDTxEATfWh95NkvlH5VpTy5xUblSnZgdJ_v_49e3iQlEX2m7FUPokgsjMJOarckvyqWk-Op_T_OtzF34mgRHE97m0gsveDgSJu0O7yaaOJGbpyvNio5Chd3ez8w0d3qCjeSGZNggRKIcIht1FqbRML5h7vFcnsHJXCAMbLxh0sE8esOetHGYgnUlK3Ly-Jc2GmTvNCRC9sl6rRqaYNnpEW3yi7s6g7mcYv3QbR4PP6qiNjKk3" />
        </div>
      </main>

      {/* Decorative Text Anchor */}
      <div className="fixed bottom-8 right-8 hidden lg:block select-none pointer-events-none">
        <span className="font-headline text-8xl font-black text-on-surface/[0.03]">BARK</span>
      </div>
    </div>
  );
}
