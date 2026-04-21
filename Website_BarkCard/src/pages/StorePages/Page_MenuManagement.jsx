import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const categoryOptions = ['All Categories', 'Main Course', 'Beverages'];

const defaultFormData = {
  SPv_Name: '',
  SPv_Description: '',
  SPv_Category: 'Main Course',
  SPv_Price: '',
  SPv_Quantity: '',
  SPv_IMG: ''
};

const getStockMeta = (stock) => {
  if (stock === 0) {
    return {
      status: 'Out of Stock',
      statusClass: 'bg-error-container text-error border border-error/20',
      stockTextClass: 'text-error',
      barClass: 'bg-error',
      imageClass: 'grayscale',
      nameClass: 'opacity-60'
    };
  }

  if (stock <= 10) {
    return {
      status: 'Low Stock',
      statusClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      stockTextClass: 'text-on-surface',
      barClass: 'bg-amber-500',
      imageClass: '',
      nameClass: ''
    };
  }

  return {
    status: 'Available',
    statusClass: 'bg-tertiary-container/10 text-tertiary border border-tertiary/20',
    stockTextClass: 'text-on-surface',
    barClass: 'bg-primary',
    imageClass: '',
    nameClass: ''
  };
};

const getStockBarWidth = (stock) => `${Math.min(100, Math.max(0, Math.round((stock / 50) * 100)))}%`;

const formatPrice = (price) => `₱${Number(price).toFixed(2)}`;

