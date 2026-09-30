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
  { id: "u6u7",   label: "U6 - U7",     full: "U6 - U7",    annee:"2020 à 2021" ,        coach: "Loula, Mohamed-Amin, Jason, Nina, Nell, Michael, Yassine", jour: "Mercredi 14h15-15h45", terrain: "Terrain synthétique"},
  { id: "u8",   label: "U8",     full: "U8",  annee:"2019" ,      coach: "Loula, Mohamed-Amin, Jason, Nina, Nell, Michael, Yassine", jour: "Lundi 17h30-19h et Mercredi 14h15-15h45", terrain: "Terrain synthétique" },
  { id: "u9",   label: "U9",     full: "U9",  annee:"2018" ,             coach: "Loula, Mohamed-Amin, Jason, Nina, Nell, Michael, Yassine", jour: "Lundi 17h30-19h, Mercredi 16h-17h30 et Jeudi 17h30-19h", terrain: "Terrain synthétique" },
  { id: "u10", label: "U10",   full: "U10",   annee:"2017" ,     coach: "Ismaël, Ethan", jour: "Lundi 17h30-19h, Mercredi 16h-17h30 et Jeudi 17h30-19h", terrain: "Terrain d'honneur" },
  { id: "u11", label: "U11",   full: "U11",   annee:"2016" ,     coach: "Ali", jour: "Lundi 17h30-19h, Mercredi 16h-17h30 et Jeudi 17h30-19h", terrain: "Terrain d'honneur" },
  { id: "u12", label: "U12",   full: "U12",   annee:"2015" ,     coach: "Willy, Lahcen", jour: "Mardi 18h-19h15, Mercredi 17h30-19h et Vendredi 18h-19h15", terrain: "Terrain d'honneur" },
  { id: "u13F",   label: "U13 F",     full: "U13 F",  annee:"2014" ,   coach: "Nina", jour: "Mercredi 17h30-19h et Jeudi 17h30-19h", terrain: "Terrain synthétique" },
  { id: "u13",   label: "U13",     full: "U13",  annee:"2014" ,     coach: "Jason, Rayan", jour: "Mardi 18h-19h15, Mercredi 17h30-19h et Vendredi 18h-19h15", terrain: "Terrain synthétique" },
  { id: "u14", label: "U14",   full: "U14", annee:"2013" ,    coach: "Ismaël", jour: "Lundi 19h-20h30 et Jeudi 19h-20h30", terrain: "Terrain d'honneur" },
  { id: "u15F",   label: "U15 F",     full: "U15 F", annee:"2012 à 2014",    coach: "Tristan", jour: "Lundi 19h-20h30 et Mercredi 19h-20h30", terrain: "Terrain synthétique" },
  { id: "u16",   label: "U16",     full: "U16",  annee:"2011 à 2012" , coach: "Tyron", jour: "Mercredi 19h-20h30 et Vendredi 19h-20h30", terrain: "Terrain synthétique" },
  { id: "u18", label: "U18",   full: "U18",   annee:"2009 à 2010" ,    coach: "Esaie", jour: "Mardi 19h-20h30 et Vendredi 19h-20h30", terrain: "Terrain synthétique" },
  { id: "seniorsF", label: "Séniors F", annee:"Avant 2011" ,     full: "Séniors F",             coach: "Bosco", jour: "Lundi 20h30-22h et Mercredi 20h30-22h", terrain: "Terrain d'honneur" },
  { id: "seniors", label: "Séniors",     full: "Séniors",   annee:"avant 2009" ,     coach: "Aymard, Harouna", jour: "Mardi 20h45-22h15 et Vendredi 20h45-22h15", terrain: "Terrain d'honneur" },
  { id: "veterans35", label:"Vétérans +35",    full: "Vétérans +35",   annee:"Avant 1992" ,     coach: "Bacary", jour: "Jeudi 20h30-22h", terrain: "Terrain synthétique" },
  { id: "veterans45", label:"Vétérans +45",    full: "Vétérans +45",    annee:"Avant 1982" ,       coach: "Pascal", jour: "Mercredi 20h30-22h", terrain: "Terrain synthétique" },
];

