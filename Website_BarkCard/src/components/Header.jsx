import { useAuth } from '../hooks/useAuth';

export default function Header({ searchTerm, onSearchChange }) {
  const { user } = useAuth();
  const displayName = user?.name || 'User';

  return (
    <header className="sticky-top navbar navbar-expand-lg bg-white shadow-sm" style={{ zIndex: 40 }}>
      <div className="container-fluid px-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-light border-0">
            <span className="material-symbols-outlined text-muted">search</span>
          </span>
          <input
            className="form-control border-0 bg-light"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search orders, students, or meals..."
            type="text"
            value={searchTerm}
          />
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <button className="btn btn-link position-relative text-muted text-decoration-none">
            <span className="material-symbols-outlined">notifications</span>
            <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle" style={{ width: '8px', height: '8px' }}></span>
          </button>

          <div className="vr"></div>

          <div className="d-flex align-items-center gap-2">
            <div className="text-end">
              <p className="mb-0 small fw-bold">{displayName}</p>
              <p className="mb-0 small text-muted">{user?.role || 'Staff'}</p>
            </div>
            <img alt="User profile avatar" className="rounded-2 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK_oZQC4K7SHsD8zyJu_kK2YFnoE-logfttEVP0CjOcx_hksjJT7C7HFqb3LY7jA4WKnuNbGG1rw_itp9qP_fEbwe8u96G6HWjiapGtrGJFKdCtawgBcuF2swRJyStGCxL_Qx5cfgt1ktOg9k2PUrAsvFSNLidD2gG6gTiQSJZ9kug_i49_3dlazYEQ76CHH-cjR8-9319MXn7swi1msi8m3q5SuNlzWqJDnfW5KUtplmA0N9L4iWf851BqURiAkJOgVEK5ML4BpjW" style={{ width: '40px', height: '40px' }} />
          </div>
        </div>
      </div>
    </header>
  );
}
