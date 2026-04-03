export default function AnalyticsStatistics() {
  return (
    <div className="p-8 lg:p-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Sales Analytics</h2>
          <p className="text-on-surface-variant font-body">Academic Dining Financial Overview & Insights</p>
        </div>
        {/* Date Range Filter */}
        <div className="inline-flex p-1 bg-surface-container-low rounded-lg shadow-inner">
          <button className="px-4 py-2 text-sm font-semibold rounded-md transition-all text-on-surface-variant hover:bg-surface-container">Daily</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-md transition-all text-on-surface-variant hover:bg-surface-container">Weekly</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-md bg-surface-container-lowest text-primary shadow-sm">Monthly</button>
        </div>
      </header>
      
      {/* Summary Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-primary">₱12,450.00</h3>
            <p className="text-xs text-tertiary-container mt-2 flex items-center font-semibold">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12.5% from last month
            </p>
          </div>
          <div className="p-3 bg-primary-container/10 rounded-lg">
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Average Order</p>
            <h3 className="text-3xl font-black text-on-surface">₱8.45</h3>
            <p className="text-xs text-on-surface-variant mt-2 flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px] mr-1">analytics</span> Stable per student capita
            </p>
          </div>
          <div className="p-3 bg-secondary-container rounded-lg">
            <span className="material-symbols-outlined text-secondary">receipt_long</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Items Sold</p>
            <h3 className="text-3xl font-black text-on-surface">1,472</h3>
            <p className="text-xs text-tertiary-container mt-2 flex items-center font-semibold">
              <span className="material-symbols-outlined text-[14px] mr-1">arrow_upward</span> +4% vs target
            </p>
          </div>
          <div className="p-3 bg-tertiary-fixed rounded-lg">
            <span className="material-symbols-outlined text-tertiary">inventory_2</span>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Line Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl font-bold tracking-tight">Daily Sales Revenue</h4>
            <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-1">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-zinc-200">
              <div className="border-t border-zinc-300 w-full h-0"></div>
              <div className="border-t border-zinc-300 w-full h-0"></div>
              <div className="border-t border-zinc-300 w-full h-0"></div>
              <div className="border-t border-zinc-300 w-full h-0"></div>
            </div>
            <svg className="absolute bottom-0 left-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <path d="M0,180 Q100,160 200,100 T400,140 T600,60 T800,80" fill="none" stroke="url(#lineGradient)" strokeLinecap="round" strokeWidth="4"></path>
              <defs>
                <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#0d631b"></stop>
                  <stop offset="100%" stopColor="#2e7d32"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute left-1/2 top-12 -translate-x-1/2 bg-on-surface text-white px-3 py-1 rounded text-xs font-bold shadow-lg">
              Peak: $542.50
            </div>
            <div className="flex justify-between w-full mt-auto pt-4 text-[10px] uppercase font-black tracking-widest text-zinc-400">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)] flex flex-col">
          <h4 className="text-xl font-bold tracking-tight mb-8">Order Distribution</h4>
          <div className="relative w-48 h-48 mx-auto mb-10">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#eeeeee" strokeWidth="4"></circle>
              <circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#0d631b" strokeDasharray="75 100" strokeDashoffset="25" strokeWidth="4"></circle>
              <circle cx="18" cy="18" fill="transparent" r="15.9" stroke="#506169" strokeDasharray="15 100" strokeDashoffset="100" strokeWidth="4"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">100%</span>
              <span className="text-[10px] uppercase tracking-tighter text-zinc-400">Processed</span>
            </div>
          </div>
          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold">82%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="text-sm font-bold">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-sm font-medium">Canceled</span>
              </div>
              <span className="text-sm font-bold">6%</span>
            </div>
          </div>
        </div>
        
        {/* Top Selling Items */}
        <div className="lg:col-span-12 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold tracking-tight">Top Selling Items</h4>
            <button className="text-primary text-xs font-bold hover:underline">View Full Menu Performance</button>
          </div>
          <div className="space-y-6">
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-on-surface flex items-center">
                  <img className="w-8 h-8 rounded-full mr-3 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXZa1n0wNpoeYkH-mURzTD7v1ChXukfQrlQmuZ9eH_oUmBdi1VAK_8rubTNNfODWvKFcouZBWR6deLFjxpV0rQAoEuzsA6d0zxbiw_1R-VZMwECI1rmWTdAYqcdyKxZSTD2D6wwUWGOieTg-69CXrKljc2VuQ8KdWkTuPDZ1NE380ymiyR5N4ejs1GecdNAleFvFZnitlPJ9PUSbppQmu6JNrFikEmaGFzx_4ekXmCkzXJPAbzYHoly98og4QH3JUSxTVMiHq_5ltk" alt="Item" />
                  Artisan Grilled Chicken Wrap
                </span>
                <span className="text-sm font-black text-on-surface">342 Units</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-on-surface flex items-center">
                  <img className="w-8 h-8 rounded-full mr-3 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4FwAobqUSIciRUbXUs5i63OTgplNYWWSHRDzXmnvxeLJotk96dxQvWVrqyxqAgJ1Xuy-9j6KPbBRe7iW-BvStGGT1YuBnuvooqMAByAxwXEZ8NO698cHznLxp6XgKI64PfSqYMavbyEUYONU7IWLfpVPUCJeNR3VwjI_ona3SY8ZhwfBcz7MMn6ZgFUo0xpoSu79NHlnMbNw7TyUyJLFr2zHRwv-cvJ2FjVtMFMizenQzxe2mYj1phjfGZwkIwpIAF-FwT7D46GOy" alt="Item" />
                  Superfood Quinoa Bowl
                </span>
                <span className="text-sm font-black text-on-surface">289 Units</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full opacity-80" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-on-surface flex items-center">
                  <img className="w-8 h-8 rounded-full mr-3 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH5YmSMCU2SoKNtDhNyO3R5AVbqcHi8DfSNB3xeTEddLeRTvvaBjAP33JvrrEgH2zHL7REKHjIr_3qDvZUyXAH427IsuF1Tw4x-9iihq7vgcu1oS9zhXU_VI2ig8INTMxnM5gW2he3expnXfwUexFK5MHzUEmSisBsOFSmsbBJOMv8tbxqwpV3-vJZGScieVeCPA-_NeZpI5aSn33vGUVw203nsHCGRLUQhAyT6AWZU-jJcdGfTjzCNkTuKGKlwh1w5ddUzgtDWoWa" alt="Item" />
                  Refresh Matcha Smoothie
                </span>
                <span className="text-sm font-black text-on-surface">194 Units</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full opacity-60" style={{ width: '48%' }}></div>
              </div>
            </div>
            
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-on-surface flex items-center">
                  <img className="w-8 h-8 rounded-full mr-3 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcge_b96Wsd-7HklzsXn1DUxVtwwO-Kp7IHFo4sO_SgfoGD8ANSaL_2iYFaKlts3UBVhlc0UF0rIWaZWHBikssr4KlLDgOMXkQiBj0NIUnjUPaQfk8xllUyLd-7zEObPTNyVpb8FMVeBaLx78xwIYBtm4yir23rjC5omEx_pkx6bSokiK3HGAPchFQUw6P3WTjmMKT1I8ICKBkx4imM3ElZ_VduEeNNUdTFHy2I-1JwOIBwenJ0NGWpWudUrtyHeVd6_s-d58S3rUA" alt="Item" />
                  Baked Sweet Potato Fries
                </span>
                <span className="text-sm font-black text-on-surface">156 Units</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full opacity-40" style={{ width: '39%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="mt-12 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
        <h4 className="text-xl font-bold tracking-tight mb-8">Recent Large Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
                <th className="pb-6 px-4">Student ID</th>
                <th className="pb-6 px-4">Item Details</th>
                <th className="pb-6 px-4 text-center">Status</th>
                <th className="pb-6 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-5 px-4 font-black">#BC-20918</td>
                <td className="py-5 px-4 text-on-surface-variant italic">Bulk order: Class 5B Lunch Prep</td>
                <td className="py-5 px-4 text-center">
                  <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase">Success</span>
                </td>
                <td className="py-5 px-4 text-right font-black text-primary">₱182.40</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-5 px-4 font-black">#BC-20842</td>
                <td className="py-5 px-4 text-on-surface-variant italic">Teacher's Lounge Weekly Tab</td>
                <td className="py-5 px-4 text-center">
                  <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase">Success</span>
                </td>
                <td className="py-5 px-4 text-right font-black text-primary">₱45.10</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-5 px-4 font-black">#BC-20755</td>
                <td className="py-5 px-4 text-on-surface-variant italic">Vending Replenishment</td>
                <td className="py-5 px-4 text-center">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase">Pending</span>
                </td>
                <td className="py-5 px-4 text-right font-black text-primary">₱210.00</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="py-5 px-4 font-black">#BC-20712</td>
                <td className="py-5 px-4 text-on-surface-variant italic">Sports Day Catering Deposit</td>
                <td className="py-5 px-4 text-center">
                  <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase">Success</span>
                </td>
                <td className="py-5 px-4 text-right font-black text-primary">₱500.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
