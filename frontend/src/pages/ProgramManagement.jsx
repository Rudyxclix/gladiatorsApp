import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { ArrowLeft, Plus, Calendar, Settings, Edit3, Trash2 } from 'lucide-react';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
        const { data } = await api.get('/programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(data);
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
        // Update existing program
        const { data } = await api.put(`/programs/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrograms(programs.map(p => p._id === editingId ? data : p));
      } else {
        // Create new program
        const { data } = await api.post('/programs', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrograms([data, ...programs]);
      }
      handleCancelForm();
    } catch (error) {
      console.error(error);
      alert(editingId ? 'Failed to update program' : 'Failed to create program');
    }
  };

  const handleDelete = async (program) => {
    if (!window.confirm(`Are you sure you want to delete "${program.name}"? This action cannot be undone and will delete all available coupon books.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/programs/${program._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPrograms();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete program');
    }
  };

  const handleEditClick = (program) => {
    setEditingId(program._id);
    setFormData({
      name: program.name,
      description: program.description || '',
      date: new Date(program.date).toISOString().split('T')[0] // Format for date input
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', date: '' });
  };

  const updateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
    try {
      const token = localStorage.getItem('token');
      await api.put(`/programs/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchPrograms();
    } catch (error) {
      console.error(error);
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
          <h1 className="text-lg font-semibold tracking-tight m-0">Programs</h1>
        </div>
        <button 
          onClick={showForm ? handleCancelForm : () => setShowForm(true)}
          className="btn-primary py-2 px-5 shadow-none flex items-center gap-2 text-sm rounded-full"
        >
          {showForm ? 'Cancel' : <><Plus size={16} strokeWidth={2} /> New Program</>}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {showForm && (
          <div className="card mb-12 overflow-hidden transform transition-all border-brand-charcoal/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="border-b border-black/[0.05] pb-6 mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">{editingId ? 'Edit Program Details' : 'Create New Program'}</h2>
              <p className="text-brand-charcoal/60 mt-1 font-light flex items-center gap-2">
                <Calendar size={14} /> {editingId ? 'Update the details for this fundraising event.' : 'Define a new fundraising event to associate coupon books.'}
              </p>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Program Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Onam Festival 2024"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field resize-none h-28"
                  placeholder="Brief details about the program..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-brand-charcoal/60">Target Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="input-field max-w-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                {editingId && (
                  <button type="button" onClick={handleCancelForm} className="btn-secondary px-6">Cancel</button>
                )}
                <button type="submit" className="btn-primary px-8">{editingId ? 'Update Program' : 'Save Program'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-[1.5rem] border border-black/[0.03]"></div>)}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-black/10">
              <div className="w-20 h-20 bg-[#fafafa] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-brand-charcoal/20" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-brand-charcoal">No Programs Yet</h3>
              <p className="text-lg text-brand-charcoal/50 mt-2 mb-8 font-light max-w-sm mx-auto">Create your first fundraising program to get started.</p>
              <button onClick={() => setShowForm(true)} className="btn-secondary rounded-full">
                Create Program
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {programs.map(program => (
                <div key={program._id} className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:translate-y-0 group">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold tracking-tight">{program.name}</h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold ${
                        program.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-[#fafafa] text-brand-charcoal/50 border border-black/5'
                      }`}>
                        {program.status}
                      </span>
                    </div>
                    <p className="text-brand-charcoal/60 mb-3 font-light leading-relaxed max-w-xl">{program.description || 'No description provided.'}</p>
                    <p className="text-xs text-brand-charcoal/40 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar size={14} strokeWidth={1.5} /> 
                      {new Date(program.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleEditClick(program)}
                      className="btn-secondary py-2 px-4 shadow-none text-sm flex items-center justify-center gap-2 rounded-xl group-hover:border-black/10 transition-colors w-full sm:w-auto"
                    >
                      <Edit3 size={16} strokeWidth={1.5} /> 
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button 
                      onClick={() => updateStatus(program._id, program.status)}
                      className="btn-secondary py-2 px-4 shadow-none text-sm flex items-center justify-center gap-2 rounded-xl group-hover:border-black/10 transition-colors w-full sm:w-auto"
                    >
                      <Settings size={16} strokeWidth={1.5} /> 
                      <span className="hidden sm:inline">Status</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(program)}
                      className="btn-secondary py-2 px-4 shadow-none text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 text-sm flex items-center justify-center gap-2 rounded-xl transition-all w-full sm:w-auto"
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

export default ProgramManagement;
