import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, LayoutGrid, Check, X } from 'lucide-react';
import { AdminTable } from '../../types/admin';
import { adminRepository } from '../../services/adminRepository';

interface AdminTablesSectionProps {
  tables: AdminTable[];
  onRefresh: () => void;
}

export const AdminTablesSection: React.FC<AdminTablesSectionProps> = ({
  tables,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<AdminTable | null>(null);

  // Form states for new table
  const [tableLabel, setTableLabel] = useState<string>('');
  const [tableZone, setTableZone] = useState<string>('Salón Principal');
  const [customZone, setCustomZone] = useState<string>('');
  const [tableId, setTableId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Group tables by zone
  const tablesByZone = useMemo(() => {
    const grouped: Record<string, AdminTable[]> = {};
    tables.forEach((t) => {
      if (!grouped[t.zone]) grouped[t.zone] = [];
      grouped[t.zone].push(t);
    });
    return grouped;
  }, [tables]);

  // Existing zones
  const existingZones = useMemo(() => {
    const zones = new Set<string>(['Salón Principal', 'Terraza', 'Barra']);
    tables.forEach((t) => zones.add(t.zone));
    return Array.from(zones);
  }, [tables]);

  // Toggle table active/inactive
  const handleToggleActive = async (table: AdminTable) => {
    await adminRepository.updateTable(table.id, {
      active: table.active === false ? true : false,
    });
    onRefresh();
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setTableLabel(`Mesa ${tables.length + 1}`);
    setTableZone(existingZones[0] || 'Salón Principal');
    setCustomZone('');
    setTableId(`mesa-${Date.now().toString(36)}`);
    setFormError(null);
    setEditingTable(null);
    setShowAddModal(true);
  };

  // Open Edit modal
  const handleOpenEdit = (t: AdminTable) => {
    setEditingTable(t);
    setTableLabel(t.label);
    setTableZone(t.zone);
    setCustomZone('');
    setTableId(t.id);
    setFormError(null);
    setShowAddModal(true);
  };

  // Delete table
  const handleDeleteTable = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta mesa?')) {
      await adminRepository.deleteTable(id);
      onRefresh();
    }
  };

  // Submit Add or Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalZone = tableZone === '__new__' ? customZone.trim() : tableZone.trim();
    if (!tableLabel.trim()) {
      setFormError('El nombre de la mesa es obligatorio.');
      return;
    }
    if (!finalZone) {
      setFormError('Indica una zona válida para la mesa.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingTable) {
        await adminRepository.updateTable(editingTable.id, {
          label: tableLabel.trim(),
          zone: finalZone,
        });
      } else {
        await adminRepository.createTable({
          id: tableId.trim() || undefined,
          label: tableLabel.trim(),
          zone: finalZone,
          active: true,
        });
      }
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar mesa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#16120E] p-3 rounded-2xl border border-white/8">
        <div>
          <h4 className="font-display text-sm font-bold text-[#F8E6C1]">
            Mesas y Zonas del Restaurante
          </h4>
          <p className="text-[11px] text-stone-400">
            Las mesas activas aparecerán inmediatamente en el Checkout del cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-1.5 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Mesa</span>
        </button>
      </div>

      {/* Summary count */}
      <div className="flex items-center justify-between px-1 text-xs text-stone-400">
        <span>{tables.length} mesas registradas en {Object.keys(tablesByZone).length} zonas</span>
        <span className="text-[#D4AF37] font-semibold">
          {tables.filter((t) => t.active !== false).length} habilitadas para servicio
        </span>
      </div>

      {/* Zones / Tables List */}
      <div className="space-y-4">
        {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
          <div key={zone} className="bg-[#16120E] p-3.5 rounded-2xl border border-white/8 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-display text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                {zone} ({zoneTables.length})
              </span>
              <span className="text-[10px] text-stone-400">
                {zoneTables.filter((t) => t.active !== false).length} activas
              </span>
            </div>

            <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {zoneTables.map((t) => {
                const isActive = t.active !== false;

                return (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'bg-[#1F1813] border-white/10'
                        : 'bg-black/30 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-xs text-[#F8E6C1] truncate">
                        {t.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t)}
                        title={isActive ? 'Desactivar mesa' : 'Activar mesa'}
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md cursor-pointer transition ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-stone-700 text-stone-400 border border-white/10'
                        }`}
                      >
                        {isActive ? 'Activa' : 'Pausada'}
                      </button>
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono truncate">
                      ID: {t.id}
                    </span>

                    <div className="flex items-center justify-end gap-1 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        title="Editar nombre o zona"
                        className="p-1 rounded-lg text-stone-400 hover:text-[#D4AF37] transition cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTable(t.id)}
                        title="Eliminar mesa"
                        className="p-1 rounded-lg text-stone-400 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Table Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 select-none"
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-[#18130E] border border-[#D4AF37]/50 p-5 shadow-2xl text-stone-100 space-y-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display text-base font-bold text-[#F8E6C1]">
              {editingTable ? 'Editar Mesa' : 'Nueva Mesa de Comedor'}
            </h3>

            {formError && (
              <p className="text-[11px] text-red-400 font-medium bg-red-950/40 p-2 rounded-lg border border-red-500/30">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Nombre visible de la mesa <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  placeholder="Ej. Mesa 5, Terraza 2, VIP 1..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Zona del restaurante <span className="text-[#D4AF37]">*</span>
                </label>
                <select
                  value={tableZone}
                  onChange={(e) => setTableZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] cursor-pointer"
                >
                  {existingZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                  <option value="__new__">+ Crear nueva zona...</option>
                </select>
              </div>

              {tableZone === '__new__' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Nombre de la nueva zona <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customZone}
                    onChange={(e) => setCustomZone(e.target.value)}
                    placeholder="Ej. Balcón, Jardín, Área Reservada..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {!editingTable && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Identificador interno <span className="text-stone-500 font-normal">(auto-generado)</span>
                  </label>
                  <input
                    type="text"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#15110E] border border-white/5 text-stone-400 font-mono text-[11px]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#1A1A1A] gold-button-gradient hover:brightness-110 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingTable ? 'Guardar Cambios' : 'Crear Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
