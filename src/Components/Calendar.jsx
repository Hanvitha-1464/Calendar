import { useState, useEffect, useRef, useCallback } from "react";

// ─── Month themes ──────────────────────────────────────────────────────────────
const MONTH_THEMES = [
  { img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=85", accent: "#3b82f6",  label: "January",   mood: "❄️ Deep Winter",     quote: "New beginnings await." },
  { img: "https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?w=900&q=85", accent: "#ec4899",  label: "February",  mood: "💕 Valentine's Air",  quote: "Love is in every detail." },
  { img: "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=85", accent: "#22c55e",  label: "March",     mood: "🌱 First Bloom",      quote: "Everything is waking up." },
  { img: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=900&q=85", accent: "#f59e0b",  label: "April",     mood: "🌸 Cherry Season",    quote: "Bloom where you are planted." },
  { img: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=85", accent: "#10b981",  label: "May",       mood: "🌿 Full Green",       quote: "Let life flourish." },
  { img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85", accent: "#06b6d4",  label: "June",      mood: "☀️ Golden Hours",     quote: "Savour every long day." },
  { img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=85", accent: "#f97316",  label: "July",      mood: "🔥 Peak Summer",      quote: "Chase the horizon." },
  { img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=85", accent: "#8b5cf6",  label: "August",    mood: "🌅 Late Warmth",      quote: "Hold summer a little longer." },
  { img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=900&q=85", accent: "#ef4444",  label: "September", mood: "🍂 First Fall",       quote: "Change is beautiful." },
  { img: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=85", accent: "#d97706",  label: "October",   mood: "🎃 Harvest Moon",     quote: "Magic lives in the mundane." },
  { img: "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=900&q=85", accent: "#6366f1",  label: "November",  mood: "🍁 Golden Decay",     quote: "Gratitude transforms everything." },
  { img: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=900&q=85", accent: "#14b8a6",  label: "December",  mood: "🎄 Winter Warmth",    quote: "Cherish every gathering." },
];

// ─── Public holidays ───────────────────────────────────────────────────────────
const HOLIDAYS = {
  "01-01": "🎆 New Year's Day",
  "02-14": "💝 Valentine's Day",
  "03-17": "🍀 St. Patrick's Day",
  "04-22": "🌍 Earth Day",
  "05-05": "🌮 Cinco de Mayo",
  "06-19": "✊ Juneteenth",
  "07-04": "🇺🇸 Independence Day",
  "08-26": "🌻 Women's Equality Day",
  "09-02": "👷 Labor Day",
  "10-31": "🎃 Halloween",
  "11-11": "🎖️ Veterans Day",
  "11-28": "🦃 Thanksgiving",
  "12-25": "🎄 Christmas",
  "12-31": "🥂 New Year's Eve",
};

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LS_KEY = "wall_calendar_notes_v2";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDay    = (y, m) => new Date(y, m, 1).getDay();
const toKey          = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const holKey         = (m, d)    => `${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const isBetween      = (date, a, b) => {
  if (!a || !b) return false;
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return date > lo && date < hi;
};

// ─── Spiral binding ────────────────────────────────────────────────────────────
function Spiral({ accent }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", gap:8, padding:"10px 0 3px", background:"#e8e4de" }}>
      {Array.from({length:20}).map((_,i) => (
        <div key={i} style={{
          width:11, height:18, borderRadius:"50% 50% 40% 40%",
          border:`2px solid ${accent}88`,
          background:"linear-gradient(180deg,#ccc 0%,#999 100%)",
          boxShadow:"0 2px 4px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.4)",
          position:"relative",
        }}>
          <div style={{
            position:"absolute", bottom:-4, left:"50%", transform:"translateX(-50%)",
            width:2, height:6, background:`${accent}55`, borderRadius:1,
          }}/>
        </div>
      ))}
    </div>
  );
}

// ─── Page-turn corner ──────────────────────────────────────────────────────────
function PageCorner({ accent, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      title="Next month →"
      style={{
        position:"absolute", bottom:0, right:0, cursor:"pointer", zIndex:5,
        width: hov ? 64 : 38, height: hov ? 64 : 38,
        transition:"all .25s ease",
        background:`linear-gradient(225deg, ${accent} 0%, ${accent}cc 55%, transparent 55%)`,
        clipPath:"polygon(100% 0%,100% 100%,0% 100%)",
        display:"flex", alignItems:"flex-end", justifyContent:"flex-end",
        padding:"7px 7px",
      }}
    >
      <span style={{ color:"#fff", fontSize:12, opacity: hov ? 1 : 0, transition:"opacity .2s", fontWeight:"bold" }}>›</span>
    </div>
  );
}

// ─── Mood strip ────────────────────────────────────────────────────────────────
function MoodStrip({ mood, quote, accent }) {
  return (
    <div style={{
      background:`linear-gradient(90deg,${accent}1a,${accent}06)`,
      borderBottom:`1px solid ${accent}2a`,
      padding:"7px 20px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      flexWrap:"wrap", gap:6,
    }}>
      <span style={{ fontSize:12, color:accent, fontWeight:"bold", fontFamily:"monospace", letterSpacing:.5 }}>{mood}</span>
      <span style={{ fontSize:11, color:"#999", fontStyle:"italic", fontFamily:"Georgia,serif" }}>"{quote}"</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const today = new Date();
  const [year,       setYear]       = useState(today.getFullYear());
  const [month,      setMonth]      = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);
  const [hovered,    setHovered]    = useState(null);
  const [notes,      setNotes]      = useState(() => {
    try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [activeNote, setActiveNote] = useState(null);
  const [noteInput,  setNoteInput]  = useState("");
  const [animating,  setAnimating]  = useState(false);
  const [flipDir,    setFlipDir]    = useState(1);
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const noteRef = useRef(null);

  const theme     = MONTH_THEMES[month];
  const accent    = theme.accent;
  const totalDays = getDaysInMonth(year, month);
  const firstDay  = getFirstDay(year, month);

  // ── Responsive ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── localStorage save ───────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  // ── Image preload ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setImgLoaded(false);
    const img = new Image();
    img.src = theme.img;
    img.onload = () => setImgLoaded(true);
  }, [month, theme.img]);

  // ── Navigate ──────────────────────────────────────────────────────────────────
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
      setRangeStart(null); setRangeEnd(null);
      setActiveNote(null); setNoteInput("");
    }, 220);
    setTimeout(() => setAnimating(false), 440);
  }, [animating]);

  // ── Day click ────────────────────────────────────────────────────────────────
  const handleDayClick = (day) => {
    const key = toKey(year, month, day);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(key); setRangeEnd(null);
      setActiveNote(key); setNoteInput(notes[key] || "");
    } else {
      if (key < rangeStart) { setRangeEnd(rangeStart); setRangeStart(key); }
      else setRangeEnd(key);
      setActiveNote(key); setNoteInput(notes[key] || "");
    }
  };

  const saveNote   = () => {
    if (!activeNote) return;
    setNotes(p => ({...p, [activeNote]: noteInput}));
    setActiveNote(null);
    setNoteInput("");
  };
  const deleteNote = (k) => {
    setNotes(p => { const n={...p}; delete n[k]; return n; });
    if (activeNote === k) { setActiveNote(null); setNoteInput(""); }
  };
  const clearRange = () => { setRangeStart(null); setRangeEnd(null); setActiveNote(null); setNoteInput(""); };

  useEffect(() => { if (noteRef.current && activeNote) noteRef.current.focus(); }, [activeNote]);

  // ── Day state ─────────────────────────────────────────────────────────────────
  const getDayState = (day) => {
    const key    = toKey(year, month, day);
    const todayK = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    const hovK   = hovered ? toKey(year, month, hovered) : null;
    const colIdx = (firstDay + day - 1) % 7;
    return {
      key,
      isToday:   key === todayK,
      isStart:   key === rangeStart,
      isEnd:     key === rangeEnd,
      inRange:   rangeStart && !rangeEnd && hovK
                   ? isBetween(key, rangeStart, hovK)
                   : isBetween(key, rangeStart, rangeEnd),
      isWeekend: colIdx === 0 || colIdx === 6,
      hasNote:   !!notes[key],
      holiday:   HOLIDAYS[holKey(month, day)] || null,
    };
  };

  // ── Range stats ───────────────────────────────────────────────────────────────
  const [lo, hi] = rangeStart && rangeEnd
    ? (rangeStart <= rangeEnd ? [rangeStart, rangeEnd] : [rangeEnd, rangeStart])
    : [rangeStart, null];
  const nights = lo && hi ? Math.round((new Date(hi)-new Date(lo))/86400000) : null;

  const monthPrefix = `${year}-${String(month+1).padStart(2,"0")}`;
  const noteEntries = Object.entries(notes).filter(([k,v])=> k.startsWith(monthPrefix) && v?.trim());

  // ── Month's holidays list ─────────────────────────────────────────────────────
  const monthHols = Object.entries(HOLIDAYS)
    .filter(([k]) => parseInt(k.split("-")[0],10) === month+1)
    .map(([k,v]) => ({ day: parseInt(k.split("-")[1],10), label:v }));

  const flipAnim = animating
    ? { animation: `calFlip${flipDir>0?"Fwd":"Bck"} .44s ease both` }
    : {};

  return (
    <div style={{
      minHeight:"100vh",
      background:"transparent",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"8px 0",
      fontFamily:"'Georgia','Times New Roman',serif",
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
        @media (max-width:639px) {
          .cal-body      { flex-direction:column !important; }
          .cal-notes     { width:100% !important; border-left:none !important; border-top:1px solid #e0dbd4 !important; max-height:none !important; }
          .cal-hero      { height:140px !important; }
          .cal-grid      { padding:10px !important; }
        }
      `}</style>

      <div style={{ width:"100%", maxWidth:720, ...flipAnim }}>


        <div style={{
          background:"#faf8f5",
          borderRadius:"0 0 4px 4px",
          boxShadow:"0 30px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05)",
          overflow:"hidden",
        }}>
          <Spiral accent={accent}/>

          {/* Hero */}
          <div className="cal-hero" style={{ position:"relative", height:180, overflow:"hidden", background:"#111" }}>
            <img
              src={theme.img}
              alt={theme.label}
              onLoad={() => setImgLoaded(true)}
              style={{
                width:"100%", height:"100%", objectFit:"cover", display:"block",
                transition:"opacity .5s ease",
                opacity: imgLoaded ? 1 : 0,
                filter:"brightness(.9) saturate(1.1)",
              }}
            />
            <div style={{
              position:"absolute", inset:0,
              background:"linear-gradient(to bottom,transparent 45%,rgba(0,0,0,.5) 100%)",
            }}/>
            <div style={{
              position:"absolute", bottom:0, right:0,
              background:accent, color:"#fff",
              padding:"12px 26px 12px 34px",
              clipPath:"polygon(10% 0%,100% 0%,100% 100%,0% 100%)",
              textAlign:"right",
            }}>
              <p style={{ fontSize:12, opacity:.8, letterSpacing:3, fontFamily:"monospace", margin:"0 0 2px" }}>{year}</p>
              <p style={{ fontSize:20, fontWeight:"bold", letterSpacing:3, margin:0, lineHeight:1 }}>{theme.label.toUpperCase()}</p>
            </div>
            <PageCorner accent={accent} onClick={() => navigate(1)}/>
          </div>

          <MoodStrip mood={theme.mood} quote={theme.quote} accent={accent}/>

          {/* Nav */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"8px 16px", background:"#f0ede8", borderBottom:"1px solid #e0dbd4",
          }}>
            <button className="nav-btn" onClick={() => navigate(-1)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontSize:22, color:"#555", padding:"2px 14px", borderRadius:4,
            }}>‹</button>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"monospace", fontSize:14, color:"#333", letterSpacing:3, fontWeight:"bold" }}>
                {theme.label.toUpperCase()} {year}
              </div>
              {nights !== null && (
                <div style={{ fontSize:10, color:accent, fontFamily:"monospace", marginTop:2 }}>
                  {lo} → {hi} · {nights} night{nights!==1?"s":""}
                  <span onClick={clearRange} style={{ marginLeft:6, cursor:"pointer", opacity:.5 }}>✕</span>
                </div>
              )}
            </div>
            <button className="nav-btn" onClick={() => navigate(1)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontSize:22, color:"#555", padding:"2px 14px", borderRadius:4,
            }}>›</button>
          </div>

          {/* Body */}
          <div className="cal-body" style={{ display:"flex", flexDirection:"row" }}>

            {/* Grid */}
            <div className="cal-grid" style={{ flex:1, padding:"10px 14px 14px", minWidth:0 }}>
              {/* Day headers */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
                {DAYS.map(d => (
                  <div key={d} style={{
                    textAlign:"center", fontSize:10, fontWeight:"bold",
                    letterSpacing:1, padding:"3px 0", fontFamily:"monospace",
                    color:(d==="Sun"||d==="Sat") ? accent : "#aaa",
                  }}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
                {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`}/>)}
                {Array.from({length:totalDays},(_,i)=>i+1).map(day => {
                  const { key, isToday, isStart, isEnd, inRange, isWeekend, hasNote, holiday } = getDayState(day);
                  const sel = isStart || isEnd;
                  return (
                    <div
                      key={day}
                      className="day-cell"
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      title={holiday || undefined}
                      style={{
                        position:"relative",
                        aspectRatio:"1",
                        display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center",
                        borderRadius: sel ? "50%" : inRange ? 2 : 4,
                        background: sel ? accent : inRange ? `${accent}1c` : isToday ? `${accent}14` : "transparent",
                        border: isToday && !sel ? `1.5px solid ${accent}66` : "1.5px solid transparent",
                        color: sel ? "#fff" : isWeekend ? accent : "#333",
                        cursor:"pointer",
                        fontSize: isMobile ? 11 : 13,
                        fontWeight: sel || isToday ? "bold" : "normal",
                        transition:"transform .12s ease, background .12s ease",
                        userSelect:"none",
                      }}
                    >
                      {day}
                      {hasNote && (
                        <span style={{
                          width:3, height:3, borderRadius:"50%",
                          background: sel ? "#ffffffcc" : accent,
                          marginTop:1,
                        }}/>
                      )}
                      {holiday && !hasNote && (
                        <span style={{ fontSize:6, lineHeight:1, marginTop:1, opacity:.8 }}>
                          {holiday.slice(0,2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Range bar */}
              {rangeStart && (
                <div style={{
                  marginTop:12, padding:"7px 12px",
                  background:`${accent}0d`, borderRadius:4,
                  border:`1px dashed ${accent}44`,
                  fontSize:11, fontFamily:"monospace", color:"#888",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  <span>📅 {rangeStart}{rangeEnd ? ` → ${rangeEnd}` : " · pick end date"}</span>
                  <span onClick={clearRange} style={{ cursor:"pointer", color:accent }}>✕</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="cal-notes" style={{
              width:180, background:"#f7f4ef",
              borderLeft:"1px solid #e0dbd4",
              padding:"12px 10px",
              display:"flex", flexDirection:"column", gap:8,
              maxHeight:480, overflowY:"auto",
            }}>
              <p style={{
                fontSize:9, fontWeight:"bold", letterSpacing:3, margin:"0 0 2px",
                color:"#bbb", fontFamily:"monospace", textTransform:"uppercase",
              }}>Notes</p>

              {activeNote ? (
                <>
                  <span style={{ fontSize:10, color:accent, fontFamily:"monospace", fontWeight:"bold" }}>{activeNote}</span>
                  <textarea
                    ref={noteRef}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Jot something down…"
                    rows={4}
                    style={{
                      width:"100%", resize:"vertical",
                      border:`1.5px solid ${accent}44`, borderRadius:4,
                      padding:"7px 8px",
                      fontFamily:"Georgia,serif", fontSize:12, color:"#333",
                      background:"#fff", lineHeight:1.65, boxSizing:"border-box",
                      transition:"border .2s, box-shadow .2s",
                      boxShadow: `0 0 0 0px ${accent}22`,
                    }}
                    onFocus={e => { e.target.style.borderColor=accent; e.target.style.boxShadow=`0 0 0 3px ${accent}22`; }}
                    onBlur={e  => { e.target.style.borderColor=`${accent}44`; e.target.style.boxShadow="none"; }}
                  />
                  <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                    <button onClick={() => deleteNote(activeNote)} style={{
                      background:"none", border:"1px solid #ddd", borderRadius:4,
                      padding:"4px 10px", fontSize:11, cursor:"pointer",
                      color:"#aaa", fontFamily:"monospace",
                    }}>Delete</button>
                    <button className="save-btn" onClick={saveNote} style={{
                      background:accent, color:"#fff", border:"none", borderRadius:4,
                      padding:"4px 14px", fontSize:11, cursor:"pointer",
                      fontFamily:"monospace", letterSpacing:.5, fontWeight:"bold",
                      transition:"filter .15s",
                    }}>Save ✓</button>
                  </div>
                </>
              ) : (
                <p style={{ fontSize:12, color:"#ccc", fontFamily:"Georgia,serif", lineHeight:1.7, margin:0 }}>
                  Tap a date to write a note. 💾 Auto-saved in your browser.
                </p>
              )}

              {/* Saved notes */}
              {noteEntries.length > 0 && (
                <>
                  <div style={{ height:1, background:`${accent}1e`, margin:"2px 0" }}/>
                  <p style={{ fontSize:9, letterSpacing:2, color:"#ccc", fontFamily:"monospace", margin:0, textTransform:"uppercase" }}>
                    Saved ({noteEntries.length})
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    {noteEntries.sort(([a],[b])=>a.localeCompare(b)).map(([k,v]) => (
                      <div
                        key={k}
                        className="note-item"
                        onClick={() => { setActiveNote(k); setNoteInput(v); }}
                        style={{
                          background:"#fff",
                          borderLeft:`3px solid ${accent}`,
                          padding:"5px 20px 5px 8px",
                          borderRadius:"0 4px 4px 0",
                          cursor:"pointer", transition:"background .15s",
                          position:"relative",
                        }}
                      >
                        <div style={{ fontSize:9, color:accent, fontFamily:"monospace", fontWeight:"bold", marginBottom:2 }}>{k}</div>
                        <div style={{ fontSize:11, color:"#555", fontFamily:"Georgia,serif", lineHeight:1.4 }}>
                          {v.slice(0,55)}{v.length>55?"…":""}
                        </div>
                        <span
                          onClick={e => { e.stopPropagation(); deleteNote(k); }}
                          style={{
                            position:"absolute", top:4, right:6,
                            fontSize:10, color:"#ddd", cursor:"pointer", lineHeight:1,
                          }}
                        >✕</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Holiday list */}
              {monthHols.length > 0 && (
                <>
                  <div style={{ height:1, background:`${accent}1e`, margin:"2px 0" }}/>
                  <p style={{ fontSize:9, letterSpacing:2, color:"#ccc", fontFamily:"monospace", margin:0, textTransform:"uppercase" }}>
                    Holidays
                  </p>
                  {monthHols.map(({day,label}) => (
                    <div key={day} style={{ fontSize:10, color:"#777", fontFamily:"monospace", display:"flex", gap:6 }}>
                      <span style={{ color:accent, fontWeight:"bold", minWidth:18 }}>{day}</span>
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