import { useState, useEffect } from 'react';
import styles from './OpportunityForm.module.css';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const emptyForm = {
  customerName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  requirement: '',
  estimatedValue: '',
  stage: 'New',
  priority: 'Medium',
  nextFollowUpDate: '',
  notes: '',
};

export default function OpportunityForm({ opportunity, onSubmit, onClose, loading }) {
  const isEdit = Boolean(opportunity);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (opportunity) {
      const followUp = opportunity.nextFollowUpDate
        ? new Date(opportunity.nextFollowUpDate).toISOString().split('T')[0]
        : '';
      setForm({
        customerName: opportunity.customerName || '',
        contactName: opportunity.contactName || '',
        contactEmail: opportunity.contactEmail || '',
        contactPhone: opportunity.contactPhone || '',
        requirement: opportunity.requirement || '',
        estimatedValue: opportunity.estimatedValue ?? '',
        stage: opportunity.stage || 'New',
        priority: opportunity.priority || 'Medium',
        nextFollowUpDate: followUp,
        notes: opportunity.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [opportunity]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Customer name is required';
    if (!form.requirement.trim()) e.requirement = 'Requirement summary is required';
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
      e.contactEmail = 'Enter a valid email address';
    }
    if (form.estimatedValue !== '' && (isNaN(form.estimatedValue) || Number(form.estimatedValue) < 0)) {
      e.estimatedValue = 'Value must be a non-negative number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      estimatedValue: form.estimatedValue !== '' ? Number(form.estimatedValue) : 0,
      nextFollowUpDate: form.nextFollowUpDate || null,
    };
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-header">
          <div>
            <div className="section-label" style={{ marginBottom: '0.5rem' }}>
              <span className="label">{isEdit ? 'Edit Record' : 'New Record'}</span>
            </div>
            <h2 id="form-title" style={{ fontSize: '1.375rem', fontFamily: 'var(--font-display)', fontWeight: 400 }}>
              {isEdit ? 'Update Opportunity' : 'Add Opportunity'}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Section: Company */}
            <div className={styles.section}>
              <p className="label-muted" style={{ marginBottom: '1rem' }}>Company &amp; Contact</p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="customerName">
                    Company Name <span style={{ color: 'var(--destructive)' }}>*</span>
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    className="form-input"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    autoFocus
                  />
                  {errors.customerName && <span className="form-error">{errors.customerName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactName">Contact Person</label>
                  <input
                    id="contactName"
                    name="contactName"
                    className="form-input"
                    value={form.contactName}
                    onChange={handleChange}
                    placeholder="John Smith"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">Contact Email</label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    className="form-input"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="john@acme.com"
                  />
                  {errors.contactEmail && <span className="form-error">{errors.contactEmail}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactPhone">Contact Phone</label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    className="form-input"
                    value={form.contactPhone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <hr className="divider" style={{ margin: '1.5rem 0' }} />

            {/* Section: Deal */}
            <div className={styles.section}>
              <p className="label-muted" style={{ marginBottom: '1rem' }}>Deal Details</p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="requirement">
                  Requirement Summary <span style={{ color: 'var(--destructive)' }}>*</span>
                </label>
                <textarea
                  id="requirement"
                  name="requirement"
                  className="form-textarea"
                  value={form.requirement}
                  onChange={handleChange}
                  placeholder="Describe the customer's need or problem to solve..."
                  rows={3}
                />
                {errors.requirement && <span className="form-error">{errors.requirement}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedValue">Estimated Value (₹)</label>
                  <input
                    id="estimatedValue"
                    name="estimatedValue"
                    type="number"
                    min="0"
                    step="1000"
                    className="form-input"
                    value={form.estimatedValue}
                    onChange={handleChange}
                    placeholder="500000"
                  />
                  {errors.estimatedValue && <span className="form-error">{errors.estimatedValue}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="nextFollowUpDate">Next Follow-up Date</label>
                  <input
                    id="nextFollowUpDate"
                    name="nextFollowUpDate"
                    type="date"
                    className="form-input"
                    value={form.nextFollowUpDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stage">Stage</label>
                  <select id="stage" name="stage" className="form-select" value={form.stage} onChange={handleChange}>
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-textarea"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional context, next steps, or important details..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving...</> : (isEdit ? 'Save Changes' : 'Create Opportunity')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
