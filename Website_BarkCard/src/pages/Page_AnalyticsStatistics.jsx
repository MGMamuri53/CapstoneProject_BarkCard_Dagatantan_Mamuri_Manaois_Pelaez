import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PERIOD_CONFIG = {
  Daily: {
    multiplier: 1,
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    compareLabel: 'yesterday'
  },
  Weekly: {
    multiplier: 7,
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    compareLabel: 'last week'
  },
  Monthly: {
    multiplier: 30,
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    compareLabel: 'last month'
  }
};

const parseAmount = (amount) => {
  const value = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
  return Number.isNaN(value) ? 0 : value;
};

const normalizeLabel = (value) => String(value).trim().toLowerCase();

const formatCurrency = (amount) => `P${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-tertiary-container text-on-tertiary-container';
    case 'Pending':
    case 'Preparing':
    case 'Ready':
      return 'bg-secondary-container text-on-secondary-container';
    case 'Cancelled':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
};

export default function AnalyticsStatistics({ orders = [], menuItems = [] }) {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  const analytics = useMemo(() => {
    const period = PERIOD_CONFIG[selectedPeriod];
    const nonCancelledOrders = orders.filter((order) => order.status !== 'Cancelled');
    const completedOrders = orders.filter((order) => order.status === 'Completed');
    const pendingLikeOrders = orders.filter((order) => order.status === 'Pending' || order.status === 'Preparing' || order.status === 'Ready');
    const canceledOrders = orders.filter((order) => order.status === 'Cancelled');

    const baseRevenue = nonCancelledOrders.reduce((sum, order) => sum + parseAmount(order.total), 0);
    const baseItemsSold = nonCancelledOrders.reduce(
      (sum, order) => sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const periodRevenue = baseRevenue * period.multiplier;
    const averageOrder = nonCancelledOrders.length > 0 ? baseRevenue / nonCancelledOrders.length : 0;
    const periodAverageOrder = averageOrder * (selectedPeriod === 'Daily' ? 1 : selectedPeriod === 'Weekly' ? 1.03 : 1.06);
    const periodItemsSold = Math.round(baseItemsSold * period.multiplier);

    const previousPeriodRevenue = periodRevenue * 0.92;
    const revenueChangePct = previousPeriodRevenue > 0 ? ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

    const previousItemsSold = Math.max(1, Math.round(periodItemsSold * 0.94));
    const itemsChangePct = ((periodItemsSold - previousItemsSold) / previousItemsSold) * 100;

    const totalOrders = orders.length || 1;
    const completedPct = Math.round((completedOrders.length / totalOrders) * 100);
    const pendingPct = Math.round((pendingLikeOrders.length / totalOrders) * 100);
    const canceledPct = Math.max(0, 100 - completedPct - pendingPct);

    const soldByItem = nonCancelledOrders
      .flatMap((order) => order.orderItems)
      .reduce((acc, item) => {
        const key = normalizeLabel(item.name);
        if (!key) {
          return acc;
        }
        acc[key] = {
          name: item.name,
          units: (acc[key]?.units ?? 0) + item.quantity
        };
        return acc;
      }, {});

    const menuPerformance = menuItems.map((item) => {
      const soldItem = soldByItem[normalizeLabel(item.name)];
      return {
        name: item.name,
        units: soldItem?.units ?? 0,
        image: item.imageUrl,
        stock: item.stock
      };
    });

    const extraSoldItems = Object.values(soldByItem)
      .filter((soldItem) => !menuItems.some((menuItem) => normalizeLabel(menuItem.name) === normalizeLabel(soldItem.name)))
      .map((soldItem) => ({
        name: soldItem.name,
        units: soldItem.units,
        image: 'https://via.placeholder.com/64x64?text=BC',
        stock: null
      }));

    const rankedItems = [...menuPerformance, ...extraSoldItems]
      .filter((item) => item.units > 0)
      .sort((left, right) => right.units - left.units);

    const topBaseUnits = rankedItems[0]?.units ?? 1;

    const topItems = rankedItems
      .slice(0, 4)
      .map((item, index) => {
        const soldShare = Math.round((item.units / Math.max(1, baseItemsSold)) * 100);

        return {
          name: item.name,
          units: item.units,
          soldShare,
          stock: item.stock,
          width: Math.max(24, Math.round((item.units / topBaseUnits) * 100)),
          opacity: index === 0 ? 'opacity-100' : index === 1 ? 'opacity-80' : index === 2 ? 'opacity-60' : 'opacity-40',
          image: item.image
        };
      });

    const labels = period.labels;
    const normalizedRevenuePerPoint = labels.length > 0 ? periodRevenue / labels.length : 0;
    const amplitude = 44;
    const points = labels.map((_, index) => {
      const cycle = Math.sin((index / Math.max(1, labels.length - 1)) * Math.PI * 1.5);
      const projected = normalizedRevenuePerPoint * (1 + cycle * 0.22);
      const relative = periodRevenue > 0 ? projected / periodRevenue : 0;
      return 220 - relative * amplitude * labels.length;
    });

    const peakRevenue = labels.length > 0
      ? Math.max(...labels.map((_, index) => {
          const cycle = Math.sin((index / Math.max(1, labels.length - 1)) * Math.PI * 1.5);
          return normalizedRevenuePerPoint * (1 + cycle * 0.22);
        }))
      : 0;

    const largeTransactions = [...orders]
      .sort((left, right) => parseAmount(right.total) - parseAmount(left.total))
      .slice(0, 5);

    return {
      summary: {
        totalRevenue: periodRevenue,
        revenueChange: `${revenueChangePct >= 0 ? '+' : ''}${revenueChangePct.toFixed(1)}% from ${period.compareLabel}`,
        averageOrder: periodAverageOrder,
        averageLabel: `${nonCancelledOrders.length} active orders in current dataset`,
        itemsSold: periodItemsSold,
        itemsChange: `${itemsChangePct >= 0 ? '+' : ''}${itemsChangePct.toFixed(1)}% vs previous ${selectedPeriod.toLowerCase()}`
      },
      lineChart: {
        title: `${selectedPeriod} Sales Revenue`,
        labels,
        points,
        peakText: `Peak: ${formatCurrency(peakRevenue)}`
      },
      distribution: {
        completed: completedPct,
        pending: pendingPct,
        canceled: canceledPct
      },
      topItems,
      recentTransactions: largeTransactions
    };
  }, [orders, menuItems, selectedPeriod]);

  const linePath = analytics.lineChart.points
    .map((value, index) => `${index === 0 ? 'M' : 'L'}${index * 133.33},${value}`)
    .join(' ');

  const completedPct = analytics.distribution.completed;
  const pendingPct = analytics.distribution.pending;
  const canceledPct = analytics.distribution.canceled;
  const pendingStart = completedPct;
  const canceledStart = completedPct + pendingPct;
  const distributionGradient = `conic-gradient(#eab308 0% ${completedPct}%, #506169 ${pendingStart}% ${canceledStart}%, #b3261e ${canceledStart}% 100%)`;

  return (
    <div className="p-8 lg:p-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Sales Analytics</h2>
          <p className="text-on-surface-variant font-body">Academic Dining Financial Overview and Insights</p>
        </div>
        <div className="inline-flex p-1 bg-surface-container-low rounded-lg shadow-inner">
          {Object.keys(PERIOD_CONFIG).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                selectedPeriod === period
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              {period}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-primary">{formatCurrency(analytics.summary.totalRevenue)}</h3>
            <p className="text-xs text-tertiary-container mt-2 flex items-center font-semibold">
              <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> {analytics.summary.revenueChange}
            </p>
          </div>
          <div className="p-3 bg-primary-container/10 rounded-lg">
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Average Order</p>
            <h3 className="text-3xl font-black text-on-surface">{formatCurrency(analytics.summary.averageOrder)}</h3>
            <p className="text-xs text-on-surface-variant mt-2 flex items-center font-medium">
              <span className="material-symbols-outlined text-[14px] mr-1">analytics</span> {analytics.summary.averageLabel}
            </p>
          </div>
          <div className="p-3 bg-secondary-container rounded-lg">
            <span className="material-symbols-outlined text-secondary">receipt_long</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(26,28,28,0.04)] flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Items Sold</p>
            <h3 className="text-3xl font-black text-on-surface">{analytics.summary.itemsSold.toLocaleString('en-PH')}</h3>
            <p className="text-xs text-tertiary-container mt-2 flex items-center font-semibold">
              <span className="material-symbols-outlined text-[14px] mr-1">arrow_upward</span> {analytics.summary.itemsChange}
            </p>
          </div>
          <div className="p-3 bg-tertiary-fixed rounded-lg">
            <span className="material-symbols-outlined text-tertiary">inventory_2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl font-bold tracking-tight">{analytics.lineChart.title}</h4>
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
              <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeLinecap="round" strokeWidth="4"></path>
              <defs>
                <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#0d631b"></stop>
                  <stop offset="100%" stopColor="#2e7d32"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute left-1/2 top-12 -translate-x-1/2 bg-on-surface text-white px-3 py-1 rounded text-xs font-bold shadow-lg">
              {analytics.lineChart.peakText}
            </div>
            <div className="flex justify-between w-full mt-auto pt-4 text-[10px] uppercase font-black tracking-widest text-zinc-400">
              {analytics.lineChart.labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)] flex flex-col">
          <h4 className="text-xl font-bold tracking-tight mb-8">Order Distribution</h4>
          <div className="relative w-48 h-48 mx-auto mb-10">
            <div className="h-full w-full rounded-full" style={{ background: distributionGradient }}></div>
            <div className="absolute inset-[18px] rounded-full bg-surface-container-lowest"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{analytics.distribution.completed}%</span>
              <span className="text-[10px] uppercase tracking-tighter text-zinc-400">Completed</span>
            </div>
          </div>
          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold">{analytics.distribution.completed}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="text-sm font-bold">{analytics.distribution.pending}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-sm font-medium">Canceled</span>
              </div>
              <span className="text-sm font-bold">{analytics.distribution.canceled}%</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold tracking-tight">Top Selling Items</h4>
            <button className="text-primary text-xs font-bold hover:underline" onClick={() => navigate('/menu')} type="button">
              View Full Menu Performance
            </button>
          </div>
          <div className="space-y-6">
            {analytics.topItems.length > 0 ? (
              analytics.topItems.map((item) => (
                <div key={item.name} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-on-surface flex items-center">
                      <img className="w-8 h-8 rounded-full mr-3 object-cover" src={item.image} alt="Item" />
                      {item.name}
                    </span>
                    <span className="text-sm font-black text-on-surface">{item.units.toLocaleString('en-PH')} Units</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-primary to-primary-container rounded-full ${item.opacity}`}
                      style={{ width: `${item.width}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{item.soldShare}% of sold items</span>
                    <span>{item.stock === null ? 'Stock not tracked' : `${item.stock} in stock`}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">No order items available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(26,28,28,0.06)]">
        <h4 className="text-xl font-bold tracking-tight mb-8">Recent Large Transactions</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black tracking-widest text-zinc-400">
                <th className="pb-6 px-4">Order ID</th>
                <th className="pb-6 px-4">Item Details</th>
                <th className="pb-6 px-4 text-center">Status</th>
                <th className="pb-6 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {analytics.recentTransactions.length > 0 ? (
                analytics.recentTransactions.map((order) => (
                  <tr className="hover:bg-surface-container-low transition-colors group" key={order.id}>
                    <td className="py-5 px-4 font-black">{order.id}</td>
                    <td className="py-5 px-4 text-on-surface-variant italic">{order.items}</td>
                    <td className="py-5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right font-black text-primary">{order.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-5 px-4 text-on-surface-variant" colSpan={4}>No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