/* Format : identifiant de catégorie -> { name, phone }. */
const TEAM_CONTACTS = {};
const CLUB_CONTACTS = [
  { role: "Président", name: "", phone: "" },
  { role: "Vice-Président", name: "", phone: "" },
  { role: "Trésorier", name: "", phone: "" },
  { role: "Secrétaire", name: "", phone: "" },
  { role: "Directeur sportif", name: "", phone: "" },
  { role: "Responsable Écoles de foot", name: "", phone: "" },
  { role: "Responsable Communication", name: "", phone: "" },
  { role: "Responsable Partenariats", name: "", phone: "" },
];

/* Compétitions pour la page Résultats : Championnat et Coupe.
   -> Ajouter une compétition = ajouter une ligne ici. */
const COMPETITIONS = [
  { id: "championnat", label: "Championnat" },
  { id: "coupe",       label: "Coupe" },
];

const RESULTAT_TEAMS = {
  championnat: [
    { id: "u14", label: "U14", division: "D3 Poule C" },
    { id: "u15F", label: "U15 F", division: "D1 Poule B" },
    { id: "u16", label: "U16", division: "D4 Poule B" },
    { id: "u18", label: "U18", division: "D2 Poule A" },
    { id: "seniorsF", label: "Séniors F", division: "D1" },
    { id: "seniors1", label: "Séniors 1", division: "D2 Poule B" },
    { id: "seniors2", label: "Séniors 2", division: "D5 Poule A" },
    { id: "veterans55", label: "Vétérans +55", division: "Critérium 55 ans Poule A" },
  ],
  coupe: [
    { id: "seniors1", label: "Séniors 1", competition: "Coupe Essonne" },
    { id: "seniors2", label: "Séniors 2", competition: "Coupe District" },
    { id: "veterans35", label: "Vétérans +35", competition: "Coupe Essonne" },
  ],
};

const EQUIPES_PAR_CATEGORIE = { seniors: 2 };

