/**
 * Order Status Utilities
 * Maps to backend OrderStatus enum
 */

export const ORDER_STATUS = {
  PENDING_PAYMENT: { id: 1, label: 'To Pay', color: 'orange', icon: '⏳' },
  PAID: { id: 2, label: 'Paid', color: 'lime', icon: '💰' },
  CONFIRMED: { id: 3, label: 'Confirmed', color: 'blue', icon: '✅' },
  PREPARING: { id: 4, label: 'Preparing', color: 'yellow', icon: '📦' },
  SHIPPING: { id: 5, label: 'Shipping', color: 'purple', icon: '🚚' },
  DELIVERED: { id: 6, label: 'Delivered', color: 'cyan', icon: '✅' },
  COMPLETED: { id: 7, label: 'Completed', color: 'green', icon: '🎉' },
  CANCELLED: { id: 8, label: 'Cancelled', color: 'red', icon: '❌' },
  RETURNED: { id: 9, label: 'Returned', color: 'pink', icon: '↩️' }
};

/**
 * Get current status from order
 */
export const getCurrentStatus = (order) => {
  if (!order?.status || order.status.length === 0) return null;
  return order.status[order.status.length - 1];
};

/**
 * Get status config by ID
 */
export const getStatusConfig = (statusId) => {
  return Object.values(ORDER_STATUS).find(s => s.id === statusId) || null;
};

/**
 * Get status label
 */
export const getStatusLabel = (statusId) => {
  const config = getStatusConfig(statusId);
  return config ? config.label : 'Unknown';
};

/**
 * Get status color for Tag
 */
export const getStatusColor = (statusId) => {
  const config = getStatusConfig(statusId);
  return config ? config.color : 'default';
};

/**
 * Get status icon
 */
export const getStatusIcon = (statusId) => {
  const config = getStatusConfig(statusId);
  return config ? config.icon : '❓';
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (statusId) => {
  return statusId < 5; // Can cancel before SHIPPING
};

/**
 * Check if status is final
 */
export const isFinalStatus = (statusId) => {
  return statusId === 7 || statusId === 8; // COMPLETED or CANCELLED
};

