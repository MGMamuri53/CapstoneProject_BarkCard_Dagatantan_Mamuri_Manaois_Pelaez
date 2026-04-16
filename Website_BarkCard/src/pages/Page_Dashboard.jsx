import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const avatarBackgrounds = [
  'bg-primary-fixed-dim text-primary',
  'bg-secondary-fixed-dim text-secondary',
  'bg-tertiary-fixed-dim text-tertiary',
  'bg-error-container text-error',
  'bg-primary-container text-on-primary-container'
];

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const getOrderTime = (dateTime) => dateTime.split(', ').at(-1) ?? dateTime;

const formatAmount = (amount) => {
  return `₱${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const parseAmount = (amount) => {
  return typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-secondary-container text-on-secondary-container';
    case 'Preparing':
      return 'bg-tertiary-fixed text-on-tertiary-fixed';
    case 'Ready':
      return 'bg-tertiary-container text-on-tertiary-container';
    case 'Completed':
      return 'bg-primary-container text-on-primary-container';
    case 'Cancelled':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container-high text-zinc-500';
  }
};

export default function Dashboard({ orders = [], menuItems = [] }) {
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const recentOrders = orders.slice(0, 4);
  const totalOrders = orders.length;
  const alertItems = menuItems
    .filter((item) => item.SPv_Quantity <= 10)
    .sort((a, b) => a.SPv_Quantity - b.SPv_Quantity);
  const lowStockCount = alertItems.length;
  const pendingOrders = orders.filter((order) => order.Ov_Status === 'Pending').length;
  const completedOrders = orders.filter((order) => order.Ov_Status === 'Completed').length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const topSellingItem = orders
    .flatMap((order) => order.ODv_Items)
    .reduce((totals, item) => {
      totals[item.SPv_Name] = (totals[item.SPv_Name] ?? 0) + item.ODv_Quantity;
      return totals;
    }, {});
  const [topItemName = 'No item data', topItemOrders = 0] = Object.entries(topSellingItem).sort((left, right) => right[1] - left[1])[0] ?? [];
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + parseAmount(order.Ov_TotalAmount);
  }, 0);
  const totalRevenueFormatted = formatAmount(totalRevenue);

  return (
    <div className="p-8 space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black font-headline text-primary tracking-tight">Dashboard</h2>
          <p className="text-zinc-500 mt-1">Overview of today's academic dining operations.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')} className="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-lg text-on-secondary-container font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">list_alt</span>
            View All Orders
          </button>
          <button onClick={() => navigate('/menu')} className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container px-6 py-2.5 rounded-lg text-white font-semibold text-sm editorial-shadow hover:brightness-110 transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add New Item
          </button>
        </div>
      </div>

      {/* Bento Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">calendar_today</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Total Orders Today</p>
          <h3 className="text-3xl font-black font-headline text-primary mt-1">{totalOrders}</h3>
          <div className="mt-2 flex items-center gap-1 text-xs text-tertiary font-medium">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            Synced with live order list
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">pending_actions</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Pending Orders</p>
          <h3 className="text-3xl font-black font-headline text-primary mt-1">{pendingOrders}</h3>
          <div className="mt-2 text-xs text-zinc-400 font-medium">Currently awaiting action</div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">check_circle</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Completed</p>
          <h3 className="text-3xl font-black font-headline text-primary mt-1">{completedOrders}</h3>
          <div className="mt-2 text-xs text-zinc-400 font-medium">{completionRate}% completion rate</div>
        </div>
        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-error/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-error/40 text-3xl">warning</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Low Stock Items</p>
          <h3 className="text-3xl font-black font-headline text-error mt-1">{String(lowStockCount).padStart(2, '0')}</h3>
          <div className="mt-2 text-xs text-error font-medium">{lowStockCount > 0 ? 'Action required' : 'All items stocked'}</div>
        </div>
        {/* Card 5 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">stars</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Top Selling Item</p>
          <h3 className="text-xl font-black font-headline text-primary mt-1">{topItemName}</h3>
          <div className="mt-2 text-xs text-zinc-400 font-medium">
            {topItemOrders} portion{topItemOrders === 1 ? '' : 's'} sold
            {(() => { const m = menuItems.find((i) => i.SPv_Name === topItemName); return m ? ` · ${m.SPv_Quantity} left` : ''; })()}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders Table Container */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-surface-container">
              <h3 className="text-xl font-black font-headline text-on-surface">Recent Orders</h3>
              <button onClick={() => setIsHistoryOpen(true)} className="text-primary text-sm font-bold hover:underline">View History</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Student Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Items</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {recentOrders.map((order, index) => (
                    <tr key={order.Ov_ID} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarBackgrounds[index % avatarBackgrounds.length]}`}>
                            {getInitials(order.Uv_FullName)}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{order.Uv_FullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-500">{order.Ov_ID}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600">{order.ODv_Items.map((item) => item.SPv_Name).join(', ')}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">{formatAmount(order.Ov_TotalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.Ov_Status)}`}>
                          {order.Ov_Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Secondary Column (Canteen Ops & Quick Insights) */}
        <div className="space-y-6">
          {/* Low Stock Alert Panel */}
          <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow border-l-4 border-error">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-error">inventory_2</span>
              <h4 className="font-bold font-headline text-on-surface">Inventory Alerts</h4>
            </div>
            <div className="space-y-4">
              {alertItems.length === 0 ? (
                <p className="text-sm text-zinc-400">All menu items are well stocked.</p>
              ) : (
                alertItems.map((item) => (
                  <div key={item.SPv_ID} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{item.SPv_Name}</p>
                      <p className="text-xs text-zinc-400">{item.SPv_Quantity === 0 ? 'Out of Stock' : `${item.SPv_Quantity} units left`}</p>
                    </div>
                    {item.SPv_Quantity === 0
                      ? <button className="text-xs font-bold text-error hover:underline">Urgent</button>
                      : <button className="text-xs font-bold text-primary hover:underline">Reorder</button>
                    }
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Meal Prep */}
          <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
            <h4 className="font-bold font-headline text-on-surface mb-4">Tomorrow's Specials</h4>
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden h-32 group">
                <img alt="Special meal prep" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByjXME2Vtrc-3h0bSUavlWUYkLZjsybdFgCZnB1jDAF2Fx4hAV1IUQ_YYRee686rKWDy-UNF-sjJKWF3-aJpiFR-Oy7eX3scqT5FxT4gQY36NilbggtDzqDc6KT0zj178hqp_IQA7qQCxH_usE0btHYCLx3q45HJpb6MYiUD3wGRuu31WcZax7GjaLL5d2aaHfX8QFxruy0aoaahsFdCApYz9oTge-9tA92pdPJO2EQdLdm0PuwbQy1cElmdjlCmUFQzzXDXOUdbwt"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-bold">Mediterranean Feast</p>
                  <p className="text-zinc-300 text-[10px] font-label">Pre-orders: 45</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">Vegetarian</span>
                <span className="bg-primary-fixed text-on-primary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold">Popular</span>
              </div>
            </div>
          </div>

          {/* Quick Balance Check */}
          <div className="bg-primary p-6 rounded-xl text-white editorial-shadow relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Revenue</h4>
            <p className="text-3xl font-black font-headline">{totalRevenueFormatted}</p>
            <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(completionRate, 100)}%` }}></div>
            </div>
            <p className="text-[10px] mt-2 opacity-80">Across {totalOrders} order{totalOrders === 1 ? '' : 's'} • {completionRate}% completed</p>
          </div>
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-surface-container p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black font-headline text-on-surface">Order History</h3>
                <p className="text-sm text-secondary">Most recent orders in the last few hours.</p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-on-surface hover:text-primary transition-colors p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Items</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Total</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider font-label">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {orders.map((order) => (
                      <tr key={order.Ov_ID} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4 text-sm text-zinc-500">{getOrderTime(order.Ov_CreatedAt)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-on-surface">{order.Uv_FullName}</td>
                        <td className="px-6 py-4 text-sm font-mono text-zinc-500">{order.Ov_ID}</td>
                        <td className="px-6 py-4 text-sm text-zinc-600">{order.ODv_Items.map((item) => item.SPv_Name).join(', ')}</td>
                        <td className="px-6 py-4 text-sm font-bold text-on-surface">{formatAmount(order.Ov_TotalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.Ov_Status)}`}>
                            {order.Ov_Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-5 py-3 rounded-lg bg-surface-container-high text-on-secondary-container font-semibold hover:bg-surface-container transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
