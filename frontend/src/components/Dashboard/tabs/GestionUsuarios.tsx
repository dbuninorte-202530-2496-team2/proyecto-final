import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Key, Link, ShieldCheck } from 'lucide-react';
import type { Usuario, UsuarioFormData } from '../../../types/usuario';
import type { Rol } from '../../../types/rol';
import type { Personal } from '../../../types/personal';
import { usuariosService } from '../../../services/api/usuarios.service';
import { personalService } from '../../../services/api/personal.service';
import { rolesService } from '../../../services/api/roles.service';

export const GestionUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [personal, setPersonal] = useState<Personal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUsername, setEditingUsername] = useState<string | null>(null);
    const [formData, setFormData] = useState<UsuarioFormData>({
        usuario: '',
        contrasena: '',
        id_personal: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usuariosData, personalData, rolesData] = await Promise.all([
                usuariosService.getAll(),
                personalService.getAll(),
                rolesService.getAll(),
            ]);

            setPersonal(personalData);
            setRoles(rolesData);

            // Create display model: merge usuarios with personal data
            const usuariosDisplay: Usuario[] = usuariosData.map((u: any) => {
                const personalAsignado = personalData.find(p => p.usuario === u.usuario);
                const rol = personalAsignado ? rolesData.find(r => r.id === personalAsignado.id_rol) : undefined;

                return {
                    usuario: u.usuario,
                    email: personalAsignado?.correo || 'Sin correo',
                    id_personal: personalAsignado?.id || 0,
                    personalNombre: personalAsignado
                        ? `${personalAsignado.nombre} ${personalAsignado.apellido || ''}`.trim()
                        : 'Sin asignar',
                    id_rol: personalAsignado?.id_rol || 0,
                    rolNombre: rol?.nombre || 'Sin rol',
                } as Usuario;
            });

            setUsuarios(usuariosDisplay);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsuarios = useMemo(() =>
        usuarios.filter(u =>
            u.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.personalNombre || '').toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [usuarios, searchTerm]);

    // Personal disponible (no asignado a otro usuario, excepto el actual editando)
    const personalDisponible = useMemo(() =>
        personal.filter(p =>
            !p.usuario || (editingUsername && p.usuario === editingUsername)
        ),
        [personal, editingUsername]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUsername) {
                // Update flow - usuario, contraseña y asignación de personal (solo si no tenía)
                const usuarioActual = usuarios.find(u => u.usuario === editingUsername);
                const updateData: any = {
                    usuario: formData.usuario
                };

                // Update password if provided
                if (formData.contrasena) {
                    updateData.contrasena = formData.contrasena;
                }

                await usuariosService.update(editingUsername, updateData);

                // Asignar personal si no tenía y se seleccionó uno
                if (usuarioActual?.id_personal === 0 && formData.id_personal > 0) {
                    await personalService.update(formData.id_personal, {
                        usuario: editingUsername,
                    });
                }

                alert('Usuario actualizado correctamente');
            } else {
                // Create flow - crear usuario sin personal obligatorio y sin contraseña obligatoria
                const createData: any = {
                    usuario: formData.usuario,
                };

                // Solo agregar contraseña si se proporcionó
                if (formData.contrasena) {
                    createData.contrasena = formData.contrasena;
                }

                // 1. Create usuario record
                await usuariosService.create(createData);

                // 2. Link to personal si se seleccionó
                if (formData.id_personal && formData.id_personal > 0) {
                    await personalService.update(formData.id_personal, {
                        usuario: formData.usuario,
                    });
                }

                alert('Usuario creado correctamente');
            }

            // Reload data
            await loadData();
            handleCloseForm();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Error al guardar el usuario');
        }
    };

    const handleEdit = (usuario: Usuario) => {
        setEditingUsername(usuario.usuario);
        setFormData({
            usuario: usuario.usuario,
            contrasena: '', // Don't pre-fill password
            id_personal: usuario.id_personal,
        });
        setShowForm(true);
    };

    const handleDelete = async (usuario: Usuario) => {
        if (!window.confirm(`¿Eliminar el usuario '${usuario.usuario}'?`)) {
            return;
        }

        try {
            // 1. Unlink from personal if assigned
            if (usuario.id_personal && usuario.id_personal > 0) {
                await personalService.update(usuario.id_personal, { usuario: undefined });
            }

            // 2. Delete usuario record
            await usuariosService.delete(usuario.usuario);

            // Reload data
            await loadData();
            alert('Usuario eliminado correctamente');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Error al eliminar el usuario');
        }
    };

    const handleResetPassword = async (usuario: Usuario) => {
        const email = usuario.id_personal > 0 ? usuario.email : 'sin correo asignado';
        if (!window.confirm(`¿Enviar nueva contraseña al correo ${email}?`)) {
            return;
        }

        if (usuario.id_personal === 0) {
            alert('Este usuario no tiene personal asignado. No se puede enviar correo.');
            return;
        }

        try {
            await usuariosService.sendPassword(usuario.usuario);
            alert(`Se ha enviado un enlace de restablecimiento a ${usuario.email}`);
        } catch (error: any) {
            console.error('Error sending password:', error);
            alert(error.response?.data?.message || 'Error al enviar la contraseña');
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUsername(null);
        setFormData({
            usuario: '',
            contrasena: '',
            id_personal: 0,
        });
    };

    // Auto-fill username when selecting personal
    const handlePersonalChange = (personalId: number) => {
        const p = personal.find(per => per.id === personalId);
        if (p) {
            setFormData(prev => ({
                ...prev,
                id_personal: personalId,
                usuario: prev.usuario || p.correo.split('@')[0], // Suggest username if empty
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                id_personal: 0,
            }));
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8">Cargando...</div>;
    }

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
                    Crear Usuario
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
                                <th className="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsuarios.map(usuario => (
                                <tr key={usuario.usuario} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-indigo-900">{usuario.usuario}</div>
                                        <div className="text-xs text-gray-500">{usuario.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {usuario.id_personal > 0 ? (
                                            <span className="flex items-center gap-1 text-gray-700">
                                                <Link className="w-3 h-3 text-green-500" />
                                                {usuario.personalNombre}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-gray-400 italic">
                                                <Link className="w-3 h-3" />
                                                Sin asignar
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {usuario.rolNombre && usuario.rolNombre !== 'Sin rol' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                <ShieldCheck className="w-3 h-3" />
                                                {usuario.rolNombre}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 italic">
                                                Sin rol
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleResetPassword(usuario)}
                                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                            title="Enviar contraseña"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEdit(usuario)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(usuario)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsuarios.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">
                            {editingUsername ? 'Editar Usuario' : 'Crear Usuario'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Mostrar selector de personal al crear O al editar si no tiene personal */}
                                {(!editingUsername || (editingUsername && usuarios.find(u => u.usuario === editingUsername)?.id_personal === 0)) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {editingUsername ? 'Asignar a Personal' : 'Asignar a Personal (Opcional)'}
                                        </label>
                                        <select
                                            value={formData.id_personal || ''}
                                            onChange={(e) => handlePersonalChange(Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">-- Sin Asignar --</option>
                                            {personalDisponible.map(p => {
                                                const rol = roles.find(r => r.id === p.id_rol);
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {p.nombre} {p.apellido} - {rol?.nombre} ({p.correo})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {editingUsername
                                                ? 'Este usuario no tiene personal asignado. Puedes asignarlo ahora.'
                                                : 'Puedes crear el usuario sin asignarlo a ningún personal'}
                                        </p>
                                    </div>
                                )}

                                {/* Mostrar info si ya tiene personal asignado */}
                                {editingUsername && usuarios.find(u => u.usuario === editingUsername)?.id_personal! > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800 flex items-center gap-2">
                                            <Link className="w-4 h-4" />
                                            <span>
                                                <strong>Personal asignado:</strong> {usuarios.find(u => u.usuario === editingUsername)?.personalNombre}
                                            </span>
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Este usuario ya tiene personal asignado. No se puede cambiar desde aquí.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de Usuario <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.usuario}
                                        onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ej: jperez"
                                        disabled={!!editingUsername}
                                    />
                                    {editingUsername && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            El nombre de usuario no se puede modificar
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña {editingUsername && '(Opcional)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.contrasena}
                                        onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={editingUsername ? "Dejar vacío para no cambiar" : "Contraseña opcional"}
                                        minLength={formData.contrasena ? 6 : 0}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {editingUsername
                                            ? "Dejar vacío para mantener la contraseña actual"
                                            : "La contraseña es opcional. Si no se proporciona, se puede establecer después"}
                                    </p>
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
                                    {editingUsername ? 'Actualizar Usuario' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};