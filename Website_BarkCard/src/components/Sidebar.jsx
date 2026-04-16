import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform hover:translate-x-1 ";
    
    if (isActive) {
      return baseClasses + "bg-white dark:bg-zinc-900 text-green-800 dark:text-green-400 shadow-sm font-bold";
    }
    return baseClasses + "text-zinc-500 dark:text-zinc-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-zinc-100 dark:bg-zinc-950 flex flex-col p-6 space-y-2">
      <div className="mb-8">
        <h1 className="text-green-900 dark:text-green-500 font-black text-2xl font-headline">BarkCard</h1>
        <p className="font-body text-xs text-zinc-500 uppercase tracking-widest mt-1">Academic Dining</p>
      </div>

      <nav className="flex-1 space-y-2">
        <Link className={getLinkClasses('/dashboard')} to="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-headline text-sm">Dashboard</span>
        </Link>
        <Link className={getLinkClasses('/orders')} to="/orders">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-headline text-sm">Orders</span>
        </Link>
        <Link className={getLinkClasses('/menu')} to="/menu">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-headline text-sm">Menu</span>
        </Link>
        <Link className={getLinkClasses('/analytics')} to="/analytics">
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="font-headline text-sm">Statistics</span>
        </Link>
      </nav>

      <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <button className="flex w-full items-center gap-3 text-zinc-500 dark:text-zinc-400 px-4 py-3 hover:text-green-700 dark:hover:text-green-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 rounded-lg transition-all duration-300 transform hover:translate-x-1">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-headline text-sm">Settings</span>
        </button>
        <Link className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 px-4 py-3 hover:text-green-700 dark:hover:text-green-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 rounded-lg transition-all duration-300 transform hover:translate-x-1" to="/login">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-headline text-sm">Logout</span>
        </Link>
      </div>

      <div className="bg-zinc-200 dark:bg-zinc-800 w-[1px] h-full absolute right-0 top-0"></div>
    </aside>
  );
}
