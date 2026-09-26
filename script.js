/* =========================================================
   FC BOUSSY QUINCY — script.js
   Gère : navigation principale, sous-onglets, et génération
   dynamique des pages "Les équipes" et "Résultats" à partir
   d'une seule liste de catégories (facile à modifier).
   ========================================================= */

/* ---------- 1. Liste des catégories du club ----------
   -> Pour ajouter/retirer/renommer une catégorie, modifiez
      simplement ce tableau : tout le site se met à jour tout seul. */
const CATEGORIES = [
  { id: "baby",   label: "Baby Foot",   full: "Baby Foot (U4 - U5)", coach: "À définir", jour: "Mercredi 10h - 11h", terrain: "Terrain d'honneur" },
  { id: "u6u7",   label: "U6 - U7",     full: "U6 - U7",             coach: "À définir", jour: "Mercredi 10h - 11h30", terrain: "Terrain synthétique" },
  { id: "u8u9",   label: "U8 - U9",     full: "U8 - U9",             coach: "À définir", jour: "Mardi et Vendredi 18h - 19h", terrain: "Terrain synthétique" },
  { id: "u10u11", label: "U10 - U11",   full: "U10 - U11",           coach: "À définir", jour: "Mardi et Vendredi 18h - 19h30", terrain: "Terrain d'honneur" },
  { id: "u12u13", label: "U12 - U13",   full: "U12 - U13",           coach: "À définir", jour: "Lundi et Jeudi 18h30 - 20h", terrain: "Terrain d'honneur" },
  { id: "u14",    label: "U14",         full: "U14",                 coach: "À définir", jour: "Lundi et Jeudi 18h30 - 20h", terrain: "Terrain synthétique" },
  { id: "u15u16", label: "U15 - U16",   full: "U15 - U16",           coach: "À définir", jour: "Mardi et Vendredi 19h - 20h30", terrain: "Terrain d'honneur" },
  { id: "u17u18", label: "U17 - U18",   full: "U17 - U18",           coach: "À définir", jour: "Mardi et Vendredi 19h - 20h30", terrain: "Terrain synthétique" },
  { id: "seniors",label: "Séniors",     full: "Séniors",             coach: "À définir", jour: "Mardi et Jeudi 19h30 - 21h", terrain: "Terrain d'honneur" },
  { id: "veterans",label:"Vétérans",    full: "Vétérans",            coach: "À définir", jour: "Vendredi 19h30 - 21h", terrain: "Terrain synthétique" },
];

/* Résultats fictifs d'exemple (à remplacer par les vrais scores) */
function exempleResultats(cat){
  return [
    { j:"J1", date:"07/09", adv:"US Rivalière",      dom:true,  bf:2, bc:1 },
    { j:"J2", date:"14/09", adv:"AS Montjean",       dom:false, bf:1, bc:1 },
    { j:"J3", date:"21/09", adv:"FC Les Ormeaux",    dom:true,  bf:0, bc:2 },
    { j:"J4", date:"28/09", adv:"Entente Val de Br.",dom:false, bf:3, bc:0 },
  ];
}

/* ---------- 2. Navigation principale (onglets + sous-onglets) ---------- */
function showPage(pageId, subId){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if(page) page.classList.add('active');

  document.querySelectorAll('.main-nav [data-page]').forEach(link=>{
    link.closest('li').classList.toggle('active', link.dataset.page === pageId);
  });

  if(subId){ showSubPanel(pageId, subId); }

  // ferme le menu mobile après un clic
  document.getElementById('mainNav').classList.remove('open');
  document.querySelectorAll('.main-nav li.open').forEach(li=>li.classList.remove('open'));

  window.scrollTo({top:0, behavior:'smooth'});
}

function showSubPanel(pageId, subId){
  const page = document.getElementById(pageId);
  if(!page) return;
  page.querySelectorAll('.subpanel').forEach(p=>p.classList.remove('active'));
  const panel = page.querySelector('#'+subId);
  if(panel) panel.classList.add('active');
  page.querySelectorAll('.subtabs button').forEach(b=>{
    b.classList.toggle('active', b.dataset.target === subId);
  });
}

/* ---------- 3. Génération dynamique : Les Équipes ---------- */
function buildEquipes(){
  const subtabs = document.getElementById('equipes-subtabs');
  const panels  = document.getElementById('equipes-panels');

  CATEGORIES.forEach((cat, i)=>{
    const btn = document.createElement('button');
    btn.textContent = cat.label;
    btn.dataset.target = 'eq-'+cat.id;
    if(i===0) btn.classList.add('active');
    btn.addEventListener('click', ()=>showSubPanel('equipes','eq-'+cat.id));
    subtabs.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'subpanel' + (i===0 ? ' active' : '');
    panel.id = 'eq-'+cat.id;
    panel.innerHTML = `
      <div class="team-card">
        <div class="photo">Photo de l'équipe<br>${cat.full}</div>
        <div class="info">
          <span class="badge">${cat.full}</span>
          <h3>${cat.full} — FC Boussy Quincy</h3>
          <p>Présentation de la catégorie ${cat.full} : effectif, objectifs de la saison et esprit d'équipe. Remplacez ce texte par la présentation réelle rédigée par le club.</p>
          <div class="team-meta">
            <div><div class="k">Entraîneur</div><div class="v">${cat.coach}</div></div>
            <div><div class="k">Entraînements</div><div class="v">${cat.jour}</div></div>
            <div><div class="k">Terrain</div><div class="v">${cat.terrain}</div></div>
            <div><div class="k">Effectif</div><div class="v">— licenciés</div></div>
          </div>
          <a class="btn btn-primary" href="#" data-page="resultats" data-sub="res-${cat.id}">Voir les résultats</a>
        </div>
      </div>`;
    panels.appendChild(panel);
  });
}

