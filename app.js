const TABS=[['beranda','Beranda'],['data','Data Lahan & Tanaman'],['bobot','Bobot Kriteria'],['saw','Analisis SAW'],['manual','Hitung Manual'],['sens','Sensitivitas'],['semua','Ringkasan Lahan'],['uji','Pengujian Sistem'],['tentang','Anggota Kelompok']];
let tab='beranda', lahanId=LAHAN[0].id;
const getL=()=>LAHAN.find(l=>l.id===lahanId)||LAHAN[0];
const sel=()=>`<div class="row"><label>Pilih lahan: <select onchange="lahanId=this.value;render()">${LAHAN.map(l=>`<option ${l.id===lahanId?'selected':''} value="${l.id}">${l.id} – ${l.zona}</option>`).join('')}</select></label></div>`;
const lahanTbl=l=>`<div class="tw"><table><tr><th>Lahan</th><th>Zona</th><th>Tanah</th><th class="n">pH</th><th class="n">Air (mm/musim)</th><th class="n">Suhu (°C)</th><th class="n">Tinggi (m)</th><th class="n">Luas (ha)</th></tr><tr><td>${l.id}</td><td>${l.zona}</td><td>${l.tanah}</td><td class="n">${l.ph}</td><td class="n">${l.air}</td><td class="n">${l.suhu}</td><td class="n">${l.tinggi}</td><td class="n">${l.luas}</td></tr></table></div>`;
const blok=()=>bobotValid()?'':`<div class="warn">Total bobot sekarang ${f4(totalW())}, belum 1,0000. Ubah dulu di menu Bobot.</div>`;
const SIN='<p class="note">Seluruh data pada aplikasi ini adalah data sintetis untuk keperluan belajar.</p>';

