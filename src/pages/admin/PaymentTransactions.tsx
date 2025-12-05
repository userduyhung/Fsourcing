import React, { useState, useEffect } from 'react';
import adminPaymentService, { AdminPaymentDto } from '../../services/adminPaymentService';
import { logger } from '../../utils/logger';
import { 
  Loader2, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  Filter,
  CreditCard,
  TrendingUp,
  User,
  Building
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import adminOrderService from '../../services/adminOrderService';

const PaymentTransactions: React.FC = () => {
  const [payments, setPayments] = useState<AdminPaymentDto[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Array<{ id: number; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const toastIdRef = React.useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      logger.info('PaymentTransactions', 'fetching admin payments', { page: currentPage });
      
      const response = await adminPaymentService.getAllPayments(currentPage, 20);
      
      logger.debug('PaymentTransactions', 'raw response', { 
        response,
        hasData: !!response?.data,
        hasItems: !!response?.data?.items
      });
      
      const items = response?.data?.items || [];
      // Enrich payments with order-derived simplified status when possible
      const enriched = await Promise.all(items.map(async (p: AdminPaymentDto) => {
        try {
          if (p.orderId) {
            const order = await adminOrderService.getOrderById(p.orderId);
            // attach order info for later use
            (p as any).__orderStatus = (order?.status || '').toString();
            (p as any).__orderPaymentStatus = (order?.paymentStatus || '').toString();
            (p as any).__displayStatus = mapOrderToSimplifiedStatus(order, p);
          } else {
            (p as any).__displayStatus = simplifyPaymentStatus(p);
          }
        } catch (err) {
          // If order fetch fails, fallback to payment-derived status
          (p as any).__displayStatus = simplifyPaymentStatus(p);
        }
        return p;
      }));
      const totalPages = response?.data?.totalPages || 1;
      
      setPayments(enriched);
      setTotalPages(totalPages);
      
      logger.info('PaymentTransactions', 'payments loaded', { 
        count: items.length,
        totalPages
      });
    } catch (err: any) {
      logger.error('PaymentTransactions', 'failed to load payments', err);
      setError(err.message || 'Không thể tải danh sách giao dịch');
    } finally {
      setIsLoading(false);
    }
  };

  const syncPaymentWithOrder = async (payment: AdminPaymentDto) => {
    if (!payment.orderId) {
      logger.warn('PaymentTransactions', 'sync skipped - payment has no orderId', { paymentId: payment.id });
      return;
    }

    try {
      // set per-payment syncing flag
      setSyncingMap(m => ({ ...m, [payment.id]: true }));
      logger.info('PaymentTransactions', 'syncing payment with order', { orderId: payment.orderId, paymentId: payment.id });

      // Use admin order service so admin token is used and ownership checks pass
      const order = await adminOrderService.getOrderById(payment.orderId);

      // Determine desired paid flag from order status using canonical mapping
      const mapped = mapOrderToSimplifiedStatus(order, payment);
      const isPaid = mapped === 'completed';

      // Use providerTransactionId from payment if available
      const txId = payment.providerTransactionId;

      // Use admin update endpoint
      await adminOrderService.updatePaymentStatus(order.id, isPaid, txId);

      // Refresh payments list
      await fetchPayments();
      logger.info('PaymentTransactions', 'sync completed', { orderId: payment.orderId, isPaid });
      // push success toast
      const tid = ++toastIdRef.current;
      setToasts(t => [{ id: tid, type: 'success', message: `Đồng bộ thành công cho đơn ${order.id.substring(0,8)}` }, ...t]);
    } catch (err: any) {
      logger.error('PaymentTransactions', 'sync failed', err);
      setError(err?.message || 'Không thể đồng bộ trạng thái giao dịch');
      const tid = ++toastIdRef.current;
      setToasts(t => [{ id: tid, type: 'error', message: `Đồng bộ thất bại: ${err?.message || 'Lỗi'}` }, ...t]);
    } finally {
      // clear per-payment syncing flag
      setSyncingMap(m => ({ ...m, [payment.id]: false }));
    }
  };

  const pushToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = ++toastIdRef.current;
    setToasts(t => [{ id, type, message }, ...t]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 4500);
  };

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (!dateString || isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format payment description from items: e.g. "2 Bia & 1 Nước lọc"
  const formatPaymentItemsSummary = (p: AdminPaymentDto) => {
    try {
      if (p.items && Array.isArray(p.items) && p.items.length > 0) {
        return p.items.map((it: any) => {
          const qty = it.quantity ?? it.qty ?? 1;
          const name = (it.productName || it.name || 'Sản phẩm').toString();
          return `${qty} ${name}`;
        }).join(' & ');
      }
    } catch (e) {
      // fallback silently
    }
    return p.description || '';
  };

  const getStatusColor = (status: string) => {
    // Status here is the simplified status key (awaiting_payment | completed | failed | all)
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'text-green-600';
    if (s === 'awaiting_payment') return 'text-yellow-600';
    if (s === 'failed') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBgColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'bg-green-100 border-green-300';
    if (s === 'awaiting_payment') return 'bg-yellow-100 border-yellow-300';
    if (s === 'failed') return 'bg-red-100 border-red-300';
    return 'bg-gray-100 border-gray-300';
  };

  const getStatusText = (status: string) => {
    // Support simplified statuses and fall back to original text
    const map: Record<string, string> = {
      awaiting_payment: 'Chờ thanh toán',
      completed: 'Thành công',
      failed: 'Thất bại'
    };

    const key = (status || '').toLowerCase();
    return map[key] || status;
  };

  // Map raw payment object to simplified status keys used in UI
  const simplifyPaymentStatus = (p: AdminPaymentDto) => {
    const raw = (p.status || '').toString().toLowerCase();
    const pm = (p.paymentMethod || '').toString().toLowerCase();

    // If payment method indicates COD, show awaiting payment
    if (pm.includes('cod')) return 'awaiting_payment';

    // Common completed indicators
    if (['completed', 'success', 'paid'].includes(raw)) return 'completed';

    // Failure indicators
    if (['failed', 'cancelled', 'refunded', 'disputed'].includes(raw)) return 'failed';

    // Awaiting payment variants
    if (['awaiting_payment', 'pending', 'on-hold', 'on_hold'].includes(raw)) return 'awaiting_payment';

    // Default to awaiting_payment so admin can act
    return 'awaiting_payment';
  };

  // Map an order (and optionally payment) to the simplified status
  const mapOrderToSimplifiedStatus = (order: any, p?: AdminPaymentDto) => {
    const orderStatus = (order?.status || '').toString().toLowerCase();
    const orderPaymentStatus = (order?.paymentStatus || '').toString().toLowerCase();
    const pm = (p?.paymentMethod || '').toString().toLowerCase();

    // If order explicitly marked paid/completed -> treat as completed first
    // (Do this before COD-check so delivered orders show completed even when paymentMethod is COD)
    if (['completed', 'delivered', 'paid', 'success'].includes(orderPaymentStatus) || ['delivered', 'completed'].includes(orderStatus)) return 'completed';

    // If payment method indicates COD, show awaiting payment
    if (pm.includes('cod')) return 'awaiting_payment';

    // If order cancelled or refunded -> failed
    if (['cancelled', 'refunded'].includes(orderStatus) || ['failed', 'cancelled', 'refunded', 'disputed'].includes(orderPaymentStatus)) return 'failed';

    // If order is confirmed/shipped we still consider it completed only when delivered; otherwise await
    if (['shipped', 'confirmed'].includes(orderStatus)) return 'awaiting_payment';

    // Pending / default
    return 'awaiting_payment';
  };

  // Filter payments based on selected status
  const filteredPayments = statusFilter === 'all'
    ? payments
    : payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === statusFilter.toLowerCase());

  // Simplified tabs: All, Awaiting Payment (COD or pending), Completed, Failed
  const statusTabs = [
    { value: 'all', label: 'Tất cả', count: payments.length, color: 'blue', icon: CreditCard },
    { value: 'awaiting_payment', label: 'Chờ thanh toán', count: payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === 'awaiting_payment').length, color: 'yellow', icon: Clock },
    { value: 'completed', label: 'Thành công', count: payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === 'completed').length, color: 'green', icon: CheckCircle },
    { value: 'failed', label: 'Thất bại', count: payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === 'failed').length, color: 'red', icon: XCircle }
  ];

  // Calculate statistics
  const stats = {
    total: payments.length,
    completed: payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === 'completed').length,
    pending: payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === 'awaiting_payment').length,
    revenue: payments.filter(p => ((p as any).__displayStatus || simplifyPaymentStatus(p)) === 'completed').reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quản lý giao dịch thanh toán</h2>
              <p className="text-gray-600">Theo dõi và quản lý tất cả giao dịch thanh toán trong hệ thống</p>
            </div>
            <button 
              onClick={fetchPayments}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Làm mới</span>
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Tổng giao dịch</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CreditCard className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Thành công</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Tổng doanh thu</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Lỗi tải dữ liệu</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Danh sách giao dịch
            </h3>
          </div>

          <div className="p-6">
            {/* Status Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Lọc theo trạng thái</h4>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {statusTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setStatusFilter(tab.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                        statusFilter === tab.value
                          ? `bg-${tab.color}-500 text-white border-${tab.color}-600 shadow-md`
                          : `bg-white text-gray-700 border-gray-200 hover:border-${tab.color}-300 hover:bg-${tab.color}-50`
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          statusFilter === tab.value
                            ? 'bg-white/30 text-white'
                            : `bg-${tab.color}-100 text-${tab.color}-700`
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
                <span className="text-gray-600 font-medium">Đang tải giao dịch...</span>
              </div>
            ) : filteredPayments.length === 0 && payments.length > 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy giao dịch</h3>
                <p className="text-gray-600 mb-4">
                  Không có giao dịch nào với trạng thái "{statusTabs.find(t => t.value === statusFilter)?.label}"
                </p>
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Xem tất cả giao dịch
                </button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có giao dịch nào trong hệ thống</h3>
                <p className="text-gray-600 mb-4">Database chưa có dữ liệu payment.</p>
                <button 
                  onClick={fetchPayments}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                {/* Payments Grid */}
                <div className="space-y-4">
                  {filteredPayments.map(payment => (
                    <div 
                      key={payment.id} 
                      className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer hover:border-green-300"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-900">
                              Mã GD: #{payment.id.substring(0, 12).toUpperCase()}
                            </h4>
                            {
                              (() => {
                                const ds = (payment as any).__displayStatus || simplifyPaymentStatus(payment);
                                return (
                                  <span className={`px-3 py-1 rounded-full border-2 text-sm font-bold ${getStatusColor(ds)} ${getStatusBgColor(ds)}`}>
                                    {getStatusText(ds)}
                                  </span>
                                );
                              })()
                            }
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{payment.buyerName || payment.buyerEmail || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{payment.sellerName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(payment.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-bold text-green-600">{formatCurrency(payment.amount, payment.currency)}</span>
                            </div>
                          </div>

                          {(payment.items && payment.items.length > 0) || payment.description ? (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Nội dung:</span> {formatPaymentItemsSummary(payment)}
                            </div>
                          ) : null}

                          {/* Purchased items preview */}
                          {payment.items && payment.items.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Nội dung mua hàng:</p>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {payment.items.slice(0, 3).map((it: any, idx: number) => (
                                  <li key={idx}>{it.productName || it.name || 'Sản phẩm'} x{it.quantity ?? it.qty ?? 1}</li>
                                ))}
                                {payment.items.length > 3 && (
                                  <li className="text-xs text-gray-500">+{payment.items.length - 3} sản phẩm khác</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {payment.providerTransactionId && (
                            <div className="mt-1 text-xs text-gray-500">
                              <span className="font-medium">Mã giao dịch bên ngoài:</span> {payment.providerTransactionId}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayment(payment);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-4"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!syncingMap[payment.id]) syncPaymentWithOrder(payment);
                          }}
                          className="ml-3 px-3 py-2 flex items-center gap-2 border rounded-lg text-sm bg-white hover:bg-gray-50 transition"
                          title="Đồng bộ trạng thái với đơn hàng liên quan"
                          disabled={!!syncingMap[payment.id]}
                        >
                          {syncingMap[payment.id] ? (
                            <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-sm text-gray-700">{syncingMap[payment.id] ? 'Đang đồng bộ' : 'Đồng bộ'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toasts */}
                {toasts.length > 0 && (
                  <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
                    {toasts.map(t => (
                      <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${t.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : t.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-gray-50 border border-gray-200 text-gray-800'}`}>
                        {t.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      ← Trước
                    </button>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                      Trang {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal for payment details */}
      {isModalOpen && selectedPayment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto outline-none"
            tabIndex={0}
            aria-modal="true"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 sticky top-0 z-10">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <CreditCard className="w-7 h-7" />
                Chi tiết giao dịch #{selectedPayment.id.substring(0, 12).toUpperCase()}
              </h3>
            </div>

            <div className="p-8">
              {/* Payment Status */}
                <div className="mb-6 text-center">
                {
                  (() => {
                    const ds = ((selectedPayment as any).__displayStatus) || simplifyPaymentStatus(selectedPayment);
                    return (
                      <span className={`inline-flex px-6 py-3 rounded-full border-2 text-lg font-bold ${getStatusColor(ds)} ${getStatusBgColor(ds)}`}>
                        {getStatusText(ds)}
                      </span>
                    );
                  })()
                }
              </div>

              {/* Payment Amount */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-6 text-white text-center">
                <p className="text-sm font-semibold mb-2 opacity-90">Số tiền giao dịch</p>
                <p className="text-4xl font-bold">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </p>
              </div>

              {/* Transaction Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Người mua
                  </p>
                  <p className="text-gray-900 font-medium">{selectedPayment.buyerName || 'N/A'}</p>
                  {selectedPayment.buyerEmail && (
                    <p className="text-sm text-gray-600 mt-1">{selectedPayment.buyerEmail}</p>
                  )}
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Người bán
                  </p>
                  <p className="text-gray-900 font-medium">{selectedPayment.sellerName || 'N/A'}</p>
                  {selectedPayment.sellerEmail && selectedPayment.sellerEmail !== 'N/A' && (
                    <p className="text-sm text-gray-600 mt-1">{selectedPayment.sellerEmail}</p>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Thời gian tạo</p>
                      <p className="text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                    {(() => {
                      const formatted = formatDate(selectedPayment.updatedAt);
                      if (!formatted) return null;
                      return (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Cập nhật lần cuối</p>
                          <p className="text-gray-900">{formatted}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {selectedPayment.completedAt && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-1">Hoàn thành lúc</p>
                    <p className="text-gray-900">{formatDate(selectedPayment.completedAt)}</p>
                  </div>
                )}

                {(selectedPayment.items && selectedPayment.items.length > 0) || selectedPayment.description ? (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">📝 Nội dung giao dịch</p>
                    <p className="text-gray-700">{formatPaymentItemsSummary(selectedPayment)}</p>
                  </div>
                ) : null}

                {/* Full purchased items list */}
                {selectedPayment.items && selectedPayment.items.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-800 mb-3">🛒 Chi tiết đơn hàng</p>
                    <div className="space-y-2">
                      {selectedPayment.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm text-gray-700">
                          <div className="truncate pr-4">{it.productName || it.name || 'Sản phẩm'}</div>
                          <div className="font-medium">x{it.quantity ?? it.qty ?? 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPayment.paymentMethod && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm font-semibold text-purple-800 mb-1">💳 Phương thức thanh toán</p>
                    <p className="text-gray-900">{selectedPayment.paymentMethod}</p>
                  </div>
                )}

                {selectedPayment.paymentProvider && (
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-800 mb-1">🏦 Nhà cung cấp</p>
                    <p className="text-gray-900">{selectedPayment.paymentProvider}</p>
                  </div>
                )}

                {selectedPayment.providerTransactionId && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">🔗 Mã giao dịch bên ngoài</p>
                    <p className="text-gray-900 font-mono text-sm break-all">{selectedPayment.providerTransactionId}</p>
                  </div>
                )}

                {selectedPayment.orderId && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800 mb-1">📦 Mã đơn hàng liên quan</p>
                    <p className="text-gray-900 font-mono text-sm">{selectedPayment.orderId}</p>
                  </div>
                )}
              </div>

              <button
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-gray-800 hover:to-gray-900 focus:outline-none transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPayment(null);
                }}
              >
                <XCircle className="w-5 h-5" />
                Đóng
              </button>
              <div className="mt-3">
                <button
                  onClick={async () => {
                    if (selectedPayment) await syncPaymentWithOrder(selectedPayment);
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-white border text-gray-800 hover:bg-gray-50 transition font-semibold"
                >
                  <RefreshCw className="inline w-4 h-4 mr-2" />
                  Đồng bộ trạng thái với đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTransactions;
