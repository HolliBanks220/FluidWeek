import { useState, useEffect, useRef } from "react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const PRESETS = {
  freelancer: {
    appTitle: "Fluid Week",
    tagline: "move freely. miss nothing.",
    priorityLabels: { high: "Urgent", medium: "Soon", low: "Someday" },
    itemTypes: ["Task","Appointment","Meeting","Deadline"],
    primaryColor: "#1D3557", accentColor: "#138181",
    brandName: "", logo: "", coverImage: "",
  },
  wedding: {
    appTitle: "Wedding Planner",
    tagline: "your perfect day, beautifully organized.",
    priorityLabels: { high: "Must Do", medium: "This Week", low: "Whenever" },
    itemTypes: ["Venue","Catering","Florals","Attire","Photography","Guest","Other"],
    primaryColor: "#7B4F6E", accentColor: "#C9A96E",
    brandName: "", logo: "", coverImage: "",
  },
  travel: {
    appTitle: "Trip Planner",
    tagline: "every adventure, perfectly planned.",
    priorityLabels: { high: "Book Now", medium: "This Week", low: "Nice to Have" },
    itemTypes: ["Flight","Hotel","Activity","Restaurant","Transport","Other"],
    primaryColor: "#1A5276", accentColor: "#2ECC71",
    brandName: "", logo: "", coverImage: "",
  },
  event: {
    appTitle: "Event Planner",
    tagline: "seamless events start here.",
    priorityLabels: { high: "Critical", medium: "Important", low: "Optional" },
    itemTypes: ["Venue","Catering","A/V","Marketing","Staffing","Logistics","Other"],
    primaryColor: "#1C1C1E", accentColor: "#E8503A",
    brandName: "", logo: "", coverImage: "",
  },
};