/* ---------- 4. Génération dynamique : Résultats ---------- */
function buildResultats(){
  const subtabs = document.getElementById('resultats-subtabs');
  const panels  = document.getElementById('resultats-panels');

  CATEGORIES.forEach((cat, i)=>{
    const btn = document.createElement('button');
    btn.textContent = cat.label;
    btn.dataset.target = 'res-'+cat.id;
    if(i===0) btn.classList.add('active');
    btn.addEventListener('click', ()=>showSubPanel('resultats','res-'+cat.id));
    subtabs.appendChild(btn);

    const matches = exempleResultats(cat);
    let v=0,n=0,d=0;
    const rows = matches.map(m=>{
      let cls='res-n', label='—';
      if(m.bf>m.bc){ cls='res-v'; label='V'; v++; }
      else if(m.bf<m.bc){ cls='res-l'; label='D'; d++; }
      else { cls='res-d'; label='N'; n++; }
      return `<tr>
        <td>${m.j}</td><td>${m.date}</td>
        <td>${m.dom ? 'FC Boussy Quincy' : m.adv}</td>
        <td class="score">${m.dom ? m.bf : m.bc} - ${m.dom ? m.bc : m.bf}</td>
        <td>${m.dom ? m.adv : 'FC Boussy Quincy'}</td>
        <td class="${cls}">${label}</td>
      </tr>`;
    }).join('');

    const panel = document.createElement('div');
    panel.className = 'subpanel' + (i===0 ? ' active' : '');
    panel.id = 'res-'+cat.id;
    panel.innerHTML = `
      <h3>${cat.full} — Résultats de la saison</h3>
      <div class="results-summary">
        <div class="stat"><div class="n">${v}</div><div class="l">Victoires</div></div>
        <div class="stat"><div class="n">${n}</div><div class="l">Nuls</div></div>
        <div class="stat"><div class="n">${d}</div><div class="l">Défaites</div></div>
        <div class="stat"><div class="n">${matches.length}</div><div class="l">Matchs joués</div></div>
      </div>
      <div style="overflow-x:auto;">
        <table class="results">
          <thead><tr><th>Journée</th><th>Date</th><th>Domicile</th><th>Score</th><th>Extérieur</th><th>Résultat</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="form-note">Résultats d'exemple — à remplacer par les scores réels au fil de la saison.</p>`;
    panels.appendChild(panel);
  });
}

/* ---------- 5bis. Menus déroulants "Les Équipes" / "Résultats" + tableau planning ---------- */
function buildDropdownsAndPlanning(){
  const planningBody = document.getElementById('planning-body');
  const eqDrop = document.getElementById('equipes-dropdown');
  const resDrop = document.getElementById('resultats-dropdown');

  CATEGORIES.forEach(cat=>{
    if(planningBody){
      planningBody.insertAdjacentHTML('beforeend',
        `<tr><td>${cat.full}</td><td>${cat.jour}</td><td>${cat.terrain}</td></tr>`);
    }
    if(eqDrop){
      eqDrop.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="equipes" data-sub="eq-${cat.id}">${cat.label}</a></li>`);
    }
    if(resDrop){
      resDrop.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="resultats" data-sub="res-${cat.id}">${cat.label}</a></li>`);
    }
  });
}

/* ---------- 5. Écouteurs génériques (data-page / data-sub) ---------- */
function bindNavLinks(){
  document.querySelectorAll('[data-page]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      e.preventDefault();
      showPage(el.dataset.page, el.dataset.sub || null);
    });
  });
}

/* ---------- 6. Menus déroulants (mobile = clic, desktop = survol via CSS) ---------- */
function bindDropdowns(){
  document.querySelectorAll('.main-nav > ul > li').forEach(li=>{
    const trigger = li.querySelector(':scope > button.nav-link, :scope > a.nav-link');
    if(!trigger || !li.querySelector('.dropdown')) return;
    trigger.addEventListener('click', (e)=>{
      if(window.innerWidth <= 960){
        e.preventDefault();
        const isOpen = li.classList.contains('open');
        document.querySelectorAll('.main-nav li.open').forEach(x=>x.classList.remove('open'));
        li.classList.toggle('open', !isOpen);
      }
    });
  });
}

/* ---------- 7. Menu burger mobile ---------- */
function bindBurger(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', ()=>{
    nav.classList.toggle('open');
  });
}

/* ---------- 8. Formulaire de contact (démo front-end) ---------- */
function bindContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    document.getElementById('form-confirm').style.display = 'block';
    form.reset();
  });
}

/* ---------- 9. Sous-onglets statiques (Le Club) ---------- */
function bindStaticSubtabs(){
  document.querySelectorAll('.subtabs[data-page]').forEach(nav=>{
    const pageId = nav.dataset.page;
    nav.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=> showSubPanel(pageId, btn.dataset.target));
    });
  });
}

/* ---------- Initialisation ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  buildEquipes();
  buildResultats();
  buildDropdownsAndPlanning();
  bindNavLinks();
  bindDropdowns();
  bindBurger();
  bindContactForm();
  bindStaticSubtabs();
  showPage('accueil');

  document.getElementById('year').textContent = new Date().getFullYear();
});
