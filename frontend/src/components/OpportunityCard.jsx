import { useAuth } from '../context/AuthContext';
import styles from './OpportunityCard.module.css';

const STAGE_CLASS = {
  'New': 'badge-stage-New',
  'Contacted': 'badge-stage-Contacted',
  'Qualified': 'badge-stage-Qualified',
  'Proposal Sent': 'badge-stage-Proposal',
  'Won': 'badge-stage-Won',
  'Lost': 'badge-stage-Lost',
};

const PRIORITY_CLASS = {
  'Low': 'badge-priority-Low',
  'Medium': 'badge-priority-Medium',
  'High': 'badge-priority-High',
};

const formatCurrency = (val) => {
  if (!val && val !== 0) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isOverdue = (d) => d && new Date(d) < new Date();

export default function OpportunityCard({ opportunity, onEdit, onDelete }) {
  const { user } = useAuth();
  const isOwner = opportunity.isOwner || (opportunity.owner?._id === user?._id);
  const followUp = opportunity.nextFollowUpDate;
  const overdue = followUp && isOverdue(followUp) && opportunity.stage !== 'Won' && opportunity.stage !== 'Lost';

  return (
    <article className={`card card-hover ${styles.card} ${isOwner ? styles.cardOwned : ''}`}>
      {isOwner && <div className={styles.ownerAccent} />}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.customerName}>{opportunity.customerName}</h3>
          {opportunity.contactName && (
            <span className={`${styles.contactName} text-muted text-sm`}>{opportunity.contactName}</span>
          )}
        </div>
        <div className={styles.value}>
          <span className={styles.valueAmount}>{formatCurrency(opportunity.estimatedValue)}</span>
        </div>
      </div>

      <p className={styles.requirement}>{opportunity.requirement}</p>

      <div className={styles.badges}>
        <span className={`badge ${STAGE_CLASS[opportunity.stage] || 'badge-stage-New'}`}>
          {opportunity.stage}
        </span>
        <span className={`badge ${PRIORITY_CLASS[opportunity.priority] || 'badge-priority-Medium'}`}>
          {opportunity.priority}
        </span>
      </div>

      <hr className="divider" style={{ margin: '1rem 0' }} />

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className="label-muted">Follow-up</span>
          <span className={`${styles.metaValue} ${overdue ? styles.overdue : ''}`}>
            {overdue && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink: 0, marginRight: '3px'}}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            )}
            {followUp ? formatDate(followUp) : '—'}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className="label-muted">Created by</span>
          <span className={styles.metaValue}>
            {opportunity.owner?.name || 'Unknown'}
            {isOwner && <span className={styles.youBadge}>You</span>}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className="label-muted">Added</span>
          <span className={styles.metaValue}>{formatDate(opportunity.createdAt)}</span>
        </div>
      </div>

      {isOwner && (
        <div className={styles.actions}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(opportunity)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--destructive)' }}
            onClick={() => onDelete(opportunity)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
