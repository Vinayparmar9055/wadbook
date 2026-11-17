const $=s=>document.querySelector(s),gu=n=>String(n).replace(/\d/g,d=>"૦૧૨૩૪૫૬૭૮૯"[d]);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="wadbook-v1";let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}
D=D||{ps:[],me:null,ja:""};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
const ST={d:["red","સ્વર્ગવાસ"],m:["blue","પરિણીત"],u:["green","અપરિણીત"]};
const get=id=>D.ps.find(p=>p.id==id),nid=()=>Math.max(0,...D.ps.map(p=>p.id))+1;
const kids=p=>D.ps.filter(c=>c.f==p.id&&c.g!="F").sort((a,b)=>(a.yr||9999)-(b.yr||9999));

const RELS={dad:"પિતા",mom:"માતા",bro:"ભાઈ",sis:"બહેન",husb:"પતિ",wife:"પત્ની",son:"દીકરો",dau:"દીકરી"};
const BLOOD=["A+","A-","B+","B-","O+","O-","AB+","AB-"];
const GUJ_MONTHS=["કારતક","માગશર","પોષ","મહા","ફાગણ","ચૈત્ર","વૈશાખ","જેઠ","અષાઢ","શ્રાવણ","ભાદરવો","આસો"];
const GUJ_PAKSH=["સુદ","વદ"];
const GUJ_TITHI=["એકમ (૧)","બીજ (૨)","ત્રીજ (૩)","ચોથ (૪)","પાંચમ (૫)","છઠ્ઠ (૬)","સાતમ (૭)","આઠમ (૮)","નોમ (૯)","દશમ (૧૦)","અગિયારસ (૧૧)","બારસ (૧૨)","તેરસ (૧૩)","ચૌદશ (૧૪)","પૂનમ (૧૫)","અમાસ (૩૦)"];

const PRIV_OPTS={
  pub:"🌍 આખો સમાજ",
  wad:"🌳 વડ / પિયર",
  fam:"👨‍👩‍👧‍👦 મારો પરિવાર",
  me:"🔒 ફક્ત હું"
};

function defaultPriv(p){
  const isF=(p&&p.g=="F");
  return Object.assign({
    mob: isF?"fam":"pub",
    dob: "pub",
    kul: "pub",
    fam: isF?"wad":"pub",
    tul: isF?"wad":"pub"
  }, (p&&p.priv)||{});
}

// Check if current logged-in user can manage/edit this profile (self OR family member created by me)
function canManage(p){
  if(!p || !D.me)return false;
  if(p.id==D.me)return true;
  if(p.createdBy && p.createdBy!=D.me && !p.claimedBy)return false;
  if(p.claimedBy && p.claimedBy!=D.me)return false;
  return true;
}

// --- Automatic Age & Date Helpers ---
function calcAge(dob, yr){
  const now=new Date();
  if(dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)){
    const [y,m,d]=dob.split("-").map(Number);
    let age=now.getFullYear()-y;
    if(now.getMonth()+1<m || (now.getMonth()+1===m && now.getDate()<d))age--;
    return age>=0?age:null;
  }
  if(yr && +yr>1850 && +yr<=now.getFullYear()){
    return now.getFullYear()-(+yr);
  }
  return null;
}

function fmtDate(iso, yr){
  if(iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)){
    const [y,m,d]=iso.split("-");
    return `${gu(d)}-${gu(m)}-${gu(y)}`;
  }
  return yr?gu(yr):"";
}

function fmtTithi(m,p,t){
  return [m,p,t].filter(Boolean).join(" ");
}

// --- Block Browser Pinch-Zoom outside Wad Tree (#vp) ---
document.addEventListener("touchmove",e=>{
 if(e.touches.length>1 && !e.target.closest("#vp")){
  e.preventDefault();
 }
},{passive:false});
document.addEventListener("gesturestart",e=>{
 if(!e.target.closest("#vp"))e.preventDefault();
});

// --- Mobile Back Button / Gesture Navigation Stack ---
let navStack=[], isPopping=false;
function pushView(state){
 if(isPopping)return;
 const last=navStack[navStack.length-1];
 if(last && last.v===state.v && last.id===state.id && last.side===state.side)return;
 navStack.push(state);
 try{history.pushState(state,"");}catch(e){}
}
function renderState(st){
 if(!st){D.me&&get(D.me)?show(D.me,true):empty();return;}
 if(st.v==="pf")show(st.id,true);
 else if(st.v==="fam")showFamily(st.id,true);
 else if(st.v==="tv")tab("tv",true,st.id,st.side||"auto");
 else if(st.v==="tul")showTulsi(st.id,true);
}
window.addEventListener("popstate",()=>{
 if(document.body.classList.contains("fs-tree")){
  document.body.classList.remove("fs-tree");
  fit();
  if(navStack.length)try{history.pushState(navStack[navStack.length-1],"");}catch(e){}
  return;
 }
 if(!$("#sh").hidden){
  $("#sh").hidden=true;
  if(navStack.length)try{history.pushState(navStack[navStack.length-1],"");}catch(e){}
  return;
 }
 if(!$("#dr").hidden){
  $("#dr").hidden=true;
  if(navStack.length)try{history.pushState(navStack[navStack.length-1],"");}catch(e){}
  return;
 }
 if(navStack.length>1){
  navStack.pop();
  const prev=navStack[navStack.length-1];
  isPopping=true;
  renderState(prev);
  isPopping=false;
 }
});

function setNav(activeTab){
 document.querySelectorAll("nav.bn button").forEach(b=>b.classList.toggle("on",b.dataset.t==activeTab));
 const pfBtn=document.querySelector("nav.bn button[data-t='pf'] span");
 if(pfBtn)pfBtn.textContent=(cur&&D.me&&cur!=D.me)?"મારી પ્રોફાઇલ":"પ્રોફાઇલ";
}

function cleanDuplicates(){
 let changed=false;
 const seen=new Map();
 const keep=[];
 D.ps.forEach(p=>{
  if(p.f){
   const key=`${p.f}_${p.n}_${p.yr||""}_${p.g}`;
   if(seen.has(key)){changed=true;return;}
   seen.set(key,p.id);
  }
  keep.push(p);
 });
 if(changed){D.ps=keep;save();}
}
cleanDuplicates();

function full(p){
 if(!p)return "";
 if(p.g=="F"){
  const husb=D.ps.find(x=>x.sp==p.id||(p.sp&&x.id==p.sp));
  if(husb)return p.n+" "+husb.n;
  if(p.f&&get(p.f))return p.n+" "+get(p.f).n;
 }
 return p.n+(p.f&&get(p.f)?" "+get(p.f).n:"");
}

