import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';

const categoryOptions = ['All Categories', 'Meals', 'Snacks', 'Drinks', 'Other'];

const defaultFormData = {
  SPv_RefNum: '',
  SPv_Name: '',
  SPv_Description: '',
  SPv_Category: 'Meals',
  SPv_Price: '',
  SPv_Quantity: '',
  SPv_IMG: ''
};

const MAX_IMAGE_URL_LENGTH = 2048;
const PRODUCT_IMAGES_BUCKET = import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET || 'product-images';
const DEFAULT_PREVIEW_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#f1f3f5" />
    <rect x="24" y="24" width="252" height="152" rx="14" fill="#ffffff" stroke="#d0d7de" />
    <path d="M70 136l36-36 28 28 44-52 52 60H70z" fill="#cbd5e1" />
    <circle cx="106" cy="82" r="14" fill="#e2e8f0" />
    <text x="150" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#6b7280">
      Upload or Enter URL
    </text>
  </svg>`
)}`;

const mapStoreProductToMenuItem = (product, fallbackValues = {}) => ({
  SPv_ID: product.spv_id,
  CSv_ID: product.csv_id ?? fallbackValues.CSv_ID,
  SPv_RefNum: product.spv_refnum ?? fallbackValues.SPv_RefNum ?? '',
  SPv_Name: product.spv_name ?? fallbackValues.SPv_Name ?? '',
  SPv_Description: product.spv_description ?? fallbackValues.SPv_Description ?? '',
  SPv_Category: fallbackValues.SPv_Category ?? 'Meals',
  SPv_Price: Number(product.spv_price ?? fallbackValues.SPv_Price ?? 0),
  SPv_Quantity: Number(product.spv_quantity ?? fallbackValues.SPv_Quantity ?? 0),
  SPv_IMG: product.spv_img ?? fallbackValues.SPv_IMG ?? ''
});

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

const sanitizeFileName = (fileName) =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const normalizeString = (value) => String(value ?? '').trim();

