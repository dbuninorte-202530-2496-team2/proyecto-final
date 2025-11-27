// src/components/Dashboard/tabs/AulasForm.tsx
import React from "react";
import type { Aula } from "../../../types/aula";
import type { Institucion } from "../../../types/institucion";
import type { Sede } from "../../../types/sede";

export type InstitucionIdFilter = number | "all";

interface AulasFormProps {
  isEditing: boolean;
  formData: Partial<Aula>;

  instituciones: Institucion[];
  sedesFiltradas: Sede[];
  selectedInstitucionId: InstitucionIdFilter;

  formError: string | null;
  isSubmitting: boolean;

  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onChangeInstitucion: (value: InstitucionIdFilter) => void;
}

const gradosPermitidos = [4, 5, 9, 10];

const getProgramaFromGrado = (grado?: number) => {
  if (!grado) return "-";
  return grado === 4 || grado === 5 ? "INSIDECLASSROOM" : "OUTSIDECLASSROOM";
};

const AulasForm: React.FC<AulasFormProps> = ({
  isEditing,
  formData,
  instituciones,
  sedesFiltradas,
  selectedInstitucionId,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
  onChangeInstitucion,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{isEditing ? "Editar Aula" : "Agregar Aula"}</h3>

        <form onSubmit={onSubmit} className="form-grid">
          {/* Institución */}
          <div className="form-group">
            <label>Institución</label>
            <select
              value={
                selectedInstitucionId === "all"
                  ? "all"
                  : selectedInstitucionId.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                const newValue: InstitucionIdFilter =
                  value === "all" ? "all" : Number(value);
                onChangeInstitucion(newValue);
              }}
            >
              <option value="all" disabled>
                Selecciona una institución
              </option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Sede */}
          <div className="form-group">
            <label>Sede</label>
            <select
              name="id_sede"
              value={formData.id_sede ?? 0}
              onChange={onChange}
            >
              <option value={0} disabled>
                Selecciona una sede
              </option>
              {sedesFiltradas.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Grado */}
          <div className="form-group">
            <label>Grado</label>
            <select
              name="grado"
              value={formData.grado ?? 4}
              onChange={onChange}
            >
              {gradosPermitidos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo */}
          <div className="form-group">
            <label>Grupo</label>
            <input
              name="grupo"
              value={formData.grupo ?? ""}
              onChange={onChange}
              placeholder="Ej: A, B, C..."
            />
          </div>

          {/* Programa (solo lectura) */}
          <div className="form-group">
            <label>Programa</label>
            <input
              disabled
              value={getProgramaFromGrado(formData.grado)}
            />
          </div>

          {formError && (
            <div className="form-error">{formError}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Guardando..."
                : isEditing
                ? "Guardar cambios"
                : "Crear Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AulasForm;