function pre(p){
 if(!p)return "";
 if(p.s=="d")return "સ્વ. ";
 if(p.g=="F"){
  const husb=D.ps.find(x=>x.sp==p.id||(p.sp&&x.id==p.sp));
  if(husb&&husb.s=="d")return "ગં.સ્વ. ";
  return p.s=="u"?"કુ. ":"સૌ. ";
 }
 return "શ્રી ";
}

const selOpts=(arr,val)=>`<option value="">-- પસંદ કરો --</option>`+arr.map(x=>`<option value="${esc(x)}" ${val==x?"selected":""}>${esc(x)}</option>`).join("");
const privSel=(id,val)=>Object.entries(PRIV_OPTS).map(([k,v])=>`<option value="${k}" ${val==k?"selected":""}>${v}</option>`).join("");

// --- Comprehensive Smart Profile Form ---
function openProfileForm(title, v, isRoot, cb){
 const pv=defaultPriv(v);
 const jaVal=(v.ja!==undefined)?v.ja:(isRoot?D.ja:"");

 $("#sh").innerHTML=`<div class="card">
  <h3>${title}</h3>

  <div class="f-sec">૧. મૂળભૂત ઓળખ (જાતિ & અટક)</div>
  <div class="g2">
    <label>નામ *<input id="f_n" type="text" value="${esc(v.n||"")}" placeholder="દા.ત. વિનયભાઈ"></label>
    <label>જાતિ / શાખ (નામ સાથે દેખાશે)<input id="f_ja" type="text" value="${esc(jaVal)}" placeholder="દા.ત. ટડાવા"></label>
  </div>
  <div class="g2">
    <label>અટક<input id="f_sur" type="text" value="${esc(v.sur||"")}" placeholder="દા.ત. પરમાર"></label>
    <label>લિંગ<select id="f_g"><option value="M" ${v.g!="F"?"selected":""}>પુરુષ</option><option value="F" ${v.g=="F"?"selected":""}>સ્ત્રી</option></select></label>
  </div>
  <div class="g2">
    <label>સ્થિતિ<select id="f_s" onchange="toggleStatusRows(this.value)">${Object.entries(ST).map(([a,b])=>`<option value="${a}" ${(v.s||"m")==a?"selected":""}>${b[1]}</option>`).join("")}</select></label>
    <label>બ્લડ ગ્રુપ<select id="f_bg">${selOpts(BLOOD,v.bg)}</select></label>
  </div>
  <div class="g2">
    <label>મૂળ વતન - ગામ<input id="f_gam" type="text" value="${esc(v.gam||"")}" placeholder="દા.ત. ટડાય (બનાસકાંઠા)"></label>
    <label>હાલ રહેઠાણ<input id="f_rah" type="text" value="${esc(v.rah||"")}" placeholder="દા.ત. ભાવનગર"></label>
  </div>
  <label>સંપર્ક / મોબાઇલ નંબર<input id="f_mob" type="tel" value="${esc(v.mob||"")}" placeholder="દા.ત. 8460209055"></label>

  <div id="aliveBox" ${v.s=="d"?"hidden":""}>
    <div class="g2">
      <label>ભણતર (હયાત હોય તો)<input id="f_edu" type="text" value="${esc(v.edu||"")}" placeholder="દા.ત. ૧૦ સુધી / B.A."></label>
      <label>નોકરી / ધંધો / વ્યવસાય<input id="f_job" type="text" value="${esc(v.job||"")}" placeholder="દા.ત. વેપાર / નોકરી / ખેતી"></label>
    </div>
  </div>

  <div class="f-sec">૨. જન્મ તારીખ, ઉંમર અને ગુજરાતી તિથિ</div>
  <div class="g2">
    <label>અંગ્રેજી જન્મ તારીખ<input id="f_dob" type="date" value="${esc(v.dob||"")}" onchange="autoFillYr(this.value)"></label>
    <label>અથવા જન્મ વર્ષ<input id="f_yr" type="number" value="${esc(v.yr||"")}" placeholder="દા.ત. 1983"></label>
  </div>
  <label>ગુજરાતી જન્મ તિથિ (મહિનો • સુદ/વદ • તિથિ)</label>
  <div class="g3">
    <select id="f_gm">${selOpts(GUJ_MONTHS,v.gm)}</select>
    <select id="f_gp">${selOpts(GUJ_PAKSH,v.gp)}</select>
    <select id="f_gt">${selOpts(GUJ_TITHI,v.gt)}</select>
  </div>

  <div id="deathBox" ${v.s=="d"?"":"hidden"}>
    <div class="f-sec" style="background:#fee2e2;color:#991b1b;border-color:#ef4444">🕊️ સ્વર્ગવાસ તારીખ અને પુણ્યતિથિ</div>
    <label>અંગ્રેજી મરણ તારીખ<input id="f_dod" type="date" value="${esc(v.dod||"")}"></label>
    <label>ગુજરાતી પુણ્યતિથિ (મહિનો • સુદ/વદ • તિથિ)</label>
    <div class="g3">
      <select id="f_dm">${selOpts(GUJ_MONTHS,v.dm)}</select>
      <select id="f_dp">${selOpts(GUJ_PAKSH,v.dp)}</select>
      <select id="f_dt">${selOpts(GUJ_TITHI,v.dt)}</select>
    </div>
  </div>

  <div class="f-sec">૩. ત્રણેય કુળ-સંબંધો (ગામ અને અટક/જાતિ)</div>
  <label>A. મોસાળપક્ષ (મારા મામાનું ઘર)<input id="f_mos" type="text" value="${esc(v.mos||"")}" placeholder="દા.ત. ભાવનગર (ગેલડા)"></label>
  <label>B. પોહાળપક્ષ (પિતાના મામાનું ઘર)<input id="f_poh" type="text" value="${esc(v.poh||"")}" placeholder="દા.ત. અભેપુરા (ગોહેલ)"></label>
  <label>C. સાસરીપક્ષ (લગ્ન થયા હોય તો સાસરીનું ઘર)<input id="f_sas" type="text" value="${esc(v.sas||"")}" placeholder="દા.ત. સિદ્ધપુર (ભૈડુસા)"></label>

  <div class="f-sec">૪. મારો પરિચય / વિચાર (Bio - ૧૦૦ શબ્દો સુધી)</div>
  <textarea id="f_bio" maxlength="600" placeholder="તમારા વિચારો, સામાજિક પ્રવૃત્તિ કે પોતાના વિશે ટૂંકમાં લખો...">${esc(v.bio||"")}</textarea>

  <div class="f-sec">૫. પ્રાઇવસી કંટ્રોલ (કોને શું દેખાડવું?)</div>
  <div class="priv-box">
    <div class="priv-row"><span>📞 સંપર્ક / મોબાઇલ નંબર</span><select id="pv_mob">${privSel("mob",pv.mob)}</select></div>
    <div class="priv-row"><span>🎂 જન્મ તારીખ & ઉંમર</span><select id="pv_dob">${privSel("dob",pv.dob)}</select></div>
    <div class="priv-row"><span>🌾 મોસાળ / પોહાળ / સાસરી</span><select id="pv_kul">${privSel("kul",pv.kul)}</select></div>
    <div class="priv-row"><span>👨‍👩‍👧‍👦 મારો પરિવાર</span><select id="pv_fam">${privSel("fam",pv.fam)}</select></div>
    <div class="priv-row"><span>🌿 તુલસી ક્યારો</span><select id="pv_tul">${privSel("tul",pv.tul)}</select></div>
  </div>

  <div class="bt"><button onclick="shut()">રદ કરો</button><button class="pr" id="ok">સાચવો</button></div>
 </div>`;

 $("#sh").hidden=false;
 try{history.pushState({modal:1},"");}catch(e){}
 let busy=false;
 $("#ok").onclick=()=>{
  if(busy)return;
  const n=$("#f_n").value.trim();
  if(!n){alert("નામ લખો");return;}
  const dob=$("#f_dob").value.trim();
  let yr=$("#f_yr").value.trim();
  if(!yr && dob)yr=dob.slice(0,4);
  const o={
   n,
   ja:$("#f_ja").value.trim(),
   sur:$("#f_sur").value.trim(),
   g:$("#f_g").value,
   s:$("#f_s").value,
   bg:$("#f_bg").value,
   mob:$("#f_mob").value.trim(),
   edu:$("#f_edu").value.trim(),
   gam:$("#f_gam").value.trim(),
   rah:$("#f_rah").value.trim(),
   job:$("#f_job").value.trim(),
   dob,
   yr:yr?+yr:"",
   gm:$("#f_gm").value,
   gp:$("#f_gp").value,
   gt:$("#f_gt").value,
   dod:$("#f_dod").value.trim(),
   dm:$("#f_dm").value,
   dp:$("#f_dp").value,
   dt:$("#f_dt").value,
   mos:$("#f_mos").value.trim(),
   sas:$("#f_sas").value.trim(),
   poh:$("#f_poh").value.trim(),
   bio:$("#f_bio").value.trim(),
   priv:{
    mob:$("#pv_mob").value,
    dob:$("#pv_dob").value,
    kul:$("#pv_kul").value,
    fam:$("#pv_fam").value,
    tul:$("#pv_tul").value
   }
  };
  busy=true;$("#ok").disabled=true;
  cb(o);
 };
}