/* Scores de démonstration à remplacer par les résultats réels. */
const RESULTATS_EXEMPLE = {
  championnat: {
    u14: [
      { j:"J1", date:"07/09", adv:"FC Val d'Yerres", dom:true, bf:3, bc:1 },
      { j:"J2", date:"14/09", adv:"AS Épinay", dom:false, bf:2, bc:2 },
      { j:"J3", date:"21/09", adv:"US Ris-Orangis", dom:true, bf:1, bc:0 },
    ],
    u15F: [
      { j:"J1", date:"07/09", adv:"FC Étampes", dom:false, bf:1, bc:4 },
      { j:"J2", date:"14/09", adv:"ES Montgeron", dom:true, bf:2, bc:1 },
      { j:"J3", date:"21/09", adv:"FC Viry", dom:false, bf:0, bc:3 },
    ],
    u16: [
      { j:"J1", date:"07/09", adv:"CO Ulis", dom:true, bf:0, bc:2 },
      { j:"J2", date:"14/09", adv:"FC Brunoy", dom:false, bf:3, bc:1 },
      { j:"J3", date:"21/09", adv:"AS Marcoussis", dom:true, bf:2, bc:2 },
    ],
    u18: [
      { j:"J1", date:"07/09", adv:"FC Mennecy", dom:false, bf:2, bc:1 },
      { j:"J2", date:"14/09", adv:"ES Cesson", dom:true, bf:4, bc:0 },
      { j:"J3", date:"21/09", adv:"US Palaiseau", dom:false, bf:1, bc:1 },
    ],
    seniorsF: [
      { j:"J1", date:"07/09", adv:"FC Longjumeau", dom:true, bf:2, bc:3 },
      { j:"J2", date:"14/09", adv:"AS Orly", dom:false, bf:2, bc:0 },
      { j:"J3", date:"21/09", adv:"FC Fleury", dom:true, bf:1, bc:1 },
    ],
    seniors1: [
      { j:"J1", date:"07/09", adv:"US Grigny", dom:false, bf:1, bc:2 },
      { j:"J2", date:"14/09", adv:"FC Lisses", dom:true, bf:3, bc:0 },
      { j:"J3", date:"21/09", adv:"AS Soisy", dom:false, bf:2, bc:2 },
    ],
    seniors2: [
      { j:"J1", date:"07/09", adv:"ES Tigery", dom:true, bf:1, bc:0 },
      { j:"J2", date:"14/09", adv:"FC Bondoufle", dom:false, bf:0, bc:2 },
      { j:"J3", date:"21/09", adv:"US Vigneux", dom:true, bf:3, bc:2 },
    ],
    veterans55: [
      { j:"J1", date:"07/09", adv:"FC Savigny", dom:false, bf:2, bc:2 },
      { j:"J2", date:"14/09", adv:"AS Corbeil", dom:true, bf:2, bc:0 },
      { j:"J3", date:"21/09", adv:"US Morsang", dom:false, bf:1, bc:3 },
    ],
  },
  coupe: {
    seniors1: [
      { j:"Tour 1", date:"05/10", adv:"FC Ballainvilliers", dom:true, bf:4, bc:1 },
      { j:"Tour 2", date:"19/10", adv:"AS Mennecy", dom:false, bf:1, bc:2 },
    ],
    seniors2: [
      { j:"Tour 1", date:"05/10", adv:"US Soisy", dom:false, bf:0, bc:3 },
      { j:"Tour 2", date:"19/10", adv:"FC Épinay", dom:true, bf:2, bc:2 },
    ],
    veterans35: [
      { j:"Tour 1", date:"05/10", adv:"ES Yerres", dom:true, bf:2, bc:0 },
      { j:"Tour 2", date:"19/10", adv:"FC Draveil", dom:false, bf:3, bc:1 },
    ],
  },
};
 
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
  page.querySelectorAll('.subtabs[data-page] button').forEach(b=>{
    b.classList.toggle('active', b.dataset.target === subId);
  });
  if(pageId === 'club' && subId === 'club-adhesion') showAdhesionPanel('nouveau');
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
    const resultTeamId = cat.id === 'seniors' ? 'seniors1' : cat.id;
    const resultCompetition = ['championnat', 'coupe'].find(compId =>
      RESULTAT_TEAMS[compId].some(team => team.id === resultTeamId)
    );
    const championshipTeams = cat.id === 'seniors'
      ? RESULTAT_TEAMS.championnat.filter(team => team.id === 'seniors1' || team.id === 'seniors2')
      : RESULTAT_TEAMS.championnat.filter(team => team.id === cat.id);
    const divisions = championshipTeams.map(team =>
      `<span>${team.division}</span>`
    ).join('');
    panel.innerHTML = `
      <div class="team-card">
        <div class="photo">Photo de l'équipe<br>${cat.full}</div>
        <div class="info">
          <span class="badge">${cat.full}</span>
          <h3>${cat.full} — FC Boussy Quincy</h3>
          <div class="team-meta">
            <div><div class="k">Entraîneur</div><div class="v">${cat.coach}</div></div>
            <div><div class="k">Génération</div><div class="v">${cat.annee}</div></div>
            <div><div class="k">Entraînements</div><div class="v">${cat.jour}</div></div>
            <div><div class="k">Nombre d'équipes</div><div class="v">${EQUIPES_PAR_CATEGORIE[cat.id] || 1}</div></div>
            ${divisions ? `<div><div class="k">Championnat</div><div class="v team-divisions">${divisions}</div></div>` : ''}
          </div>
          ${resultCompetition ? `<a class="btn btn-primary" href="#" data-page="resultats" data-comp="${resultCompetition}" data-cat="${resultTeamId}">Voir les résultats</a>` : ''}
        </div>
      </div>`;
    panels.appendChild(panel);
  });
}