const V={
beranda:()=>`<div class="card"><h2>Konteks Keputusan</h2>${SIN}
<p><b>Masalah:</b> petani/penyuluh kesulitan membandingkan banyak jenis tanaman sekaligus berdasarkan kondisi lahan (tanah, pH, air, suhu, ketinggian) dan aspek ekonomi (biaya & hasil).</p>
<p><b>Pengambil keputusan:</b> petani atau penyuluh pertanian. <b>Tujuan:</b> menghasilkan peringkat rekomendasi tanaman per lahan yang dapat ditelusuri. <b>Ruang lingkup:</b> ${TANAMAN.length} alternatif tanaman, ${KRITERIA.length} kriteria, ${LAHAN.length} lahan simulasi (Zona A–D).</p>
<p><b>Metode:</b> Simple Additive Weighting (SAW).</p></div>
<div class="card"><h3>Alur SPK</h3><div class="g2">${['Pilih lahan','Konversi kondisi lahan ke skor 1–5 (C1–C4), biaya & panen apa adanya (C5–C6)','Normalisasi: benefit x/max, cost min/x','Kalikan dengan bobot lalu jumlahkan: V = Σ w·r','Urutkan V dari terbesar → rekomendasi'].map(s=>`<div class="box step">${s}</div>`).join('')}</div></div>
<div class="warn">Sistem ini hanya memberi <b>rekomendasi pendukung</b>. Hasil bergantung pada data, kriteria, bobot, dan metode; bukan keputusan mutlak.</div>`,

data:()=>{const q=($('#cari')||{}).value||'',z=($('#zona')||{}).value||'';
 const rows=LAHAN.filter(l=>(l.id+l.tanah).toLowerCase().includes(q.toLowerCase())&&(!z||l.zona===z));
 return `<div class="card"><h2>Kriteria</h2><div class="tw"><table><tr><th>Kode</th><th>Nama</th><th>Atribut</th><th class="n">Bobot</th><th>Satuan</th><th>Definisi</th></tr>${KRITERIA.map((k,i)=>`<tr><td>${k.kode}</td><td>${k.nama}</td><td>${k.atribut}</td><td class="n">${f2(W[i])}</td><td>${k.satuan}</td><td>${k.definisi}</td></tr>`).join('')}</table></div></div>
 <div class="card"><h2>Profil tanaman (alternatif)</h2><div class="tw"><table><tr><th>Kode</th><th>Tanaman</th><th>Tanah ideal</th><th>pH</th><th>Air (mm)</th><th>Suhu (°C)</th><th>Tinggi (m)</th><th class="n">Biaya/ha</th><th class="n">Nilai panen/ha</th></tr>${TANAMAN.map(t=>`<tr><td>${t.kode}</td><td>${t.nama}</td><td>${t.tanah.join(', ')}</td><td>${t.phMin}–${t.phMax}</td><td>${t.airMin}–${t.airMax}</td><td>${t.suhuMin}–${t.suhuMax}</td><td>${t.tinggiMin}–${t.tinggiMax}</td><td class="n">${rp(t.biaya)}</td><td class="n">${rp(t.panen)}</td></tr>`).join('')}</table></div></div>
 <div class="card"><h2>Kondisi lahan (${rows.length} dari ${LAHAN.length})</h2>
 <div class="row"><input id="cari" placeholder="Cari ID / tanah" value="${esc(q)}" oninput="render();$('#cari').focus()"><select id="zona" onchange="render()"><option value="">Semua zona</option>${['Zona A','Zona B','Zona C','Zona D'].map(x=>`<option ${x===z?'selected':''}>${x}</option>`).join('')}</select><button class="btn b-pr" onclick="formLahan()">Tambah lahan</button><button class="btn b-er" onclick="resetLahan()">Kembalikan data awal</button></div>
 <div id="form"></div>
 <div class="tw"><table><tr><th>ID</th><th>Zona</th><th>Tanah</th><th class="n">pH</th><th class="n">Air</th><th class="n">Suhu</th><th class="n">Tinggi</th><th class="n">Luas</th><th></th></tr>${rows.map(l=>`<tr><td>${l.id}</td><td>${l.zona}</td><td>${l.tanah}</td><td class="n">${l.ph}</td><td class="n">${l.air}</td><td class="n">${l.suhu}</td><td class="n">${l.tinggi}</td><td class="n">${l.luas}</td><td><button class="btn b-wr" onclick="formLahan('${l.id}')">Ubah</button> <button class="btn b-er" onclick="hapusLahan('${l.id}')">Hapus</button></td></tr>`).join('')}</table></div></div>`;},

bobot:()=>{const alasan=['Sifat tanah dan pH menentukan penyerapan nutrisi oleh akar tanaman.','Ketersediaan air sangat penting untuk pertumbuhan dan fotosintesis.','Suhu udara memengaruhi laju metabolisme dan fase pembungaan.','Ketinggian lahan memengaruhi tekanan udara dan kelembapan.','Biaya termasuk kriteria cost, sebisa mungkin dihemat.','Hasil panen termasuk kriteria benefit, ingin dimaksimalkan petani.'];
 return `<div class="card"><h2>Atur bobot kriteria</h2><p>Bobot awal disusun dari tingkat kepentingan tiap kriteria dalam budidaya. Ini asumsi untuk simulasi dan sebaiknya diganti dengan hasil wawancara petani atau penyuluh. Total bobot harus 1,00.</p>${blok()}
 <div class="tw"><table><tr><th>Kode</th><th>Kriteria</th><th>Atribut</th><th>Bobot</th><th>Alasan penetapan</th></tr>${KRITERIA.map((k,i)=>`<tr><td>${k.kode}</td><td>${k.nama}</td><td>${k.atribut}</td><td><input type="number" step="0.01" min="0" max="1" style="width:80px" value="${W[i]}" onchange="gantiBobot(${i},this.value)"></td><td style="white-space:normal">${alasan[i]}</td></tr>`).join('')}
 <tr><th colspan="3">Total</th><th class="${bobotValid()?'ok':'er'}">${f4(totalW())}</th><th></th></tr></table></div>
 <div class="row" style="margin-top:10px"><button class="btn b-er" onclick="resetBobot()">Reset ke bobot awal</button></div></div>`;},

saw:()=>{const l=getL();if(!bobotValid())return blok();const h=analisis(l);const mx=h[0].v;
 const byKode=[...h].sort((a,b)=>a.t.kode.localeCompare(b.t.kode));
 const top=[...h[0].kont.map((v,j)=>[KRITERIA[j].nama,v])].sort((a,b)=>b[1]-a[1]).slice(0,2);
 return `${sel()}<div class="card"><h2>(a) Kondisi Lahan</h2>${lahanTbl(l)}</div>
 <div class="card"><h2>(b) Matriks Keputusan X</h2><p>C1 sampai C4 berupa skor 1–5. C5 dan C6 memakai nilai rupiah per hektare.</p><div class="tw"><table><tr><th>Tanaman</th><th class="n">Skor tanah</th><th class="n">Skor pH</th>${KODE.map(k=>`<th class="n">${k}</th>`).join('')}</tr>${byKode.map(m=>`<tr><td>${m.t.nama}</td><td class="n">${m.st}</td><td class="n">${m.sp}</td>${m.x.map((x,j)=>`<td class="n">${j>3?rp(x):f2(x)}</td>`).join('')}</tr>`).join('')}<tr><th colspan="3">Bobot (${KRITERIA.map(k=>k.atribut[0].toUpperCase()).join('/')})</th>${W.map(w=>`<th class="n">${f2(w)}</th>`).join('')}</tr></table></div></div>
 <div class="card"><h2>(c) Normalisasi R</h2><div class="tw"><table><tr><th>Tanaman</th>${KODE.map(k=>`<th class="n">${k}</th>`).join('')}</tr>${byKode.map(m=>`<tr><td>${m.t.nama}</td>${m.r.map(v=>`<td class="n">${f4(v)}</td>`).join('')}</tr>`).join('')}</table></div></div>
 <div class="card"><h2>(d) Kontribusi terbobot (w × r) dan nilai V</h2><div class="tw"><table><tr><th>Tanaman</th>${KODE.map(k=>`<th class="n">${k}</th>`).join('')}<th class="n">V</th></tr>${byKode.map(m=>`<tr><td>${m.t.nama}</td>${m.kont.map(v=>`<td class="n">${f4(v)}</td>`).join('')}<td class="n"><b>${f4(m.v)}</b></td></tr>`).join('')}</table></div></div>
 <div class="card"><h2>(e) Peringkat Rekomendasi</h2><div class="tw"><table><tr><th>#</th><th>Tanaman</th><th class="n">V</th><th style="width:40%">Nilai</th></tr>${h.map(m=>`<tr><td>${m.rank}</td><td>${m.t.nama}</td><td class="n">${f4(m.v)}</td><td><div class="bar" style="width:${m.v/mx*100}%"></div></td></tr>`).join('')}</table></div>
 <div class="box"><b>${h[0].t.nama}</b> adalah tanaman dengan nilai tertinggi untuk lahan ${l.id} (V = ${f4(h[0].v)}). Kontribusi terbesar datang dari ${top[0][0].toLowerCase()} dan ${top[1][0].toLowerCase()}.</div>
 <div class="warn">Hasil ini hanya bahan pertimbangan dan bukan keputusan akhir.</div></div>`;},

manual:()=>{const l=getL();if(!bobotValid())return blok();const h=analisis(l),t=h[0],M=buatMatriks(l),cols=KODE.map((_,j)=>M.map(m=>m.x[j]));
 const ln=t.x.map((x,j)=>{const c=KRITERIA[j].atribut==='cost',F=j>3?rp:f2;return `${KODE[j]} (${KRITERIA[j].atribut}): r = ${c?`min ${F(Math.min(...cols[j]))} / ${F(x)}`:`${F(x)} / max ${F(Math.max(...cols[j]))}`} = ${f4(t.r[j])} → w×r = ${f2(W[j])} × ${f4(t.r[j])} = ${f4(t.kont[j])}`}).join('\n');
 return `${sel()}<div class="card"><h2>Contoh Perhitungan Manual – ${t.t.nama} pada ${l.id}</h2>
 <p>Angka di bawah bisa dicocokkan dengan perhitungan di spreadsheet.</p>
 <div class="box"><code style="white-space:pre">Skor tanah = ${t.st}, skor pH = ${t.sp} → C1 = (${t.st}+${t.sp})/2 = ${f2(t.x[0])}\n\n${esc(ln)}\n\nV = ${t.kont.map(f4).join(' + ')}\n  = <b>${f4(t.v)}</b></code></div>
 <p>Rumus: benefit r = x/max; cost r = min/x; V = Σ(w·r).</p></div>`;},

sens:()=>{const l=getL();const sk={'Bobot saat ini':W,'Bobot awal':BOBOT0,'Utamakan kesesuaian lahan':[.35,.25,.2,.1,.05,.05],'Utamakan ekonomi':[.1,.1,.05,.05,.3,.4],'Sama rata':KODE.map(()=>1/6)};
 const hs=Object.entries(sk).map(([n,w])=>[n,analisis(l,w)]);
 return `${sel()}<div class="card"><h2>Sensitivitas bobot – ${l.id}</h2><p>Perubahan peringkat tanaman jika bobot kriteria diganti.</p><div class="tw"><table><tr><th>Skenario</th>${[1,2,3,4,5,6].map(i=>`<th>#${i}</th>`).join('')}</tr>${hs.map(([n,h])=>`<tr><td><b>${n}</b></td>${h.map(m=>`<td>${m.t.nama} (${f4(m.v)})</td>`).join('')}</tr>`).join('')}</table></div>
 <p>Jika tanaman peringkat 1 berbeda antar skenario, berarti hasilnya cukup dipengaruhi bobot dan perlu dibahas lagi dengan pengambil keputusan.</p></div>`;},

semua:()=>{if(!bobotValid())return blok();const rows=LAHAN.map(l=>{const h=analisis(l);return {l,h:h[0],h2:h[1]};});
 const cnt={};rows.forEach(r=>cnt[r.h.t.nama]=(cnt[r.h.t.nama]||0)+1);
 return `<div class="card"><h2>Ringkasan Seluruh Lahan</h2><div class="row">${Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([n,c])=>`<span class="chip">${n}: ${c} lahan</span>`).join('')}</div><button class="btn b-ok" onclick="csv()">Ekspor CSV</button>
 <div class="tw" style="margin-top:10px"><table><tr><th>Lahan</th><th>Zona</th><th>Tanah</th><th>Peringkat 1</th><th class="n">V</th><th>Peringkat 2</th><th class="n">V</th></tr>${rows.map(r=>`<tr><td>${r.l.id}</td><td>${r.l.zona}</td><td>${r.l.tanah}</td><td><b>${r.h.t.nama}</b></td><td class="n">${f4(r.h.v)}</td><td>${r.h2.t.nama}</td><td class="n">${f4(r.h2.v)}</td></tr>`).join('')}</table></div></div>`;},

uji:()=>`<div class="card"><h2>Pengujian Otomatis</h2><button class="btn b-ok" onclick="jalankanUji(true)">Jalankan Uji Otomatis</button><div id="hasilUji" class="tw" style="margin-top:10px"></div></div>`,

tentang:()=>`<div class="card"><h2>Tentang & Keterbatasan</h2>${SIN}
<p><b>Metode:</b> Simple Additive Weighting (SAW) – normalisasi benefit/cost dan penjumlahan terbobot.</p>
<p><b>Sumber data:</b> dataset sintetis dibangkitkan dengan <code>generate.py</code> (seed 2026): Kriteria, Profil_Tanaman, Kondisi_Lahan.</p>
<p><b>Keterbatasan:</b> data simulasi bukan rekomendasi agronomi nyata; bobot dan batas skor bersifat asumsi; skor C1–C4 diskretisasi 1–5 sehingga kehilangan detail; hasil bergantung pada data, kriteria, bobot, dan metode; bukan keputusan mutlak.</p>
<p><b>Kelompok:</b> [isi nama kelompok] &nbsp;|&nbsp; <b>Anggota:</b> [isi nama/NIM dan peran]</p></div>`};


function formLahan(id){const l=LAHAN.find(x=>x.id===id)||{id:'',zona:'Zona A',tanah:'lempung',ph:6,air:1000,suhu:26,tinggi:500,luas:1};
 $('#form').innerHTML=`<div class="box"><div class="row"><input id="fi" placeholder="ID" value="${l.id}" ${id?'disabled':''} style="width:90px"><select id="fz">${['Zona A','Zona B','Zona C','Zona D'].map(z=>`<option ${z===l.zona?'selected':''}>${z}</option>`).join('')}</select><select id="ft">${['liat','lempung','lempung_berpasir','berpasir'].map(z=>`<option ${z===l.tanah?'selected':''}>${z}</option>`).join('')}</select>
 pH<input id="fp" type="number" step="0.1" value="${l.ph}" style="width:70px"> Air<input id="fa" type="number" value="${l.air}" style="width:80px"> Suhu<input id="fs" type="number" step="0.1" value="${l.suhu}" style="width:70px"> Tinggi<input id="fh" type="number" value="${l.tinggi}" style="width:80px"> Luas<input id="fl" type="number" step="0.01" value="${l.luas}" style="width:70px"><button class="btn b-ok" onclick="simpanLahan(${id?`'${id}'`:'null'})">Simpan</button></div></div>`;}
function simpanLahan(id){const o={id:id||$('#fi').value.trim(),zona:$('#fz').value,tanah:$('#ft').value,ph:+$('#fp').value,air:+$('#fa').value,suhu:+$('#fs').value,tinggi:+$('#fh').value,luas:+$('#fl').value};
 if(!o.id||[o.ph,o.air,o.suhu,o.tinggi,o.luas].some(isNaN)||o.ph<0||o.ph>14||o.luas<=0)return alert('Data tidak valid (ID wajib, pH 0–14, luas > 0).');
 const i=LAHAN.findIndex(x=>x.id===o.id);if(id)LAHAN[i]=o;else if(i>=0)return alert('ID sudah ada.');else LAHAN.push(o);render();}
function hapusLahan(id){if(LAHAN.length<=1)return alert('Minimal 1 lahan.');if(!confirm('Hapus '+id+'?'))return;LAHAN=LAHAN.filter(l=>l.id!==id);if(lahanId===id)lahanId=LAHAN[0].id;render();}
function csv(){const r=['id_lahan,zona,peringkat_1,v1,peringkat_2,v2'];LAHAN.forEach(l=>{const h=analisis(l);r.push([l.id,l.zona,h[0].t.nama,h[0].v.toFixed(6),h[1].t.nama,h[1].v.toFixed(6)].join(','));});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.join('\n')],{type:'text/csv'}));a.download='hasil_saw.csv';a.click();}
function jalankanUji(tampil){const l=LAHAN[0],h=analisis(l,BOBOT0),M=buatMatriks(l),R=normalisasi(M);
 // referensi manual independen: lahan L001 (lempung, pH 5.7, air 2091, suhu 31.6, tinggi 448) untuk Padi
 const padi=h.find(m=>m.t.kode==='T06');
 const T=[
 ['Total bobot awal = 1',Math.abs(totalW(BOBOT0)-1)<1e-9],
 ['Semua V berada di (0,1]',h.every(m=>m.v>0&&m.v<=1+1e-9)],
 ['Nilai maksimum tiap kolom benefit = 1',KRITERIA.every((k,j)=>k.atribut==='cost'||Math.abs(Math.max(...R.map(r=>r[j]))-1)<1e-9)],
 ['Nilai maksimum kolom cost (C5) = 1 pada biaya terendah',Math.abs(Math.max(...R.map(r=>r[4]))-1)<1e-9&&R.every((r,i)=>M[i].x[4]>=Math.min(...M.map(m=>m.x[4]))&&r[4]<=1)],
 ['Peringkat terurut menurun',h.every((m,i)=>i===0||h[i-1].v>=m.v)],
 ['Skor C2–C4 selalu 1–5',M.every(m=>m.x.slice(1,4).every(x=>x>=1&&x<=5&&Number.isInteger(x)))],
 ['Skor interval: dalam rentang = 5, jauh di luar = 1',skorInterval(500,400,900)===5&&skorInterval(5000,400,900)===1],
 ['Contoh manual L001-Padi: C2 = 5, C3 = 3, C4 = 5 (air 2091 ∈ 1000–2200; suhu 31.6 > 32? tidak → 5)',null],
 ['Total jumlah kontribusi = V',h.every(m=>Math.abs(m.kont.reduce((a,b)=>a+b,0)-m.v)<1e-9)],
 ['Bobot ≠ 1 ditolak (validasi aktif)',!(Math.abs(totalW([.5,.5,.5,0,0,0])-1)<1e-6)],
 ['Data lahan lengkap (tanpa nilai kosong)',LAHAN.every(x=>Object.values(x).every(v=>v!==''&&v!==null&&!Number.isNaN(v)))]];
 // ganti uji referensi manual dengan hitungan independen
 const xp=buatMatriks(l).find(m=>m.t.kode==='T06').x;
 const ref=[ (skorTanah('lempung',['liat','lempung'])+skorPh(5.7,5,7))/2, 5, 5, 5 ];
 T[7]=['Referensi manual L001–Padi: C1..C4 = '+ref.map(f2).join('; ')+' (toleransi 0,0001)',ref.every((v,j)=>Math.abs(v-xp[j])<1e-4)];
 $('#hasilUji').innerHTML='<table><tr><th>Uji</th><th>Hasil</th></tr>'+T.map(([n,ok])=>`<tr><td style="white-space:normal">${n}</td><td class="${ok?'ok':'er'}">${ok?'LULUS':'GAGAL'}</td></tr>`).join('')+`</table><p>${T.filter(t=>t[1]).length}/${T.length} lulus.</p>`;}


const LAHAN0=JSON.parse(JSON.stringify(LAHAN));
const JUDUL={beranda:'Beranda',data:'Data',bobot:'Bobot Kriteria',saw:'Analisis SAW',manual:'Hitung Manual',sens:'Analisis Sensitivitas',semua:'Ringkasan Semua Lahan',uji:'Pengujian',tentang:'Tentang'};
const ANGGOTA=[['Yoakim Perang Kedang','250030736',''],['Chairil Rafi Purnama','260030224',''],['I Putu Indra Arsana','200030707','']];
function nav(){$('#nav').innerHTML=TABS.map(([k,n])=>`<a href="#${k}" class="${k===tab?'on':''}" ${k===tab?'aria-current="page"':''}>${n}</a>`).join('');}
function render(){$('#judul').textContent=JUDUL[tab];document.title=JUDUL[tab]+' - SPK Tanaman SAW';$('#main').innerHTML=V[tab]();}
function rute(){const k=(location.hash||'#beranda').slice(1);tab=V[k]?k:'beranda';nav();render();document.body.classList.remove('open');window.scrollTo(0,0);}
function go(k){location.hash=k;}

/* Tambah / ubah lahan lewat dialog */
let editId=null;
function formLahan(id){editId=id||null;
 const l=LAHAN.find(x=>x.id===id)||{id:'L'+String(LAHAN.length+1).padStart(3,'0'),zona:'Zona A',tanah:'lempung',ph:6,air:1000,suhu:26,tinggi:500,luas:1};
 [['id','fi'],['zona','fz'],['tanah','ft'],['ph','fp'],['air','fa'],['suhu','fs'],['tinggi','fh'],['luas','fl']].forEach(([k,e])=>$('#'+e).value=l[k]);
 $('#fi').disabled=!!id;$('#dlgJudul').textContent=id?'Ubah lahan '+id:'Tambah lahan';$('#dlg').showModal();}
function simpanLahan(ev){ev.preventDefault();
 const o={id:editId||$('#fi').value.trim(),zona:$('#fz').value,tanah:$('#ft').value,ph:+$('#fp').value,air:+$('#fa').value,suhu:+$('#fs').value,tinggi:+$('#fh').value,luas:+$('#fl').value};
 const i=LAHAN.findIndex(x=>x.id===o.id);
 if(!editId&&i>=0)return alert('ID '+o.id+' sudah dipakai.');
 if(editId)LAHAN[i]=o;else LAHAN.push(o);
 $('#dlg').close();render();}

/* Beranda */
V.beranda=()=>`<div class="warn"><b>Data sintetis.</b> Semua data lahan, profil tanaman, biaya, dan hasil panen di aplikasi ini dibuat dengan skrip <code>generate.py</code> untuk latihan. Angkanya tidak mewakili kondisi lahan yang sebenarnya.</div>
<div class="card"><h2>SPK Pemilihan Jenis Tanaman</h2>
<p>Aplikasi ini dipakai untuk membandingkan enam jenis tanaman pada satu bidang lahan. Pilih lahannya, lalu program menghitung nilai tiap tanaman dengan metode SAW dan mengurutkannya dari yang paling cocok.</p>
<div class="row"><button class="btn" onclick="go('saw')">Mulai analisis</button><button class="btn s" onclick="go('manual')">Lihat hitung manual</button></div></div>
<div class="stats"><div><b>${TANAMAN.length}</b><span>tanaman (alternatif)</span></div><div><b>${KRITERIA.length}</b><span>kriteria</span></div><div><b>${LAHAN.length}</b><span>lahan, Zona A sampai D</span></div><div><b class="${bobotValid()?'ok':'er'}">${f2(totalW())}</b><span>total bobot</span></div></div>
<div class="card"><h2>Konteks keputusan</h2><div class="cols">
<div><h4>Masalah</h4><p>Pemilihan tanaman sering hanya mengikuti kebiasaan atau harga yang sedang naik. Padahal tiap tanaman butuh jenis tanah, pH, air, suhu, dan ketinggian yang berbeda, dengan biaya dan hasil yang berbeda juga.</p></div>
<div><h4>Siapa yang memakai</h4><p>Petani atau kelompok tani, dan penyuluh pertanian yang membantu menyusun rencana tanam satu musim.</p></div>
<div><h4>Tujuan dan batasan</h4><p>Menghasilkan urutan tanaman untuk tiap lahan beserta hitungannya. Batasannya: hanya 6 tanaman, 6 kriteria, dan data simulasi.</p></div></div></div>
<div class="card"><h2>Alur perhitungan</h2><ol class="steps"><li>Pilih lahan yang mau dianalisis.</li><li>Kondisi lahan (tanah, pH, air, suhu, ketinggian) dicocokkan dengan kebutuhan tiap tanaman dan diubah menjadi skor 1 sampai 5 (C1 sampai C4).</li><li>Skor itu digabung dengan biaya budidaya (C5) dan nilai panen (C6) menjadi matriks keputusan.</li><li>Matriks dinormalisasi: kriteria benefit dibagi nilai terbesar, kriteria cost memakai nilai terkecil dibagi nilai tanaman.</li><li>Tiap nilai dikali bobot lalu dijumlahkan menjadi nilai V.</li><li>Tanaman diurutkan dari V terbesar.</li></ol>
<p class="note" style="margin:12px 0 0">Hasilnya bergantung pada data, kriteria, bobot, dan metode yang dipakai, jadi sifatnya saran, bukan keputusan akhir.</p></div>`;

/* Sensitivitas dengan slider */
let SW=BOBOT0.slice();
const PRESET={'Bobot awal':BOBOT0,'Utamakan kesesuaian lahan':[.35,.25,.2,.1,.05,.05],'Utamakan ekonomi':[.1,.1,.05,.05,.3,.4],'Sama rata':KODE.map(()=>1/6)};
function hasilSens(){const l=getL(),tot=totalW(SW);
 const h0=analisis(l,BOBOT0),h1=analisis(l,tot>0?SW.map(x=>x/tot):BOBOT0),r0={};h0.forEach(m=>r0[m.t.kode]=m.rank);
 $('#totSW').textContent=f2(tot);
 $('#hasilSens').innerHTML=`<div class="tw"><table><tr><th>Peringkat baru</th><th>Tanaman</th><th class="n">V (bobot baru)</th><th class="n">Peringkat awal</th><th>Perubahan</th></tr>${h1.map(m=>{const d=r0[m.t.kode]-m.rank;return `<tr><td>${m.rank}</td><td>${m.t.nama}</td><td class="n">${f4(m.v)}</td><td class="n">${r0[m.t.kode]}</td><td>${d>0?'naik '+d:d<0?'turun '+(-d):'tetap'}</td></tr>`}).join('')}</table></div>
 <p style="margin-top:10px">${h1[0].t.kode===h0[0].t.kode?'Peringkat 1 tidak berubah ('+h1[0].t.nama+'), jadi hasilnya cukup stabil terhadap perubahan bobot ini.':'Peringkat 1 berubah dari '+h0[0].t.nama+' menjadi '+h1[0].t.nama+'. Artinya hasil cukup dipengaruhi bobot.'}</p>`;}
function gantiSW(i,v){SW[i]=+v;$('#sv'+i).textContent=f2(SW[i]);hasilSens();}
function pakaiPreset(n){SW=PRESET[n].slice();render();notif('Preset '+n+' diterapkan','ok');}
V.sens=()=>{setTimeout(hasilSens,0);return `${sel()}<div class="card"><h2>Atur bobot</h2><p>Geser bobot untuk melihat apakah urutan tanaman berubah. Kalau totalnya bukan 1, bobot dibagi total dulu sebelum dihitung.</p>
<div class="row">${Object.keys(PRESET).map(n=>`<button class="btn s" onclick="pakaiPreset('${n}')">${n}</button>`).join('')}</div>
${KRITERIA.map((k,i)=>`<div class="sl"><span>${k.kode} ${k.nama}</span><input type="range" min="0" max="1" step="0.01" value="${SW[i]}" oninput="gantiSW(${i},this.value)"><span id="sv${i}">${f2(SW[i])}</span></div>`).join('')}
<p style="margin-top:8px">Total bobot: <b id="totSW"></b></p></div>
<div class="card"><h2>Hasil untuk lahan ${getL().id}</h2><div id="hasilSens"></div></div>`;};

/* Ringkasan semua lahan */
let fz='',ft='';
V.semua=()=>{if(!bobotValid())return blok();
 const rows=LAHAN.filter(l=>!fz||l.zona===fz).map(l=>{const h=analisis(l);return {l,a:h[0],b:h[1]}}).filter(r=>!ft||r.a.t.nama===ft);
 const cnt={};rows.forEach(r=>cnt[r.a.t.nama]=(cnt[r.a.t.nama]||0)+1);
 return `<div class="card"><div class="row"><label>Zona <select onchange="fz=this.value;render()"><option value="">Semua</option>${['Zona A','Zona B','Zona C','Zona D'].map(z=>`<option ${z===fz?'selected':''}>${z}</option>`).join('')}</select></label>
 <label>Peringkat 1 <select onchange="ft=this.value;render()"><option value="">Semua</option>${TANAMAN.map(t=>`<option ${t.nama===ft?'selected':''}>${t.nama}</option>`).join('')}</select></label><button class="btn b-ok" onclick="csv()">Unduh CSV</button></div>
 <p>${rows.length} lahan ditampilkan. ${Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([n,c])=>`<span class="chip">${n}: ${c}</span>`).join('')}</p>
 <div class="tw"><table><tr><th>Lahan</th><th>Zona</th><th>Tanah</th><th>Peringkat 1</th><th class="n">V</th><th>Peringkat 2</th><th class="n">V</th><th></th></tr>${rows.map(r=>`<tr><td>${r.l.id}</td><td>${r.l.zona}</td><td>${r.l.tanah}</td><td><b>${r.a.t.nama}</b></td><td class="n">${f4(r.a.v)}</td><td>${r.b.t.nama}</td><td class="n">${f4(r.b.v)}</td><td><button class="btn s" onclick="lahanId='${r.l.id}';go('saw')">Detail</button></td></tr>`).join('')}</table></div></div>`;};

/* Tentang */
V.tentang=()=>`<div class="card"><h2>Identitas kelompok</h2><div class="tw"><table class="kv"><tr><th>Kelompok</th><td>Kelompok III</td></tr><tr><th>Mata kuliah</th><td>Sistem Pendukung Keputusan</td></tr><tr><th>Topik</th><td>Pemilihan jenis tanaman berdasarkan kondisi lahan (SAW)</td></tr></table></div>
<h4 style="margin-top:14px">Anggota</h4><div class="tw"><table><tr><th>No</th><th>Nama</th><th>NIM</th><th>Peran</th></tr>${ANGGOTA.map((a,i)=>`<tr><td>${i+1}</td><td>${a[0]}</td><td>${a[1]}</td><td>${a[2]||'............'}</td></tr>`).join('')}</table></div></div>
<div class="card"><h2>Metode SAW</h2><p>SAW (Simple Additive Weighting) atau penjumlahan terbobot: nilai tiap alternatif pada setiap kriteria dinormalisasi, dikalikan bobot, lalu dijumlahkan.</p>
<div class="box"><code>Benefit : r = x / max(x)<br>Cost    : r = min(x) / x<br>Nilai   : V = jumlah (w × r)</code></div>
<p>Alternatif dengan V paling besar berada di peringkat pertama. Skor C1 sampai C4 diperoleh dari kecocokan kondisi lahan dengan rentang ideal tanaman (5 jika masuk rentang, makin kecil jika makin jauh), sedangkan C5 dan C6 memakai nilai rupiah per hektare apa adanya.</p></div>
<div class="card"><h2>Keterbatasan</h2><ul><li>Datanya simulasi, jadi hasilnya tidak bisa dipakai sebagai rekomendasi tanam yang sebenarnya.</li><li>Bobot dan batas skor adalah asumsi kami, belum dari wawancara petani atau penyuluh.</li><li>Skor 1 sampai 5 membuat selisih kecil antar kondisi lahan tidak terlihat.</li><li>Hama, harga pasar, pupuk, tenaga kerja, dan irigasi belum dihitung.</li><li>Perubahan data lahan dan bobot hilang kalau halaman dimuat ulang.</li></ul></div>
<div class="card"><h2>Referensi</h2><ol><li>Kusumadewi, S., Hartati, S., Harjoko, A., dan Wardoyo, R. (2006). <i>Fuzzy Multi-Attribute Decision Making (Fuzzy MADM)</i>. Yogyakarta: Graha Ilmu.</li><li>Fishburn, P. C. (1967). Additive utilities with incomplete product sets: application to priorities and assignments. <i>Operations Research</i>, 15(3), 537-542.</li><li>MacCrimmon, K. R. (1968). <i>Decision Making Among Multiple-Attribute Alternatives: A Survey and Consolidated Approach</i>. RAND Memorandum RM-4823-ARPA.</li><li>Turban, E., Sharda, R., dan Delen, D. (2011). <i>Decision Support and Business Intelligence Systems</i> (edisi ke-9). Pearson.</li></ol></div>`;


/* ---- penyesuaian akhir ---- */
const REF_L001={"T06": 0.842403, "T05": 0.753042, "T01": 0.665325, "T02": 0.637358, "T03": 0.608282, "T04": 0.596569};
const JUDUL2={beranda:'Beranda & Konteks Keputusan',data:'Data Lahan & Tanaman',bobot:'Bobot Kriteria',saw:'Analisis SAW',manual:'Hitung Manual',sens:'Uji Sensitivitas Bobot',uji:'Pengujian Sistem',tentang:'Anggota Kelompok'};
function simpan(){try{localStorage.setItem('spk-saw-k3',JSON.stringify({l:LAHAN,w:W}))}catch(e){}}
let tmr;
const IKON={
 ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="lg" cx="12" cy="12" r="10"/><path class="cr" d="M7.5 12.5l3 3 6-6.5"/></svg>',
 er:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="lg" cx="12" cy="12" r="10"/><path class="cr" d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>',
 wr:'<svg viewBox="0 0 24 24" aria-hidden="true"><path class="lg" d="M12 3.5l9.5 16.5h-19z"/><path class="cr" d="M12 10v4.5M12 17.2v.1"/></svg>'};
function notif(m,tipe){tipe=tipe||'ok';const t=$('#toast');t.className='';void t.offsetWidth;
 t.innerHTML='<span class="ti">'+IKON[tipe]+'</span><span class="tm"></span><i class="tb"></i>';t.querySelector('.tm').textContent=m;
 t.setAttribute('role',tipe==='er'?'alert':'status');t.classList.add('on',tipe);clearTimeout(tmr);tmr=setTimeout(()=>t.classList.remove('on'),3000);}
function render(){const j=tab==='semua'?'Ringkasan '+LAHAN.length+' Lahan':JUDUL2[tab];$('#judul').textContent=j;document.title=j+' - SPK Tanaman SAW';$('#main').innerHTML=V[tab]();simpan();}
function simpanLahan(ev){ev.preventDefault();
 const o={id:editId||$('#fi').value.trim(),zona:$('#fz').value,tanah:$('#ft').value,ph:+$('#fp').value,air:+$('#fa').value,suhu:+$('#fs').value,tinggi:+$('#fh').value,luas:+$('#fl').value};
 const i=LAHAN.findIndex(x=>x.id===o.id);
 if(!o.id)return notif('ID lahan wajib diisi','er');
 if([o.ph,o.air,o.suhu,o.tinggi,o.luas].some(isNaN)||o.ph<0||o.ph>14||o.luas<=0)return notif('Data tidak valid: pH harus 0–14 dan luas lebih dari 0','er');
 if(!editId&&i>=0)return notif('ID '+o.id+' sudah dipakai','er');
 if(editId)LAHAN[i]=o;else LAHAN.push(o);
 $('#dlg').close();render();notif('Data lahan '+o.id+' berhasil disimpan','ok');}
function hapusLahan(id){if(LAHAN.length<=1)return notif('Gagal: minimal harus ada 1 lahan','er');if(!confirm('Hapus lahan '+id+'?'))return;LAHAN=LAHAN.filter(l=>l.id!==id);if(lahanId===id)lahanId=LAHAN[0].id;render();notif('Lahan '+id+' berhasil dihapus','ok');}
const _csv=csv;csv=function(){try{if(!LAHAN.length)return notif('Gagal: tidak ada data untuk diekspor','er');_csv();notif('File CSV berhasil diunduh','ok');}catch(e){notif('Gagal membuat file CSV','er');}};

const STATUS=['Prioritas utama','Alternatif layak','Alternatif layak','Kurang sesuai','Kurang sesuai','Kurang sesuai'];
V.saw=()=>{const l=getL();if(!bobotValid())return sel()+blok();
 const h=analisis(l),mx=h[0].v,by=[...h].sort((a,b)=>a.t.kode.localeCompare(b.t.kode));
 const top=h[0].kont.map((v,j)=>[KRITERIA[j].nama,v]).sort((a,b)=>b[1]-a[1]).slice(0,2);
 const th=KODE.map(k=>`<th class="n">${k}</th>`).join('');
 return `${sel()}
 <div class="card"><h3>Kondisi lahan ${l.id}</h3>${lahanTbl(l)}</div>
 <div class="card"><h3>Hasil rekomendasi</h3><div class="tw"><table><tr><th>Peringkat</th><th>Tanaman</th><th class="n">Nilai V</th><th>Status</th><th style="width:28%">Perbandingan</th></tr>${h.map(m=>`<tr class="${m.rank===1?'top1':''}"><td>${m.rank}</td><td>${m.t.nama}</td><td class="n">${f4(m.v)}</td><td><span class="st s${m.rank===1?1:m.rank<=3?2:3}">${STATUS[m.rank-1]}</span></td><td><div class="bar" style="width:${m.v/mx*100}%"></div></td></tr>`).join('')}</table></div>
 <p class="note" style="margin:12px 0 0">Untuk lahan ${l.id}, ${h[0].t.nama} punya nilai tertinggi (V = ${f4(h[0].v)}). Kontribusi terbesarnya dari ${top[0][0].toLowerCase()} dan ${top[1][0].toLowerCase()}. Hasil ini bahan pertimbangan, bukan keputusan akhir.</p></div>
 <div class="card"><h3>1. Matriks keputusan (X)</h3><p>C1 sampai C4 berupa skor 1 sampai 5, C5 dan C6 dalam rupiah per hektare.</p><div class="tw"><table><tr><th>Tanaman</th><th class="n">Skor tanah</th><th class="n">Skor pH</th>${th}</tr>${by.map(m=>`<tr><td>${m.t.nama}</td><td class="n">${m.st}</td><td class="n">${m.sp}</td>${m.x.map((x,j)=>`<td class="n">${j>3?rp(x):f2(x)}</td>`).join('')}</tr>`).join('')}<tr><th colspan="3">Bobot (${KRITERIA.map(k=>k.atribut[0].toUpperCase()).join('/')})</th>${W.map(w=>`<th class="n">${f2(w)}</th>`).join('')}</tr></table></div></div>
 <div class="card"><h3>2. Matriks normalisasi (R)</h3><div class="tw"><table><tr><th>Tanaman</th>${th}</tr>${by.map(m=>`<tr><td>${m.t.nama}</td>${m.r.map(v=>`<td class="n">${f4(v)}</td>`).join('')}</tr>`).join('')}</table></div></div>
 <div class="card"><h3>3. Perkalian bobot dan nilai akhir (V)</h3><div class="tw"><table><tr><th>Tanaman</th>${th}<th class="n">V</th></tr>${by.map(m=>`<tr><td>${m.t.nama}</td>${m.kont.map(v=>`<td class="n">${f4(v)}</td>`).join('')}<td class="n"><b>${f4(m.v)}</b></td></tr>`).join('')}</table></div></div>`;};

function jalankanUji(tampil){
 const T=[],add=(n,k,t,r,ok)=>T.push([n,k,t,r,ok]);
 const all=LAHAN.map(l=>analisis(l,BOBOT0)),vs=all.flat().map(m=>m.v);
 const l0=LAHAN0[0],M=buatMatriks(l0),R=normalisasi(M),minC5=Math.min(...M.map(m=>m.x[4]));
 add('Total bobot','Jumlah bobot awal harus 1,00','1,0000',f4(totalW(BOBOT0)),Math.abs(totalW(BOBOT0)-1)<1e-9);
 add('Rentang nilai V',`V pada ${LAHAN.length} lahan harus di antara 0 dan 1`,'0 < V ≤ 1',f4(Math.min(...vs))+' s.d. '+f4(Math.max(...vs)),vs.every(v=>v>0&&v<=1+1e-9));
 add('Normalisasi benefit','Nilai terbesar tiap kolom benefit menjadi 1','1,0000','L001',[0,1,2,3,5].every(j=>Math.abs(Math.max(...R.map(r=>r[j]))-1)<1e-9));
 add('Normalisasi cost','r = min/x, biaya terendah menjadi 1','1,0000','L001',Math.abs(Math.max(...R.map(r=>r[4]))-1)<1e-9&&R.every((r,i)=>Math.abs(r[4]*M[i].x[4]-minC5)<1e-3));
 add('Skor kesesuaian','C2 sampai C4 bilangan bulat 1 sampai 5, C1 di 1 sampai 5','1 s.d. 5','semua lahan',LAHAN.every(l=>buatMatriks(l).every(m=>m.x[0]>=1&&m.x[0]<=5&&m.x.slice(1,4).every(x=>Number.isInteger(x)&&x>=1&&x<=5))));
 add('Urutan peringkat','Nilai V harus menurun dari peringkat 1','menurun','semua lahan',all.every(h=>h.every((m,i)=>i===0||h[i-1].v>=m.v-1e-12)));
 const hh=analisis(l0,BOBOT0),sel0=Object.fromEntries(hh.map(m=>[m.t.kode,m.v])),sel1=Math.max(...Object.keys(REF_L001).map(k=>Math.abs(REF_L001[k]-sel0[k])));
 add('Pembanding Python (L001)','Nilai V enam tanaman dibanding hitungan core.py, toleransi 0,00001','selisih < 0,00001','selisih maks '+sel1.toExponential(1),sel1<1e-5);
 add('Jumlah kontribusi','Jumlah w×r tiap tanaman sama dengan V','selisih < 1e-9','semua lahan',all.every(h=>h.every(m=>Math.abs(m.kont.reduce((a,b)=>a+b,0)-m.v)<1e-9)));
 add('Validasi bobot','Bobot yang totalnya bukan 1 harus ditolak','ditolak',Math.abs(totalW([.5,.5,.5,0,0,0])-1)>1e-6?'ditolak':'lolos',Math.abs(totalW([.5,.5,.5,0,0,0])-1)>1e-6);
 const ek=analisis({id:'X',zona:'Zona A',tanah:'liat',ph:14,air:0,suhu:50,tinggi:5000,luas:1},BOBOT0);
 add('Data ekstrem','pH 14, air 0, suhu 50, tinggi 5000 tidak boleh menghasilkan NaN','angka valid',ek.every(m=>isFinite(m.v))?'valid':'NaN',ek.every(m=>isFinite(m.v)));
 add('Kelengkapan data','Tidak ada nilai kosong dan ID lahan unik','lengkap',LAHAN.length+' lahan',LAHAN.every(x=>Object.values(x).every(v=>v!==''&&v!==null&&!Number.isNaN(v)))&&new Set(LAHAN.map(x=>x.id)).size===LAHAN.length);
 add('Syarat dataset','Minimal 5 alternatif dan 4 kriteria','≥ 5 dan ≥ 4',TANAMAN.length+' dan '+KRITERIA.length,TANAMAN.length>=5&&KRITERIA.length>=4);
 const ok=T.filter(t=>t[4]).length;
 $('#hasilUji').innerHTML=`<p><b class="${ok===T.length?'ok':'er'}">${ok} dari ${T.length} pengujian lulus.</b></p><div class="tw"><table><tr><th>No</th><th>Pengujian</th><th>Kondisi</th><th>Target</th><th>Hasil</th><th>Status</th></tr>${T.map((t,i)=>`<tr><td>${i+1}</td><td>${t[0]}</td><td style="white-space:normal">${t[1]}</td><td>${t[2]}</td><td>${t[3]}</td><td class="${t[4]?'ok':'er'}">${t[4]?'Lulus':'Gagal'}</td></tr>`).join('')}</table></div>`;
 if(tampil)ok===T.length?notif('Semua '+T.length+' pengujian lulus','ok'):notif((T.length-ok)+' pengujian gagal, lihat tabel','er');}
V.uji=()=>{setTimeout(jalankanUji,0);return `<div class="card"><h3>Uji otomatis ketepatan perhitungan</h3><p>Pengujian dijalankan langsung di browser memakai data yang sedang aktif. Satu pengujian membandingkan hasil dengan hitungan <code>core.py</code> sebagai pembanding.</p><div class="row"><button class="btn b-ok" onclick="jalankanUji(true)">Jalankan ulang</button></div><div id="hasilUji"></div></div>`;};

const ANGGOTA2=[['Yoakim Perang Kedang','250030736','Logika sistem dan algoritma SAW','Merancang rumus, konversi skor 1 sampai 5, fungsi normalisasi benefit dan cost, serta menguji kebenaran hitungan.'],['Chairil Rafi Purnama','260030224','Desain tampilan dan interaksi','Membuat antarmuka web, navigasi sidebar kiri, tabel responsif, mode gelap dan terang, serta kemudahan pemakaian.'],['I Putu Indra Arsana','200030707','Data lahan dan laporan','Menyiapkan dataset 50 kondisi lahan, memeriksa kriteria acuan tanaman, mengolah data, dan menyusun laporan akhir.']];
V.tentang=()=>`<div class="card"><h3>Kelompok III</h3><p>Mata kuliah Sistem Pendukung Keputusan. Topik: pemilihan jenis tanaman berdasarkan kondisi lahan dengan metode SAW.</p>
<div class="members">${ANGGOTA2.map(a=>`<div class="mem"><b>${a[0]}</b><small>NIM ${a[1]}</small><span class="fokus">${a[2]}</span><p style="margin:4px 0 0;font-size:13.5px">${a[3]}</p></div>`).join('')}</div></div>
<div class="card"><h3>Rumus SAW yang dipakai</h3><div class="box"><code>Benefit : r = x / max(x)<br>Cost    : r = min(x) / x<br>Nilai   : V = jumlah (w × r)</code></div><p>Nilai V paling besar berarti tanaman itu paling direkomendasikan untuk kondisi lahan tersebut. Skor C1 sampai C4 berasal dari kecocokan kondisi lahan dengan rentang ideal tanaman: 5 jika masuk rentang, makin kecil jika makin jauh. C5 dan C6 memakai nilai rupiah per hektare.</p></div>
<div class="card"><h3>Keterbatasan</h3><ul><li>Datanya simulasi, jadi hasilnya bukan rekomendasi tanam yang sebenarnya.</li><li>Bobot dan batas skor adalah asumsi kelompok, belum dari wawancara petani atau penyuluh.</li><li>Skala 1 sampai 5 membuat selisih kecil antar kondisi lahan tidak terlihat.</li><li>Hama, harga pasar, pupuk, tenaga kerja, dan irigasi belum dihitung.</li><li>Perubahan data lahan dan bobot disimpan di browser yang dipakai saja.</li></ul></div>
<div class="card"><h3>Referensi</h3><ol><li>Kusumadewi, S., Hartati, S., Harjoko, A., dan Wardoyo, R. (2006). <i>Fuzzy Multi-Attribute Decision Making (Fuzzy MADM)</i>. Yogyakarta: Graha Ilmu.</li><li>Fishburn, P. C. (1967). Additive utilities with incomplete product sets: application to priorities and assignments. <i>Operations Research</i>, 15(3).</li><li>MacCrimmon, K. R. (1968). <i>Decision Making Among Multiple-Attribute Alternatives: A Survey and Consolidated Approach</i>. RAND Memorandum RM-4823-ARPA.</li><li>Turban, E., Sharda, R., dan Delen, D. (2011). <i>Decision Support and Business Intelligence Systems</i> (edisi ke-9). Pearson.</li></ol></div>`;

/* ---- menu, tema, muat data tersimpan, rute ---- */
$('#menu').onclick=()=>document.body.classList.toggle('open');
$('#scrim').onclick=()=>document.body.classList.remove('open');
$('#tema').onclick=()=>{const d=document.documentElement,gelap=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=gelap?'light':'dark';$('#tema').textContent=gelap?'Mode gelap':'Mode terang';};
try{const s=JSON.parse(localStorage.getItem('spk-saw-k3')||'null');if(s&&Array.isArray(s.l)&&s.l.length&&Array.isArray(s.w)&&s.w.length===6){LAHAN=s.l;W=s.w;}}catch(e){}
window.addEventListener('hashchange',rute);
rute();

/* Animasi perpindahan halaman: hanya saat ganti menu, bukan tiap ketikan */
(function(){const r=render;let last;render=function(){const m=document.getElementById('main');const ganti=last!==tab;last=tab;r();if(ganti){m.classList.remove('enter');void m.offsetWidth;m.classList.add('enter');}};})();

/* Aksi tombol dengan notifikasi centang / silang */
function resetBobot(){W=BOBOT0.slice();render();notif('Bobot dikembalikan ke nilai awal','ok');}
function resetLahan(){LAHAN=JSON.parse(JSON.stringify(LAHAN0));if(!LAHAN.some(l=>l.id===lahanId))lahanId=LAHAN[0].id;render();notif('Data lahan dikembalikan ke data awal','ok');}
function gantiBobot(i,v){const x=parseFloat(String(v).replace(',','.'));if(isNaN(x)||x<0||x>1){render();return notif('Bobot harus berupa angka 0 sampai 1','er');}
 W[i]=x;render();const tot=totalW(W);Math.abs(tot-1)<1e-6?notif('Total bobot 1,00, siap dipakai','ok'):notif('Total bobot '+f2(tot)+', harus 1,00','er');}