function hexToSoft(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},0.08)`;
  } catch(e) { return "#F5F5F5"; }
}

// localStorage helpers
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e) { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}

let uid = 200;

export default function FluidWeek() {
  const [config, setConfig]         = useState(() => lsGet("fw-config", PRESETS.freelancer));
  const [editing, setEditing]       = useState(false);
  const [draft, setDraft]           = useState(() => lsGet("fw-config", PRESETS.freelancer));
  const [items, setItems]           = useState(() => { const s = lsGet("fw-items", []); uid = s.length ? Math.max(200,...s.map(i=>i.id))+1 : 200; return s; });
  const [tab, setTab]               = useState("week");
  const [dragging, setDragging]     = useState(null);
  const [dragOver, setDragOver]     = useState(null);
  const [log, setLog]               = useState(() => lsGet("fw-log", []));
  const [adding, setAdding]         = useState(false);
  const [form, setForm]             = useState({ title:"", day:0, priority:"high", type:"" });
  const [mounted, setMounted]       = useState(false);
  const logoInputRef  = useRef();
  const coverInputRef = useRef();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=Figtree:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; }`;
    document.head.appendChild(style);
    setTimeout(()=>setMounted(true),60);
    return () => document.head.removeChild(style);
  },[]);

  useEffect(()=>{ if(mounted) lsSet("fw-items", items); },[items, mounted]);
  useEffect(()=>{ if(mounted) lsSet("fw-config", config); },[config, mounted]);
  useEffect(()=>{ if(mounted) lsSet("fw-log", log); },[log, mounted]);

  const P = {
    high:   { color: config.primaryColor, soft: hexToSoft(config.primaryColor), label: config.priorityLabels.high },
    medium: { color: config.accentColor,  soft: hexToSoft(config.accentColor),  label: config.priorityLabels.medium },
    low:    { color: "#6B7280",           soft: "#F3F4F6",                       label: config.priorityLabels.low },
  };

  const done = items.filter(i=>i.done).length;
  const pct  = items.length ? Math.round((done/items.length)*100) : 0;

  function move(id, toDay) {
    const item = items.find(i=>i.id===id);
    if (!item || item.day===toDay) return;
    setLog(p=>[{ id:Date.now(), msg:`"${item.title}" → ${DAYS[toDay]}`, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) },...p.slice(0,14)]);
    setItems(p=>p.map(i=>i.id===id?{...i,day:toDay}:i));
  }

  function addItem() {
    if (!form.title.trim()) return;
    const newItem = { ...form, id: uid++, done: false, type: form.type || config.itemTypes[0] };
    setItems(p=>[...p, newItem]);
    setForm({ title:"", day:0, priority:"high", type:"" });
    setAdding(false);
  }

  function handleImageFile(e, field) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDraft(p=>({...p,[field]:ev.target.result}));
    reader.readAsDataURL(file);
  }

  function saveConfig() { setConfig(draft); setEditing(false); }

  const ff = "'Figtree', sans-serif";
  const fs = "'Fraunces', serif";

  return (
    <div style={{ fontFamily:ff, color:"#1C1C1E", background:"#FAFAF9", minHeight:"100vh", opacity:mounted?1:0, transition:"opacity 0.3s" }}>

      {/* CUSTOMIZE MODAL */}
      {editing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"28px 28px 0" }}>
              <div style={{ fontFamily:fs, fontSize:22, fontWeight:600, marginBottom:4 }}>Customize Your Planner</div>
              <div style={{ fontSize:12, color:"#999", marginBottom:20 }}>Make it yours.</div>

              {/* Presets */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.4px" }}>Start from a template</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {Object.entries(PRESETS).map(([key,p])=>(
                    <button key={key} onClick={()=>setDraft(PRESETS[key])} style={{
                      padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:500,
                      background: draft.appTitle===p.appTitle ? config.primaryColor : "#F0F0F0",
                      color: draft.appTitle===p.appTitle ? "#fff" : "#555",
                      border:"none", cursor:"pointer", fontFamily:ff, textTransform:"capitalize",
                    }}>{key}</button>
                  ))}
                </div>
              </div>

              <div style={{ height:1, background:"#F0F0F0", marginBottom:20 }} />

              {/* Cover image */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.4px" }}>Cover / Thumbnail</div>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:80, height:60, borderRadius:10, overflow:"hidden", background:hexToSoft(draft.primaryColor), border:"1.5px solid #E5E5E5", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {draft.coverImage
                      ? <img src={draft.coverImage} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="cover" />
                      : <div style={{ display:"flex", gap:3 }}>
                          <div style={{ width:7, height:34, background:draft.primaryColor, borderRadius:2 }}/>
                          <div style={{ width:7, height:34, background:draft.accentColor, borderRadius:2 }}/>
                        </div>
                    }
                  </div>
                  <div style={{ flex:1 }}>
                    <input placeholder="Paste image URL…" value={draft.coverImage} onChange={e=>setDraft(p=>({...p,coverImage:e.target.value}))}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12, marginBottom:8 }} />
                    <input type="file" accept="image/*" ref={coverInputRef} style={{ display:"none" }} onChange={e=>handleImageFile(e,"coverImage")} />
                    <button onClick={()=>coverInputRef.current.click()} style={{ padding:"7px 14px", background:"#F5F5F5", border:"1.5px solid #E5E5E5", borderRadius:8, fontSize:11, fontWeight:500, cursor:"pointer", fontFamily:ff, color:"#555" }}>📁 Upload from device</button>
                    {draft.coverImage && <button onClick={()=>setDraft(p=>({...p,coverImage:""}))} style={{ marginLeft:8, padding:"7px 12px", background:"none", border:"none", color:"#CCC", cursor:"pointer", fontSize:12 }}>Remove</button>}
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.4px" }}>Logo</div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:48, height:48, borderRadius:10, overflow:"hidden", background:"#F5F5F5", border:"1.5px solid #E5E5E5", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {draft.logo ? <img src={draft.logo} style={{ width:"100%", height:"100%", objectFit:"contain" }} alt="logo" /> : <span style={{ fontSize:18 }}>🏷</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <input placeholder="Paste logo URL…" value={draft.logo} onChange={e=>setDraft(p=>({...p,logo:e.target.value}))}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12, marginBottom:8 }} />
                    <input type="file" accept="image/*" ref={logoInputRef} style={{ display:"none" }} onChange={e=>handleImageFile(e,"logo")} />
                    <button onClick={()=>logoInputRef.current.click()} style={{ padding:"7px 14px", background:"#F5F5F5", border:"1.5px solid #E5E5E5", borderRadius:8, fontSize:11, fontWeight:500, cursor:"pointer", fontFamily:ff, color:"#555" }}>📁 Upload from device</button>
                    {draft.logo && <button onClick={()=>setDraft(p=>({...p,logo:""}))} style={{ marginLeft:8, padding:"7px 12px", background:"none", border:"none", color:"#CCC", cursor:"pointer", fontSize:12 }}>Remove</button>}
                  </div>
                </div>
              </div>

              {/* Title & brand */}
              <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.4px" }}>App Title</div>
                  <input value={draft.appTitle} onChange={e=>setDraft(p=>({...p,appTitle:e.target.value}))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:13 }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.4px" }}>Brand Name</div>
                  <input value={draft.brandName} onChange={e=>setDraft(p=>({...p,brandName:e.target.value}))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:13 }} />
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.4px" }}>Tagline</div>
                <input value={draft.tagline} onChange={e=>setDraft(p=>({...p,tagline:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:13 }} />
              </div>

              {/* Colors */}
              <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                {[["primaryColor","Primary Color"],["accentColor","Accent Color"]].map(([field,label])=>(
                  <div key={field} style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.4px" }}>{label}</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input type="color" value={draft[field]} onChange={e=>setDraft(p=>({...p,[field]:e.target.value}))}
                        style={{ width:36, height:36, border:"none", borderRadius:6, cursor:"pointer", padding:2 }} />
                      <input value={draft[field]} onChange={e=>setDraft(p=>({...p,[field]:e.target.value}))}
                        style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Priority labels */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.4px" }}>Priority Labels</div>
                <div style={{ display:"flex", gap:8 }}>
                  {["high","medium","low"].map(k=>(
                    <div key={k} style={{ flex:1 }}>
                      <div style={{ fontSize:10, color:"#999", marginBottom:4, textTransform:"capitalize" }}>{k}</div>
                      <input value={draft.priorityLabels[k]} onChange={e=>setDraft(p=>({...p,priorityLabels:{...p.priorityLabels,[k]:e.target.value}}))}
                        style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div style={{ background:hexToSoft(draft.primaryColor), borderRadius:10, padding:"14px 16px", marginBottom:20, border:`1.5px solid ${draft.primaryColor}22` }}>
                <div style={{ fontSize:10, color:"#999", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.5px" }}>Live Preview</div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  {draft.coverImage
                    ? <img src={draft.coverImage} style={{ width:44, height:44, borderRadius:8, objectFit:"cover", flexShrink:0 }} alt="" />
                    : draft.logo
                    ? <img src={draft.logo} style={{ width:44, height:44, borderRadius:8, objectFit:"contain", flexShrink:0 }} alt="" />
                    : <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                        <div style={{ width:8, height:36, background:draft.primaryColor, borderRadius:2 }}/>
                        <div style={{ width:8, height:36, background:draft.accentColor, borderRadius:2 }}/>
                      </div>
                  }
                  <div>
                    <div style={{ fontFamily:fs, fontSize:16, fontWeight:600, color:draft.primaryColor }}>{draft.appTitle||"My Planner"}</div>
                    <div style={{ fontSize:10, color:draft.accentColor, fontStyle:"italic", fontFamily:fs }}>{draft.tagline}</div>
                    {draft.brandName && <div style={{ fontSize:10, color:"#999", marginTop:2 }}>{draft.brandName}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding:"0 28px 28px", display:"flex", gap:10 }}>
              <button onClick={saveConfig} style={{ flex:1, padding:"11px", background:draft.primaryColor, color:"#fff", border:"none", borderRadius:10, fontFamily:ff, fontWeight:600, fontSize:13, cursor:"pointer" }}>Save & Apply</button>
              <button onClick={()=>setEditing(false)} style={{ padding:"11px 20px", background:"#F0F0F0", color:"#666", border:"none", borderRadius:10, fontFamily:ff, fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#fff", borderBottom:"1px solid #EBEBEB" }}>
        <div style={{ padding:"18px 32px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {config.coverImage
                ? <img src={config.coverImage} style={{ width:44, height:44, borderRadius:10, objectFit:"cover", flexShrink:0 }} alt="thumbnail" />
                : config.logo
                ? <img src={config.logo} style={{ height:40, objectFit:"contain", flexShrink:0 }} alt="logo" />
                : <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                    <div style={{ width:10, height:36, background:config.primaryColor, borderRadius:2 }}/>
                    <div style={{ width:10, height:36, background:config.accentColor, borderRadius:2 }}/>
                  </div>
              }
              <div>
                <div style={{ fontFamily:fs, fontSize:22, fontWeight:600, color:config.primaryColor, letterSpacing:"-0.3px", lineHeight:1 }}>{config.appTitle}</div>
                <div style={{ fontSize:11, color:config.accentColor, marginTop:2, fontStyle:"italic", fontFamily:fs }}>{config.tagline}</div>
                {config.brandName && <div style={{ fontSize:10, color:"#999", marginTop:1 }}>{config.brandName}</div>}
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:`conic-gradient(${config.accentColor} ${pct*3.6}deg, #F0F0F0 0deg)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"#fff", position:"absolute", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:config.primaryColor }}>{pct}%</div>
                </div>
                <div style={{ fontSize:9, color:"#999", marginTop:3 }}>{done}/{items.length}</div>
              </div>
              <button onClick={()=>{setDraft(config);setEditing(true);}} style={{ padding:"7px 14px", background:hexToSoft(config.primaryColor), color:config.primaryColor, border:`1.5px solid ${config.primaryColor}33`, borderRadius:8, fontFamily:ff, fontSize:11, fontWeight:600, cursor:"pointer" }}>⚙ Customize</button>
            </div>
          </div>

          <div style={{ height:2, background:"#F0F0F0", borderRadius:2 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:config.accentColor, borderRadius:2, transition:"width 0.4s ease" }}/>
          </div>

          <div style={{ display:"flex" }}>
            {[["week","Week"],["pool","Pool"],["log","Log"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"10px 16px", fontSize:12, fontWeight:tab===id?600:400, color:tab===id?config.primaryColor:"#999", background:"transparent", border:"none", borderBottom:tab===id?`2px solid ${config.primaryColor}`:"2px solid transparent", cursor:"pointer", fontFamily:ff, transition:"all 0.15s" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding:"24px 32px" }}>
        <button onClick={()=>setAdding(a=>!a)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:config.primaryColor, color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:ff, marginBottom:18 }}>
          <span style={{ fontSize:16 }}>+</span> Add commitment
        </button>

        {adding && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", background:"#fff", border:"1.5px solid #EBEBEB", borderRadius:12, padding:16, marginBottom:20 }}>
            <input autoFocus placeholder="What needs to happen?" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addItem()}
              style={{ flex:"1 1 200px", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:13 }} />
            <select value={form.day} onChange={e=>setForm(p=>({...p,day:+e.target.value}))} style={{ padding:"9px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12, background:"#FAFAF9" }}>
              {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
            </select>
            <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={{ padding:"9px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12, background:"#FAFAF9" }}>
              {["high","medium","low"].map(k=><option key={k} value={k}>{P[k].label}</option>)}
            </select>
            <select value={form.type||config.itemTypes[0]} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{ padding:"9px 10px", borderRadius:8, border:"1.5px solid #E5E5E5", fontFamily:ff, fontSize:12, background:"#FAFAF9" }}>
              {config.itemTypes.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={addItem} style={{ padding:"9px 18px", background:config.accentColor, color:"#fff", border:"none", borderRadius:8, fontFamily:ff, fontWeight:600, fontSize:12, cursor:"pointer" }}>Save</button>
            <button onClick={()=>setAdding(false)} style={{ padding:"9px 14px", background:"#F0F0F0", color:"#666", border:"none", borderRadius:8, fontFamily:ff, fontSize:12, cursor:"pointer" }}>Cancel</button>
          </div>
        )}

        {/* WEEK VIEW */}
        {tab==="week" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
            {DAYS.map((day,di)=>(
              <div key={di} onDragOver={e=>{e.preventDefault();setDragOver(di);}} onDrop={e=>{e.preventDefault();if(dragging!==null)move(dragging,di);setDragging(null);setDragOver(null);}} onDragLeave={()=>setDragOver(null)}
                style={{ background:dragOver===di?hexToSoft(config.accentColor):"#fff", border:dragOver===di?`1.5px dashed ${config.accentColor}`:"1.5px solid #EBEBEB", borderRadius:12, padding:12, minHeight:140, transition:"all 0.15s" }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:di>=5?config.accentColor:"#AAA", marginBottom:10 }}>{SHORT[di]}</div>
                {items.filter(i=>i.day===di).map(item=>(
                  <div key={item.id} draggable onDragStart={()=>setDragging(item.id)}
                    style={{ background:item.done?"#F7F7F7":P[item.priority].soft, borderLeft:`3px solid ${item.done?"#DDD":P[item.priority].color}`, borderRadius:7, padding:"8px 9px", marginBottom:6, cursor:"grab", opacity:item.done?0.5:1, transition:"opacity 0.2s" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                      <input type="checkbox" checked={item.done} onChange={()=>setItems(p=>p.map(i=>i.id===item.id?{...i,done:!i.done}:i))}
                        style={{ marginTop:2, cursor:"pointer", accentColor:P[item.priority].color, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:500, color:item.done?"#AAA":"#1C1C1E", textDecoration:item.done?"line-through":"none", lineHeight:1.35 }}>{item.title}</div>
                        <div style={{ fontSize:9, color:P[item.priority].color, marginTop:2, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.3px" }}>{item.type} · {P[item.priority].label}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setItems(p=>p.filter(i=>i.id!==item.id));}}
                        style={{ flexShrink:0, background:"#FFE5E5", border:"none", borderRadius:4, width:18, height:18, cursor:"pointer", color:"#CC0000", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", padding:0, fontWeight:700 }}>×</button>
                    </div>
                  </div>
                ))}
                {items.filter(i=>i.day===di).length===0&&<div style={{ fontSize:10, color:"#DDD", textAlign:"center", paddingTop:20 }}>drop here</div>}
              </div>
            ))}
          </div>
        )}

        {/* POOL VIEW */}
        {tab==="pool" && (
          <div>
            <div style={{ fontSize:12, color:"#999", marginBottom:20 }}>Everything in one place — nothing gets lost when you reschedule.</div>
            {["high","medium","low"].map(p=>(
              <div key={p} style={{ marginBottom:28 }}>
                <div style={{ fontSize:10, fontWeight:700, color:P[p].color, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:10 }}>{P[p].label} Priority</div>
                {items.filter(i=>i.priority===p).map(item=>(
                  <div key={item.id} style={{ background:item.done?"#F7F7F7":"#fff", border:"1.5px solid #EBEBEB", borderLeft:`4px solid ${item.done?"#DDD":P[p].color}`, borderRadius:10, padding:"13px 16px", display:"flex", alignItems:"center", gap:14, marginBottom:8, opacity:item.done?0.55:1 }}>
                    <input type="checkbox" checked={item.done} onChange={()=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,done:!i.done}:i))}
                      style={{ cursor:"pointer", accentColor:P[p].color, width:15, height:15, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, textDecoration:item.done?"line-through":"none", color:item.done?"#AAA":"#1C1C1E" }}>{item.title}</div>
                      <div style={{ fontSize:10, color:"#999", marginTop:2, textTransform:"uppercase", letterSpacing:"0.4px" }}>{item.type} · {DAYS[item.day]}</div>
                    </div>
                    <select value={item.day} onChange={e=>move(item.id,+e.target.value)} style={{ fontFamily:ff, fontSize:11, background:"#F5F5F5", border:"1px solid #E0E0E0", borderRadius:6, padding:"4px 8px", color:"#555", cursor:"pointer" }}>
                      {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
                    </select>
                    <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} style={{ background:"none", border:"none", cursor:"pointer", color:"#CCC", fontSize:14, padding:"0 2px" }}>×</button>
                  </div>
                ))}
                {items.filter(i=>i.priority===p).length===0&&<div style={{ fontSize:11, color:"#CCC", padding:"8px 0" }}>Nothing here</div>}
              </div>
            ))}
          </div>
        )}

        {/* LOG VIEW */}
        {tab==="log" && (
          <div>
            <div style={{ fontSize:12, color:"#999", marginBottom:20 }}>Every reschedule recorded — nothing quietly disappears.</div>
            {log.length===0 ? (
              <div style={{ background:"#fff", border:"1.5px solid #EBEBEB", borderRadius:12, padding:"48px 24px", textAlign:"center", color:"#BBB", fontSize:13 }}>
                No rescheduling yet.<br/><span style={{ fontSize:11 }}>Drag a card to a new day to get started.</span>
              </div>
            ) : log.map((e,i)=>(
              <div key={e.id} style={{ background:"#fff", border:"1.5px solid #EBEBEB", borderLeft:`4px solid ${config.accentColor}`, borderRadius:8, padding:"11px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, opacity:Math.max(0.4,1-i*0.06) }}>
                <span style={{ fontSize:12, color:"#555" }}>↪ {e.msg}</span>
                <span style={{ fontSize:10, color:"#BBB" }}>{e.time}</span>
              </div>
            ))}
            <div style={{ marginTop:32, background:config.primaryColor, borderRadius:12, padding:"20px 24px", color:"#fff" }}>
              <div style={{ fontFamily:fs, fontStyle:"italic", fontSize:15, color:config.accentColor, marginBottom:8 }}>The rule</div>
              <div style={{ fontSize:12, lineHeight:1.8, color:"rgba(255,255,255,0.65)" }}>
                Move anything, anytime.<br/>
                But it stays in your pool until it's <span style={{ color:"#fff", fontWeight:600 }}>done</span>.<br/>
                Reschedule freely. Never delete. Never forget.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