function buildContacts(){
  const equipesWrap = document.getElementById('contacts-equipes');
  const directionWrap = document.getElementById('contacts-direction');
  if(!equipesWrap || !directionWrap) return;

  function contactCard(role, name, phone){
    const card = document.createElement('article');
    card.className = 'contact-card';
    const heading = document.createElement('h5');
    heading.textContent = role;
    const contactName = document.createElement('p');
    contactName.textContent = name || 'Responsable à renseigner';
    card.append(heading, contactName);

    if(phone){
      const phoneLink = document.createElement('a');
      phoneLink.className = 'contact-phone';
      phoneLink.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
      phoneLink.textContent = `📞 ${phone}`;
      card.appendChild(phoneLink);
    } else {
      const missing = document.createElement('span');
      missing.className = 'contact-missing';
      missing.textContent = 'Numéro à renseigner';
      card.appendChild(missing);
    }
    return card;
  }

  CATEGORIES.forEach(cat=>{
    const contact = TEAM_CONTACTS[cat.id] || {};
    equipesWrap.appendChild(contactCard(
      cat.full,
      contact.name || (cat.coach !== 'À définir' ? cat.coach : ''),
      contact.phone || ''
    ));
  });

  CLUB_CONTACTS.forEach(contact=>{
    directionWrap.appendChild(contactCard(contact.role, contact.name, contact.phone));
  });
}
 
/* ---------- 4. Génération dynamique : Résultats (Championnat / Coupe > catégories) ---------- */
function buildResultats(){
  const compSubtabs = document.getElementById('resultats-comp-subtabs');
  const compPanels  = document.getElementById('resultats-comp-panels');
 
  COMPETITIONS.forEach((comp, ci)=>{
    // --- bouton de 1er niveau : Championnat / Coupe ---
    const compBtn = document.createElement('button');
    compBtn.textContent = comp.label;
    compBtn.dataset.target = 'comp-'+comp.id;
    if(ci===0) compBtn.classList.add('active');
    compBtn.addEventListener('click', ()=> showCompPanel(comp.id));
    compSubtabs.appendChild(compBtn);
 
    // --- panneau de 1er niveau, qui contiendra son propre sous-menu de catégories ---
    const compPanel = document.createElement('div');
    compPanel.className = 'subpanel comp-panel' + (ci===0 ? ' active' : '');
    compPanel.id = 'comp-'+comp.id;
 
    const catSubtabs = document.createElement('div');
    catSubtabs.className = 'subtabs subtabs-nested';
 
    const catPanelsWrap = document.createElement('div');
 
    const resultTeams = RESULTAT_TEAMS[comp.id];
    resultTeams.forEach((cat, i)=>{
      const targetId = `res-${comp.id}-${cat.id}`;
 
      // --- bouton de 2e niveau : la catégorie (Baby Foot, U6-U7, ...) ---
      const catBtn = document.createElement('button');
      catBtn.textContent = cat.label;
      catBtn.dataset.target = targetId;
      if(i===0) catBtn.classList.add('active');
      catBtn.addEventListener('click', ()=> showCatPanel(compPanel, targetId));
      catSubtabs.appendChild(catBtn);
 
      // --- contenu des résultats pour cette catégorie, dans cette compétition ---
      const matches = RESULTATS_EXEMPLE[comp.id][cat.id];
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
 
      const catPanel = document.createElement('div');
      catPanel.className = 'subpanel cat-panel' + (i===0 ? ' active' : '');
      catPanel.id = targetId;
      const mention = comp.id === 'championnat' ? cat.division : cat.competition;
      const competitionMention = mention
        ? `<span class="results-division">${mention}</span>`
        : '';
      catPanel.innerHTML = `
        <h3 class="results-title">${cat.label} — ${comp.label}${competitionMention}</h3>
        <div class="results-summary">
          <div class="stat"><div class="n">${v}</div><div class="l">Victoires</div></div>
          <div class="stat"><div class="n">${n}</div><div class="l">Nuls</div></div>
          <div class="stat"><div class="n">${d}</div><div class="l">Défaites</div></div>
          <div class="stat"><div class="n">${matches.length}</div><div class="l">Matchs joués</div></div>
        </div>
        <div style="overflow-x:auto;">
          <table class="results">
            <thead><tr><th>${comp.id==='coupe' ? 'Tour' : 'Journée'}</th><th>Date</th><th>Domicile</th><th>Score</th><th>Extérieur</th><th>Résultat</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="form-note">Résultats d'exemple — à remplacer par les scores réels au fil de la saison.</p>`;
      catPanelsWrap.appendChild(catPanel);
    });
 
    compPanel.appendChild(catSubtabs);
    compPanel.appendChild(catPanelsWrap);
    compPanels.appendChild(compPanel);
  });
}
 