function toggleStatusRows(val){
 const d=$("#deathBox"), a=$("#aliveBox");
 if(d)d.hidden=(val!="d");
 if(a)a.hidden=(val=="d");
}
function autoFillYr(dob){
 if(dob && !$("#f_yr").value)$("#f_yr").value=dob.slice(0,4);
}
const shut=()=>{$("#sh").hidden=true};

function first(){
 openProfileForm("તમારી પ્રોફાઇલ બનાવો",{s:"m",g:"M"},true,o=>{
  D={ps:[{id:1,f:null,...o}],me:1,ja:o.ja};
  save();shut();navStack=[];show(1);
 });
}

function edit(id){
 const p=get(id);
 if(!canManage(p)){alert("તમે આ પ્રોફાઇલ એડિટ ન કરી શકો");return;}
 openProfileForm("✏️ વિગત ફેરવો",p,id==D.me,o=>{
  Object.assign(p,o);
  if(id==D.me && o.ja)D.ja=o.ja;
  save();shut();show(id,true);
  if(!$("#tv").hidden)draw(treeTarget,treeSide);
 });
}

function addMember(pid,defaultRel="son",returnToFamily=false){
 const p=get(pid);
 const fatherId=(p.g=="F"&&p.sp&&get(p.sp))?p.sp:pid;
 const father=get(fatherId)||p;
 const defStatus=(defaultRel=="wife"||defaultRel=="husb"||defaultRel=="mom")?"m":"u";

 $("#sh").innerHTML=`<div class="card"><h3>➕ નામ ઉમેરો (${esc(p.n)})</h3>
  <label>સંબંધ પસંદ કરો<select id="f_rel">${Object.entries(RELS).map(([a,b])=>`<option value="${a}" ${defaultRel==a?"selected":""}>${b}</option>`).join("")}</select></label>
  <label>નામ *<input id="f_n" type="text" placeholder="સભ્યનું નામ"></label>
  <div class="g2">
    <label>જન્મ તારીખ<input id="f_dob" type="date" onchange="if(this.value&&!$('#f_yr').value)$('#f_yr').value=this.value.slice(0,4)"></label>
    <label>અથવા જન્મ વર્ષ<input id="f_yr" type="number" placeholder="1990"></label>
  </div>
  <label>સ્થિતિ<select id="f_s">${Object.entries(ST).map(([a,b])=>`<option value="${a}" ${defStatus==a?"selected":""}>${b[1]}</option>`).join("")}</select></label>
  <div class="bt"><button onclick="shut()">રદ કરો</button><button class="pr" id="ok">સાચવો</button></div>
 </div>`;
 $("#sh").hidden=false;
 try{history.pushState({modal:1},"");}catch(e){}
 let busy=false;
 $("#ok").onclick=()=>{
  if(busy)return;
  const r=$("#f_rel").value,n=$("#f_n").value.trim(),dob=$("#f_dob").value.trim(),s=$("#f_s").value;
  let yr=$("#f_yr").value.trim();
  if(!yr && dob)yr=dob.slice(0,4);
  if(!n){alert("નામ લખો");return;}
  yr=yr?+yr:"";
  const id=nid();
  const g=(r=="mom"||r=="sis"||r=="wife"||r=="dau")?"F":"M";

  if(r=="son"||r=="dau"){
   const dup=D.ps.find(x=>(x.f===fatherId||x.m===pid) && x.n===n && (x.yr||"")===yr && x.g===g);
   if(dup){alert("આ બાળકનું નામ પરિવારમાં પહેલેથી ઉમેરેલું છે!");return;}
  } else {
   const dup=D.ps.find(x=>x.n===n && (x.yr||"")===yr && x.g===g && x.relTo===pid && x.relType===r);
   if(dup){alert("આ નામ પહેલેથી ઉમેરેલું છે!");return;}
  }

  busy=true;$("#ok").disabled=true;
  const same=(r=="son"||r=="dau"||r=="bro"||r=="sis"||r=="dad");
  const m={id,f:null,g,n,dob,yr,s,createdBy:D.me,ja:same?(father.ja||D.ja||""):"",sur:same?(father.sur||""):"",gam:same?(father.gam||""):"",relTo:(r=="mom"||r=="dad"||r=="bro"||r=="sis")?pid:fatherId,relType:r};
  if(r=="dad"){
    if(p.f&&get(p.f)){alert("પિતા પહેલેથી ઉમેરેલા છે");busy=false;$("#ok").disabled=false;return;}
    D.ps.push(m);p.f=id;
    const exMom=D.ps.find(x=>x.relType=="mom"&&(x.relTo==pid||x.relTo==fatherId));
    if(exMom){exMom.sp=id;m.sp=exMom.id;}
  } else if(r=="son"||r=="dau"){
    if(p.g=="F"){
      m.m=pid;
      if(p.sp&&get(p.sp))m.f=p.sp;
    } else {
      m.f=pid;
      if(p.sp&&get(p.sp))m.m=p.sp;
    }
    D.ps.push(m);
  } else if(r=="bro"||r=="sis"){
    if(!p.f||!get(p.f)){
      const fid=nid();
      D.ps.push({id:fid,f:null,g:"M",n:"પિતા",s:"d",createdBy:D.me,ja:p.ja||D.ja||"",sur:p.sur||"",gam:p.gam||""});
      p.f=fid;
    }
    m.f=p.f;
    D.ps.push(m);
  } else if(r=="mom"){
    if(momOf(p)){alert("માતા પહેલેથી ઉમેરેલા છે");busy=false;$("#ok").disabled=false;return;}
    m.sp=p.f||null;
    if(p.f&&get(p.f))get(p.f).sp=id;
    D.ps.push(m);
  } else if(r=="wife"){
    if(p.sp&&get(p.sp)){alert("પત્ની પહેલેથી ઉમેરેલા છે");busy=false;$("#ok").disabled=false;return;}
    m.sp=pid;
    p.sp=id;
    D.ps.push(m);
    D.ps.forEach(c=>{if(c.f==pid&&!c.m)c.m=id;});
  } else if(r=="husb"){
    if(p.sp&&get(p.sp)){alert("પતિ પહેલેથી ઉમેરેલા છે");busy=false;$("#ok").disabled=false;return;}
    m.sp=pid;
    p.sp=id;
    D.ps.push(m);
    D.ps.forEach(c=>{if((c.m==pid||c.relTo==pid)&&!c.f&&(c.relType=="son"||c.relType=="dau"))c.f=id;});
  }
  save();shut();
  if(returnToFamily==="tulsi")showTulsi(pid,true);else if(returnToFamily)showFamily(pid,true);else show(pid,true);
 };
}

