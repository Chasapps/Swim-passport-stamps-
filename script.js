// Harbour Pools - Passport + Map
// Local storage keys
const LS_KEYS = {
  VISITED: 'harbour_pools_visited_v2',
  SELECTION: 'harbour_pools_selected_v2'
};

// Pools dataset
const pools = [
  {name:'Woolwich Baths', lat:-33.83914, lon:151.16943},
  {name:'Northbridge Baths', lat:-33.80637, lon:151.22233},
  {name:'Greenwich Baths', lat:-33.84102, lon:151.18341},
  {name:'Dawn Fraser Baths', lat:-33.85354, lon:151.17325},
  {name:'Clontarf Beach Baths', lat:-33.80680, lon:151.25121},
];

let visited = JSON.parse(localStorage.getItem(LS_KEYS.VISITED) || '{}');
let selectedIndex = Number(localStorage.getItem(LS_KEYS.SELECTION) || 0);

// Setup tabs
function showTab(which){
  document.getElementById('list-tab').classList.toggle('active', which==='list');
  document.getElementById('passport-tab').classList.toggle('active', which==='passport');
  document.getElementById('tab-list').classList.toggle('active', which==='list');
  document.getElementById('tab-passport').classList.toggle('active', which==='passport');
  if(which==='passport'){ renderPassport(); }
  else { setTimeout(()=> map.invalidateSize(), 150); }
}
window.showTab = showTab;

// Render list
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
      <button class="stamp-chip ${visited[p.name] ? 'stamped':''}" aria-pressed="${!!visited[p.name]}" 
        onclick="toggleStamp('${p.name}')">${visited[p.name] ? 'Stamped' : 'Not yet'}</button>
    `;
    row.addEventListener('click', (e)=>{
      // avoid click from stamp button
      if((e.target as HTMLElement).classList.contains('stamp-chip')) return;
      selectIndex(idx);
    });
    list.appendChild(row);
  });
  // ensure highlight
  highlightSelected();
}
window.renderList = renderList;

// Toggle stamp
function toggleStamp(name){
  visited[name] = !visited[name];
  localStorage.setItem(LS_KEYS.VISITED, JSON.stringify(visited));
  renderList();
  renderPassport();
}
window.toggleStamp = toggleStamp;

// Selection helpers
function selectIndex(idx){
  selectedIndex = (idx + pools.length) % pools.length;
  localStorage.setItem(LS_KEYS.SELECTION, String(selectedIndex));
  highlightSelected();
  panToSelected();
}
window.selectIndex = selectIndex;

function moveSelection(step){ selectIndex(selectedIndex + step); }
window.moveSelection = moveSelection;

function highlightSelected(){
  const rows = Array.from(document.querySelectorAll('#poolList .pool-item'));
  rows.forEach((el,i)=> el.style.background = (i===selectedIndex) ? '#f0f6ff' : 'transparent');
}

// Map using Leaflet
const map = L.map('map').setView([pools[0].lat, pools[0].lon], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);
const marker = L.marker([pools[0].lat, pools[0].lon]).addTo(map);

function panToSelected(){
  const p = pools[selectedIndex];
  marker.setLatLng([p.lat, p.lon]).bindPopup(p.name);
  map.setView([p.lat, p.lon], 15, {animate:true});
}
window.panToSelected = panToSelected;

// Passport view
function renderPassport(){
  const grid = document.getElementById('passportGrid');
  grid.innerHTML = '';
  pools.forEach(p => {
    const stamped = !!visited[p.name];
    const card = document.createElement('div');
    card.className = 'passport';
    card.innerHTML = `
      <div class="title">${p.name}</div>
      <div class="hint">${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div>
      ${stamped ? `
        <div class="stamp">
          <img src="assets/stamp.svg" alt="stamp">
          <div class="label">${p.name.split(' ')[0].toUpperCase()}</div>
        </div>` : `
        <div class="stamp" style="opacity:.35; filter:grayscale(1)">
          <img src="assets/stamp.svg" alt="empty stamp">
          <div class="label">NOT YET</div>
        </div>`
      }
    `;
    grid.appendChild(card);
  });
}
window.renderPassport = renderPassport;

function clearStamps(){
  if(!confirm('Clear all stamps?')) return;
  visited = {};
  localStorage.setItem(LS_KEYS.VISITED, JSON.stringify(visited));
  renderList(); renderPassport();
}
window.clearStamps = clearStamps;

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  renderList();
  selectIndex(selectedIndex);
  setTimeout(()=> map.invalidateSize() || panToSelected(), 200);
});
