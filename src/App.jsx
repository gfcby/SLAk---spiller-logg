import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { COLORS, FontStyle } from "./ui";
import { Activity, LogOut } from "lucide-react";
import Login from "./Login";
import PlayerView from "./PlayerView";
import AdminView from "./AdminView";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [session]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.chalk, color: COLORS.gray }}>
        <FontStyle />
        Laster...
      </div>
    );
  }

  if (!session) return <><FontStyle /><Login /></>;

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.chalk, color: COLORS.gray, textAlign: "center", padding: 20 }}>
        <FontStyle />
        Fant ingen profil for denne brukeren ennå. Prøv å logge ut og inn igjen om du nettopp registrerte deg.
      </div>
    );
  }

  return (
    <div className="font-body" style={{ minHeight: "100vh", background: COLORS.chalk, color: COLORS.ink }}>
      <FontStyle />
      <div style={{ background: COLORS.pitchDark, color: "#fff" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={18} color={COLORS.pitchDark} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>SPILLERLOGG</div>
              <div style={{ fontSize: 11.5, color: "#BFE3D2", marginTop: 2 }}>
                {profile.role === "admin" ? "Administrator" : "Spiller"} · {profile.full_name}
              </div>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "#1F4E3B", color: "#fff",
              border: "1px solid #2D6A4F", borderRadius: 9, padding: "8px 14px", cursor: "pointer",
              fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5,
            }}
          >
            <LogOut size={15} /> Logg ut
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "22px 20px 60px" }}>
        {profile.role === "admin" ? <AdminView /> : <PlayerView profile={profile} />}
      </div>
    </div>
  );
}
