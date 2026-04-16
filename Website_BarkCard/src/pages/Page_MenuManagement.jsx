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
  const [imageFile, setImageFile] = useState(null);
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
    <div className="p-8 lg:p-10">
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-container-lowest border-b border-surface-container-high p-6 flex items-center justify-between">
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {editingItemId ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button
                onClick={closeModal}
                className="text-outline hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Item Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface font-label">Item Name</label>
                <input
                  type="text"
                  name="SPv_Name"
                  value={formData.SPv_Name}
                  onChange={handleInputChange}
                  placeholder="e.g., Grilled Chicken Sandwich"
                  className="w-full px-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface font-label">Description</label>
                <textarea
                  name="SPv_Description"
                  value={formData.SPv_Description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the item"
                  rows="3"
                  className="w-full px-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline resize-none"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface font-label">Category</label>
                <select
                  name="SPv_Category"
                  value={formData.SPv_Category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface"
                >
                  <option>Main Course</option>
                  <option>Sides</option>
                  <option>Beverages</option>
                  <option>Desserts</option>
                  <option>Breakfast</option>
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface font-label">Price (₱)</label>
                <input
                  type="number"
                  name="SPv_Price"
                  value={formData.SPv_Price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline"
                  required
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface font-label">Initial Stock</label>
                <input
                  type="number"
                  name="SPv_Quantity"
                  value={formData.SPv_Quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline"
                  required
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-semibold text-on-surface font-label">Image URL</label>
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="text-xs text-secondary hover:text-on-surface transition-colors"
                  >
                    Reset image
                  </button>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-2xl p-3 border ${dragActive ? 'border-primary bg-surface-container-highest' : 'border-surface-container'} transition-colors`}
                >
                  <input
                    type="url"
                    name="SPv_IMG"
                    value={formData.SPv_IMG}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-surface-container border-none rounded-lg focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline"
                  />
                  <div className="mt-3 flex flex-col gap-3">
                    <label className="text-xs text-secondary">Or upload an image file</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-on-primary hover:file:bg-primary-container transition-all"
                    />
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-surface-container-high bg-surface-container-low p-3">
                  <p className="text-xs text-secondary mb-2">Preview</p>
                  <div className="aspect-[3/2] overflow-hidden rounded-xl bg-surface-container-high">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="object-cover w-full h-full"
                      onError={(e) => { e.currentTarget.src = defaultPreview; }}
                    />
                  </div>
                </div>
                <p className="text-xs text-secondary">Drag and drop an image into the box above, or enter a public image URL.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold hover:bg-surface-container-highest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg font-semibold shadow-md hover:brightness-110 transition-all active:scale-95"
                >
                  {editingItemId ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {itemPendingDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-lg max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-3xl">warning</span>
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface">Delete Item?</h3>
                <p className="text-sm text-secondary">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-on-surface">
              Are you sure you want to delete <span className="font-semibold">{itemPendingDelete.SPv_Name}</span> from the menu?
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={cancelDeleteItem}
                className="flex-1 px-4 py-3 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold hover:bg-surface-container-highest transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="flex-1 px-4 py-3 bg-error text-on-error rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="flex justify-between items-end mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Menu Management</h2>
          <p className="text-secondary text-sm font-body">Manage campus culinary offerings and inventory levels.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg font-semibold shadow-md active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span>
          <span>Add New Item</span>
        </button>
      </header>

      {/* Search & Filter Tonal Layer */}
      <div className="bg-surface-container-low rounded-xl p-6 mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
            placeholder="Search menu items..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categoryOptions.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-secondary-container hover:bg-secondary-container'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Management Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline">Item Details</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline">Category</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline text-right">Price</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline text-center">Stock</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline">Status</th>
              <th className="px-8 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {filteredItems.map((item) => {
              const stockMeta = getStockMeta(item.SPv_Quantity);

              return (
                <tr key={item.SPv_ID} className="group hover:bg-surface-container-low transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center overflow-hidden ${stockMeta.imageClass}`}>
                        <img className="w-full h-full object-cover" src={item.SPv_IMG} alt={item.SPv_Name} />
                      </div>
                      <div>
                        <p className={`font-headline font-bold text-on-surface ${stockMeta.nameClass}`}>{item.SPv_Name}</p>
                        <p className="text-xs text-outline font-body">{item.SPv_Description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-body text-sm text-secondary">{item.SPv_Category}</td>
                  <td className="px-6 py-6 font-headline font-bold text-sm text-right text-on-surface">{formatPrice(item.SPv_Price)}</td>
                  <td className="px-6 py-6 text-center">
                    <div className={`text-sm font-bold ${stockMeta.stockTextClass}`}>{item.SPv_Quantity}</div>
                    <div className="w-16 h-1.5 bg-surface-container-highest rounded-full mx-auto mt-2 overflow-hidden">
                      <div
                        className={`h-full ${stockMeta.barClass} rounded-full`}
                        style={{ width: getStockBarWidth(item.SPv_Quantity) }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 font-label text-[10px] font-extrabold uppercase tracking-wide rounded-full ${stockMeta.statusClass}`}>
                      {stockMeta.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-secondary hover:text-primary-container"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="p-2 text-secondary hover:text-error"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-sm text-secondary">
                  No menu items found for {activeCategory}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats / Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-headline font-bold text-outline uppercase tracking-wider mb-2">Total Items</p>
          <p className="text-3xl font-headline font-extrabold text-on-surface">{totalItems}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-headline font-bold text-outline uppercase tracking-wider mb-2">Low Inventory</p>
          <p className="text-3xl font-headline font-extrabold text-amber-600">{String(lowInventoryCount).padStart(2, '0')}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-error/10">
          <p className="text-xs font-headline font-bold text-outline uppercase tracking-wider mb-2">Out of Stock</p>
          <p className="text-3xl font-headline font-extrabold text-error">{String(outOfStockCount).padStart(2, '0')}</p>
        </div>
        <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-md flex flex-col justify-between">
          <p className="text-xs font-headline font-bold text-on-primary/80 uppercase tracking-wider mb-2">Daily Sales Peak</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-headline font-extrabold text-on-primary">12:30</p>
            <span className="material-symbols-outlined text-on-primary/50 text-4xl">trending_up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
