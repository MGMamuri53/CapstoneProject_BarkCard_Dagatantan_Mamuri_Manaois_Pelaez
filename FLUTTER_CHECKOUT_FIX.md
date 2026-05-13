# Flutter Checkout csv_id Fix

## Issue
Latest mobile orders are not showing in Owner Dashboard/Order Management because `tbl_order.csv_id` is NULL when orders are created from Flutter mobile app.

## Root Cause
Flutter checkout is not inserting the `csv_id` (canteen store ID) when creating orders in `tbl_order`.

## Required Fix in Flutter

### 1. Ensure Store Selection Before Checkout

In your Flutter canteen/store selection screen:

```dart
// Store the selected canteen store ID
int? selectedStoreId;
String? selectedStoreName;

// When user selects a canteen store
void selectStore(int csvId, String csvName) {
  setState(() {
    selectedStoreId = csvId;
    selectedStoreName = csvName;
  });
}
```

### 2. Block Checkout if No Store Selected

Before allowing checkout, validate that a store is selected:

```dart
Future<void> proceedToCheckout() async {
  if (selectedStoreId == null) {
    // Show error dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('No Store Selected'),
        content: Text('Please select a canteen store before placing your order.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('OK'),
          ),
        ],
      ),
    );
    return;
  }
  
  // Proceed with checkout
  await createOrder();
}
```

### 3. Include csv_id in Order Insert

When inserting into `tbl_order`, include the `csv_id`:

```dart
Future<void> createOrder() async {
  try {
    // Validate store is selected
    if (selectedStoreId == null) {
      throw Exception('No canteen store selected');
    }

    // Calculate total
    double totalAmount = calculateCartTotal();
    
    // Insert order with csv_id
    final orderResponse = await supabase
        .from('tbl_order')
        .insert({
          'uv_id': currentUserId,
          'csv_id': selectedStoreId,  // ← CRITICAL: Include store ID
          'ov_totalamount': totalAmount,
          'ov_status': 'Pending',
          'ov_ispaid': false,
          'ov_type': 'Mobile',
          'ov_createdat': DateTime.now().toIso8601String(),
        })
        .select()
        .single();

    final orderId = orderResponse['ov_id'];
    
    // Insert order details
    for (var item in cartItems) {
      await supabase.from('tbl_orderdetails').insert({
        'ov_id': orderId,
        'spv_id': item.productId,
        'odv_quantity': item.quantity,
        'odv_subtotal': item.price * item.quantity,
      });
    }
    
    // Show success
    print('Order created successfully with csv_id: $selectedStoreId');
    
  } catch (e) {
    print('Error creating order: $e');
    // Show error to user
  }
}
```

### 4. Verify Store Products Match Store

Ensure all products in the cart belong to the selected store:

```dart
Future<bool> validateCartProducts() async {
  if (selectedStoreId == null) return false;
  
  for (var item in cartItems) {
    final productResponse = await supabase
        .from('tbl_storeproducts')
        .select('csv_id')
        .eq('spv_id', item.productId)
        .single();
    
    if (productResponse['csv_id'] != selectedStoreId) {
      // Product doesn't belong to selected store
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Invalid Cart'),
          content: Text('Some items in your cart are from a different store. Please clear your cart and try again.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('OK'),
            ),
          ],
        ),
      );
      return false;
    }
  }
  
  return true;
}
```

## Database Schema

### tbl_order columns:
- `ov_id` (primary key)
- `uv_id` (student user ID)
- `csv_id` (canteen store ID) ← **MUST NOT BE NULL**
- `ov_totalamount`
- `ov_status`
- `ov_ispaid`
- `ov_type`
- `ov_createdat`

### tbl_storeproducts columns:
- `spv_id` (primary key)
- `csv_id` (canteen store ID)
- `spv_name`
- `spv_price`
- `spv_quantity`

## Testing Checklist

After implementing the fix:

1. ✓ User must select a canteen store before checkout
2. ✓ Checkout is blocked if no store is selected
3. ✓ Order insert includes `csv_id` field
4. ✓ `csv_id` value matches the selected store
5. ✓ All cart products belong to the selected store
6. ✓ Order appears in Owner Dashboard Recent Orders
7. ✓ Order appears in Owner Order Management page
8. ✓ Order can be scanned with HIDKeyboard QR scanner
9. ✓ Order status updates work correctly
10. ✓ Student balance deduction works

## Web Dashboard Behavior

Once Flutter includes `csv_id`:

- **Owner Dashboard** will show recent orders filtered by their store's `csv_id`
- **Order Management** will display all orders for the owner's store
- **QR Scanner** will process orders correctly
- **Realtime updates** will work for the owner's store

## Error Messages

If `csv_id` is still NULL after this fix:

```
Console: [useOrders] No orders found for store csv_id: 2026488545711
Console: [Dashboard] Fetched 0 orders
```

If `csv_id` is correctly set:

```
Console: [useOrders] Orders fetched from tbl_order: 5
Console: [Dashboard] Fetched 5 orders
Console: [Dashboard] Final formatted orders: 5
```

## Related Files (Web)

- `Website_BarkCard/src/hooks/useOrders.jsx` - Queries orders by csv_id
- `Website_BarkCard/src/pages/StorePages/Page_Dashboard.jsx` - Shows recent orders
- `Website_BarkCard/src/pages/StorePages/Page_OrdersManagement.jsx` - Full order list
- `Website_BarkCard/src/pages/SuperAdminPages/Page_SuperAdminUserManagement.jsx` - Assigns stores to owners

## Support

If orders still don't appear after implementing this fix:

1. Check Flutter console for order creation logs
2. Verify `csv_id` is not NULL in database
3. Verify `csv_id` matches owner's store in `tbl_canteenstore.csv_id`
4. Check browser console for web dashboard logs
5. Verify owner is assigned to correct store via SuperAdmin panel
