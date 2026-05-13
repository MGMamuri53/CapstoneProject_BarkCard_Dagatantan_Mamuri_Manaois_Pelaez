import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();

const formatOrderDate = (value) => {
  if (!value) return 'N/A';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString('en-PH');
};

const buildFullName = (userRow, fallbackUvId) => {
  const nameParts = [
    userRow?.uv_firstname,
    userRow?.uv_middlename,
    userRow?.uv_lastname
  ]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean);

  if (nameParts.length > 0) {
    return nameParts.join(' ');
  }

  return fallbackUvId ? `Student ${fallbackUvId}` : 'Student';
};

export const useOrders = (csvId = null) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('[useOrders] === OWNER-BASED ORDER HOOK ===');
  console.log('[useOrders] Hook initialized with store csv_id:', csvId);
  console.log('[useOrders] This hook uses OWNER logic, NOT Staff logic');
  console.log('[useOrders] Orders filtered by: tbl_storeproducts.csv_id ==', csvId);

  useEffect(() => {
    if (csvId) {
      console.log('[useOrders] csvId changed, fetching orders for store:', csvId);
      fetchOrders();
    } else {
      console.log('[useOrders] No csvId provided, skipping fetch');
    }
  }, [csvId]);

  const fetchOrders = async () => {
    if (!csvId) {
      console.log('[useOrders] No csvId provided, skipping fetch');
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useOrders] === FETCHING ORDERS FOR STORE ===');
      console.log('[useOrders] Store csv_id:', csvId);

      // Query tbl_order directly by csv_id
      const { data: directOrders, error: directError } = await supabase
        .from('tbl_order')
        .select('*')
        .eq('csv_id', csvId);

      console.log('[useOrders] Orders fetched from tbl_order:', directOrders?.length || 0);

      if (directError) {
        console.error('[useOrders] Error fetching orders:', directError);
        setError(directError.message);
        return;
      }

      if (!directOrders || directOrders.length === 0) {
        console.log('[useOrders] No orders found for store csv_id:', csvId);
        setOrders([]);
        return;
      }

      console.log('[useOrders] Sample order:', directOrders[0]);

      // Fetch order details for each order
      const orderIds = directOrders.map(o => o.ov_id);

      const { data: detailsData, error: detailsError } = await supabase
        .from('tbl_orderdetails')
        .select(`
          odv_id,
          ov_id,
          odv_quantity,
          odv_subtotal,
          tbl_storeproducts:spv_id (
            spv_id,
            csv_id,
            spv_name,
            spv_price,
            spv_img
          )
        `)
        .in('ov_id', orderIds);

      if (detailsError) {
        console.error('[useOrders] Error fetching order details:', detailsError);
      }

      // Group details by order
      const detailsByOrder = {};
      if (detailsData) {
        detailsData.forEach(detail => {
          const orderId = detail.ov_id;
          if (!detailsByOrder[orderId]) {
            detailsByOrder[orderId] = [];
          }
          detailsByOrder[orderId].push({
            odv_id: detail.odv_id,
            spv_name: detail.tbl_storeproducts?.spv_name || 'Unknown Item',
            spv_img: detail.tbl_storeproducts?.spv_img,
            odv_quantity: detail.odv_quantity,
            odv_subtotal: detail.odv_subtotal
          });
        });
      }

      // Fetch user info
      const uniqueUserIds = [...new Set(directOrders.map(o => o.uv_id).filter(Boolean))];
      let usersById = {};

      if (uniqueUserIds.length > 0) {
        const { data: userRows, error: userError } = await supabase
          .from('tbl_user')
          .select('uv_id, uv_firstname, uv_middlename, uv_lastname, uv_email')
          .in('uv_id', uniqueUserIds);

        if (userError) {
          console.error('[useOrders] Error fetching users:', userError);
        } else {
          usersById = (userRows || []).reduce((acc, u) => {
            acc[u.uv_id] = u;
            return acc;
          }, {});
        }
      }

      // Transform orders
      const transformedOrders = directOrders.map(order => {
        const userRow = usersById[order.uv_id];
        const items = detailsByOrder[order.ov_id] || [];

        // Normalize status to proper case
        const rawStatus = String(order.ov_status || 'pending').trim();
        const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

        return {
          Ov_ID: order.ov_id,
          Uv_ID: order.uv_id,
          Uv_FullName: buildFullName(userRow, order.uv_id),
          Uv_Email: userRow?.uv_email || 'N/A',
          Ov_TotalAmount: order.ov_totalamount,
          Ov_Type: order.ov_type,
          WTv_Type: order.ov_type,
          Ov_Status: normalizedStatus,
          Ov_QueueNumber: order.ov_queuenumber,
          Ov_IsPaid: order.ov_ispaid,
          Ov_CreatedAt: formatOrderDate(order.ov_createdat),
          Ov_CreatedAtRaw: order.ov_createdat,
          ODv_Items: items
        };
      }).sort((a, b) => new Date(b.Ov_CreatedAtRaw) - new Date(a.Ov_CreatedAtRaw));

      console.log('[useOrders] Final transformed orders:', transformedOrders.length);

      setOrders(transformedOrders);
    } catch (err) {
      console.error('[useOrders] Unexpected error:', err);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!csvId) return;

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tbl_orderdetails'
        },
        () => {
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tbl_order'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [csvId]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const databaseStatus = normalizeStatus(newStatus || 'pending');
      const { error } = await supabase
        .from('tbl_order')
        .update({ ov_status: databaseStatus })
        .eq('ov_id', orderId);

      if (error) {
        console.error('[useOrders] Error updating order status:', error);
        return false;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.Ov_ID === orderId ? { ...order, Ov_Status: databaseStatus } : order
        )
      );

      await fetchOrders();

      return true;
    } catch (err) {
      console.error('[useOrders] Unexpected error updating order status:', err);
      return false;
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      const { error } = await supabase
        .from('tbl_order')
        .update({ ov_ispaid: true })
        .eq('ov_id', orderId);

      if (error) {
        console.error('[useOrders] Error confirming payment:', error);
        return false;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.Ov_ID === orderId ? { ...order, Ov_IsPaid: true } : order
        )
      );

      return true;
    } catch (err) {
      console.error('[useOrders] Unexpected error confirming payment:', err);
      return false;
    }
  };

  const markAsPreparing = async (orderId) => {
    return updateOrderStatus(orderId, 'preparing');
  };

  const markAsCompleted = async (orderId) => {
    return updateOrderStatus(orderId, 'completed');
  };

  const fetchOrderByQr = async (ovId) => {
    try {
      console.log('[useOrders] === QR SCANNER VALIDATION ===');
      console.log('[useOrders] Scanned order ID:', ovId);
      console.log('[useOrders] Owner store csv_id:', csvId);

      // Fetch order directly from tbl_order
      const { data: orderData, error: orderError } = await supabase
        .from('tbl_order')
        .select('*')
        .eq('ov_id', ovId)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        console.error('[useOrders] Order not found:', ovId);
        throw new Error('Order not found');
      }

      console.log('[useOrders] Order fetched:', orderData);
      console.log('[useOrders] Order csv_id:', orderData.csv_id);

      // Validate order belongs to this store using csv_id
      const orderCsvId = String(orderData.csv_id || '').trim();
      const storeCsvId = String(csvId || '').trim();

      console.log('[useOrders] Comparing csv_ids:');
      console.log('[useOrders]   Order csv_id (trimmed):', orderCsvId);
      console.log('[useOrders]   Store csv_id (trimmed):', storeCsvId);
      console.log('[useOrders]   Match:', orderCsvId === storeCsvId);

      if (orderCsvId !== storeCsvId) {
        console.error('[useOrders] Order does not belong to this store');
        console.error('[useOrders]   Expected csv_id:', storeCsvId);
        console.error('[useOrders]   Got csv_id:', orderCsvId);
        throw new Error('Order does not belong to your store');
      }

      console.log('[useOrders] ✓ Order belongs to this store');

      // Fetch order details
      const { data: detailsData, error: detailsError } = await supabase
        .from('tbl_orderdetails')
        .select(`
          odv_id,
          odv_quantity,
          odv_subtotal,
          tbl_storeproducts:spv_id (
            spv_id,
            csv_id,
            spv_name,
            spv_price,
            spv_img
          )
        `)
        .eq('ov_id', ovId);

      if (detailsError) throw detailsError;

      // Normalize status
      const rawStatus = String(orderData.ov_status || 'pending').trim();
      const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      const order = {
        Ov_ID: orderData.ov_id,
        Uv_ID: orderData.uv_id,
        Ov_TotalAmount: orderData.ov_totalamount,
        Ov_Type: orderData.ov_type,
        WTv_Type: orderData.ov_type,
        Ov_Status: normalizedStatus,
        Ov_QueueNumber: orderData.ov_queuenumber,
        Ov_IsPaid: orderData.ov_ispaid,
        Ov_CreatedAt: formatOrderDate(orderData.ov_createdat),
        ODv_Items: (detailsData || []).map(detail => ({
          ODv_ID: detail.odv_id,
          SPv_Name: detail.tbl_storeproducts?.spv_name || 'Unknown Item',
          SPv_IMG: detail.tbl_storeproducts?.spv_img,
          ODv_Quantity: detail.odv_quantity,
          ODv_Subtotal: detail.odv_subtotal
        }))
      };

      // Fetch user info
      const { data: userRow, error: userError } = await supabase
        .from('tbl_user')
        .select('uv_id, uv_firstname, uv_middlename, uv_lastname, uv_email')
        .eq('uv_id', order.Uv_ID)
        .maybeSingle();

      if (userError) {
        console.error('[useOrders] Error fetching user details:', userError);
      }

      order.Uv_FullName = buildFullName(userRow, order.Uv_ID);
      order.Uv_Email = userRow?.uv_email || 'N/A';

      console.log('[useOrders] ✓ QR order validated and fetched successfully');

      return order;
    } catch (err) {
      console.error('[useOrders] QR scanner validation failed:', err);
      throw err;
    }
  };

  return {
    orders,
    setOrders,
    isLoading,
    error,
    updateOrderStatus,
    confirmPayment,
    markAsPreparing,
    markAsCompleted,
    fetchOrderByQr,
    refetch: fetchOrders
  };
};
