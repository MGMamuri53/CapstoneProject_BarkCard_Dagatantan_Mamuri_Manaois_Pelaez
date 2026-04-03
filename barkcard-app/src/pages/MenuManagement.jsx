export default function MenuManagement() {
  return (
    <div className="p-8 lg:p-10">
      {/* Page Header */}
      <header className="flex justify-between items-end mb-12">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Menu Management</h2>
          <p className="text-secondary text-sm font-body">Manage campus culinary offerings and inventory levels.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg font-semibold shadow-md active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span>
          <span>Add New Item</span>
        </button>
      </header>

      {/* Search & Filter Tonal Layer */}
      <div className="bg-surface-container-low rounded-xl p-6 mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary text-sm" placeholder="Search menu items..." type="text" />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface-container-high rounded-full text-sm font-medium text-on-secondary-container hover:bg-secondary-container transition-colors">All Categories</button>
          <button className="px-4 py-2 bg-surface-container-high rounded-full text-sm font-medium text-on-secondary-container hover:bg-secondary-container transition-colors">Main Course</button>
          <button className="px-4 py-2 bg-surface-container-high rounded-full text-sm font-medium text-on-secondary-container hover:bg-secondary-container transition-colors">Beverages</button>
        </div>
      </div>

      {/* Menu Management Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline">Item Details</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline">Category</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline text-right">Price</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline text-center">Stock</th>
              <th className="px-6 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline">Status</th>
              <th className="px-8 py-5 font-headline text-xs font-bold uppercase tracking-widest text-outline text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {/* Row 1 */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABLMW_alQ7O2KT1cP-zK6reqcp01BkMrS31OmGL5mdTgbktj1kOkdjedfVec9pvGP2vfOLqcDF0dSSNTX_zwPUmj6gtDAn5_0cbwOCLIXOqxG82a8SF4u_mHFxRoFHk4qzj2qqNCoDN4oelexc-ErdUfjb2kynb_Ej0nD890W91hWhSZzfcn0V1T8_xRFL9tX8t3KPBICjsw9q096ShlS3SJMXkaQyTN4bI2kqd3gZhNtnJj8QhUyli2541EMdfA3IGligWKbNRctn" alt="Item" />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface">Chicken Sandwich</p>
                    <p className="text-xs text-outline font-body">Herb-grilled, brioche bun</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 font-body text-sm text-secondary">Main Course</td>
              <td className="px-6 py-6 font-headline font-bold text-sm text-right text-on-surface">₱8.50</td>
              <td className="px-6 py-6 text-center">
                <div className="text-sm font-bold text-on-surface">42</div>
                <div className="w-16 h-1.5 bg-surface-container-highest rounded-full mx-auto mt-2 overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full"></div>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary font-label text-[10px] font-extrabold uppercase tracking-wide rounded-full border border-tertiary/20">Available</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-secondary hover:text-primary-container"><span className="material-symbols-outlined text-xl">edit</span></button>
                  <button className="p-2 text-secondary hover:text-error"><span className="material-symbols-outlined text-xl">delete</span></button>
                </div>
              </td>
            </tr>
            {/* Row 2 */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRPQYjAP6g-qlI0yFLca8Wfy8FIYEfCGh8O8YznHt-mKFPYV1y4m9zA0BWyqrmHuDU5KfOu4me4cF7RbF4ITilGrFgsJk3FfeErIUaYgJj-oeE4tLLpPGM3486mZMPAzpGNiGGvXMF67iAx0KAqQQOq0SyRRKVXDTbtEiIa3nqUhoPoO46tZMW7ZNIBrmFDrnsU313kEXzD-UXQENiluEHqlkKJNWFG4SNmwAu7K8aY1HylZcZfPDfPyuNGwIKK6h_Sn0eTVdEjgeF" alt="Item" />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface">Fruit Salad Bowl</p>
                    <p className="text-xs text-outline font-body">Seasonal selection, honey glaze</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 font-body text-sm text-secondary">Sides</td>
              <td className="px-6 py-6 font-headline font-bold text-sm text-right text-on-surface">₱5.25</td>
              <td className="px-6 py-6 text-center">
                <div className="text-sm font-bold text-on-surface">8</div>
                <div className="w-16 h-1.5 bg-surface-container-highest rounded-full mx-auto mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[20%] rounded-full"></div>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 font-label text-[10px] font-extrabold uppercase tracking-wide rounded-full border border-amber-200">Low Stock</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-secondary hover:text-primary-container"><span className="material-symbols-outlined text-xl">edit</span></button>
                  <button className="p-2 text-secondary hover:text-error"><span className="material-symbols-outlined text-xl">delete</span></button>
                </div>
              </td>
            </tr>
            {/* Row 3 */}
            <tr className="group hover:bg-surface-container-low transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center overflow-hidden grayscale">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbRZN0SdzPEWUvSX4vvxAztFr3013pCPkTEO6jYRE5WJPGAB8JqBIvgdKxpOKEQrSewMZFyV54O3Bnu1AWC0aaGy2vUpRs6gwk9ZHQ6G_plmCqz7wrjsVEwNYaL3x_ejlw40yFjOcwNCcM27eZEXxRNjWUoPE4ZYcPFmBPocpeLKUsR4_-8V1xWzjTA65Zj4I1zHrwk2BrsEuGbEJFfSjozWoUdTs_NhFZx-zmklUSqIpUYD1vaHTfp-RBGF6r335SuJ2NaCzDC19H" alt="Item" />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface opacity-60">Orange Juice</p>
                    <p className="text-xs text-outline font-body">100% freshly squeezed</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 font-body text-sm text-secondary">Beverages</td>
              <td className="px-6 py-6 font-headline font-bold text-sm text-right text-on-surface">₱3.50</td>
              <td className="px-6 py-6 text-center">
                <div className="text-sm font-bold text-error">0</div>
                <div className="w-16 h-1.5 bg-surface-container-highest rounded-full mx-auto mt-2 overflow-hidden">
                  <div className="h-full bg-error w-0 rounded-full"></div>
                </div>
              </td>
              <td className="px-6 py-6">
                <span className="px-3 py-1 bg-error-container text-error font-label text-[10px] font-extrabold uppercase tracking-wide rounded-full border border-error/20">Out of Stock</span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-secondary hover:text-primary-container"><span className="material-symbols-outlined text-xl">edit</span></button>
                  <button className="p-2 text-secondary hover:text-error"><span className="material-symbols-outlined text-xl">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Stats / Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-headline font-bold text-outline uppercase tracking-wider mb-2">Total Items</p>
          <p className="text-3xl font-headline font-extrabold text-on-surface">124</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <p className="text-xs font-headline font-bold text-outline uppercase tracking-wider mb-2">Low Inventory</p>
          <p className="text-3xl font-headline font-extrabold text-amber-600">08</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-error/10">
          <p className="text-xs font-headline font-bold text-outline uppercase tracking-wider mb-2">Out of Stock</p>
          <p className="text-3xl font-headline font-extrabold text-error">03</p>
        </div>
        <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-md flex flex-col justify-between">
          <p className="text-xs font-headline font-bold text-on-primary/80 uppercase tracking-wider mb-2">Daily Sales Peak</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-headline font-extrabold text-on-primary">12:30</p>
            <span className="material-symbols-outlined text-on-primary/50 text-4xl">trending_up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
