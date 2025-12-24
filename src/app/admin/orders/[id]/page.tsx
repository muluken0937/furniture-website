'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, extractErrorMessage, handleTokenExpiration } from '@/utils/apiHelpers';
import { ArrowLeftIcon, PencilIcon, TruckIcon } from '@heroicons/react/24/outline';
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

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'Pending' as Order['status'],
    tracking_number: '',
  });

  const apiUrl = getApiUrl();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    if (!apiUrl || !token || !orderId) {
      setError('Missing required information');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setStatusForm({
          status: data.status,
          tracking_number: data.tracking_number || '',
        });
        setError(null);
      } else {
        if (handleTokenExpiration(response)) {
          return;
        }
        
        if (response.status === 404) {
          setError('Order not found');
          toast.error('Order not found');
        } else if (response.status === 401 || response.status === 403) {
          const errorMsg = 'Authentication failed. Please log in again.';
          setError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = extractErrorMessage(errorData, 'Failed to fetch order. Please try again.');
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load order';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    if (order) {
      setShowStatusModal(true);
    }
  };

  const handleSaveStatus = async () => {
    if (!apiUrl || !token || !order) {
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
      const response = await fetch(`${apiUrl}/api/orders/${order.id}/update-status/`, {
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
        await fetchOrder();
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

  const getUserDisplay = (order: Order) => {
    if (typeof order.user === 'object') {
      return {
        username: order.user.username,
        email: order.user.email,
      };
    }
    return {
      username: `User ID: ${order.user}`,
      email: '',
    };
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

  if (error && !order) {
    return (
      <ProtectedRoute requiredRole="staff">
        <AdminLayout>
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-accent hover:text-gray-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Orders
            </button>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return null;
  }

  const userInfo = getUserDisplay(order);

  return (
    <ProtectedRoute requiredRole="staff">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent hover:text-gray-700 hover:bg-accent/10 rounded-lg border border-accent/20 hover:border-accent/40 transition-all duration-200"
            >
              <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back to Orders
            </button>
            <button
              onClick={handleUpdateStatus}
              className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Update Status
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Order Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Username:</span> {userInfo.username}</p>
                  {userInfo.email && <p><span className="font-medium">Email:</span> {userInfo.email}</p>}
                </div>
              </div>

              {/* Payment Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Method:</span> {order.payment_method}</p>
                  <p><span className="font-medium">Status:</span> {order.payment_status}</p>
                  <p><span className="font-medium">Total:</span> ${parseFloat(order.total || order.cart?.subtotal || '0').toFixed(2)}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    {typeof order.shipping_address === 'string' ? (
                      <p>{order.shipping_address}</p>
                    ) : (
                      <div>
                        {order.shipping_address.street && <p>{order.shipping_address.street}</p>}
                        {order.shipping_address.city && order.shipping_address.state && (
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                        )}
                        {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Billing Address */}
              {order.billing_address && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Address</h3>
                  <div className="text-sm text-gray-600">
                    {typeof order.billing_address === 'string' ? (
                      <p>{order.billing_address}</p>
                    ) : (
                      <div>
                        {order.billing_address.street && <p>{order.billing_address.street}</p>}
                        {order.billing_address.city && order.billing_address.state && (
                          <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.zip}</p>
                        )}
                        {order.billing_address.country && <p>{order.billing_address.country}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Information */}
            {order.tracking_number && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <TruckIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                    <p className="text-sm text-blue-700">{order.tracking_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              {order.cart?.items && order.cart.items.length > 0 ? (
                <div className="space-y-3">
                  {order.cart.items.map((item) => {
                    const productImage = item.product.images && item.product.images.length > 0
                      ? item.product.images[0].image
                      : item.product.image;
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {productImage && (
                          <img
                            src={productImage.startsWith('http') ? productImage : `${apiUrl}${productImage}`}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${parseFloat(item.subtotal).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">${parseFloat(item.product.price).toFixed(2)} each</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No items found</p>
              )}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Status Update Modal */}
          {showStatusModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h2>
                  <p className="text-sm text-gray-600 mb-4">Order #{order.id}</p>
                  
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
                        onClick={() => setShowStatusModal(false)}
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

export default OrderDetailPage;

