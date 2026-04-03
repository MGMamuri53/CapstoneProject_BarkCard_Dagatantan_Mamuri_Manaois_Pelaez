export default function OrdersManagement() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Page Header Section */}
      <div className="mb-10">
        <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-6 tracking-tight">Order Management</h2>
        
        {/* Status Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all">All Orders</button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">Pending</button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">Preparing</button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">Ready</button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">Completed</button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface-container-high text-on-surface-variant hover:bg-secondary-container transition-all">Cancelled</button>
          
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Advanced Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-sm">add</span>
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Items Ordered</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Total Price</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Date/Time</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {/* Sample Row 1: Pending */}
            <tr className="hover:bg-surface-container-low transition-colors duration-200">
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGYyIQxVoeGBuoOUtJUDb16dHvMvYkG60DtrUzMsaXKAQ1sjh3Fi9sQQKYqRGhNmtEyTYL7Ka9fGnFEdjmfvQY1qzPLw-1i-sv_XGQUUFp2Nl9DromD1INCNgJw1pfjE7pl3RNv2PFxLZO2_ZcIcAPaomwU0VrZkCNg9XqEe9GJECATiDwnjnKrbgGfn95pxdi4CyQotrn6CFBOGZ0oHdOm_DHvybwDZh4QV9m3vrmz9wyNoSrQdpPdf1UXOG1tD5MN3SklvFIeWsf" alt="Student" />
                  <span className="font-medium text-on-surface">Alexander Chen</span>
                </div>
              </td>
              <td className="px-6 py-6 text-sm text-secondary font-mono">#BC-9921</td>
              <td className="px-6 py-6 text-sm text-on-surface-variant">Quinoa Bowl, Green Tea</td>
              <td className="px-6 py-6 text-sm font-bold text-primary">₱14.50</td>
              <td className="px-6 py-6 text-sm text-secondary">Oct 24, 11:32 AM</td>
              <td className="px-6 py-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                  PENDING
                </span>
              </td>
              <td className="px-6 py-6 text-right">
                <button className="text-primary hover:text-primary-container font-semibold text-sm">View Details</button>
              </td>
            </tr>
            {/* Sample Row 2: Preparing */}
            <tr className="bg-surface-container-low/30 hover:bg-surface-container-low transition-colors duration-200">
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXYs7HeIx3jmfjqVDVs6O2uqm0LNu8xg1atLjpy1a-9DmIWxiHjNNktAij3ckt0oSVJVcOqJcGe3d6r1_XEmEgqwvDOsbtbibuSZz0gmM7tlg6QHOuOlYGVmrtcAxcf4-vz7T8S_B6oEy9P9i5kPaxz2iZyySDRTiLOTpASO2r13VzmVe4hM8RS1g6nwjsxs70y_6Of7v9UWMLVMLVdH5EOMhRpsRrZJc1rs0pQ4PLtsWeQrtUGI_AwY_8vwfc-EFGAUC6916Icfqk" alt="Student" />
                  <span className="font-medium text-on-surface">Maya Rodriguez</span>
                </div>
              </td>
              <td className="px-6 py-6 text-sm text-secondary font-mono">#BC-9922</td>
              <td className="px-6 py-6 text-sm text-on-surface-variant">Double Cheeseburger, Fries</td>
              <td className="px-6 py-6 text-sm font-bold text-primary">₱18.25</td>
              <td className="px-6 py-6 text-sm text-secondary">Oct 24, 11:28 AM</td>
              <td className="px-6 py-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                  PREPARING
                </span>
              </td>
              <td className="px-6 py-6 text-right text-sm">
                <button className="text-primary hover:text-primary-container font-semibold">View Details</button>
              </td>
            </tr>
            {/* Sample Row 3: Ready */}
            <tr className="hover:bg-surface-container-low transition-colors duration-200">
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcfWBviL48HTPXj-qtk4rZ1G5v6EWgPkciCarX-o-ip9iXncBelRVOCv9zGgkratT5mY4pKzrSVG66z72sVuC-X8rRhzxmGzqEens_0SH7cUnIBogs4VyOylmDbg2Xqz00A3VjVf5azcpjllvDkxpGlm_CSlgMZ3-mhjp275Tc4IcD0gwr6L-0-V5gGJXF3Bk4z9CP1ZIo-mDPJM7t1UEQ7lJiAA3SyW1A2kuwUPOehGLit7a-EM3Fh0wauYYtl6nlczXkEP5-QlSf" alt="Student" />
                  <span className="font-medium text-on-surface">Liam O'Connor</span>
                </div>
              </td>
              <td className="px-6 py-6 text-sm text-secondary font-mono">#BC-9923</td>
              <td className="px-6 py-6 text-sm text-on-surface-variant">Caesar Salad, Apple</td>
              <td className="px-6 py-6 text-sm font-bold text-primary">₱12.00</td>
              <td className="px-6 py-6 text-sm text-secondary">Oct 24, 11:15 AM</td>
              <td className="px-6 py-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-tertiary-container text-on-tertiary-container">
                  READY
                </span>
              </td>
              <td className="px-6 py-6 text-right text-sm">
                <button className="text-primary hover:text-primary-container font-semibold">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination / Footer */}
        <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/10 flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">Showing 8 of 142 orders</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white text-zinc-400 transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-bold text-sm">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-on-surface text-sm">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-white text-on-surface text-sm">3</button>
            <button className="p-2 rounded-lg hover:bg-white text-zinc-400 transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Quick Actions (Floating Grid) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex flex-col gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">pending_actions</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Queue Overview</h3>
          <p className="text-sm text-on-surface-variant">4 orders are waiting for prep. Kitchen capacity at 65%.</p>
        </div>
        <div className="bg-tertiary-fixed/20 p-6 rounded-xl border border-tertiary-fixed/30 flex flex-col gap-2">
          <span className="material-symbols-outlined text-tertiary text-3xl">notifications_active</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Ready Alerts</h3>
          <p className="text-sm text-on-surface-variant">3 orders marked as Ready are awaiting student pickup.</p>
        </div>
        <div className="bg-secondary-container p-6 rounded-xl flex flex-col gap-2">
          <span className="material-symbols-outlined text-secondary text-3xl">analytics</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Daily Summary</h3>
          <p className="text-sm text-on-surface-variant">Total revenue today: ₱1,240.50 (+12% from yesterday).</p>
        </div>
      </div>
      
      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-xl flex items-center justify-center active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined">print</span>
      </button>
    </div>
  );
}
