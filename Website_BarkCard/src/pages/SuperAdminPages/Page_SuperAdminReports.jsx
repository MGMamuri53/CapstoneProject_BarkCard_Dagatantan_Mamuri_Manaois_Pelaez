import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Page_SuperAdminReports = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Matching Brand Colors from your reference
  const colors = {
    nuBlue: '#35408f',
    nuGold: '#ffd700',
    textTeal: '#007b8a',
    cardBlue: '#337ab7',
    bgGray: '#f8f9fa'
  };

  // Report Categories based on your Superadmin requirements
  const reportItems = [
    { 
      title: 'Sales Ledger', 
      desc: 'View and export detailed transaction history from all stores.', 
      path: '/superadmin/reports/sales' 
    },
    { 
      title: 'Store Earnings', 
      desc: 'Analyze financial performance and payouts for canteen vendors.', 
      path: '/superadmin/reports/earnings' 
    },
    { 
      title: 'Wallet Analytics', 
      desc: 'Monitor student balance distributions and top-up history.', 
      path: '/superadmin/reports/wallet' 
    },
    { 
      title: 'System Audit', 
      desc: 'Access administrative logs and track system-wide activity.', 
      path: '/superadmin/reports/logs' 
    },
    { 
        title: 'Product Volume', 
        desc: 'Review top-selling items and inventory movement campus-wide.', 
        path: '/superadmin/reports/products' 
    }
  ];

  return (
    <div style={{ backgroundColor: colors.bgGray, minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Top Navbar - Identical to Home */}
      <nav className="navbar navbar-dark p-0" style={{ backgroundColor: colors.nuBlue, borderBottom: `4px solid ${colors.nuGold}` }}>
        <div className="container-fluid d-flex justify-content-between align-items-center py-2 px-4">
          <div className="d-flex align-items-center text-white gap-3">
            <button 
              onClick={() => navigate('/superadmin')}
              className="btn btn-sm btn-light"
              title="Back to Dashboard"
            >
              ← Back
            </button>
            <span className="fw-bold tracking-wider" style={{ fontSize: '1.1rem' }}>BarkCard Admin</span>
          </div>
          
          <div className="d-flex align-items-center text-white gap-3">
            <div className="text-end">
              <span className="me-2 d-block">Hi, <span className="fw-bold text-capitalize">{user?.name || 'Admin'}</span></span>
              <span className="small text-white-50">{user?.email || 'barkcard.admin@outlook.com'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-sm btn-light text-danger fw-bold"
              style={{ fontSize: '0.8rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-5 pt-4">
        {/* Welcome Message */}
        <h4 className="fw-bold mb-5" style={{ color: colors.textTeal }}>
          Reports Control Center
        </h4>

        {/* Reports Breadcrumb & Search */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-5">
          <div className="d-flex align-items-center">
            <div className="p-2 rounded me-3" style={{ backgroundColor: colors.nuBlue, color: 'white' }}>
              <i className="bi bi-file-earmark-bar-graph-fill" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <div className="d-flex flex-column">
                <h5 className="mb-0 fw-bold text-secondary">Reports</h5>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Home / Reports</small>
            </div>
          </div>

          <div className="position-relative" style={{ width: '250px' }}>
            <span className="position-absolute translate-middle-y top-50 start-0 ps-2" style={{ color: colors.cardBlue }}>
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control form-control-sm ps-4" 
              placeholder="Search reports.." 
              style={{ borderRadius: '0', border: '1px solid #ced4da' }}
            />
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="row g-4">
          {reportItems.map((item, index) => (
            <div key={index} className="col-12 col-md-4 col-lg-3">
              <div 
                className="card h-100 border-0 shadow-sm" 
                style={{ 
                  borderRadius: '2px', 
                  borderLeft: `4px solid ${colors.cardBlue}`, 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease' 
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-folder-fill me-2" style={{ color: colors.cardBlue }}></i>
                    <h6 className="card-title mb-0" style={{ color: colors.cardBlue, fontWeight: '600' }}>
                      {item.title}
                    </h6>
                  </div>
                  <p className="card-text text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page_SuperAdminReports;