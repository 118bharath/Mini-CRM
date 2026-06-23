import styles from './DeleteConfirm.module.css';

export default function DeleteConfirm({ opportunity, onConfirm, onClose, loading }) {
  if (!opportunity) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${styles.confirmModal}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <div className="section-label" style={{ marginBottom: '0.5rem' }}>
              <span className="label" style={{ color: 'var(--destructive)' }}>Confirm Action</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 400 }}>
              Delete Opportunity
            </h2>
          </div>
        </div>

        <div className="modal-body">
          <p className={styles.message}>
            Are you sure you want to delete the opportunity for{' '}
            <strong style={{ fontFamily: 'var(--font-display)' }}>{opportunity.customerName}</strong>?
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="spinner" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