function delMember(id,backId){
 if(id==D.me){alert("તમારી મુખ્ય પ્રોફાઇલ ડિલીટ ન થઈ શકે");return;}
 if(confirm("આ સભ્યનું નામ કાઢી નાખવું છે?")){
  D.ps=D.ps.filter(x=>x.id!=id);
  D.ps.forEach(x=>{if(x.f==id)x.f=null;if(x.m==id)x.m=null;if(x.sp==id)x.sp=null;});
  save();
  showFamily(backId,true);
 }
}

function vs(p){
 const husb=(p.g=="F")?D.ps.find(x=>(p.sp&&x.id==p.sp)||x.sp==p.id):null;
 let r=(p.g=="F")?((husb&&husb.g!="F")?husb:(p.f&&get(p.f)?get(p.f):p)):p;
 while(r.f&&get(r.f))r=get(r.f);
 let n=0,m=0,u=0;
 (function w(q,d){n++;if(q.s=="u")u++;m=Math.max(m,d);kids(q).forEach(x=>w(x,d+1))})(r,1);
 return[m,n,u];
}

function getFamilyList(p){
 const seen=new Set();
 const parents=[],sameGen=[],children=[];
 const add=(arr,q,label,order)=>{
  if(!q||seen.has(q.id))return;
  seen.add(q.id);
  arr.push({q,label,yr:q.yr||9999,order});
 };

 const dad=(p.f&&get(p.f))?get(p.f):null;
 const mom=D.ps.find(x=>(x.relType=="mom"&&(x.relTo==p.id||(dad&&x.sp==dad.id)))||(dad&&dad.sp==x.id&&x.g=="F"));
 if(dad)add(parents,dad,"પિતા",1);
 if(mom)add(parents,mom,"માતા",2);

 add(sameGen,p,"મુખ્ય",3);
 const spouseObj=D.ps.find(x=>(p.sp&&x.id==p.sp)||x.sp==p.id);
 if(spouseObj)add(sameGen,spouseObj,spouseObj.g=="F"?"પત્ની":"પતિ",4);
 if(dad){
  D.ps.filter(x=>x.f==dad.id && x.id!=p.id).forEach(x=>{
   add(sameGen,x,x.g=="F"?"બહેન":"ભાઈ",3);
  });
 }
 sameGen.sort((a,b)=>(a.yr-b.yr)||(a.order-b.order));

 const headId=(p.g=="F"&&spouseObj&&spouseObj.g=="M")?spouseObj.id:p.id;
 D.ps.filter(x=>x.f==headId || x.m==p.id || (spouseObj&&(x.f==spouseObj.id||x.m==spouseObj.id))).forEach(x=>{
  add(children,x,x.g=="F"?"દીકરી":"દીકરો",5);
 });
 children.sort((a,b)=>a.yr-b.yr);

 return [...parents,...sameGen,...children].map(item=>[item.q,item.label]);
}

function getNuclearFamily(p){
 const spouseObj=D.ps.find(x=>(p.sp&&x.id==p.sp)||x.sp==p.id);
 let husb=null, wife=null;
 if(p.g=="F"){
  wife=p;
  husb=(spouseObj&&spouseObj.g!="F")?spouseObj:null;
 } else {
  husb=p;
  wife=(spouseObj&&spouseObj.g=="F")?spouseObj:null;
 }
 const seenKids=new Set();
 const children=[];
 D.ps.filter(x=>(husb&&x.f==husb.id) || (wife&&(x.m==wife.id||x.f==wife.id))).forEach(c=>{
  const key=`${c.n}_${c.yr||""}_${c.g}`;
  if(!seenKids.has(key)){seenKids.add(key);children.push(c);}
 });
 children.sort((a,b)=>(a.yr||9999)-(b.yr||9999));
 return {husb,wife,children};
}

