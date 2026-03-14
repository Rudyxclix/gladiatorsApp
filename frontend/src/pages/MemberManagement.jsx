import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Users, Edit3, Trash2, Power, PowerOff } from 'lucide-react';

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

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5001/api/users', {
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

        await axios.put(`http://localhost:5001/api/users/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5001/api/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchMembers();
      handleCancelForm();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to save member');
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
      const { data } = await axios.delete(`http://localhost:5001/api/users/${member._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(data.message);
      fetchMembers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete member');
    }
  };

  const toggleStatus = async (member) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/users/${member._id}`, { isActive: !member.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
    } catch (error) {
       alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#fafafa]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/[0.05] sticky top-0 z-50 px-6 h-[4.5rem] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-black/5 rounded-full text-brand-charcoal transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-semibold tracking-tight m-0">Member Directory</h1>
        </div>
        <button 
          onClick={showForm ? handleCancelForm : () => setShowForm(true)}
          className="btn-primary py-2 px-5 shadow-none flex items-center gap-2 text-sm rounded-full"
        >
          {showForm ? 'Cancel' : <><Plus size={16} strokeWidth={2} /> Add Member</>}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {showForm && (
          <div className="card mb-12 overflow-hidden transform transition-all border-brand-charcoal/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="border-b border-black/[0.05] pb-6 mb-8">
              <h2 className="text-xl font-semibold tracking-tight">{editingId ? 'Edit Member Profile' : 'Add New Member'}</h2>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Full Name</label>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Phone Number</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="input-field bg-white"
                    >
                      <option value="Member">Member</option>
                      <option value="Executive">Executive</option>
                      <option value="Treasurer">Treasurer</option>
                    </select>
                  </div>
                  <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">
                    {editingId ? 'New Password (Leave blank to keep current)' : 'Login Password'}
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field"
                  placeholder="Optional context"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                {editingId && (
                  <button type="button" onClick={handleCancelForm} className="btn-secondary px-6">Cancel</button>
                )}
                <button type="submit" className="btn-primary px-8">{editingId ? 'Update Profile' : 'Save Member'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-[1.5rem] border border-black/[0.03]"></div>)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-black/10">
               <h3 className="text-xl font-medium tracking-tight mt-4 text-brand-charcoal/80">No Members Found</h3>
               <p className="text-sm text-brand-charcoal/50 mt-1">Start by adding your executives.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {members.map(member => (
                <div key={member._id} className={`card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${!member.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange-dark flex items-center justify-center shrink-0">
                      <Users size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold tracking-tight leading-none">{member.name}</h3>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center font-bold ${
                            member.role === 'Treasurer' ? 'bg-indigo-50 text-indigo-500' : 'bg-brand-orange/10 text-brand-orange-dark'
                          }`}>
                            {member.role}
                        </span>
                        {!member.isActive && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-red-50 text-red-500">
                             Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm tracking-tight text-brand-charcoal/50">{member.phone} {member.address ? `• ${member.address}` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditClick(member)}
                      className="p-2.5 btn-secondary rounded-xl text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-black/5 flex items-center justify-center transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 size={16} strokeWidth={1.5} /> 
                    </button>
                    <button 
                      onClick={() => toggleStatus(member)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${member.isActive ? 'border-red-100 text-red-500 hover:bg-red-50' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-50'}`}
                      title={member.isActive ? "Deactivate" : "Activate"}
                    >
                      {member.isActive ? <PowerOff size={16} strokeWidth={1.5} /> : <Power size={16} strokeWidth={1.5} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(member)}
                      className="p-2.5 border border-red-100 rounded-xl text-red-500 hover:text-white hover:bg-red-500 flex items-center justify-center transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 size={16} strokeWidth={1.5} /> 
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
