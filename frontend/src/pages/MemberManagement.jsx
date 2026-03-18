import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { ArrowLeft, Plus, Users, Edit3, Trash2, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Member',
    password: '',
    address: '',
    isActive: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        // Only send password if it was typed
        const payload = { ...formData };
        if (!payload.password) delete payload.password;

        await api.put(`/users/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchMembers(false);
      handleCancelForm();
      toast.success(editingId ? 'Profile updated' : 'Member added');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save member');
    }
  };

  const handleEditClick = (member) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      phone: member.phone,
      role: member.role,
      password: '', // Leave blank so it doesn't get updated unless typed
      address: member.address || '',
      isActive: member.isActive
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', role: 'Member', password: '', address: '', isActive: true });
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.name}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.delete(`/users/${member._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(data.message || 'Member deleted');
      fetchMembers(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete member');
    }
  };

  const toggleStatus = async (member) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/users/${member._id}`, { isActive: !member.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Member ${member.isActive ? 'deactivated' : 'activated'}`);
      fetchMembers(false);
    } catch {
       toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-grey safe-bottom">
      <header className="bg-brand-card-bg/70 backdrop-blur-xl border-b border-brand-border/40 sticky top-0 z-50 px-4 sm:px-6 h-14 sm:h-[4.5rem] flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2.5 -ml-2 hover:bg-brand-border/40 rounded-full text-white/60 hover:text-white transition-colors active:scale-[0.95]">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight m-0 text-white">Members</h1>
        </div>
        <button 
          onClick={showForm ? handleCancelForm : () => setShowForm(true)}
          className="btn-primary py-2.5 px-4 sm:px-5 shadow-none flex items-center gap-1.5 sm:gap-2 text-sm rounded-full"
        >
          {showForm ? 'Cancel' : <><Plus size={16} strokeWidth={2} /> <span className="hidden xs:inline">Add</span> Member</>}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {showForm && (
          <div className="card mb-8 sm:mb-12 overflow-hidden border-brand-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.3)] slide-in-bottom">
            <div className="border-b border-brand-border/30 pb-4 sm:pb-5 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">{editingId ? 'Edit Member Profile' : 'Add New Member'}</h2>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/45">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="E.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/45">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/45">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="input-field"
                    >
                      <option value="Member">Member</option>
                      <option value="Executive">Executive</option>
                      <option value="Treasurer">Treasurer</option>
                    </select>
                  </div>
                  <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/45">
                    {editingId ? 'New Password (Leave blank to keep)' : 'Login Password'}
                  </label>
                  <input
                    type={editingId ? "text" : "password"}
                    required={!editingId} // Password required only for new users
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-white/45">Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field"
                  placeholder="Optional context"
                />
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
                {editingId && (
                  <button type="button" onClick={handleCancelForm} className="btn-secondary px-6">Cancel</button>
                )}
                <button type="submit" className="btn-primary px-8">{editingId ? 'Update Profile' : 'Save Member'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3 sm:space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-brand-card-bg rounded-[1.25rem] sm:rounded-[1.5rem] border border-brand-border/20"></div>)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-14 sm:py-20 bg-brand-card-bg rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-brand-border/20 fade-in-up">
               <h3 className="text-lg sm:text-xl font-medium tracking-tight mt-4 text-white/70">No Members Found</h3>
               <p className="text-sm text-white/40 mt-1">Start by adding your executives.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {members.map((member, idx) => (
                <div key={member._id} className={`card p-4 sm:p-5 flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center justify-between transition-all duration-300 fade-in-up delay-${Math.min(idx + 1, 8)} ${!member.isActive ? 'opacity-50 bg-brand-card-bg/40' : ''}`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 border border-brand-orange/15">
                      <Users size={18} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight leading-none">{member.name}</h3>
                        <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center font-bold ${
                            member.role === 'Treasurer' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'
                          }`}>
                            {member.role}
                        </span>
                        {!member.isActive && (
                          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                             Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm tracking-tight text-white/45 truncate">{member.phone} {member.address ? `• ${member.address}` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto sm:ml-0 shrink-0">
                    <button 
                      onClick={() => handleEditClick(member)}
                      className="p-2.5 rounded-xl border border-brand-border/30 text-white/50 hover:text-white hover:bg-white/5 hover:border-brand-border/50 flex items-center justify-center transition-all active:scale-[0.95]"
                      title="Edit Profile"
                    >
                      <Edit3 size={15} strokeWidth={1.5} /> 
                    </button>
                    <button 
                      onClick={() => toggleStatus(member)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all active:scale-[0.95] ${member.isActive ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}
                      title={member.isActive ? "Deactivate" : "Activate"}
                    >
                      {member.isActive ? <PowerOff size={15} strokeWidth={1.5} /> : <Power size={15} strokeWidth={1.5} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(member)}
                      className="p-2.5 border border-red-500/20 rounded-xl text-red-400 hover:text-white hover:bg-red-500/30 flex items-center justify-center transition-all active:scale-[0.95]"
                      title="Delete Member"
                    >
                      <Trash2 size={15} strokeWidth={1.5} /> 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemberManagement;