const generateUniqueRefNum = (name = '') => {
  const normalizedName = String(name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'ITEM';

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  return `${normalizedName}-${uniqueSuffix}`;
};

export default function MenuManagement({ menuItems, setMenuItems, refreshMenuItems }) {
  const { globalSearchTerm = '' } = useOutletContext() ?? {};
  const { user: currentAuthUser } = useAuth();
  const defaultPreview = DEFAULT_PREVIEW_IMAGE;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemPendingDelete, setItemPendingDelete] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [imagePreview, setImagePreview] = useState(defaultPreview);
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [storeId, setStoreId] = useState(null);
  const [isRefreshingMenu, setIsRefreshingMenu] = useState(false);

  useEffect(() => {
    if (!refreshMenuItems) return;

    refreshMenuItems().catch((error) => {
      console.error('Error refreshing menu items on Menu Management load:', error);
    });
  }, [refreshMenuItems]);

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const authEmail = String(currentAuthUser?.email || '').trim().toLowerCase();

        console.log('[MenuManagement] Auth context user:', currentAuthUser);
        console.log('[MenuManagement] Auth email:', authEmail);

        if (!authEmail) {
          console.error('[MenuManagement] No email found');
          setStoreId(null);
          return;
        }

        console.log('[MenuManagement] Fetching store for email:', authEmail);
        const { data: store, error: storeError } = await supabase
          .from('tbl_canteenstore')
          .select('csv_id, csv_name')
          .eq('csv_email', authEmail)
          .maybeSingle();

        console.log('[MenuManagement] Store query result:', store);
        console.log('[MenuManagement] Store query error:', storeError);

        if (storeError) {
          throw storeError;
        }

        if (store) {
          console.log('[MenuManagement] Store resolved - csv_id:', store.csv_id);
          setStoreId(store.csv_id);
        } else {
          console.error('[MenuManagement] No store found for email:', authEmail);
          setStoreId(null);
        }
      } catch (error) {
        console.error('[MenuManagement] Error fetching canteen store:', error);
        setStoreId(null);
      }
    };

    if (currentAuthUser?.email) {
      fetchStoreId();
    }
  }, [currentAuthUser?.email]);

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
    setIsSubmitting(false);
    setSubmitError('');
  };

  const openAddModal = () => {
    setEditingItemId(null);
    setFormData(defaultFormData);
    setImageFile(null);
    setImagePreview(defaultPreview);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleRefreshMenu = async () => {
    if (!refreshMenuItems) return;

    setIsRefreshingMenu(true);
    try {
      await refreshMenuItems();
    } catch (error) {
      console.error('Error refreshing menu items manually:', error);
    } finally {
      setIsRefreshingMenu(false);
    }
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
    setSubmitError('');
    setFormData({
      SPv_RefNum: item.SPv_RefNum,
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

  const confirmDeleteItem = async () => {
    if (!itemPendingDelete) return;

    try {
      const { error } = await supabase
        .from('tbl_storeproducts')
        .delete()
        .eq('spv_id', itemPendingDelete.SPv_ID);

      if (error) {
        throw error;
      }

      setMenuItems((prev) => prev.filter((item) => item.SPv_ID !== itemPendingDelete.SPv_ID));
      setItemPendingDelete(null);
    } catch (error) {
      console.error('Error deleting menu item from Supabase:', error);
    }
  };

  const cancelDeleteItem = () => {
    setItemPendingDelete(null);
  };

  const uploadImageFile = async (file) => {
    const safeFileName = sanitizeFileName(file.name || 'menu-item-image');
    const extension = safeFileName.includes('.') ? safeFileName.split('.').pop() : 'jpg';
    const filePath = `menu-items/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error(`Image uploaded, but no public URL was returned from bucket "${PRODUCT_IMAGES_BUCKET}".`);
    }

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    if (!storeId) {
      setSubmitError('No canteen store is linked to this account yet. Please create or assign a store in tbl_canteenstore first.');
      setIsSubmitting(false);
      return;
    }

    const normalizedName = formData.SPv_Name.trim();
    const normalizedDescription = formData.SPv_Description.trim();
    const normalizedPrice = Number.parseFloat(formData.SPv_Price);
    const normalizedQuantity = Number.parseInt(formData.SPv_Quantity, 10);
    let normalizedImageUrl = formData.SPv_IMG.trim() || imagePreview;

    if (imageFile) {
      try {
        normalizedImageUrl = await uploadImageFile(imageFile);
      } catch (error) {
        console.error('Error uploading menu item image to Supabase Storage:', error);
        setSubmitError(
          error?.message ||
          `Failed to upload image. Make sure the "${PRODUCT_IMAGES_BUCKET}" Supabase Storage bucket exists and allows uploads.`
        );
        setIsSubmitting(false);
        return;
      }
    }

    if (normalizedImageUrl.length > MAX_IMAGE_URL_LENGTH) {
      setSubmitError(`Image URL is too long. Please use a shorter public image URL under ${MAX_IMAGE_URL_LENGTH} characters.`);
      setIsSubmitting(false);
      return;
    }

    const fallbackValues = {
      CSv_ID: storeId,
      SPv_RefNum: editingItemId
        ? formData.SPv_RefNum || generateUniqueRefNum(normalizedName)
        : generateUniqueRefNum(normalizedName),
      SPv_ID: editingItemId ?? null,
      SPv_Name: normalizedName,
      SPv_Description: normalizedDescription,
      SPv_Category: formData.SPv_Category,
      SPv_Price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
      SPv_Quantity: Number.isFinite(normalizedQuantity) ? normalizedQuantity : 0,
      SPv_IMG: normalizedImageUrl
    };

    const productPayload = {
      csv_id: fallbackValues.CSv_ID,
      spv_img: fallbackValues.SPv_IMG,
      spv_refnum: fallbackValues.SPv_RefNum,
      spv_name: fallbackValues.SPv_Name,
      spv_description: fallbackValues.SPv_Description,
      spv_quantity: fallbackValues.SPv_Quantity,
      spv_price: fallbackValues.SPv_Price
    };

    console.log('[MenuManagement] === PRODUCT SAVE ===');
    console.log('[MenuManagement] Store csv_id:', storeId);
    console.log('[MenuManagement] Product payload:', productPayload);
    console.log('[MenuManagement] csv_id in payload:', productPayload.csv_id);

    try {
      if (editingItemId) {
        console.log('[MenuManagement] Updating product spv_id:', editingItemId);
        const { data, error } = await supabase
          .from('tbl_storeproducts')
          .update(productPayload)
          .eq('spv_id', editingItemId)
          .select('spv_id, csv_id, spv_img, spv_refnum, spv_name, spv_description, spv_quantity, spv_price')
          .single();

        if (error) {
          throw error;
        }

        console.log('[MenuManagement] Product updated:', data);
        console.log('[MenuManagement] Updated csv_id:', data.csv_id);
        const updatedItem = mapStoreProductToMenuItem(data, fallbackValues);
        setMenuItems((prev) => prev.map((item) => (item.SPv_ID === editingItemId ? updatedItem : item)));
      } else {
        console.log('[MenuManagement] === INSERTING NEW PRODUCT ===');
        console.log('[MenuManagement] Insert payload (should NOT have spv_id):', productPayload);
        console.log('[MenuManagement] Payload keys:', Object.keys(productPayload));
        console.log('[MenuManagement] Has spv_id in payload?', 'spv_id' in productPayload);
        
        const { data, error } = await supabase
          .from('tbl_storeproducts')
          .insert(productPayload)
          .select('spv_id, csv_id, spv_img, spv_refnum, spv_name, spv_description, spv_quantity, spv_price')
          .single();

        if (error) {
          console.error('[MenuManagement] Insert error:', error);
          console.error('[MenuManagement] Error code:', error.code);
          console.error('[MenuManagement] Error message:', error.message);
          console.error('[MenuManagement] Error details:', error.details);
          console.error('[MenuManagement] Error hint:', error.hint);
          throw error;
        }

        console.log('[MenuManagement] Product inserted successfully:', data);
        console.log('[MenuManagement] Inserted spv_id (auto-generated):', data.spv_id);
        console.log('[MenuManagement] Inserted csv_id:', data.csv_id);
        const createdItem = mapStoreProductToMenuItem(data, fallbackValues);
        setMenuItems((prev) => [createdItem, ...prev]);
      }

      closeModal();
    } catch (error) {
      console.error('Error saving menu item to Supabase:', error);
      setSubmitError(error?.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
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
                {submitError && (
                  <div className="alert alert-danger py-2" role="alert">
                    {submitError}
                  </div>
                )}
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
                      <option>Meals</option>
                      <option>Snacks</option>
                      <option>Drinks</option>
                      <option>Other</option>
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
                  <button type="submit" className="btn btn-primary flex-grow-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingItemId ? 'Save Changes' : 'Add Item'}
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
        <div className="d-flex flex-wrap gap-2">
          <button
            onClick={handleRefreshMenu}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            type="button"
            disabled={!refreshMenuItems || isRefreshingMenu}
          >
            <span className="material-symbols-outlined">{isRefreshingMenu ? 'progress_activity' : 'refresh'}</span>
            <span>{isRefreshingMenu ? 'Refreshing...' : 'Refresh Menu'}</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary d-flex align-items-center gap-2" type="button">
            <span className="material-symbols-outlined">add</span>
            <span>Add New Item</span>
          </button>
        </div>
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
                <th className="text-uppercase small fw-bold text-secondary">Description</th>
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
                        </div>
                      </div>
                    </td>
                    <td className="py-4 small text-secondary">{item.SPv_Description}</td>
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
                  <td colSpan="7" className="py-5 text-center small text-secondary">
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
