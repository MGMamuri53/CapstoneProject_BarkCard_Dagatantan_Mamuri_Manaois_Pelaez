import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch orders with user and order details
      const { data: ordersData, error: ordersError } = await supabase
        .from('tbl_order')
        .select(`
          ov_id,
          uv_id,
          ov_totalamount,
          ov_type,
          ov_status,
          ov_queuenumber,
          ov_ispaid,
          ov_createdat,
          tbl_user:uv_id (
            uv_id,
            uv_firstname,
            uv_lastname,
            uv_email
          )
        `)
        .order('ov_createdat', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError(ordersError.message);
        return;
      }

      // Fetch order details for all orders
      const { data: detailsData, error: detailsError } = await supabase
        .from('tbl_orderdetails')
        .select(`
          odv_id,
          ov_id,
          spv_id,
          odv_quantity,
          odv_subtotal,
          tbl_storeproducts:spv_id (
            spv_id,
            spv_name,
            spv_price
          )
        `);

      if (detailsError) {
        console.error('Error fetching order details:', detailsError);
      }

      // Map order details by order ID
      const detailsByOrderId = {};
      if (detailsData) {
        detailsData.forEach((detail) => {
          if (!detailsByOrderId[detail.ov_id]) {
            detailsByOrderId[detail.ov_id] = [];
          }
          detailsByOrderId[detail.ov_id].push(detail);
        });
      }

      // Transform and combine data to match component expectations
      const transformedOrders = ordersData.map((order) => ({
        Ov_ID: order.ov_id,
        Uv_ID: order.uv_id,
        Uv_FullName: order.tbl_user
          ? `${order.tbl_user.uv_firstname} ${order.tbl_user.uv_lastname}`.trim()
          : 'Unknown',
        Uv_Email: order.tbl_user?.uv_email || 'N/A',
        Ov_TotalAmount: order.ov_totalamount,
        Ov_Type: order.ov_type,
        Ov_Status: order.ov_status || 'Pending',
        Ov_QueueNumber: order.ov_queuenumber,
        Ov_IsPaid: order.ov_ispaid,
        Ov_CreatedAt: new Date(order.ov_createdat).toLocaleString('en-PH'),
        ODv_Items: (detailsByOrderId[order.ov_id] || []).map((detail) => ({
          ODv_ID: detail.odv_id,
          SPv_Name: detail.tbl_storeproducts?.spv_name || 'Unknown Item',
          ODv_Quantity: detail.odv_quantity,
          ODv_Subtotal: detail.odv_subtotal
        }))
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tbl_order')
        .update({ ov_status: newStatus })
        .eq('ov_id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        return false;
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.Ov_ID === orderId ? { ...order, Ov_Status: newStatus } : order
        )
      );

      return true;
    } catch (err) {
      console.error('Unexpected error updating order:', err);
      return false;
    }
  };

  return {
    orders,
    setOrders,
    isLoading,
    error,
    updateOrderStatus,
    refetch: fetchOrders
  };
};
