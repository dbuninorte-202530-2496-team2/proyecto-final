import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Search } from 'lucide-react';
import type { Rol } from '../../../types/rol';

// Helper para IDs
const generateId = (items: { id: number }[]): number =>
    items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

export const GestionRoles: React.FC = () => {
    const [roles, setRoles] = useState<Rol[]>([
        { id: 1, nombre: 'ADMINISTRADOR', descripcion: 'Control total del sistema' },
        { id: 2, nombre: 'ADMINISTRATIVO', descripcion: 'Gestión académica y operativa' },
        { id: 3, nombre: 'TUTOR', descripcion: 'Registro de clases y notas' },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<Rol>>({ nombre: '', descripcion: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoles = roles.filter(r =>
        r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre) return;

        if (editingId) {
            setRoles(prev => prev.map(r => r.id === editingId ? { ...r, ...formData } as Rol : r));
        } else {
            setRoles(prev => [...prev, { id: generateId(prev), ...formData } as Rol]);
        }

        handleCloseForm();
    };

    const handleEdit = (rol: Rol) => {
        setEditingId(rol.id);
        setFormData({ nombre: rol.nombre, descripcion: rol.descripcion });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Eliminar este rol?')) {
            setRoles(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ nombre: '', descripcion: '' });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Roles y Perfiles
                </h3>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Rol
                </button>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>

            {/* Tabla */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600">Descripción</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredRoles.map(rol => (
                            <tr key={rol.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-indigo-900">{rol.nombre}</td>
                                <td className="px-4 py-3 text-gray-600">{rol.descripcion || '—'}</td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <button onClick={() => handleEdit(rol)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(rol.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {editingId ? 'Editar Rol' : 'Nuevo Rol'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                                    placeholder="Ej: COORDINADOR"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Descripción de permisos y responsabilidades..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
