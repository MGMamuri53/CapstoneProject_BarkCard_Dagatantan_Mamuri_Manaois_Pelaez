import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

// --- Custom Styled Component Styles ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --primary-color: #2563eb;
      --secondary-color: #1e40af;
      --light-bg: #f8f9fa;
      --dark-text: #212529;
      --border: rgba(0,0,0,0.1);
      --shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    body { background-color: var(--light-bg); color: var(--dark-text); margin: 0; padding: 0; }

    .window {
      background: white;
      border-radius: 10px;
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .titlebar {
      background: linear-gradient(135deg, #2563eb, #1e40af, #1e3a8a);
      color: white;
      padding: 1rem 1.5rem;
      font-weight: 600;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-section {
      background-color: rgba(37, 99, 235, 0.05);
      border-radius: 8px;
      padding: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .xbtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: #fff;
      color: #111827;
      cursor: pointer;
      transition: all .15s ease;
      text-decoration: none;
    }
    .xbtn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,.1); background: #f9fafb; }
    .xbtn-primary { background-color: var(--primary-color); border-color: var(--primary-color); color: #fff; }
    .xbtn-primary:hover { background-color: var(--secondary-color); color: #fff; }

    .custom-table th {
      background-color: rgba(37, 99, 235, 0.1);
      color: var(--primary-color);
      border-bottom: 2px solid rgba(37, 99, 235, 0.2);
      font-size: 0.85rem;
      text-transform: uppercase;
    }

    .role-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 50px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .role-student { background: #dcfce7; color: #166534; }
    .role-staff { background: #fef08a; color: #854d0e; }
    .role-owner { background: #dbeafe; color: #1e40af; }
    .role-superadmin { background: #f3f4f6; color: #111827; }
    .role-hold { background: #fee2e2; color: #991b1b; }
  `}</style>
);

const money = (n) => `₱${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminPage_UserManagement_Design() {
  // UI Toggles (Kept only so you can view the modals in the design)
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);

  // Brand Colors
  const colors = {
    nuBlue: '#35408f',
    nuGold: '#ffd700',
    textTeal: '#007b8a',
    cardBlue: '#337ab7',
    bgGray: '#f8f9fa'
  };

  // Static Mock Data for UI Rendering
  const mockUsers = [
    { id: "2024-123456", lastName: "Dela Cruz", firstName: "Juan", middleName: "M", email: "2024123456@outlook.com", role: "Student", nfcId: "A1:B2:C3:D4", balance: 1500.00 },
    { id: "2023-987654", lastName: "Rizal", firstName: "Jose", middleName: "P", email: "2023987654@outlook.com", role: "Staff", nfcId: "Unlinked", balance: 0.00 },
    { id: "2022-112233", lastName: "Admin", firstName: "Super", middleName: "", email: "admin@barkcard.edu", role: "SuperAdmin", nfcId: "FF:EE:DD:CC", balance: 9999.50 },
    { id: "2024-555666", lastName: "Doe", firstName: "Jane", middleName: "A", email: "2024555666@outlook.com", role: "Hold", nfcId: "Unlinked", balance: -50.00 },
  ];

  const selectedUser = mockUsers.find(u => u.id === selectedUserId);

  const getRoleClass = (role) => {
    switch(role) {
        case 'Student': return 'role-student';
        case 'Staff': return 'role-staff';
        case 'Owner': return 'role-owner';
        case 'SuperAdmin': return 'role-superadmin';
        case 'Hold': return 'role-hold';
        default: return '';
    }
  };

  return (
    <div style={{ backgroundColor: colors.bgGray, minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <GlobalStyles />
      
      {/* Top Navbar */}
      <nav className="navbar navbar-dark p-0" style={{ backgroundColor: colors.nuBlue, borderBottom: `4px solid ${colors.nuGold}` }}>
        <div className="container-fluid d-flex justify-content-between align-items-center py-2 px-4">
          <div className="d-flex align-items-center text-white gap-3">
            <button className="btn btn-sm btn-light" title="Back to Dashboard">
              ← Back
            </button>
            <span className="fw-bold tracking-wider" style={{ fontSize: '1.1rem' }}>BarkCard Admin</span>
          </div>
          
          <div className="d-flex align-items-center text-white gap-3">
            <div className="text-end">
              <span className="me-2 d-block">Hi, <span className="fw-bold">Admin</span></span>
              <span className="small text-white-50">superadmin@barkcard.edu</span>
            </div>
            <button className="btn btn-sm btn-light text-danger fw-bold" style={{ fontSize: '0.8rem' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-5 pt-4">
        {/* Page Title */}
        <h4 className="fw-bold mb-5" style={{ color: colors.textTeal }}>
          User & Balance Management
        </h4>

        {/* Page Breadcrumb */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-5">
          <div className="d-flex align-items-center">
            <div className="p-2 rounded me-3" style={{ backgroundColor: colors.nuBlue, color: 'white' }}>
              <i className="bi bi-people-fill" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h5 className="mb-0 fw-bold text-secondary">Users</h5>
          </div>
        </div>

        <div>
          <div className="filter-section">
            <h3 className="h6 fw-bold mb-3" style={{color: 'var(--primary-color)'}}>🔎 SEARCH DIRECTORY</h3>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1 text-uppercase">User Role</label>
                <select className="form-select">
                  <option value="">All Roles</option>
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Owner">Owner</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Hold">On Hold</option>
                </select>
              </div>
              <div className="col-md-7">
                <label className="small fw-bold text-muted mb-1 text-uppercase">Search Identifier (Name, ID, or NFC ID)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Query user records..." 
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="xbtn w-100 fw-bold">CLEAR</button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-9">
              <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0 custom-table">
                  <thead>
                    <tr>
                      <th style={{width: '45px'}}></th>
                      <th>User Info</th>
                      <th>NFC Mapping</th>
                      <th>Role</th>
                      <th className="text-end">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr 
                        key={u.id} 
                        onClick={() => setSelectedUserId(u.id)}
                        style={{ cursor: "pointer", background: u.id === selectedUserId ? "rgba(37,99,235,0.05)" : "transparent"}}
                      >
                        <td><input type="radio" checked={u.id === selectedUserId} readOnly className="form-check-input" /></td>
                        <td>
                          <div className="fw-bold">{u.lastName}, {u.firstName} {u.middleName}</div>
                          <div className="small text-muted">{u.id} • {u.email}</div>
                        </td>
                        <td className="font-monospace small text-primary">{u.nfcId}</td>
                        <td>
                          <span className={`role-badge ${getRoleClass(u.role)}`}>
                            {u.role === 'Hold' ? '⏹️ HOLD' : u.role}
                          </span>
                        </td>
                        <td className="text-end fw-bold" style={{color: u.balance > 0 ? '#166534' : '#991b1b'}}>
                          {money(u.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="d-flex flex-column gap-2 mt-3 mt-lg-0">
                <p className="small fw-bold text-uppercase text-muted mb-1" style={{fontSize: '0.7rem'}}>Operations</p>
                <button className="xbtn xbtn-primary text-start" onClick={() => setShowRegModal(true)}>👤 New Registration</button>
                <button className="xbtn text-start" disabled={!selectedUser}>💳 Assign NFC ID</button>
                <button className="xbtn text-start" disabled={!selectedUser} onClick={() => setShowEditModal(true)}>✏️ Edit Profile</button>
                
                <hr className="my-2" style={{opacity: 0.1}}/>
                
                {selectedUser && (
                    <div className="p-3 rounded border bg-light shadow-sm">
                      <h6 className="mb-2 fw-bold text-primary" style={{fontSize: '0.85rem'}}>Selected Record</h6>
                      <div className="small"><strong>Name:</strong> {selectedUser.lastName}, {selectedUser.firstName}</div>
                      <div className="small"><strong>ID:</strong> {selectedUser.id}</div>
                      <div className="small mt-2">
                        <span className={`badge ${selectedUser.role === 'Hold' ? 'bg-danger' : 'bg-success'}`}>
                          {selectedUser.role === 'Hold' ? 'Account Hold' : 'Active Sync'}
                        </span>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">👤 Register New User</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRegModal(false)}></button>
              </div>
              <form>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold text-uppercase mb-0">User ID Assignment</label>
                      <button type="button" className="btn btn-sm btn-outline-primary fw-bold" style={{ fontSize: '0.75rem' }}>
                        🎲 Random
                      </button>
                    </div>
                    <div className="input-group">
                      <select className="form-select fw-bold" style={{ maxWidth: '110px' }} defaultValue="2024">
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                      </select>
                      <span className="input-group-text fw-bold">-</span>
                      <input type="text" className="form-control" placeholder="Sequence" required />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase">First Name</label>
                      <input type="text" className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase">Last Name</label>
                      <input type="text" className="form-control" required />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-bold text-uppercase mb-0">Middle Name</label>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="noMiddleName" />
                            <label className="form-check-label small text-muted" htmlFor="noMiddleName">NONE</label>
                        </div>
                    </div>
                    <input type="text" className="form-control" placeholder="Middle Initial or Name" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase">Email (Auto-generated)</label>
                    <div className="input-group">
                      <input type="email" className="form-control bg-light" readOnly placeholder="Email will be auto-generated from student ID" />
                      <span className="input-group-text small text-muted">@outlook.com</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase">Role</label>
                    <select className="form-select" defaultValue="Student">
                      <option value="Student">Student</option>
                      <option value="Staff">Staff</option>
                      <option value="Owner">Owner</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light px-4">
                  <button type="button" className="btn btn-secondary fw-bold" onClick={() => setShowRegModal(false)}>CANCEL</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">CREATE USER</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">✏️ Edit Profile & Status</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">First Name</label>
                  <input type="text" className="form-control" defaultValue={selectedUser?.firstName} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">Last Name</label>
                  <input type="text" className="form-control" defaultValue={selectedUser?.lastName} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">Middle Name</label>
                  <input type="text" className="form-control" defaultValue={selectedUser?.middleName} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">Email</label>
                  <input type="email" className="form-control" defaultValue={selectedUser?.email} />
                </div>
                
                <hr className="my-4" />
                
                <div className="p-3 rounded border bg-light">
                  <label className="form-label small fw-bold text-danger text-uppercase">⚠️ Account Status</label>
                  <select className={`form-select ${selectedUser?.role === 'Hold' ? 'border-danger text-danger' : ''}`} defaultValue={selectedUser?.role}>
                    <option value="Student">Student (Active)</option>
                    <option value="Staff">Staff (Active)</option>
                    <option value="Owner">Owner (Active)</option>
                    <option value="SuperAdmin">SuperAdmin (Active)</option>
                    <option value="Hold">HOLD / DEACTIVATED</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer bg-light px-4">
                <button type="button" className="btn btn-secondary fw-bold" onClick={() => setShowEditModal(false)}>CANCEL</button>
                <button type="button" className="btn btn-primary fw-bold">SAVE CHANGES</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}