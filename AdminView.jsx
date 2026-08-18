import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { COLORS, Card, Pill, statusTone, btnGhost, Modal, Field, inputStyle, btnPrimary, BODY_PARTS, SEVERITY, INJURY_STATUS, todayISO, addDays } from "./ui";
import { Users, TrendingUp, ShieldAlert, Plus } from "lucide-react";

export default function AdminView() {
  const [adminTab, setAdminTab] = useState("aktivitet");
  const [players, setPlayers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [editingInjury, setEditingInjury] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: profs }, { data: acts }, { data: injs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "spiller"),
      supabase.from("activities").select("*"),
      supabase.from("injuries").select("*"),
    ]);
    setPlayers(profs || []);
    setActivities(acts || []);
    setInjuries(injs || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const playerName = (id) => players.find((p) => p.id === id)?.full_name || "Ukjent";

  const totalSessions = activities.filter((a) => a.status === "Gjennomført").length;
  const totalAbsence = activities.filter((a) => a.status === "Fravær").length;

  const sessionsPerPlayer = useMemo(() => players.map((p) => ({
    name: p.full_name.split(" ")[0],
    Trening: activities.filter((a) => a.player_id === p.id && a.type === "Trening" && a.status === "Gjennomført").length,
    Kamp: activities.filter((a) => a.player_id === p.id && a.type === "Kamp" && a.status === "Gjennomført").length,
  })), [players, activities]);

  const avgFormPerPlayer = useMemo(() => players.map((p) => {
    const vals = activities.filter((a) => a.player_id === p.id && a.spillform != null).map((a) => a.spillform);
    const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    return { name: p.full_name.split(" ")[0], Spillform: Math.round(avg * 10) / 10 };
  }), [players, activities]);

  const lowFormAlerts = useMemo(() => activities
    .filter((a) => a.spillform != null && a.spillform <= 4)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6), [activities]);

  const bodyPartFrequency = useMemo(() => {
    const counts = {};
    injuries.forEach((i) => { counts[i.body_part] = (counts[i.body_part] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [injuries]);

  const activeInjuriesCount = injuries.filter((i) => i.status !== "Frisk").length;

  const saveInjury = async (payload) => {
    if (editingInjury) {
      const { data, error } = await supabase.from("injuries").update(payload).eq("id", editingInjury.id).select();
      if (!error && data) setInjuries((prev) => prev.map((i) => (i.id === editingInjury.id ? data[0] : i)));
    } else {
      const { data, error } = await supabase.from("injuries").insert([payload]).select();
      if (!error && data) setInjuries((prev) => [data[0], ...prev]);
    }
    setShowInjuryModal(false);
    setEditingInjury(null);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: COLORS.gray }}>Laster...</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[["aktivitet", "Aktivitet", Users], ["spillform", "Spillform", TrendingUp], ["skader", "Skadekartlegging", ShieldAlert]].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setAdminTab(key)}
            style={{
              display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
              borderRadius: 10, padding: "9px 15px", fontWeight: 600, fontSize: 14, fontFamily: "Inter, sans-serif",
              background: adminTab === key ? COLORS.pitchDark : "#fff",
              color: adminTab === key ? "#fff" : COLORS.ink,
              border: `1px solid ${adminTab === key ? COLORS.pitchDark : COLORS.line}`,
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {adminTab === "aktivitet" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
            <StatCard label="Gjennomførte økter" value={totalSessions} tone="green" />
            <StatCard label="Registrert fravær" value={totalAbsence} tone="red" />
            <StatCard label="Spillere i tropp" value={players.length} tone="gray" />
          </div>
          <Card style={{ marginBottom: 18 }}>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Økter per spiller</div>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={sessionsPerPlayer}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Trening" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kamp" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Alle registreringer</div>
            <ActivityTable activities={[...activities].sort((a, b) => (a.date < b.date ? 1 : -1))} playerName={playerName} />
          </Card>
        </>
      )}

      {adminTab === "spillform" && (
        <>
          <Card style={{ marginBottom: 18 }}>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Snitt spillform per spiller (1–10)</div>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={avgFormPerPlayer}>
                  <CartesianGrid stroke={COLORS.line} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Spillform" radius={[4, 4, 0, 0]}>
                    {avgFormPerPlayer.map((entry, idx) => (
                      <Cell key={idx} fill={entry.Spillform >= 6 ? COLORS.green : entry.Spillform >= 4 ? COLORS.amber : COLORS.red} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Lav spillform – siste registreringer (≤4)</div>
            {lowFormAlerts.length === 0 ? (
              <div style={{ fontSize: 13.5, color: COLORS.gray, textAlign: "center", padding: "16px 0" }}>Ingen varsler akkurat nå.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lowFormAlerts.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${COLORS.line}`, borderRadius: 9, padding: "9px 12px" }}>
                    <span style={{ fontSize: 13.5 }}><strong>{playerName(a.player_id)}</strong> · {a.type} · {new Date(a.date).toLocaleDateString("nb-NO")}</span>
                    <Pill tone="red">{a.spillform}/10</Pill>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {adminTab === "skader" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
            <StatCard label="Aktive / under behandling" value={activeInjuriesCount} tone="red" />
            <StatCard label="Totalt registrerte skader" value={injuries.length} tone="gray" />
            <StatCard label="Mest utsatte område" value={bodyPartFrequency[0]?.name || "—"} tone="amber" small />
          </div>
          <Card style={{ marginBottom: 18 }}>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Skadekartlegging – hyppighet per kroppsdel</div>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={bodyPartFrequency} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke={COLORS.line} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11.5 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.red} radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 600 }}>Skadeoversikt</div>
              <button onClick={() => { setEditingInjury(null); setShowInjuryModal(true); }} style={{ ...btnGhost, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} /> Registrer skade
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...injuries].sort((a, b) => (a.dato < b.dato ? 1 : -1)).map((i) => (
                <div key={i.id} onClick={() => { setEditingInjury(i); setShowInjuryModal(true); }} style={{ cursor: "pointer", border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 13.5 }}><strong>{playerName(i.player_id)}</strong> — {i.body_part}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Pill tone="gray">{i.alvorlighetsgrad}</Pill>
                      <Pill tone={statusTone(i.status)}>{i.status}</Pill>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 4 }}>
                    Meldt {new Date(i.dato).toLocaleDateString("nb-NO")}
                    {i.forventet_tilbake && i.status !== "Frisk" ? ` · Forventet tilbake ${new Date(i.forventet_tilbake).toLocaleDateString("nb-NO")}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {showInjuryModal && (
        <InjuryModalAdmin
          injury={editingInjury}
          players={players}
          onClose={() => { setShowInjuryModal(false); setEditingInjury(null); }}
          onSave={saveInjury}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone, small }) {
  const toneColor = { green: COLORS.pitchMid, red: COLORS.red, amber: "#8A5A16", gray: COLORS.ink }[tone] || COLORS.ink;
  return (
    <Card>
      <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 6 }}>{label}</div>
      <div className="font-display" style={{ fontSize: small ? 18 : 26, fontWeight: 700, color: toneColor }}>{value}</div>
    </Card>
  );
}

function ActivityTable({ activities, playerName }) {
  if (activities.length === 0) return <div style={{ fontSize: 13.5, color: COLORS.gray, textAlign: "center", padding: 20 }}>Ingen registreringer.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: COLORS.gray, borderBottom: `1px solid ${COLORS.line}` }}>
            <th style={{ padding: "8px 6px" }}>Spiller</th>
            <th style={{ padding: "8px 6px" }}>Dato</th>
            <th style={{ padding: "8px 6px" }}>Type</th>
            <th style={{ padding: "8px 6px" }}>Status</th>
            <th style={{ padding: "8px 6px" }}>Varighet</th>
            <th style={{ padding: "8px 6px" }}>Spillform</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
              <td style={{ padding: "8px 6px", fontWeight: 600 }}>{playerName(a.player_id)}</td>
              <td style={{ padding: "8px 6px" }}>{new Date(a.date).toLocaleDateString("nb-NO")}</td>
              <td style={{ padding: "8px 6px" }}><Pill tone={a.type === "Kamp" ? "amber" : "green"}>{a.type}</Pill></td>
              <td style={{ padding: "8px 6px" }}><Pill tone={statusTone(a.status)}>{a.status}</Pill></td>
              <td style={{ padding: "8px 6px" }}>{a.duration ? `${a.duration} min` : "—"}</td>
              <td style={{ padding: "8px 6px" }}>{a.spillform ? `${a.spillform}/10` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InjuryModalAdmin({ injury, players, onClose, onSave }) {
  const [form, setForm] = useState(
    injury
      ? { ...injury }
      : {
          player_id: players[0]?.id,
          body_part: BODY_PARTS[0],
          dato: todayISO(),
          alvorlighetsgrad: "Lett",
          status: "Aktiv",
          forventet_tilbake: addDays(todayISO(), 14),
          notat: "",
        }
  );
  return (
    <Modal title={injury ? "Rediger skade" : "Registrer skade"} onClose={onClose}>
      <Field label="Spiller">
        <select value={form.player_id} onChange={(e) => setForm({ ...form, player_id: e.target.value })} style={inputStyle}>
          {players.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </Field>
      <Field label="Kroppsdel">
        <select value={form.body_part} onChange={(e) => setForm({ ...form, body_part: e.target.value })} style={inputStyle}>
          {BODY_PARTS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Dato skaden oppstod">
        <input type="date" value={form.dato} onChange={(e) => setForm({ ...form, dato: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Alvorlighetsgrad">
        <select value={form.alvorlighetsgrad} onChange={(e) => setForm({ ...form, alvorlighetsgrad: e.target.value })} style={inputStyle}>
          {SEVERITY.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Status">
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
          {INJURY_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Forventet tilbake">
        <input type="date" value={form.forventet_tilbake || ""} onChange={(e) => setForm({ ...form, forventet_tilbake: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Notat (valgfritt)">
        <textarea rows={3} value={form.notat} onChange={(e) => setForm({ ...form, notat: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <button onClick={onClose} style={btnGhost}>Avbryt</button>
        <button onClick={() => onSave(form)} style={btnPrimary}>Lagre</button>
      </div>
    </Modal>
  );
}
