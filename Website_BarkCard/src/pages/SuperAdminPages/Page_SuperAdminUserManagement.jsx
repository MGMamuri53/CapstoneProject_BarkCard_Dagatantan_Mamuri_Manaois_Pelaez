import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 
import { toast } from "react-toastify";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../hooks/useAuth";

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

    body { background-color: var(--light-bg); color: var(--dark-text); padding: 1rem; }

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

const ADMIN_EMAIL = "barkcard.adm1n@gmail.com";

export default function AdminPage_UserManagement() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filterRole, setFilterRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showRegModal, setShowRegModal] = useState(false);

  // Registration Form State
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [idYear, setIdYear] = useState(new Date().getFullYear().toString());
  const [idNumber, setIdNumber] = useState("");
  const [regForm, setRegForm] = useState({
    uv_lastname: "",
    uv_firstname: "",
    uv_middlename: "",
    uv_email: "",
    uv_role: "Student"
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let arr = [];
    for (let i = 2022; i <= currentYear; i++) arr.push(i.toString());
    return arr;
  }, []);

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);

  useEffect(() => {
    if (user && user.role !== 'SuperAdmin') {
      toast.error('Access Denied: SuperAdmin access only');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'SuperAdmin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from tbl_user
      const { data: usersData, error: usersError } = await supabase
        .from('tbl_user')
        .select('uv_id, uv_lastname, uv_firstname, uv_middlename, uv_email, uv_role')
        .order('uv_lastname', { ascending: true });

      if (usersError) throw usersError;

      if (!usersData || usersData.length === 0) {
        console.log('No users found in database');
        setUsers([]);
        return;
      }

      console.log(`Fetched ${usersData.length} users from database`);

      // Fetch all user balances
      const { data: balanceData, error: balanceError } = await supabase
        .from('tbl_userbalance')
        .select('uv_id, ubv_nfcid, ubv_amount');

      if (balanceError) {
        console.warn('Error fetching balances, continuing without balance data:', balanceError);
      }

      // Create a map of user IDs to balance info for quick lookup
      const balanceMap = {};
      if (balanceData) {
        balanceData.forEach(b => {
          balanceMap[b.uv_id] = { nfcId: b.ubv_nfcid, amount: b.ubv_amount };
        });
      }

      // Transform and merge user and balance data
      const transformedUsers = usersData.map(u => ({
        id: u.uv_id,
        lastName: u.uv_lastname || '',
        firstName: u.uv_firstname || '',
        middleName: u.uv_middlename || '',
        email: u.uv_email || '',
        role: u.uv_role || 'Student',
        nfcId: balanceMap[u.uv_id]?.nfcId || "Unlinked",
        balance: balanceMap[u.uv_id]?.amount || 0
      }));

      console.log(`Transformed ${transformedUsers.length} users with balance information`);
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const generateRandomSequence = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 899);
    setIdNumber(`${timestamp}${random}`);
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    try {
      const fullUserId = `${idYear}-${idNumber}`;

      const finalData = {
        uv_id: fullUserId,
        ...regForm,
        uv_middlename: noMiddleName ? "" : regForm.uv_middlename
      };

      const { error: userErr } = await supabase.from('tbl_user').insert([finalData]);
      if (userErr) throw userErr;

      const { error: balErr } = await supabase.from('tbl_userbalance').insert([{
        uv_id: fullUserId,
        ubv_amount: 0,
        ubv_nfcid: null
      }]);
      if (balErr) throw balErr;

      setShowRegModal(false);
      toast.success("Successfully Created : New User");
      
      setIdNumber("");
      setNoMiddleName(false);
      setRegForm({ uv_lastname: "", uv_firstname: "", uv_middlename: "", uv_email: "", uv_role: "Student" });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };

  const handleAdjustBalance = async () => {
    const amount = parseFloat(depositAmount);
    if (!selectedUser || isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const newBalance = selectedUser.balance + amount;
      const { error } = await supabase
        .from('tbl_userbalance')
        .update({ ubv_amount: newBalance })
        .eq('uv_id', selectedUserId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === selectedUserId ? { ...u, balance: newBalance } : u));
      toast.success(`Balance updated to ${money(newBalance)}`);
      setShowDepositModal(false);
      setDepositAmount("");
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      toast.error('Failed to update balance');
    }
  };

  const handleEditProfile = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase
        .from('tbl_user')
        .update({
          uv_lastname: editForm.lastName,
          uv_firstname: editForm.firstName,
          uv_middlename: editForm.middleName,
          uv_email: editForm.email,
          uv_role: editForm.role 
        })
        .eq('uv_id', selectedUserId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === selectedUserId ? { ...u, ...editForm } : u));
      toast.success('Profile updated successfully');
      setShowEditModal(false);
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = filterRole ? u.role === filterRole : true;
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                            u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.nfcId && u.nfcId.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchQuery]);

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
    <div className="container-fluid">
      <GlobalStyles />
      <div className="window">
        <div className="titlebar">
          <span>🛡️</span>
          <span>SuperAdmin: User & Balance Control</span>
          <div className="ms-auto d-flex align-items-center gap-3">
             <span className="small d-none d-md-inline opacity-75">{ADMIN_EMAIL}</span>
             <button onClick={handleLogout} className="btn btn-sm btn-outline-light border-0">Logout</button>
          </div>
        </div>

        <div className="p-4">
          <div className="filter-section">
            <h3 className="h6 fw-bold mb-3" style={{color: 'var(--primary-color)'}}>🔎 SEARCH DIRECTORY</h3>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="small fw-bold text-muted mb-1 text-uppercase">User Role</label>
                <select className="form-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="xbtn w-100 fw-bold" onClick={() => {setFilterRole(""); setSearchQuery("");}}>CLEAR</button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading users...
            </div>
          ) : (
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
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-5 text-muted">No records found.</td></tr>
                      ) : (
                        filteredUsers.map((u) => (
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="d-flex flex-column gap-2 mt-3 mt-lg-0">
                  <p className="small fw-bold text-uppercase text-muted mb-1" style={{fontSize: '0.7rem'}}>Operations</p>
                  <button className="xbtn xbtn-primary text-start" onClick={() => setShowRegModal(true)}>👤 New Registration</button>
                  <button className="xbtn text-start" disabled={!selectedUser} onClick={() => toast.info("NFC assignment coming soon")}>💳 Assign NFC ID</button>
                  <button className="xbtn text-start" disabled={!selectedUser} onClick={() => {
                    setShowDepositModal(true);
                    setDepositAmount("");
                  }}>💵 Adjust Balance</button>
                  <button className="xbtn text-start" disabled={!selectedUser} onClick={() => {
                    setEditForm({
                      firstName: selectedUser.firstName,
                      lastName: selectedUser.lastName,
                      middleName: selectedUser.middleName,
                      email: selectedUser.email,
                      role: selectedUser.role
                    });
                    setShowEditModal(true);
                  }}>✏️ Edit Profile</button>
                  
                  <hr className="my-2" style={{opacity: 0.1}}/>
                  
                  {selectedUser && (
                     <div className="p-3 rounded border bg-light shadow-sm">
                        <h6 className="mb-2 fw-bold text-primary" style={{fontSize: '0.85rem'}}>Selected Record</h6>
                        <div className="small"><strong>Name:</strong> {selectedUser.firstName}</div>
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
          )}
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
              <form onSubmit={handleRegisterUser}>
                <div className="modal-body p-4">
                  {/* USER ID SECTION RESTRUCTURED */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold text-uppercase mb-0">User ID Assignment</label>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary fw-bold" 
                        onClick={generateRandomSequence}
                        style={{ fontSize: '0.75rem' }}
                      >
                        🎲 Random
                      </button>
                    </div>
                    <div className="input-group">
                      <select 
                        className="form-select fw-bold" 
                        style={{ maxWidth: '110px' }} 
                        value={idYear} 
                        onChange={(e) => setIdYear(e.target.value)}
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <span className="input-group-text fw-bold">-</span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Sequence" 
                        required 
                        value={idNumber} 
                        onChange={(e) => setIdNumber(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase">First Name</label>
                      <input type="text" className="form-control" required value={regForm.uv_firstname} onChange={(e) => setRegForm({...regForm, uv_firstname: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase">Last Name</label>
                      <input type="text" className="form-control" required value={regForm.uv_lastname} onChange={(e) => setRegForm({...regForm, uv_lastname: e.target.value})} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-bold text-uppercase mb-0">Middle Name</label>
                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="noMiddleName" 
                                checked={noMiddleName} 
                                onChange={(e) => {
                                    setNoMiddleName(e.target.checked);
                                    if(e.target.checked) setRegForm({...regForm, uv_middlename: ""});
                                }}
                            />
                            <label className="form-check-label small text-muted" htmlFor="noMiddleName">NONE</label>
                        </div>
                    </div>
                    <input 
                        type="text" 
                        className="form-control" 
                        required={!noMiddleName} 
                        disabled={noMiddleName}
                        placeholder={noMiddleName ? "" : "Middle Initial or Name"}
                        value={regForm.uv_middlename} 
                        onChange={(e) => setRegForm({...regForm, uv_middlename: e.target.value})} 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase">Email</label>
                    <input type="email" className="form-control" required value={regForm.uv_email} onChange={(e) => setRegForm({...regForm, uv_email: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase">Role</label>
                    <select className="form-select" value={regForm.uv_role} onChange={(e) => setRegForm({...regForm, uv_role: e.target.value})}>
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

      {/* ADJUST BALANCE MODAL */}
      {showDepositModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">💵 Adjust Balance</h5>
                <button type="button" className="btn-close" onClick={() => setShowDepositModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small text-muted mb-2">User: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong></p>
                <p className="small text-muted mb-3">Current: <strong>{money(selectedUser?.balance || 0)}</strong></p>
                <div className="input-group mb-3">
                  <span className="input-group-text">₱</span>
                  <input 
                    type="number" 
                    className="form-control form-control-lg" 
                    placeholder="Example: 100 or -50"
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary fw-bold" onClick={() => setShowDepositModal(false)}>CANCEL</button>
                <button type="button" className="btn btn-primary fw-bold" onClick={handleAdjustBalance}>CONFIRM</button>
              </div>
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
                  <input type="text" className="form-control" value={editForm.firstName || ''} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">Last Name</label>
                  <input type="text" className="form-control" value={editForm.lastName || ''} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">Middle Name</label>
                  <input type="text" className="form-control" value={editForm.middleName || ''} onChange={(e) => setEditForm({...editForm, middleName: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-uppercase">Email</label>
                  <input type="email" className="form-control" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                </div>
                
                <hr className="my-4" />
                
                <div className="p-3 rounded border bg-light">
                  <label className="form-label small fw-bold text-danger text-uppercase">⚠️ Account Status</label>
                  <select 
                    className={`form-select ${editForm.role === 'Hold' ? 'border-danger text-danger' : ''}`}
                    value={editForm.role || ''} 
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
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
                <button type="button" className="btn btn-primary fw-bold" onClick={handleEditProfile}>SAVE CHANGES</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}