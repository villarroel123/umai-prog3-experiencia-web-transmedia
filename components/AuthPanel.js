"use client";

import { useState } from "react";

const ERROR_MESSAGES = {
  "auth/email-already-in-use": "El email ya tiene una cuenta asociada.",
  "auth/invalid-credential": "El email o la contraseña no son correctos.",
  "auth/invalid-email": "El formato del email no es válido.",
  "auth/popup-closed-by-user": "La ventana de Google se cerró antes de completar el acceso.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes para este sitio.",
  "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase Authentication.",
  "auth/operation-not-allowed": "Este método de acceso no está habilitado en Firebase Authentication.",
  "auth/network-request-failed": "No se pudo conectar con Firebase. Revisá tu conexión e intentá otra vez.",
  "permission-denied": "La sesión está activa, pero Firestore rechazó el guardado. Revisá las reglas de seguridad.",
  "auth/weak-password": "La contraseña debe tener al menos seis caracteres.",
};

function getErrorMessage(code) {
  return ERROR_MESSAGES[code] || `No se pudo completar la operación (${code}).`;
}

export default function AuthPanel({
  authError,
  authLoading,
  onClose,
  onContinueAsGuest,
  onGoogle,
  onSubmitEmail,
  onResetPassword,
  user,
}) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [publicName, setPublicName] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await onSubmitEmail({ email, password, mode, publicName });
      onClose();
    } catch {
      // El hook expone un codigo de error presentable en el panel.
    }
  }

  async function handleGoogle() {
    try {
      await onGoogle();
      onClose();
    } catch {
      // El hook expone un codigo de error presentable en el panel.
    }
  }

  async function handleGuest() {
    try {
      await onContinueAsGuest();
      onClose();
    } catch {
      // El hook expone un codigo de error presentable en el panel.
    }
  }

  return (
    <section className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="auth-panel">
        <button className="auth-close" onClick={onClose} aria-label="Cerrar acceso">×</button>
        <p className="kicker">IDENTIFICACIÓN / FIREBASE AUTH</p>
        <h2 id="auth-title">IDENTIFICAR OPERADOR</h2>

        {user && !user.isAnonymous ? (
          <div className="auth-current">
            <small>SESIÓN ACTIVA</small>
            <strong>{user.displayName || user.email}</strong>
            <span>{user.email}</span>
            <button onClick={handleGuest} disabled={authLoading}>CONTINUAR COMO INVITADO</button>
          </div>
        ) : (
          <>
            <div className="auth-tabs" aria-label="Modo de autenticación">
              <button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>INGRESAR</button>
              <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>CREAR CUENTA</button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "signup" && <label><span>NOMBRE PÚBLICO</span><input value={publicName} onChange={(event) => setPublicName(event.target.value)} minLength={2} maxLength={32} required /></label>}
              <label>
                <span>EMAIL</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              <label>
                <span>CONTRASEÑA</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
              </label>
              <button className="auth-primary" type="submit" disabled={authLoading}>
                {authLoading ? "PROCESANDO…" : mode === "signup" ? "CREAR CUENTA" : "INGRESAR"}
              </button>
            </form>
            <button type="button" onClick={async () => { try { await onResetPassword(email); setNotice("Revisá tu correo para recuperar la contraseña."); } catch {} }} disabled={authLoading || !email}>RECUPERAR CONTRASEÑA</button>
            {notice && <p role="status">{notice}</p>}

            <div className="auth-separator"><span>O</span></div>
            <button className="auth-google" onClick={handleGoogle} disabled={authLoading}>CONTINUAR CON GOOGLE</button>
            <p className="auth-note">Como invitado, tus recuerdos quedan guardados en este navegador.</p>
          </>
        )}

        {authError && <p className="auth-error" role="alert">{getErrorMessage(authError)}</p>}
      </div>
    </section>
  );
}
