const $=s=>document.querySelector(s),gu=n=>String(n).replace(/\d/g,d=>"૦૧૨૩૪૫૬૭૮૯"[d]);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="wadbook-v1";let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}
D=D||{ps:[],me:null,ja:"",wadCover:""};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){alert("ફોન સ્ટોરેજ ભરાઈ ગયું છે, થોડા નાના ફોટા રાખો.")}};
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

function canManage(p){
  if(!p || !D.me)return false;
  if(p.id==D.me)return true;
  if(p.createdBy && p.createdBy!=D.me && !p.claimedBy)return false;
  if(p.claimedBy && p.claimedBy!=D.me)return false;
  return true;
}

// --- Native File Input Handler + Interactive Drag & Zoom Photo Cropper ---
function handleFileSelect(inputEl, mode, targetType, targetId){
  const file=inputEl.files && inputEl.files[0];
  inputEl.value="";
  if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image();
    img.onload=()=>{
      openCropModal(img, mode, dataUrl=>{
        if(targetType==="quickAv"){
          const p=get(targetId);if(!p)return;
          p.img=dataUrl;save();show(targetId,true);
          toast("📸 પ્રોફાઇલ ફોટો સેટ થઈ ગયો");
        } else if(targetType==="quickCov"){
          const p=get(targetId);if(!p)return;
          if(targetId==D.me)D.wadCover=dataUrl;
          p.cover=dataUrl;save();show(targetId,true);
          toast("🏞️ વડ / કવર ફોટો સેવ થઈ ગયો");
        } else if(targetType==="quickFam"){
          const p=get(targetId);if(!p)return;
          const {husb,wife}=getNuclearFamily(p);
          p.famImg=dataUrl;
          if(husb)husb.famImg=dataUrl;
          if(wife)wife.famImg=dataUrl;
          save();showFamily(targetId,true);
          toast("👨‍👩‍👧‍👦 પરિવારનો ફોટો સેવ થઈ ગયો");
        } else if(targetType==="formAv"){
          tempImg=dataUrl;
          const box=$("#prevAv");
          if(box)box.innerHTML=avHtml({img:tempImg,n:$("#f_n").value||"વ",s:$("#f_s").value});
          toast("📸 પ્રોફાઇલ ફોટો સેટ થયો — નીચે સાચવો દબાવો");
        } else if(targetType==="formCov"){
          tempCover=dataUrl;
          toast("🏞️ કવર ફોટો સેટ થયો — નીચે સાચવો દબાવો");
        }
      });
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

function openCropModal(img, mode, cb){
  const cm=$("#cropModal");
  const titleMap={
    circle:"📸 પ્રોફાઇલ ફોટો ગોઠવો",
    banner:"🏞️ વડ / કવર ફોટો ગોઠવો",
    family:"👨‍👩‍👧‍👦 પરિવારનો ફોટો ગોઠવો"
  };
  cm.innerHTML=`
    <div class="crop-hd">
      <h3>${titleMap[mode]||"ફોટો ગોઠવો"}</h3>
      <p>આંગળીથી ફોટો ખસેડો અને ઝૂમ કરીને બરાબર સેટ કરો</p>
    </div>
    <div class="crop-stage ${mode}" id="cropBox">
      <img id="cropImg" src="${img.src}" alt="">
    </div>
    <div class="crop-ctrl">
      <div class="crop-zoom-row">
        <span>🔍</span>
        <input type="range" id="cropZoom" min="0.5" max="3.5" step="0.02" value="1">
        <span id="cropPct">૧૦૦%</span>
      </div>
      <div class="crop-btns">
        <button type="button" id="cropCancel">રદ કરો</button>
        <button type="button" class="save-c" id="cropSave">✓ ફોટો સેટ કરો</button>
      </div>
    </div>
  `;
  cm.hidden=false;

  const box=$("#cropBox"), cImg=$("#cropImg"), zInp=$("#cropZoom"), zPct=$("#cropPct");
  const bw=box.clientWidth, bh=box.clientHeight;
  const baseScale=Math.max(bw/img.width, bh/img.height);
  let state={x:0, y:0, z:1};

  const renderCrop=()=>{
    const s=baseScale*state.z;
    const w=img.width*s, h=img.height*s;
    const maxX=Math.max(0,(w-bw)/2), maxY=Math.max(0,(h-bh)/2);
    state.x=Math.max(-maxX, Math.min(maxX, state.x));
    state.y=Math.max(-maxY, Math.min(maxY, state.y));
    cImg.style.width=w+"px";
    cImg.style.height=h+"px";
    cImg.style.transform=`translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px))`;
    zPct.textContent=gu(Math.round(state.z*100))+"%";
  };
  renderCrop();

  zInp.oninput=()=>{state.z=+zInp.value;renderCrop();};

  const pts=new Map(); let lastDist=0;
  box.onpointerdown=e=>{box.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);};
  box.onpointermove=e=>{
    const o=pts.get(e.pointerId);if(!o)return;
    pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===1){
      state.x+=e.clientX-o[0];
      state.y+=e.clientY-o[1];
      renderCrop();
    } else if(pts.size===2){
      const a=[...pts.values()];
      const d=Math.hypot(a[0][0]-a[1][0], a[0][1]-a[1][1]);
      if(lastDist){
        state.z=Math.max(0.5, Math.min(3.5, state.z*(d/lastDist)));
        zInp.value=state.z;
        renderCrop();
      }
      lastDist=d;
    }
  };
  box.onpointerup=box.onpointercancel=e=>{pts.delete(e.pointerId);lastDist=0;};

  $("#cropCancel").onclick=()=>{cm.hidden=true;cm.innerHTML="";};
  $("#cropSave").onclick=()=>{
    const outW=(mode==="circle")?320:820;
    const outH=(mode==="circle")?320:Math.round(outW*(bh/bw));
    const ratio=outW/bw;
    const s=baseScale*state.z*ratio;
    const drawW=img.width*s, drawH=img.height*s;
    const dx=(outW-drawW)/2 + state.x*ratio;
    const dy=(outH-drawH)/2 + state.y*ratio;

    const cv=document.createElement("canvas");
    cv.width=outW;cv.height=outH;
    const ctx=cv.getContext("2d");
    ctx.fillStyle="#1c1917";
    ctx.fillRect(0,0,outW,outH);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    cm.hidden=true;
    cm.innerHTML="";
    cb(cv.toDataURL("image/jpeg",0.82));
  };
}

