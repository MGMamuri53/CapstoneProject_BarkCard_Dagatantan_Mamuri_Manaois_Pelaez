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

  useEffect(() => {
    const fetchStaffStore = async () => {
      try {
        console.log('[OrderManagement] === OWNER-BASED STORE LOOKUP ===');
        console.log('[OrderManagement] This page uses OWNER logic, NOT Staff logic');
        console.log('[OrderManagement] Logged-in user:', currentAuthUser);
        console.log('[OrderManagement] User role:', currentAuthUser?.role);
        console.log('[OrderManagement] Owner email:', currentAuthUser?.email);
        
        if (currentAuthUser?.role !== 'Owner') {
          console.error('[OrderManagement] ✗ User is not Owner! Role:', currentAuthUser?.role);
          console.error('[OrderManagement] ✗ Only Owner role can access Order Management');
          setStoreId(null);
          setStoreName('Access Denied - Owner role required');
          return;
        }
        
        const authEmail = String(currentAuthUser?.email || '').trim().toLowerCase();

        if (!authEmail) {
          console.error('[OrderManagement] No email found, cannot fetch store');
          setStoreId(null);
          return;
        }

        console.log('[OrderManagement] ✓ Owner role confirmed');
        console.log('[OrderManagement] Fetching store using: tbl_canteenstore.csv_email =', authEmail);
        const { data: store, error: storeError } = await supabase
          .from('tbl_canteenstore')
          .select('csv_id, csv_name')
          .eq('csv_email', authEmail)
          .maybeSingle();

        console.log('[OrderManagement] Store query result:', store);
        console.log('[OrderManagement] Store query error:', storeError);

        if (store) {
          console.log('[OrderManagement] ✓ Store resolved - csv_id:', store.csv_id, 'csv_name:', store.csv_name);
          console.log('[OrderManagement] Orders will be filtered by: tbl_storeproducts.csv_id =', store.csv_id);
          setStoreId(store.csv_id);
          setStoreName(store.csv_name);
        } else {
          console.error('[OrderManagement] ✗ No store found for Owner email:', authEmail);
          console.error('[OrderManagement] ✗ Owner must be assigned to a store in tbl_canteenstore');
          setStoreId(null);
          setStoreName('No store assigned');
        }
      } catch (err) {
        console.error('[OrderManagement] Error fetching staff store:', err);
      }
    };

    if (currentAuthUser?.email) {
      fetchStaffStore();
    }
  }, [currentAuthUser?.email, currentAuthUser?.role]);

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
      : searchFilteredOrders.filter((order) => {
          const orderStatus = normalizeStatus(order.Ov_Status);
          const filterStatus = normalizeStatus(selectedStatus);
          const match = orderStatus === filterStatus;
          if (!match) {
            console.log('[Filter] Order', order.Ov_ID, 'status:', orderStatus, 'does not match filter:', filterStatus);
          }
          return match;
        });

  console.log('[Filter] === STATUS FILTERING ===');
  console.log('[Filter] Selected status filter:', selectedStatus);
  console.log('[Filter] Total orders before filter:', searchFilteredOrders.length);
  console.log('[Filter] Total orders after filter:', filteredOrders.length);
  console.log('[Filter] Filtered out:', searchFilteredOrders.length - filteredOrders.length, 'orders');

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
      console.log('[QR Scan] === SCAN ORDER (NO DEDUCTION YET) ===');
      console.log('[QR Scan] Scanned order ID:', ovId);

      // Fetch order and validate it belongs to store
      const scannedOrder = await fetchOrderByQr(ovId);
      
      if (!scannedOrder) {
        console.error('[QR Scan] Order not found or does not belong to store');
        throw new Error('Order not found or does not belong to your store');
      }

      console.log('[QR Scan] Order fetched successfully');
      console.log('[QR Scan] Order ov_ispaid:', scannedOrder.Ov_IsPaid);
      console.log('[QR Scan] Order status:', scannedOrder.Ov_Status);
      console.log('[QR Scan] Order total:', scannedOrder.Ov_TotalAmount);
      console.log('[QR Scan] Opening confirmation modal - NO balance deduction yet');
      
      setQrScannedOrder(scannedOrder);
      setIsQrModalOpen(true);
      setQrInput('');
    } catch (err) {
      console.error('[QR Scan] Error:', err.message || err);
      alert(err.message || 'Failed to fetch order. Please try again.');
      setQrInput('');
      scanInputRef.current?.focus();
    } finally {
      setQrModalLoading(false);
    }
  };

  const handleQrPaymentConfirm = async () => {
    if (!qrScannedOrder) return;
    setQrModalLoading(true);
    try {
      console.log('[QR Payment] === CONFIRM PAYMENT (DEDUCT BALANCE) ===');
      console.log('[QR Payment] Order ID:', qrScannedOrder.Ov_ID);
      console.log('[QR Payment] Order ov_ispaid before action:', qrScannedOrder.Ov_IsPaid);

      // Check if already paid
      if (qrScannedOrder.Ov_IsPaid) {
        console.log('[QR Payment] Order already paid, skipping deduction');
        alert('Order already paid.');
        return;
      }

      const studentUvId = qrScannedOrder.Uv_ID;
      const totalAmount = parseFloat(qrScannedOrder.Ov_TotalAmount);

      console.log('[QR Payment] Student uv_id:', studentUvId);
      console.log('[QR Payment] Order total:', totalAmount);

      // Fetch current balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('tbl_student_balance')
        .select('sv_balance')
        .eq('uv_id', studentUvId)
        .maybeSingle();

      if (balanceError || !balanceData) {
        console.error('[QR Payment] Balance fetch error:', balanceError);
        throw new Error('Student balance record not found');
      }

      const currentBalance = parseFloat(balanceData.sv_balance || 0);
      console.log('[QR Payment] Current sv_balance:', currentBalance);

      // Check sufficient balance
      if (currentBalance < totalAmount) {
        console.error('[QR Payment] INSUFFICIENT BALANCE');
        console.error('[QR Payment] Required:', totalAmount, 'Available:', currentBalance);
        throw new Error(`Insufficient balance.\nRequired: ₱${totalAmount.toFixed(2)}\nAvailable: ₱${currentBalance.toFixed(2)}`);
      }

      // Deduct balance
      const newBalance = currentBalance - totalAmount;
      console.log('[QR Payment] New sv_balance:', newBalance);

      const { error: balanceUpdateError } = await supabase
        .from('tbl_student_balance')
        .update({
          sv_balance: newBalance,
          sv_updated_at: new Date().toISOString()
        })
        .eq('uv_id', studentUvId);

      if (balanceUpdateError) {
        console.error('[QR Payment] Balance update error:', balanceUpdateError);
        throw new Error('Failed to update balance: ' + balanceUpdateError.message);
      }

      console.log('[QR Payment] ✓ Balance updated successfully');

      // Insert transaction
      const { error: transactionError } = await supabase
        .from('tbl_transactions')
        .insert({
          uv_id: studentUvId,
          tv_type: 'debit',
          tv_amount: totalAmount,
          tv_merchant: 'Canteen',
          tv_description: `Canteen order payment - Order #${qrScannedOrder.Ov_ID}`
        });

      if (transactionError) {
        console.error('[QR Payment] Transaction insert error:', transactionError);
      } else {
        console.log('[QR Payment] ✓ Transaction inserted');
      }

      // Update order
      const { error: orderUpdateError } = await supabase
        .from('tbl_order')
        .update({
          ov_ispaid: true
        })
        .eq('ov_id', qrScannedOrder.Ov_ID);

      if (orderUpdateError) {
        console.error('[QR Payment] Order update error:', orderUpdateError);
        throw new Error('Failed to update order: ' + orderUpdateError.message);
      }

      console.log('[QR Payment] ✓ Order marked as paid');
      console.log('[QR Payment] Deducted:', totalAmount, 'New balance:', newBalance);

      // Refresh order
      const updatedOrder = await fetchOrderByQr(qrScannedOrder.Ov_ID);
      setQrScannedOrder(updatedOrder);
      await refetch();

      alert(`✓ Payment confirmed!\n\nDeducted: ₱${totalAmount.toFixed(2)}\nNew Balance: ₱${newBalance.toFixed(2)}`);
    } catch (err) {
      console.error('[QR Payment] Error:', err.message || err);
      alert(err.message || 'Failed to confirm payment');
    } finally {
      setQrModalLoading(false);
    }
  };

  const handleQrMarkPreparing = async () => {
    if (!qrScannedOrder) return;
    setQrModalLoading(true);
    try {
      console.log('[QR Mark Preparing] === MARK PREPARING (STATUS ONLY) ===');
      console.log('[QR Mark Preparing] Order ID:', qrScannedOrder.Ov_ID);
      console.log('[QR Mark Preparing] Current status:', qrScannedOrder.Ov_Status);
      
      const { error } = await supabase
        .from('tbl_order')
        .update({ ov_status: 'Preparing' })
        .eq('ov_id', Number(qrScannedOrder.Ov_ID));
      
      if (error) {
        console.error('[QR Mark Preparing] Update error:', error);
        throw error;
      }
      
      console.log('[QR Mark Preparing] ✓ Status updated to Preparing');
      
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
    if (!qrScannedOrder) {
      console.error('[Mark Complete] No order selected');
      return;
    }

    setQrModalLoading(true);
    try {
      console.log('[Mark Complete] ========================================');
      console.log('[Mark Complete] === MARK COMPLETED (DEDUCT + UPDATE) ===');
      console.log('[Mark Complete] ========================================');
      
      // Step 1: Get selected order details
      console.log('[Mark Complete] Step 1: Get selected order');
      const selectedOrderData = {
        ov_id: qrScannedOrder.Ov_ID,
        uv_id: qrScannedOrder.Uv_ID,
        ov_totalamount: qrScannedOrder.Ov_TotalAmount,
        ov_ispaid: qrScannedOrder.Ov_IsPaid
      };
      console.log('[Mark Complete] Selected order:', selectedOrderData);
      console.log('[Mark Complete]   - Order ID (ov_id):', selectedOrderData.ov_id);
      console.log('[Mark Complete]   - Student ID (uv_id):', selectedOrderData.uv_id);
      console.log('[Mark Complete]   - Total Amount (ov_totalamount):', selectedOrderData.ov_totalamount);
      console.log('[Mark Complete]   - Is Paid (ov_ispaid):', selectedOrderData.ov_ispaid);

      // Step 2: Check if already paid
      if (selectedOrderData.ov_ispaid) {
        console.log('[Mark Complete] Step 2: Order already paid - STOPPING');
        alert('Order already paid.');
        return;
      }
      console.log('[Mark Complete] Step 2: Order not paid yet - proceeding with deduction');

      // Step 3: Fetch student balance
      console.log('[Mark Complete] Step 3: Fetch student balance from tbl_student_balance');
      console.log('[Mark Complete]   Query: SELECT sv_balance FROM tbl_student_balance WHERE uv_id =', selectedOrderData.uv_id);
      
      const { data: balanceData, error: balanceError } = await supabase
        .from('tbl_student_balance')
        .select('sv_balance')
        .eq('uv_id', selectedOrderData.uv_id)
        .single();

      console.log('[Mark Complete]   Balance query result:', balanceData);
      console.log('[Mark Complete]   Balance query error:', balanceError);

      if (balanceError || !balanceData) {
        console.error('[Mark Complete] ERROR: Student balance record not found');
        console.error('[Mark Complete]   Error details:', balanceError);
        throw new Error('Student balance record not found');
      }

      const currentBalance = Number(balanceData.sv_balance);
      console.log('[Mark Complete]   Current sv_balance:', currentBalance);

      // Step 4: Compute new balance
      console.log('[Mark Complete] Step 4: Compute new balance');
      const orderTotal = Number(selectedOrderData.ov_totalamount);
      const newBalance = currentBalance - orderTotal;
      console.log('[Mark Complete]   Current balance:', currentBalance);
      console.log('[Mark Complete]   Order total:', orderTotal);
      console.log('[Mark Complete]   New balance:', newBalance);

      // Step 5: Check sufficient balance
      if (newBalance < 0) {
        console.error('[Mark Complete] Step 5: INSUFFICIENT BALANCE - STOPPING');
        console.error('[Mark Complete]   Required:', orderTotal);
        console.error('[Mark Complete]   Available:', currentBalance);
        console.error('[Mark Complete]   Shortfall:', Math.abs(newBalance));
        throw new Error(`Insufficient balance.\nRequired: ₱${orderTotal.toFixed(2)}\nAvailable: ₱${currentBalance.toFixed(2)}`);
      }
      console.log('[Mark Complete] Step 5: Sufficient balance - proceeding');

      // Step 6: Update student balance
      console.log('[Mark Complete] Step 6: Update tbl_student_balance');
      console.log('[Mark Complete]   UPDATE tbl_student_balance');
      console.log('[Mark Complete]   SET sv_balance =', newBalance);
      console.log('[Mark Complete]   SET sv_updated_at =', new Date().toISOString());
      console.log('[Mark Complete]   WHERE uv_id =', selectedOrderData.uv_id);
      
      const { data: balanceUpdateData, error: balanceUpdateError } = await supabase
        .from('tbl_student_balance')
        .update({
          sv_balance: newBalance,
          sv_updated_at: new Date().toISOString(),
        })
        .eq('uv_id', selectedOrderData.uv_id)
        .select();

      console.log('[Mark Complete] balance update data:', balanceUpdateData);
      console.log('[Mark Complete] balance update error:', balanceUpdateError);

      if (balanceUpdateError) {
        console.error('[Mark Complete] ERROR: Failed to update balance');
        console.error('[Mark Complete]   Error code:', balanceUpdateError.code);
        console.error('[Mark Complete]   Error message:', balanceUpdateError.message);
        console.error('[Mark Complete]   Error details:', balanceUpdateError.details);
        console.error('[Mark Complete]   Error hint:', balanceUpdateError.hint);
        console.error('[Mark Complete]   Full error object:', JSON.stringify(balanceUpdateError, null, 2));
        
        // Check if it's an RLS policy error
        if (balanceUpdateError.code === '42501' || balanceUpdateError.message?.includes('policy')) {
          console.error('[Mark Complete]   *** RLS POLICY ERROR DETECTED ***');
          console.error('[Mark Complete]   The Owner role may not have permission to update tbl_student_balance');
          console.error('[Mark Complete]   Please check Supabase RLS policies for tbl_student_balance table');
        }
        
        throw new Error('Failed to update balance: ' + balanceUpdateError.message);
      }

      // Verify the update actually happened
      console.log('[Mark Complete]   Verifying balance update...');
      const { data: verifyBalance, error: verifyError } = await supabase
        .from('tbl_student_balance')
        .select('sv_balance')
        .eq('uv_id', selectedOrderData.uv_id)
        .single();
      
      console.log('[Mark Complete]   Verification query result:', verifyBalance);
      console.log('[Mark Complete]   Verification query error:', verifyError);
      
      if (verifyBalance) {
        const verifiedBalance = Number(verifyBalance.sv_balance);
        console.log('[Mark Complete]   Verified sv_balance from DB:', verifiedBalance);
        console.log('[Mark Complete]   Expected sv_balance:', newBalance);
        console.log('[Mark Complete]   Balance matches:', verifiedBalance === newBalance);
        
        if (verifiedBalance !== newBalance) {
          console.error('[Mark Complete]   *** WARNING: Balance did not update! ***');
          console.error('[Mark Complete]   Expected:', newBalance);
          console.error('[Mark Complete]   Actual:', verifiedBalance);
          throw new Error('Balance update verification failed. Balance did not change in database.');
        }
      }

      console.log('[Mark Complete]   ✓ Balance updated successfully');
      console.log('[Mark Complete]   ✓ Old balance:', currentBalance);
      console.log('[Mark Complete]   ✓ New balance:', newBalance);
      console.log('[Mark Complete]   ✓ Deducted:', orderTotal);

      // Step 7: Insert debit transaction
      console.log('[Mark Complete] Step 7: Insert debit transaction into tbl_transactions');
      const transactionData = {
        uv_id: selectedOrderData.uv_id,
        tv_type: 'debit',
        tv_amount: orderTotal,
        tv_merchant: 'Canteen',
        tv_description: `Canteen order payment - Order #${selectedOrderData.ov_id}`
      };
      console.log('[Mark Complete]   Transaction data:', transactionData);

      const { data: transactionResult, error: transactionError } = await supabase
        .from('tbl_transactions')
        .insert(transactionData)
        .select();

      console.log('[Mark Complete]   Transaction insert result:', transactionResult);
      console.log('[Mark Complete]   Transaction insert error:', transactionError);

      if (transactionError) {
        console.error('[Mark Complete] WARNING: Transaction insert failed (non-critical)');
        console.error('[Mark Complete]   Error details:', transactionError);
      } else {
        console.log('[Mark Complete]   ✓ Transaction inserted successfully');
      }

      // Step 8: Update order status and payment
      console.log('[Mark Complete] Step 8: Update tbl_order');
      console.log('[Mark Complete]   UPDATE tbl_order');
      console.log('[Mark Complete]   SET ov_ispaid = true, ov_status = Completed');
      console.log('[Mark Complete]   WHERE ov_id =', selectedOrderData.ov_id);

      const { data: orderUpdateData, error: orderUpdateError } = await supabase
        .from('tbl_order')
        .update({
          ov_status: 'Completed',
          ov_ispaid: true
        })
        .eq('ov_id', Number(selectedOrderData.ov_id))
        .select();

      console.log('[Mark Complete]   Order update result:', orderUpdateData);
      console.log('[Mark Complete]   Order update error:', orderUpdateError);

      if (orderUpdateError) {
        console.error('[Mark Complete] ERROR: Failed to update order');
        console.error('[Mark Complete]   Error details:', orderUpdateError);
        throw new Error('Failed to update order: ' + orderUpdateError.message);
      }

      console.log('[Mark Complete]   ✓ Order status updated to Completed');
      console.log('[Mark Complete]   ✓ Order marked as paid');

      // Step 9: Refresh orders list
      console.log('[Mark Complete] Step 9: Refresh orders list');
      const updatedOrder = await fetchOrderByQr(selectedOrderData.ov_id);
      setQrScannedOrder(updatedOrder);
      await refetch();
      console.log('[Mark Complete]   ✓ Orders list refreshed');

      // Show success message
      console.log('[Mark Complete] ========================================');
      console.log('[Mark Complete] === SUCCESS ===');
      console.log('[Mark Complete]   Order ID:', selectedOrderData.ov_id);
      console.log('[Mark Complete]   Student ID:', selectedOrderData.uv_id);
      console.log('[Mark Complete]   Deducted:', orderTotal);
      console.log('[Mark Complete]   Old Balance:', currentBalance);
      console.log('[Mark Complete]   New Balance:', newBalance);
      console.log('[Mark Complete] ========================================');

      alert(`✓ Order completed and paid!\n\nDeducted: ₱${orderTotal.toFixed(2)}\nNew Balance: ₱${newBalance.toFixed(2)}`);

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setIsQrModalOpen(false);
        scanInputRef.current?.focus();
      }, 2000);
    } catch (err) {
      console.error('[Mark Complete] ========================================');
      console.error('[Mark Complete] === FAILED ===');
      console.error('[Mark Complete]   Error:', err.message || err);
      console.error('[Mark Complete]   Stack:', err.stack);
      console.error('[Mark Complete] ========================================');
      alert(err.message || 'Failed to complete order');
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

      // Step 1: Fetch order details to check payment status and get student uv_id
      const { data: orderData, error: orderFetchError } = await supabase
        .from('tbl_order')
        .select('ov_id, uv_id, ov_totalamount, ov_status, ov_ispaid')
        .eq('ov_id', Number(orderId))
        .maybeSingle();

      if (orderFetchError || !orderData) {
        console.error('[Order Status Change] Failed to fetch order:', orderFetchError);
        throw new Error('Failed to fetch order details');
      }

      console.log('[Order Status Change] Order data:', orderData);
      console.log('[Order Status Change] Current ov_ispaid:', orderData.ov_ispaid);
      console.log('[Order Status Change] Should mark paid:', shouldMarkPaid);

      // Step 2: If marking as paid and not already paid, deduct balance
      if (shouldMarkPaid && !orderData.ov_ispaid) {
        const studentUvId = orderData.uv_id;
        const totalAmount = parseFloat(orderData.ov_totalamount);

        console.log('[Order Status Change] === BALANCE DEDUCTION ===');
        console.log('[Order Status Change] Order ID:', orderId);
        console.log('[Order Status Change] Student uv_id:', studentUvId);
        console.log('[Order Status Change] Order total:', totalAmount);

        // Fetch current student balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('tbl_student_balance')
          .select('sv_balance, sv_updated_at')
          .eq('uv_id', studentUvId)
          .maybeSingle();

        if (balanceError || !balanceData) {
          console.error('[Order Status Change] Balance fetch error:', balanceError);
          throw new Error('Student balance record not found');
        }

        const currentBalance = parseFloat(balanceData.sv_balance || 0);
        console.log('[Order Status Change] Current sv_balance:', currentBalance);

        // Check sufficient balance
        if (currentBalance < totalAmount) {
          console.error('[Order Status Change] INSUFFICIENT BALANCE');
          console.error('[Order Status Change] Required:', totalAmount, 'Available:', currentBalance);
          throw new Error(`Insufficient balance. Required: ₱${totalAmount.toFixed(2)}, Available: ₱${currentBalance.toFixed(2)}`);
        }

        // Deduct balance
        const newBalance = currentBalance - totalAmount;
        console.log('[Order Status Change] New sv_balance:', newBalance);

        const { error: balanceUpdateError } = await supabase
          .from('tbl_student_balance')
          .update({
            sv_balance: newBalance,
            sv_updated_at: new Date().toISOString()
          })
          .eq('uv_id', studentUvId);

        if (balanceUpdateError) {
          console.error('[Order Status Change] Balance update error:', balanceUpdateError);
          throw new Error('Failed to update balance: ' + balanceUpdateError.message);
        }

        console.log('[Order Status Change] ✓ Balance updated successfully');
        console.log('[Order Status Change] Deducted:', totalAmount, 'New balance:', newBalance);

        // Insert transaction record
        const { error: transactionError } = await supabase
          .from('tbl_transactions')
          .insert({
            uv_id: studentUvId,
            tv_type: 'debit',
            tv_amount: totalAmount,
            tv_merchant: 'Canteen',
            tv_description: `Canteen order payment - Order #${orderId}`
          });

        if (transactionError) {
          console.error('[Order Status Change] Transaction insert error:', transactionError);
          // Don't throw - transaction is for history only
        } else {
          console.log('[Order Status Change] ✓ Transaction record inserted');
        }
      } else if (orderData.ov_ispaid) {
        console.log('[Order Status Change] Order already paid, skipping balance deduction');
      } else {
        console.log('[Order Status Change] Not marking as paid, skipping balance deduction');
      }

      // Step 3: Update order status
      const { data, error: updateError } = await supabase
        .from('tbl_order')
        .update({
          ov_status: normalizedNewStatus,
          ...(shouldMarkPaid ? { ov_ispaid: true } : {})
        })
        .eq('ov_id', Number(orderId))
        .select('ov_id, ov_status, ov_ispaid');

      console.log('[Order Status Change] Order updated:', data);
      console.log('[Order Status Change] Update error:', updateError);

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
