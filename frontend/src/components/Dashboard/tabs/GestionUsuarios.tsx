import React, { useState, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Key, Link, ShieldCheck } from 'lucide-react';
import type { Usuario, UsuarioFormData } from '../../../types/usuario';
import type { Rol } from '../../../types/rol';
import type { Personal } from '../../../types/personal';

// Helper para IDs
const generateId = (items: { id: number }[]): number =>
    items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

export const GestionUsuarios: React.FC = () => {
    // Mock Data
    const [usuarios, setUsuarios] = useState<Usuario[]>([
        { id: 1, username: 'admin', email: 'admin@globalenglish.edu.co', id_personal: 1, personalNombre: 'Mei Ching', id_rol: 1, rolNombre: 'ADMINISTRADOR', estado: 'ACTIVO', ultimo_acceso: '2025-11-29 10:00' },
        { id: 2, username: 'lrodriguez', email: 'laura.rod@globalenglish.edu.co', id_personal: 2, personalNombre: 'Laura Rodríguez', id_rol: 3, rolNombre: 'TUTOR', estado: 'ACTIVO', ultimo_acceso: '2025-11-28 15:30' },
    ]);

    const [roles] = useState<Rol[]>([
        { id: 1, nombre: 'ADMINISTRADOR' },
        { id: 2, nombre: 'ADMINISTRATIVO' },
        { id: 3, nombre: 'TUTOR' },
    ]);

    const [personal] = useState<Personal[]>([
        { id: 1, nombres: 'Mei', apellidos: 'Ching', correo: 'mei@test.com', telefono: '', tipo_doc: 1, num_doc: '123', id_rol: 1 },
        { id: 2, nombres: 'Laura', apellidos: 'Rodríguez', correo: 'laura@test.com', telefono: '', tipo_doc: 1, num_doc: '456', id_rol: 3 },
        { id: 3, nombres: 'Carlos', apellidos: 'Martínez', correo: 'carlos@test.com', telefono: '', tipo_doc: 1, num_doc: '789', id_rol: 3 },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<UsuarioFormData>({
        username: '',
        email: '',
        id_personal: null,
        id_rol: 3,
        estado: 'ACTIVO',
        password: '',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsuarios = useMemo(() =>
        usuarios.filter(u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.personalNombre || '').toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [usuarios, searchTerm]);

    // Personal disponible (no asignado a otro usuario, excepto el actual editando)
    const personalDisponible = useMemo(() =>
        personal.filter(p =>
            !usuarios.some(u => u.id_personal === p.id && u.id !== editingId)
        ),
        [personal, usuarios, editingId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const personalSeleccionado = personal.find(p => p.id === formData.id_personal);
        const rolSeleccionado = roles.find(r => r.id === formData.id_rol);

        const nuevoUsuario: Usuario = {
            id: editingId || generateId(usuarios),
            username: formData.username,
            email: formData.email,
            id_personal: formData.id_personal,
            personalNombre: personalSeleccionado ? `${personalSeleccionado.nombres} ${personalSeleccionado.apellidos}` : undefined,
            id_rol: formData.id_rol,
            rolNombre: rolSeleccionado?.nombre,
            estado: formData.estado,
            ultimo_acceso: editingId ? usuarios.find(u => u.id === editingId)?.ultimo_acceso : undefined
        };

        if (editingId) {
            setUsuarios(prev => prev.map(u => u.id === editingId ? nuevoUsuario : u));
        } else {
            setUsuarios(prev => [...prev, nuevoUsuario]);
            // Simulación de envío de correo
            if (formData.email) {
                alert(`Se ha enviado la contraseña al correo: ${formData.email}`);
            }
        }

        handleCloseForm();
    };

    const handleEdit = (usuario: Usuario) => {
        setEditingId(usuario.id);
        setFormData({
            username: usuario.username,
            email: usuario.email,
            id_personal: usuario.id_personal,
            id_rol: usuario.id_rol,
            estado: usuario.estado,
        });
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            setUsuarios(prev => prev.filter(u => u.id !== id));
        }
    };

    const handleResetPassword = (email: string) => {
        if (window.confirm(`¿Enviar nueva contraseña al correo ${email}?`)) {
            alert(`Se ha enviado un enlace de restablecimiento a ${email}`);
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            username: '',
            email: '',
            id_personal: null,
            id_rol: 3,
            estado: 'ACTIVO',
            password: '',
        });
    };

    // Auto-fill email and role when selecting personal
    const handlePersonalChange = (personalId: number) => {
        const p = personal.find(per => per.id === personalId);
        if (p) {
            setFormData(prev => ({
                ...prev,
                id_personal: personalId,
                email: p.correo,
                id_rol: p.id_rol, // Heredar rol del personal por defecto
                username: p.correo.split('@')[0] // Sugerir username
            }));
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Gestión de Usuarios
                </h3>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por usuario, nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>

            {/* Tabla */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Usuario</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Personal Asignado</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rol</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Estado</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsuarios.map(usuario => (
                                <tr key={usuario.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-indigo-900">{usuario.username}</div>
                                        <div className="text-xs text-gray-500">{usuario.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {usuario.personalNombre ? (
                                            <span className="flex items-center gap-1 text-gray-700">
                                                <Link className="w-3 h-3 text-green-500" />
                                                {usuario.personalNombre}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                            <ShieldCheck className="w-3 h-3" />
                                            {usuario.rolNombre}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {usuario.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleResetPassword(usuario.email)}
                                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                            title="Enviar contraseña"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEdit(usuario)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(usuario.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">
                            {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Columna Izquierda: Datos de Cuenta */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Datos de Cuenta</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {!editingId && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Generar automáticamente si se deja vacío"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Se enviará al correo electrónico.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Columna Derecha: Asignación y Permisos */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Asignación y Permisos</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vincular con Personal</label>
                                        <select
                                            value={formData.id_personal || ''}
                                            onChange={(e) => handlePersonalChange(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">-- Seleccionar Personal --</option>
                                            {personalDisponible.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombres} {p.apellidos} ({p.num_doc})
                                                </option>
                                            ))}
                                            {editingId && formData.id_personal && (
                                                <option value={formData.id_personal}>
                                                    {/* Mantener el actual si se está editando */}
                                                    {usuarios.find(u => u.id === editingId)?.personalNombre} (Actual)
                                                </option>
                                            )}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Autocompleta datos basados en el registro de personal.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol del Sistema <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.id_rol}
                                            onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {roles.map(rol => (
                                                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <select
                                            value={formData.estado}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="ACTIVO">ACTIVO</option>
                                            <option value="INACTIVO">INACTIVO</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md"
                                >
                                    Guardar Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