function showFamily(id,skipPush=false){
 cur=id;
 const p=get(id),{husb,wife,children}=getNuclearFamily(p);
 const isSelf=(id==D.me);
 const editable=canManage(p);
 const mainPerson=husb||wife||p;
 const totalCount=(husb?1:0)+(wife?1:0)+children.length;

 const node=(q,role)=>`
   <div class="par-node" onclick="show(${q.id})">
     <i class="r ${ST[q.s][0]}">${esc(q.n[0])}</i>
     <b>${esc(pre(q)+q.n)}</b>
     <small>${role}${q.yr?" • "+gu(q.yr):""}</small>
   </div>`;

 const rowCard=(q,rel)=>`
   <div class="fm">
     <i class="r ${ST[q.s][0]}" onclick="show(${q.id})">${esc(q.n[0])}</i>
     <div onclick="show(${q.id})">
       <b>${esc(pre(q)+full(q))}</b>
       <small>${rel}${q.yr?" • જન્મ "+gu(q.yr):""}</small>
     </div>
     ${editable&&q.id!=D.me?`<button class="del-btn" onclick="delMember(${q.id},${id})" title="કાઢો">✕</button>`:""}
     <span onclick="show(${q.id})">જુઓ ›</span>
   </div>`;

 const leftSlot=husb
   ? node(husb, wife?"પતિ":"પતિ / મુખ્ય")
   : (editable
      ? `<div class="par-node add-sp" onclick="addMember(${wife.id},'husb',true)"><i class="r" style="border-style:dashed;background:#fff">+</i><b>પતિ ઉમેરો</b><small>ક્લિક કરો</small></div>`
      : `<div class="par-node"><i class="r" style="opacity:.4">?</i><b>પતિ</b><small>ઉમેરેલ નથી</small></div>`);

 const rightSlot=wife
   ? node(wife, husb?"પત્ની":"પત્ની / મુખ્ય")
   : (editable
      ? `<div class="par-node add-sp" onclick="addMember(${husb.id},'wife',true)"><i class="r" style="border-style:dashed;background:#fff">+</i><b>પત્ની ઉમેરો</b><small>ક્લિક કરો</small></div>`
      : `<div class="par-node"><i class="r" style="opacity:.4">?</i><b>પત્ની</b><small>ઉમેરેલ નથી</small></div>`);

 $("#pf").innerHTML=`<div class="pad">
  <div class="hd">
    <h2>👨‍👩‍👧‍👦 ${isSelf?"મારો પરિવાર":"તેમનો પરિવાર"}</h2>
    <p>${esc(pre(mainPerson)+full(mainPerson))} નો ઘર-પરિવાર</p>
  </div>

  <div class="par-tree">
    <div class="par-badge">🏡 ઘર-પરિવાર • ${gu(totalCount)} સભ્યો</div>
    <div class="par-couple">
      ${leftSlot}
      <div class="par-link"><span>💍</span></div>
      ${rightSlot}
    </div>
    ${children.length?`
      <div class="par-stem"></div>
      <div class="par-kids">
        ${children.map(c=>node(c,c.g=="F"?"દીકરી":"દીકરો")).join("")}
      </div>
    `:`<p class="par-empty-k">${editable?"નીચેથી દીકરો કે દીકરી ઉમેરો":"સંતાનો ઉમેરેલ નથી"}</p>`}
  </div>

  ${editable?`<div style="margin:14px 0">
    <button class="bk" style="margin:0" onclick="addMember(${id},'son',true)">➕ પરિવારમાં નામ ઉમેરો (${husb?"પત્ની":"પતિ"}, દીકરો, દીકરી)</button>
  </div>`:""}

  <h3 class="fh">પરિવારના સભ્યોની યાદી</h3>
  ${husb?rowCard(husb,wife?"પતિ":"પતિ / મુખ્ય સભ્ય"):""}
  ${wife?rowCard(wife,husb?"પત્ની":"પત્ની / મુખ્ય સભ્ય"):""}
  ${children.map(c=>rowCard(c,c.g=="F"?"દીકરી":"દીકરો")).join("")}

  <button class="bk" onclick="history.back()">← પ્રોફાઇલ પર પાછા જાઓ</button>
 </div>`;
 $("#tv").hidden=true;$("#pf").hidden=false;
 setNav("pf");
 $("#pf").scrollTop=0;
 if(!skipPush)pushView({v:"fam",id});
}