// Avatar Renderer
function avHtml(p, cls=""){
  const st=ST[p.s]?ST[p.s][0]:"blue";
  const inner=p.img?`<img src="${p.img}" alt="">`:esc((p.n||"?")[0]);
  return `<i class="r ${st} ${cls}">${inner}</i>`;
}

function removeFamilyPhoto(id){
  const p=get(id);
  if(!p || !canManage(p))return;
  if(confirm("પરિવારનો ફોટો હટાવવો છે?")){
    const {husb,wife}=getNuclearFamily(p);
    delete p.famImg;
    if(husb)delete husb.famImg;
    if(wife)delete wife.famImg;
    save();
    showFamily(id,true);
  }
}

function toast(msg){
  const t=$("#ts");
  t.textContent=msg;
  t.hidden=false;
  clearTimeout(soon.t);
  soon.t=setTimeout(()=>t.hidden=true,1900);
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

// --- Block Browser Pinch-Zoom outside Wad Tree (#vp) & Cropper (#cropBox) ---
document.addEventListener("touchmove",e=>{
 if(e.touches.length>1 && !e.target.closest("#vp") && !e.target.closest("#cropBox")){
  e.preventDefault();
 }
},{passive:false});
document.addEventListener("gesturestart",e=>{
 if(!e.target.closest("#vp") && !e.target.closest("#cropBox"))e.preventDefault();
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
 else if(st.v==="sag")showSagai(true);
}
window.addEventListener("popstate",()=>{
 if(!$("#cropModal").hidden){
  $("#cropModal").hidden=true;
  $("#cropModal").innerHTML="";
  if(navStack.length)try{history.pushState(navStack[navStack.length-1],"");}catch(e){}
  return;
 }
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

function full(p,ctx){
 if(!p)return "";
 if(p.g=="F"&&ctx&&ctx.id!=p.id){
  // pita na parivar ma jotaa: potanu naam + pita nu naam
  const dad=p.f&&get(p.f);
  if(dad&&(ctx.id==dad.id||ctx.f==dad.id||(p.m&&ctx.id==p.m)||(dad.sp&&ctx.id==dad.sp)))return p.n+" "+dad.n;
 }
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
  if(p.s=="u")return "કુ. ";
  // pati hayat hoy tyare "અખંડ સૌભાગ્યવતી" -> અં. સૌ.
  return husb?"અં. સૌ. ":"સૌ. ";
 }
 return "શ્રી ";
}

// pita na parivar ma married dikri ni nichhe "પતિ: ..." batavo
function husbNote(q,ctx){
 if(!q||q.g!="F"||q.s=="u"||!ctx||ctx.id==q.id)return "";
 const dad=q.f&&get(q.f);
 if(!dad||!(ctx.id==dad.id||ctx.f==dad.id||(q.m&&ctx.id==q.m)||(dad.sp&&ctx.id==dad.sp)))return "";
 const h=D.ps.find(x=>x.sp==q.id||(q.sp&&x.id==q.sp));
 return h?" • પતિ: "+esc(h.n+(h.ja?" ("+h.ja+")":"")):"";
}

const selOpts=(arr,val)=>`<option value="">-- પસંદ કરો --</option>`+arr.map(x=>`<option value="${esc(x)}" ${val==x?"selected":""}>${esc(x)}</option>`).join("");
const privSel=(id,val)=>Object.entries(PRIV_OPTS).map(([k,v])=>`<option value="${k}" ${val==k?"selected":""}>${v}</option>`).join("");

// --- Comprehensive Smart Profile Form (Clean Light Gujarati Instructional Placeholders - NO personal data) ---
let tempImg=null, tempCover=null;
function openProfileForm(title, v, isRoot, cb){
 const pv=defaultPriv(v);
 const jaVal=(v.ja!==undefined)?v.ja:(isRoot?D.ja:"");
 tempImg=(v.img!==undefined)?v.img:null;
 tempCover=(v.cover!==undefined)?v.cover:(isRoot?D.wadCover:null);

 $("#sh").innerHTML=`<div class="card">
  <h3>${title}</h3>

  <div class="f-sec">📸 પ્રોફાઇલ ફોટો અને વડ / કવર ફોટો</div>
  <div class="photo-edit-row">
    <div id="prevAv">${avHtml({...v,img:tempImg,n:v.n||"વ"})}</div>
    <div class="photo-btns">
      <label class="file-lbl p-pill">📷 પ્રોફાઇલ ફોટો<input type="file" accept="image/*" onchange="handleFileSelect(this,'circle','formAv',0)"></label>
      <label class="file-lbl p-pill">🏞️ કવર / વડ ફોટો<input type="file" accept="image/*" onchange="handleFileSelect(this,'banner','formCov',0)"></label>
      ${tempImg?`<button type="button" class="del-p" onclick="tempImg=null;$('#prevAv').innerHTML=avHtml({n:$('#f_n').value||'વ',s:$('#f_s').value})">✕ ફોટો કાઢો</button>`:""}
    </div>
  </div>

  <div class="f-sec">૧. મૂળભૂત ઓળખ (જાતિ & અટક)</div>
  <div class="g2">
    <label>નામ *<input id="f_n" type="text" value="${esc(v.n||"")}" placeholder="નામ લખો"></label>
    <label>જાતિ / શાખ (નામ સાથે દેખાશે)<input id="f_ja" type="text" value="${esc(jaVal)}" placeholder="જાતિ લખો"></label>
  </div>
  <div class="g2">
    <label>અટક<input id="f_sur" type="text" value="${esc(v.sur||"")}" placeholder="અટક લખો"></label>
    <label>લિંગ<select id="f_g"><option value="M" ${v.g!="F"?"selected":""}>પુરુષ</option><option value="F" ${v.g=="F"?"selected":""}>સ્ત્રી</option></select></label>
  </div>
  <div class="g2">
    <label>સ્થિતિ<select id="f_s" onchange="toggleStatusRows(this.value)">${Object.entries(ST).map(([a,b])=>`<option value="${a}" ${(v.s||"m")==a?"selected":""}>${b[1]}</option>`).join("")}</select></label>
    <label>બ્લડ ગ્રુપ<select id="f_bg">${selOpts(BLOOD,v.bg)}</select></label>
  </div>
  <div class="g2">
    <label>મૂળ વતન - ગામ<input id="f_gam" type="text" value="${esc(v.gam||"")}" placeholder="મૂળ ગામ લખો"></label>
    <label>હાલ રહેઠાણ<input id="f_rah" type="text" value="${esc(v.rah||"")}" placeholder="હાલનું શહેર / ગામ લખો"></label>
  </div>
  <label>સંપર્ક / મોબાઇલ નંબર<input id="f_mob" type="tel" value="${esc(v.mob||"")}" placeholder="મોબાઇલ નંબર લખો"></label>

  <div id="aliveBox" ${v.s=="d"?"hidden":""}>
    <div class="g2">
      <label>ભણતર (હયાત હોય તો)<input id="f_edu" type="text" value="${esc(v.edu||"")}" placeholder="ભણતર લખો"></label>
      <label>નોકરી / ધંધો / વ્યવસાય<input id="f_job" type="text" value="${esc(v.job||"")}" placeholder="નોકરી / ધંધો લખો"></label>
    </div>
  </div>

  <div id="sagaiBox" ${(v.s||"m")=="u"?"":"hidden"}>
    <div class="f-sec" style="background:#dcfce7;color:#14532d;border-color:#22c55e">💍 સગાઈ બાયોડેટા વિગત (અપરિણીત માટે)</div>
    <div class="g2">
      <label>ઊંચાઈ (Height)<input id="f_ht" type="text" value="${esc(v.ht||"")}" placeholder="ઊંચાઈ લખો"></label>
      <label>વજન (Weight)<input id="f_wt" type="text" value="${esc(v.wt||"")}" placeholder="વજન લખો"></label>
    </div>
    <div class="g2">
      <label>વાર્ષિક આવક<input id="f_inc" type="text" value="${esc(v.inc||"")}" placeholder="વાર્ષિક આવક લખો"></label>
      <label>સગાઈ માટે રસ છે?<select id="f_sagaiOpen"><option value="yes" ${(v.sagaiOpen||"yes")=="yes"?"selected":""}>હા, સગાઈ યોગ્ય</option><option value="no" ${v.sagaiOpen=="no"?"selected":""}>હમણાં નહીં</option></select></label>
    </div>
  </div>

  <div class="f-sec">૨. જન્મ તારીખ, ઉંમર અને ગુજરાતી તિથિ</div>
  <div class="g2">
    <label>અંગ્રેજી જન્મ તારીખ<input id="f_dob" type="date" value="${esc(v.dob||"")}" onchange="autoFillYr(this.value)"></label>
    <label>અથવા જન્મ વર્ષ<input id="f_yr" type="number" value="${esc(v.yr||"")}" placeholder="જન્મ વર્ષ લખો"></label>
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

  <div class="f-sec">૩. ત્રણેય કુળ-સંબંધો (ગામ અને જાતિ / અટક)</div>
  <label>A. મોસાળપક્ષ (મારા મામાનું ઘર)<input id="f_mos" type="text" value="${esc(v.mos||"")}" placeholder="માતાના પિયરની જાતિ અને ગામ લખો"></label>
  <label>B. પોહાળપક્ષ (પિતાના મામાનું ઘર)<input id="f_poh" type="text" value="${esc(v.poh||"")}" placeholder="પિતાના મોસાળની જાતિ અને ગામ લખો"></label>
  <label>C. સાસરીપક્ષ (લગ્ન થયા હોય તો સાસરીનું ઘર)<input id="f_sas" type="text" value="${esc(v.sas||"")}" placeholder="સાસરીની જાતિ અને ગામ લખો"></label>

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
   img:tempImg,
   cover:tempCover,
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
   ht:$("#f_ht")?$("#f_ht").value.trim():"",
   wt:$("#f_wt")?$("#f_wt").value.trim():"",
   inc:$("#f_inc")?$("#f_inc").value.trim():"",
   sagaiOpen:$("#f_sagaiOpen")?$("#f_sagaiOpen").value:"yes",
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
 const d=$("#deathBox"), a=$("#aliveBox"), sg=$("#sagaiBox");
 if(d)d.hidden=(val!="d");
 if(a)a.hidden=(val=="d");
 if(sg)sg.hidden=(val!="u");
}
function autoFillYr(dob){
 if(dob && !$("#f_yr").value)$("#f_yr").value=dob.slice(0,4);
}
const shut=()=>{$("#sh").hidden=true};

function first(){
 openProfileForm("તમારી પ્રોફાઇલ બનાવો",{s:"m",g:"M"},true,o=>{
  D={ps:[{id:1,f:null,...o}],me:1,ja:o.ja,wadCover:o.cover||""};
  save();shut();navStack=[];show(1);
 });
}

function edit(id){
 const p=get(id);
 if(!canManage(p)){alert("તમે આ પ્રોફાઇલ એડિટ ન કરી શકો");return;}
 openProfileForm("✏️ વિગત ફેરવો",p,id==D.me,o=>{
  Object.assign(p,o);
  if(id==D.me){
   if(o.ja)D.ja=o.ja;
   if(o.cover)D.wadCover=o.cover;
  }
  save();shut();show(id,true);
  if(!$("#tv").hidden)draw(treeTarget,treeSide);
 });
}

function togglePiyarBox(){
 const b=$("#piyarBox");if(!b)return;
 b.hidden=!(b.dataset.ok=="1"&&["dad","mom","bro","sis"].includes($("#f_rel").value));
}

function addMember(pid,defaultRel="son",returnToFamily=false){
 const p=get(pid);
 // parnelī stri (pati ni profile sathe joDayeli) potana piyar na sagā umere to pati na parivar ni mahiti na aave
 const isMarriedIn=!!(p.g=="F"&&p.sp&&get(p.sp));
 const fatherId=(p.g=="F"&&p.sp&&get(p.sp))?p.sp:pid;
 const father=get(fatherId)||p;
 const defStatus=(defaultRel=="wife"||defaultRel=="husb"||defaultRel=="mom")?"m":"u";

 $("#sh").innerHTML=`<div class="card"><h3>➕ નામ ઉમેરો (${esc(p.n)})</h3>
  <label>સંબંધ પસંદ કરો<select id="f_rel" onchange="togglePiyarBox()">${Object.entries(RELS).map(([a,b])=>`<option value="${a}" ${defaultRel==a?"selected":""}>${b}</option>`).join("")}</select></label>
  <label>નામ *<input id="f_n" type="text" placeholder="નામ લખો"></label>
  <div id="piyarBox" data-ok="${isMarriedIn?1:0}" ${(isMarriedIn&&["dad","mom","bro","sis"].includes(defaultRel))?"":"hidden"}>
    <div class="g2">
      <label>અટક<input id="f_sur2" type="text" placeholder="અટક લખો"></label>
      <label>જાતિ / શાખ<input id="f_ja2" type="text" placeholder="જાતિ લખો"></label>
    </div>
    <label>મૂળ ગામ<input id="f_gam2" type="text" placeholder="મૂળ ગામ લખો"></label>
  </div>
  <div class="g2">
    <label>જન્મ તારીખ<input id="f_dob" type="date" onchange="if(this.value&&!$('#f_yr').value)$('#f_yr').value=this.value.slice(0,4)"></label>
    <label>અથવા જન્મ વર્ષ<input id="f_yr" type="number" placeholder="જન્મ વર્ષ લખો"></label>
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
  const piyarRel=isMarriedIn&&(r=="dad"||r=="mom"||r=="bro"||r=="sis");
  let mJa=same?(father.ja||D.ja||""):"",mSur=same?(father.sur||""):"",mGam=same?(father.gam||""):"";
  if(piyarRel){
   mJa=$("#f_ja2").value.trim();mSur=$("#f_sur2").value.trim();mGam=$("#f_gam2").value.trim();
   if((r=="bro"||r=="sis")&&p.f&&get(p.f)){const pf=get(p.f);mJa=mJa||pf.ja||"";mSur=mSur||pf.sur||"";mGam=mGam||pf.gam||"";}
  }
  const m={id,f:null,g,n,dob,yr,s,sagaiOpen:"yes",createdBy:D.me,ja:mJa,sur:mSur,gam:mGam,relTo:(r=="mom"||r=="dad"||r=="bro"||r=="sis")?pid:fatherId,relType:r};
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
      D.ps.push({id:fid,f:null,g:"M",n:"પિતા",s:"d",createdBy:D.me,ja:piyarRel?mJa:(p.ja||D.ja||""),sur:piyarRel?mSur:(p.sur||""),gam:piyarRel?mGam:(p.gam||"")});
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
 const famPhoto=p.famImg || (husb&&husb.famImg) || (wife&&wife.famImg) || "";

 const node=(q,role)=>`
   <div class="par-node" onclick="show(${q.id})">
     ${avHtml(q)}
     <b>${esc(pre(q)+q.n)}</b>
     <small>${role}${q.yr?" • "+gu(q.yr):""}</small>
   </div>`;

 const rowCard=(q,rel)=>`
   <div class="fm">
     <div onclick="show(${q.id})">${avHtml(q)}</div>
     <div onclick="show(${q.id})">
       <b>${esc(pre(q)+full(q,p))}</b>
       <small>${rel}${husbNote(q,p)}${q.yr?" • જન્મ "+gu(q.yr):""}</small>
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

 const famPhotoHtml=famPhoto
   ? `<div class="fam-photo-box">
        <img src="${famPhoto}" alt="પરિવાર ફોટો">
        <div class="fam-photo-bar">
          <span>👨‍👩‍👧‍👦 ${esc(pre(mainPerson)+full(mainPerson))} પરિવાર</span>
          ${editable?`<div><label class="file-lbl mini-btn">📸 બદલો<input type="file" accept="image/*" onchange="handleFileSelect(this,'family','quickFam',${id})"></label> <button class="mini-btn" onclick="removeFamilyPhoto(${id})">✕</button></div>`:""}
        </div>
      </div>`
   : (editable?`<label class="file-lbl fam-photo-add">📸 ઘર-પરિવારનો ગ્રુપ ફોટો ઉમેરો<input type="file" accept="image/*" onchange="handleFileSelect(this,'family','quickFam',${id})"></label>`:"");

 $("#pf").innerHTML=`<div class="pad">
  <div class="hd">
    <h2>👨‍👩‍👧‍👦 ${isSelf?"મારો પરિવાર":"તેમનો પરિવાર"}</h2>
    <p>${esc(pre(mainPerson)+full(mainPerson))} નો ઘર-પરિવાર</p>
  </div>

  ${famPhotoHtml}

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

// ===== સ્માર્ટ સગાઈ બાયોડેટા વિભાગ =====
let sagFilter="all", sagSearch="";

// Potana vad (pitrupaksh kul) ma aavta badha sabhya: topmost pita thi niche na badha dikra-dikri (patilineal)
function myVadIds(){
 try{
  const me=D.me&&get(D.me);
  if(!me)return null;
  // 1) topmost pita sudhi upar jao
  let root=me,guard=0;
  while(root.f&&get(root.f)&&guard++<50)root=get(root.f);
  // 2) root thi niche badha dikra-dikri (f link thi)
  const ids=new Set([root.id]);
  const meJa=me.ja||D.ja||"";
  let grew=true;
  while(grew){
   grew=false;
   const wives=new Set(D.ps.filter(x=>x.sp&&ids.has(x.sp)&&!ids.has(x.id)).map(x=>x.id));
   D.ps.forEach(p=>{
    if(ids.has(p.id))return;
    if(!((p.f&&ids.has(p.f))||(!p.f&&p.m&&wives.has(p.m))))return;
    // bija shakh ni vyakti hoy to bahar
    const pj=p.ja||D.ja||"";
    if(pj&&meJa&&pj!==meJa)return;
    ids.add(p.id);grew=true;
   });
  }
  return ids;
 }catch(e){return null;}
}

function showSagai(skipPush=false){
 const vad=myVadIds();
 const list=D.ps.filter(p=>p.s==="u" && p.sagaiOpen!=="no" && (!vad || vad.has(p.id)));
 const filtered=list.filter(p=>{
  if(sagFilter==="M" && p.g==="F")return false;
  if(sagFilter==="F" && p.g!=="F")return false;
  if(sagSearch){
   const q=sagSearch.toLowerCase();
   const blob=[p.n,p.ja,p.sur,p.gam,p.rah,p.edu,p.job,p.mos,p.poh].filter(Boolean).join(" ").toLowerCase();
   if(!blob.includes(q))return false;
  }
  return true;
 }).sort((a,b)=>(a.yr||9999)-(b.yr||9999));

 const mCount=list.filter(p=>p.g!=="F").length;
 const fCount=list.filter(p=>p.g==="F").length;

 const cardsHtml=filtered.length ? filtered.map(p=>{
  const age=calcAge(p.dob,p.yr);
  const shakh=p.ja||D.ja||p.sur||"";
  return `<div class="sag-card">
    <div class="sag-top" onclick="show(${p.id})">
      ${avHtml(p)}
      <div class="sag-info">
        <b>${esc(pre(p)+full(p))}${shakh?" "+esc(shakh):""}</b>
        <small>${p.gam?"વતન: "+esc(p.gam):""}${p.rah?" • હાલ: "+esc(p.rah):""}</small>
      </div>
    </div>
    <div class="sag-tags">
      ${age!==null?`<span class="gr-tag">🎂 ઉંમર: ${gu(age)} વર્ષ</span>`:(p.yr?`<span class="gr-tag">🎂 જન્મ: ${gu(p.yr)}</span>`:"")}
      ${p.edu?`<span>🎓 ${esc(p.edu)}</span>`:""}
      ${p.job?`<span>💼 ${esc(p.job)}</span>`:""}
      ${p.ht?`<span>📏 ${esc(p.ht)}</span>`:""}
      ${p.mos?`<span>🌾 મોસાળ: ${esc(p.mos)}</span>`:""}
    </div>
    <div class="sag-btns">
      <button class="bio-btn" onclick="openBiodata(${p.id})">📋 સગાઈ બાયોડેટા</button>
      <button onclick="show(${p.id})">👤 પ્રોફાઇલ જુઓ</button>
    </div>
  </div>`;
 }).join("") : `<div class="priv-note">🟢 તમારા વડમાં અત્યારે કોઈ અપરિણીત સભ્ય મળ્યા નથી.<br><small>પ્રોફાઇલ કે "+ નામ ઉમેરો" માં સ્થિતિ <b>"અપરિણીત"</b> રાખવાથી નામ અહીં આપમેળે દેખાશે.</small></div>`;

 $("#pf").innerHTML=`<div class="pad">
  <div class="hd">
    <h2>💍 સગાઈ બાયોડેટા વિભાગ</h2>
    <p>તમારા વડ (${esc(D.ja||"")} પરિવાર) ના અપરિણીત દીકરા-દીકરીઓ</p>
  </div>

  <div class="sag-tabs">
    <button class="${sagFilter==="all"?"on":""}" onclick="sagFilter='all';showSagai(true)">બધા (${gu(list.length)})</button>
    <button class="${sagFilter==="M"?"on":""}" onclick="sagFilter='M';showSagai(true)">👦 યુવાનો (${gu(mCount)})</button>
    <button class="${sagFilter==="F"?"on":""}" onclick="sagFilter='F';showSagai(true)">👧 યુવતીઓ (${gu(fCount)})</button>
  </div>

  <input class="sag-search" type="search" value="${esc(sagSearch)}" placeholder="🔍 નામ, ગામ, શાખ, ભણતર કે વ્યવસાયથી શોધો..." oninput="sagSearch=this.value;showSagai(true)">

  ${cardsHtml}
 </div>`;

 $("#tv").hidden=true;$("#pf").hidden=false;
 setNav("sag");
 if(!skipPush)pushView({v:"sag"});
}

// Royal Shareable Biodata Card Modal
function openBiodata(id){
 const p=get(id);if(!p)return;
 const editable=canManage(p);
 const pv=defaultPriv(p);
 const canSee=k=>(editable || pv[k]!=="me");

 const shakh=p.ja||D.ja||p.sur||"";
 const age=calcAge(p.dob,p.yr);
 const dobStr=fmtDate(p.dob,p.yr);
 const ageStr=dobStr ? (dobStr + (age!==null?` (${gu(age)} વર્ષ)`:"")) : "";
 const dad=(p.f&&get(p.f))?get(p.f):null;
 const mom=momOf(p);

 const bRow=(lbl,val,fullW=false)=>val?`<div class="${fullW?"full-b":""}"><span>${lbl}:</span> <b>${val}</b></div>`:"";

 $("#sh").innerHTML=`<div class="card">
  <div class="bio-sheet" id="biodataCard">
    <div class="bio-ganesh">॥ શ્રી ગણેશાય નમઃ • Wadbook સગાઈ બાયોડેટા ॥</div><br>
    ${avHtml(p,"big")}
    <h4>${esc(pre(p)+full(p))}${shakh?" "+esc(shakh):""}</h4>
    <p class="sub-b">${[p.sur?"અટક: "+esc(p.sur):"", p.gam?"મૂળ વતન: "+esc(p.gam):""].filter(Boolean).join(" • ")}</p>

    <div class="bio-grid">
      ${canSee("dob")?bRow("જન્મ તારીખ",ageStr):""}
      ${canSee("dob")?bRow("જન્મ તિથિ",esc(fmtTithi(p.gm,p.gp,p.gt))):""}
      ${bRow("ઊંચાઈ / વજન",esc([p.ht,p.wt].filter(Boolean).join(" • ")))}
      ${bRow("બ્લડ ગ્રુપ",esc(p.bg))}
      ${bRow("ભણતર",esc(p.edu))}
      ${bRow("વ્યવસાય",esc(p.job))}
      ${bRow("વાર્ષિક આવક",esc(p.inc))}
      ${bRow("હાલ રહેઠાણ",esc(p.rah))}
      ${dad?bRow("પિતાનું નામ",esc(pre(dad)+full(dad)),true):""}
      ${mom?bRow("માતાનું નામ",esc(pre(mom)+full(mom)),true):""}
      ${canSee("kul")?bRow("મોસાળપક્ષ",esc(p.mos),true):""}
      ${canSee("kul")?bRow("પોહાળપક્ષ",esc(p.poh),true):""}
      ${(p.mob&&canSee("mob"))?bRow("સંપર્ક નંબર",esc(p.mob),true):""}
    </div>
  </div>

  <div class="bt" style="margin-top:14px">
    <button onclick="shut()">બંધ કરો</button>
    <button class="pr" onclick="shareBiodataCard(${id})">📤 બાયોડેટા કાર્ડ શેર કરો</button>
  </div>
 </div>`;

 $("#sh").hidden=false;
 try{history.pushState({modal:1},"");}catch(e){}
}

// Generate HD Image of Biodata Card and Share via WhatsApp / Native Share
function shareBiodataCard(id){
 const p=get(id);if(!p)return;
 const shakh=p.ja||D.ja||p.sur||"";
 const age=calcAge(p.dob,p.yr);
 const dobStr=fmtDate(p.dob,p.yr);
 const dad=(p.f&&get(p.f))?get(p.f):null;
 const mom=momOf(p);
 const pv=defaultPriv(p);
 const editable=canManage(p);
 const canSee=k=>(editable || pv[k]!=="me");

 const lines=[
  `॥ શ્રી ગણેશાય નમઃ ॥`,
  `💍 *સગાઈ બાયોડેટા (Wadbook)*`,
  `━━━━━━━━━━━━━━`,
  `👤 *નામ:* ${pre(p)+full(p)} ${shakh}`,
  p.sur?`🏷️ *અટક:* ${p.sur}`:"",
  (dobStr&&canSee("dob"))?`🎂 *જન્મ:* ${dobStr}${age!==null?` (${gu(age)} વર્ષ)`:""}`:"",
  p.ht?`📏 *ઊંચાઈ:* ${p.ht}${p.wt?" | વજન: "+p.wt:""}`:"",
  p.bg?`🩸 *બ્લડ ગ્રુપ:* ${p.bg}`:"",
  p.edu?`🎓 *ભણતર:* ${p.edu}`:"",
  p.job?`💼 *વ્યવસાય:* ${p.job}`:"",
  p.inc?`💰 *આવક:* ${p.inc}`:"",
  p.gam?`🏡 *મૂળ વતન:* ${p.gam}`:"",
  p.rah?`📍 *હાલ રહેઠાણ:* ${p.rah}`:"",
  dad?`👨 *પિતા:* ${pre(dad)+full(dad)}`:"",
  mom?`👩 *માતા:* ${pre(mom)+full(mom)}`:"",
  (p.mos&&canSee("kul"))?`🌾 *મોસાળપક્ષ:* ${p.mos}`:"",
  (p.poh&&canSee("kul"))?`🌿 *પોહાળપક્ષ:* ${p.poh}`:"",
  (p.mob&&canSee("mob"))?`📞 *સંપર્ક:* ${p.mob}`:"",
  `━━━━━━━━━━━━━━`,
  `🌳 *શ્રી બનાસકાંઠા ગુર્જર પ્રજાપતિ સમાજ • Wadbook*`
 ].filter(Boolean).join("\n");

 const cv=document.createElement("canvas");
 cv.width=720; cv.height=960;
 const ctx=cv.getContext("2d");

 const grad=ctx.createLinearGradient(0,0,0,960);
 grad.addColorStop(0,"#fffbeb");
 grad.addColorStop(1,"#fef3c7");
 ctx.fillStyle=grad;
 ctx.fillRect(0,0,720,960);

 ctx.strokeStyle="#d97706";
 ctx.lineWidth=12;
 ctx.strokeRect(18,18,684,924);
 ctx.strokeStyle="#6b141a";
 ctx.lineWidth=3;
 ctx.strokeRect(30,30,660,900);

 ctx.fillStyle="#6b141a";
 ctx.fillRect(30,30,660,86);
 ctx.fillStyle="#fde68a";
 ctx.font="bold 24px sans-serif";
 ctx.textAlign="center";
 ctx.fillText("॥ શ્રી ગણેશાય નમઃ ॥", 360, 68);
 ctx.fillStyle="#ffffff";
 ctx.font="bold 20px sans-serif";
 ctx.fillText("શ્રી બનાસકાંઠા ગુર્જર પ્રજાપતિ સમાજ • સગાઈ બાયોડેટા", 360, 100);

 const finishShare=()=>{
  ctx.fillStyle="#3b0a0e";
  ctx.font="bold 34px sans-serif";
  ctx.textAlign="center";
  ctx.fillText(`${pre(p)+full(p)} ${shakh}`.trim(), 360, 325);

  ctx.fillStyle="#9a3412";
  ctx.font="bold 22px sans-serif";
  ctx.fillText([p.sur?"અટક: "+p.sur:"", p.gam?"વતન: "+p.gam:""].filter(Boolean).join("  •  "), 360, 362);

  ctx.fillStyle="rgba(255,255,255,0.92)";
  ctx.fillRect(60,390,600,480);
  ctx.strokeStyle="#f59e0b";
  ctx.lineWidth=2;
  ctx.strokeRect(60,390,600,480);

  const rows=[
   ["જન્મ તારીખ", (dobStr&&canSee("dob"))?`${dobStr}${age!==null?` (${gu(age)} વર્ષ)`:""}`:""],
   ["જન્મ તિથિ", canSee("dob")?fmtTithi(p.gm,p.gp,p.gt):""],
   ["ઊંચાઈ / વજન", [p.ht,p.wt].filter(Boolean).join(" • ")],
   ["બ્લડ ગ્રુપ", p.bg],
   ["ભણતર", p.edu],
   ["વ્યવસાય", p.job],
   ["વાર્ષિક આવક", p.inc],
   ["હાલ રહેઠાણ", p.rah],
   ["પિતાનું નામ", dad?pre(dad)+full(dad):""],
   ["માતાનું નામ", mom?pre(mom)+full(mom):""],
   ["મોસાળપક્ષ", canSee("kul")?p.mos:""],
   ["પોહાળપક્ષ", canSee("kul")?p.poh:""],
   ["સંપર્ક નંબર", (p.mob&&canSee("mob"))?p.mob:""]
  ].filter(r=>r[1]);

  ctx.textAlign="left";
  let y=432;
  rows.slice(0,11).forEach(([k,v])=>{
   ctx.fillStyle="#78716c";
   ctx.font="bold 20px sans-serif";
   ctx.fillText(k+" :", 85, y);
   ctx.fillStyle="#1c1917";
   ctx.font="bold 21px sans-serif";
   ctx.fillText(String(v).slice(0,34), 265, y);
   y+=39;
  });

  ctx.fillStyle="#6b141a";
  ctx.font="bold 19px sans-serif";
  ctx.textAlign="center";
  ctx.fillText("🌳 Wadbook પરિવાર એપ દ્વારા બનાવેલ બાયોડેટા", 360, 910);

  cv.toBlob(blob=>{
   if(blob && navigator.canShare){
    const file=new File([blob], `${p.n}_biodata.jpg`, {type:"image/jpeg"});
    if(navigator.canShare({files:[file]})){
     navigator.share({files:[file], title:"સગાઈ બાયોડેટા", text:lines}).catch(()=>{});
     return;
    }
   }
   if(navigator.share){
    navigator.share({title:"સગાઈ બાયોડેટા", text:lines}).catch(()=>{});
   } else {
    alert(lines);
   }
  },"image/jpeg",0.9);
 };

 ctx.save();
 ctx.beginPath();
 ctx.arc(360, 205, 72, 0, Math.PI*2);
 ctx.closePath();
 ctx.clip();
 if(p.img){
  const im=new Image();
  im.onload=()=>{
   ctx.drawImage(im, 288, 133, 144, 144);
   ctx.restore();
   ctx.beginPath();ctx.arc(360,205,72,0,Math.PI*2);ctx.strokeStyle="#22c55e";ctx.lineWidth=6;ctx.stroke();
   finishShare();
  };
  im.src=p.img;
 } else {
  ctx.fillStyle="#15803d";
  ctx.fillRect(288,133,144,144);
  ctx.restore();
  ctx.beginPath();ctx.arc(360,205,72,0,Math.PI*2);ctx.strokeStyle="#22c55e";ctx.lineWidth=6;ctx.stroke();
  ctx.fillStyle="#fff";
  ctx.font="bold 62px sans-serif";
  ctx.textAlign="center";
  ctx.fillText((p.n||"?")[0], 360, 226);
  finishShare();
 }
}

function show(id,skipPush=false){
 cur=id;const p=get(id);if(!p)return empty();
 const isSelf=(id==D.me);
 const editable=canManage(p);
 const[c,t]=ST[p.s],[g,n,u]=vs(p),fam=getFamilyList(p);
 const pv=defaultPriv(p);
 const canSee=k=>(editable || pv[k]!=="me");

 // 1. Name Heading uses Jati/Shakha
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
 const card=(q,rel)=>`<a class="fm" onclick="show(${q.id})">${avHtml(q)}<div><b>${esc(pre(q)+full(q,p))}</b><small>${rel}${husbNote(q,p)}${q.yr?" • જન્મ "+gu(q.yr):""}</small></div><span>જુઓ ›</span></a>`;

 // Action Buttons
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
    ${p.s==="u"?`<button class="gr-btn" onclick="openBiodata(${id})">💍 સગાઈ બાયોડેટા</button>`:`<button onclick="shareProfile(${id})">📤 શેર કરો</button>`}
    ${editable?`<button onclick="addMember(${id})">➕ નામ ઉમેરો</button><button onclick="edit(${id})">✏️ વિગત ફેરવો</button>`:""}
  </div>`;
 }

 // Big Avatar & Cover Banner
 const bigRingStyle=p.img?"background:#fff":((p.s=="d")?"background:#b91c1c;border-color:#ef4444;color:#fff":(p.s=="u"?"background:#15803d;border-color:#22c55e;color:#fff":""));
 const bigAvInner=p.img?`<img src="${p.img}" alt="">`:esc(p.n[0]);
 const coverUrl=p.cover || (isSelf?D.wadCover:"");
 const coverStyle=coverUrl?`style="background-image:url('${coverUrl}')"`:``;

 const memorialNote=(p.s=="d")?`<p style="text-align:center;margin:2px 0 8px"><span style="display:inline-block;background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:99px;padding:3px 12px;font-size:12px;font-weight:800">🕊️ સ્મૃતિ પ્રોફાઇલ • વંશાવળી જોડાણ માટે</span></p>`:"";

 const infoRows=[
  canSee("dob") ? rw("જન્મ તારીખ", birthFull) : "",
  canSee("dob") ? rw("જન્મ તિથિ", esc(gujBirth)) : "",
  (p.s=="d" && deathFull) ? rw("મરણ તારીખ", deathFull) : "",
  (p.s=="d" && gujDeath) ? rw("પુણ્યતિથિ", esc(gujDeath)) : "",
  rw("બ્લડ ગ્રુપ", esc(p.bg)),
  (p.s!="d") ? rw("ભણતર", esc(p.edu)) : "",
  (p.s!="d") ? rw("વ્યવસાય", esc(p.job)) : "",
  (p.s=="u" && (p.ht||p.wt)) ? rw("ઊંચાઈ / વજન", esc([p.ht,p.wt].filter(Boolean).join(" • "))) : "",
  (p.s=="u" && p.inc) ? rw("વાર્ષિક આવક", esc(p.inc)) : "",
  (p.g=="F"&&p.f&&get(p.f)&&canSee("kul")) ? rw("પિયર (પિતાનું ઘર)", esc(pre(get(p.f))+full(get(p.f))+(get(p.f).ja?" ("+get(p.f).ja+")":"")), true) : "",
  canSee("kul") ? rw("મોસાળપક્ષ", esc(p.mos), true) : "",
  canSee("kul") ? rw("પોહાળપક્ષ", esc(p.poh), true) : "",
  canSee("kul") ? rw("સાસરીપક્ષ", esc(p.sas), true) : ""
 ].filter(Boolean).join("");

 const avBlock=editable
   ? `<label class="file-lbl av-wrap">
        <i class="r big ${c}" style="${bigRingStyle}">${bigAvInner}</i>
        <span class="cam-badge">📷</span>
        <input type="file" accept="image/*" onchange="handleFileSelect(this,'circle','quickAv',${id})">
      </label>`
   : `<div class="av-wrap"><i class="r big ${c}" style="${bigRingStyle}">${bigAvInner}</i></div>`;

 $("#pf").innerHTML=`<div class="cv" ${coverStyle}>
   ${editable?`<label class="file-lbl cv-btn">🏞️ ${coverUrl?"કવર બદલો":"વડ / કવર ફોટો"}<input type="file" accept="image/*" onchange="handleFileSelect(this,'banner','quickCov',${id})"></label>`:""}
 </div>
 <div class="pr">
 ${avBlock}
 <h2>${esc(pre(p)+full(p))}${titleSuffix?" "+esc(titleSuffix):""}</h2>
 ${memorialNote}
 ${line1?`<p class="ln">${line1}</p>`:""}
 ${line2?`<p class="bio">${line2}</p>`:""}
 ${p.bio?`<div class="bio-box">“${esc(p.bio)}”</div>`:""}
 <div class="st"><div><b>${gu(g)} પેઢી</b><small>${isSelf?"મારો વડ 🌳":(hasSasri?"સાસરી વડ 🌳":(p.g=="F"?"પિયર વડ 🌳":"તેમનો વડ 🌳"))}</small></div><div><b>${gu(n)} સભ્યો</b><small>કુલ પરિવાર</small></div><div class="gr" onclick="showSagai()"><b>${gu(u)} અપરિણીત</b><small>સગાઈ યોગ્ય ›</small></div></div>
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
  nd+=`<div class="nd${p.id==D.me?" me":""}" data-s="${p.s}" style="left:${x+W/2}px;top:${y}px" onclick="tap(${p.id})">${avHtml(p)}<b>${esc(p.n)}</b></div>`});
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
 toast(document.body.classList.contains("fs-tree")?"⛶ ફુલ સ્ક્રીન ચાલુ (ફરી ડબલ-ટેપ કરો)":"⛶ નોર્મલ સ્ક્રીન");
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

// directory.html thi aavta link: index.html?view=tree|profile&member=ID
(function(){
 try{
  const q=new URLSearchParams(location.search),v=q.get("view"),m=q.get("member");
  if(v&&m&&get(m)){
   if(v==="tree")tab("tv",true,get(m).id);else show(get(m).id,true);
   history.replaceState(null,"",location.pathname);
  }
 }catch(e){}
})();

function soon(){toast("🌿 ટૂંક સમયમાં આવશે")}

// Clean Drawer Menu
function menu(o){const d=$("#dr");if(!o){d.hidden=true;return}
 const me=D.me&&get(D.me);
 $("#dp").innerHTML=me?`${avHtml(me)}<div><b>${esc(full(me))}</b><small>${[D.ja&&"જાતિ: "+esc(D.ja),me.gam&&"ગામ: "+esc(me.gam)].filter(Boolean).join(" • ")}</small></div>`:"<div><b>વડબૂક</b><small>પ્રોફાઇલ બનાવો</small></div>";
 const it=[
  ["💍","સગાઈ વિભાગ (અપરિણીત યુવાનો)","લીલા સર્કલ 🟢 ધરાવતા સભ્યો","menu(0);showSagai()","hl"],
  ["🏡","ગામ અને શાખ મુજબ શોધો","બનાસકાંઠાના ગામોની યાદી","location.href='directory.html'",""],
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
 const node=(q,role)=>`<div class="tk-n" onclick="show(${q.id})">${avHtml(q)}<div><b>${esc(pre(q)+full(q))}</b><small>${role}${q.yr?" • જન્મ "+gu(q.yr):""}</small></div><span>જુઓ ›</span></div>`;
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
