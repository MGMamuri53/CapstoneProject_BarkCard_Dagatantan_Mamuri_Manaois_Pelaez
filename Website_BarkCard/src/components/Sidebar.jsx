import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    const baseClasses = "nav-link d-flex align-items-center gap-2 rounded-2 transition-all ";
    
    if (isActive) {
      return baseClasses + "bg-primary text-white fw-bold active";
    }
    return baseClasses + "text-dark hover:text-primary";
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="position-fixed start-0 top-0 h-100 bg-light border-end p-4" style={{ width: '256px', zIndex: 50 }}>
      <div className="mb-5">
        <h1 className="text-primary fw-black fs-5 mb-1">BarkCard</h1>
        <p className="small text-muted text-uppercase tracking-widest mb-0">Academic Dining</p>
      </div>

      <nav className="nav flex-column gap-2">
        <Link className={getLinkClasses('/dashboard')} to="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="small">Dashboard</span>
        </Link>
        <Link className={getLinkClasses('/orders')} to="/orders">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="small">Orders</span>
        </Link>
        <Link className={getLinkClasses('/menu')} to="/menu">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="small">Menu</span>
        </Link>
        <Link className={getLinkClasses('/analytics')} to="/analytics">
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="small">Statistics</span>
        </Link>
      </nav>

      <div className="border-top mt-4 pt-3">
        <button className="btn btn-link nav-link d-flex align-items-center gap-2 rounded-2 text-dark text-decoration-none w-100 text-start">
          <span className="material-symbols-outlined">settings</span>
          <span className="small">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="btn btn-link nav-link d-flex align-items-center gap-2 rounded-2 text-dark text-decoration-none w-100 text-start"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="small">Logout</span>
        </button>
      </div>
    </aside>
  );
}
