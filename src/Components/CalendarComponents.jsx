import { useState } from "react";
import { DAYS, EVENT_COLORS } from "./Constants";

export function SpiralBinding({ accent, pinColor }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: "12px 0 8px",
      background: "#e8e4de",
      borderBottom: "2px solid #d0cbc3",
      position: "relative",
    }}>
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          style={{ width: 24, height: 32, position: "relative", transition: "transform 0.2s ease" }}
        >
          <div style={{
            position: "absolute", top: 0, left: "50%",
            transform: "translateX(-50%)",
            width: 20, height: 20, borderRadius: "50%",
            background: `linear-gradient(135deg, ${pinColor}, ${accent})`,
            boxShadow: `inset 0 -2px 4px rgba(0,0,0,.2), 0 2px 6px rgba(0,0,0,.3)`,
            border: "1px solid rgba(255,255,255,0.3)",
          }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 8, height: 8, borderRadius: "50%",
              background: `radial-gradient(circle, ${pinColor} 0%, ${accent} 100%)`,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,.2)",
            }}/>
          </div>
          <div style={{
            position: "absolute", bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: 4, height: 14,
            background: `linear-gradient(180deg, ${pinColor}, #999)`,
            borderRadius: "0 0 3px 3px",
            boxShadow: "0 1px 2px rgba(0,0,0,.2)",
          }}/>
          <div style={{
            position: "absolute", top: 2, left: "50%",
            transform: "translateX(-50%)",
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.4)",
            filter: "blur(1px)",
          }}/>
        </div>
      ))}
    </div>
  );
}

export function PageCorner({ accent, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onTouchStart={() => setHov(true)}
      onTouchEnd={() => setHov(false)}
      onClick={onClick}
      title="Next month →"
      style={{
        position: "absolute", bottom: 0, right: 0, cursor: "pointer", zIndex: 5,
        width: hov ? 64 : 48, height: hov ? 64 : 48,
        transition: "all .25s ease",
        background: `linear-gradient(225deg, ${accent} 0%, ${accent}cc 55%, transparent 55%)`,
        clipPath: "polygon(100% 0%,100% 100%,0% 100%)",
        display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
        padding: "10px 10px",
      }}
    >
      <span style={{ color: "#fff", fontSize: 16, opacity: hov ? 1 : 0.7, transition: "opacity .2s", fontWeight: "bold" }}>›</span>
    </div>
  );
}

export function MoodStrip({ mood, quote, accent }) {
  return (
    <div style={{
      background: `linear-gradient(90deg,${accent}1a,${accent}06)`,
      borderBottom: `1px solid ${accent}2a`,
      padding: "8px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 6,
    }}>
      <span style={{ fontSize: 12, color: accent, fontWeight: "bold", fontFamily: "monospace", letterSpacing: .5 }}>{mood}</span>
      <span style={{ fontSize: 11, color: "#999", fontStyle: "italic", fontFamily: "Georgia,serif", textAlign: "right" }}>"{quote}"</span>
    </div>
  );
}

export function EventModal({ accent, onClose, onAdd, defaultFrom, defaultTo }) {
  const [tab,     setTab]     = useState("range");
  const [label,   setLabel]   = useState("");
  const [from,    setFrom]    = useState(defaultFrom || "");
  const [to,      setTo]      = useState(defaultTo || "");
  const [weekday, setWeekday] = useState(1);
  const [color,   setColor]   = useState(EVENT_COLORS[0]);
  const [error,   setError]   = useState("");

  const submit = () => {
    setError("");
    if (!label.trim())   { setError("Please enter a label."); return; }
    if (!from || !to)    { setError("Please select both start and end dates."); return; }
    if (from > to)       { setError("Start date cannot be after end date."); return; }
    if (tab === "range") {
      onAdd({ type: "range", label: label.trim(), from, to, color });
    } else {
      onAdd({ type: "repeat", label: label.trim(), from, to, weekday: Number(weekday), color });
    }
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      padding: "16px",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#faf8f5", borderRadius: 10, padding: "20px",
        width: "100%", maxWidth: 340,
        boxShadow: "0 8px 40px rgba(0,0,0,.4)",
        fontFamily: "monospace",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <p style={{ fontSize: 13, fontWeight: "bold", color: accent, marginBottom: 14, letterSpacing: 1 }}>
          New Event
        </p>

        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderRadius: 6, overflow: "hidden", border: `1.5px solid ${accent}44` }}>
          {["range", "repeat"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 0", fontSize: 11, cursor: "pointer", border: "none",
              background: tab === t ? accent : "transparent",
              color: tab === t ? "#fff" : "#888",
              fontFamily: "monospace", letterSpacing: 1, fontWeight: "bold",
              transition: "background .15s",
              minHeight: "44px",
            }}>
              {t === "range" ? "Date Range" : "Repeat Weekly"}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 3, letterSpacing: 1, textTransform: "uppercase" }}>Label</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder={tab === "range" ? "e.g. Goa Trip" : "e.g. Weekly Standup"}
          style={{
            width: "100%", border: `1.5px solid ${accent}44`, borderRadius: 4,
            padding: "10px", fontFamily: "Georgia,serif", fontSize: 14,
            background: "#fff", marginBottom: 10, boxSizing: "border-box",
            minHeight: "44px",
          }}
        />

        {tab === "repeat" && (
          <>
            <label style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 3, letterSpacing: 1, textTransform: "uppercase" }}>Repeat every</label>
            <select value={weekday} onChange={e => setWeekday(e.target.value)} style={{
              width: "100%", border: `1.5px solid ${accent}44`, borderRadius: 4,
              padding: "10px", fontFamily: "monospace", fontSize: 13,
              background: "#fff", marginBottom: 10, boxSizing: "border-box",
              minHeight: "44px",
            }}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 3, letterSpacing: 1, textTransform: "uppercase" }}>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{
              width: "100%", border: `1.5px solid ${accent}44`, borderRadius: 4,
              padding: "10px", fontFamily: "monospace", fontSize: 13,
              background: "#fff", boxSizing: "border-box",
              minHeight: "44px",
            }}/>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 3, letterSpacing: 1, textTransform: "uppercase" }}>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{
              width: "100%", border: `1.5px solid ${accent}44`, borderRadius: 4,
              padding: "10px", fontFamily: "monospace", fontSize: 13,
              background: "#fff", boxSizing: "border-box",
              minHeight: "44px",
            }}/>
          </div>
        </div>

        <label style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Color</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {EVENT_COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{
              width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer",
              border: color === c ? "3px solid #333" : "3px solid transparent",
              transition: "border .1s",
              flexShrink: 0,
            }}/>
          ))}
        </div>

        {error && (
          <div style={{
            background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 4,
            padding: "10px", marginBottom: 10,
            fontSize: 11, color: "#dc2626", fontFamily: "monospace",
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #ddd", borderRadius: 4,
            padding: "10px 16px", fontSize: 12, cursor: "pointer",
            color: "#aaa", fontFamily: "monospace",
            minHeight: "44px",
          }}>Cancel</button>
          <button onClick={submit} style={{
            background: accent, color: "#fff", border: "none", borderRadius: 4,
            padding: "10px 20px", fontSize: 12, cursor: "pointer",
            fontFamily: "monospace", fontWeight: "bold",
            minHeight: "44px",
          }}>Add ✓</button>
        </div>
      </div>
    </div>
  );
}