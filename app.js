const $=s=>document.querySelector(s),gu=n=>String(n).replace(/\d/g,d=>"૦૧૨૩૪૫૬૭૮૯"[d]);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const K="wadbook-v1";let D;try{D=JSON.parse(localStorage.getItem(K))}catch(e){}
D=D||{ps:[],me:null,ja:""};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
const ST={d:["red","સ્વર્ગવાસ"],m:["blue","પરિણીત"],u:["green","અપરિણીત"]};
const get=id=>D.ps.find(p=>p.id==id),nid=()=>Math.max(0,...D.ps.map(p=>p.id))+1;
const kids=p=>D.ps.filter(c=>c.f==p.id&&c.g!="F").sort((a,b)=>(a.yr||9999)-(b.yr||9999));
const full=p=>p.n+(p.f?" "+get(p.f).n:"");
const FD={n:["નામ","text"],yr:["જન્મ વર્ષ (દા.ત. 1983)","number"],s:["સ્થિતિ","sel"],g:["લિંગ","gen"],sur:["અટક","text"],ja:["જાતિ / શાખ","text"],gam:["મૂળ ગામ","text"],rah:["રહેઠાણ","text"],edu:["ભણતર","text"],job:["વ્યવસાય","text"]};
function form(t,keys,v,cb){
 $("#sh").innerHTML=`<div class="card"><h3>${t}</h3>${keys.map(k=>{const[l,ty]=FD[k],x=v[k]??"";
  if(ty=="sel")return `<label>${l}<select id="f_${k}">${Object.entries(ST).map(([a,b])=>`<option value="${a}" ${x==a?"selected":""}>${b[1]}</option>`).join("")}</select></label>`;
  if(ty=="gen")return `<label>${l}<select id="f_g"><option value="M">પુરુષ</option><option value="F" ${x=="F"?"selected":""}>સ્ત્રી</option></select></label>`;
  return `<label>${l}<input id="f_${k}" type="${ty}" value="${esc(x)}"></label>`}).join("")}
 <div class="bt"><button onclick="shut()">રદ કરો</button><button class="pr" id="ok">સાચવો</button></div></div>`;
 $("#sh").hidden=false;
 $("#ok").onclick=()=>{const o={};keys.forEach(k=>o[k]=$("#f_"+k).value.trim());if(!o.n){alert("નામ લખો");return}
  if("yr"in o)o.yr=o.yr?+o.yr:"";cb(o)}}
const shut=()=>{$("#sh").hidden=true};
function first(){form("તમારી પ્રોફાઇલ બનાવો",["n","sur","g","ja","gam","rah","edu","job","yr","s"],{s:"m"},o=>{
 D={ps:[{id:1,f:null,...o}],me:1,ja:o.ja};save();shut();show(1)})}
function add(kind,pid){const dad=kind=="dad";
 form(dad?"પિતા ઉમેરો":"દીકરો ઉમેરો",["n","yr","s"],{s:dad?"d":"u"},o=>{
  const id=nid();D.ps.push({id,f:null,g:"M",...o});if(dad)get(pid).f=id;else get(id).f=pid;save();shut();show(dad?id:pid)})}
function edit(id){const p=get(id),k=["n","yr","s","sur","gam","rah","edu","job"];if(id==D.me)k.splice(3,0,"g","ja");
 form("વિગત ફેરવો",k,p,o=>{Object.assign(p,o);if(id==D.me)D.ja=o.ja;save();shut();show(id);if(!$("#tv").hidden)draw()})}
