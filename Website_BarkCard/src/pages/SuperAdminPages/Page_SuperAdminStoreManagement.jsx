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
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    phone: '',
    email: ''
  });

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
  }, []);

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

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        const { error } = await supabase
          .from('tbl_canteenstore')
          .delete()
          .eq('csv_id', storeId);

        if (error) throw error;

        await fetchStores();
        setSelectedStore(null);
        toast.success('Store deleted successfully');
      } catch (err) {
        console.error('Error deleting store:', err);
        toast.error('Failed to delete store');
      }
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

                    <div className="d-flex gap-2 mt-3">
                      <button
                        onClick={() => openEditModal(store)}
                        className="btn btn-sm btn-outline-primary fw-bold"
                        style={{ flex: 1 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="btn btn-sm btn-outline-danger fw-bold"
                        style={{ flex: 1 }}
                      >
                        Delete
                      </button>
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
                    <label className="form-label fw-bold">Store Manager</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="Manager name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="store@barkcard.edu"
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
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
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
    </div>
  );
};

export default StoreManagement;
