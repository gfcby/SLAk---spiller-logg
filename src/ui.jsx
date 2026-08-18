import React from "react";
import { X } from "lucide-react";

export const COLORS = {
  pitchDark: "#173C2E",
  pitchMid: "#2D6A4F",
  green: "#52B788",
  greenSoft: "#D8F0E3",
  amber: "#E8A33D",
  amberSoft: "#FBEAD1",
  red: "#C4453C",
  redSoft: "#F6DEDC",
  chalk: "#F6F4EE",
  ink: "#182A21",
  gray: "#7A8A80",
  line: "#E1DED2",
};

export const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; }
    .font-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
    .font-body { font-family: 'Inter', sans-serif; }
  `}</style>
);

export const inputStyle = {
  width: "100%",
  border: `1px solid ${COLORS.line}`,
  borderRadius: 9,
  padding: "9px 11px",
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box",
  color: COLORS.ink,
  background: "#FBFAF6",
};

export const btnPrimary = {
  background: COLORS.pitchDark,
  color: "#fff",
  border: "none",
  borderRadius: 9,
  padding: "10px 16px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
};

export const btnGhost = {
  background: "transparent",
  color: COLORS.pitchDark,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 9,
  padding: "10px 16px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
};

export function statusTone(status) {
  if (status === "Gjennomført" || status === "Frisk") return "green";
  if (status === "Planlagt" || status === "Under behandling") return "amber";
  if (status === "Fravær" || status === "Aktiv") return "red";
  return "gray";
}

export const Pill = ({ children, tone = "gray" }) => {
  const tones = {
    green: { bg: COLORS.greenSoft, fg: COLORS.pitchMid },
    amber: { bg: COLORS.amberSoft, fg: "#8A5A16" },
    red: { bg: COLORS.redSoft, fg: COLORS.red },
    gray: { bg: "#EDEBE3", fg: COLORS.gray },
  };
  const t = tones[tone] || tones.gray;
  return (
    <span
      className="font-body"
      style={{
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

export const Card = ({ children, style }) => (
  <div
    className="font-body"
    style={{
      background: "#fff",
      border: `1px solid ${COLORS.line}`,
      borderRadius: 14,
      padding: 18,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      className="font-body"
      style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 6 }}
    >
      {label}
    </label>
    {children}
  </div>
);

export const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(23,60,46,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: 16,
    }}
    onClick={onClose}
  >
    <div
      className="font-body"
      style={{
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 460,
        maxHeight: "88vh",
        overflowY: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <h3 className="font-display" style={{ margin: 0, fontSize: 18, color: COLORS.ink }}>
          {title}
        </h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.gray }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
export function todayISO() {
  return isoDate(new Date());
}
export function addDays(iso, n) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export const BODY_PARTS = [
  "Hode", "Nakke", "Skulder", "Overarm / albue", "Underarm / hånd",
  "Rygg", "Mage / kjerne", "Hofte / lyske", "Lår - forside",
  "Lår - bakside (hamstring)", "Kne", "Legg", "Ankel", "Fot",
];
export const SEVERITY = ["Lett", "Moderat", "Alvorlig"];
export const INJURY_STATUS = ["Aktiv", "Under behandling", "Frisk"];
export const ACT_TYPES = ["Trening", "Kamp"];
export const ACT_STATUS = ["Planlagt", "Gjennomført", "Fravær"];
