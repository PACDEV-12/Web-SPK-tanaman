const BOBOT0=KRITERIA.map(k=>k.bobot);
let W=BOBOT0.slice();
const KODE=KRITERIA.map(k=>k.kode);
const $=s=>document.querySelector(s);
const f4=x=>x.toFixed(4).replace('.',','), f2=x=>x.toFixed(2).replace('.',',');
const rp=x=>'Rp '+Math.round(x).toLocaleString('id-ID');
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ===== FUNGSI SPK (SAW) ===== */
function skorInterval(v,lo,hi){ // C2,C3,C4: toleransi = lebar rentang ideal
  if(v>=lo&&v<=hi)return 5;
  const jarak=v<lo?lo-v:v-hi, r=jarak/Math.max(hi-lo,1e-9);
  return r<=.25?4:r<=.5?3:r<=1?2:1;}
function skorTanah(t,ideal){
  if(ideal.includes(t))return 5;
  const kom=[['lempung','lempung_berpasir'],['lempung_berpasir','lempung'],['berpasir','lempung_berpasir'],['liat','lempung']];
  return ideal.some(i=>kom.some(([a,b])=>a===t&&b===i))?3:1;}
function skorPh(v,lo,hi){
  if(v>=lo&&v<=hi)return 5;
  const j=Math.min(Math.abs(v-lo),Math.abs(v-hi));
  return j<=.3?4:j<=.7?3:j<=1.2?2:1;}
function buatMatriks(l){ // matriks keputusan X
  return TANAMAN.map(t=>{
    const st=skorTanah(l.tanah,t.tanah), sp=skorPh(l.ph,t.phMin,t.phMax);
    return {t,st,sp,x:[Math.round((st+sp)/2*100)/100,skorInterval(l.air,t.airMin,t.airMax),skorInterval(l.suhu,t.suhuMin,t.suhuMax),skorInterval(l.tinggi,t.tinggiMin,t.tinggiMax),t.biaya,t.panen]};});}
function normalisasi(M){ // benefit: x/max ; cost: min/x
  const cols=KODE.map((_,j)=>M.map(m=>m.x[j]));
  return M.map(m=>m.x.map((x,j)=>KRITERIA[j].atribut==='cost'?Math.min(...cols[j])/x:x/Math.max(...cols[j])));}
function hitungPreferensi(R,w){return R.map(r=>r.reduce((s,v,j)=>s+v*w[j],0));}
function urutkan(M,V,R,w){
  return M.map((m,i)=>({...m,r:R[i],v:V[i],kont:R[i].map((v,j)=>v*w[j])}))
   .sort((a,b)=>b.v-a.v||a.t.nama.localeCompare(b.t.nama)).map((o,i)=>({...o,rank:i+1}));}
function analisis(l,w=W){const M=buatMatriks(l),R=normalisasi(M);return urutkan(M,hitungPreferensi(R,w),R,w);}
const totalW=(w=W)=>w.reduce((a,b)=>a+b,0);
const bobotValid=()=>Math.abs(totalW()-1)<1e-6;
