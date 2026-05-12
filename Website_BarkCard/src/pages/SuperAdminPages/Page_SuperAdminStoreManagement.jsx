import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-toastify';

const generateStoreId = () => {
  return Math.floor(Math.random() * 999999) + 1;
};

const StoreManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    phone: '',
    email: ''
  });
  const [phoneError, setPhoneError] = useState("");
  const [owners, setOwners] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // State variables for the store ID generation
  const [idYear, setIdYear] = useState(new Date().getFullYear().toString());
  const [idNumber, setIdNumber] = useState("");

  // Memoized array of years for the dropdown (from 2022 to the current year)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let arr = [];
    for (let i = 2022; i <= currentYear; i++) arr.push(i.toString());
    return arr;
  }, []);

  // Function to generate a random 9-digit sequence (6-digit timestamp + 3-digit random number)
  const generateRandomSequence = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 899);
    setIdNumber(`${timestamp}${random}`);
  };

  // Brand Colors
  const colors = {
    nuBlue: '#35408f',
    nuGold: '#ffd700',
    textTeal: '#007b8a',
    cardBlue: '#337ab7',
    bgGray: '#f8f9fa'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate('/superadmin');
  };

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_user')
        .select('uv_id, uv_firstname, uv_lastname, uv_email, uv_role')
        .eq('uv_role', 'Owner')
        .order('uv_lastname', { ascending: true });

      if (error) throw error;
      setOwners(data || []);
    } catch (err) {
      console.error('Error fetching owners:', err);
    }
  };

  const handleManagerSelect = (ownerId) => {
    const selectedOwner = owners.find(o => o.uv_id === ownerId);
    if (selectedOwner) {
      setFormData({
        ...formData,
        manager: `${selectedOwner.uv_firstname} ${selectedOwner.uv_lastname}`,
        email: selectedOwner.uv_email
      });
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tbl_canteenstore')
        .select('csv_id, csv_name, csv_location, csv_manager, csv_phone, csv_email, csv_status, csv_createdat')
        .order('csv_name', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStores([]);
        return;
      }

      const formattedStores = data.map(store => ({
        id: store.csv_id,
        name: store.csv_name || '',
        location: store.csv_location || '',
        manager: store.csv_manager || '',
        phone: store.csv_phone || '',
        email: store.csv_email || '',
        status: store.csv_status || 'Active'
      }));

      setStores(formattedStores);
    } catch (err) {
      console.error('Error fetching stores:', err);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.phone && !validatePhoneNumber(formData.phone)) {
        toast.error('Invalid phone number. Must start with 09 and be 11 digits');
        return;
      }

      if (!idYear || !idNumber) {
        toast.error('Please complete the Store ID assignment');
        return;
      }

      const fullStoreId = `${idYear}-${idNumber}`;

      const { data, error } = await supabase
        .from('tbl_canteenstore')
        .insert([
          {
            csv_id: parseInt(fullStoreId.replace('-', '')),
            csv_name: formData.name,
            csv_location: formData.location,
            csv_manager: formData.manager,
            csv_phone: formData.phone,
            csv_email: formData.email,
            csv_status: 'Active'
          }
        ])
        .select();

      if (error) throw error;

      await fetchStores();
      setFormData({ name: '', location: '', manager: '', phone: '', email: '' });
      setIdNumber("");
      setIdYear(new Date().getFullYear().toString());
      setShowAddModal(false);
      toast.success('Store added successfully');
    } catch (err) {
      console.error('Error adding store:', err);
      console.error('Error details:', err.message || err);
      toast.error(`Failed to add store: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditStore = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.phone && !validatePhoneNumber(formData.phone)) {
        toast.error('Invalid phone number. Must start with 09 and be 11 digits');
        return;
      }

      const { error } = await supabase
        .from('tbl_canteenstore')
        .update({
          csv_name: formData.name,
          csv_location: formData.location,
          csv_manager: formData.manager,
          csv_phone: formData.phone,
          csv_email: formData.email
        })
        .eq('csv_id', selectedStore.id);

      if (error) throw error;

      await fetchStores();
      setFormData({ name: '', location: '', manager: '', phone: '', email: '' });
      setShowEditModal(false);
      setSelectedStore(null);
      toast.success('Store updated successfully');
    } catch (err) {
      console.error('Error updating store:', err);
      toast.error('Failed to update store');
    }
  };

  const openDeleteModal = (store) => {
    setStoreToDelete(store);
    setDeleteConfirmName("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;
    
    if (deleteConfirmName !== storeToDelete.name) {
      toast.error('Store name does not match. Please type the exact store name.');
      return;
    }

    try {
      const { error } = await supabase
        .from('tbl_canteenstore')
        .delete()
        .eq('csv_id', storeToDelete.id);

      if (error) throw error;

      await fetchStores();
      setSelectedStore(null);
      setShowDeleteModal(false);
      setStoreToDelete(null);
      setDeleteConfirmName("");
      toast.success('Store deleted successfully');
    } catch (err) {
      console.error('Error deleting store:', err);
      toast.error('Failed to delete store');
    }
  };

  const validatePhoneNumber = (phone) => {
    // Check if starts with 09
    if (!phone.startsWith('09')) {
      setPhoneError('Phone must start with 09');
      return false;
    }
    // Check if exactly 11 digits
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      setPhoneError('Phone must be exactly 11 digits');
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    if (value) {
      validatePhoneNumber(value);
    } else {
      setPhoneError("");
    }
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      location: store.location,
      manager: store.manager,
      phone: store.phone,
      email: store.email
    });
    setShowEditModal(true);
  };

  return (
    <div style={{ backgroundColor: colors.bgGray, minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Top Navbar */}
      <nav className="navbar navbar-dark p-0" style={{ backgroundColor: colors.nuBlue, borderBottom: `4px solid ${colors.nuGold}` }}>
        <div className="container-fluid d-flex justify-content-between align-items-center py-2 px-4">
          <div className="d-flex align-items-center text-white gap-3">
            <button 
              onClick={handleGoBack}
              className="btn btn-sm btn-light text-primary fw-bold"
              style={{ fontSize: '0.9rem' }}
            >
              ← Back
            </button>
            <span className="fw-bold tracking-wider" style={{ fontSize: '1.1rem' }}>Store Management</span>
          </div>
          
          <div className="d-flex align-items-center text-white gap-3">
            <div className="text-end">
              <span className="me-2 d-block">Hi, <span className="fw-bold">{user?.name || 'Admin'}</span></span>
              <span className="small text-white-50">{user?.email || 'superadmin@barkcard.edu'}</span>
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
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <h4 className="mb-1 fw-bold" style={{ color: colors.textTeal }}>Manage Store Locations</h4>
            <p className="text-muted small mb-0">Add, edit, or remove dining facilities across campus</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ name: '', location: '', manager: '', phone: '', email: '' });
              setIdNumber("");
              setIdYear(new Date().getFullYear().toString());
              setShowAddModal(true);
            }}
            className="btn btn-primary fw-bold"
            style={{ backgroundColor: colors.cardBlue, borderColor: colors.cardBlue }}
          >
            + New Store
          </button>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="alert alert-info">
            No stores found. Click "New Store" to add one.
          </div>
        ) : (
          <div className="row g-4">
            {stores.map((store) => (
              <div key={store.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid ${colors.cardBlue}` }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title fw-bold" style={{ color: colors.cardBlue }}>
                        {store.name}
                      </h6>
                      <span className="badge bg-success">
                        {store.status}
                      </span>
                    </div>
                    
                    <div className="small text-muted mb-3">
                      <div className="mb-1"><strong>Location:</strong> {store.location}</div>
                      <div className="mb-1"><strong>Manager:</strong> {store.manager}</div>
                      <div className="mb-1"><strong>Phone:</strong> {store.phone}</div>
                      <div><strong>Email:</strong> {store.email}</div>
                    </div>

                    <div className="d-flex gap-2 mt-3 position-relative">
                      <button
                        onClick={() => openEditModal(store)}
                        className="btn btn-sm btn-outline-primary fw-bold"
                        style={{ flex: 1 }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary fw-bold"
                        style={{ flex: 0, padding: '0.375rem 0.5rem' }}
                        onClick={() => setOpenMenuId(openMenuId === store.id ? null : store.id)}
                        title="More options"
                      >
                        ⋮
                      </button>
                      {openMenuId === store.id && (
                        <div className="position-absolute" style={{ top: '100%', right: '0', zIndex: 1000, minWidth: '150px', marginTop: '4px' }}>
                          <div className="shadow-sm rounded bg-white border" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.15)' }}>
                            <button
                              type="button"
                              onClick={() => {
                                openDeleteModal(store);
                                setOpenMenuId(null);
                              }}
                              className="w-100 text-start px-3 py-2 text-danger fw-bold"
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              🗑️ Delete Store
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header" style={{ backgroundColor: colors.cardBlue, borderBottom: 'none' }}>
                <h5 className="modal-title fw-bold text-white">Add New Store</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => {
                  setShowAddModal(false);
                  setIdNumber("");
                  setIdYear(new Date().getFullYear().toString());
                }}></button>
              </div>
              <form onSubmit={handleAddStore}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold text-uppercase mb-0">Store ID Assignment</label>
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

                  <div className="mb-3">
                    <label className="form-label fw-bold">Store Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., North Campus Dining Hall"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Building A"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Store Manager *</label>
                    <select
                      className="form-select"
                      value={formData.manager}
                      onChange={(e) => handleManagerSelect(e.target.value)}
                      required
                    >
                      <option value="">-- Select Store Manager --</option>
                      {owners.map(owner => (
                        <option key={owner.uv_id} value={owner.uv_id}>
                          {owner.uv_firstname} {owner.uv_lastname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Phone</label>
                    <input
                      type="tel"
                      className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="09XXXXXXXXX"
                    />
                    {phoneError && <div className="invalid-feedback d-block">{phoneError}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email (Auto-populated)</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={formData.email}
                      readOnly
                      placeholder="Auto-populated from manager"
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light px-4">
                  <button type="button" className="btn btn-secondary fw-bold" onClick={() => {
                    setShowAddModal(false);
                    setIdNumber("");
                    setIdYear(new Date().getFullYear().toString());
                  }}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-bold">Add Store</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && selectedStore && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header" style={{ backgroundColor: colors.cardBlue, borderBottom: 'none' }}>
                <h5 className="modal-title fw-bold text-white">Edit Store</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditStore}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Store Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Store Manager</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Phone</label>
                    <input
                      type="tel"
                      className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="09XXXXXXXXX"
                    />
                    {phoneError && <div className="invalid-feedback d-block">{phoneError}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light px-4">
                  <button type="button" className="btn btn-secondary fw-bold" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-bold">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && storeToDelete && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">⚠️ Delete Store - Final Warning</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-danger" role="alert">
                  <strong>This action cannot be undone!</strong>
                  <br/>
                  You are about to permanently delete this store and all associated data.
                </div>
                <p className="mb-3">
                  To confirm deletion, please type the exact store name below:
                </p>
                <div className="mb-3 p-3 bg-light rounded border">
                  <strong style={{ color: colors.cardBlue }}>{storeToDelete.name}</strong>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter store name exactly as shown above"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer bg-light px-4">
                <button type="button" className="btn btn-secondary fw-bold" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger fw-bold" 
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmName !== storeToDelete.name}
                >
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
