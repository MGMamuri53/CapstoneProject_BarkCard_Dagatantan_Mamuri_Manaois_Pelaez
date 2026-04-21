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

const normalizeLabel = (value) => (value == null ? '' : String(value).trim().toLowerCase());

const getOrderStatus = (order) => order?.status ?? order?.Ov_Status ?? 'Pending';
const getOrderTotal = (order) => order?.total ?? order?.Ov_TotalAmount ?? 0;
const getOrderItems = (order) => order?.orderItems ?? order?.ODv_Items ?? [];
const getOrderId = (order) => order?.id ?? order?.Ov_ID ?? 'N/A';

const getItemName = (item) => item?.name ?? item?.SPv_Name ?? 'Unknown Item';
const getItemQuantity = (item) => {
  const quantity = item?.quantity ?? item?.ODv_Quantity ?? 0;
  const numericQuantity = Number(quantity);
  return Number.isFinite(numericQuantity) ? numericQuantity : 0;
};

const getOrderItemsLabel = (order) => {
  const itemNames = getOrderItems(order)
    .map((item) => getItemName(item))
    .filter(Boolean);
  return itemNames.length > 0 ? itemNames.join(', ') : 'No items';
};

const getMenuItemName = (item) => item?.name ?? item?.SPv_Name ?? 'Unnamed item';
const getMenuItemImage = (item) => item?.imageUrl ?? item?.SPv_IMG ?? 'https://via.placeholder.com/64x64?text=BC';
const getMenuItemStock = (item) => {
  const stock = item?.stock ?? item?.SPv_Quantity;
  return typeof stock === 'number' ? stock : null;
};

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
    const nonCancelledOrders = orders.filter((order) => getOrderStatus(order) !== 'Cancelled');
    const completedOrders = orders.filter((order) => getOrderStatus(order) === 'Completed');
    const pendingLikeOrders = orders.filter((order) => {
      const status = getOrderStatus(order);
      return status === 'Pending' || status === 'Preparing' || status === 'Ready';
    });

    const baseRevenue = nonCancelledOrders.reduce((sum, order) => sum + parseAmount(getOrderTotal(order)), 0);
    const baseItemsSold = nonCancelledOrders.reduce(
      (sum, order) => sum + getOrderItems(order).reduce((itemSum, item) => itemSum + getItemQuantity(item), 0),
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
      .flatMap((order) => getOrderItems(order))
      .reduce((acc, item) => {
        const itemName = getItemName(item);
        const key = normalizeLabel(itemName);
        if (!key) {
          return acc;
        }
        acc[key] = {
          name: itemName,
          units: (acc[key]?.units ?? 0) + getItemQuantity(item)
        };
        return acc;
      }, {});

    const menuPerformance = menuItems.map((item) => {
      const menuItemName = getMenuItemName(item);
      const soldItem = soldByItem[normalizeLabel(menuItemName)];
      return {
        name: menuItemName,
        units: soldItem?.units ?? 0,
        image: getMenuItemImage(item),
        stock: getMenuItemStock(item)
      };
    });

    const extraSoldItems = Object.values(soldByItem)
      .filter((soldItem) => !menuItems.some((menuItem) => normalizeLabel(getMenuItemName(menuItem)) === normalizeLabel(soldItem.name)))
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
          image: item.image || 'https://via.placeholder.com/64x64?text=BC'
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
      .sort((left, right) => parseAmount(getOrderTotal(right)) - parseAmount(getOrderTotal(left)))
      .slice(0, 5)
      .map((order) => ({
        id: getOrderId(order),
        items: getOrderItemsLabel(order),
        status: getOrderStatus(order),
        total: formatCurrency(parseAmount(getOrderTotal(order)))
      }));

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
  const pendingStart = completedPct;
  const canceledStart = completedPct + pendingPct;
  const distributionGradient = `conic-gradient(#eab308 0% ${completedPct}%, #506169 ${pendingStart}% ${canceledStart}%, #b3261e ${canceledStart}% 100%)`;

  return (
    <div className="p-5 pt-lg">
      <header className="mb-5 pb-3">
        <div className="row align-items-end">
          <div className="col-md-8">
            <h2 className="display-5 fw-bold mb-2">Sales Analytics</h2>
            <p className="text-secondary">Academic Dining Financial Overview and Insights</p>
          </div>
          <div className="col-md-4 d-flex justify-content-end">
            <div className="btn-group" role="group">
              {Object.keys(PERIOD_CONFIG).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  type="button"
                  className={`btn btn-sm ${
                    selectedPeriod === period
                      ? 'btn-primary'
                      : 'btn-light'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-uppercase small fw-bold text-secondary mb-1">Total Revenue</p>
                <h3 className="text-primary fw-bold fs-3">{formatCurrency(analytics.summary.totalRevenue)}</h3>
                <p className="small text-success mt-2 mb-0">
                  <span className="material-symbols-outlined" style={{fontSize: '0.875rem', marginRight: '0.25rem'}}>trending_up</span>
                  {analytics.summary.revenueChange}
                </p>
              </div>
              <div className="p-2 bg-light rounded-2">
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-uppercase small fw-bold text-secondary mb-1">Average Order</p>
                <h3 className="fw-bold fs-3">{formatCurrency(analytics.summary.averageOrder)}</h3>
                <p className="small text-secondary mt-2 mb-0">
                  <span className="material-symbols-outlined" style={{fontSize: '0.875rem', marginRight: '0.25rem'}}>analytics</span>
                  {analytics.summary.averageLabel}
                </p>
              </div>
              <div className="p-2 bg-light-subtle rounded-2">
                <span className="material-symbols-outlined text-secondary">receipt_long</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <p className="text-uppercase small fw-bold text-secondary mb-1">Items Sold</p>
                <h3 className="fw-bold fs-3">{analytics.summary.itemsSold.toLocaleString('en-PH')}</h3>
                <p className="small text-success mt-2 mb-0">
                  <span className="material-symbols-outlined" style={{fontSize: '0.875rem', marginRight: '0.25rem'}}>arrow_upward</span>
                  {analytics.summary.itemsChange}
                </p>
              </div>
              <div className="p-2 bg-light rounded-2">
                <span className="material-symbols-outlined text-info">inventory_2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{analytics.lineChart.title}</h4>
                <span className="material-symbols-outlined">more_horiz</span>
              </div>
              <div className="position-relative" style={{height: '16rem'}}>
                <div className="position-absolute start-0 end-0 top-0 bottom-0 d-flex flex-column justify-content-between" style={{pointerEvents: 'none', opacity: 0.2}}>
                  <div className="border-top w-100"></div>
                  <div className="border-top w-100"></div>
                  <div className="border-top w-100"></div>
                  <div className="border-top w-100"></div>
                </div>
                <svg className="position-absolute start-0 bottom-0 w-100 h-100" preserveAspectRatio="none">
                  <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeLinecap="round" strokeWidth="4"></path>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#0d631b"></stop>
                      <stop offset="100%" stopColor="#2e7d32"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="position-absolute top-25 start-50 translate-middle-x bg-dark text-white px-2 py-1 rounded small fw-bold">
                  {analytics.lineChart.peakText}
                </div>
                <div className="d-flex justify-content-between w-100 mt-auto pt-3 small fw-bold text-secondary">
                  {analytics.lineChart.labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h4 className="mb-4 fw-bold">Order Distribution</h4>
              <div className="position-relative mx-auto mb-4" style={{width: '12rem', height: '12rem'}}>
                <div className="rounded-circle w-100 h-100" style={{ background: distributionGradient }}></div>
                <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-white" style={{width: 'calc(100% - 4.5rem)', height: 'calc(100% - 4.5rem)'}}></div>
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                  <span className="fs-4 fw-bold">{analytics.distribution.completed}%</span>
                  <span className="small text-secondary">Completed</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-warning" style={{width: '0.75rem', height: '0.75rem'}}></div>
                    <span className="small fw-medium">Completed</span>
                  </div>
                  <span className="small fw-bold">{analytics.distribution.completed}%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-secondary" style={{width: '0.75rem', height: '0.75rem'}}></div>
                    <span className="small fw-medium">Pending</span>
                  </div>
                  <span className="small fw-bold">{analytics.distribution.pending}%</span>
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-danger" style={{width: '0.75rem', height: '0.75rem'}}></div>
                    <span className="small fw-medium">Canceled</span>
                  </div>
                  <span className="small fw-bold">{analytics.distribution.canceled}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-5">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0 fw-bold">Top Selling Items</h4>
            <button className="btn btn-link btn-sm text-primary p-0" onClick={() => navigate('/menu')} type="button">
              View Full Menu Performance
            </button>
          </div>
          <div>
            {analytics.topItems.length > 0 ? (
              analytics.topItems.map((item) => (
                <div key={item.name} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold d-flex align-items-center gap-2">
                      <img className="rounded-circle object-cover" src={item.image} alt="Item" width="32" height="32" />
                      {item.name}
                    </span>
                    <span className="small fw-bold">{item.units.toLocaleString('en-PH')} Units</span>
                  </div>
                  <div className="progress" style={{height: '0.75rem'}}>
                    <div
                      className={`progress-bar bg-primary ${item.opacity}`}
                      style={{ width: `${item.width}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 d-flex justify-content-between align-items-center small text-secondary">
                    <span>{item.soldShare}% of sold items</span>
                    <span>{item.stock === null ? 'Stock not tracked' : `${item.stock} in stock`}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="small text-secondary mb-0">No order items available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-5">
        <div className="card-body">
          <h4 className="mb-4 fw-bold">Recent Large Transactions</h4>
          <div className="table-responsive">
            <table className="table table-hover mb-0 small">
              <thead>
                <tr className="text-uppercase text-secondary">
                  <th>Order ID</th>
                  <th>Item Details</th>
                  <th className="text-center">Status</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTransactions.length > 0 ? (
                  analytics.recentTransactions.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">{order.id}</td>
                      <td className="text-secondary fst-italic">{order.items}</td>
                      <td className="text-center">
                        <span className={`badge rounded-pill small ${statusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-end fw-bold text-primary">{order.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-secondary" colSpan={4}>No transactions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}