/* Bascule le niveau 1 (Championnat / Coupe) */
function showCompPanel(compId){
  const wrap = document.getElementById('resultats-comp-panels');
  wrap.querySelectorAll(':scope > .comp-panel').forEach(p=>p.classList.remove('active'));
  const target = document.getElementById('comp-'+compId);
  if(target) target.classList.add('active');
  document.getElementById('resultats-comp-subtabs').querySelectorAll('button').forEach(b=>{
    b.classList.toggle('active', b.dataset.target === 'comp-'+compId);
  });
}
 
/* Bascule le niveau 2 (la catégorie), à l'intérieur d'un panneau de compétition donné */
function showCatPanel(compPanelEl, targetId){
  compPanelEl.querySelectorAll(':scope > div > .cat-panel').forEach(p=>p.classList.remove('active'));
  const target = compPanelEl.querySelector('#'+targetId);
  if(target) target.classList.add('active');
  compPanelEl.querySelectorAll(':scope > .subtabs-nested button').forEach(b=>{
    b.classList.toggle('active', b.dataset.target === targetId);
  });
}
 
/* Permet à n'importe quel lien du site (bouton "Voir les résultats", menu...)
   d'ouvrir directement une catégorie précise, dans une compétition précise. */
function goToResultat(compId, catId){
  showPage('resultats');
  showCompPanel(compId);
  const compPanel = document.getElementById('comp-'+compId);
  if(compPanel) showCatPanel(compPanel, `res-${compId}-${catId}`);
}

/* ---------- 5ter. Agenda : occupation des terrains (regroupée par terrain) ---------- */
function buildAgenda(){
  const wrap = document.getElementById('agenda-terrains');
  if(!wrap) return;
 
  // Regroupe les catégories par terrain (déduit automatiquement de CATEGORIES)
  const parTerrain = {};
  CATEGORIES.forEach(cat=>{
    if(!parTerrain[cat.terrain]) parTerrain[cat.terrain] = [];
    parTerrain[cat.terrain].push(cat);
  });
 
  Object.keys(parTerrain).forEach(terrain=>{
    const card = document.createElement('div');
    card.className = 'agenda-card';
    const items = parTerrain[terrain].map(cat=>
      `<li><span class="cat">${cat.full}</span><span class="slot">${cat.jour}</span></li>`
    ).join('');
    card.innerHTML = `<div class="head">${terrain}</div><ul>${items}</ul>`;
    wrap.appendChild(card);
  });
}

/* ---------- 5quater. Adhésion : sous-sous-onglets + envoi du formulaire de préinscription ---------- */
function showAdhesionPanel(adhId){
  const nav = document.getElementById('adhesion-subtabs');
  if(!nav) return;
  nav.querySelectorAll('button').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.adh === adhId);
  });
  document.querySelectorAll('#club-adhesion .adh-panel').forEach(panel=>{
    panel.classList.toggle('active', panel.id === `adh-${adhId}`);
  });
}

function bindAdhesionTabs(){
  const nav = document.getElementById('adhesion-subtabs');
  if(!nav) return;
  nav.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      showAdhesionPanel(btn.dataset.adh);
    });
  });
}
 
