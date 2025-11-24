// src/features/account/pages/AccountPage.tsx

import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerUsuarioPorId,
  actualizarUsuario,
  cambiarPassword,
} from "../api/accountApi";
import type {
  UsuarioAuth,
  PlanUsuario,
} from "../../auth/api/authApi";
import { Eye, EyeOff } from "lucide-react";

type PasswordForm = {
  actual: string;
  nueva: string;
  confirmacion: string;
};

const getPlanLabel = (plan: PlanUsuario | undefined): string => {
  if (!plan) return "Plan Free";
  switch (plan) {
    case "PRO":
      return "Plan Pro";
    case "MASTER_DEL_AHORRO":
      return "Master del ahorro";
    case "FREE":
    default:
      return "Plan Free";
  }
};

const AccountPage = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // datos de usuario (inputs)
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const [savingUser, setSavingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // contraseña
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    actual: "",
    nueva: "",
    confirmacion: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // mostrar / ocultar contraseña (ojitos)
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // modal edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // modal logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // modal reautenticación al cambiar correo
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);

  useEffect(() => {
    // Recuperar usuario desde localStorage
    const stored = localStorage.getItem("ahorrape-user");
    if (!stored) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(stored) as UsuarioAuth;

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // Obtenemos la versión actualizada del backend (incluye plan y rol)
        const data = await obtenerUsuarioPorId(parsed.id);
        const usuarioCompleto: UsuarioAuth = {
          ...parsed,
          ...data,
        };

        setUsuario(usuarioCompleto);
        setNombre(usuarioCompleto.nombre);
        setEmail(usuarioCompleto.email);

        // Aseguramos que en localStorage se guarde el usuario completo
        localStorage.setItem(
          "ahorrape-user",
          JSON.stringify(usuarioCompleto)
        );
      } catch (error) {
        console.error(error);
        setLoadError("No pudimos cargar tu información. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleGuardarDatos = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setSavingUser(true);
    setUserMessage(null);
    setUserError(null);

    try {
      const emailAnterior = usuario.email;

      const updated = await actualizarUsuario(usuario.id, { nombre, email });

      // Mezclamos lo que devuelve el backend con el usuario que ya teníamos,
      // para NO perder plan ni rol.
      const usuarioActualizado: UsuarioAuth = {
        ...usuario,
        ...updated,
      };

      setUsuario(usuarioActualizado);

      // Siempre actualizamos el localStorage con el nuevo usuario
      localStorage.setItem(
        "ahorrape-user",
        JSON.stringify(usuarioActualizado)
      );

      // ⚠️ Si el correo cambió, mostramos modal de reautenticación
      const emailCambio = emailAnterior !== usuarioActualizado.email;

      if (emailCambio) {
        setIsEditModalOpen(false);
        setIsReauthModalOpen(true);
        return;
      }

      // Si no cambió el correo, simplemente mostramos mensaje de éxito
      setUserMessage("Datos actualizados correctamente.");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      setUserError("No se pudieron actualizar tus datos. Intenta de nuevo.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setPasswordMessage(null);
    setPasswordError(null);

    if (passwordForm.nueva !== passwordForm.confirmacion) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setSavingPassword(true);

    try {
      await cambiarPassword(usuario.id, {
        passwordActual: passwordForm.actual,
        passwordNueva: passwordForm.nueva,
      });

      setPasswordMessage("Contraseña actualizada correctamente.");
      setPasswordForm({ actual: "", nueva: "", confirmacion: "" });
    } catch (error) {
      console.error(error);
      setPasswordError(
        "No se pudo actualizar la contraseña. Verifica tu contraseña actual."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePasswordInput =
    (field: keyof PasswordForm) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleConfirmLogout = () => {
    localStorage.removeItem("ahorrape-token");
    localStorage.removeItem("ahorrape-user");
    setIsLogoutModalOpen(false);
    setIsReauthModalOpen(false);
    navigate("/login");
  };

  const initialLetter = usuario?.nombre?.charAt(0)?.toUpperCase() ?? "?";
  const planLabel = getPlanLabel(usuario?.plan);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Header superior estilo dashboard */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-lg">&larr;</span>
            <span>Volver</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl font-semibold md:text-3xl">
              Mi cuenta
            </h1>
            <p className="text-xs text-slate-500 md:text-sm">
              Gestiona los datos de tu cuenta en AhorraPE.
            </p>
          </div>
        </header>

        {/* LOADING */}
        {loading && (
          <div className="space-y-4">
            <div className="h-32 rounded-3xl bg-slate-200/70 animate-pulse" />
            <div className="h-40 rounded-3xl bg-slate-200/70 animate-pulse" />
            <div className="h-32 rounded-3xl bg-slate-200/70 animate-pulse" />
          </div>
        )}

        {/* ERROR */}
        {!loading && loadError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO */}
        {!loading && !loadError && usuario && (
          <main className="space-y-6 md:space-y-8">
            {/* Sección grande de resumen + datos básicos */}
            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-md md:px-8 md:py-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Bloque de identidad */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-semibold text-white shadow-md">
                    {initialLetter}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Usuario · {planLabel}
                    </p>
                    <p className="text-lg font-semibold md:text-xl">
                      {nombre}
                    </p>
                    <p className="text-sm text-slate-500">{email}</p>
                  </div>
                </div>

                {/* Estado y acciones */}
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Cuenta activa
                  </div>
                  <p className="text-xs text-slate-500">
                    Esta es la información principal que usas para acceder a
                    AhorraPE.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMessage(null);
                      setUserError(null);
                      setIsEditModalOpen(true);
                    }}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Editar datos
                  </button>
                </div>
              </div>
            </section>

            {/* Sección de opciones de cuenta */}
            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-md md:px-8 md:py-8">
              {/* Opciones adicionales */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold md:text-lg">
                    Opciones de la cuenta
                  </h2>
                  <p className="text-xs text-slate-500 md:text-sm">
                    Accede rápido a las áreas clave para personalizar tu
                    experiencia.
                  </p>
                </div>

                {/* Categorías personalizadas */}
                <button
                  type="button"
                  onClick={() => navigate("/categorias")}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm shadow-sm transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-base">
                      📂
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">
                        Categorías personalizadas
                      </p>
                      <p className="text-xs text-slate-500">
                        Gestiona tus categorías de ingresos y gastos según tu
                        estilo de vida.
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400">&rarr;</span>
                </button>

                {/* Recordatorios inteligentes */}
                <button
                  type="button"
                  onClick={() => {
                    // futuro: abrir configuración de recordatorios
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm shadow-sm transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-base">
                      ⏰
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">
                        Recordatorios inteligentes
                      </p>
                      <p className="text-xs text-slate-500">
                        Recibe alertas para registrar gastos y no perder el
                        control de tu mes.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-50">
                    Próximamente
                  </span>
                </button>

                {/* Upgrade / Pro */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/planes")}
                    className="flex w-full items-center justify-between rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/90 text-base">
                        ⭐
                      </span>
                      <div className="text-left">
                        <p>Vuelvete un pro del ahorro</p>
                        <p className="text-xs text-emerald-100">
                          Próximamente: insights avanzados, metas y más
                          herramientas para ahorrar mejor.
                        </p>
                      </div>
                    </div>
                    <span className="text-lg">›</span>
                  </button>
                </div>
              </div>

              {/* Separador */}
              <div className="my-6 border-t border-slate-100" />

              {/* Cambiar contraseña */}
              <div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-semibold md:text-lg">
                      Seguridad y contraseña
                    </h2>
                    <p className="text-xs text-slate-500 md:text-sm">
                      Cambia tu contraseña cuando lo necesites para mantener tu
                      cuenta protegida.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection((prev) => !prev);
                      setPasswordMessage(null);
                      setPasswordError(null);
                    }}
                    className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:mt-0"
                  >
                    {showPasswordSection ? "Ocultar sección" : "Cambiar contraseña"}
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <form
                      onSubmit={handleChangePassword}
                      className="space-y-4 md:max-w-xl"
                    >
                      <div className="space-y-1.5">
                        <label
                          htmlFor="password-actual"
                          className="text-xs font-medium text-slate-700"
                        >
                          Contraseña actual
                        </label>
                        <div className="relative">
                          <input
                            id="password-actual"
                            type={showPasswordActual ? "text" : "password"}
                            value={passwordForm.actual}
                            onChange={handlePasswordInput("actual")}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordActual((prev) => !prev)
                            }
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                          >
                            {showPasswordActual ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="password-nueva"
                            className="text-xs font-medium text-slate-700"
                          >
                            Nueva contraseña
                          </label>
                          <div className="relative">
                            <input
                              id="password-nueva"
                              type={showPasswordNueva ? "text" : "password"}
                              value={passwordForm.nueva}
                              onChange={handlePasswordInput("nueva")}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswordNueva((prev) => !prev)
                              }
                              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                            >
                              {showPasswordNueva ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="password-confirmacion"
                            className="text-xs font-medium text-slate-700"
                          >
                            Confirmar nueva contraseña
                          </label>
                          <div className="relative">
                            <input
                              id="password-confirmacion"
                              type={showPasswordConfirm ? "text" : "password"}
                              value={passwordForm.confirmacion}
                              onChange={handlePasswordInput("confirmacion")}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswordConfirm((prev) => !prev)
                              }
                              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                            >
                              {showPasswordConfirm ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingPassword}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                        >
                          {savingPassword && (
                            <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                          )}
                          <span>Actualizar contraseña</span>
                        </button>
                        <span className="text-xs text-slate-500">
                          Usa una contraseña única que no reutilices en otros
                          sitios.
                        </span>
                      </div>

                      {passwordMessage && (
                        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                          {passwordMessage}
                        </p>
                      )}
                      {passwordError && (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                          {passwordError}
                        </p>
                      )}
                    </form>
                  </div>
                )}
              </div>

              {/* Contacto / ayuda */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-semibold md:text-lg">
                      ¿Necesitas ayuda con tu cuenta?
                    </h2>
                    <p className="text-xs text-slate-500 md:text-sm">
                      Escríbenos y te ayudamos con cualquier problema de acceso,
                      seguridad o uso de AhorraPE.
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 md:text-xs">
                    Atención de lunes a viernes, 9:00 – 18:00.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="mailto:soporte@ahorrape.com?subject=Soporte%20AhorraPE&body=Hola%2C%20necesito%20ayuda%20con%20mi%20cuenta..."
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    <span>📧</span>
                    <span>Correo a soporte</span>
                  </a>
                  <a
                    href="https://wa.me/51999999999?text=Hola%2C%20tengo%20una%20consulta%20sobre%20mi%20cuenta%20AhorraPE."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <span>💬</span>
                    <span>WhatsApp soporte</span>
                  </a>
                </div>
              </div>

              {/* Logout */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
                >
                  <span>🚪</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </section>
          </main>
        )}

        {/* MODAL PARA EDITAR DATOS */}
        {isEditModalOpen && usuario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl md:p-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Editar datos de la cuenta
                  </h2>
                  <p className="text-xs text-slate-500">
                    Actualiza tu nombre y correo asociados a AhorraPE.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMessage(null);
                    setUserError(null);
                    setIsEditModalOpen(false);
                    setNombre(usuario.nombre);
                    setEmail(usuario.email);
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleGuardarDatos} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-nombre"
                    className="text-xs font-medium text-slate-700"
                  >
                    Nombre
                  </label>
                  <input
                    id="modal-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-email"
                    className="text-xs font-medium text-slate-700"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                  >
                    {savingUser && (
                      <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                    )}
                    <span>Guardar cambios</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMessage(null);
                      setUserError(null);
                      setIsEditModalOpen(false);
                      setNombre(usuario.nombre);
                      setEmail(usuario.email);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>

                {userMessage && (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {userMessage}
                  </p>
                )}
                {userError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {userError}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* MODAL LOGOUT */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl md:p-7">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-lg">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-base font-semibold">
                    ¿Seguro que quieres salir?
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Tendrás que iniciar sesión nuevamente para acceder a tu
                    cuenta y a tus movimientos.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  <span>🚪</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REAUTENTICACIÓN TRAS CAMBIAR CORREO */}
        {isReauthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl md:p-7">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-lg">
                  🔐
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Necesitas volver a iniciar sesión
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Tu correo fue actualizado. Por razones de seguridad debemos cerrar tu sesión.
                    Inicia sesión nuevamente con tu nuevo correo.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p>
                  No perderás ningún dato. Esta es una medida de seguridad para mantener tu cuenta protegida.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <span>Volver a iniciar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountPage;
