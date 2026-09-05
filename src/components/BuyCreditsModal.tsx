import React, { useState, useEffect } from 'react';
import { CreditAccount, PaymentMethod, CreditPurchaseRequest } from '../types.js';
import {
  Coins,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Smartphone,
  Wallet,
  Globe,
  Send,
  X,
  Sparkles,
  Gift,
  ArrowRight,
  Receipt,
  History,
  ShieldCheck,
} from 'lucide-react';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditAccount: CreditAccount | null;
  onCreditsUpdated: (account: CreditAccount) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter Pack', credits: 250, priceUSD: '$15', pricePKR: 'Rs. 4,200', popular: false },
  { id: 'pro', name: 'Pro Growth', credits: 1000, priceUSD: '$49', pricePKR: 'Rs. 13,800', popular: true },
  { id: 'agency', name: 'Agency Scale', credits: 2500, priceUSD: '$99', pricePKR: 'Rs. 27,500', popular: false },
  { id: 'custom', name: 'Custom Amount', credits: 500, priceUSD: '$25', pricePKR: 'Rs. 7,000', popular: false },
];

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  isOpen,
  onClose,
  creditAccount,
  onCreditsUpdated,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'history' | 'daily'>('buy');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [customCredits, setCustomCredits] = useState<number>(500);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Form Fields for Purchase
  const [userName, setUserName] = useState('Client User');
  const [userEmail, setUserEmail] = useState('client@leadpulse.ai');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState<CreditPurchaseRequest | null>(null);

  // Order history
  const [myOrders, setMyOrders] = useState<CreditPurchaseRequest[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Daily bonus claim state
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
      fetchMyOrders();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      const data = await res.json();
      if (data.success && data.methods) {
        setPaymentMethods(data.methods);
        if (data.methods.length > 0) {
          setSelectedMethod(data.methods[0]);
        }
      }
    } catch {
      // Fallback
    }
  };

  const fetchMyOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await fetch(`/api/credits/my-orders?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && data.orders) {
        setMyOrders(data.orders);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleClaimDailyBonus = async () => {
    setIsClaimingBonus(true);
    try {
      const res = await fetch('/api/credits/daily-bonus', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.account) {
        onCreditsUpdated(data.account);
        onShowToast(data.message || 'Daily Free Bonus Claimed! +25 Credits', 'success');
      } else {
        onShowToast('Daily bonus already claimed for today. Try again in 24 hours!', 'info');
      }
    } catch {
      onShowToast('Could not claim daily bonus at this time.', 'error');
    } finally {
      setIsClaimingBonus(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      onShowToast('Please enter your name and email address.', 'error');
      return;
    }
    if (!transactionId.trim()) {
      onShowToast('Please enter your transaction reference ID / receipt code.', 'error');
      return;
    }
    if (!selectedMethod) {
      onShowToast('Please choose a payment method.', 'error');
      return;
    }

    const creditsCount =
      selectedPackage.id === 'custom' ? customCredits : selectedPackage.credits;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/credits/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName.trim(),
          user_email: userEmail.trim(),
          amount_credits: creditsCount,
          payment_method_id: selectedMethod.id,
          payment_method_name: selectedMethod.name,
          transaction_id: transactionId.trim(),
          sender_account: senderAccount.trim(),
          notes: notes.trim(),
          amount_paid:
            selectedPackage.id === 'custom'
              ? `Custom (${creditsCount} Credits)`
              : `${selectedPackage.priceUSD} / ${selectedPackage.pricePKR}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrderSubmitted(data.order);
        setTransactionId('');
        setSenderAccount('');
        setNotes('');
        onShowToast('Payment submitted! Admin will verify and assign your credits.', 'success');
        fetchMyOrders();
      } else {
        onShowToast(data.error || 'Failed to submit order', 'error');
      }
    } catch {
      onShowToast('Failed to submit order. Please check network connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#131b2e]/60 backdrop-blur-sm animate-fadeIn">
      <div
        id="buy-credits-modal"
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#eaedff] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eaedff] bg-gradient-to-r from-[#faf8ff] to-[#f0f3ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-md shadow-[#3525cd]/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">Credits & Billing Portal</h3>
              <p className="text-xs text-[#595768]">
                Current Balance:{' '}
                <span className="font-mono font-bold text-[#3525cd]">
                  {creditAccount?.balance ?? 250} Credits
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-[#595768] hover:text-[#131b2e] hover:bg-[#eaedff] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#eaedff] bg-white">
          <button
            onClick={() => {
              setActiveTab('buy');
              setOrderSubmitted(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'buy'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#595768] hover:text-[#131b2e]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Buy Credits</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#595768] hover:text-[#131b2e]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Purchase Requests</span>
            {myOrders.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#eaedff] text-[#3525cd] rounded-full">
                {myOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'daily'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#595768] hover:text-[#131b2e]'
            }`}
          >
            <Gift className="w-4 h-4 text-[#006e4b]" />
            <span>Free Daily Bonus</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: BUY CREDITS */}
          {activeTab === 'buy' && (
            <div>
              {orderSubmitted ? (
                <div className="text-center py-8 px-4 bg-[#f4f7ff] border border-[#d6e0ff] rounded-2xl">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#e6f7ef] text-[#006e4b] flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-[#131b2e] mb-1">
                    Order Submitted Successfully!
                  </h4>
                  <p className="text-sm text-[#464555] max-w-md mx-auto mb-4">
                    Your payment verification request has been sent directly to the Admin. As soon as
                    the transaction reference (<span className="font-mono font-bold text-[#131b2e]">{orderSubmitted.transaction_id}</span>) is confirmed, the Admin will credit your account balance.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fef3c7] text-[#92400e] text-xs font-semibold rounded-lg mb-6">
                    <Clock className="w-4 h-4" />
                    <span>Status: Pending Admin Approval</span>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('history')}
                      className="px-4 py-2 bg-[#3525cd] text-white text-xs font-bold rounded-xl hover:bg-[#281ca8] transition-colors"
                    >
                      Track Order Status
                    </button>
                    <button
                      onClick={() => setOrderSubmitted(null)}
                      className="px-4 py-2 bg-white border border-[#c7c4d8] text-[#131b2e] text-xs font-bold rounded-xl hover:bg-[#faf8ff] transition-colors"
                    >
                      Order More Credits
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  {/* Step 1: Choose Package */}
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2.5">
                      1. Select Credit Package
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {CREDIT_PACKAGES.slice(0, 3).map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPackage.id === pkg.id
                              ? 'border-[#3525cd] bg-[#f5f3ff] shadow-sm'
                              : 'border-[#eaedff] bg-white hover:border-[#c7c4d8]'
                          }`}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-[#3525cd] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Popular
                            </span>
                          )}
                          <div className="text-sm font-bold text-[#131b2e] mb-0.5">{pkg.name}</div>
                          <div className="flex items-baseline gap-1.5 mb-1">
                            <span className="text-2xl font-extrabold text-[#3525cd] font-mono">
                              {pkg.credits}
                            </span>
                            <span className="text-xs text-[#595768] font-medium">Credits</span>
                          </div>
                          <div className="text-xs font-bold text-[#131b2e]">{pkg.priceUSD}</div>
                          <div className="text-[11px] text-[#595768]">{pkg.pricePKR}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Payment Methods configured by Admin */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                        2. Choose Payment Method (Admin Configured)
                      </label>
                      <span className="text-[11px] text-[#595768] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#006e4b]" />
                        <span>Verified Admin Accounts</span>
                      </span>
                    </div>

                    {paymentMethods.length === 0 ? (
                      <div className="p-4 bg-[#fffbeb] border border-[#fef3c7] rounded-xl text-xs text-[#92400e]">
                        No payment methods currently active. Please contact the administrator.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {paymentMethods.map((pm) => (
                          <div
                            key={pm.id}
                            onClick={() => setSelectedMethod(pm)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                              selectedMethod?.id === pm.id
                                ? 'border-[#3525cd] bg-[#f5f3ff]'
                                : 'border-[#eaedff] bg-white hover:border-[#c7c4d8]'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#3525cd] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {pm.name.toLowerCase().includes('bank') ? (
                                <Building2 className="w-4 h-4" />
                              ) : pm.name.toLowerCase().includes('crypto') ||
                                pm.name.toLowerCase().includes('usdt') ? (
                                <Wallet className="w-4 h-4" />
                              ) : pm.name.toLowerCase().includes('paypal') ? (
                                <Globe className="w-4 h-4" />
                              ) : (
                                <Smartphone className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-[#131b2e] truncate">{pm.name}</div>
                              <div className="text-[11px] text-[#595768] truncate">
                                Title: {pm.account_title || 'Official'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Payment Method Details Box */}
                    {selectedMethod && (
                      <div className="mt-3 p-4 bg-[#f8f9ff] border border-[#c7c4d8]/60 rounded-xl">
                        <div className="text-xs font-bold text-[#3525cd] mb-1">
                          Payment Instructions for {selectedMethod.name}:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 text-xs">
                          <div>
                            <span className="text-[#595768]">Beneficiary Name: </span>
                            <span className="font-semibold text-[#131b2e]">
                              {selectedMethod.account_title}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#595768]">Account / IBAN / Wallet: </span>
                            <span className="font-mono font-bold text-[#131b2e] select-all bg-white px-2 py-0.5 rounded border border-[#eaedff]">
                              {selectedMethod.account_number}
                            </span>
                          </div>
                        </div>
                        {selectedMethod.instructions && (
                          <p className="text-[11px] text-[#464555] bg-white p-2.5 rounded-lg border border-[#eaedff]">
                            {selectedMethod.instructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Transaction Proof Submission */}
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2.5">
                      3. Submit Payment Reference Details
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#595768] mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="e.g. John Doe / Business Name"
                          className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#595768] mb-1">
                          Your Email (for credit allocation)
                        </label>
                        <input
                          type="email"
                          required
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="your.email@company.com"
                          className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#595768] mb-1">
                          Transaction ID / Reference / TxHash *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. TRX-982312 or TxID from bank SMS/app"
                          className="w-full px-3 py-2 text-xs font-mono border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#595768] mb-1">
                          Sender Account / Mobile / Notes
                        </label>
                        <input
                          type="text"
                          value={senderAccount}
                          onChange={(e) => setSenderAccount(e.target.value)}
                          placeholder="e.g. Sent from 0300-XXXXXXX"
                          className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#595768] mb-1">
                        Optional Payment Note for Admin
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Paid online, please activate quickly"
                        className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3525cd]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting Order to Admin...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>
                            Submit Payment Proof for {selectedPackage.credits} Credits ({selectedPackage.priceUSD})
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-[#595768] mt-2">
                      Admin manually reviews incoming receipts and assigns requested credits promptly.
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: MY PURCHASE HISTORY */}
          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#131b2e]">Your Credit Orders & Status</h4>
                <button
                  onClick={fetchMyOrders}
                  className="text-xs text-[#3525cd] font-semibold hover:underline"
                >
                  Refresh Orders
                </button>
              </div>

              {isLoadingOrders ? (
                <div className="text-center py-10 text-xs text-[#595768]">Loading your orders...</div>
              ) : myOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#c7c4d8] rounded-xl">
                  <Receipt className="w-10 h-10 text-[#c7c4d8] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#131b2e] mb-1">No Orders Yet</p>
                  <p className="text-[11px] text-[#595768] mb-3">
                    Submit your first payment proof above to request credits from the admin.
                  </p>
                  <button
                    onClick={() => setActiveTab('buy')}
                    className="px-3 py-1.5 bg-[#3525cd] text-white text-xs font-bold rounded-lg"
                  >
                    Buy Credits Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-[#eaedff] bg-[#faf8ff] hover:bg-white transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#131b2e]">
                              +{order.amount_credits} Credits
                            </span>
                            <span className="text-xs text-[#595768]">({order.amount_paid})</span>
                          </div>
                          <div className="text-xs text-[#464555] font-medium">
                            Via: {order.payment_method_name}
                          </div>
                        </div>

                        <div>
                          {order.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6f7ef] text-[#006e4b]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved (+{order.credits_granted || order.amount_credits})</span>
                            </span>
                          )}
                          {order.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fffbeb] text-[#b45309]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Admin Review</span>
                            </span>
                          )}
                          {order.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fef2f2] text-[#b91c1c]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#595768] pt-2 border-t border-[#eaedff]">
                        <div>
                          <span className="font-medium">TxID: </span>
                          <span className="font-mono font-semibold text-[#131b2e] select-all">
                            {order.transaction_id}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Date: </span>
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        {order.admin_notes && (
                          <div className="sm:col-span-2 text-[11px] text-[#3525cd] bg-white p-2 rounded border border-[#eaedff]">
                            <span className="font-bold">Admin Note: </span>
                            {order.admin_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FREE DAILY BONUS */}
          {activeTab === 'daily' && (
            <div className="text-center py-8 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#006e4b] to-[#10b981] text-white flex items-center justify-center mb-4 shadow-lg shadow-[#006e4b]/20">
                <Gift className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#131b2e] mb-1">Free Daily Bonus Refill</h4>
              <p className="text-xs text-[#595768] mb-6">
                Claim +25 Free Credits every 24 hours to keep scraping leads and running deep SEO site
                audits without interruption!
              </p>

              <button
                onClick={handleClaimDailyBonus}
                disabled={isClaimingBonus}
                className="w-full py-3 px-4 bg-[#006e4b] hover:bg-[#005338] text-white text-xs font-bold rounded-xl shadow-md shadow-[#006e4b]/20 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isClaimingBonus ? 'Claiming...' : 'Claim +25 Free Daily Credits'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
