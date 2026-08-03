import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiCall } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';

export default function HOAAdminManagement() {
  const { user, accessToken } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'pending_users' | 'requests' | 'publishing' | 'staff_manage'>('pending_users');

  // API Data
  const { data: pendingUsers, refetch: refetchPending } = useApi<any[]>('/api/hoa/users/pending');
  const { data: requests, refetch: refetchRequests } = useApi<any[]>('/api/hoa/requests');
  const { data: users, refetch: refetchUsers } = useApi<any[]>('/api/users');

  // Form states
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('general');

  // Accomplishment state
  const [accTitle, setAccTitle] = useState('');
  const [accDesc, setAccDesc] = useState('');
  const [accImgUrl, setAccImgUrl] = useState('');
  const [accBudget, setAccBudget] = useState(0);

  // Meeting Minutes state
  const [mtgTitle, setMtgTitle] = useState('');
  const [mtgDate, setMtgDate] = useState('');
  const [mtgAgenda, setMtgAgenda] = useState('');
  const [mtgMinutes, setMtgMinutes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset modal
  const [resetModalUser, setResetModalUser] = useState<any>(null);
  const [tempPassword, setTempPassword] = useState('');

  const handleApproveUser = async (userId: string) => {
    try {
      await apiCall(`/api/hoa/users/${userId}/approve`, 'PATCH', {}, accessToken || undefined);
      success('User Approved! ✓', 'Homeowner registration activated.');
      refetchPending();
    } catch (err: any) {
      showError('Approval Failed', err.message);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: string) => {
    try {
      await apiCall(`/api/hoa/requests/${requestId}/status`, 'PATCH', { status }, accessToken || undefined);
      success(`Request ${status}!`, `Request updated to ${status}.`);
      refetchRequests();
    } catch (err: any) {
      showError('Update Failed', err.message);
    }
  };

  const handleCreateAdminStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCall('/api/hoa/users/admin-staff', 'POST', {
        fullName: staffName,
        email: staffEmail,
        password: staffPassword,
      }, accessToken || undefined);

      success('Admin Staff Created! 🛡', `${staffName} granted staff access.`);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      refetchUsers();
    } catch (err: any) {
      showError('Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    try {
      const res: any = await apiCall(`/api/hoa/users/${resetModalUser.id}/reset-password`, 'PATCH', {
        newPassword: tempPassword || undefined,
      }, accessToken || undefined);

      success('Password Reset Successful!', `Temp password for ${resetModalUser.full_name}: ${res.tempPassword}`);
      setResetModalUser(null);
      setTempPassword('');
    } catch (err: any) {
      showError('Reset Failed', err.message);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/api/hoa/announcements', 'POST', {
        title: annTitle,
        content: annContent,
        category: annCategory,
      }, accessToken || undefined);
      success('Announcement Published! 📢', 'Community announcement live.');
      setAnnTitle('');
      setAnnContent('');
    } catch (err: any) {
      showError('Post Failed', err.message);
    }
  };

  const handlePostAccomplishment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/api/hoa/accomplishments', 'POST', {
        title: accTitle,
        description: accDesc,
        imageUrl: accImgUrl,
        budgetSpent: accBudget,
      }, accessToken || undefined);
      success('Project Added! 🏗', 'Added to upper slideshow carousel.');
      setAccTitle('');
      setAccDesc('');
      setAccImgUrl('');
    } catch (err: any) {
      showError('Post Failed', err.message);
    }
  };

  const handlePostMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/api/hoa/meetings', 'POST', {
        title: mtgTitle,
        meetingDate: mtgDate,
        agenda: mtgAgenda,
        minutes: mtgMinutes || undefined,
        status: mtgMinutes ? 'completed' : 'upcoming',
      }, accessToken || undefined);
      success('Meeting Record Created! 📜', 'Saved to meeting minutes archive.');
      setMtgTitle('');
      setMtgAgenda('');
      setMtgMinutes('');
    } catch (err: any) {
      showError('Save Failed', err.message);
    }
  };

  return (
    <PageContainer title="HOA Operations & Staff Control Center" subtitle={`Admin & Admin Staff Access — ${user?.fullName}`}>
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6" style={{ background: 'var(--bg-glass)', padding: 'var(--space-2)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          {[
            { id: 'pending_users', label: `⏳ Pending Registrations (${pendingUsers?.length || 0})` },
            { id: 'requests', label: `📋 Request Approvals (${requests?.filter(r => r.status === 'pending').length || 0})` },
            { id: 'publishing', label: '📢 Publishing & Minutes Hub' },
            { id: 'staff_manage', label: '👥 Users & Staff Access' },
          ].map(t => (
            <button
              key={t.id}
              className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', fontSize: 'var(--font-xs)', fontWeight: 700 }}
              onClick={() => setActiveTab(t.id as any)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PENDING REGISTRATIONS */}
        {activeTab === 'pending_users' && (
          <div className="card">
            <div className="section-title">Homeowner Registration Approval Queue</div>
            {pendingUsers && pendingUsers.length > 0 ? (
              <div className="flex flex-col gap-4">
                {pendingUsers.map(u => (
                  <div key={u.id} className="card flex justify-between items-center" style={{ background: 'var(--bg-glass-light)', padding: 'var(--space-4)' }}>
                    <div>
                      <div className="font-bold text-md text-primary">{u.full_name}</div>
                      <div className="text-xs text-muted">Email: {u.email} • Phone: {u.phone_number || 'N/A'}</div>
                      <div className="text-xs text-muted">Address: {u.address}</div>
                      {u.proof_doc_url && (
                        <a href={u.proof_doc_url} target="_blank" rel="noreferrer" className="text-xs text-accent mt-2 inline-block font-semibold">
                          📄 View Owner Proof Verification Document
                        </a>
                      )}
                    </div>
                    <button className="btn btn-success btn-lg" onClick={() => handleApproveUser(u.id)}>
                      ✓ Approve Homeowner
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🎉</div><h3>No pending homeowner registrations</h3></div>
            )}
          </div>
        )}

        {/* TAB 2: REQUEST APPROVALS */}
        {activeTab === 'requests' && (
          <div className="card">
            <div className="section-title">HOA Service Requests Approval Queue</div>
            {requests && requests.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr><th>Requester</th><th>Type</th><th>Details</th><th>Info / Schedule</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td><strong className="text-primary">{req.requester_name}</strong><div className="text-xs text-muted">{req.address}</div></td>
                      <td><span className="badge badge-issued" style={{ textTransform: 'capitalize' }}>{req.request_type.replace(/_/g, ' ')}</span></td>
                      <td className="truncate" style={{ maxWidth: 200 }}>{req.details}</td>
                      <td className="text-xs">{req.vehicle_info || req.scheduled_at || req.officer_name || '—'}</td>
                      <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                      <td>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => handleUpdateRequestStatus(req.id, 'approved')}>✓ Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}>✗ Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No requests found</h3></div>
            )}
          </div>
        )}

        {/* TAB 3: PUBLISHING HUB */}
        {activeTab === 'publishing' && (
          <div className="grid grid-3">
            {/* Announcement Form */}
            <div className="card">
              <div className="section-title">📢 Post Announcement</div>
              <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={annCategory} onChange={e => setAnnCategory(e.target.value)}>
                    <option value="general">General Announcement</option>
                    <option value="urgent">Urgent Maintenance / Alert</option>
                    <option value="financial">Financial Report</option>
                    <option value="event">Community Event</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-input" placeholder="Title..." value={annTitle} onChange={e => setAnnTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-textarea" placeholder="Content..." value={annContent} onChange={e => setAnnContent(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Publish Announcement</button>
              </form>
            </div>

            {/* Slideshow Accomplishment Form */}
            <div className="card">
              <div className="section-title">🏗 Add Slideshow Project</div>
              <form onSubmit={handlePostAccomplishment} className="flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input type="text" className="form-input" placeholder="Title..." value={accTitle} onChange={e => setAccTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input type="url" className="form-input" placeholder="https://..." value={accImgUrl} onChange={e => setAccImgUrl(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Spent (₱)</label>
                  <input type="number" className="form-input" value={accBudget} onChange={e => setAccBudget(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Description..." value={accDesc} onChange={e => setAccDesc(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Add to Upper Carousel</button>
              </form>
            </div>

            {/* Meeting Minutes Form */}
            <div className="card">
              <div className="section-title">📜 Meeting & Minutes Record</div>
              <form onSubmit={handlePostMeeting} className="flex flex-col gap-3">
                <div className="form-group">
                  <label className="form-label">Meeting Title</label>
                  <input type="text" className="form-input" placeholder="Title..." value={mtgTitle} onChange={e => setMtgTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input type="datetime-local" className="form-input" value={mtgDate} onChange={e => setMtgDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Agenda</label>
                  <textarea className="form-textarea" placeholder="Agenda items..." value={mtgAgenda} onChange={e => setMtgAgenda(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Recorded Minutes (optional)</label>
                  <textarea className="form-textarea" placeholder="Minutes notes..." value={mtgMinutes} onChange={e => setMtgMinutes(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Save Meeting Record</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & STAFF ACCESS MANAGEMENT */}
        {activeTab === 'staff_manage' && (
          <div className="grid grid-2">
            {/* Create Admin Staff Form */}
            {user?.roleName === 'hoa_admin' || user?.roleName === 'super_admin' ? (
              <div className="card">
                <div className="section-title">🛡 Assign / Provide Admin Staff Access</div>
                <form onSubmit={handleCreateAdminStaff} className="flex flex-col gap-4">
                  <div className="form-group">
                    <label className="form-label">Admin Staff Full Name</label>
                    <input type="text" className="form-input" placeholder="Staff Name" value={staffName} onChange={e => setStaffName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Staff Email Address</label>
                    <input type="email" className="form-input" placeholder="staff@palmera-hoa.com" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Temporary Password</label>
                    <input type="password" className="form-input" placeholder="••••••••" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    Create Admin Staff Account
                  </button>
                </form>
              </div>
            ) : (
              <div className="card">
                <div className="text-xs text-muted">Admin Staff account creation is reserved for Main Administrator.</div>
              </div>
            )}

            {/* User List & Password Reset Tool */}
            <div className="card">
              <div className="section-title">👥 User Account Management & Password Resets</div>
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Role</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users?.map(u => (
                    <tr key={u.id}>
                      <td><strong className="text-primary">{u.full_name}</strong><div className="text-xs text-muted">{u.email}</div></td>
                      <td><span className="badge badge-issued">{u.role_name}</span></td>
                      <td><span className={`badge badge-${u.is_active ? 'approved' : 'rejected'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => setResetModalUser(u)}>
                          🔑 Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RESET PASSWORD MODAL */}
        {resetModalUser && (
          <div className="modal-overlay" onClick={() => setResetModalUser(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🔑 Reset Password for {resetModalUser.full_name}</h2>
                <button className="modal-close" onClick={() => setResetModalUser(null)}>✕</button>
              </div>
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">New Password (leave blank for auto-generated <code>Resident@1234</code>)</label>
                  <input type="text" className="form-input" placeholder="Resident@1234" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
                </div>
                <div className="flex gap-3 justify-end mt-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setResetModalUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Reset Password</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