function show(id){cur=id;const p=get(id),[c,t]=ST[p.s],rw=(a,b)=>b?`<div class="rw"><span>${a}</span><b>${b}</b></div>`:"";
 const ln=q=>`<a onclick="show(${q.id})"><i class="r ${ST[q.s][0]} sm">${esc(q.n[0])}</i>${esc(full(q))}</a>`,ks=kids(p);
 $("#pf").innerHTML=`<div class="hd"><i class="r big ${c}">${esc(p.n[0])}</i><h2>${esc(full(p))}${p.sur?" "+esc(p.sur):""}</h2><p>${D.ja?"જાતિ: "+esc(D.ja)+" • ":""}${t}</p></div>
 <div class="bx">${rw("જન્મ વર્ષ",p.yr?gu(p.yr):"")}${rw("મૂળ ગામ",esc(p.gam))}${rw("રહેઠાણ",esc(p.rah))}${rw("ભણતર",esc(p.edu))}${rw("વ્યવસાય",esc(p.job))}
 ${p.f?`<h3>પિતા</h3>${ln(get(p.f))}`:""}${ks.length?`<h3>દીકરા</h3>${ks.map(ln).join("")}`:""}</div>
 <div class="ac">${p.g!="F"?`<button onclick="add('son',${id})">➕ દીકરો ઉમેરો</button>`:""}${p.f?"":`<button onclick="add('dad',${id})">➕ પિતા ઉમેરો</button>`}<button onclick="edit(${id})">✏️ વિગત ફેરવો</button></div>`;
 tab("pf")}
const W=112,H=124;let cur=null,SW=1,SH=1,FS="all";
function draw(){const me=get(D.me),stg=$("#stage");if(!me)return;
 if(me.g=="F"){stg.style.cssText="";stg.innerHTML='<p class="em">🌿 તુલસી ક્યારો ટૂંક સમયમાં આવશે</p>';$("#flt").innerHTML="";$("#sub").textContent="";return}
 let r=me;while(r.f)r=get(r.f);let leaf=0,mx=0;const pos={},all=[];
 (function lay(p,d){const k=kids(p);k.forEach(c=>lay(c,d+1));pos[p.id]=[k.length?(pos[k[0].id][0]+pos[k[k.length-1].id][0])/2:leaf++*W,d*H];mx=Math.max(mx,d);all.push(p)})(r,0);
 SW=Math.max(leaf,1)*W;SH=(mx+1)*H;let sv="",nd="";
 all.forEach(p=>{const[x,y]=pos[p.id];kids(p).forEach(c=>{const[cx,cy]=pos[c.id],a=y+52,b=cy+4,m=(a+b)/2;
  sv+=`<path d="M${x+W/2} ${a}C${x+W/2} ${m},${cx+W/2} ${m},${cx+W/2} ${b}"/>`});
  nd+=`<div class="nd${p.id==D.me?" me":""}" data-s="${p.s}" style="left:${x+W/2}px;top:${y}px" onclick="tap(${p.id})"><i class="r ${ST[p.s][0]}">${esc(p.n[0])}</i><b>${esc(p.n)}</b><small>${p.f?esc(get(p.f).n):""}</small></div>`});
 stg.style.cssText=`width:${SW}px;height:${SH}px`;stg.innerHTML=`<svg width="${SW}" height="${SH}">${sv}</svg>${nd}`;
 const cn=s=>all.filter(p=>p.s==s).length;
 $("#sub").textContent=`${gu(mx+1)} પેઢી • ${gu(all.length)} સભ્યો`;
 $("#flt").innerHTML=[["all","બધા",all.length],["d","🔴 સ્વર્ગવાસ",cn("d")],["m","🔵 પરિણીત",cn("m")],["u","💚 અપરિણીત",cn("u")]].map(f=>`<button class="${f[0]==FS?"on":""}" onclick="flt('${f[0]}')">${f[1]} (${gu(f[2])})</button>`).join("");
 flt(FS)}
function flt(s){FS=s;document.querySelectorAll("#flt button").forEach((b,i)=>b.classList.toggle("on",["all","d","m","u"][i]==s));
 document.querySelectorAll(".nd").forEach(n=>n.classList.toggle("dim",s!="all"&&n.dataset.s!=s))}
