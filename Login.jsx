import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { COLORS, Card, Field, inputStyle, btnPrimary, btnGhost } from "./ui";
import { Activity } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("spiller");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, position },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setInfo("Konto opprettet! Sjekk e-posten din for bekreftelseslenke, og logg deretter inn.");
      setMode("login");
    }
    setLoading(false);
  };

  return (
    <div
      className="font-body"
      style={{ minHeight: "100vh", background: COLORS.chalk, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, justifyContent: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={18} color={COLORS.pitchDark} />
          </div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: COLORS.pitchDark }}>SPILLERLOGG</div>
        </div>

        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button
              onClick={() => setMode("login")}
              style={{ ...(mode === "login" ? btnPrimary : btnGhost), flex: 1 }}
            >
              Logg inn
            </button>
            <button
              onClick={() => setMode("signup")}
              style={{ ...(mode === "signup" ? btnPrimary : btnGhost), flex: 1 }}
            >
              Opprett konto
            </button>
          </div>

          {error && (
            <div style={{ background: COLORS.redSoft, color: COLORS.red, padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ background: COLORS.greenSoft, color: COLORS.pitchMid, padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
              {info}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin}>
              <Field label="E-post">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Passord">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              </Field>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, width: "100%", marginTop: 4 }}>
                {loading ? "Logger inn..." : "Logg inn"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <Field label="Fullt navn">
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Rolle">
                <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                  <option value="spiller">Spiller</option>
                  <option value="admin">Administrator</option>
                </select>
              </Field>
              {role === "spiller" && (
                <Field label="Posisjon (valgfritt)">
                  <input value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} placeholder="f.eks. Midtbane" />
                </Field>
              )}
              <Field label="E-post">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Passord (minst 6 tegn)">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              </Field>
              <button type="submit" disabled={loading} style={{ ...btnPrimary, width: "100%", marginTop: 4 }}>
                {loading ? "Oppretter..." : "Opprett konto"}
              </button>
            </form>
          )}
        </Card>

        <div style={{ fontSize: 12, color: COLORS.gray, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          Merk: her kan man selv velge «Administrator» ved registrering for enkel testing.
          I skarp drift bør admin-rollen tildeles manuelt i Supabase i stedet — se README.
        </div>
      </div>
    </div>
  );
}
