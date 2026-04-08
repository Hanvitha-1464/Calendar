import { useState, useEffect, useRef, useCallback } from "react";
import {
  MONTH_THEMES, HOLIDAYS, DAYS,
  LS_NOTES, LS_EVENTS, LS_CROSSED,
  getDaysInMonth, getFirstDay, pad, toKey, holKey, keyToDate,
} from "./constants";
import { SpiralBinding, PageCorner, MoodStrip, EventModal } from "./CalendarComponents";

export default function WallCalendar() {
  const today    = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [year,         setYear]         = useState(today.getFullYear());
  const [month,        setMonth]        = useState(today.getMonth());
  const [hovered,      setHovered]      = useState(null);
  const [notes,        setNotes]        = useState(() => {
    try { const s = localStorage.getItem(LS_NOTES);   return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [events,       setEvents]       = useState(() => {
    try { const s = localStorage.getItem(LS_EVENTS);  return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [crossedDates, setCrossedDates] = useState(() => {
    try { const s = localStorage.getItem(LS_CROSSED); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [activeNote,   setActiveNote]   = useState(null);
  const [noteInput,    setNoteInput]    = useState("");
  const [animating,    setAnimating]    = useState(false);
  const [flipDir,      setFlipDir]      = useState(1);
  const [imgLoaded,    setImgLoaded]    = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const noteRef = useRef(null);

  const theme  = MONTH_THEMES[month];
  const accent = theme.accent;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { try { localStorage.setItem(LS_NOTES,   JSON.stringify(notes));        } catch {} }, [notes]);
  useEffect(() => { try { localStorage.setItem(LS_EVENTS,  JSON.stringify(events));       } catch {} }, [events]);
  useEffect(() => { try { localStorage.setItem(LS_CROSSED, JSON.stringify(crossedDates)); } catch {} }, [crossedDates]);

  useEffect(() => {
    setImgLoaded(false);
    const img = new Image();
    img.src = theme.img;
    img.onload = () => setImgLoaded(true);
  }, [month, theme.img]);

  const navigate = useCallback((dir) => {
    if (animating) return;
    setFlipDir(dir);
    setAnimating(true);
    setImgLoaded(false);
    setTimeout(() => {
      setMonth(prev => {
        const next = prev + dir;
        if (next < 0)  { setYear(y => y - 1); return 11; }
        if (next > 11) { setYear(y => y + 1); return 0;  }
        return next;
      });
      setActiveNote(null);
      setNoteInput("");
      setSelectedDate(null);
    }, 220);
    setTimeout(() => setAnimating(false), 440);
  }, [animating]);

  const getEventDots = (key) => events.filter(ev => {
    const lo = ev.from <= ev.to ? ev.from : ev.to;
    const hi = ev.from <= ev.to ? ev.to   : ev.from;
    if (key < lo || key > hi) return false;
    if (ev.type === "repeat") return keyToDate(key).getDay() === ev.weekday;
    return true;
  });

  const handleDayClick = (day) => {
    const key = toKey(year, month, day);
    setSelectedDate(key);
    setActiveNote(key);
    setNoteInput(notes[key] || "");
  };

  const handleCalendarClick = (e) => {
    const isBlank =
      e.target.classList.contains("cal-grid") ||
      e.target.classList.contains("calendar-bg") ||
      e.target.classList.contains("days-grid");
    if (isBlank) {
      setSelectedDate(null);
      setActiveNote(null);
      setNoteInput("");
    }
  };

  const handleCrossSelectedDate = () => {
    if (!selectedDate) return;
    setCrossedDates(prev => ({ ...prev, [selectedDate]: !prev[selectedDate] }));
  };

  const isSelectedCrossed = selectedDate ? !!crossedDates[selectedDate] : false;

  const saveNote = () => {
    if (!activeNote) return;
    setNotes(p => ({ ...p, [activeNote]: noteInput }));
    setActiveNote(null);
    setNoteInput("");
  };

  const deleteNote = (k) => {
    setNotes(p => { const n = { ...p }; delete n[k]; return n; });
    if (activeNote === k) { setActiveNote(null); setNoteInput(""); }
  };

  const deleteEvent = (idx) => setEvents(prev => prev.filter((_, i) => i !== idx));
  const addEvent    = (ev)  => setEvents(prev => [...prev, ev]);

  useEffect(() => { if (noteRef.current && activeNote) noteRef.current.focus(); }, [activeNote]);

  const totalDays = getDaysInMonth(year, month);
  const firstDay  = getFirstDay(year, month);

  const getDayState = (day) => {
    const key    = toKey(year, month, day);
    const colIdx = (firstDay + day - 1) % 7;
    return {
      key,
      isToday:    key === todayKey,
      isWeekend:  colIdx === 0 || colIdx === 6,
      hasNote:    !!notes[key],
      isCrossed:  !!crossedDates[key],
      isSelected: key === selectedDate,
      holiday:    HOLIDAYS[holKey(month, day)] || null,
      evDots:     getEventDots(key),
    };
  };

  const monthPrefix   = `${year}-${pad(month + 1)}`;
  const noteEntries   = Object.entries(notes).filter(([k, v]) => k.startsWith(monthPrefix) && v?.trim());
  const monthHols     = Object.entries(HOLIDAYS)
    .filter(([k]) => parseInt(k.split("-")[0], 10) === month + 1)
    .map(([k, v]) => ({ day: parseInt(k.split("-")[1], 10), label: v }));
  const visibleEvents = events.filter(ev => {
    const lo = ev.from <= ev.to ? ev.from : ev.to;
    const hi = ev.from <= ev.to ? ev.to   : ev.from;
    return lo.startsWith(monthPrefix) || hi.startsWith(monthPrefix) ||
           (lo < monthPrefix && hi > monthPrefix);
  });

  const flipAnim = animating
    ? { animation: `calFlip${flipDir > 0 ? "Fwd" : "Bck"} .44s ease both` }
    : {};

  return (
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "8px 0",
      fontFamily: "'Georgia','Times New Roman',serif",
    }}>
      <style>{`
        @keyframes calFlipFwd {
          0%  { opacity:1; transform:perspective(900px) rotateY(0deg); }
          50% { opacity:0; transform:perspective(900px) rotateY(-14deg) scaleX(.95); }
          100%{ opacity:1; transform:perspective(900px) rotateY(0deg); }
        }
        @keyframes calFlipBck {
          0%  { opacity:1; transform:perspective(900px) rotateY(0deg); }
          50% { opacity:0; transform:perspective(900px) rotateY(14deg) scaleX(.95); }
          100%{ opacity:1; transform:perspective(900px) rotateY(0deg); }
        }
        .day-cell:hover { transform:scale(1.12) !important; z-index:2; }
        .note-item:hover { background:#f0ede8 !important; }
        .nav-btn:hover { background:rgba(0,0,0,.07) !important; }
        .save-btn:hover { filter:brightness(1.1); }
        textarea:focus { outline:none !important; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { border-radius:2px; }
        .crossed-mark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px; font-weight: bold;
          color: #e74c3c; pointer-events: none;
          z-index: 2; text-shadow: 0 0 2px white;
        }
        @media (max-width:639px) {
          .cal-body  { flex-direction:column !important; }
          .cal-notes { width:100% !important; border-left:none !important; border-top:1px solid #e0dbd4 !important; max-height:none !important; }
          .cal-hero  { height:130px !important; }
          .cal-grid  { padding:10px !important; }
        }
      `}</style>

      {showModal && (
        <EventModal
          accent={accent}
          defaultFrom={toKey(year, month, 1)}
          defaultTo={toKey(year, month, totalDays)}
          onClose={() => setShowModal(false)}
          onAdd={addEvent}
        />
      )}

      <div style={{ width: "100%", maxWidth: 760, ...flipAnim, transformOrigin: "top center" }}>
        <div style={{
          background: "#faf8f5",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 30px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05)",
          overflow: "hidden",
        }}>
          <SpiralBinding accent={accent} pinColor={theme.pin} />

          {/* ── Hero image ── */}
          <div className="cal-hero" style={{ position: "relative", height: 175, overflow: "hidden", background: "#111" }}>
            <img
              src={theme.img} alt={theme.label}
              onLoad={() => setImgLoaded(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transition: "opacity .5s ease", opacity: imgLoaded ? 1 : 0,
                filter: "brightness(.9) saturate(1.1)",
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 45%,rgba(0,0,0,.5) 100%)" }}/>
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              background: accent, color: "#fff",
              padding: "12px 26px 12px 34px",
              clipPath: "polygon(10% 0%,100% 0%,100% 100%,0% 100%)",
              textAlign: "right",
            }}>
              <p style={{ fontSize: 11, opacity: .8, letterSpacing: 3, fontFamily: "monospace", margin: "0 0 2px" }}>{year}</p>
              <p style={{ fontSize: 19, fontWeight: "bold", letterSpacing: 3, margin: 0, lineHeight: 1 }}>{theme.label.toUpperCase()}</p>
            </div>
            <PageCorner accent={accent} onClick={() => navigate(1)} />
          </div>

          <MoodStrip mood={theme.mood} quote={theme.quote} accent={accent} />

          {/* ── Month nav bar ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px", background: "#f0ede8", borderBottom: "1px solid #e0dbd4",
          }}>
            <button className="nav-btn" onClick={() => navigate(-1)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 22, color: "#555", padding: "2px 14px", borderRadius: 4,
            }}>‹</button>
            <div style={{ fontFamily: "monospace", fontSize: 14, color: "#333", letterSpacing: 3, fontWeight: "bold" }}>
              {theme.label.toUpperCase()} {year}
            </div>
            <button className="nav-btn" onClick={() => navigate(1)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 22, color: "#555", padding: "2px 14px", borderRadius: 4,
            }}>›</button>
          </div>

          {/* ── Body: grid + sidebar ── */}
          <div className="cal-body" style={{ display: "flex", flexDirection: "row" }} onClick={handleCalendarClick}>

            {/* ── Calendar grid ── */}
            <div className="cal-grid calendar-bg" style={{ flex: 1, padding: "10px 14px 14px", minWidth: 0 }}>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
                {DAYS.map(d => (
                  <div key={d} style={{
                    textAlign: "center", fontSize: 10, fontWeight: "bold",
                    letterSpacing: 1, padding: "3px 0", fontFamily: "monospace",
                    color: (d === "Sun" || d === "Sat") ? accent : "#aaa",
                  }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="days-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
                  const { key, isToday, isWeekend, hasNote, isCrossed, isSelected, holiday, evDots } = getDayState(day);
                  return (
                    <div
                      key={day}
                      className="day-cell"
                      onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      title={holiday || undefined}
                      style={{
                        position: "relative", aspectRatio: "1",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        borderRadius: 4,
                        background: isSelected ? `${accent}33` : (isToday ? `${accent}14` : "transparent"),
                        border: isSelected ? `2px solid ${accent}` : (isToday ? `1.5px solid ${accent}66` : "1.5px solid transparent"),
                        color: isWeekend ? accent : "#333",
                        cursor: "pointer",
                        fontSize: isMobile ? 11 : 13,
                        fontWeight: isToday ? "bold" : "normal",
                        transition: "transform .12s ease, background .12s ease",
                        userSelect: "none",
                        opacity: isCrossed ? 0.5 : 1,
                      }}
                    >
                      {day}
                      {isCrossed && <div className="crossed-mark">✕</div>}

                      {/* Dots row: events + note + holiday */}
                      <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap", justifyContent: "center", minHeight: 7 }}>
                        {evDots.slice(0, 3).map((ev, i) => (
                          <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: ev.color, display: "inline-block", flexShrink: 0 }} />
                        ))}
                        {hasNote && (
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#333", display: "inline-block", flexShrink: 0 }} />
                        )}
                        {holiday && (
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e74c3c", display: "inline-block", flexShrink: 0 }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => setShowModal(true)} style={{
                  fontSize: 10, fontFamily: "monospace",
                  background: "none", border: `1px dashed ${accent}66`,
                  borderRadius: 4, padding: "4px 12px", cursor: "pointer",
                  color: accent, transition: "background .15s",
                }}>+ New event</button>

                <button
                  onClick={handleCrossSelectedDate}
                  disabled={!selectedDate}
                  style={{
                    fontSize: 10, fontFamily: "monospace",
                    background: selectedDate ? (isSelectedCrossed ? "#27ae60" : "#e74c3c") : "#ccc",
                    border: "none", borderRadius: 4, padding: "4px 12px",
                    cursor: selectedDate ? "pointer" : "not-allowed",
                    color: "white", transition: "background .15s",
                  }}
                >
                  {selectedDate
                    ? (isSelectedCrossed
                        ? `✓ Uncross (${selectedDate.split('-').slice(1).join('-')})`
                        : `✕ Cross (${selectedDate.split('-').slice(1).join('-')})`)
                    : "✕ Cross date"}
                </button>
              </div>
            </div>

            {/* ── Sidebar: notes + events + holidays ── */}
            <div className="cal-notes" style={{
              width: 190, background: "#f7f4ef",
              borderLeft: "1px solid #e0dbd4",
              padding: "12px 10px",
              display: "flex", flexDirection: "column", gap: 8,
              maxHeight: 500, overflowY: "auto",
            }}>
              <p style={{ fontSize: 9, fontWeight: "bold", letterSpacing: 3, margin: "0 0 2px", color: "#bbb", fontFamily: "monospace", textTransform: "uppercase" }}>
                Notes
              </p>

              {activeNote ? (
                <>
                  <span style={{ fontSize: 10, color: accent, fontFamily: "monospace", fontWeight: "bold" }}>{activeNote}</span>
                  <textarea
                    ref={noteRef}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Jot something down…"
                    rows={4}
                    style={{
                      width: "100%", resize: "vertical",
                      border: `1.5px solid ${accent}44`, borderRadius: 4,
                      padding: "7px 8px", fontFamily: "Georgia,serif", fontSize: 12,
                      color: "#333", background: "#fff", lineHeight: 1.65, boxSizing: "border-box",
                    }}
                    onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22`; }}
                    onBlur={e  => { e.target.style.borderColor = `${accent}44`; e.target.style.boxShadow = "none"; }}
                  />
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button onClick={() => deleteNote(activeNote)} style={{
                      background: "none", border: "1px solid #ddd", borderRadius: 4,
                      padding: "4px 10px", fontSize: 11, cursor: "pointer",
                      color: "#aaa", fontFamily: "monospace",
                    }}>Delete</button>
                    <button className="save-btn" onClick={saveNote} style={{
                      background: accent, color: "#fff", border: "none", borderRadius: 4,
                      padding: "4px 14px", fontSize: 11, cursor: "pointer",
                      fontFamily: "monospace", letterSpacing: .5, fontWeight: "bold",
                    }}>Save ✓</button>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: "#ccc", fontFamily: "Georgia,serif", lineHeight: 1.7, margin: 0 }}>
                  Tap a date to write a note.
                </p>
              )}

              {noteEntries.length > 0 && (
                <>
                  <div style={{ height: 1, background: `${accent}1e`, margin: "2px 0" }} />
                  <p style={{ fontSize: 9, letterSpacing: 2, color: "#ccc", fontFamily: "monospace", margin: 0, textTransform: "uppercase" }}>
                    Saved ({noteEntries.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {noteEntries.sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => (
                      <div
                        key={k} className="note-item"
                        onClick={() => { setActiveNote(k); setNoteInput(v); setSelectedDate(k); }}
                        style={{
                          background: "#fff", borderLeft: `3px solid ${accent}`,
                          padding: "5px 20px 5px 8px", borderRadius: "0 4px 4px 0",
                          cursor: "pointer", transition: "background .15s", position: "relative",
                        }}
                      >
                        <div style={{ fontSize: 9, color: accent, fontFamily: "monospace", fontWeight: "bold", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 11, color: "#555", fontFamily: "Georgia,serif", lineHeight: 1.4 }}>
                          {v.slice(0, 55)}{v.length > 55 ? "…" : ""}
                        </div>
                        <span
                          onClick={e => { e.stopPropagation(); deleteNote(k); }}
                          style={{ position: "absolute", top: 4, right: 6, fontSize: 10, color: "#000", cursor: "pointer", lineHeight: 1 }}
                        >✕</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {visibleEvents.length > 0 && (
                <>
                  <div style={{ height: 1, background: `${accent}1e`, margin: "2px 0" }} />
                  <p style={{ fontSize: 9, letterSpacing: 2, color: "#ccc", fontFamily: "monospace", margin: 0, textTransform: "uppercase" }}>
                    Events
                  </p>
                  {visibleEvents.map((ev, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6, position: "relative", paddingRight: 16 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: "bold", color: ev.color, fontFamily: "monospace" }}>{ev.label}</div>
                        <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace", marginTop: 1 }}>
                          {ev.from} → {ev.to}
                          {ev.type === "repeat" && ` · every ${DAYS[ev.weekday]}`}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(idx)}
                        style={{
                          position: "absolute", top: 0, right: 0,
                          fontSize: 11, color: "#000", cursor: "pointer",
                          background: "none", border: "none", fontWeight: "bold",
                          opacity: 0.5, transition: "opacity 0.2s",
                        }}
                        onMouseEnter={e => e.target.style.opacity = 1}
                        onMouseLeave={e => e.target.style.opacity = 0.5}
                      >✕</button>
                    </div>
                  ))}
                </>
              )}

              {monthHols.length > 0 && (
                <>
                  <div style={{ height: 1, background: `${accent}1e`, margin: "2px 0" }} />
                  <p style={{ fontSize: 9, letterSpacing: 2, color: "#ccc", fontFamily: "monospace", margin: 0, textTransform: "uppercase" }}>
                    Holidays
                  </p>
                  {monthHols.map(({ day, label }) => (
                    <div key={day} style={{ fontSize: 10, color: "#777", fontFamily: "monospace", display: "flex", gap: 6 }}>
                      <span style={{ color: accent, fontWeight: "bold", minWidth: 18 }}>{day}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}