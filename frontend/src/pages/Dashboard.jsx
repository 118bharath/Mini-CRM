import { useState, useEffect, useCallback } from 'react';
import { opportunitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityForm from '../components/OpportunityForm';
import DeleteConfirm from '../components/DeleteConfirm';
import styles from './Dashboard.module.css';

const STAGES = ['All', 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'value_desc', label: 'Value: High to Low' },
  { value: 'value_asc', label: 'Value: Low to High' },
  { value: 'priority', label: 'Priority' },
  { value: 'followup', label: 'Follow-up Date' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

export default function Dashboard() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (stageFilter !== 'All') params.stage = stageFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      params.sort = sortBy;
      const { data } = await opportunitiesAPI.getAll(params);
      setOpportunities(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load opportunities. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [stageFilter, priorityFilter, sortBy]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      const { data } = await opportunitiesAPI.create(formData);
      setOpportunities((prev) => [data.data, ...prev]);
      setShowForm(false);
      showMessage('Opportunity created successfully.');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create opportunity.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      const { data } = await opportunitiesAPI.update(editTarget._id, formData);
      setOpportunities((prev) => prev.map((o) => (o._id === editTarget._id ? data.data : o)));
      setEditTarget(null);
      setShowForm(false);
      showMessage('Opportunity updated.');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update opportunity.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await opportunitiesAPI.delete(deleteTarget._id);
      setOpportunities((prev) => prev.filter((o) => o._id !== deleteTarget._id));
      setDeleteTarget(null);
      showMessage('Opportunity deleted.');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete opportunity.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (opp) => { setEditTarget(opp); setShowForm(true); };
  const openNew = () => { setEditTarget(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTarget(null); };

  // Stats computed from all visible opportunities
  const myOpps = opportunities.filter((o) => o.isOwner);
  const totalValue = opportunities.reduce((s, o) => s + (o.estimatedValue || 0), 0);
  const wonValue = opportunities.filter((o) => o.stage === 'Won').reduce((s, o) => s + (o.estimatedValue || 0), 0);
  const highPriority = opportunities.filter((o) => o.priority === 'High').length;

  return (
    <div className={styles.page}>
      <Navbar onNewOpportunity={openNew} />

      <main className={styles.main}>
        <div className="container">

          {/* Page header */}
          <div className={styles.pageHeader}>
            <div>
              <div className="section-label">
                <span className="label">Sales Pipeline</span>
              </div>
              <h1 className={styles.pageTitle}>Opportunity Tracker</h1>
              <p className={styles.pageSubtitle}>Shared pipeline — all team members · {opportunities.length} opportunities</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className={styles.statsGrid}>
            <div className={`card ${styles.statCard}`}>
              <span className="label-muted">Pipeline Value</span>
              <span className={styles.statValue}>{formatCurrency(totalValue)}</span>
              <span className={`text-muted text-xs`}>{opportunities.length} total opportunities</span>
            </div>
            <div className={`card ${styles.statCard}`}>
              <span className="label-muted">Won Value</span>
              <span className={styles.statValue} style={{ color: 'var(--success)' }}>{formatCurrency(wonValue)}</span>
              <span className="text-muted text-xs">{opportunities.filter(o => o.stage === 'Won').length} deals closed</span>
            </div>
            <div className={`card ${styles.statCard}`}>
              <span className="label-muted">High Priority</span>
              <span className={styles.statValue} style={{ color: 'var(--destructive)' }}>{highPriority}</span>
              <span className="text-muted text-xs">opportunities need attention</span>
            </div>
            <div className={`card ${styles.statCard}`}>
              <span className="label-muted">My Opportunities</span>
              <span className={styles.statValue} style={{ color: 'var(--accent)' }}>{myOpps.length}</span>
              <span className="text-muted text-xs">created by you</span>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {success}
            </div>
          )}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Filters */}
          <div className={styles.filtersBar}>
            <div className={styles.filterGroup}>
              <span className="label-muted" style={{ flexShrink: 0 }}>Stage</span>
              <div className={styles.filterChips}>
                {STAGES.map((s) => (
                  <button
                    key={s}
                    className={`${styles.chip} ${stageFilter === s ? styles.chipActive : ''}`}
                    onClick={() => setStageFilter(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterRight}>
              <div className={styles.filterGroup}>
                <span className="label-muted" style={{ flexShrink: 0 }}>Priority</span>
                <div className={styles.filterChips}>
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      className={`${styles.chip} ${priorityFilter === p ? styles.chipActive : ''}`}
                      onClick={() => setPriorityFilter(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <select
                className={`form-select ${styles.sortSelect}`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Opportunities grid */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className="spinner" style={{ width: '2rem', height: '2rem', borderColor: 'var(--accent)', borderRightColor: 'transparent' }} />
              <p className="text-muted">Loading pipeline...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◇</div>
              <h3>
                {stageFilter !== 'All' || priorityFilter !== 'All'
                  ? 'No matches found'
                  : 'Pipeline is empty'}
              </h3>
              <p>
                {stageFilter !== 'All' || priorityFilter !== 'All'
                  ? 'Try adjusting your filters to see more opportunities.'
                  : 'Start tracking deals by adding your first opportunity to the shared pipeline.'}
              </p>
              {stageFilter === 'All' && priorityFilter === 'All' && (
                <button className="btn btn-primary" onClick={openNew}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
                  </svg>
                  Add First Opportunity
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <OpportunityForm
          opportunity={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={closeForm}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          opportunity={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
