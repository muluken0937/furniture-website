'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, extractErrorMessage, handleTokenExpiration } from '@/utils/apiHelpers';
import { 
  ShoppingCartIcon, 
  EyeIcon,
  PencilIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    image?: string;
    images?: Array<{ image: string }>;
  };
  quantity: number;
  subtotal: string;
}

interface Cart {
  id: number;
  items: CartItem[];
  subtotal: string;
  total_items: number;
}

interface Order {
  id: number;
  user: number | {
    id: number;
    username: string;
    email: string;
  };
  cart: Cart;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
  shipping_address: any;
  billing_address: any;
  payment_method: string;
  payment_status: string;
  tracking_number?: string;
  notes?: string;
  total: string;
  created_at: string;
  updated_at: string;
}

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusForm, setStatusForm] = useState({
    status: 'Pending' as Order['status'],
    tracking_number: '',
  });

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    if (!apiUrl) {
      setError('API URL is not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const url = selectedStatus === 'all' 
        ? `${apiUrl}/api/orders/`
        : `${apiUrl}/api/orders/?status=${selectedStatus}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.results || data);
        setError(null);
      } else {
        if (handleTokenExpiration(response)) {
          return;
        }
        
        if (response.status === 401 || response.status === 403) {
          const errorMsg = 'Authentication failed. Please log in again.';
          setError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = extractErrorMessage(errorData, 'Failed to fetch orders. Please try again.');
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load orders';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status,
      tracking_number: order.tracking_number || '',
    });
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!apiUrl || !token || !selectedOrder) {
      toast.error('Missing required information');
      return;
    }

    // Validate tracking number for shipped/delivered status
    if ((statusForm.status === 'Shipped' || statusForm.status === 'Delivered') && !statusForm.tracking_number.trim()) {
      toast.error('Tracking number is required for shipped/delivered orders');
      return;
    }

    const updateToast = toast.loading('Updating order status...');

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/orders/${selectedOrder.id}/update-status/`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          status: statusForm.status,
          tracking_number: statusForm.tracking_number || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully!', { id: updateToast });
        setShowStatusModal(false);
        setSelectedOrder(null);
        await fetchOrders();
      } else {
        if (handleTokenExpiration(response)) {
          toast.dismiss(updateToast);
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData, 'Failed to update order status. Please try again.');
        toast.error(errorMessage, { id: updateToast });
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', { id: updateToast });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return ClockIcon;
      case 'Processing':
        return PencilIcon;
      case 'Shipped':
        return TruckIcon;
      case 'Delivered':
        return CheckCircleIcon;
      case 'Cancelled':
      case 'Refunded':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getUserDisplay = (order: Order) => {
    if (typeof order.user === 'object') {
      return `${order.user.username} (${order.user.email})`;
    }
    return `User ID: ${order.user}`;
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="staff">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="staff">
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-accent/20">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage customer orders</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {getUserDisplay(order)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {order.cart?.total_items || order.cart?.items?.length || 0} item(s)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ${parseFloat(order.total || order.cart?.subtotal || '0').toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-secondary hover:text-secondary/80"
                              title="View order details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order)}
                              className="text-accent hover:text-secondary"
                              title="Update order status"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4 bg-white rounded-lg shadow-sm border border-accent/20">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {selectedStatus === 'all' 
                  ? 'No orders have been placed yet.'
                  : `No orders with status "${selectedStatus}" found.`}
              </p>
            </div>
          )}

          {/* Status Update Modal */}
          {showStatusModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h2>
                  <p className="text-sm text-gray-600 mb-4">Order #{selectedOrder.id}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        id="status"
                        required
                        value={statusForm.status}
                        onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as Order['status'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="tracking_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number
                        {(statusForm.status === 'Shipped' || statusForm.status === 'Delivered') && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      <input
                        type="text"
                        id="tracking_number"
                        required={statusForm.status === 'Shipped' || statusForm.status === 'Delivered'}
                        value={statusForm.tracking_number}
                        onChange={(e) => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        placeholder="Enter tracking number"
                      />
                      {(statusForm.status === 'Shipped' || statusForm.status === 'Delivered') && (
                        <p className="mt-1 text-xs text-gray-500">Required for shipped/delivered orders</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowStatusModal(false);
                          setSelectedOrder(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveStatus}
                        className="px-4 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:bg-secondary/90"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default OrdersPage;

