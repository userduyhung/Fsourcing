import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../../types';
import QRCode from 'react-qr-code';
import { getCart, clearCart } from '../../services/cartService';
import { sanitizeCartItems } from '../../utils/cartValidation';
import { validateAddress, validatePayment, validateVietQRConfig, validateCart } from '../../utils/purchaseValidation';
import showAppToast from '../../utils/toast';

const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

interface CheckoutPageProps { onClearCart?: () => void; paymentQRCodeUrl?: string }

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onClearCart, paymentQRCodeUrl }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  
  // Address selection states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [street, setStreet] = useState('');

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts))
        .catch(err => console.error(err));
    } else {
      setDistricts([]);
    }
    setSelectedDistrict('');
    setWards([]);
    setSelectedWard('');
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards))
        .catch(err => console.error(err));
    } else {
      setWards([]);
    }
    setSelectedWard('');
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard && street) {
      const p = provinces.find(x => x.code == selectedProvince)?.name;
      const d = districts.find(x => x.code == selectedDistrict)?.name;
      const w = wards.find(x => x.code == selectedWard)?.name;
      if (p && d && w) {
        setAddress(`${street}, ${w}, ${d}, ${p}`);
      }
    } else {
      setAddress('');
    }
  }, [selectedProvince, selectedDistrict, selectedWard, street, provinces, districts, wards]);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [externalQRCodeUrl, setExternalQRCodeUrl] = useState<string | null>(null);
  const [loadingRef, setLoadingRef] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  // Fixed QR code URL (Old static method - commented out)
  // const PAYMENT_QR_URL = 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764134757/thongtinthanhtoan_zjdrbl.jpg';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Always read from localStorage (ignore propCart to ensure latest data)
        const stored = await getCart();
        if (!mounted) return;
        setCart(sanitizeCartItems(stored.items as any));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    };
    load();
    // If a QR URL/payload is provided via the query string (?qr=...), capture it
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('qr');
      if (q && q.trim()) setExternalQRCodeUrl(q.trim());
    } catch (e) {
      // ignore
    }
    return () => { mounted = false; };
  }, []);

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0);

  // VietQR API Configuration (moved after total calculation)
  const VIETQR_CONFIG = {
    accountNo: '100876738714',
    accountName: 'NGUYEN DUY HUNG',
    acqId: '970415',  // Mã ngân hàng Vietinbank
    amount: total,
    addInfo: `FSOURCING ${Date.now().toString().slice(-6)}`,  // Nội dung chuyển khoản
    format: 'text',
    template: 'compact'
  };

  const createLocalPaymentRef = async () => {
    // Validate address components
    const addressValidation = validateAddress(
      provinces.find(p => p.code == selectedProvince)?.name || '',
      districts.find(d => d.code == selectedDistrict)?.name || '',
      wards.find(w => w.code == selectedWard)?.name || '',
      street
    );
    
    if (!addressValidation.isValid) {
      showAppToast(addressValidation.errors[0] || 'Địa chỉ không hợp lệ', 'error', 2500);
      return;
    }
    
    // Validate cart before payment
    const cartValidation = validateCart(cart);
    if (!cartValidation.isValid) {
      showAppToast(cartValidation.errors[0] || 'Giỏ hàng có lỗi', 'error', 2500);
      return;
    }
    
    // Validate payment details
    const paymentValidation = validatePayment(cart, address, total);
    if (!paymentValidation.isValid) {
      showAppToast(paymentValidation.errors[0] || 'Thông tin thanh toán không hợp lệ', 'error', 2500);
      return;
    }
    
    // Show warnings if any
    if (paymentValidation.warnings.length > 0) {
      showAppToast(paymentValidation.warnings[0], 'warning', 2500);
    }
    
    setShowPayment(true);
    setRefError(null);
    setLoadingRef(true);
    try {
      // If an external QR was provided via query param, prefer it first
      if (externalQRCodeUrl && externalQRCodeUrl.trim()) {
        setPaymentRef(externalQRCodeUrl.trim());
        setLoadingRef(false);
        return;
      }

      // If the caller provided an explicit image or payload URL prop, prefer that
      if (paymentQRCodeUrl && paymentQRCodeUrl.trim()) {
        setPaymentRef(paymentQRCodeUrl.trim());
        setLoadingRef(false);
        return;
      }

      // OLD METHOD: Use fixed payment QR URL
      // await new Promise((r) => setTimeout(r, 600));
      // setPaymentRef(PAYMENT_QR_URL);

      // NEW METHOD: Generate dynamic QR using VietQR API
      const vietQRPayload = {
        accountNo: VIETQR_CONFIG.accountNo,
        accountName: VIETQR_CONFIG.accountName,
        acqId: VIETQR_CONFIG.acqId,
        amount: VIETQR_CONFIG.amount,
        addInfo: VIETQR_CONFIG.addInfo,
        format: VIETQR_CONFIG.format,
        template: VIETQR_CONFIG.template
      };
      
      // Validate VietQR config before API call
      const qrValidation = validateVietQRConfig(vietQRPayload);
      if (!qrValidation.isValid) {
        throw new Error(qrValidation.errors[0] || 'Cấu hình VietQR không hợp lệ');
      }

      const vietQRResponse = await fetch('https://api.vietqr.io/v2/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vietQRPayload)
      });

      if (!vietQRResponse.ok) {
        throw new Error('VietQR API không phản hồi');
      }

      const vietQRData = await vietQRResponse.json();
      
      if (vietQRData.code === '00' && vietQRData.data?.qrDataURL) {
        // VietQR trả về base64 image
        setPaymentRef(vietQRData.data.qrDataURL);
      } else {
        throw new Error(vietQRData.desc || 'Không thể tạo mã QR');
      }
    } catch (e: any) {
      console.error('Failed to create payment QR:', e);
      setRefError(`Không thể tạo mã thanh toán: ${e.message || 'Lỗi không xác định'}`);
    } finally {
      setLoadingRef(false);
    }
  };

  const handleSimulatePayment = () => {
    // Simple simulation: navigate to success page and clear local cart if desired
    try {
      // Clear localCart so subsequent visits show an empty cart
      try {
        clearCart();
      } catch (e) {
        // fallback: remove directly
        try { localStorage.removeItem('localCart'); } catch (_) { /* ignore */ }
      }
      // Notify parent App to clear its in-memory cart state so header/counts update
      try {
        if (onClearCart) onClearCart();
      } catch (e) {
        console.warn('onClearCart callback failed', e);
      }
      navigate('/buyer/payment-success', { state: { reference: paymentRef || externalQRCodeUrl || paymentQRCodeUrl, total } });
    } catch (e) {
      console.error('Navigation failed', e);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống.</h2>
          <p className="text-gray-600">Hãy chọn một vài sản phẩm để bắt đầu.</p>
        </div>
      </div>
    );
  }

  if (showPayment) {
    if (loadingRef) {
      return (
        <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đang tạo mã thanh toán (mô phỏng)...</h2>
          </div>
        </div>
      );
    }

    if (refError) {
      return (
        <div className="bg-[#f8ecd7] min-h-screen font-sans flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi tạo mã thanh toán</h2>
            <p className="text-gray-700 mb-4">{refError}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold" onClick={() => { setShowPayment(false); setRefError(null); }}>
              Quay lại
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#f8ecd7] min-h-screen font-sans py-8">
        <main className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6">
            <div className="md:flex-1">
              <h2 className="text-2xl font-bold mb-4">Thông tin đơn hàng</h2>
              <ul className="divide-y">
                {cart.map((item) => (
                  <li key={item.id} className="py-3 flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{currency((Number(item.price) || 0) * (item.quantity || 1))}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{currency(total)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">Địa chỉ giao hàng: <span className="font-medium">{address || 'Chưa có'}</span></div>
              </div>
            </div>
            <div className="md:w-80 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-3">Thanh toán (Mô phỏng)</h3>
              <div className="bg-gray-50 p-4 rounded w-full flex items-center justify-center">
                {(externalQRCodeUrl || paymentQRCodeUrl) ? (
                  <img src={externalQRCodeUrl || paymentQRCodeUrl || undefined} alt="QR Payment" className="max-w-full h-auto object-contain" />
                ) : paymentRef ? (
                  // Check if paymentRef is a base64 image or URL
                  (paymentRef.startsWith('data:image') || 
                   ((paymentRef.startsWith('http://') || paymentRef.startsWith('https://')) && 
                    (paymentRef.includes('.jpg') || paymentRef.includes('.jpeg') || paymentRef.includes('.png') || paymentRef.includes('.gif') || paymentRef.includes('.webp')))) ? (
                    <img src={paymentRef} alt="QR Payment" className="max-w-full h-auto object-contain" />
                  ) : (
                    <QRCode value={paymentRef} size={180} />
                  )
                ) : (
                  <div className="text-sm text-gray-500">Mã thanh toán đang được tạo...</div>
                )}
              </div>
              <div className="mt-4 text-gray-500 text-sm text-center">
                Quét mã QR bằng ứng dụng ngân hàng để thanh toán.
                <div className="text-xs mt-2">
                  <strong>Số tiền:</strong> {currency(total)}<br/>
                  <strong>Nội dung:</strong> FSOURCING {Date.now().toString().slice(-6)}
                </div>
              </div>
              <button className="mt-4 w-full bg-green-600 text-white py-2 rounded" onClick={handleSimulatePayment}>
                Đã thanh toán (Mô phỏng)
              </button>
              <button className="mt-2 w-full bg-gray-200 py-2 rounded" onClick={() => { setShowPayment(false); setPaymentRef(null); }}>
                Hủy
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans py-8">
      <main className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4">Xác nhận đơn hàng (Mô phỏng)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-4 bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Sản phẩm</h3>
                <ul className="divide-y">
                  {cart.map(item => (
                    <li key={item.id} className="py-3 flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">{currency((Number(item.price) || 0) * (item.quantity || 1))}</div>
                        <div className="text-xs text-gray-400">{currency(Number(item.price) || 0)} / cái</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2">Địa chỉ giao hàng</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tỉnh / Thành phố</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={selectedProvince}
                      onChange={e => setSelectedProvince(e.target.value)}
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quận / Huyện</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phường / Xã</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      value={selectedWard}
                      onChange={e => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Số nhà, tên đường</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
                  />
                </div>
                {address && <div className="mt-2 text-sm text-gray-500 italic">Địa chỉ đầy đủ: {address}</div>}
              </div>
            </div>

            <aside className="md:col-span-1 bg-gray-50 p-4 rounded">
              <div className="mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{currency(total)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">Phí vận chuyển được tính khi xác nhận đơn.</div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold text-white ${address.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
                onClick={createLocalPaymentRef}
                disabled={!address.trim()}
              >
                Xác nhận đặt hàng (Mô phỏng)
              </button>

              <button
                className="w-full mt-3 py-2 rounded-lg border border-gray-300 text-gray-700"
                onClick={() => window.history.back()}
              >
                Tiếp tục mua sắm
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
