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

  useEffect(() => {
    if (csvId) {
      fetchOrders();
    }
  }, [csvId]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch order details with product and order info
      const { data: detailsData, error: detailsError } = await supabase
        .from('tbl_orderdetails')
        .select(`
          odv_id,
          odv_quantity,
          odv_subtotal,
          tbl_order:ov_id (
            ov_id,
            uv_id,
            ov_totalamount,
            ov_type,
            ov_status,
            ov_queuenumber,
            ov_ispaid,
            ov_createdat
          ),
          tbl_storeproducts:spv_id (
            spv_id,
            csv_id,
            spv_name,
            spv_price,
            spv_img
          )
        `);

      if (detailsError) {
        console.error('Error fetching order details:', detailsError);
        setError(detailsError.message);
        return;
      }

      // Filter by csvId and group by order
      const filteredAndGrouped = detailsData
        .filter(detail => detail.tbl_storeproducts?.csv_id === csvId)
        .reduce((grouped, detail) => {
          const orderId = detail.tbl_order.ov_id;
          if (!grouped[orderId]) {
            grouped[orderId] = {
              ov_id: detail.tbl_order.ov_id,
              uv_id: detail.tbl_order.uv_id,
              ov_totalamount: detail.tbl_order.ov_totalamount,
              ov_type: detail.tbl_order.ov_type,
              ov_status: detail.tbl_order.ov_status,
              ov_queuenumber: detail.tbl_order.ov_queuenumber,
              ov_ispaid: detail.tbl_order.ov_ispaid,
              ov_createdat: detail.tbl_order.ov_createdat,
              items: []
            };
          }
          grouped[orderId].items.push({
            odv_id: detail.odv_id,
            spv_id: detail.tbl_storeproducts.spv_id,
            spv_name: detail.tbl_storeproducts.spv_name,
            spv_price: detail.tbl_storeproducts.spv_price,
            spv_img: detail.tbl_storeproducts.spv_img,
            odv_quantity: detail.odv_quantity,
            odv_subtotal: detail.odv_subtotal
          });
          return grouped;
        }, {});

      const ordersArray = Object.values(filteredAndGrouped);
      const uniqueUserIds = [...new Set(ordersArray.map((order) => order.uv_id).filter(Boolean))];
      let usersById = {};

      if (uniqueUserIds.length > 0) {
        const { data: userRows, error: userError } = await supabase
          .from('tbl_user')
          .select('uv_id, uv_firstname, uv_middlename, uv_lastname, uv_email')
          .in('uv_id', uniqueUserIds);

        if (userError) {
          console.error('Error fetching order user details:', userError);
        } else {
          usersById = (userRows || []).reduce((accumulator, userRow) => {
            accumulator[userRow.uv_id] = userRow;
            return accumulator;
          }, {});
        }
      }

      // Transform to match component expectations
      const transformedOrders = ordersArray
        .map((order) => {
          const userRow = usersById[order.uv_id];

          return {
            Ov_ID: order.ov_id,
            Uv_ID: order.uv_id,
            Uv_FullName: buildFullName(userRow, order.uv_id),
            Uv_Email: userRow?.uv_email || 'N/A',
            Ov_TotalAmount: order.ov_totalamount,
            Ov_Type: order.ov_type,
            WTv_Type: order.ov_type,
            Ov_Status: normalizeStatus(order.ov_status || 'pending'),
            Ov_QueueNumber: order.ov_queuenumber,
            Ov_IsPaid: order.ov_ispaid,
            Ov_CreatedAt: formatOrderDate(order.ov_createdat),
            Ov_CreatedAtRaw: order.ov_createdat,
            ODv_Items: order.items.map((item) => ({
              ODv_ID: item.odv_id,
              SPv_Name: item.spv_name,
              SPv_IMG: item.spv_img,
              ODv_Quantity: item.odv_quantity,
              ODv_Subtotal: item.odv_subtotal
            }))
          };
        })
        .sort((a, b) => new Date(b.Ov_CreatedAtRaw) - new Date(a.Ov_CreatedAtRaw));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time subscriptions
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
        console.error('Error updating order status:', error);
        return false;
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.Ov_ID === orderId ? { ...order, Ov_Status: databaseStatus } : order
        )
      );

      await fetchOrders();

      return true;
    } catch (err) {
      console.error('Unexpected error updating order status:', err);
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
        console.error('Error confirming payment:', error);
        return false;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.Ov_ID === orderId ? { ...order, Ov_IsPaid: true } : order
        )
      );

      return true;
    } catch (err) {
      console.error('Unexpected error confirming payment:', err);
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
      const { data, error } = await supabase
        .from('tbl_orderdetails')
        .select(`
          odv_id,
          odv_quantity,
          odv_subtotal,
          tbl_order:ov_id (
            ov_id,
            uv_id,
            ov_totalamount,
            ov_type,
            ov_status,
            ov_queuenumber,
            ov_ispaid,
            ov_createdat
          ),
          tbl_storeproducts:spv_id (
            spv_id,
            csv_id,
            spv_name,
            spv_price,
            spv_img
          )
        `)
        .eq('ov_id', ovId);

      if (error) throw error;

      // Verify all products belong to staff csv_id
      const belongsToStore = data.every(detail => detail.tbl_storeproducts?.csv_id === csvId);
      if (!belongsToStore) {
        throw new Error('Order does not belong to your store');
      }

      if (data.length === 0) {
        throw new Error('Order not found');
      }

      // Transform to single order object
      const order = {
        Ov_ID: data[0].tbl_order.ov_id,
        Uv_ID: data[0].tbl_order.uv_id,
        Ov_TotalAmount: data[0].tbl_order.ov_totalamount,
        Ov_Type: data[0].tbl_order.ov_type,
        WTv_Type: data[0].tbl_order.ov_type,
        Ov_Status: normalizeStatus(data[0].tbl_order.ov_status || 'pending'),
        Ov_QueueNumber: data[0].tbl_order.ov_queuenumber,
        Ov_IsPaid: data[0].tbl_order.ov_ispaid,
        Ov_CreatedAt: formatOrderDate(data[0].tbl_order.ov_createdat),
        ODv_Items: data.map(detail => ({
          ODv_ID: detail.odv_id,
          SPv_Name: detail.tbl_storeproducts.spv_name,
          SPv_IMG: detail.tbl_storeproducts.spv_img,
          ODv_Quantity: detail.odv_quantity,
          ODv_Subtotal: detail.odv_subtotal
        }))
      };

      const { data: userRow, error: userError } = await supabase
        .from('tbl_user')
        .select('uv_id, uv_firstname, uv_middlename, uv_lastname, uv_email')
        .eq('uv_id', order.Uv_ID)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching QR order user details:', userError);
      }

      order.Uv_FullName = buildFullName(userRow, order.Uv_ID);
      order.Uv_Email = userRow?.uv_email || 'N/A';

      return order;
    } catch (err) {
      console.error('Error fetching order by QR:', err);
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
