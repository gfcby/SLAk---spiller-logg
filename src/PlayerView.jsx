import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  COLORS, Card, Field, Modal, Pill, inputStyle, btnPrimary, btnGhost,
  statusTone, isoDate, todayISO, BODY_PARTS, SEVERITY, INJURY_STATUS, ACT_TYPES, ACT_STATUS,
} from "./ui";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, HeartPulse, User } from "lucide-react";

export default function PlayerView({ profile }) {
  const [tab, setTab] = useState("kalender");
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(todayISO());
  const [activities, setActivities] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [editingInjury, setEditingInjury] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [{ data: acts }, { data: injs }] = await Promise.all([
      supabase.from("activities").select("*").eq("player_id", profile.id).order("date"),
      supabase.from("injuries").select("*").eq("player_id", profile.id).order("dato", { ascending: false }),
    ]);
    setActivities(acts || []);
    setInjuries(injs || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const monthGrid = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(isoDate(new Date(year, month, d)));
    return cells;
  }, [monthCursor]);

  const activitiesByDay = useMemo(() => {
    const map = {};
    activities.forEach((a) => {
      map[a.date] = map[a.date] || [];
      map[a.date].push(a);
    });
    return map;
  }, [activities]);

  const monthLabel = monthCursor.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
  const dayActs = activitiesByDay[selectedDay] || [];
  const weekdayLabels = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

  const addActivity = async (payload) => {
    const { data, error } = await supabase
      .from("activities")
      .insert([{ ...payload, player_id: profile.id }])
      .select();
    if (!error && data) setActivities((prev) => [...prev, ...data]);
    setShowActivityModal(false);
  };

  const saveInjury = async (payload) => {
    if (editingInjury) {
      const { data, error } = await supabase
        .from("injuries")
        .update(payload)
        .eq("id", editingInjury.id)
        .select();
      if (!error && data) setInjuries((prev) => prev.map((i) => (i.id === editingInjury.id ? data[0] : i)));
    } else {
      const { data, error } = await supabase
        .from("injuries")
        .insert([{ ...payload, player_id: profile.id }])
        .select();
      if (!error && data) setInjuries((prev) => [data[0], ...prev]);
    }
    setShowInjuryModal(false);
    setEditingInjury(null);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: COLORS.gray }}>Laster...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <User size={16} color={COLORS.gray} />
        <span style={{ fontSize: 13.5, color: COLORS.gray }}>Logger som</span>
        <span style={{ fontWeight: 700 }}>{profile.full_name}</span>
        {profile.position && <Pill tone="gray">{profile.position}</Pill>}
      </div>

      <div style={{ display: "flex", gap: 8, margin: "16px 0 18px" }}>
        {[["kalender", "Kalender", CalendarDays], ["skader", "Skader", HeartPulse]].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
              borderRadius: 10, padding: "9px 15px", fontWeight: 600, fontSize: 14, fontFamily: "Inter, sans-serif",
              background: tab === key ? COLORS.pitchDark : "#fff",
              color: tab === key ? "#fff" : COLORS.ink,
              border: `1px solid ${tab === key ? COLORS.pitchDark : COLORS.line}`,
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "kalender" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} style={{ ...btnGhost, padding: 8 }}><ChevronLeft size={16} /></button>
              <div className="font-display" style={{ fontSize: 16, fontWeight: 600, textTransform: "capitalize" }}>{monthLabel}</div>
              <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} style={{ ...btnGhost, padding: 8 }}><ChevronRight size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
              {weekdayLabels.map((w) => (
                <div key={w} style={{ textAlign: "center", fontSize: 11, color: COLORS.gray, fontWeight: 600 }}>{w}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {monthGrid.map((iso, idx) => {
                if (!iso) return <div key={idx} />;
                const acts = activitiesByDay[iso] || [];
                const isToday = iso === todayISO();
                const isSelected = iso === selectedDay;
                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDay(iso)}
                    style={{
                      aspectRatio: "1", border: `1.5px solid ${isSelected ? COLORS.pitchDark : isToday ? COLORS.green : COLORS.line}`,
                      borderRadius: 9, background: isSelected ? COLORS.greenSoft : "#fff", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 2,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 500 }}>{Number(iso.slice(-2))}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {acts.slice(0, 3).map((a) => (
                        <span key={a.id} style={{ width: 5, height: 5, borderRadius: 999, background: a.type === "Kamp" ? COLORS.amber : COLORS.green }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: COLORS.gray }}>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: COLORS.green, marginRight: 5 }} />Trening</span>
              <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: COLORS.amber, marginRight: 5 }} />Kamp</span>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: COLORS.gray }}>Valgt dag</div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 600 }}>
                  {new Date(selectedDay).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
                </div>
              </div>
              <button onClick={() => setShowActivityModal(true)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} /> Logg
              </button>
            </div>

            {dayActs.length === 0 ? (
              <div style={{ fontSize: 13.5, color: COLORS.gray, padding: "18px 0", textAlign: "center" }}>
                Ingen aktivitet registrert denne dagen. Trykk «Logg» for å legge til trening eller kamp.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dayActs.map((a) => (
                  <div key={a.id} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <Pill tone={a.type === "Kamp" ? "amber" : "green"}>{a.type}</Pill>
                      <Pill tone={statusTone(a.status)}>{a.status}</Pill>
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.gray }}>
                      {a.duration ? `${a.duration} min` : "—"}{a.spillform ? ` · Spillform ${a.spillform}/10` : ""}
                    </div>
                    {a.notat && <div style={{ fontSize: 13, marginTop: 6 }}>{a.notat}</div>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <SkaderPanel
          injuries={injuries}
          onNy={() => { setEditingInjury(null); setShowInjuryModal(true); }}
          onRediger={(inj) => { setEditingInjury(inj); setShowInjuryModal(true); }}
        />
      )}

      {showActivityModal && (
        <ActivityModal date={selectedDay} onClose={() => setShowActivityModal(false)} onSave={addActivity} />
      )}
      {showInjuryModal && (
        <InjuryModal
          injury={editingInjury}
          onClose={() => { setShowInjuryModal(false); setEditingInjury(null); }}
          onSave={saveInjury}
        />
      )}
    </div>
  );
}

