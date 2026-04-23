import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems, createItem, updateItem, deleteItem, searchItems } from '../api';

const EMPTY_FORM = {
  itemName: '',
  description: '',
  type: 'Lost',
  location: '',
  date: '',
  contactInfo: '',
};

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // Search
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Edit modal
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });

  // Load all items
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getItems();
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Add item
  const handleAddItem = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg({ type: '', text: '' });
    try {
      await createItem(formData);
      setFormMsg({ type: 'success', text: 'Item reported successfully!' });
      setFormData(EMPTY_FORM);
      await loadItems();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add item.' });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  // Open edit modal
  const openEdit = (item) => {
    setEditItem(item);
    setEditData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date ? item.date.slice(0, 10) : '',
      contactInfo: item.contactInfo,
    });
    setEditMsg({ type: '', text: '' });
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg({ type: '', text: '' });
    try {
      await updateItem(editItem._id, editData);
      setEditMsg({ type: 'success', text: 'Item updated successfully!' });
      await loadItems();
      setTimeout(() => setEditItem(null), 1000);
    } catch (err) {
      setEditMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update item.' });
    } finally {
      setEditLoading(false);
    }
  };

  // Search
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await searchItems(searchName, searchCategory);
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchName('');
    setSearchCategory('');
    await loadItems();
  };

  // Stats
  const totalItems = items.length;
  const lostCount = items.filter((i) => i.type === 'Lost').length;
  const foundCount = items.filter((i) => i.type === 'Found').length;
  const myCount = items.filter((i) => i.postedBy === user.id).length;

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo-icon">🔍</span>
          Lost &amp; Found
        </div>
        <div className="navbar-user">
          <span>Welcome, <strong>{user.name}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card total">
            <div className="stat-number">{totalItems}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card lost">
            <div className="stat-number">{lostCount}</div>
            <div className="stat-label">Lost Items</div>
          </div>
          <div className="stat-card found">
            <div className="stat-number">{foundCount}</div>
            <div className="stat-label">Found Items</div>
          </div>
          <div className="stat-card mine">
            <div className="stat-number">{myCount}</div>
            <div className="stat-label">My Reports</div>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="section-card">
          <div className="section-header">
            <h2>📋 Report an Item</h2>
          </div>
          <div className="section-body">
            {formMsg.text && (
              <div className={`alert alert-${formMsg.type === 'success' ? 'success' : 'error'}`}>
                {formMsg.type === 'success' ? '✅' : '⚠️'} {formMsg.text}
              </div>
            )}
            <form onSubmit={handleAddItem} className="add-item-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Black Wallet"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  placeholder="Describe the item in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  placeholder="Where was it lost/found?"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Contact Info *</label>
                <input
                  type="text"
                  placeholder="Phone number or email to contact"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setFormData(EMPTY_FORM)}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ width: 'auto', padding: '10px 28px' }}>
                  {formLoading ? <><span className="spinner"></span> Submitting...</> : '📤 Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Search */}
        <div className="section-card">
          <div className="section-header">
            <h2>🔎 Search Items</h2>
          </div>
          <div className="section-body">
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                Search
              </button>
              <button type="button" className="btn btn-outline" onClick={handleClearSearch}>
                Clear
              </button>
            </form>
          </div>
        </div>

        {/* Items List */}
        <div className="section-card">
          <div className="section-header">
            <h2>📦 All Reported Items</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="section-body">
            {loading ? (
              <div className="loading-state">⏳ Loading items...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No items found. Be the first to report one!</p>
              </div>
            ) : (
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    userId={user.id}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Item</h3>
              <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              {editMsg.text && (
                <div className={`alert alert-${editMsg.type === 'success' ? 'success' : 'error'}`}>
                  {editMsg.type === 'success' ? '✅' : '⚠️'} {editMsg.text}
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="modal-form">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={editData.itemName}
                    onChange={(e) => setEditData({ ...editData, itemName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  >
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Contact Info *</label>
                  <input
                    type="text"
                    value={editData.contactInfo}
                    onChange={(e) => setEditData({ ...editData, contactInfo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setEditItem(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={editLoading} style={{ width: 'auto', padding: '10px 28px' }}>
                    {editLoading ? <><span className="spinner"></span> Updating...</> : 'Update Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, userId, onEdit, onDelete }) {
  const isOwner = item.postedBy === userId;

  return (
    <div className="item-card">
      <div className="item-card-header">
        <span className={`item-type-badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
          {item.type === 'Lost' ? '❌ Lost' : '✅ Found'}
        </span>
        {isOwner && <span className="owner-badge">Your Post</span>}
      </div>
      <div className="item-card-body">
        <h3>{item.itemName}</h3>
        <p>{item.description}</p>
        <div className="item-meta">
          <div className="item-meta-row">
            <span className="icon">📍</span>
            <span>{item.location}</span>
          </div>
          <div className="item-meta-row">
            <span className="icon">📅</span>
            <span>{formatDate(item.date)}</span>
          </div>
          <div className="item-meta-row">
            <span className="icon">📞</span>
            <span>{item.contactInfo}</span>
          </div>
          <div className="item-meta-row">
            <span className="icon">👤</span>
            <span>Reported by {item.postedByName || 'Unknown'}</span>
          </div>
        </div>
      </div>
      {isOwner && (
        <div className="item-card-footer">
          <button className="btn btn-warning btn-sm" onClick={() => onEdit(item)}>
            ✏️ Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(item._id)}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}