export default function MenuManagement({ menuItems, setMenuItems }) {
  const { globalSearchTerm = '' } = useOutletContext() ?? {};
  const defaultPreview = 'https://via.placeholder.com/300x200?text=Upload+or+Enter+URL';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemPendingDelete, setItemPendingDelete] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [imagePreview, setImagePreview] = useState(defaultPreview);
  const [, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const filteredItems = menuItems.filter((item) => {
    const categoryMatch = activeCategory === 'All Categories' || item.SPv_Category === activeCategory;
    const normalizedLocalQuery = searchTerm.trim().toLowerCase();
    const normalizedGlobalQuery = globalSearchTerm.trim().toLowerCase();
    const searchTarget = `${item.SPv_Name} ${item.SPv_Description} ${item.SPv_Category}`.toLowerCase();
    const localMatch =
      normalizedLocalQuery.length === 0 ||
      searchTarget.includes(normalizedLocalQuery);
    const globalMatch =
      normalizedGlobalQuery.length === 0 ||
      searchTarget.includes(normalizedGlobalQuery);

    return categoryMatch && localMatch && globalMatch;
  });

  const totalItems = menuItems.length;
  const lowInventoryCount = menuItems.filter((item) => item.SPv_Quantity > 0 && item.SPv_Quantity <= 10).length;
  const outOfStockCount = menuItems.filter((item) => item.SPv_Quantity === 0).length;

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItemId(null);
    setFormData(defaultFormData);
    setImageFile(null);
    setImagePreview(defaultPreview);
  };

  const openAddModal = () => {
    setEditingItemId(null);
    setFormData(defaultFormData);
    setImageFile(null);
    setImagePreview(defaultPreview);
    setIsModalOpen(true);
  };

  const updatePreviewFromUrl = (url) => {
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(defaultPreview);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'SPv_IMG') {
      setImageFile(null);
      updatePreviewFromUrl(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setFormData(prev => ({
      ...prev,
      SPv_IMG: ''
    }));

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleResetImage = () => {
    setImageFile(null);
    setFormData(prev => ({ ...prev, SPv_IMG: '' }));
    setImagePreview(defaultPreview);
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.SPv_ID);
    setFormData({
      SPv_Name: item.SPv_Name,
      SPv_Description: item.SPv_Description,
      SPv_Category: item.SPv_Category,
      SPv_Price: String(item.SPv_Price),
      SPv_Quantity: String(item.SPv_Quantity),
      SPv_IMG: item.SPv_IMG
    });
    setImageFile(null);
    setImagePreview(item.SPv_IMG || defaultPreview);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (item) => {
    setItemPendingDelete(item);
  };

  const confirmDeleteItem = () => {
    if (!itemPendingDelete) return;

    setMenuItems((prev) => prev.filter((item) => item.SPv_ID !== itemPendingDelete.SPv_ID));
    setItemPendingDelete(null);
  };

  const cancelDeleteItem = () => {
    setItemPendingDelete(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedName = formData.SPv_Name.trim();
    const normalizedDescription = formData.SPv_Description.trim();
    const normalizedPrice = Number.parseFloat(formData.SPv_Price);
    const normalizedQuantity = Number.parseInt(formData.SPv_Quantity, 10);
    const normalizedImageUrl = formData.SPv_IMG.trim() || imagePreview;

    const nextItem = {
      SPv_ID: editingItemId || `PROD-${Date.now()}`,
      CSv_ID: 1,
      SPv_RefNum: editingItemId ? formData.SPv_RefNum || `REF-${Date.now()}` : `REF-${Date.now()}`,
      SPv_Name: normalizedName,
      SPv_Description: normalizedDescription,
      SPv_Category: formData.SPv_Category,
      SPv_Price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
      SPv_Quantity: Number.isFinite(normalizedQuantity) ? normalizedQuantity : 0,
      SPv_IMG: normalizedImageUrl
    };

    if (editingItemId) {
      setMenuItems((prev) => prev.map((item) => (item.SPv_ID === editingItemId ? nextItem : item)));
    } else {
      setMenuItems((prev) => [nextItem, ...prev]);
    }

    closeModal();
  };

  return (
    <div className="p-5 pt-lg">
      {isModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0">
              <div className="modal-header border-0">
                <h3 className="modal-title fw-bold">{editingItemId ? 'Edit Item' : 'Add New Item'}</h3>
                <button onClick={closeModal} className="btn-close" aria-label="Close"></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Item Name</label>
                  <input
                    type="text"
                    name="SPv_Name"
                    value={formData.SPv_Name}
                    onChange={handleInputChange}
                    placeholder="e.g., Grilled Chicken Sandwich"
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    name="SPv_Description"
                    value={formData.SPv_Description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the item"
                    rows="3"
                    className="form-control"
                    required
                  ></textarea>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      name="SPv_Category"
                      value={formData.SPv_Category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option>Main Course</option>
                      <option>Sides</option>
                      <option>Beverages</option>
                      <option>Desserts</option>
                      <option>Breakfast</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Price (₱)</label>
                    <input
                      type="number"
                      name="SPv_Price"
                      value={formData.SPv_Price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Initial Stock</label>
                    <input
                      type="number"
                      name="SPv_Quantity"
                      value={formData.SPv_Quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <label className="form-label fw-semibold mb-0">Image URL</label>
                    <button type="button" onClick={handleResetImage} className="btn btn-link btn-sm p-0">
                      Reset image
                    </button>
                  </div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border rounded-2 p-3 ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
                  >
                    <input
                      type="url"
                      name="SPv_IMG"
                      value={formData.SPv_IMG}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="form-control"
                    />
                    <label className="small text-secondary mb-2 mt-2 d-block">Or upload an image file</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
                  </div>
                  <div className="border rounded-2 bg-light p-2 mt-2">
                    <p className="small text-secondary mb-1">Preview</p>
                    <div className="rounded-2 overflow-hidden bg-white" style={{ aspectRatio: '3/2' }}>
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = defaultPreview;
                        }}
                      />
                    </div>
                  </div>
                  <p className="small text-secondary mt-2 mb-0">
                    Drag and drop an image into the box above, or enter a public image URL.
                  </p>
                </div>
                <div className="d-flex gap-2 pt-4">
                  <button type="button" onClick={closeModal} className="btn btn-light flex-grow-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    {editingItemId ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {itemPendingDelete && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content border-0">
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="material-symbols-outlined fs-2 text-danger">warning</span>
                  <div>
                    <h3 className="mb-0 fw-bold">Delete Item?</h3>
                    <p className="mb-0 small text-secondary">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="small mb-3">
                  Are you sure you want to delete <span className="fw-semibold">{itemPendingDelete.SPv_Name}</span> from the menu?
                </p>
                <div className="d-flex gap-2">
                  <button type="button" onClick={cancelDeleteItem} className="btn btn-light flex-grow-1">
                    Cancel
                  </button>
                  <button type="button" onClick={confirmDeleteItem} className="btn btn-danger flex-grow-1">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
        <div>
          <h2 className="display-5 fw-bold mb-1">Menu Management</h2>
          <p className="text-secondary small mb-0">Manage campus culinary offerings and inventory levels.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary d-flex align-items-center gap-2" type="button">
          <span className="material-symbols-outlined">add</span>
          <span>Add New Item</span>
        </button>
      </header>

      <div className="bg-light rounded-2 p-4 mb-5">
        <div className="row g-3">
          <div className="col-md-7 col-lg-8">
            <div className="position-relative">
              <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3">search</span>
              <input
                className="form-control ps-5"
                placeholder="Search menu items..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-5 col-lg-4 d-flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`btn btn-sm ${activeCategory === category ? 'btn-primary' : 'btn-light'}`}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-5">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-uppercase small fw-bold text-secondary">Item Details</th>
                <th className="text-uppercase small fw-bold text-secondary">Category</th>
                <th className="text-uppercase small fw-bold text-secondary text-end">Price</th>
                <th className="text-uppercase small fw-bold text-secondary text-center">Stock</th>
                <th className="text-uppercase small fw-bold text-secondary">Status</th>
                <th className="text-uppercase small fw-bold text-secondary text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const stockMeta = getStockMeta(item.SPv_Quantity);

                return (
                  <tr key={item.SPv_ID}>
                    <td className="py-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-2 overflow-hidden bg-secondary-subtle" style={{ width: '3rem', height: '3rem' }}>
                          <img src={item.SPv_IMG} alt={item.SPv_Name} className={`w-100 h-100 ${stockMeta.imageClass}`} style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p className={`fw-bold mb-1 ${stockMeta.nameClass}`}>{item.SPv_Name}</p>
                          <p className="small text-secondary mb-0">{item.SPv_Description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 small text-secondary">{item.SPv_Category}</td>
                    <td className="py-4 small fw-bold text-end">{formatPrice(item.SPv_Price)}</td>
                    <td className="py-4 text-center">
                      <div className={`small fw-bold ${stockMeta.stockTextClass}`}>{item.SPv_Quantity}</div>
                      <div className="progress mt-2" style={{ height: '0.375rem', maxWidth: '4rem', margin: '0 auto' }}>
                        <div className={`progress-bar ${stockMeta.barClass}`} style={{ width: getStockBarWidth(item.SPv_Quantity) }}></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`badge rounded-pill small ${stockMeta.statusClass}`}>{stockMeta.status}</span>
                    </td>
                    <td className="py-4 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" onClick={() => handleEditItem(item)} className="btn btn-sm btn-link text-secondary">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button type="button" onClick={() => handleDeleteItem(item)} className="btn btn-sm btn-link text-danger">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-5 text-center small text-secondary">
                    No menu items found for {activeCategory}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-uppercase small fw-bold text-secondary mb-2">Total Items</p>
              <p className="display-6 fw-bold mb-0">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <p className="text-uppercase small fw-bold text-secondary mb-2">Low Inventory</p>
              <p className="display-6 fw-bold text-warning mb-0">{String(lowInventoryCount).padStart(2, '0')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 border-danger shadow-sm">
            <div className="card-body">
              <p className="text-uppercase small fw-bold text-secondary mb-2">Out of Stock</p>
              <p className="display-6 fw-bold text-danger mb-0">{String(outOfStockCount).padStart(2, '0')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card bg-primary text-white border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-uppercase small fw-bold opacity-75 mb-1">Daily Sales Peak</p>
                <p className="display-6 fw-bold mb-0">12:30</p>
              </div>
              <span className="material-symbols-outlined fs-1">trending_up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
