import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { ArrowLeft, Plus, Calendar, Settings, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const fetchPrograms = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('token');
        const { data } = await api.get('/programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setLoading(false);
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
      toast.success(editingId ? 'Program updated' : 'Program created');
    } catch (error) {
      console.error(error);
      toast.error(editingId ? 'Failed to update program' : 'Failed to create program');
    }
  };

  const handleDelete = async (program) => {
    if (!window.confirm(`Are you sure you want to delete "${program.name}"? This action cannot be undone and will delete all available coupon books.`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/programs/${program._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Program deleted');
      fetchPrograms(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete program');
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
      toast.success(`Program marked as ${newStatus}`);
      fetchPrograms(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-grey">
      <header className="bg-brand-card-bg/80 backdrop-blur-xl border-b border-brand-border/20 sticky top-0 z-50 px-4 sm:px-6 h-14 sm:h-[4.5rem] flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight m-0">Programs</h1>
        </div>
        <button 
          onClick={showForm ? handleCancelForm : () => setShowForm(true)}
          className="btn-primary py-2 px-4 sm:px-5 shadow-none flex items-center gap-1.5 sm:gap-2 text-sm rounded-full"
        >
          {showForm ? 'Cancel' : <><Plus size={16} strokeWidth={2} /> <span className="hidden sm:inline">New</span> Program</>}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {showForm && (
          <div className="card mb-8 sm:mb-12 overflow-hidden transform transition-all border-brand-charcoal/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.06)] slide-in-bottom">
            <div className="border-b border-brand-border/20 pb-4 sm:pb-6 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{editingId ? 'Edit Program Details' : 'Create New Program'}</h2>
              <p className="text-white/60 mt-1 font-light flex items-center gap-2 text-sm">
                <Calendar size={14} /> {editingId ? 'Update the details for this fundraising event.' : 'Define a new fundraising event to associate coupon books.'}
              </p>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Program Name</label>
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field resize-none h-24 sm:h-28"
                  placeholder="Brief details about the program..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">Target Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="input-field max-w-full sm:max-w-xs"
                />
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
                {editingId && (
                  <button type="button" onClick={handleCancelForm} className="btn-secondary px-6">Cancel</button>
                )}
                <button type="submit" className="btn-primary px-8">{editingId ? 'Update Program' : 'Save Program'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-3 sm:space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-brand-card-bg rounded-[1.25rem] sm:rounded-[1.5rem] border border-brand-border/40"></div>)}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-16 sm:py-24 bg-brand-card-bg rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-brand-border/30">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-card-bg/50 rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Calendar className="text-white/30" size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">No Programs Yet</h3>
              <p className="text-base sm:text-lg text-white/60 mt-2 mb-6 sm:mb-8 font-light max-w-sm mx-auto px-4">Create your first fundraising program to get started.</p>
              <button onClick={() => setShowForm(true)} className="btn-secondary rounded-full">
                Create Program
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-5">
              {programs.map(program => (
                <div key={program._id} className="card p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 hover:translate-y-0 group">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-semibold tracking-tight">{program.name}</h3>
                      <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold ${
                        program.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        {program.status}
                      </span>
                    </div>
                    <p className="text-white/60 mb-2 sm:mb-3 font-light leading-relaxed max-w-xl text-sm">{program.description || 'No description provided.'}</p>
                    <p className="text-[10px] sm:text-xs text-white/40 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar size={13} strokeWidth={1.5} /> 
                      {new Date(program.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleEditClick(program)}
                      className="btn-secondary py-2 px-3 sm:px-4 shadow-none text-sm flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl group-hover:border-white/10 transition-colors flex-1 sm:flex-none"
                    >
                      <Edit3 size={15} strokeWidth={1.5} /> 
                      Edit
                    </button>
                    <button 
                      onClick={() => updateStatus(program._id, program.status)}
                      className="btn-secondary py-2 px-3 sm:px-4 shadow-none text-sm flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl group-hover:border-white/10 transition-colors flex-1 sm:flex-none"
                    >
                      <Settings size={15} strokeWidth={1.5} /> 
                      Status
                    </button>
                    <button 
                      onClick={() => handleDelete(program)}
                      className="btn-secondary py-2 px-3 shadow-none text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 text-sm flex items-center justify-center gap-1.5 rounded-xl transition-all"
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

export default ProgramManagement;