function show(id,skipPush=false){
 cur=id;const p=get(id);if(!p)return empty();
 const isSelf=(id==D.me);
 const editable=canManage(p);
 const[c,t]=ST[p.s],[g,n,u]=vs(p),fam=getFamilyList(p);
 const pv=defaultPriv(p);
 const canSee=k=>(editable || pv[k]!=="me");

 // 1. Name Heading uses Jati/Shakha (e.g., શ્રી વિનયભાઈ કરશનભાઈ ટડાવા)
 const shakh=p.ja||(isSelf?D.ja:"");
 const titleSuffix=shakh||p.sur||"";

 // 2. Top Handle: Atak, Vatan, Rahethan, Sampark (Mobile)
 const line1=[p.sur?"અટક: "+esc(p.sur):"", p.gam?"વતન: "+esc(p.gam):"", t].filter(Boolean).join(" • ");
 const mobBadge=(p.mob && canSee("mob") && p.s!="d")?`<a class="call-pill" href="tel:${esc(p.mob)}">📞 ${esc(p.mob)}</a>`:"";
 const line2=[p.rah?"રહેઠાણ: "+esc(p.rah):"", mobBadge].filter(Boolean).join(" • ");

 // Date + Auto Age + Gujarati Tithi
 const age=calcAge(p.dob,p.yr);
 const dobStr=fmtDate(p.dob,p.yr);
 const birthFull=dobStr ? (dobStr + (age!==null && p.s!="d" ? ` (${gu(age)} વર્ષ)` : "")) : "";
 const gujBirth=fmtTithi(p.gm,p.gp,p.gt);
 const deathFull=fmtDate(p.dod,"");
 const gujDeath=fmtTithi(p.dm,p.dp,p.dt);

 const rw=(a,b,fullW=false)=>b?`<div class="rw${fullW?" full-rw":""}"><span>${a}</span><b>${b}</b></div>`:"";
 const card=(q,rel)=>`<a class="fm" onclick="show(${q.id})"><i class="r ${ST[q.s][0]}">${esc(q.n[0])}</i><div><b>${esc(pre(q)+full(q))}</b><small>${rel}${q.yr?" • જન્મ "+gu(q.yr):""}</small></div><span>જુઓ ›</span></a>`;

 // Action Buttons: Self vs Family Member managed by me vs External Visitor
 const husbObj=(p.g=="F")?D.ps.find(x=>(p.sp&&x.id==p.sp)||x.sp==p.id):null;
 const hasSasri=(p.g=="F" && husbObj && husbObj.g!="F");

 let actionButtons="";
 if(isSelf){
  actionButtons=`<div class="ac2">
    <button class="pm full-w" onclick="showFamily(${id})">👨‍👩‍👧‍👦 મારો પરિવાર</button>
    <button onclick="addMember(${id})">➕ નામ ઉમેરો</button>
    <button onclick="edit(${id})">✏️ વિગત ફેરવો</button>
  </div>`;
 } else if(hasSasri){
  actionButtons=`<div class="ac2">
    <button class="pm" onclick="tab('tv',false,${id},'sasri')">🌳 સાસરી વડ</button>
    <button class="pm" onclick="tab('tv',false,${id},'piyar')">🌳 પિયર વડ</button>
    ${canSee("fam")?`<button onclick="showFamily(${id})">👨‍👩‍👧‍👦 તેમનો પરિવાર</button>`:""}
    ${canSee("tul")?`<button class="gr-btn" onclick="showTulsi(${id})">🌿 તુલસી ક્યારો</button>`:""}
    ${editable?`<button onclick="addMember(${id})">➕ નામ ઉમેરો</button><button onclick="edit(${id})">✏️ વિગત ફેરવો</button>`:""}
    <button class="full-w" style="font-size:15px;padding:11px" onclick="shareProfile(${id})">📤 પ્રોફાઇલ શેર કરો</button>
  </div>`;
 } else {
  const wadLabel=(p.g=="F")?"🌳 પિયર વડ":"🌳 તેમનો વડ";
  actionButtons=`<div class="ac2">
    <button class="pm" onclick="tab('tv',false,${id},'piyar')">${wadLabel}</button>
    ${canSee("fam")?`<button class="pm" onclick="showFamily(${id})">👨‍👩‍👧‍👦 તેમનો પરિવાર</button>`:""}
    ${canSee("tul")?`<button class="gr-btn" onclick="showTulsi(${id})">🌿 તુલસી ક્યારો</button>`:""}
    <button onclick="shareProfile(${id})">📤 શેર કરો</button>
    ${editable?`<button onclick="addMember(${id})">➕ નામ ઉમેરો</button><button onclick="edit(${id})">✏️ વિગત ફેરવો</button>`:""}
  </div>`;
 }

 // Fix Big Avatar Ring Color for Deceased (red), Married (blue), Unmarried (green)
 const bigRingStyle=(p.s=="d")?"background:#b91c1c;border-color:#ef4444;color:#fff":(p.s=="u"?"background:#15803d;border-color:#22c55e;color:#fff":"");

 // Memorial Note for Deceased (Not an active login account, just family lineage connection)
 const memorialNote=(p.s=="d")?`<p style="text-align:center;margin:2px 0 8px"><span style="display:inline-block;background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:99px;padding:3px 12px;font-size:12px;font-weight:800">🕊️ સ્મૃતિ પ્રોફાઇલ • વંશાવળી જોડાણ માટે</span></p>`:"";

 // Bottom Info Box
 const infoRows=[
  canSee("dob") ? rw("જન્મ તારીખ", birthFull) : "",
  canSee("dob") ? rw("જન્મ તિથિ", esc(gujBirth)) : "",
  (p.s=="d" && deathFull) ? rw("મરણ તારીખ", deathFull) : "",
  (p.s=="d" && gujDeath) ? rw("પુણ્યતિથિ", esc(gujDeath)) : "",
  rw("બ્લડ ગ્રુપ", esc(p.bg)),
  (p.s!="d") ? rw("ભણતર", esc(p.edu)) : "",
  (p.s!="d") ? rw("વ્યવસાય", esc(p.job)) : "",
  canSee("kul") ? rw("મોસાળપક્ષ", esc(p.mos), true) : "",
  canSee("kul") ? rw("પોહાળપક્ષ", esc(p.poh), true) : "",
  canSee("kul") ? rw("સાસરીપક્ષ", esc(p.sas), true) : ""
 ].filter(Boolean).join("");

 $("#pf").innerHTML=`<div class="cv"></div>
 <div class="pr"><i class="r big ${c}" style="${bigRingStyle}">${esc(p.n[0])}</i>
 <h2>${esc(pre(p)+full(p))}${titleSuffix?" "+esc(titleSuffix):""}</h2>
 ${memorialNote}
 ${line1?`<p class="ln">${line1}</p>`:""}
 ${line2?`<p class="bio">${line2}</p>`:""}
 ${p.bio?`<div class="bio-box">“${esc(p.bio)}”</div>`:""}
 <div class="st"><div><b>${gu(g)} પેઢી</b><small>${isSelf?"મારો વડ 🌳":(hasSasri?"સાસરી વડ 🌳":(p.g=="F"?"પિયર વડ 🌳":"તેમનો વડ 🌳"))}</small></div><div><b>${gu(n)} સભ્યો</b><small>કુલ પરિવાર</small></div><div class="gr"><b>${gu(u)} અપરિણીત</b><small>સગાઈ યોગ્ય</small></div></div>
 ${actionButtons}
 ${infoRows?`<div class="bx">${infoRows}</div>`:""}
 ${canSee("fam") && fam.length?`<h3 class="fh">પરિવારના સભ્યો</h3>${fam.map(([q,r])=>card(q,r)).join("")}`:(!canSee("fam")?`<div class="priv-note">🔒 પરિવારની વિગત પ્રાઇવેટ રાખવામાં આવી છે</div>`:"")}</div>`;
 $("#tv").hidden=true;$("#pf").hidden=false;
 setNav("pf");
 $("#pf").scrollTop=0;
 if(!skipPush)pushView({v:"pf",id});
}

function shareProfile(id){
 const p=get(id)||get(D.me);
 if(!p)return;
 const shakh=p.ja||D.ja||p.sur||"";
 const txt=`🌳 Wadbook પરિવાર પરિચય\n${pre(p)+full(p)} ${shakh}\nવતન: ${p.gam||"-"} | રહેઠાણ: ${p.rah||"-"}`;
 if(navigator.share){navigator.share({title:"Wadbook",text:txt}).catch(()=>{});}
 else{alert(txt);}
}

