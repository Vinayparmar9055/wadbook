const $=s=>document.querySelector(s),gu=n=>String(n).replace(/\d/g,d=>"૦૧૨૩૪૫૬૭૮૯"[d]);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="wadbook-v1";let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}
D=D||{ps:[],me:null,ja:""};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
const ST={d:["red","સ્વર્ગવાસ"],m:["blue","પરિણીત"],u:["green","અપરિણીત"]};
const get=id=>D.ps.find(p=>p.id==id),nid=()=>Math.max(0,...D.ps.map(p=>p.id))+1;
const kids=p=>D.ps.filter(c=>c.f==p.id&&c.g!="F").sort((a,b)=>(a.yr||9999)-(b.yr||9999));

const FD={n:["નામ","text"],yr:["જન્મ વર્ષ (દા.ત. 1983)","number"],s:["સ્થિતિ","sel"],g:["લિંગ","gen"],sur:["અટક","text"],ja:["જાતિ / શાખ","text"],gam:["મૂળ ગામ","text"],rah:["રહેઠાણ","text"],edu:["ભણતર","text"],job:["વ્યવસાય","text"],rel:["સંબંધ પસંદ કરો","rel"]};
const RELS={dad:"પિતા",mom:"માતા",bro:"ભાઈ",sis:"બહેન",wife:"પત્ની",son:"દીકરો",dau:"દીકરી"};

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
 if(last && last.v===state.v && last.id===state.id)return;
 navStack.push(state);
 try{history.pushState(state,"");}catch(e){}
}
function renderState(st){
 if(!st){D.me&&get(D.me)?show(D.me,true):empty();return;}
 if(st.v==="pf")show(st.id,true);
 else if(st.v==="fam")showFamily(st.id,true);
 else if(st.v==="tv")tab("tv",true);
 else if(st.v==="tul")showTulsi(st.id,true);
}
window.addEventListener("popstate",()=>{
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

// Naam agal prefix: સ્વ. / ગં.સ્વ. / સૌ. / કુ. / શ્રી
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

function form(t,keys,v,cb){
 $("#sh").innerHTML=`<div class="card"><h3>${t}</h3>${keys.map(k=>{const[l,ty]=FD[k],x=v[k]??"";
  if(ty=="sel")return `<label>${l}<select id="f_${k}">${Object.entries(ST).map(([a,b])=>`<option value="${a}" ${x==a?"selected":""}>${b[1]}</option>`).join("")}</select></label>`;
  if(ty=="gen")return `<label>${l}<select id="f_g"><option value="M">પુરુષ</option><option value="F" ${x=="F"?"selected":""}>સ્ત્રી</option></select></label>`;
  if(ty=="rel")return `<label>${l}<select id="f_rel">${Object.entries(RELS).map(([a,b])=>`<option value="${a}" ${x==a?"selected":""}>${b}</option>`).join("")}</select></label>`;
  return `<label>${l}<input id="f_${k}" type="${ty}" value="${esc(x)}"></label>`}).join("")}
 <div class="bt"><button onclick="shut()">રદ કરો</button><button class="pr" id="ok">સાચવો</button></div></div>`;
 $("#sh").hidden=false;
 try{history.pushState({modal:1},"");}catch(e){}
 let busy=false;
 $("#ok").onclick=()=>{
  if(busy)return;
  const o={};keys.forEach(k=>o[k]=$("#f_"+k).value.trim());
  if(!o.n){alert("નામ લખો");return}
  if("yr"in o)o.yr=o.yr?+o.yr:"";
  busy=true;$("#ok").disabled=true;
  const ok=cb(o);
  if(ok===false){busy=false;$("#ok").disabled=false;}
 }}
const shut=()=>{$("#sh").hidden=true};

function first(){form("તમારી પ્રોફાઇલ બનાવો",["n","sur","g","ja","gam","rah","edu","job","yr","s"],{s:"m"},o=>{
 D={ps:[{id:1,f:null,...o}],me:1,ja:o.ja};save();shut();navStack=[];show(1)})}

function addMember(pid,defaultRel="son",returnToFamily=false){
 const p=get(pid);
 const fatherId=(p.g=="F"&&p.sp&&get(p.sp))?p.sp:pid;
 const father=get(fatherId)||p;

 form("➕ નામ ઉમેરો",["rel","n","yr","s"],{rel:defaultRel,s:defaultRel=="wife"?"m":"u"},o=>{
  const id=nid(),r=o.rel;
  const g=(r=="mom"||r=="sis"||r=="wife"||r=="dau")?"F":"M";

  if(r=="son"||r=="dau"){
   const dup=D.ps.find(x=>x.f===fatherId && x.n===o.n && (x.yr||"")===(o.yr||"") && x.g===g);
   if(dup){alert("આ બાળકનું નામ પરિવારમાં પહેલેથી ઉમેરેલું છે!");return false;}
  } else {
   const dup=D.ps.find(x=>x.n===o.n && (x.yr||"")===(o.yr||"") && x.g===g && x.relTo===pid && x.relType===r);
   if(dup){alert("આ નામ પહેલેથી ઉમેરેલું છે!");return false;}
  }

  // અટક અને ગામ: પોતાના કુટુંબના સભ્યોને સરખા, બીજા (માતા/પત્ની) માટે ખાલી
  const same=(r=="son"||r=="dau"||r=="bro"||r=="sis"||r=="dad");
  const m={id,f:null,g,n:o.n,yr:o.yr,s:o.s,sur:same?(father.sur||""):"",gam:same?(father.gam||""):"",relTo:(r=="mom"||r=="dad"||r=="bro"||r=="sis")?pid:fatherId,relType:r};
  if(r=="dad"){
    if(p.f&&get(p.f)){alert("પિતા પહેલેથી ઉમેરેલા છે");return false;}
    D.ps.push(m);p.f=id;
    const exMom=D.ps.find(x=>x.relType=="mom"&&(x.relTo==pid||x.relTo==fatherId));
    if(exMom){exMom.sp=id;m.sp=exMom.id;}
  } else if(r=="son"||r=="dau"){
    m.f=fatherId;
    D.ps.push(m);
  } else if(r=="bro"||r=="sis"){
    if(!p.f||!get(p.f)){
      const fid=nid();
      D.ps.push({id:fid,f:null,g:"M",n:"પિતા",s:"d",sur:p.sur||"",gam:p.gam||""});
      p.f=fid;
    }
    m.f=p.f;
    D.ps.push(m);
  } else if(r=="mom"){
    if(momOf(p)){alert("માતા પહેલેથી ઉમેરેલા છે");return false;}
    m.sp=p.f||null;
    if(p.f&&get(p.f))get(p.f).sp=id;
    D.ps.push(m);
  } else if(r=="wife"){
    if(father.sp&&get(father.sp)){alert("પત્ની પહેલેથી ઉમેરેલા છે");return false;}
    m.sp=fatherId;
    father.sp=id;
    D.ps.push(m);
  }
  save();shut();
  if(returnToFamily==="tulsi")showTulsi(pid,true);else if(returnToFamily)showFamily(pid,true);else show(pid,true);
 });
}

function delMember(id,backId){
 if(id==D.me){alert("તમારી મુખ્ય પ્રોફાઇલ ડિલીટ ન થઈ શકે");return;}
 if(confirm("આ સભ્યનું નામ કાઢી નાખવું છે?")){
  D.ps=D.ps.filter(x=>x.id!=id);
  D.ps.forEach(x=>{if(x.f==id)x.f=null;if(x.sp==id)x.sp=null;});
  save();
  showFamily(backId,true);
 }
}

function edit(id){const p=get(id),k=["n","yr","s","sur","gam","rah","edu","job"];if(id==D.me)k.splice(3,0,"g","ja");
 form("વિગત ફેરવો",k,p,o=>{Object.assign(p,o);if(id==D.me)D.ja=o.ja;save();shut();show(id,true);if(!$("#tv").hidden)draw()})}

const REL=["","પિતા","દાદા","પરદાદા"];
const dep=q=>{let d=1;while(q.f&&get(q.f)){q=get(q.f);d++}return d};
function vs(p){let r=p;while(r.f&&get(r.f))r=get(r.f);let n=0,m=0,u=0;(function w(q,d){n++;if(q.s=="u")u++;m=Math.max(m,d);kids(q).forEach(x=>w(x,d+1))})(r,1);return[m,n,u]}

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
 const spouseObj=D.ps.find(x=>(x.relType=="wife"&&(x.sp==p.id||x.relTo==p.id))||p.sp==x.id||x.sp==p.id);
 if(spouseObj)add(sameGen,spouseObj,spouseObj.g=="F"?"પત્ની":"પતિ",4);
 if(dad){
  D.ps.filter(x=>x.f==dad.id && x.id!=p.id).forEach(x=>{
   add(sameGen,x,x.g=="F"?"બહેન":"ભાઈ",3);
  });
 }
 sameGen.sort((a,b)=>(a.yr-b.yr)||(a.order-b.order));

 const headId=(p.g=="F"&&spouseObj&&spouseObj.g=="M")?spouseObj.id:p.id;
 D.ps.filter(x=>x.f==headId || (spouseObj&&x.f==spouseObj.id)).forEach(x=>{
  add(children,x,x.g=="F"?"દીકરી":"દીકરો",5);
 });
 children.sort((a,b)=>a.yr-b.yr);

 return [...parents,...sameGen,...children].map(item=>[item.q,item.label]);
}

function getNuclearFamily(p){
 const spouseObj=D.ps.find(x=>(x.relType=="wife"&&(x.sp==p.id||x.relTo==p.id))||p.sp==x.id||x.sp==p.id);
 const head=(p.g=="F"&&spouseObj&&spouseObj.g=="M")?spouseObj:p;
 const spouse=(head.id===p.id)?spouseObj:p;
 const seenKids=new Set();
 const children=[];
 D.ps.filter(x=>x.f==head.id || (spouse&&x.f==spouse.id)).forEach(c=>{
  const key=`${c.n}_${c.yr||""}_${c.g}`;
  if(!seenKids.has(key)){seenKids.add(key);children.push(c);}
 });
 children.sort((a,b)=>(a.yr||9999)-(b.yr||9999));
 return {head,spouse,children};
}

function showFamily(id,skipPush=false){
 const p=get(id),{head,spouse,children}=getNuclearFamily(p);
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
     ${q.id!=D.me?`<button class="del-btn" onclick="delMember(${q.id},${id})" title="કાઢો">✕</button>`:""}
     <span onclick="show(${q.id})">જુઓ ›</span>
   </div>`;

 $("#pf").innerHTML=`<div class="pad">
  <div class="hd">
    <h2>👨‍👩‍👧‍👦 મારો પરિવાર</h2>
    <p>${esc(pre(head)+full(head))} નો ઘર-પરિવાર</p>
  </div>

  <div class="par-tree">
    <div class="par-badge">🏡 મારું ઘર • ${gu(1+(spouse?1:0)+children.length)} સભ્યો</div>
    <div class="par-couple">
      ${node(head,"પતિ / મુખ્ય")}
      <div class="par-link"><span>💍</span></div>
      ${spouse?node(spouse,"પત્ની"):`<div class="par-node add-sp" onclick="addMember(${head.id},'wife',true)"><i class="r" style="border-style:dashed;background:#fff">+</i><b>પત્ની ઉમેરો</b><small>ક્લિક કરો</small></div>`}
    </div>
    ${children.length?`
      <div class="par-stem"></div>
      <div class="par-kids">
        ${children.map(c=>node(c,c.g=="F"?"દીકરી":"દીકરો")).join("")}
      </div>
    `:`<p class="par-empty-k">નીચેથી દીકરો કે દીકરી ઉમેરો</p>`}
  </div>

  <div style="margin:14px 0">
    <button class="bk" style="margin:0" onclick="addMember(${id},'son',true)">➕ પરિવારમાં નામ ઉમેરો (પત્ની, દીકરો, દીકરી)</button>
  </div>

  <h3 class="fh">પરિવારના સભ્યોની યાદી</h3>
  ${rowCard(head,"પતિ / મુખ્ય સભ્ય")}
  ${spouse?rowCard(spouse,"પત્ની"):""}
  ${children.map(c=>rowCard(c,c.g=="F"?"દીકરી":"દીકરો")).join("")}

  <button class="bk" onclick="history.back()">← પ્રોફાઇલ પર પાછા જાઓ</button>
 </div>`;
 $("#tv").hidden=true;$("#pf").hidden=false;
 document.querySelectorAll("nav.bn button").forEach(b=>b.classList.toggle("on",b.dataset.t=="pf"));
 $("#pf").scrollTop=0;
 if(!skipPush)pushView({v:"fam",id});
}

function show(id,skipPush=false){cur=id;const p=get(id);if(!p)return empty();
 const[c,t]=ST[p.s],[g,n,u]=vs(p),fam=getFamilyList(p);
 const rw=(a,b)=>b?`<div class="rw"><span>${a}</span><b>${b}</b></div>`:"";
 const card=(q,rel)=>`<a class="fm" onclick="show(${q.id})"><i class="r ${ST[q.s][0]}">${esc(q.n[0])}</i><div><b>${esc(pre(q)+full(q))}</b><small>${rel}${q.yr?" • જન્મ "+gu(q.yr):""}</small></div><span>જુઓ ›</span></a>`;
 $("#pf").innerHTML=`<div class="cv"></div>
 <div class="pr"><i class="r big ${c}">${esc(p.n[0])}</i><h2>${esc(pre(p)+full(p))}${p.sur?" "+esc(p.sur):""}</h2>
 <p class="ln">${[p.job,p.rah].filter(Boolean).map(esc).join(" • ")}</p><p class="bio">${D.ja?"શાખ: "+esc(D.ja)+" • ":""}${t}</p>
 <div class="st"><div><b>${gu(g)} પેઢી</b><small>મારો વડ 🌳</small></div><div><b>${gu(n)} સભ્યો</b><small>કુલ પરિવાર</small></div><div class="gr"><b>${gu(u)} અપરિણીત</b><small>સગાઈ યોગ્ય</small></div></div>
 <div class="ac2">
   <button class="pm" style="font-size:16.5px;letter-spacing:.2px" onclick="tab('tv')">🌳 મારો વડ</button>
   <button class="pm" style="font-size:16.5px;letter-spacing:.2px" onclick="showFamily(${id})">👨‍👩‍👧‍👦 મારો પરિવાર</button>
   <button onclick="showTulsi(${id})">🌿 તુલસી ક્યારો</button>
   <button onclick="edit(${id})">✏️ વિગત ફેરવો</button>
 </div>
 <div class="bx">${rw("જન્મ વર્ષ",p.yr?gu(p.yr):"")}${rw("ભણતર",esc(p.edu))}${rw("વ્યવસાય",esc(p.job))}${rw("રહેઠાણ",esc(p.rah))}${rw("મૂળ ગામ",esc(p.gam))}</div>
 ${fam.length?`<h3 class="fh">પરિવારના સભ્યો</h3>`:""}${fam.map(([q,r])=>card(q,r)).join("")}</div>`;
 $("#tv").hidden=true;$("#pf").hidden=false;
 document.querySelectorAll("nav.bn button").forEach(b=>b.classList.toggle("on",b.dataset.t=="pf"));
 $("#pf").scrollTop=0;
 if(!skipPush)pushView({v:"pf",id});
}

const W=112,H=112;let cur=null,SW=1,SH=1,FS="all";
function draw(){const me=get(D.me),stg=$("#stage");if(!me)return;
 if(me.g=="F"){stg.style.cssText="";stg.innerHTML='<p class="em"><button class="bk" onclick="showTulsi('+me.id+')">🌿 તુલસી ક્યારો ખોલો</button></p>';$("#flt").innerHTML="";$("#sub").textContent="";return}
 let r=me;while(r.f&&get(r.f))r=get(r.f);let leaf=0,mx=0;const pos={},all=[];
 (function lay(p,d){const k=kids(p);k.forEach(c=>lay(c,d+1));pos[p.id]=[k.length?(pos[k[0].id][0]+pos[k[k.length-1].id][0])/2:leaf++*W,d*H];mx=Math.max(mx,d);all.push(p)})(r,0);
 SW=Math.max(leaf,1)*W;SH=(mx+1)*H;let sv="",nd="";
 all.forEach(p=>{const[x,y]=pos[p.id];kids(p).forEach(c=>{const[cx,cy]=pos[c.id],a=y+52,b=cy+4,m=(a+b)/2;
  sv+=`<path d="M${x+W/2} ${a}C${x+W/2} ${m},${cx+W/2} ${m},${cx+W/2} ${b}"/>`});
  nd+=`<div class="nd${p.id==D.me?" me":""}" data-s="${p.s}" style="left:${x+W/2}px;top:${y}px" onclick="tap(${p.id})"><i class="r ${ST[p.s][0]}">${esc(p.n[0])}</i><b>${esc(p.n)}</b></div>`});
 stg.style.cssText=`width:${SW}px;height:${SH}px`;stg.innerHTML=`<svg width="${SW}" height="${SH}">${sv}</svg>${nd}`;
 const cn=s=>all.filter(p=>p.s==s).length;
 $("#sub").textContent=`${gu(mx+1)} પેઢી • ${gu(all.length)} સભ્યો`;
 $("#flt").innerHTML=[["all","બધા",all.length],["d","🔴 સ્વર્ગવાસ",cn("d")],["m","🔵 પરિણીત",cn("m")],["u","🟢 અપરિણીત",cn("u")]].map(f=>`<button class="${f[0]==FS?"on":""}" onclick="flt('${f[0]}')">${f[1]} (${gu(f[2])})</button>`).join("");
 flt(FS)}
function flt(s){FS=s;document.querySelectorAll("#flt button").forEach((b,i)=>b.classList.toggle("on",["all","d","m","u"][i]==s));
 document.querySelectorAll(".nd").forEach(n=>n.classList.toggle("dim",s!="all"&&n.dataset.s!=s))}
let T={x:0,y:0,z:.8},moved=0;const vp=$("#vp"),st=$("#stage");
const apply=()=>{st.style.transform=`translate(${T.x}px,${T.y}px) scale(${T.z})`;$("#zl").textContent=gu(Math.round(T.z*100))+"%"};
function zoom(f,cx=vp.clientWidth/2,cy=vp.clientHeight/2){const z=Math.min(1.6,Math.max(.2,T.z*f)),r=z/T.z;T.x=cx-(cx-T.x)*r;T.y=cy-(cy-T.y)*r;T.z=z;apply()}
function fit(){const w=vp.clientWidth,h=vp.clientHeight;T.z=Math.min(1,w/SW,h/SH)*.95;T.x=(w-SW*T.z)/2;T.y=Math.max(66,(h-SH*T.z)/2);apply()}
const ptr=new Map();let last=0;
vp.onpointerdown=e=>{ptr.set(e.pointerId,[e.clientX,e.clientY]);moved=0};
vp.onpointermove=e=>{const o=ptr.get(e.pointerId);if(!o)return;ptr.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptr.size==1){T.x+=e.clientX-o[0];T.y+=e.clientY-o[1];moved+=Math.abs(e.clientX-o[0])+Math.abs(e.clientY-o[1]);apply()}
 else if(ptr.size==2){const a=[...ptr.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),r=vp.getBoundingClientRect();
  if(last)zoom(d/last,(a[0][0]+a[1][0])/2-r.left,(a[0][1]+a[1][1])/2-r.top);last=d;moved=99}};
vp.onpointerup=vp.onpointercancel=e=>{ptr.delete(e.pointerId);last=0};
const tap=id=>{if(moved<8)show(id)};

function tab(t,skipPush=false){if(t=="tv"&&!D.me){return empty()}
 if(t=="pf"){return D.me?show(cur||D.me,skipPush):empty()}
 $("#tv").hidden=t!="tv";$("#pf").hidden=t!="pf";
 document.querySelectorAll("nav.bn button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));
 if(t=="tv"){draw();fit();if(!skipPush)pushView({v:"tv"});}
}

function empty(){$("#tv").hidden=true;$("#pf").hidden=false;
 $("#pf").innerHTML='<div class="pad"><div class="hd"><i class="r big blue">વ</i><h2>વડબૂક</h2><p>તમારા પરિવારનો વડ, તમારા હાથે</p></div><button class="bk" onclick="first()">પ્રોફાઇલ બનાવો</button></div>'}
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
D.me&&get(D.me)?show(D.me):empty();

function info(){const[m,n]=vs(get(D.me));return gu(m)+" પેઢી • "+gu(n)+" સભ્યો"}
function soon(){const t=$("#ts");t.hidden=false;clearTimeout(soon.t);soon.t=setTimeout(()=>t.hidden=true,1800)}
function menu(o){const d=$("#dr");if(!o){d.hidden=true;return}
 const me=D.me&&get(D.me);
 $("#dp").innerHTML=me?`<i class="r ${ST[me.s][0]}">${esc(me.n[0])}</i><div><b>${esc(full(me))}</b><small>${[D.ja&&"જાતિ: "+esc(D.ja),me.gam&&"ગામ: "+esc(me.gam)].filter(Boolean).join(" • ")}</small></div>`:"<div><b>વડબૂક</b><small>પ્રોફાઇલ બનાવો</small></div>";
 const it=[["🌳","મારો વડ (વંશાવળી)",me&&me.g!="F"?info():"તમારા પરિવારનો વડ","menu(0);tab('tv')","hl"],
 ["🌿","તુલસી ક્યારો (માતૃપક્ષ)","માતા, નાની અને પરનાનીની વંશાવળી","menu(0);D.me?showTulsi(D.me):empty()",""],
 ["💍","સગાઈ વિભાગ (અપરિણીત યુવાનો)","લીલા સર્કલ 🟢 ધરાવતા સભ્યો","soon()","soon"],
 ["👤","મારી પ્રોફાઇલ","પરિવાર અને વ્યક્તિગત વિગતો","menu(0);D.me?show(D.me):empty()",""],
 ["🛡️","એડમિન પેનલ","નવા સભ્યોની મંજૂરી","soon()","ad soon"]];
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
 const p=get(id);if(!p)return empty();
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
   <button class="tk-add" onclick="addMember(${last.id},'mom','tulsi')">➕ ${lab(chain.length+1)} ઉમેરો</button>
   ${parts.map(h=>`<div class="tk-st"></div>${h}`).join("")}
   <div class="tk-st"></div>${node(p,"તમે")}
  </div>
  <button class="bk" onclick="history.back()">← પાછા જાઓ</button>
 </div>`;
 $("#tv").hidden=true;$("#pf").hidden=false;
 $("#pf").scrollTop=0;
 if(!skipPush)pushView({v:"tul",id});
}
