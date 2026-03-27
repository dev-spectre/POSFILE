import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/posStore';
import { menuAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit2, Plus, Loader2, Search, Filter, ArrowLeft, ChevronRight, Check, ImagePlus, X as XIcon } from 'lucide-react';
import { MenuItem } from '@/store/posStore';
import { getFoodImage } from '@/lib/imageHelper';

const CATEGORIES = ['Pizza', 'Burger', 'Beverages', 'Desserts', 'South Indian', 'Main Course', 'Appetizers', 'Fresh Juice', 'Combos', 'Other'];

export default function MenuAdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Main Course',
    discountPercentage: 0,
    description: '',
    isVeg: false,
    image: '',
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getItems();
      setMenuItems(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load menu items', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingId;
    try {
      if (isEditing) {
        const response = await menuAPI.updateItem(editingId, formData);
        // Backend returns { menuItem: {...} }
        const updatedItem = response.data.menuItem || response.data;
        setMenuItems(prev => prev.map(item => (item.id || item._id) === editingId ? updatedItem : item));
        toast({ title: '✅ Menu Updated', description: `"${updatedItem.name}" has been successfully modified.` });
      } else {
        const response = await menuAPI.addItem(formData);
        // Backend returns { menuItem: {...} }
        const newItem = response.data.menuItem || response.data;
        setMenuItems(prev => [...prev, newItem]);
        toast({ title: '🎉 Item Added', description: `"${newItem.name}" is now live on your menu!` });
      }
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to save item', variant: 'destructive' });
      fetchMenuItems();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, category: 'Main Course', discountPercentage: 0, description: '', isVeg: false, image: '' });
    setEditingId(null);
    setShowForm(false);
    setImagePreview(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id || item._id || null);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      discountPercentage: item.discountPercentage || 0,
      description: item.description || '',
      isVeg: item.isVeg || false,
      image: item.image || '',
    });
    setImagePreview(item.image || null);
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image under 2MB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleDelete = async (id: string) => {
    const item = menuItems.find(i => (i.id || i._id) === id);
    if (!confirm(`Remove "${item?.name}" from the menu?`)) return;
    
    // Optimistic Update
    const originalItems = [...menuItems];
    setMenuItems(prev => prev.filter(item => (item.id || item._id) !== id));
    
    try {
      await menuAPI.deleteItem(id);
      toast({ title: '🗑️ Item Removed', description: `"${item?.name}" has been deleted from your menu.` });
    } catch (error: any) {
      setMenuItems(originalItems);
      toast({ title: 'Error', description: 'Failed to delete item. Please try again.', variant: 'destructive' });
    }
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans">
      {/* Header Section */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => navigate('/dashboard')} className="rounded-full h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800">
               <ArrowLeft className="h-6 w-6" />
             </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Menu Control</h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Design and refine your culinary offerings.</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="pos-btn-primary h-14 px-8 shadow-orange-500/20"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Master Item
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items, categories, or descriptions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium transition-all"
            />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 dark:border-slate-800 font-bold flex shrink-0 items-center justify-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </Button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]"
              >
                <div className="p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{editingId ? 'Edit Menu Item' : 'New Master Item'}</h2>
                  <Button variant="ghost" onClick={resetForm} className="rounded-full">✕</Button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto flex-1 scrollbar-thin">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Item Name *</label>
                      <input 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-premium w-full px-5 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Price (₹) *</label>
                      <input 
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="input-premium w-full px-5 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="input-premium w-full px-5 outline-none appearance-none bg-slate-50 dark:bg-slate-800"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Discount (%)</label>
                      <input 
                        type="number"
                        value={formData.discountPercentage || ''}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
                        className="input-premium w-full px-5 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full h-24 p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-medium"
                      />
                    </div>

                    {/* Optional Image Upload */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Item Image <span className="text-slate-300 font-medium normal-case tracking-normal">(optional — auto-selected if not uploaded)</span>
                      </label>
                      {imagePreview ? (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={removeImage}
                              className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                            >
                              <XIcon className="h-5 w-5" />
                            </button>
                          </div>
                          <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-widest text-white/80 bg-black/30 px-2 py-1 rounded-lg">Custom Image</span>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <div className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 hover:border-orange-400 hover:bg-orange-50/10 transition-all duration-200">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                              <ImagePlus className="h-6 w-6 text-orange-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Click to upload image</p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">PNG, JPG, WEBP — max 2MB</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex items-center gap-8 px-2">
                       <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isVeg ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-300'}`}>
                           {formData.isVeg && <Check className="h-4 w-4 text-white" />}
                         </div>
                         <input type="checkbox" className="hidden" checked={formData.isVeg} onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })} />
                         <span className="text-sm font-bold">Vegetarian Item</span>
                       </label>
                    </div>
                  </div>
                  <div className="mt-8 sm:mt-10 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pb-4">
                    <Button onClick={resetForm} variant="ghost" className="flex-1 h-14 font-bold text-slate-400 hover:text-red-500">Discard</Button>
                    <Button type="submit" className="pos-btn-primary flex-1 h-14">
                      {editingId ? 'Push Changes' : 'Add to Menu'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center opacity-30">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="font-bold">Syncing menu database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredItems.map((item, i) => (
                <motion.div
                  key={(item.id || item._id) || `admin-item-${i}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: (i % 6) * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={item.image || getFoodImage(item.name, item.category)} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-5 right-5 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="h-11 w-11 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-xl active:scale-90 transition-transform"><Edit2 className="h-5 w-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete((item.id || item._id)!); }} className="h-11 w-11 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"><Trash2 className="h-5 w-5" /></button>
                    </div>
                    {item.isVeg && <div className="absolute top-5 left-5 h-7 w-7 rounded-xl bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /></div>}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4 gap-2">
                       <div className="flex-1 min-w-0">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1.5 block">{item.category}</span>
                         <h3 className="text-xl font-bold truncate leading-tight">{item.name}</h3>
                       </div>
                       <div className="text-right">
                         {item.discountPercentage ? (
                            <>
                              <p className="text-xs text-slate-400 font-bold line-through">₹{item.price}</p>
                              <p className="text-xl font-black text-orange-600">₹{item.finalPrice}</p>
                            </>
                         ) : (
                            <p className="text-xl font-black text-slate-900 dark:text-white">₹{item.price}</p>
                         )}
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed h-12 mb-6">{item.description || 'No description provided for this item. Add one to help customers choose.'}</p>
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">Master Item</span>
                       <Button variant="ghost" onClick={() => handleEdit(item)} className="h-10 px-5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all">Edit Details <ChevronRight className="h-4 w-4 ml-1.5" /></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
