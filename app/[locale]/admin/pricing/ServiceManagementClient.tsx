'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, Loader2, DollarSign, Eye, EyeOff } from 'lucide-react';

interface Service {
  id: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  price: string;
  serviceType: string;
  active: boolean;
  displayOrder: number;
}

interface ServiceManagementClientProps {
  initialServices: Service[];
}

export default function ServiceManagementClient({ initialServices }: ServiceManagementClientProps) {
  const router = useRouter();
  // Sort services by displayOrder
  const sortedInitialServices = [...initialServices].sort((a, b) => a.displayOrder - b.displayOrder);
  const [services, setServices] = useState(sortedInitialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Service>>({});

  // Get the next available display order
  const getNextDisplayOrder = () => {
    if (services.length === 0) return 1;
    const maxOrder = Math.max(...services.map(s => s.displayOrder), 0);
    return Math.max(maxOrder + 1, 1);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditForm(service);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setLoading(true);

    try {
      // Ensure displayOrder is a number
      const dataToSend = {
        ...editForm,
        id: editingId,
        displayOrder: editForm.displayOrder ? parseInt(String(editForm.displayOrder)) : undefined,
      };

      const response = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update service');
      }

      const data = await response.json();
      
      // Update local state with all services from server (properly ordered)
      setServices(data.allServices || [data.service]);
      setEditingId(null);
      setEditForm({});
    } catch (error: any) {
      alert(error.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete service');
      }

      // Update local state immediately
      setServices(services.filter(s => s.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete service');
    }
  };

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nameEn: formData.get('nameEn') as string,
      nameFr: formData.get('nameFr') as string,
      descriptionEn: formData.get('descriptionEn') as string,
      descriptionFr: formData.get('descriptionFr') as string,
      price: formData.get('price') as string,
      serviceType: formData.get('serviceType') as string,
      active: formData.get('active') === 'true',
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
    };

    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create service');
      }

      const responseData = await response.json();
      
      // Update local state with all services from server (properly ordered)
      setServices(responseData.allServices || [responseData.service]);
      setShowAddModal(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      alert(error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, active: !active }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle service status');
      }

      const data = await response.json();
      
      // Use allServices from API response if available, otherwise update locally
      if (data.allServices) {
        setServices(data.allServices);
      } else {
        const updatedServices = services.map(s => s.id === id ? data.service : s);
        setServices(updatedServices.sort((a, b) => a.displayOrder - b.displayOrder));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to toggle service status');
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Management</h3>
            <p className="text-sm text-gray-600">
              Manage your services, pricing, and availability
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-amber-500 text-white rounded-lg hover:from-blue-800 hover:to-amber-600 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Service
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service, index) => {
          const isEditing = editingId === service.id;

          return (
            <div
              key={service.id}
              className={`bg-white rounded-lg shadow-md p-6 ${!service.active ? 'opacity-60' : ''}`}
            >
              {isEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (English)
                      </label>
                      <input
                        type="text"
                        value={editForm.nameEn || ''}
                        onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (French)
                      </label>
                      <input
                        type="text"
                        value={editForm.nameFr || ''}
                        onChange={(e) => setEditForm({ ...editForm, nameFr: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (English)
                      </label>
                      <textarea
                        value={editForm.descriptionEn || ''}
                        onChange={(e) => setEditForm({ ...editForm, descriptionEn: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (French)
                      </label>
                      <textarea
                        value={editForm.descriptionFr || ''}
                        onChange={(e) => setEditForm({ ...editForm, descriptionFr: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="text"
                        value={editForm.price || ''}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="150 or Sur devis"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={editForm.displayOrder || 0}
                        onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the position where this service should appear (currently at position {index + 1})
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editForm.active ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {service.nameEn} / {service.nameFr}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            service.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <p>{service.descriptionEn}</p>
                        <p>{service.descriptionFr}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-blue-700">
                          <DollarSign className="h-5 w-5" />
                          <span className="font-semibold">{service.price} TND</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          Position: {index + 1}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {service.serviceType}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(service.id, service.active)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={service.active ? 'Deactivate' : 'Activate'}
                      >
                        {service.active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.nameEn)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Service</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (French) *
                  </label>
                  <input
                    type="text"
                    name="nameFr"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English) *
                  </label>
                  <textarea
                    name="descriptionEn"
                    required
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (French) *
                  </label>
                  <textarea
                    name="descriptionFr"
                    required
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    required
                    placeholder="ORIENTATION_SESSION"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use UPPERCASE_WITH_UNDERSCORES format
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    name="price"
                    required
                    placeholder="150 or Sur devis"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={getNextDisplayOrder()}
                    min="1"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the position where this service should appear (1 = first, 2 = second, etc.). Services at this position and after will be shifted down.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="active"
                  defaultValue="true"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-amber-500 text-white rounded-lg hover:from-blue-800 hover:to-amber-600 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
