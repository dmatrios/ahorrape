// src/features/categorias/pages/CategoriasPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  type CategoriaResponse,
  type TipoCategoria,
} from "../api/categoriasApi";
import {
  ArrowLeft,
  PiggyBank,
  Plus,
  Pencil,
  Power,
  X,
} from "lucide-react";

const CategoriasPage: React.FC = () => {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<number[]>([]);

  // Modal nueva categoría
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoCategoria, setTipoCategoria] =
    useState<TipoCategoria>("GASTO");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal editar categoría
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] =
    useState<CategoriaResponse | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editTipoCategoria, setEditTipoCategoria] =
    useState<TipoCategoria>("GASTO");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await listarCategorias();
      setCategorias(data);
    } catch (err: any) {
      setErrorMsg("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirModalNueva = () => {
    setNombre("");
    setDescripcion("");
    setTipoCategoria("GASTO");
    setFormError(null);
    setIsModalOpen(true);
  };

  const cerrarModalNueva = () => {
    setIsModalOpen(false);
  };

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await crearCategoria({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        tipoCategoria,
      });
      await cargarCategorias();
      cerrarModalNueva();
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        setFormError(
          err.response.data?.mensaje ||
            "No se pudo crear la categoría. Verifica los datos."
        );
      } else {
        setFormError(
          "Ocurrió un error al crear la categoría. Intenta de nuevo."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const abrirModalEditar = (cat: CategoriaResponse) => {
    setCategoriaEditando(cat);
    setEditNombre(cat.nombre);
    setEditDescripcion(cat.descripcion || "");
    setEditTipoCategoria(cat.tipoCategoria);
    setEditError(null);
    setEditModalOpen(true);
  };

  const cerrarModalEditar = () => {
    setEditModalOpen(false);
    setCategoriaEditando(null);
  };

  const handleEditarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaEditando) return;
    setEditError(null);

    if (!editNombre.trim()) {
      setEditError("El nombre es obligatorio.");
      return;
    }

    setEditSaving(true);
    try {
      await actualizarCategoria(categoriaEditando.id, {
        nombre: editNombre.trim(),
        descripcion: editDescripcion.trim(),
        tipoCategoria: editTipoCategoria,
      });
      await cargarCategorias();
      cerrarModalEditar();
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        setEditError(
          err.response.data?.mensaje ||
            "No se pudo actualizar la categoría. Verifica los datos."
        );
      } else {
        setEditError(
          "Ocurrió un error al actualizar la categoría. Intenta de nuevo."
        );
      }
    } finally {
      setEditSaving(false);
    }
  };

  const toggleEstadoCategoria = async (cat: CategoriaResponse) => {
    // Prevent duplicate toggles
    if (togglingIds.includes(cat.id)) return;

    // Optimistic UI: flip locally first
    setTogglingIds((prev) => [...prev, cat.id]);
    setCategorias((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, activa: !c.activa } : c))
    );

    try {
      await actualizarCategoria(cat.id, { activa: !cat.activa });
      // Optionally re-sync from server if you prefer canonical data
      // await cargarCategorias();
    } catch (err) {
      // Rollback if request failed
      setCategorias((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, activa: cat.activa } : c))
      );
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== cat.id));
    }
  };

  const badgeColor = (tipo: TipoCategoria) => {
    if (tipo === "INGRESO") return "bg-emerald-100 text-emerald-700";
    if (tipo === "GASTO") return "bg-rose-100 text-rose-700";
    return "bg-sky-100 text-sky-700";
  };

  const totalActivas = categorias.filter((c) => c.activa).length;
  const totalGasto = categorias.filter(
    (c) => c.tipoCategoria === "GASTO"
  ).length;
  const totalIngreso = categorias.filter(
    (c) => c.tipoCategoria === "INGRESO"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header con flecha y chanchito */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#1CAC78] flex items-center justify-center shadow-md">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Categorías
              </h1>
              <p className="text-sm text-slate-500">
                Organiza tus ingresos y gastos por categorías.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={abrirModalNueva}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1CAC78] text-white text-sm font-medium hover:bg-[#50C878] transition"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      {/* Resumen pequeño */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
          Totales: {categorias.length}
        </span>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Activas: {totalActivas}
        </span>
        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
          De gasto: {totalGasto}
        </span>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          De ingreso: {totalIngreso}
        </span>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Cargando categorías...</p>
      )}

      {errorMsg && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      {!loading && !errorMsg && categorias.length === 0 && (
        <p className="text-sm text-slate-500">
          Aún no tienes categorías. Crea tu primera categoría para comenzar.
        </p>
      )}

      {categorias.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Descripción
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">
                  Estado
                </th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-2 text-slate-800">
                    {cat.nombre}
                  </td>
                  <td className="px-4 py-2 text-slate-600 max-w-xs">
                    {cat.descripcion || "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(
                        cat.tipoCategoria
                      )}`}
                    >
                      {cat.tipoCategoria}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        cat.activa
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cat.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(cat)}
                        className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEstadoCategoria(cat)}
                        disabled={togglingIds.includes(cat.id)}
                        className={`p-1.5 rounded-full border text-xs font-medium inline-flex items-center justify-center gap-1 ${
                          cat.activa
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        } ${togglingIds.includes(cat.id) ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={
                          cat.activa ? "Desactivar categoría" : "Activar categoría"
                        }
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {cat.activa ? "Desactivar" : "Activar"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                          {cat.nombre}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {cat.descripcion || "-"}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor(
                            cat.tipoCategoria
                          )}`}
                        >
                          {cat.tipoCategoria}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        cat.activa ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cat.activa ? "Activa" : "Inactiva"}
                    </span>

                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(cat)}
                        className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEstadoCategoria(cat)}
                        disabled={togglingIds.includes(cat.id)}
                        className={`p-1.5 rounded-full border text-xs font-medium inline-flex items-center justify-center gap-1 ${
                          cat.activa
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        } ${togglingIds.includes(cat.id) ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={cat.activa ? "Desactivar categoría" : "Activar categoría"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal nueva categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-6 relative">
            <button
              type="button"
              onClick={cerrarModalNueva}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Nueva categoría
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Define si será de ingresos, gastos o ambos.
            </p>

            <form className="space-y-4" onSubmit={handleCrearCategoria}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                  placeholder="Ej: Alimentación, Sueldo..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                  rows={2}
                  placeholder="Opcional"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-700">
                  Tipo de categoría
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["GASTO", "INGRESO", "AMBOS"] as TipoCategoria[]).map(
                    (tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTipoCategoria(tipo)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          tipoCategoria === tipo
                            ? "bg-[#1CAC78] text-white border-[#1CAC78]"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {tipo}
                      </button>
                    )
                  )}
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600">{formError}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-2.5 rounded-full bg-[#1CAC78] text-white text-sm font-semibold hover:bg-[#50C878] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Crear categoría"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar categoría */}
      {editModalOpen && categoriaEditando && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-6 relative">
            <button
              type="button"
              onClick={cerrarModalEditar}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Editar categoría
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Ajusta el nombre, descripción o tipo de la categoría.
            </p>

            <form className="space-y-4" onSubmit={handleEditarCategoria}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                  rows={2}
                  placeholder="Opcional"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-700">
                  Tipo de categoría
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["GASTO", "INGRESO", "AMBOS"] as TipoCategoria[]).map(
                    (tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setEditTipoCategoria(tipo)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          editTipoCategoria === tipo
                            ? "bg-[#1CAC78] text-white border-[#1CAC78]"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {tipo}
                      </button>
                    )
                  )}
                </div>
              </div>

              {editError && (
                <p className="text-xs text-red-600">{editError}</p>
              )}

              <button
                type="submit"
                disabled={editSaving}
                className="w-full mt-2 py-2.5 rounded-full bg-[#1CAC78] text-white text-sm font-semibold hover:bg-[#50C878] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editSaving ? "Guardando cambios..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasPage;
