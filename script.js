// v2.3 'Pretty' with animations and polished UI
const LS_KEYS = { VISITED:'harbour_pools_visited_v2_3', SELECTION:'harbour_pools_selected_v2_3' };

const pools = [
  {name:'Woolwich Baths', lat:-33.83914, lon:151.16943},
  {name:'Northbridge Baths', lat:-33.80637, lon:151.22233},
  {name:'Greenwich Baths', lat:-33.84102, lon:151.18341},
  {name:'Dawn Fraser Baths', lat:-33.85354, lon:151.17325},
  {name:'Clontarf Beach Baths', lat:-33.80680, lon:151.25121},
];

let visited = JSON.parse(localStorage.getItem(LS_KEYS.VISITED) || '{}');
let selectedIndex = Number(localStorage.getItem(LS_KEYS.SELECTION) || 0);

const listView = document.getElementById('listView');
const passportView = document.getElementById('passportView');
const toggleBtn = document.getElementById('toggleBtn');
const resetBtn = document.getElementById('resetBtn');
const countBadge = document.getElementById('countBadge');
const mapToggle = document.getElementById('mapToggle');

function updateCount(){
  const n = Object.values(visited).filter(Boolean).length;
  countBadge.textContent = `${n} / ${pools.length}`;
}

let onPassport = false;
function setView(passport){
  onPassport = passport;
  document.body.classList.remove('full-map');
  listView.classList.toggle('active', !passport);
  passportView.classList.toggle('active', passport);
  toggleBtn.textContent = passport ? 'Back to List' : 'Passport';
  if(passport) renderPassport();
  setTimeout(()=>map.invalidateSize(), 150);
}
toggleBtn.addEventListener('click', ()=> setView(!onPassport));

resetBtn.addEventListener('click', ()=>{
  if(!confirm('Clear all stamps?')) return;
  visited = {};
  localStorage.setItem(LS_KEYS.VISITED, JSON.stringify(visited));
  renderList(); renderPassport(); updateCount();
});

// Full map toggle
mapToggle.addEventListener('click', ()=>{
  const fm = document.body.classList.toggle('full-map');
  mapToggle.textContent = fm ? '📋 Back to Split' : '🗺️ Full Map';
  mapToggle.setAttribute('aria-pressed', fm ? 'true' : 'false');
  setTimeout(()=>{ map.invalidateSize(); panToSelected(); }, 150);
});

function renderList(){
  const list = document.getElementById('poolList');
  list.innerHTML = '';
  pools.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'pool-item';
    row.innerHTML = `
      <div>
        <div class="pool-name">${p.name}</div>
        <div class="coords">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div>
      </div>
      <button class="stamp-chip ${visited[p.name] ? 'stamped':''}" 
        data-name="${p.name}">${visited[p.name] ? 'Stamped' : 'Not yet'}</button>`;

    row.addEventListener('click', (e)=>{
      const t = e.target;
      if(t && t.classList && t.classList.contains('stamp-chip')) return;
      selectIndex(idx);
    });
    row.querySelector('.stamp-chip').addEventListener('click', (e)=>{
      e.stopPropagation();
      const name = e.currentTarget.getAttribute('data-name');
      toggleStamp(name, true);
    });
    list.appendChild(row);
  });
  highlightSelected();
  updateCount();
}

function toggleStamp(name, animate=false){
  visited[name] = !visited[name];
  localStorage.setItem(LS_KEYS.VISITED, JSON.stringify(visited));
  renderList();
  renderPassport(animate ? name : null);
}

function selectIndex(idx){
  selectedIndex = (idx + pools.length) % pools.length;
  localStorage.setItem(LS_KEYS.SELECTION, String(selectedIndex));
  highlightSelected();
  panToSelected();
}

function moveSelection(step){ selectIndex(selectedIndex + step); }
document.getElementById('btnUp').addEventListener('click', ()=>moveSelection(-1));
document.getElementById('btnDown').addEventListener('click', ()=>moveSelection(1));

function highlightSelected(){
  const rows = Array.from(document.querySelectorAll('#poolList .pool-item'));
  rows.forEach((el,i)=> el.classList.toggle('row-selected', i===selectedIndex));
}

// Map using Leaflet
const map = L.map('map').setView([pools[0].lat, pools[0].lon], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap'}).addTo(map);
const marker = L.marker([pools[0].lat, pools[0].lon]).addTo(map);

function panToSelected(){
  const p = pools[selectedIndex];
  marker.setLatLng([p.lat, p.lon]).bindPopup(p.name);
  map.setView([p.lat, p.lon], 15, {animate:true});
}

function renderPassport(popName=null){
  const grid = document.getElementById('passportGrid');
  grid.innerHTML = '';
  pools.forEach(p => {
    const stamped = !!visited[p.name];
    const card = document.createElement('div');
    card.className = 'passport';
    card.innerHTML = `
      <div class="title">${p.name}</div>
      <div class="hint">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div>
      <div class="stamp ${popName===p.name?'pop':''}" style="${stamped?'opacity:.98':'opacity:.45; filter:grayscale(1)'}">
        <img src="assets/stamp.svg" alt="stamp">
        <div class="label">${stamped ? p.name.split(' ')[0].toUpperCase() : 'NOT STAMPED'}</div>
      </div>`;
    grid.appendChild(card);
  });
}

function init(){
  renderList();
  selectIndex(selectedIndex);
  setTimeout(()=> { map.invalidateSize(); panToSelected(); }, 150);
  setView(false);
  updateCount();
}
document.addEventListener('DOMContentLoaded', init);
