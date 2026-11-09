(()=>{"use strict";const $=id=>document.getElementById(id);if(!window.L){$("message").textContent="Map library failed to load. Check internet and refresh.";return;}
const map=L.map("map").setView([15.35,74.05],9);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
const S={boundary:null,p:{A:null,B:null},markers:{},mode:"air",pick:"A",line:null,via:[],air:null,road:null};
const say=(s,t="")=>{$("message").textContent=s;$("message").className="message "+t},fmt=m=>({km:(m/1000).toFixed(2),m:Math.round(m).toLocaleString("en-IN")});
function hav(a,b){let r=Math.PI/180,d1=(b.lat-a.lat)*r,d2=(b.lng-a.lng)*r,x=Math.sin(d1/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(d2/2)**2;return 12742017.6*Math.asin(Math.sqrt(x))}
function insideRing(p,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [x,y]=ring[i],[xx,yy]=ring[j];if((y>p.lat)!==(yy>p.lat)&&p.lng<(xx-x)*(p.lat-y)/(yy-y)+x)hit=!hit}return hit}
function inside(p){if(!S.boundary)return false;const g=S.boundary.geometry,polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;return polys.some(poly=>insideRing(p,poly[0])&&!poly.slice(1).some(r=>insideRing(p,r)))}
function boundaryDistance(p){
 if(!S.boundary)return Infinity;
 const g=S.boundary.geometry,polys=g.type==="Polygon"?[g.coordinates]:g.coordinates;
 const cos=Math.cos(p.lat*Math.PI/180),sx=111320*cos,sy=110540;
 let best=Infinity;
 for(const poly of polys)for(const ring of poly){
  for(let i=1;i<ring.length;i++){
   const ax=(ring[i-1][0]-p.lng)*sx,ay=(ring[i-1][1]-p.lat)*sy;
   const bx=(ring[i][0]-p.lng)*sx,by=(ring[i][1]-p.lat)*sy;
   const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
   const t=len?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len)):0;
   const d=Math.hypot(ax+t*dx,ay+t*dy);
   if(d<best)best=d;
  }
 }
 return best
}
function pathInside(coords,bufferMeters=0){
 for(let i=1;i<coords.length;i++){
  const [x,y]=coords[i-1],[xx,yy]=coords[i],d=hav({lat:y,lng:x},{lat:yy,lng:xx}),n=Math.max(1,Math.ceil(d/150));
  for(let j=0;j<=n;j++){
   const t=j/n,p={lat:y+(yy-y)*t,lng:x+(xx-x)*t};
   if(!inside(p)&&(bufferMeters<=0||boundaryDistance(p)>bufferMeters))return false
  }
 }
 return true
}
function advancePick(k){S.pick=k==="A"?"B":null;document.querySelectorAll(".pick").forEach(b=>b.classList.toggle("active",b.dataset.pick===S.pick));}
function clearLine(){if(S.line){map.removeLayer(S.line);S.line=null}}
function update(){ $("measure").disabled=!(S.p.A&&S.p.B);$("undo").hidden=S.mode!=="custom"}
function set(k,p){if(!inside(p)){say("This learning activity is restricted to locations within Goa. Please choose a place inside Goa.","error");return false}S.p[k]=p;if(S.markers[k])map.removeLayer(S.markers[k]);S.markers[k]=L.circleMarker([p.lat,p.lng],{radius:9,color:"white",weight:3,fillColor:k==="A"?"#176fc1":"#e47a38",fillOpacity:1}).addTo(map).bindTooltip(k+" · "+(p.name||"Map point"));$("chosen"+k).textContent=p.name||p.lat.toFixed(5)+", "+p.lng.toFixed(5);$("search"+k).value=p.name||"";clearLine();$("km").innerHTML='— <em>km</em>';$("metres").textContent="— metres";update();advancePick(k);say(k==="A"?"Starting point selected. Now select destination B.":"Destination selected. You can now measure the distance.","success");return true}
function clear(){["A","B"].forEach(k=>{S.p[k]=null;if(S.markers[k])map.removeLayer(S.markers[k]);S.markers[k]=null;$("chosen"+k).textContent="Not selected";$("search"+k).value="";$("suggest"+k).replaceChildren()});S.via=[];S.air=S.road=null;clearLine();$("km").innerHTML='— <em>km</em>';$("metres").textContent="— metres";$("detail").textContent="Choose Point A and Point B.";$("comparison").hidden=true;S.pick="A";document.querySelectorAll(".pick").forEach(b=>b.classList.toggle("active",b.dataset.pick==="A"));update();say("Points cleared. Select starting point A.")}
document.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{S.mode=b.dataset.mode;document.querySelectorAll(".mode").forEach(x=>x.classList.toggle("active",x===b));$("customHelp").hidden=S.mode!=="custom";S.via=[];clearLine();update();say(S.mode==="custom"?"Choose A and B, then tap the map to add route points.":"Choose A and B, then measure.")});
document.querySelectorAll(".pick").forEach(b=>b.onclick=()=>{S.pick=b.dataset.pick;document.querySelectorAll(".pick").forEach(x=>x.classList.toggle("active",x===b));say("Click anywhere on the map within Goa to place "+(S.pick==="A"?"starting point A.":"destination B."))});
map.on("click",e=>{const p={lat:e.latlng.lat,lng:e.latlng.lng,name:"Map location"};if(!S.boundary){say("Goa learning boundary is still loading. Please wait.","error");return}if(S.pick==="A"||S.pick==="B"){set(S.pick,p);return}if(S.mode==="custom"&&S.p.A&&S.p.B){if(!inside(p)){say("Intermediate route points must also be within Goa.","error");return}S.via.push(p);drawCustom();return}say("Choose Pick A or Pick B, then click anywhere within Goa on the map.","error")});
function drawCustom(){clearLine();let pts=[S.p.A,...S.via,S.p.B];S.line=L.polyline(pts.map(p=>[p.lat,p.lng]),{color:"#0d6870",weight:4,dashArray:"6 6"}).addTo(map);say("Intermediate point added. Add more points or measure your route.")}
async function search(k){
 const q=$("search"+k).value.trim(),box=$("suggest"+k);
 box.replaceChildren();
 if(q.length<2)return;
 const seen=new Set();
 function add(lat,lon,name,label){
  lat=Number(lat);lon=Number(lon);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||!inside({lat,lng:lon}))return false;
  const key=lat.toFixed(5)+","+lon.toFixed(5);if(seen.has(key))return false;seen.add(key);
  const b=document.createElement("button");b.type="button";b.textContent=label||name||"Map location";
  b.onclick=()=>{if(set(k,{lat,lng:lon,name:name||"Map location"})){map.setView([lat,lon],16);box.replaceChildren()}};
  box.append(b);return true
 }
 let found=0,photonError=false,nominatimError=false;
 // Photon is tried first because it is designed for responsive place-name search.
 try{
  const url="https://photon.komoot.io/api/?"+new URLSearchParams({q:q,lat:"15.49",lon:"73.83",limit:"25",lang:"en"});
  const r=await fetch(url);if(!r.ok)throw Error("Photon "+r.status);
  const data=await r.json();
  for(const f of (data.features||[])){
   const p=f.properties||{},c=f.geometry?.coordinates||[];
   const state=String(p.state||p.statecode||"").toLowerCase();
   // The Goa polygon check is authoritative; state text is only descriptive.
   if(add(c[1],c[0],p.name||p.street||p.locality||"Map location",[p.name,p.locality,p.district,p.city,p.state].filter(Boolean).join(", ")))found++
  }
 }catch(e){photonError=true}
 if(found){say("Select the correct matching place, or use Pick to click any point on the map.","success");return}
 // Nominatim fallback. Requests are deliberately delayed by the input debounce.
 try{
  const variants=[q,q+", Goa, India"];
  for(const term of variants){
   const params=new URLSearchParams({format:"jsonv2",limit:"20",countrycodes:"in",viewbox:"73.65,15.85,74.45,14.85",bounded:"0",addressdetails:"1",q:term});
   const r=await fetch("https://nominatim.openstreetmap.org/search?"+params.toString(),{headers:{"Accept-Language":"en"}});
   if(!r.ok)throw Error("Nominatim "+r.status);
   const rows=await r.json();
   for(const x of rows){if(add(x.lat,x.lon,x.name||x.display_name?.split(",")[0],x.display_name))found++}
   if(found)break
  }
 }catch(e){nominatimError=true}
 if(found){say("Select the correct matching place, or use Pick to click any point on the map.","success");return}
 box.textContent=(photonError&&nominatimError)
  ?"Place search services are temporarily unavailable. Press Pick and click the exact location on the map."
  :"That locality is not listed in the search databases. It may still be in Goa. Press Pick and click its exact location on the map; zoom in for accuracy.";
}
["A","B"].forEach(k=>{let timer;$("search"+k).oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>search(k),1100)}});
function show(m,label){let f=fmt(m);$("km").innerHTML=f.km+' <em>km</em>';$("metres").textContent=f.m+" metres";$("detail").textContent=label;say("Distance calculated successfully.","success")}
async function measure(){let a=S.p.A,b=S.p.B;if(!a||!b)return;clearLine();$("comparison").hidden=true;if(S.mode==="air"){S.air=hav(a,b);show(S.air,"Aerial distance · straight line");S.line=L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:"#176fc1",weight:4,dashArray:"8 7"}).addTo(map);map.fitBounds(S.line.getBounds().pad(.2));return}
if(S.mode==="custom"){let pts=[a,...S.via,b],coords=pts.map(p=>[p.lng,p.lat]);if(!pathInside(coords)){say("Your drawn route must remain within Goa. Remove or reposition the point outside Goa.","error");return}let total=pts.slice(1).reduce((sum,p,i)=>sum+hav(pts[i],p),0);show(total,"Student-drawn route · "+S.via.length+" intermediate points");S.line=L.polyline(pts.map(p=>[p.lat,p.lng]),{color:"#0d6870",weight:5}).addTo(map);map.fitBounds(S.line.getBounds().pad(.2));return}
say("Finding a road route within Goa…");$("measure").disabled=true;try{const u="https://router.project-osrm.org/route/v1/driving/"+a.lng+","+a.lat+";"+b.lng+","+b.lat+"?overview=full&geometries=geojson&alternatives=3&steps=false",r=await fetch(u);if(!r.ok)throw Error("The road-routing service is temporarily unavailable");const d=await r.json();if(d.code!=="Ok"||!d.routes?.length)throw Error("No connected road route was found between these points");const route=d.routes.find(x=>pathInside(x.geometry.coordinates,15000));if(!route)throw Error("The routing service returned routes that extend more than 15 km beyond the Goa boundary. Try moving A or B onto a nearby road or use My route.");S.road=route.distance;show(S.road,"Road distance · route within Goa and its 15 km routing buffer");S.line=L.geoJSON(route.geometry,{style:{color:"#0d6870",weight:5}}).addTo(map);map.fitBounds(S.line.getBounds().pad(.2));if(S.air!==null){$("comparison").hidden=false;$("comparison").textContent="Difference between road and aerial distance: "+fmt(Math.abs(S.road-S.air)).km+" km"}say("Road route found and checked against the Goa boundary.","success")}catch(e){say(e.message,"error")}finally{update()}}
$("measure").onclick=measure;$("clear").onclick=clear;$("undo").onclick=()=>{S.via.pop();drawCustom()};
$("reset").onclick=()=>map.setView([15.35,74.05],9);
$("boundaryStatus").textContent="Goa-only learning area · boundary hidden";say("Loading the Goa learning area…","");update();
async function loadBoundary(){try{const r=await fetch("./goa-boundary.geojson");if(!r.ok)throw Error("Local Goa boundary file could not be loaded: "+r.status);const geo=await r.json();const features=(geo.features||[]).filter(f=>String(f.properties?.st_nm||"").toLowerCase()==="goa"&&f.geometry);if(!features.length)throw Error("Goa boundary file contains no Goa polygons");const polygons=features.flatMap(f=>f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.type==="MultiPolygon"?f.geometry.coordinates:[]);if(!polygons.length)throw Error("Goa boundary geometry is invalid");S.boundary={type:"Feature",properties:{name:"Goa"},geometry:{type:"MultiPolygon",coordinates:polygons}};$("boundaryStatus").textContent="Learning area: Goa only · boundary hidden";say("Goa learning area is ready. Select starting point A, then destination B.","success");update()}catch(err){$("boundaryStatus").textContent="Goa boundary file unavailable";say("The local Goa boundary file could not be loaded. Refresh the app or check the connection.","error")}}loadBoundary();
$("checkEstimate").onclick=()=>{let v=+$("estimate").value,t=$("km").textContent;if(!(v>0))return $("estimateFeedback").textContent="Enter an estimate greater than zero.";if(t.startsWith("—"))return $("estimateFeedback").textContent="Measure a distance first.";let d=Math.abs(v-parseFloat(t));$("estimateFeedback").textContent="Your estimate differs by "+d.toFixed(2)+" km. "+(d<parseFloat(t)*.1?"Excellent estimation!":"Think about map scale and try again.")};
$("compareTask").onclick=()=>{$("compareFeedback").textContent=S.air!==null&&S.road!==null?"Aerial: "+fmt(S.air).km+" km. Road: "+fmt(S.road).km+" km. Roads may curve around rivers, hills and buildings.":"Measure the same points in Aerial mode and Road mode first."};
$("checkConversion").onclick=()=>{$("conversionFeedback").textContent=+$("conversion").value===3600?"Correct! 3.6 × 1,000 = 3,600 metres.":"Multiply kilometres by 1,000 to convert to metres."};
const qs=[["2,500 metres is equal to…",["2.5 km","25 km","0.25 km"],0,"Divide metres by 1,000."],["Which measurement is a straight line between A and B?",["Road","Aerial","Drawn route"],1,"Aerial distance is measured directly between the points."],["Road distance is 7 km and aerial is 5 km. Difference?",["2 km","12 km","35 km"],0,"7 − 5 = 2 km."],["To convert 4.2 km into metres, we…",["Divide by 1,000","Multiply by 100","Multiply by 1,000"],2,"4.2 × 1,000 = 4,200 m."],["A route made of several connected segments is…",["Aerial","Student-drawn","Map scale"],1,"Add the lengths of the connected route segments."]];
let qi=0,score=0,done=0;function quiz(){let q=qs[qi];$("question").textContent=q[0];$("options").replaceChildren();q[1].forEach((v,i)=>{let b=document.createElement("button");b.textContent=v;b.onclick=()=>{if($("options").dataset.done)return;$("options").dataset.done="1";let ok=i===q[2];if(ok)score++;done++;[...$("options").children].forEach((x,j)=>{x.disabled=true;if(j===q[2])x.classList.add("correct");else if(j===i)x.classList.add("wrong")});$("quizFeedback").textContent=(ok?"Correct! ":"Not quite. ")+q[3];$("score").textContent="Score: "+score+" / "+done;$("next").hidden=false};$("options").append(b)});$("quizFeedback").textContent="";$("next").hidden=true;delete $("options").dataset.done}
$("next").onclick=()=>{qi=(qi+1)%qs.length;if(qi===0){score=done=0;$("score").textContent="Score: 0 / 0"}quiz()};quiz();
})();