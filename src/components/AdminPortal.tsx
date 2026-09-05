import React, { useState, useEffect } from 'react';
import {
  CreditPurchaseRequest,
  PaymentMethod,
  AppUser,
  BlogPost,
  BlogCategory,
  CustomPage,
} from '../types.js';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Receipt,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  FolderTree,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  Key,
  Save,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface AdminPortalProps {
  onExitAdmin: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onExitAdmin,
  onShowToast,
  onNavigateTab,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<
    'orders' | 'users' | 'payment-methods' | 'blogs' | 'categories' | 'pages' | 'security'
  >('orders');

  // Data Collections
  const [orders, setOrders] = useState<CreditPurchaseRequest[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Action Dialogs
  const [approvingOrder, setApprovingOrder] = useState<CreditPurchaseRequest | null>(null);
  const [grantedCreditsInput, setGrantedCreditsInput] = useState<number>(100);
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');

  // User Credit Adjust Dialog
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [userCreditAmount, setUserCreditAmount] = useState<number>(100);
  const [userCreditReason, setUserCreditReason] = useState<string>('Admin manual credit grant');

  // Payment Method Create/Edit
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isCreatingMethod, setIsCreatingMethod] = useState<boolean>(false);
  const [methodForm, setMethodForm] = useState<{
    name: string;
    account_title: string;
    account_number: string;
    instructions: string;
    is_active: boolean;
  }>({
    name: '',
    account_title: '',
    account_number: '',
    instructions: '',
    is_active: true,
  });

  // Blog Post Create/Edit
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [postForm, setPostForm] = useState<{
    title: string;
    slug: string;
    category_id: string;
    category_name: string;
    excerpt: string;
    content: string;
    featured_image: string;
    author: string;
    read_time: string;
    status: 'published' | 'draft';
  }>({
    title: '',
    slug: '',
    category_id: '',
    category_name: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author: 'LeadPulse Editorial',
    read_time: '5 min read',
    status: 'published',
  });

  // Category Create/Edit
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    slug: string;
    description: string;
    color: string;
  }>({
    name: '',
    slug: '',
    description: '',
    color: '#3525cd',
  });

  // Custom Page Create/Edit
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState<boolean>(false);
  const [pageForm, setPageForm] = useState<{
    title: string;
    slug: string;
    content: string;
    meta_description: string;
    is_published: boolean;
  }>({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    is_published: true,
  });

  // Passcode change
  const [currentCodeInput, setCurrentCodeInput] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');

  // Auto-verify if admin token in sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('leadpulse_admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchAllAdminData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Please enter admin passcode.');
      return;
    }
    setIsVerifying(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('leadpulse_admin_token', data.token);
        setIsAuthenticated(true);
        onShowToast('Master Admin Access Granted', 'success');
        fetchAllAdminData();
      } else {
        setAuthError(data.error || 'Invalid passcode. Access Denied.');
      }
    } catch {
      setAuthError('Server error during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('leadpulse_admin_token');
    setIsAuthenticated(false);
    onShowToast('Logged out of Admin Mode', 'info');
    onExitAdmin();
  };

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, methodsRes, blogsRes, catsRes, pagesRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/users'),
        fetch('/api/admin/payment-methods'),
        fetch('/api/blogs?all=true'),
        fetch('/api/categories'),
        fetch('/api/pages?all=true'),
      ]);

      const [ordersData, usersData, methodsData, blogsData, catsData, pagesData] =
        await Promise.all([
          ordersRes.json(),
          usersRes.json(),
          methodsRes.json(),
          blogsRes.json(),
          catsRes.json(),
          pagesRes.json(),
        ]);

      if (ordersData.orders) setOrders(ordersData.orders);
      if (usersData.users) setUsers(usersData.users);
      if (methodsData.methods) setPaymentMethods(methodsData.methods);
      if (blogsData.posts) setBlogPosts(blogsData.posts);
      if (catsData.categories) setCategories(catsData.categories);
      if (pagesData.pages) setPages(pagesData.pages);
    } catch {
      onShowToast('Error loading admin records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ORDERS / CREDIT APPROVALS ---
  const handleOpenApprovalModal = (order: CreditPurchaseRequest) => {
    setApprovingOrder(order);
    setGrantedCreditsInput(order.amount_credits);
    setAdminNotesInput(`Approved by Admin. ${order.amount_credits} credits assigned.`);
  };

  const handleConfirmApproval = async () => {
    if (!approvingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${approvingOrder.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits_granted: grantedCreditsInput,
          admin_notes: adminNotesInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(data.message, 'success');
        setApprovingOrder(null);
        fetchAllAdminData();
      } else {
        onShowToast(data.message || 'Approval failed', 'error');
      }
    } catch {
      onShowToast('Failed to approve order', 'error');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = window.prompt('Enter reason for rejecting this purchase request:');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: reason }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast('Order rejected', 'info');
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to reject order', 'error');
    }
  };

  // --- USER CREDITS DIRECT MANIPULATION ---
  const handleSaveUserCredits = async (mode: 'set' | 'adjust') => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: userCreditAmount,
          reason: userCreditReason,
          mode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(data.message, 'success');
        setSelectedUser(null);
        fetchAllAdminData();
      } else {
        onShowToast(data.message || 'Operation failed', 'error');
      }
    } catch {
      onShowToast('Failed to update user credits', 'error');
    }
  };

  // --- PAYMENT METHODS CMS ---
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        const res = await fetch(`/api/admin/payment-methods/${editingMethod.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodForm),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast('Payment method updated', 'success');
          setEditingMethod(null);
          fetchAllAdminData();
        }
      } else {
        const res = await fetch('/api/admin/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodForm),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast('New payment method added', 'success');
          setIsCreatingMethod(false);
          fetchAllAdminData();
        }
      }
    } catch {
      onShowToast('Failed to save payment method', 'error');
    }
  };

  const handleTogglePaymentMethod = async (method: PaymentMethod) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !method.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(
          `${method.name} is now ${!method.is_active ? 'Active' : 'Inactive'}`,
          'info'
        );
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to toggle status', 'error');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Payment method deleted', 'info');
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to delete payment method', 'error');
    }
  };

  // --- BLOG POSTS CMS ---
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        const res = await fetch(`/api/admin/blogs/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postForm),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast('Article updated', 'success');
          setEditingPost(null);
          fetchAllAdminData();
        }
      } else {
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postForm),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast('New article published', 'success');
          setIsCreatingPost(false);
          fetchAllAdminData();
        }
      }
    } catch {
      onShowToast('Failed to save article', 'error');
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!window.confirm('Delete this blog article permanently?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Article deleted', 'info');
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to delete article', 'error');
    }
  };

  // --- CATEGORIES CMS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast('Category created', 'success');
        setIsCreatingCategory(false);
        setCategoryForm({ name: '', slug: '', description: '', color: '#3525cd' });
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Category removed', 'info');
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to delete category', 'error');
    }
  };

  // --- CUSTOM PAGES CMS ---
  const handleSaveCustomPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage) {
        const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageForm),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast('Page updated', 'success');
          setEditingPage(null);
          fetchAllAdminData();
        }
      } else {
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageForm),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast('Page created', 'success');
          setIsCreatingPage(false);
          fetchAllAdminData();
        }
      }
    } catch {
      onShowToast('Failed to save page', 'error');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Page deleted', 'info');
        fetchAllAdminData();
      }
    } catch {
      onShowToast('Failed to delete page', 'error');
    }
  };

  // --- PASSCODE CHANGE ---
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCode: currentCodeInput, newCode: newCodeInput }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast('Admin passcode updated successfully', 'success');
        setCurrentCodeInput('');
        setNewCodeInput('');
      } else {
        onShowToast(data.error || 'Failed to update passcode', 'error');
      }
    } catch {
      onShowToast('Server error changing passcode', 'error');
    }
  };

  // ================= RENDER: SECURITY GATE (NOT AUTHENTICATED) =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#faf8ff]">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[#eaedff]">
          <div className="w-12 h-12 rounded-xl bg-[#131b2e] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#131b2e]/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-center text-[#131b2e] mb-1">
            System Administration Portal
          </h2>
          <p className="text-xs text-center text-[#595768] mb-6">
            Private administrative control gate. Master authorization required.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1.5">
                Master Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode (default: admin123)"
                className="w-full px-4 py-2.5 text-sm border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 bg-[#131b2e] hover:bg-[#20293e] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Verifying Authorization...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Authorization</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full py-2 text-xs font-medium text-[#595768] hover:text-[#131b2e] transition-colors"
            >
              ← Return to Public Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.user_name.toLowerCase().includes(q) ||
        o.user_email.toLowerCase().includes(q) ||
        o.transaction_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ================= RENDER: AUTHENTICATED ADMIN CONTROL CENTER =================
  return (
    <div id="admin-control-portal" className="min-h-screen bg-[#f6f7fb] pb-16">
      {/* Top Admin Master Bar */}
      <div className="bg-[#131b2e] text-white border-b border-[#2d3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3525cd] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">LeadPulse Master Admin</span>
                <span className="px-2 py-0.5 bg-[#006e4b] text-white font-mono text-[10px] font-bold rounded uppercase">
                  Authorized
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Total System Control & CMS Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-lg transition-colors"
            >
              <span>View User Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-[#eaedff] shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Credit Orders</span>
            {orders.filter((o) => o.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#b45309] text-white rounded-full">
                {orders.filter((o) => o.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Balances</span>
          </button>

          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'payment-methods'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Methods</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#eaedff] text-[#3525cd] rounded-full">
              {paymentMethods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'blogs'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'categories'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'pages'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Custom Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              activeTab === 'security'
                ? 'bg-[#3525cd] text-white shadow-sm'
                : 'text-[#464555] hover:bg-[#eaedff]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Admin Passcode</span>
          </button>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ================= SECTION 1: CREDIT ORDERS & APPROVALS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">User Credit Purchase Requests</h3>
                <p className="text-xs text-[#595768]">
                  Review user payment proofs. You determine the exact credit amount to assign.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#595768]" />
                  <input
                    type="text"
                    placeholder="Search by user or TxID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs border border-[#c7c4d8] rounded-xl focus:outline-none focus:border-[#3525cd]"
                  />
                </div>

                <div className="flex items-center bg-[#eaedff]/60 p-1 rounded-xl">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                        orderFilter === filter
                          ? 'bg-white text-[#3525cd] shadow-xs'
                          : 'text-[#464555] hover:text-[#131b2e]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#eaedff]">
                <Receipt className="w-12 h-12 text-[#c7c4d8] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#131b2e]">No orders matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs hover:border-[#c7c4d8] transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] text-[#3525cd] flex items-center justify-center font-bold font-mono text-sm flex-shrink-0">
                          +{order.amount_credits}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#131b2e]">{order.user_name}</span>
                            <span className="text-xs text-[#595768]">({order.user_email})</span>
                          </div>
                          <div className="text-xs text-[#464555] mt-0.5">
                            Package requested: <span className="font-bold">{order.amount_credits} Credits</span> ({order.amount_paid}) • Method: <span className="font-semibold text-[#3525cd]">{order.payment_method_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleOpenApprovalModal(order)}
                              className="px-3.5 py-1.5 bg-[#006e4b] hover:bg-[#005338] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Assign & Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.id)}
                              className="px-3.5 py-1.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6f7ef] text-[#006e4b] font-bold text-xs rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Granted +{order.credits_granted} Credits</span>
                          </span>
                        )}
                        {order.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef2f2] text-[#b91c1c] font-bold text-xs rounded-full">
                            <XCircle className="w-4 h-4" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#faf8ff] rounded-xl text-xs text-[#595768]">
                      <div>
                        <span className="font-semibold text-[#131b2e]">Transaction / Ref ID: </span>
                        <span className="font-mono select-all font-bold text-[#3525cd]">
                          {order.transaction_id}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#131b2e]">Sender Account / Phone: </span>
                        <span>{order.sender_account || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#131b2e]">Submitted Date: </span>
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                      {order.notes && (
                        <div className="sm:col-span-3 text-[11px] text-[#464555]">
                          <span className="font-semibold">User Note: </span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                      {order.admin_notes && (
                        <div className="sm:col-span-3 text-[11px] text-[#006e4b] bg-white p-2 rounded border border-[#eaedff]">
                          <span className="font-bold">Admin Response: </span>
                          <span>{order.admin_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: USERS & BALANCES ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs">
              <h3 className="text-base font-bold text-[#131b2e]">Registered User Accounts</h3>
              <p className="text-xs text-[#595768]">
                Admin can directly grant, deduct, or reset user credit balances at any time.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8ff] border-b border-[#eaedff] text-[#595768] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Current Credits</th>
                    <th className="p-4">Role / Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#faf8ff] transition-colors">
                      <td className="p-4 font-bold text-[#131b2e]">{user.name}</td>
                      <td className="p-4 text-[#595768]">{user.email}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-sm text-[#3525cd]">
                          {user.credits}
                        </span>{' '}
                        <span className="text-[#595768]">Credits</span>
                      </td>
                      <td className="p-4 capitalize">
                        <span className="px-2 py-0.5 bg-[#eaedff] text-[#3525cd] font-bold rounded">
                          {user.plan_tier} ({user.role})
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                            user.status === 'active'
                              ? 'bg-[#e6f7ef] text-[#006e4b]'
                              : 'bg-[#fef2f2] text-[#b91c1c]'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setUserCreditAmount(user.credits);
                          }}
                          className="px-3 py-1.5 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Manage Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: PAYMENT METHODS CMS ================= */}
        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">Payment Methods Manager</h3>
                <p className="text-xs text-[#595768]">
                  Add your local bank, mobile wallets, or crypto accounts. Active methods appear
                  instantly in the user checkout portal.
                </p>
              </div>
              <button
                onClick={() => {
                  setMethodForm({
                    name: '',
                    account_title: '',
                    account_number: '',
                    instructions: '',
                    is_active: true,
                  });
                  setEditingMethod(null);
                  setIsCreatingMethod(true);
                }}
                className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#3525cd]" />
                        <h4 className="font-bold text-sm text-[#131b2e]">{pm.name}</h4>
                      </div>
                      <button
                        onClick={() => handleTogglePaymentMethod(pm)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          pm.is_active
                            ? 'bg-[#e6f7ef] text-[#006e4b] hover:bg-[#d1f2e2]'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {pm.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#595768] mb-3">
                      <div>
                        <span className="font-semibold text-[#131b2e]">Account Title: </span>
                        <span>{pm.account_title}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#131b2e]">Number / IBAN / Wallet: </span>
                        <span className="font-mono font-bold text-[#3525cd] select-all bg-[#faf8ff] px-2 py-0.5 rounded">
                          {pm.account_number}
                        </span>
                      </div>
                      {pm.instructions && (
                        <p className="text-[11px] text-[#464555] bg-[#faf8ff] p-2 rounded-lg border border-[#eaedff] mt-2">
                          {pm.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
                    <button
                      onClick={() => {
                        setEditingMethod(pm);
                        setMethodForm({
                          name: pm.name,
                          account_title: pm.account_title,
                          account_number: pm.account_number,
                          instructions: pm.instructions,
                          is_active: pm.is_active,
                        });
                        setIsCreatingMethod(true);
                      }}
                      className="p-1.5 text-[#595768] hover:text-[#3525cd] rounded-lg hover:bg-[#eaedff] transition-colors"
                      title="Edit method"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaymentMethod(pm.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete method"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 4: BLOG CMS ================= */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">Blog CMS & Editorial</h3>
                <p className="text-xs text-[#595768]">
                  Publish comprehensive SEO and lead generation articles for website visitors.
                </p>
              </div>
              <button
                onClick={() => {
                  setPostForm({
                    title: '',
                    slug: '',
                    category_id: categories[0]?.id || 'cat-1',
                    category_name: categories[0]?.name || 'Technical SEO',
                    excerpt: '',
                    content: '',
                    featured_image:
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
                    author: 'LeadPulse Editorial',
                    read_time: '5 min read',
                    status: 'published',
                  });
                  setEditingPost(null);
                  setIsCreatingPost(true);
                }}
                className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Write New Article</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-[#eaedff] text-[#3525cd] text-[10px] font-bold rounded-full uppercase">
                          {post.category_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            post.status === 'published'
                              ? 'bg-[#e6f7ef] text-[#006e4b]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#131b2e] mb-1 line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#595768] line-clamp-2 mb-3">{post.excerpt}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between border-t border-[#eaedff]">
                    <span className="text-[11px] text-[#595768]">Views: {post.views}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setPostForm({
                            title: post.title,
                            slug: post.slug,
                            category_id: post.category_id,
                            category_name: post.category_name,
                            excerpt: post.excerpt,
                            content: post.content,
                            featured_image: post.featured_image,
                            author: post.author,
                            read_time: post.read_time,
                            status: post.status,
                          });
                          setIsCreatingPost(true);
                        }}
                        className="p-1 text-[#595768] hover:text-[#3525cd] rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlogPost(post.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 5: CATEGORIES CMS ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">Blog Categories</h3>
                <p className="text-xs text-[#595768]">
                  Organize articles into thematic silos for improved SEO hierarchy.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingCategory(true)}
                className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-4 rounded-2xl border border-[#eaedff] shadow-xs flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color || '#3525cd' }}
                      />
                      <span className="font-bold text-sm text-[#131b2e]">{cat.name}</span>
                    </div>
                    <p className="text-xs text-[#595768]">{cat.description || 'No description'}</p>
                    <span className="text-[11px] font-mono text-[#777587]">/{cat.slug}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 6: CUSTOM PAGES CMS ================= */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">Custom Pages Manager</h3>
                <p className="text-xs text-[#595768]">
                  Manage dynamic site pages: About Us, Terms of Service, Privacy Policy, Credit Policy,
                  and documentation.
                </p>
              </div>
              <button
                onClick={() => {
                  setPageForm({
                    title: '',
                    slug: '',
                    content: '',
                    meta_description: '',
                    is_published: true,
                  });
                  setEditingPage(null);
                  setIsCreatingPage(true);
                }}
                className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Page</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-white p-5 rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#3525cd]" />
                        <h4 className="font-bold text-sm text-[#131b2e]">{page.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          page.is_published
                            ? 'bg-[#e6f7ef] text-[#006e4b]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#3525cd] block mb-2">
                      /{page.slug}
                    </span>
                    <p className="text-xs text-[#595768] line-clamp-3 mb-4">
                      {page.meta_description || page.content.slice(0, 120)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#eaedff] text-xs">
                    <span className="text-[#777587]">
                      Updated: {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPage(page);
                          setPageForm({
                            title: page.title,
                            slug: page.slug,
                            content: page.content,
                            meta_description: page.meta_description,
                            is_published: page.is_published,
                          });
                          setIsCreatingPage(true);
                        }}
                        className="p-1.5 text-[#595768] hover:text-[#3525cd] rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SECTION 7: SECURITY & PASSCODE ================= */}
        {activeTab === 'security' && (
          <div className="max-w-md bg-white p-6 rounded-2xl border border-[#eaedff] shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#131b2e] text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">Change Admin Passcode</h3>
                <p className="text-xs text-[#595768]">Protect your admin master controls</p>
              </div>
            </div>

            <form onSubmit={handleChangePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Current Passcode
                </label>
                <input
                  type="password"
                  required
                  value={currentCodeInput}
                  onChange={(e) => setCurrentCodeInput(e.target.value)}
                  placeholder="Enter current passcode"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  New Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value)}
                  placeholder="Enter minimum 4 characters"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#131b2e] hover:bg-[#20293e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Update Passcode
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ================= MODAL: APPROVE ORDER WITH CUSTOM CREDITS ================= */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-[#eaedff]">
            <h4 className="text-base font-bold text-[#131b2e] mb-2">
              Approve Credit Top-up for {approvingOrder.user_name}
            </h4>
            <p className="text-xs text-[#595768] mb-4">
              Requested: <span className="font-bold">{approvingOrder.amount_credits} Credits</span> via{' '}
              {approvingOrder.payment_method_name} (TxID: {approvingOrder.transaction_id})
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] uppercase mb-1">
                  Credits to Grant (You have full control)
                </label>
                <input
                  type="number"
                  min="1"
                  value={grantedCreditsInput}
                  onChange={(e) => setGrantedCreditsInput(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm font-bold border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] uppercase mb-1">
                  Approval Notes for User
                </label>
                <input
                  type="text"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setApprovingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-[#595768] hover:bg-[#eaedff] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-4 py-2 bg-[#006e4b] hover:bg-[#005338] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm & Grant {grantedCreditsInput} Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DIRECT USER CREDITS ADJUSTMENT ================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-[#eaedff]">
            <h4 className="text-base font-bold text-[#131b2e] mb-1">
              Direct Credit Balance: {selectedUser.name}
            </h4>
            <p className="text-xs text-[#595768] mb-4">
              Current Balance:{' '}
              <span className="font-mono font-bold text-[#3525cd]">
                {selectedUser.credits} Credits
              </span>
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] uppercase mb-1">
                  Target Balance / Adjust Amount
                </label>
                <input
                  type="number"
                  value={userCreditAmount}
                  onChange={(e) => setUserCreditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-sm font-bold border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] uppercase mb-1">
                  Reason for Log
                </label>
                <input
                  type="text"
                  value={userCreditReason}
                  onChange={(e) => setUserCreditReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-2 text-xs font-semibold text-[#595768] hover:bg-[#eaedff] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveUserCredits('adjust')}
                className="px-3 py-2 bg-[#eaedff] text-[#3525cd] hover:bg-[#d6e0ff] text-xs font-bold rounded-xl"
              >
                Add as Delta (+/-)
              </button>
              <button
                onClick={() => handleSaveUserCredits('set')}
                className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl"
              >
                Set Exact Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PAYMENT METHOD ================= */}
      {isCreatingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 border border-[#eaedff]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-[#131b2e]">
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h4>
              <button
                onClick={() => setIsCreatingMethod(false)}
                className="p-1 text-[#595768] hover:text-[#131b2e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentMethod} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Method Name (e.g. Meezan Bank, EasyPaisa, JazzCash, USDT TRC20, PayPal)
                </label>
                <input
                  type="text"
                  required
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                  placeholder="e.g. EasyPaisa Mobile Account"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Account Title / Beneficiary Name
                </label>
                <input
                  type="text"
                  required
                  value={methodForm.account_title}
                  onChange={(e) => setMethodForm({ ...methodForm, account_title: e.target.value })}
                  placeholder="e.g. LeadPulse Digital / John Doe"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Account Number / IBAN / Wallet Address
                </label>
                <input
                  type="text"
                  required
                  value={methodForm.account_number}
                  onChange={(e) => setMethodForm({ ...methodForm, account_number: e.target.value })}
                  placeholder="e.g. 0300-1234567 or PK36MEZN... or Wallet Address"
                  className="w-full px-3 py-2 text-xs font-mono border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Payment Instructions / Notes for User
                </label>
                <textarea
                  rows={3}
                  value={methodForm.instructions}
                  onChange={(e) => setMethodForm({ ...methodForm, instructions: e.target.value })}
                  placeholder="e.g. Transfer exact amount and enter transaction reference ID. Activation takes 5-15 mins."
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active_check"
                  checked={methodForm.is_active}
                  onChange={(e) => setMethodForm({ ...methodForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#3525cd] rounded"
                />
                <label htmlFor="active_check" className="text-xs font-semibold text-[#131b2e]">
                  Active & visible to users during checkout
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingMethod(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#595768] hover:bg-[#eaedff] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Payment Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BLOG POST ================= */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 border border-[#eaedff]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-[#131b2e]">
                {editingPost ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h4>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="p-1 text-[#595768] hover:text-[#131b2e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm({
                      ...postForm,
                      title: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    })
                  }
                  placeholder="e.g. The 2026 Blueprint for Technical SEO Auditing"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Category</label>
                  <select
                    value={postForm.category_id}
                    onChange={(e) => {
                      const sel = categories.find((c) => c.id === e.target.value);
                      setPostForm({
                        ...postForm,
                        category_id: e.target.value,
                        category_name: sel?.name || 'General SEO',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Status</label>
                  <select
                    value={postForm.status}
                    onChange={(e) =>
                      setPostForm({ ...postForm, status: e.target.value as 'published' | 'draft' })
                    }
                    className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Featured Image URL</label>
                <input
                  type="text"
                  value={postForm.featured_image}
                  onChange={(e) => setPostForm({ ...postForm, featured_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Excerpt / Summary</label>
                <input
                  type="text"
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  placeholder="Brief synopsis for card previews..."
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Article Body Content</label>
                <textarea
                  rows={8}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Full markdown/text content..."
                  className="w-full px-3 py-2 text-xs font-mono border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#595768] hover:bg-[#eaedff] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CATEGORY ================= */}
      {isCreatingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-[#eaedff]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-[#131b2e]">Create Blog Category</h4>
              <button
                onClick={() => setIsCreatingCategory(false)}
                className="p-1 text-[#595768] hover:text-[#131b2e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    })
                  }
                  placeholder="e.g. Technical SEO, Lead Generation"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Badge Color</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-12 h-8 rounded border border-[#c7c4d8] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#595768] hover:bg-[#eaedff] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT CUSTOM PAGE ================= */}
      {isCreatingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 border border-[#eaedff]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-[#131b2e]">
                {editingPage ? 'Edit Custom Page' : 'Create Custom Page'}
              </h4>
              <button
                onClick={() => setIsCreatingPage(false)}
                className="p-1 text-[#595768] hover:text-[#131b2e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomPage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={pageForm.title}
                  onChange={(e) =>
                    setPageForm({
                      ...pageForm,
                      title: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    })
                  }
                  placeholder="e.g. About Us, Privacy Policy, Terms of Service"
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Meta Description</label>
                <input
                  type="text"
                  value={pageForm.meta_description}
                  onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })}
                  placeholder="SEO meta description..."
                  className="w-full px-3 py-2 text-xs border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Page Content</label>
                <textarea
                  rows={10}
                  required
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="Content of the page..."
                  className="w-full px-3 py-2 text-xs font-mono border border-[#c7c4d8] rounded-xl focus:border-[#3525cd] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="page_pub_check"
                  checked={pageForm.is_published}
                  onChange={(e) => setPageForm({ ...pageForm, is_published: e.target.checked })}
                  className="w-4 h-4 text-[#3525cd] rounded"
                />
                <label htmlFor="page_pub_check" className="text-xs font-semibold text-[#131b2e]">
                  Publish this page publicly
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsCreatingPage(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#595768] hover:bg-[#eaedff] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3525cd] hover:bg-[#281ca8] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