let T={x:0,y:0,z:.8},moved=0;const vp=$("#vp"),st=$("#stage");
const apply=()=>{st.style.transform=`translate(${T.x}px,${T.y}px) scale(${T.z})`;$("#zl").textContent=gu(Math.round(T.z*100))+"%"};
function zoom(f,cx=vp.clientWidth/2,cy=vp.clientHeight/2){const z=Math.min(1.6,Math.max(.2,T.z*f)),r=z/T.z;T.x=cx-(cx-T.x)*r;T.y=cy-(cy-T.y)*r;T.z=z;apply()}
function fit(){const w=vp.clientWidth,h=vp.clientHeight;T.z=Math.min(1,w/SW,h/SH)*.95;T.x=(w-SW*T.z)/2;T.y=Math.max(70,(h-SH*T.z)/2);apply()}
const ptr=new Map();let last=0;
vp.onpointerdown=e=>{ptr.set(e.pointerId,[e.clientX,e.clientY]);moved=0};
vp.onpointermove=e=>{const o=ptr.get(e.pointerId);if(!o)return;ptr.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptr.size==1){T.x+=e.clientX-o[0];T.y+=e.clientY-o[1];moved+=Math.abs(e.clientX-o[0])+Math.abs(e.clientY-o[1]);apply()}
 else if(ptr.size==2){const a=[...ptr.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),r=vp.getBoundingClientRect();
  if(last)zoom(d/last,(a[0][0]+a[1][0])/2-r.left,(a[0][1]+a[1][1])/2-r.top);last=d;moved=99}};
vp.onpointerup=vp.onpointercancel=e=>{ptr.delete(e.pointerId);last=0};
const tap=id=>{if(moved<8)show(id)};
function tab(t){if(t=="tv"&&!D.me){return empty()}
 $("#tv").hidden=t!="tv";$("#pf").hidden=t!="pf";
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));if(t=="tv"){draw();fit()}}
function empty(){$("#tv").hidden=true;$("#pf").hidden=false;
 $("#pf").innerHTML='<div class="hd"><i class="r big blue">વ</i><h2>વડબૂક</h2><p>તમારા પરિવારનો વડ, તમારા હાથે</p></div><button class="bk" onclick="first()">પ્રોફાઇલ બનાવો</button>'}
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
D.me&&get(D.me)?show(D.me):empty();

function info(){let r=get(D.me);while(r.f)r=get(r.f);let n=0,m=0;(function w(p,d){n++;m=Math.max(m,d);kids(p).forEach(c=>w(c,d+1))})(r,1);return gu(m)+" પેઢી • "+gu(n)+" સભ્યો"}
function soon(){const t=$("#ts");t.hidden=false;clearTimeout(soon.t);soon.t=setTimeout(()=>t.hidden=true,1800)}
function menu(o){const d=$("#dr");if(!o){d.hidden=true;return}
 const me=D.me&&get(D.me);
 $("#dp").innerHTML=me?`<i class="r ${ST[me.s][0]}">${esc(me.n[0])}</i><div><b>${esc(full(me))}</b><small>${[D.ja&&"જાતિ: "+esc(D.ja),me.gam&&"ગામ: "+esc(me.gam)].filter(Boolean).join(" • ")}</small></div>`:"<div><b>વડબૂક</b><small>પ્રોફાઇલ બનાવો</small></div>";
 const it=[["🌳","મારો વડ (વંશાવળી)",me&&me.g!="F"?info():"તમારા પરિવારનો વડ","menu(0);tab('tv')","hl"],
 ["🌿","તુલસી ક્યારો (માતૃપક્ષ)","માતા, નાની અને પરનાનીની વંશાવળી","soon()","soon"],
 ["💍","સગાઈ વિભાગ (અપરિણીત યુવાનો)","લીલા સર્કલ 💚 ધરાવતા સભ્યો","soon()","soon"],
 ["👤","મારી પ્રોફાઇલ","પરિવાર અને વ્યક્તિગત વિગતો","menu(0);D.me?show(D.me):empty()",""],
 ["🛡️","એડમિન પેનલ","નવા સભ્યોની મંજૂરી","soon()","ad soon"]];
 $("#dl").innerHTML=it.map(([i,t,s,a,c])=>`<a class="${c}" onclick="${a}"><span class="ic">${i}</span><div><b>${t}</b><small>${s}</small>${c.includes("soon")?"<em>ટૂંક સમયમાં</em>":""}</div></a>`).join("");
 $("#df").textContent=(D.ja?D.ja+" • ":"")+"Wadbook";d.hidden=false}
