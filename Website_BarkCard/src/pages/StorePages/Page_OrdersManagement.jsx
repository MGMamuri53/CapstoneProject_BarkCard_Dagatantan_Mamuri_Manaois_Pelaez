import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';

const statusFilterOptions = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Preparing', value: 'Preparing' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
];

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();
const formatStatusLabel = (value) => {
  const normalizedStatus = normalizeStatus(value);

  if (!normalizedStatus) {
    return 'Pending';
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

export default function OrdersManagement() {
  const { user: currentAuthUser } = useAuth();
  const { globalSearchTerm = '' } = useOutletContext() ?? {};
  
  // Staff store state
  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState('');
  
  // QR scan state
  const [qrInput, setQrInput] = useState('');
  const [qrScannedOrder, setQrScannedOrder] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalLoading, setQrModalLoading] = useState(false);
  const scanInputRef = useRef(null);
  
  // Order status filter
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  // Fetch orders with store ID
  const { orders, setOrders, isLoading, error, confirmPayment, markAsPreparing, markAsCompleted, fetchOrderByQr, refetch } = useOrders(storeId);

  // Helper function to parse QR value in different formats
  const parseQrValue = (rawValue) => {
    const trimmed = String(rawValue || '').trim();
    console.log('[QR Parse] Raw scanned value:', trimmed);

    // Try JSON format: {"ov_id":48}
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.ov_id) {
          const ovId = Number(parsed.ov_id);
          console.log('[QR Parse] Parsed from JSON format:', ovId);
          return ovId;
        }
      } catch (e) {
        console.warn('[QR Parse] Invalid JSON format');
      }
    }

    // Try ORDER:48 format
    if (trimmed.toUpperCase().startsWith('ORDER:')) {
      const ovId = Number(trimmed.substring(6));
      if (!isNaN(ovId)) {
        console.log('[QR Parse] Parsed from ORDER: format:', ovId);
        return ovId;
      }
    }

    // Try plain number format: 48
    const ovId = Number(trimmed);
    if (!isNaN(ovId) && ovId > 0) {
      console.log('[QR Parse] Parsed from plain number format:', ovId);
      return ovId;
    }

    console.warn('[QR Parse] Could not parse QR value:', trimmed);
    return null;
  };

  // Fetch staff store on component mount
  useEffect(() => {
    const fetchStaffStore = async () => {
      try {
        const authUserId = String(currentAuthUser?.id || '').trim();
        const authEmail = String(currentAuthUser?.email || '').trim().toLowerCase();

        let resolvedUvId = authUserId;

        if (!resolvedUvId && authEmail) {
          const { data: userRow } = await supabase
            .from('tbl_user')
            .select('uv_id')
            .ilike('uv_email', authEmail)
            .maybeSingle();
          resolvedUvId = userRow?.uv_id;
        }

        if (!resolvedUvId) {
          setStoreId(null);
          return;
        }

        const { data: store } = await supabase
          .from('tbl_canteenstore')
          .select('csv_id, csv_name')
          .eq('uv_id', resolvedUvId)
          .maybeSingle();

        if (store) {
          setStoreId(store.csv_id);
          setStoreName(store.csv_name);
        }
      } catch (err) {
        console.error('Error fetching staff store:', err);
      }
    };

    if (currentAuthUser?.id || currentAuthUser?.email) {
      fetchStaffStore();
    }
  }, [currentAuthUser?.email, currentAuthUser?.id]);

  // Auto-focus scan input when page loads or modal closes
  useEffect(() => {
    if (storeId && scanInputRef.current && !isQrModalOpen) {
      setTimeout(() => {
        scanInputRef.current?.focus();
        console.log('[QR Focus] Scan input focused');
      }, 100);
    }
  }, [storeId, isQrModalOpen]);

  // Helper functions
  const getOrderItemsString = (items) => {
    return items?.map(item => item.SPv_Name).join(', ') || '';
  };

  const formatAmount = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const parseAmount = (amount) => {
    return typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
  };

  const normalizedGlobalQuery = globalSearchTerm.trim().toLowerCase();
  const searchFilteredOrders = orders.filter((order) => {
    if (!normalizedGlobalQuery) {
      return true;
    }

    const searchableText = [
      order.Uv_FullName,
      order.Ov_ID,
      getOrderItemsString(order.ODv_Items),
      order.Ov_Status,
      order.Ov_CreatedAt,
      order.Uv_ID,
      order.Uv_Email,
      order.WTv_Type,
      order.Ov_TotalAmount
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedGlobalQuery);
  });

  const pendingOrders = orders.filter((order) => normalizeStatus(order.Ov_Status) === 'pending');
  const preparingOrders = orders.filter((order) => normalizeStatus(order.Ov_Status) === 'preparing');
  const completedOrders = orders.filter((order) => normalizeStatus(order.Ov_Status) === 'completed');
  const activeOrders = orders.filter((order) => normalizeStatus(order.Ov_Status) !== 'cancelled');
  const queueOrdersCount = pendingOrders.length + preparingOrders.length;
  const kitchenLoad = activeOrders.length > 0 ? Math.round((queueOrdersCount / activeOrders.length) * 100) : 0;

  const completedRevenue = completedOrders.reduce((sum, order) => sum + parseAmount(order.Ov_TotalAmount), 0);
  const queuedRevenue = pendingOrders
    .concat(preparingOrders)
    .reduce((sum, order) => sum + parseAmount(order.Ov_TotalAmount), 0);
  const formattedCompletedRevenue = formatAmount(completedRevenue);
  const formattedQueuedRevenue = formatAmount(queuedRevenue);

  const filteredOrders =
    selectedStatus === 'all'
      ? searchFilteredOrders
      : searchFilteredOrders.filter((order) => normalizeStatus(order.Ov_Status) === normalizeStatus(selectedStatus));

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, globalSearchTerm, orders.length]);

  useEffect(() => {
    if (!selectedOrder) return;

    const refreshedSelectedOrder = orders.find((order) => order.Ov_ID === selectedOrder.Ov_ID);
    if (refreshedSelectedOrder && refreshedSelectedOrder !== selectedOrder) {
      setSelectedOrder(refreshedSelectedOrder);
    }
  }, [orders, selectedOrder]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleQrScanInputPaste = async (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text') || '';
    console.log('[QR Paste] Pasted scan value:', pastedText);
    
    if (pastedText.trim()) {
      const ovId = parseQrValue(pastedText);
      if (ovId) {
        console.log('[QR Paste] Parsed ov_id:', ovId);
        setQrInput('');
        await handleQrScan(ovId);
      } else {
        console.warn('[QR Paste] Could not parse pasted value');
        alert('Invalid QR format. Please try again.');
      }
    }
  };

  const handleQrScanInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('[QR KeyDown] Enter pressed with qrInput:', qrInput);
      const ovId = parseQrValue(qrInput);
      if (ovId) {
        handleQrScan(ovId);
      } else {
        alert('Invalid QR format. Please scan a valid order QR code.');
        setQrInput('');
      }
    }
  };

  const handleQrScan = async (ovId) => {
    if (!storeId) {
      alert('Store not loaded. Please try again.');
      return;
    }

    if (!ovId || ovId <= 0) {
      alert('Invalid order ID.');
      return;
    }

    setQrModalLoading(true);
    try {
      console.log('[QR Checkout] Processing parsed ov_id:', ovId);

      // Step 1: Fetch order from tbl_order by ov_id
      const { data: orderData, error: orderError } = await supabase
        .from('tbl_order')
        .select('ov_id, uv_id, ov_totalamount, ov_status, ov_ispaid')
        .eq('ov_id', ovId)
        .maybeSingle();

      if (orderError || !orderData) {
        console.log('[QR Checkout] Order not found - ovId:', ovId);
        throw new Error('Order not found');
      }
      console.log('[QR Checkout] Fetched order:', orderData);

      const studentUvId = orderData.uv_id;
      const totalAmount = parseFloat(orderData.ov_totalamount);
      console.log('[QR Checkout] Student uv_id:', studentUvId, 'Total amount:', totalAmount);

      // Step 2: Check if order already paid
      if (orderData.ov_ispaid) {
        console.log('[QR Checkout] Order already paid - ov_ispaid:', orderData.ov_ispaid);
        alert('Order already paid. Cannot process again.');
        setQrInput('');
        return;
      }

      // Step 3: Fetch current student wallet balance from tbl_student_balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('tbl_student_balance')
        .select('sv_balance, sv_updated_at')
        .eq('uv_id', studentUvId)
        .maybeSingle();

      if (balanceError || !balanceData) {
        console.log('[QR Checkout] Balance record not found - uv_id:', studentUvId);
        throw new Error('Student balance record not found.');
      }
      console.log('[QR Checkout] Fetched balance record:', balanceData);

      const currentBalance = parseFloat(balanceData.sv_balance || 0);
      console.log('[QR Checkout] Current balance:', currentBalance, 'Required:', totalAmount);

      // Step 4: Check if balance is sufficient
      if (currentBalance < totalAmount) {
        console.log('[QR Checkout] INSUFFICIENT BALANCE - Required:', totalAmount, 'Available:', currentBalance);
        alert(`Insufficient balance.\nRequired: ₱${totalAmount.toFixed(2)}\nAvailable: ₱${currentBalance.toFixed(2)}`);
        setQrInput('');
        return;
      }

      // Step 5: Update student balance in tbl_student_balance
      const newBalance = currentBalance - totalAmount;
      const { data: balanceUpdateData, error: balanceUpdateError } = await supabase
        .from('tbl_student_balance')
        .update({
          sv_balance: newBalance,
          sv_updated_at: new Date().toISOString()
        })
        .eq('uv_id', studentUvId)
        .select();

      console.log('[QR Checkout] Updated balance to:', newBalance, 'Result:', balanceUpdateData);
      if (balanceUpdateError) {
        console.error('[QR Checkout] Balance update error:', balanceUpdateError);
        throw new Error('Failed to update balance: ' + balanceUpdateError.message);
      }

      // Step 6: Insert debit transaction for history
      const { data: transactionData, error: transactionError } = await supabase
        .from('tbl_transactions')
        .insert({
          uv_id: studentUvId,
          tv_type: 'debit',
          tv_amount: totalAmount,
          tv_merchant: 'Canteen',
          tv_description: `Canteen order payment - Order #${ovId}`
        })
        .select();

      console.log('[QR Checkout] Inserted debit transaction:', transactionData);
      if (transactionError) {
        console.error('[QR Checkout] Transaction insert error:', transactionError);
        throw new Error('Failed to insert transaction: ' + transactionError.message);
      }

      // Step 7: Update order status and payment
      const { data: orderUpdateData, error: orderUpdateError } = await supabase
        .from('tbl_order')
        .update({
          ov_status: 'Preparing',
          ov_ispaid: true
        })
        .eq('ov_id', ovId)
        .select();

      console.log('[QR Checkout] Updated order:', orderUpdateData);
      if (orderUpdateError) {
        console.error('[QR Checkout] Order update error:', orderUpdateError);
        throw new Error('Failed to update order: ' + orderUpdateError.message);
      }

      // Step 8: Fetch updated order for display
      const scannedOrder = await fetchOrderByQr(ovId);
      console.log('[QR Checkout] Refreshed order data:', scannedOrder);
      
      setQrScannedOrder(scannedOrder);
      setIsQrModalOpen(true);
      setQrInput('');

      // Show success message
      alert(`✓ Order paid and moved to Preparing!\n\nDeducted: ₱${totalAmount.toFixed(2)}\nNew Balance: ₱${newBalance.toFixed(2)}`);

      // Auto-close modal after 3 seconds
      setTimeout(() => {
        setIsQrModalOpen(false);
      }, 3000);

      // Step 9: Refresh order management table
      await refetch();

      // Refocus scan input for next scan
      setTimeout(() => {
        setQrInput('');
        scanInputRef.current?.focus();
        console.log('[QR Checkout] Input cleared and refocused for next scan');
      }, 100);
    } catch (err) {
      console.error('[QR Checkout] Error:', err.message || err);
      alert(err.message || 'Order checkout failed. Please try again.');
      setQrInput('');
      // Refocus on error
      scanInputRef.current?.focus();
    } finally {
      setQrModalLoading(false);
    }
  };

  const handleQrPaymentConfirm = async () => {
    if (!qrScannedOrder) return;
    setQrModalLoading(true);
    try {
      await confirmPayment(qrScannedOrder.Ov_ID);
      const updatedOrder = await fetchOrderByQr(qrScannedOrder.Ov_ID);
      setQrScannedOrder(updatedOrder);
    } catch (err) {
      alert('Failed to confirm payment');
    } finally {
      setQrModalLoading(false);
    }
  };

  const handleQrMarkPreparing = async () => {
    if (!qrScannedOrder) return;
    setQrModalLoading(true);
    try {
      console.log('[QR Mark Preparing] orderId:', qrScannedOrder.Ov_ID);
      const { data, error } = await supabase
        .from('tbl_order')
        .update({ ov_status: 'Preparing', ov_ispaid: true })
        .eq('ov_id', Number(qrScannedOrder.Ov_ID))
        .select();
      
      console.log('[QR Mark Preparing] newStatus: Preparing');
      console.log('[QR Mark Preparing] updated result:', data);
      console.log('[QR Mark Preparing] update error:', error);
      
      if (error) throw error;
      
      const updatedOrder = await fetchOrderByQr(qrScannedOrder.Ov_ID);
      setQrScannedOrder(updatedOrder);
      await refetch();
    } catch (err) {
      console.error('[QR Mark Preparing] Error:', err);
      alert('Failed to update order status');
    } finally {
      setQrModalLoading(false);
    }
  };

  const handleQrMarkCompleted = async () => {
    if (!qrScannedOrder) return;
    setQrModalLoading(true);
    try {
      console.log('[QR Mark Completed] orderId:', qrScannedOrder.Ov_ID);
      const { data, error } = await supabase
        .from('tbl_order')
        .update({ ov_status: 'Completed', ov_ispaid: true })
        .eq('ov_id', Number(qrScannedOrder.Ov_ID))
        .select();
      
      console.log('[QR Mark Completed] newStatus: Completed');
      console.log('[QR Mark Completed] updated result:', data);
      console.log('[QR Mark Completed] update error:', error);
      
      if (error) throw error;
      
      const updatedOrder = await fetchOrderByQr(qrScannedOrder.Ov_ID);
      setQrScannedOrder(updatedOrder);
      await refetch();
    } catch (err) {
      console.error('[QR Mark Completed] Error:', err);
      alert('Failed to update order status');
    } finally {
      setQrModalLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefreshOrders = async () => {
    if (!storeId) return;

    setIsRefreshingOrders(true);
    try {
      await refetch();
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    console.log('[Order Status Change] orderId:', orderId);
    console.log('[Order Status Change] newStatus:', newStatus);

    setIsStatusUpdating(true);
    try {
      const normalizedNewStatus = String(newStatus || '').trim();

      console.log('[Order Status Change] normalizedNewStatus:', normalizedNewStatus);

      const shouldMarkPaid = normalizedNewStatus === 'Preparing' || normalizedNewStatus === 'Completed';

      const { data, error: updateError } = await supabase
        .from('tbl_order')
        .update({
          ov_status: normalizedNewStatus,
          ...(shouldMarkPaid ? { ov_ispaid: true } : {})
        })
        .eq('ov_id', Number(orderId))
        .select('ov_id, ov_status, ov_ispaid');

      console.log('[Order Status Change] updated data:', data);
      console.log('[Order Status Change] update error:', updateError);

      if (updateError) {
        throw updateError;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          Number(order.Ov_ID) === Number(orderId) ? { ...order, Ov_Status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder.Ov_ID === orderId) {
        setSelectedOrder((prev) => ({ ...prev, Ov_Status: newStatus }));
      }

      await refetch();
    } catch (statusError) {
      console.error('[Order Status Change] Failed Update:', statusError);
      alert(statusError?.message || 'Failed to update order status. Please try again.');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const closeDetailsModal = () => {
    if (isStatusUpdating) {
      return;
    }
    setIsDetailsModalOpen(false);
  };

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'preparing':
        return 'bg-info text-dark';
      case 'completed':
        return 'bg-success text-white';
      case 'cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const showingFrom = filteredOrders.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ordersPerPage, filteredOrders.length);

  return (
    <div className="p-5 pt-lg">
      <div className="mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-2">
          <div>
            <h2 className="display-5 fw-bold mb-2">Order Management</h2>
            <p className="text-secondary small mb-0">Store: <span className="fw-bold">{storeName || 'Loading...'}</span></p>
          </div>
          <button
            onClick={handleRefreshOrders}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            type="button"
            disabled={!storeId || isRefreshingOrders || isLoading}
          >
            <span className="material-symbols-outlined">{isRefreshingOrders ? 'progress_activity' : 'refresh'}</span>
            <span>{isRefreshingOrders ? 'Refreshing...' : 'Refresh Orders'}</span>
          </button>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {statusFilterOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`btn btn-sm ${selectedStatus === status.value ? 'btn-primary' : 'btn-light'}`}
              type="button"
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* QR SCAN SECTION */}
      <div className="bg-light rounded-2 p-4 mb-5" onClick={() => {
        console.log('[QR Click] Scan area clicked, focusing input');
        scanInputRef.current?.focus();
      }}>
        <label className="form-label fw-semibold">Scan Order QR Code</label>
        <input
          ref={scanInputRef}
          type="text"
          value={qrInput}
          onChange={(e) => {
            console.log('[QR Change] Input changed:', e.target.value);
            setQrInput(e.target.value);
          }}
          onKeyDown={handleQrScanInputKeyDown}
          onPaste={handleQrScanInputPaste}
          placeholder="Scan QR or enter Order ID (then press Enter)"
          className="form-control"
          disabled={!storeId}
        />
      </div>

      {isLoading && (
        <div className="alert alert-info" role="alert">
          <span className="spinner-border spinner-border-sm me-2"></span>
          Loading orders...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          Error loading orders: {error}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="alert alert-warning" role="alert">
          No orders found.
        </div>
      )}

      <div className="card border-0 shadow-sm mb-5">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-uppercase small fw-bold text-secondary">Student Name</th>
                <th className="text-uppercase small fw-bold text-secondary">Order ID</th>
                <th className="text-uppercase small fw-bold text-secondary">Items Ordered</th>
                <th className="text-uppercase small fw-bold text-secondary">Total Price</th>
                <th className="text-uppercase small fw-bold text-secondary">Date/Time</th>
                <th className="text-uppercase small fw-bold text-secondary">Status</th>
                <th className="text-uppercase small fw-bold text-secondary text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.Ov_ID}>
                  <td className="py-4">
                    <div>
                      <span className="fw-medium d-block">{order.Uv_FullName}</span>
                      <span className="small text-secondary">{order.Uv_Email}</span>
                    </div>
                  </td>
                  <td className="py-4 small font-monospace text-secondary">{order.Ov_ID}</td>
                  <td className="py-4 small">{getOrderItemsString(order.ODv_Items)}</td>
                  <td className="py-4 small fw-bold text-primary">{formatAmount(order.Ov_TotalAmount)}</td>
                  <td className="py-4 small text-secondary">{order.Ov_CreatedAt}</td>
                  <td className="py-4">
                    <span className={`badge rounded-pill small ${getStatusStyle(order.Ov_Status)}`}>{formatStatusLabel(order.Ov_Status)}</span>
                  </td>
                  <td className="py-4 text-end">
                    <button onClick={() => handleViewDetails(order)} className="btn btn-link btn-sm text-primary p-0" type="button">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">No orders found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-top bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="small text-secondary">
            Showing {showingFrom}-{showingTo} of {filteredOrders.length} orders
          </span>
          <nav aria-label="Page navigation">
            <ul className="pagination mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-link" type="button">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button onClick={() => handlePageChange(page)} className="page-link" type="button">
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={totalPages === 0 || currentPage === totalPages} className="page-link" type="button">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <button onClick={() => setSelectedStatus('Pending')} className="card btn btn-light border-primary w-100 text-start p-0" type="button">
            <div className="card-body">
              <span className="material-symbols-outlined text-primary fs-2">pending_actions</span>
              <h3 className="card-title fw-bold mt-2">Queue Overview</h3>
              <p className="card-text small text-secondary mb-0">
                {queueOrdersCount} order{queueOrdersCount === 1 ? '' : 's'} are waiting for prep. Kitchen load is {kitchenLoad}%.
              </p>
            </div>
          </button>
        </div>
        <div className="col-md-6 col-lg-4">
          <button onClick={() => setSelectedStatus('Completed')} className="card btn btn-light border-info w-100 text-start p-0" type="button">
            <div className="card-body">
              <span className="material-symbols-outlined text-info fs-2">notifications_active</span>
              <h3 className="card-title fw-bold mt-2">Completed Orders</h3>
              <p className="card-text small text-secondary mb-0">
                {completedOrders.length} order{completedOrders.length === 1 ? '' : 's'} completed.
              </p>
            </div>
          </button>
        </div>
        
        {/* OWNER ONLY: Daily Summary with Revenue */}
        {currentAuthUser?.role === 'Owner' && (
          <div className="col-md-6 col-lg-4">
            <button onClick={() => setSelectedStatus('all')} className="card btn btn-light w-100 text-start p-0" type="button">
              <div className="card-body">
                <span className="material-symbols-outlined text-secondary fs-2">analytics</span>
                <h3 className="card-title fw-bold mt-2">Daily Summary</h3>
                <p className="card-text small text-secondary mb-1">
                  Completed revenue: {formattedCompletedRevenue} from {completedOrders.length} completed order{completedOrders.length === 1 ? '' : 's'}.
                </p>
                <p className="card-text small text-muted mb-0">Queued potential: {formattedQueuedRevenue}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <button className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4" style={{ width: '3.5rem', height: '3.5rem', zIndex: 1000 }} type="button">
        <span className="material-symbols-outlined">print</span>
      </button>

      {/* QR SCANNED ORDER MODAL */}
      {isQrModalOpen && qrScannedOrder && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0">
              <div className="modal-header border-0">
                <div>
                  <h3 className="modal-title fw-bold">QR Scanned Order</h3>
                  <p className="small text-secondary mb-0">Order #{qrScannedOrder.Ov_QueueNumber}</p>
                </div>
                <button onClick={() => setIsQrModalOpen(false)} className="btn-close" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3">Order Information</h4>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <span className="text-secondary">Order ID:</span>
                      <p className="mb-0 fw-bold">{qrScannedOrder.Ov_ID}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Student ID:</span>
                      <p className="mb-0 fw-bold">{qrScannedOrder.Uv_ID}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Status:</span>
                      <p className="mb-0 fw-bold">{qrScannedOrder.Ov_Status}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Payment:</span>
                      <p className="mb-0">
                        <span className={`badge rounded-pill ${qrScannedOrder.Ov_IsPaid ? 'bg-success' : 'bg-danger'}`}>
                          {qrScannedOrder.Ov_IsPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-12">
                      <span className="text-secondary">Created:</span>
                      <p className="mb-0">{qrScannedOrder.Ov_CreatedAt}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3">Ordered Items</h4>
                  <div className="list-group">
                    {qrScannedOrder.ODv_Items.map((item) => (
                      <div key={item.ODv_ID} className="list-group-item">
                        <div className="d-flex gap-3">
                                  {item.SPv_IMG && (
                            <img
                              src={item.SPv_IMG}
                              alt={item.SPv_Name}
                              className="rounded"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                          )}
                          <div className="flex-grow-1">
                            <p className="fw-bold mb-1">{item.SPv_Name}</p>
                            <p className="small text-secondary mb-0">
                              Qty: {item.ODv_Quantity} × ₱{item.ODv_Subtotal / item.ODv_Quantity}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="fw-bold mb-0">₱{item.ODv_Subtotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-light rounded-2 p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Total Amount:</span>
                    <span className="fw-bold display-6">₱{qrScannedOrder.Ov_TotalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 gap-2 flex-wrap">
                <button onClick={() => setIsQrModalOpen(false)} className="btn btn-light flex-grow-1" disabled={qrModalLoading}>
                  Close
                </button>
                {!qrScannedOrder.Ov_IsPaid && (
                  <button
                    onClick={handleQrPaymentConfirm}
                    className="btn btn-success flex-grow-1"
                    disabled={qrModalLoading}
                  >
                    {qrModalLoading ? 'Updating...' : 'Confirm Payment'}
                  </button>
                )}
                {normalizeStatus(qrScannedOrder.Ov_Status) !== 'preparing' && (
                  <button
                    onClick={handleQrMarkPreparing}
                    className="btn btn-warning flex-grow-1"
                    disabled={qrModalLoading}
                  >
                    {qrModalLoading ? 'Updating...' : 'Mark Preparing'}
                  </button>
                )}
                {normalizeStatus(qrScannedOrder.Ov_Status) !== 'completed' && (
                  <button
                    onClick={handleQrMarkCompleted}
                    className="btn btn-primary flex-grow-1"
                    disabled={qrModalLoading}
                  >
                    {qrModalLoading ? 'Updating...' : 'Mark Completed'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal remains completely unchanged */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0">
              <div className="modal-header border-0">
                <div>
                  <h3 className="modal-title fw-bold">Order Details</h3>
                  <p className="small text-secondary mb-0">Order {selectedOrder.Ov_ID}</p>
                </div>
                <button onClick={closeDetailsModal} className="btn-close" aria-label="Close" disabled={isStatusUpdating}></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3">Customer Information</h4>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <span className="text-secondary">Name:</span>
                      <p className="mb-0 fw-bold">{selectedOrder.Uv_FullName}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Student ID:</span>
                      <p className="mb-0 fw-bold">{selectedOrder.Uv_ID}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Email:</span>
                      <p className="mb-0">{selectedOrder.Uv_Email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">restaurant</span>
                    Order Items
                  </h4>
                  <div>
                    {selectedOrder.ODv_Items?.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom small">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-medium">{item.SPv_Name}</span>
                          <span className="text-secondary">x{item.ODv_Quantity}</span>
                        </div>
                        <span className="fw-semibold text-primary">{formatAmount(item.ODv_Subtotal)}</span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top small">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold text-primary fs-5">{formatAmount(selectedOrder.Ov_TotalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Order Details
                  </h4>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <span className="text-secondary">Order Date/Time:</span>
                      <p className="mb-0">{selectedOrder.Ov_CreatedAt}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Payment Method:</span>
                      <p className="mb-0">{selectedOrder.WTv_Type || selectedOrder.Ov_Type || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Status:</span>
                      <select
                        value={formatStatusLabel(selectedOrder.Ov_Status)}
                        onChange={(e) => handleStatusChange(selectedOrder.Ov_ID, e.target.value)}
                        className="form-select form-select-sm mt-1"
                        disabled={isStatusUpdating}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Completed">Completed</option>
                      </select>
                      {isStatusUpdating && <p className="small text-secondary mt-2 mb-0">Updating status...</p>}
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Special Instructions:</span>
                      <p className="mb-0">{selectedOrder.Ov_SpecialInstructions || 'None'}</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 pt-3">
                  <button onClick={closeDetailsModal} className="btn btn-light flex-grow-1" type="button" disabled={isStatusUpdating}>
                    Close
                  </button>
                  <button className="btn btn-primary flex-grow-1" type="button">
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
