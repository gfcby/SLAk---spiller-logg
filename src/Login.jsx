import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { COLORS, Card, Field, inputStyle, btnPrimary, btnGhost } from "./ui";
import { Activity } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [birthYear, setBirthYear] = useState("");
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
        data: { full_name: fullName, role: "spiller", position, birth_year: birthYear },
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
          <img src="/logo.jpg" alt="SpillerLogg" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
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
              <Field label="Fødselsår">
                <input
                  type="number"
                  required
                  min={1950}
                  max={2020}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  style={inputStyle}
                  placeholder="f.eks. 2008"
                />
              </Field>
              <Field label="Posisjon (valgfritt)">
                <input value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} placeholder="f.eks. Midtbane" />
              </Field>
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
          Nye kontoer opprettes automatisk som spiller. Administrator-tilgang tildeles manuelt av trener/leder i Supabase.
        </div>
      </div>
    </div>
  );
}