function bindPreinscriptionForm(){
  const form = document.getElementById('preinscriptionForm');
  if(!form) return;
  const errorBox = document.getElementById('preinscription-error');
  const submitButton = form.querySelector('button[type="submit"]');
  let savedSubmission = null;
  let submitting = false;

  async function sendConfirmation(submission){
    const response = await fetch('/.netlify/functions/send-preinscription-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if(!response.ok) throw new Error('Le courriel de confirmation n’a pas pu être envoyé.');
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(submitting) return;
    errorBox.style.display = 'none';

    if(!savedSubmission){
      const email = form.elements.namedItem('email').value.trim();
      const emailConfirm = form.elements.namedItem('emailConfirm').value.trim();
      if(email.toLowerCase() !== emailConfirm.toLowerCase()){
        errorBox.textContent = "Les deux adresses email ne correspondent pas. Merci de vérifier avant d'envoyer.";
        errorBox.style.display = 'block';
        return;
      }
    }

    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = savedSubmission ? 'Envoi du courriel…' : 'Envoi en cours…';

    try {
      if(!savedSubmission){
        const formData = new FormData(form);
        const submissionResponse = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData),
          credentials: 'same-origin',
        });
        if(!submissionResponse.ok) throw new Error("La préinscription n’a pas pu être transmise au club.");

        savedSubmission = {
          email: formData.get('email').trim(),
          prenom: formData.get('prenom').trim(),
          botField: formData.get('bot-field'),
        };
      }

      await sendConfirmation(savedSubmission);
      const thankYouUrl = new URL(form.action, window.location.href);
      thankYouUrl.searchParams.set('confirmation', 'envoyee');
      window.location.assign(thankYouUrl);
    } catch(error) {
      if(savedSubmission){
        const thankYouUrl = new URL(form.action, window.location.href);
        thankYouUrl.searchParams.set('confirmation', 'indisponible');
        window.location.assign(thankYouUrl);
        return;
      }

      errorBox.textContent = "La préinscription n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.";
      errorBox.style.display = 'block';
      submitButton.textContent = 'Envoyer ma préinscription';
      submitting = false;
      submitButton.disabled = false;
    }
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
        `<tr><td>${cat.full} (${cat.annee})</td><td>${cat.jour}</td><td>${cat.terrain}</td></tr>`);
    }
    if(eqDrop){
      eqDrop.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="equipes" data-sub="eq-${cat.id}">${cat.label}</a></li>`);
    }
  });
 
  // Le menu "Résultats" ouvre la première équipe disponible de chaque compétition.
  if(resDrop){
    COMPETITIONS.forEach(comp=>{
      const firstTeam = RESULTAT_TEAMS[comp.id][0];
      resDrop.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="resultats" data-comp="${comp.id}" data-cat="${firstTeam.id}">${comp.label}</a></li>`);
    });
  }
}
 
/* ---------- 5. Écouteurs génériques (data-page / data-sub / data-comp+data-cat) ---------- */
function bindNavLinks(){
  document.querySelectorAll('[data-page]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const parentMenuItem = el.closest('.main-nav > ul > li');
      if(
        window.innerWidth <= 960 &&
        el.matches('.main-nav > ul > li > button.nav-link') &&
        parentMenuItem?.querySelector(':scope > .dropdown')
      ) return;

      e.preventDefault();
      if(el.dataset.comp && el.dataset.cat){
        goToResultat(el.dataset.comp, el.dataset.cat);
        document.getElementById('mainNav').classList.remove('open');
        document.querySelectorAll('.main-nav li.open').forEach(li=>li.classList.remove('open'));
      } else {
        showPage(el.dataset.page, el.dataset.sub || null);
      }
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
  buildContacts();
  buildResultats();
  buildAgenda();
  bindAdhesionTabs();
  bindPreinscriptionForm();
  buildDropdownsAndPlanning();
  bindNavLinks();
  bindDropdowns();
  bindBurger();
  bindStaticSubtabs();
  showPage('accueil');

  document.getElementById('year').textContent = new Date().getFullYear();
});
