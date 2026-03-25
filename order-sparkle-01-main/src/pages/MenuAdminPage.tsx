import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/posStore';
import { menuAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import { MenuItem } from '@/store/posStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Combos', 'Other'];

export default function MenuAdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Main Course',
    discountPercentage: 0,
    description: '',
    isVeg: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMenuItems();
  }, [isAuthenticated, navigate]);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getItems();
      setMenuItems(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        await menuAPI.updateItem(editingId, formData);
        toast({ title: 'Success', description: 'Menu item updated successfully' });
      } else {
        await menuAPI.addItem(formData);
        toast({ title: 'Success', description: 'Menu item added successfully' });
      }

      setFormData({
        name: '',
        price: 0,
        category: 'Main Course',
        discountPercentage: 0,
        description: '',
        isVeg: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save item',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item._id || null);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      discountPercentage: item.discountPercentage || 0,
      description: item.description || '',
      isVeg: item.isVeg || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await menuAPI.deleteItem(id);
      toast({ title: 'Success', description: 'Item deleted successfully' });
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Menu Management</h1>
            <p className="text-gray-600">Add, edit, or remove menu items</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: '',
                price: 0,
                category: 'Main Course',
                discountPercentage: 0,
                description: '',
                isVeg: false,
              });
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Item name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Discount (%)</label>
                  <Input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Item description"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="ml-2 text-sm font-medium">Vegetarian</label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  {editingId ? 'Update Item' : 'Add Item'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Menu Items List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      {item.isVeg && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Veg</span>}
                      {item.discountPercentage! > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          -{item.discountPercentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">Category: <span className="text-blue-600">{item.category}</span></span>
                      <span className="font-medium">Price: <span className="text-green-600">₹{item.price}</span></span>
                      <span className="font-medium">Final Price: <span className="text-purple-600">₹{item.finalPrice}</span></span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(item._id!)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
