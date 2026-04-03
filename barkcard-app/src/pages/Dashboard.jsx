export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black font-headline text-primary tracking-tight">Dashboard</h2>
          <p className="text-zinc-500 mt-1">Overview of today's academic dining operations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-surface-container-high px-5 py-2.5 rounded-lg text-on-secondary-container font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">list_alt</span>
            View All Orders
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container px-6 py-2.5 rounded-lg text-white font-semibold text-sm editorial-shadow hover:brightness-110 transition-all active:scale-95">
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
          <h3 className="text-3xl font-black font-headline text-primary mt-1">142</h3>
          <div className="mt-2 flex items-center gap-1 text-xs text-tertiary font-medium">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            12% from yesterday
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">pending_actions</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Pending Orders</p>
          <h3 className="text-3xl font-black font-headline text-primary mt-1">08</h3>
          <div className="mt-2 text-xs text-zinc-400 font-medium">Updated 2m ago</div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">check_circle</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Completed</p>
          <h3 className="text-3xl font-black font-headline text-primary mt-1">134</h3>
          <div className="mt-2 text-xs text-zinc-400 font-medium">94% efficiency rate</div>
        </div>
        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-error/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-error/40 text-3xl">warning</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Low Stock Items</p>
          <h3 className="text-3xl font-black font-headline text-error mt-1">03</h3>
          <div className="mt-2 text-xs text-error font-medium">Action required</div>
        </div>
        {/* Card 5 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow group hover:bg-primary-container/5 transition-colors duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary/40 text-3xl">stars</span>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-label">Top Selling Item</p>
          <h3 className="text-xl font-black font-headline text-primary mt-1">Vegan Bowl</h3>
          <div className="mt-2 text-xs text-zinc-400 font-medium">42 portions sold</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders Table Container */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-surface-container">
              <h3 className="text-xl font-black font-headline text-on-surface">Recent Orders</h3>
              <button className="text-primary text-sm font-bold hover:underline">View History</button>
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
                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary font-bold text-xs">JD</div>
                        <span className="text-sm font-semibold text-on-surface">Julian Dasher</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">#BK-9021</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">Quinoa Salad, Apple Juice</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">₱12.50</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary-container text-on-tertiary-container">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed-dim flex items-center justify-center text-secondary font-bold text-xs">MS</div>
                        <span className="text-sm font-semibold text-on-surface">Maya Sterling</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">#BK-9022</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">Veggie Burger, Fries</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">₱14.20</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">In Progress</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim flex items-center justify-center text-tertiary font-bold text-xs">LH</div>
                        <span className="text-sm font-semibold text-on-surface">Leo Hudson</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">#BK-9023</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">Classic Club, Coffee</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">₱11.00</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary-container text-on-tertiary-container">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error font-bold text-xs">AP</div>
                        <span className="text-sm font-semibold text-on-surface">Alex Porter</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-500">#BK-9024</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">Pesto Pasta, Water</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">₱15.50</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-zinc-500">Pending</span>
                    </td>
                  </tr>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Whole Wheat Bread</p>
                  <p className="text-xs text-zinc-400">2 units left</p>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">Reorder</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Greek Yogurt</p>
                  <p className="text-xs text-zinc-400">5 units left</p>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">Reorder</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Organic Milk</p>
                  <p className="text-xs text-zinc-400">Out of Stock</p>
                </div>
                <button className="text-xs font-bold text-error hover:underline">Urgent</button>
              </div>
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
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Weekly Revenue</h4>
            <p className="text-3xl font-black font-headline">₱14,582.40</p>
            <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4 rounded-full"></div>
            </div>
            <p className="text-[10px] mt-2 opacity-80">75% of monthly target reached</p>
          </div>
        </div>
      </div>
    </div>
  );
}