const W=112,H=112;let cur=null,SW=1,SH=1,FS="all",treeTarget=null,treeSide="auto";
function draw(targetId,side="auto"){
 let person=get(targetId||D.me);const stg=$("#stage");if(!person)return;
 let base=person, sideTag="";

 if(person.g=="F"){
  const husb=D.ps.find(x=>(person.sp&&x.id==person.sp)||x.sp==person.id);
  const dad=(person.f&&get(person.f))?get(person.f):null;
  if(side=="sasri"){
   if(husb&&husb.g!="F"){base=husb;sideTag="સાસરી વડ • ";}
   else{stg.style.cssText="";stg.innerHTML='<p class="em">પતિનું નામ ઉમેરેલ નથી<br><button class="bk" style="max-width:240px" onclick="history.back()">← પાછા જાઓ</button></p>';$("#flt").innerHTML="";$("#sub").textContent="";return;}
  } else if(side=="piyar"){
   if(dad){base=dad;sideTag="પિયર વડ • ";}
   else{stg.style.cssText="";stg.innerHTML='<p class="em">પિતાનું નામ ઉમેરેલ નથી<br><button class="bk" style="max-width:240px" onclick="showTulsi('+person.id+')">🌿 તુલસી ક્યારો જુઓ</button></p>';$("#flt").innerHTML="";$("#sub").textContent="";return;}
  } else {
   if(husb&&husb.g!="F"){base=husb;sideTag="સાસરી વડ • ";}
   else if(dad){base=dad;sideTag="પિયર વડ • ";}
   else{stg.style.cssText="";stg.innerHTML='<p class="em">પિતાનું નામ ઉમેરેલ નથી<br><button class="bk" style="max-width:240px" onclick="showTulsi('+person.id+')">🌿 તુલસી ક્યારો જુઓ</button></p>';$("#flt").innerHTML="";$("#sub").textContent="";return;}
  }
 }

 let r=base;while(r.f&&get(r.f))r=get(r.f);let leaf=0,mx=0;const pos={},all=[];
 (function lay(p,d){const k=kids(p);k.forEach(c=>lay(c,d+1));pos[p.id]=[k.length?(pos[k[0].id][0]+pos[k[k.length-1].id][0])/2:leaf++*W,d*H];mx=Math.max(mx,d);all.push(p)})(r,0);
 SW=Math.max(leaf,1)*W;SH=(mx+1)*H;let sv="",nd="";
 all.forEach(p=>{const[x,y]=pos[p.id];kids(p).forEach(c=>{const[cx,cy]=pos[c.id],a=y+52,b=cy+4,m=(a+b)/2;
  sv+=`<path d="M${x+W/2} ${a}C${x+W/2} ${m},${cx+W/2} ${m},${cx+W/2} ${b}"/>`});
  nd+=`<div class="nd${p.id==D.me?" me":""}" data-s="${p.s}" style="left:${x+W/2}px;top:${y}px" onclick="tap(${p.id})"><i class="r ${ST[p.s][0]}">${esc(p.n[0])}</i><b>${esc(p.n)}</b></div>`});
 stg.style.cssText=`width:${SW}px;height:${SH}px`;stg.innerHTML=`<svg width="${SW}" height="${SH}">${sv}</svg>${nd}`;
 const cn=s=>all.filter(p=>p.s==s).length;
 $("#sub").textContent=`${sideTag}${gu(mx+1)} પેઢી • ${gu(all.length)} સભ્યો`;
 $("#flt").innerHTML=[["all","બધા",all.length],["d","🔴 સ્વર્ગવાસ",cn("d")],["m","🔵 પરિણીત",cn("m")],["u","🟢 અપરિણીત",cn("u")]].map(f=>`<button class="${f[0]==FS?"on":""}" onclick="flt('${f[0]}')">${f[1]} (${gu(f[2])})</button>`).join("");
 flt(FS)}
function flt(s){FS=s;document.querySelectorAll("#flt button").forEach((b,i)=>b.classList.toggle("on",["all","d","m","u"][i]==s));
 document.querySelectorAll(".nd").forEach(n=>n.classList.toggle("dim",s!="all"&&n.dataset.s!=s))}

// --- 3D Parallax Zoom & Double-Tap Fullscreen for Banyan Tree ---
let T={x:0,y:0,z:.8,baseZ:.8},moved=0;const vp=$("#vp"),st=$("#stage"),bg=$("#wadBg");
const apply=()=>{
 st.style.transform=`translate(${T.x}px,${T.y}px) scale(${T.z})`;
 $("#zl").textContent=gu(Math.round(T.z*100))+"%";
 if(bg){
  const rel=T.z/(T.baseZ||0.5);
  const bgScale=Math.min(1.55,Math.max(0.95,1+(rel-1)*0.32));
  const px=Math.max(-35,Math.min(35,(T.x-(vp.clientWidth-SW*T.z)/2)*0.08));
  const py=Math.max(-35,Math.min(35,(T.y-(vp.clientHeight-SH*T.z)/2)*0.08));
  bg.style.transform=`translate3d(${px}px,${py}px,0) scale(${bgScale})`;
 }
};
function zoom(f,cx=vp.clientWidth/2,cy=vp.clientHeight/2){const z=Math.min(1.8,Math.max(.2,T.z*f)),r=z/T.z;T.x=cx-(cx-T.x)*r;T.y=cy-(cy-T.y)*r;T.z=z;apply()}
function fit(){const w=vp.clientWidth,h=vp.clientHeight;T.z=Math.min(1,w/SW,h/SH)*.95;T.baseZ=T.z;T.x=(w-SW*T.z)/2;T.y=Math.max(66,(h-SH*T.z)/2);apply()}

function toggleFull(){
 document.body.classList.toggle("fs-tree");
 setTimeout(fit,60);
 const ts=$("#ts");
 ts.textContent=document.body.classList.contains("fs-tree")?"⛶ ફુલ સ્ક્રીન ચાલુ (ફરી ડબલ-ટેપ કરો)":"⛶ નોર્મલ સ્ક્રીન";
 ts.hidden=false;clearTimeout(soon.t);soon.t=setTimeout(()=>ts.hidden=true,1600);
}

const ptr=new Map();let last=0,lastTapTime=0;
vp.onpointerdown=e=>{ptr.set(e.pointerId,[e.clientX,e.clientY]);moved=0};
vp.onpointermove=e=>{const o=ptr.get(e.pointerId);if(!o)return;ptr.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptr.size==1){T.x+=e.clientX-o[0];T.y+=e.clientY-o[1];moved+=Math.abs(e.clientX-o[0])+Math.abs(e.clientY-o[1]);apply()}
 else if(ptr.size==2){const a=[...ptr.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),r=vp.getBoundingClientRect();
  if(last)zoom(d/last,(a[0][0]+a[1][0])/2-r.left,(a[0][1]+a[1][1])/2-r.top);last=d;moved=99}};