function SkaderPanel({ injuries, onNy, onRediger }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 600 }}>Mine skader</div>
        <button onClick={onNy} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Meld skade</button>
      </div>
      {injuries.length === 0 ? (
        <div style={{ fontSize: 13.5, color: COLORS.gray, textAlign: "center", padding: "20px 0" }}>Ingen skader registrert. Bra jobbet!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {injuries.map((i) => (
            <div key={i.id} onClick={() => onRediger(i)} style={{ cursor: "pointer", border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{i.body_part}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Pill tone="gray">{i.alvorlighetsgrad}</Pill>
                  <Pill tone={statusTone(i.status)}>{i.status}</Pill>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.gray }}>
                Meldt {new Date(i.dato).toLocaleDateString("nb-NO")}
                {i.status !== "Frisk" && i.forventet_tilbake && ` · Forventet tilbake ${new Date(i.forventet_tilbake).toLocaleDateString("nb-NO")}`}
              </div>
              {i.notat && <div style={{ fontSize: 13, marginTop: 6 }}>{i.notat}</div>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ActivityModal({ date, onClose, onSave }) {
  const [form, setForm] = useState({ date, type: "Trening", status: "Gjennomført", duration: 75, spillform: 6, notat: "" });
  return (
    <Modal title="Logg aktivitet" onClose={onClose}>
      <Field label="Dato">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Type">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
          {ACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Status">
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
          {ACT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Varighet (minutter)">
        <input type="number" min={0} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} style={inputStyle} />
      </Field>
      <Field label={`Spillform (1–10): ${form.spillform}`}>
        <input type="range" min={1} max={10} value={form.spillform} onChange={(e) => setForm({ ...form, spillform: Number(e.target.value) })} style={{ width: "100%" }} />
      </Field>
      <Field label="Notat (valgfritt)">
        <textarea rows={3} value={form.notat} onChange={(e) => setForm({ ...form, notat: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Hvordan var økten?" />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <button onClick={onClose} style={btnGhost}>Avbryt</button>
        <button
          onClick={() => onSave({ ...form, spillform: form.status === "Gjennomført" ? form.spillform : null })}
          style={btnPrimary}
        >
          Lagre
        </button>
      </div>
    </Modal>
  );
}

function InjuryModal({ injury, onClose, onSave }) {
  const [form, setForm] = useState(
    injury
      ? { ...injury }
      : {
          body_part: BODY_PARTS[0],
          dato: todayISO(),
          alvorlighetsgrad: "Lett",
          status: "Aktiv",
          forventet_tilbake: "",
          notat: "",
        }
  );
  return (
    <Modal title={injury ? "Rediger skade" : "Meld skade"} onClose={onClose}>
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
        <textarea rows={3} value={form.notat} onChange={(e) => setForm({ ...form, notat: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Hva skjedde, oppfølging osv." />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <button onClick={onClose} style={btnGhost}>Avbryt</button>
        <button onClick={() => onSave(form)} style={btnPrimary}>Lagre</button>
      </div>
    </Modal>
  );
}