vp.onpointerup=vp.onpointercancel=e=>{
 const wasSingle=(ptr.size===1);
 ptr.delete(e.pointerId);last=0;
 if(wasSingle && moved<8 && !e.target.closest(".nd")){
  const now=Date.now();
  if(now-lastTapTime<320){toggleFull();lastTapTime=0;}
  else{lastTapTime=now;}
 }
};
const tap=id=>{if(moved<8)show(id)};

function tab(t,skipPush=false,targetId=null,side="auto"){
 document.body.classList.remove("fs-tree");
 if(t=="tv"&&!D.me){return empty()}
 if(t=="pf"){return D.me?show(D.me,skipPush):empty()}
 $("#tv").hidden=t!="tv";$("#pf").hidden=t!="pf";
 setNav(t);
 if(t=="tv"){treeTarget=targetId||D.me;treeSide=side;draw(treeTarget,treeSide);fit();if(!skipPush)pushView({v:"tv",id:treeTarget,side:treeSide});}
}

function empty(){$("#tv").hidden=true;$("#pf").hidden=false;
 $("#pf").innerHTML='<div class="pad"><div class="hd"><i class="r big blue">વ</i><h2>વડબૂક</h2><p>તમારા પરિવારનો વડ, તમારા હાથે</p></div><button class="bk" onclick="first()">પ્રોફાઇલ બનાવો</button></div>'}
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
D.me&&get(D.me)?show(D.me):empty();

function soon(){const t=$("#ts");t.textContent="🌿 ટૂંક સમયમાં આવશે";t.hidden=false;clearTimeout(soon.t);soon.t=setTimeout(()=>t.hidden=true,1800)}

// Clean Drawer Menu
function menu(o){const d=$("#dr");if(!o){d.hidden=true;return}
 const me=D.me&&get(D.me);
 $("#dp").innerHTML=me?`<i class="r ${ST[me.s][0]}">${esc(me.n[0])}</i><div><b>${esc(full(me))}</b><small>${[D.ja&&"જાતિ: "+esc(D.ja),me.gam&&"ગામ: "+esc(me.gam)].filter(Boolean).join(" • ")}</small></div>`:"<div><b>વડબૂક</b><small>પ્રોફાઇલ બનાવો</small></div>";
 const it=[
  ["💍","સગાઈ વિભાગ (અપરિણીત યુવાનો)","લીલા સર્કલ 🟢 ધરાવતા સભ્યો","soon()","hl soon"],
  ["🏡","ગામ અને શાખ મુજબ શોધો","બનાસકાંઠાના ગામોની યાદી","soon()","soon"],
  ["📤","મારો વડ શેર કરો","વોટ્સએપ પર પરિવારની લિંક મોકલો","menu(0);shareProfile(D.me)",""],
  ["🛡️","એડમિન પેનલ","નવા સભ્યોની મંજૂરી","soon()","ad soon"]
 ];
 $("#dl").innerHTML=it.map(([i,t,s,a,c])=>`<a class="${c}" onclick="${a}"><span class="ic">${i}</span><div><b>${t}</b><small>${s}</small>${c.includes("soon")?"<em>ટૂંક સમયમાં</em>":""}</div></a>`).join("");
 $("#df").textContent=(D.ja?D.ja+" • ":"")+"Wadbook";d.hidden=false;
 try{history.pushState({menu:1},"");}catch(e){}
}

// ===== તુલસી ક્યારો (માતૃપક્ષ) =====
(function(){
 if(document.getElementById("tk-css"))return;
 const s=document.createElement("style");s.id="tk-css";
 s.textContent=".tk{display:flex;flex-direction:column;align-items:stretch}"
 +".tk-st{width:3px;height:22px;margin:0 auto;background:linear-gradient(#16a34a,#d97706)}"
 +".tk-n{display:flex;align-items:center;gap:12px;background:#fffdf7;border:2px solid #e8d9b8;border-radius:20px;padding:12px 14px;cursor:pointer}"
 +".tk-n b{display:block;color:#6b141a;font-size:16px}"
 +".tk-n small{display:block;color:#7a6a5a;margin-top:2px}"
 +".tk-n span{margin-left:auto;color:#8a2d12;font-weight:700;font-size:14px}"
 +".tk-add{border:2px dashed #16a34a;background:#f0fdf4;color:#166534;border-radius:20px;padding:13px;font:inherit;font-weight:700;font-size:15px}";
 document.head.appendChild(s);
})();

function momOf(p){
 if(!p)return null;
 const dad=p.f&&get(p.f);
 if(dad&&dad.sp&&get(dad.sp))return get(dad.sp);
 return D.ps.find(x=>x.relType=="mom"&&x.relTo==p.id)||null;
}

function showTulsi(id,skipPush=false){
 cur=id;
 const p=get(id);if(!p)return empty();
 const editable=canManage(p);
 const chain=[];let q=momOf(p),guard=0;
 while(q&&guard++<30){chain.push(q);q=momOf(q)}
 const LB=["","માતા","નાની","પરનાની"];
 const lab=i=>LB[i]||(gu(i)+"મી પેઢી ઉપર");
 const node=(q,role)=>`<div class="tk-n" onclick="show(${q.id})"><i class="r ${ST[q.s][0]}">${esc(q.n[0])}</i><div><b>${esc(pre(q)+full(q))}</b><small>${role}${q.yr?" • જન્મ "+gu(q.yr):""}</small></div><span>જુઓ ›</span></div>`;
 const last=chain.length?chain[chain.length-1]:p;
 const parts=[...chain].reverse().map((q,i)=>node(q,lab(chain.length-i)));
 $("#pf").innerHTML=`<div class="pad">
  <div class="hd"><h2>🌿 તુલસી ક્યારો</h2><p>${esc(pre(p)+full(p))} ની માતૃપક્ષ વંશાવળી</p></div>
  <div class="tk">
   ${editable?`<button class="tk-add" onclick="addMember(${last.id},'mom','tulsi')">➕ ${lab(chain.length+1)} ઉમેરો</button>`:""}
   ${parts.map(h=>`${editable?'<div class="tk-st"></div>':""}${h}`).join("")}
   ${parts.length?'<div class="tk-st"></div>':""}${node(p,id==D.me?"તમે":"મુખ્ય સભ્ય")}
  </div>
  <button class="bk" onclick="history.back()">← પાછા જાઓ</button>
 </div>`;
 $("#tv").hidden=true;$("#pf").hidden=false;
 setNav("tul");
 $("#pf").scrollTop=0;
 if(!skipPush)pushView({v:"tul",id});
}
