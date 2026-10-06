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
  { id: "veterans55", label:"Vétérans +55",    full: "Vétérans +55",    annee:"Avant 1982" ,       coach: "Pascal", jour: "Mercredi 20h30-22h", terrain: "Terrain synthétique" },
];

const CONVOCATION_CATEGORIES = [
  { id: "u6u7", label: "U6/U7", teams: 4 },
  { id: "u8u9", label: "U8/U9", teams: 4 },
  { id: "u10", label: "U10", teams: 2 },
  { id: "u11", label: "U11", teams: 2 },
  { id: "u11F", label: "U11 F", teams: 1 },
  { id: "u12", label: "U12", teams: 2 },
  { id: "u13", label: "U13", teams: 2 },
  { id: "u13F", label: "U13 F", teams: 1 },
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
    { id: "u14", label: "U14", competition: "Coupe Essonne" },
    { id: "u16", label: "U16", competition: "Coupe Essonne" },
    { id: "seniors1", label: "Séniors 1", competition: "Coupe Essonne" },
    { id: "seniors2", label: "Séniors 2", competition: "Coupe District" },
  ],
};

const DISTRICT_RESULTS_URLS = {
  u14: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=456310&stage=1&group=3&label=U14%20D3",
  u15F: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=456387&stage=1&group=2&label=U15%20F%20%C3%80%2011%20D1",
  u16: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=456268&stage=1&group=2&label=U16%20D4",
  u18: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=456221&stage=1&group=1&label=U18%20D2",
  seniorsF: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=456346&stage=1&group=1&label=SENIORS%20F%20%C3%80%2011%20D1",
  seniors1: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=455671&stage=1&group=2&label=SENIORS%20D2",
  seniors2: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=455681&stage=1&group=1&label=SENIORS%20D5",
  veterans55: "https://essonne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=186863&competition=456217&stage=1&group=1&label=CRIT%C3%89RIUM%2055%20ANS",
};

const DISTRICT_CALENDAR_URLS = {
  u14: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456310&stage=1&group=3&label=U14%20D3%20POULE%20C",
  u15F: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456387&stage=1&group=2&label=U15%20F%20%C3%80%2011%20D1%20POULE%20B",
  u16: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456268&stage=1&group=2&label=U16%20D4%20POULE%20B",
  u18: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456221&stage=1&group=1&label=U18%20D2%20POULE%20A",
  seniorsF: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456346&stage=1&group=1&label=SENIORS%20F%20%C3%80%2011%20D1%20POULE%20UNIQUE",
  seniors1: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=455671&stage=1&group=2&label=SENIORS%20D2%20POULE%20B",
  seniors2: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=455681&stage=1&group=1&label=SENIORS%20D5%20POULE%20A",
  veterans55: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456217&stage=1&group=1&label=CRIT%C3%89RIUM%2055%20ANS%20POULE%20A",
};

const DISTRICT_CUP_CALENDAR_URLS = {
  u14: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=458608&stage=1&group=1&label=COUPE%20ESSONNE%20U14%20POULE%20UNIQUE",
  u16: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456479&stage=1&group=1&label=COUPE%20ESSONNE%20U16%20POULE%20UNIQUE",
  seniors1: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456417&stage=1&group=1&label=COUPE%20ESSONNE%20SENIORS%20POULE%20UNIQUE",
  seniors2: "https://essonne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=186863&competition=456448&stage=1&group=1&label=COUPE%20DISTRICT%20SENIORS%20POULE%20UNIQUE",
};

const EQUIPES_PAR_CATEGORIE = {u6u7:4, u8:2, u9:2, u10:2, u11:2, u12:2, u13:2, seniors: 2 };

const RESULTAT_TEAM_OPTIONS = Object.fromEntries(
  Object.values(RESULTAT_TEAMS).flat().map(team=>[team.id, team.label])
);
 
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
 
  CATEGORIES.forEach(cat=>{
    const btn = document.createElement('button');
    btn.textContent = cat.label;
    btn.dataset.target = 'eq-'+cat.id;
    btn.addEventListener('click', ()=>showSubPanel('equipes','eq-'+cat.id));
    subtabs.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'subpanel';
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

  const convocationsButton = document.createElement('button');
  convocationsButton.textContent = 'Convocations';
  convocationsButton.dataset.target = 'eq-convocations';
  convocationsButton.classList.add('active');
  convocationsButton.addEventListener('click', ()=>showSubPanel('equipes', 'eq-convocations'));
  subtabs.insertBefore(convocationsButton, subtabs.firstChild);

  const convocationsPanel = document.createElement('div');
  convocationsPanel.className = 'subpanel active';
  convocationsPanel.id = 'eq-convocations';
  convocationsPanel.innerHTML = `
    <h3>Convocations de l'école de foot</h3>
    <p class="form-note" id="convocations-load-status" role="status" aria-live="polite">Chargement des convocations…</p>
    <div class="subtabs subtabs-nested" role="tablist" aria-label="Catégories des convocations"></div>
    <div class="convocation-category-panels"></div>`;

  const categoryTabs = convocationsPanel.querySelector('.subtabs-nested');
  const categoryPanels = convocationsPanel.querySelector('.convocation-category-panels');

  CONVOCATION_CATEGORIES.forEach((category, categoryIndex)=>{
    const categoryTab = document.createElement('button');
    categoryTab.type = 'button';
    categoryTab.textContent = category.label;
    categoryTab.classList.toggle('active', categoryIndex === 0);
    categoryTab.setAttribute('role', 'tab');
    categoryTab.setAttribute('aria-selected', String(categoryIndex === 0));

    const categoryPanel = document.createElement('div');
    categoryPanel.className = `convocation-category-panel${categoryIndex === 0 ? ' active' : ''}`;
    categoryPanel.setAttribute('role', 'tabpanel');
    categoryPanel.setAttribute('aria-label', `Convocations ${category.label}`);
    categoryPanel.id = `convocation-${category.id}`;

    categoryTab.addEventListener('click', ()=>{
      categoryTabs.querySelectorAll('button').forEach(tab=>{
        const selected = tab === categoryTab;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
      });
      categoryPanels.querySelectorAll('.convocation-category-panel').forEach(panel=>{
        panel.classList.toggle('active', panel === categoryPanel);
      });
    });

    categoryTabs.appendChild(categoryTab);
    categoryPanels.appendChild(categoryPanel);
  });

  panels.insertBefore(convocationsPanel, panels.firstChild);
  renderConvocations({});
  loadConvocations();
}

function renderConvocations(data){
  CONVOCATION_CATEGORIES.forEach(category=>{
    const categoryPanel = document.getElementById(`convocation-${category.id}`);
    if(!categoryPanel) return;
    categoryPanel.replaceChildren();
    const teams = Array.isArray(data?.[category.id]?.teams) ? data[category.id].teams : [];
    const hasPublishedConvocation = teams.some(team =>
      team && typeof team === 'object' && (
        ['opponent', 'date', 'location', 'meetingTime', 'matchTime'].some(field =>
          typeof team[field] === 'string' && team[field].trim()
        ) ||
        (Array.isArray(team.players) && team.players.some(player =>
          typeof player === 'string' && player.trim()
        ))
      )
    );

    if(!hasPublishedConvocation){
      const unavailable = document.createElement('p');
      unavailable.textContent = 'Les convocations ne sont pas disponibles pour le moment.';
      categoryPanel.appendChild(unavailable);
      return;
    }

    for(let teamIndex = 0; teamIndex < Math.max(category.teams, teams.length); teamIndex++){
      const team = teams[teamIndex] && typeof teams[teamIndex] === 'object' ? teams[teamIndex] : {};
      const card = document.createElement('article');
      card.className = 'convocation-card';

      const heading = document.createElement('h4');
      heading.textContent = `Équipe ${teamIndex + 1}`;
      card.appendChild(heading);

      const matchDetails = document.createElement('dl');
      matchDetails.className = 'convocation-match';
      [
        ['Adversaire', team.opponent],
        ['Date', team.date],
        ['Lieu', team.location],
        ['Heure du rendez-vous', team.meetingTime],
        ['Heure du match', team.matchTime],
      ].forEach(([label, value])=>{
        const detail = document.createElement('div');
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = value || 'À renseigner';
        detail.append(term, description);
        matchDetails.appendChild(detail);
      });
      card.appendChild(matchDetails);

      const playersSection = document.createElement('div');
      playersSection.className = 'convocation-players';
      const playersHeading = document.createElement('h5');
      playersHeading.textContent = 'Convocation';
      const playersList = document.createElement('ul');
      const players = Array.isArray(team.players)
        ? team.players.filter(player => typeof player === 'string' && player.trim())
        : [];
      (players.length ? players : ['Noms à renseigner']).forEach(player=>{
        const item = document.createElement('li');
        item.textContent = player;
        playersList.appendChild(item);
      });
      playersSection.append(playersHeading, playersList);
      card.appendChild(playersSection);
      categoryPanel.appendChild(card);
    }
  });
}

async function loadConvocations(){
  const status = document.getElementById('convocations-load-status');
  try {
    const response = await fetch('/data/convocations.json', { cache: 'no-cache' });
    if(!response.ok) throw new Error(`Chargement des convocations impossible (${response.status}).`);
    const data = await response.json();
    if(!data || typeof data !== 'object' || Array.isArray(data)){
      throw new Error('Le fichier de convocations a un format invalide.');
    }
    renderConvocations(data);
    status.textContent = 'Les convocations affichées sont à jour.';
  } catch(error) {
    console.error('Unable to load published convocations:', error);
    status.textContent = 'Les convocations publiées ne sont pas accessibles actuellement.';
    status.setAttribute('role', 'alert');
  }
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
    contactName.textContent = name || 'Prochainement';
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
      missing.textContent = 'Prochainement';
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
 
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function validateResultats(data){
  if(!data || !Array.isArray(data.matches)){
    throw new Error('Le fichier des résultats ne contient pas de liste de matchs valide.');
  }
  const allowedCompetitions = new Set(COMPETITIONS.map(competition => competition.id));
  const allowedTeams = new Set(Object.keys(RESULTAT_TEAM_OPTIONS));
  return data.matches.map((match, index)=>{
    const parsedDate = typeof match?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(match.date)
      ? new Date(`${match.date}T00:00:00Z`)
      : null;
    const validDate = !match?.date || (parsedDate && !Number.isNaN(parsedDate.getTime())
      && parsedDate.toISOString().slice(0, 10) === match.date);
    if(
      !match || !allowedCompetitions.has(match.competition) || !allowedTeams.has(match.team) ||
      typeof match.round !== 'string' || !match.round.trim() ||
      !validDate || typeof match.opponent !== 'string' || !match.opponent.trim() ||
      typeof match.home !== 'boolean' ||
      !Number.isInteger(match.goalsFor) || match.goalsFor < 0 ||
      !Number.isInteger(match.goalsAgainst) || match.goalsAgainst < 0
    ){
      throw new Error(`Le match numéro ${index + 1} contient des informations invalides.`);
    }
    return match;
  });
}

async function loadResultats(){
  const status = document.getElementById('resultats-load-status');
  try{
    const response = await fetch('/data/resultats.json');
    if(!response.ok) throw new Error(`Chargement des résultats impossible (${response.status}).`);
    const data = validateResultats(await response.json());
    buildResultats(data);
    status.hidden = true;
  } catch(error){
    console.error('Unable to load results:', error);
    status.textContent = 'Les résultats ne sont pas accessibles actuellement. Veuillez réessayer plus tard.';
    status.setAttribute('role', 'alert');
  }
}

/* ---------- 4. Génération dynamique : Résultats (Championnat / Coupe > catégories) ---------- */
function buildResultats(allMatches){
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
 
    const configuredTeams = RESULTAT_TEAMS[comp.id];
    const additionalTeamIds = [...new Set(
      allMatches.filter(match => match.competition === comp.id).map(match => match.team)
    )].filter(teamId => !configuredTeams.some(team => team.id === teamId));
    const resultTeams = [
      ...configuredTeams,
      ...additionalTeamIds.map(teamId =>
        Object.values(RESULTAT_TEAMS).flat().find(team => team.id === teamId)
      ).filter(Boolean),
    ];
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
      const matches = allMatches.filter(match => match.competition === comp.id && match.team === cat.id);
      let v=0,n=0,d=0;
      const rows = matches.map(m=>{
        let cls='res-n', label='—';
        if(m.goalsFor>m.goalsAgainst){ cls='res-v'; label='V'; v++; }
        else if(m.goalsFor<m.goalsAgainst){ cls='res-l'; label='D'; d++; }
        else if(comp.id === 'championnat') { cls='res-d'; label='N'; n++; }
        else { label='—'; }
        return `<tr>
          <td>${escapeHTML(m.round)}</td><td>${m.date ? escapeHTML(m.date.split('-').reverse().join('/')) : '—'}</td>
          <td>${m.home ? 'FC Boussy Quincy' : escapeHTML(m.opponent)}</td>
          <td class="score">${m.home ? m.goalsFor : m.goalsAgainst} - ${m.home ? m.goalsAgainst : m.goalsFor}</td>
          <td>${m.home ? escapeHTML(m.opponent) : 'FC Boussy Quincy'}</td>
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
      const districtUrl = comp.id === 'championnat' ? DISTRICT_RESULTS_URLS[cat.id] : null;
      const calendarUrl = comp.id === 'coupe'
        ? DISTRICT_CUP_CALENDAR_URLS[cat.id]
        : DISTRICT_CALENDAR_URLS[cat.id];
      const districtLink = comp.id === 'coupe'
        ? (calendarUrl
          ? `<p class="district-results-link">Plus de détails sur le <a href="${calendarUrl}" target="_blank" rel="noopener noreferrer">calendrier</a> de l'équipe sur le site du District de l’Essonne.</p>`
          : '')
        : (districtUrl
          ? `<p class="district-results-link">Plus de détails sur le <a href="${districtUrl}" target="_blank" rel="noopener noreferrer">classement</a>${calendarUrl ? ` et le <a href="${calendarUrl}" target="_blank" rel="noopener noreferrer">calendrier</a>` : ''} de l'équipe sur le site du District de l’Essonne ↗</p>`
          : '');
      const summaryClass = comp.id === 'coupe' ? 'results-summary results-summary-cup' : 'results-summary';
      catPanel.innerHTML = `
        <h3 class="results-title">${cat.label} — ${comp.label}${competitionMention}</h3>
        <div class="${summaryClass}">
          <div class="stat"><div class="n">${v}</div><div class="l">Victoires</div></div>
          ${comp.id === 'championnat' ? `<div class="stat"><div class="n">${n}</div><div class="l">Nuls</div></div>` : ''}
          <div class="stat"><div class="n">${d}</div><div class="l">Défaites</div></div>
          <div class="stat"><div class="n">${matches.length}</div><div class="l">Matchs joués</div></div>
        </div>
        <div style="overflow-x:auto;">
          <table class="results">
            <thead><tr><th>${comp.id==='coupe' ? 'Tour' : 'Journée'}</th><th>Date</th><th>Domicile</th><th>Score</th><th>Extérieur</th><th>Résultat</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="form-note">Les résultats sont mis à jour par le club au fil de la saison.</p>
        ${districtLink}`;
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
    let result;
    try{
      result = await response.json();
    } catch {
      throw new Error('Le traitement de la préinscription n’a pas pu être confirmé.');
    }
    if(typeof result.sheetSaved !== 'boolean' || typeof result.confirmationSent !== 'boolean'){
      throw new Error('La réponse du traitement de la préinscription est invalide.');
    }
    return result;
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
    submitButton.textContent = savedSubmission ? 'Finalisation de la préinscription…' : 'Envoi en cours…';

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
          botField: formData.get('bot-field'),
          fields: Object.fromEntries([...formData.entries()]
            .filter(([name]) => !['form-name', 'bot-field', 'emailConfirm'].includes(name))
            .map(([name, value]) => [name, String(value)])),
        };
      }

      const processingResult = await sendConfirmation(savedSubmission);
      const thankYouUrl = new URL(form.action, window.location.href);
      thankYouUrl.searchParams.set('confirmation', processingResult.confirmationSent ? 'envoyee' : 'indisponible');
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
        `<tr><td>${cat.full} (${cat.annee})</td><td>${cat.jour}</td><td>${cat.coach}</td></tr>`);
    }
    if(eqDrop){
      eqDrop.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="equipes" data-sub="eq-${cat.id}">${cat.label}</a></li>`);
    }
  });
  if(eqDrop){
    eqDrop.insertAdjacentHTML('afterbegin', '<li><a href="#" data-page="equipes" data-sub="eq-convocations">Convocations</a></li>');
  }
 
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

function formatNewsDate(value){
  const date = new Date(`${value}T00:00:00Z`);
  if(Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function renderNewsBody(body, container){
  String(body || '').split(/\n\s*\n/).forEach(paragraphText=>{
    const paragraph = document.createElement('p');
    paragraphText.split('\n').forEach((line, index)=>{
      if(index) paragraph.appendChild(document.createElement('br'));
      paragraph.appendChild(document.createTextNode(line));
    });
    if(paragraphText.trim()) container.appendChild(paragraph);
  });
}

function renderNewsArticles(articles){
  const grid = document.getElementById('news-grid');
  const detail = document.getElementById('news-article-content');
  const listView = document.getElementById('news-list-view');
  const detailView = document.getElementById('news-detail-view');
  const backButton = document.getElementById('news-back');
  if(!grid || !detail || !listView || !detailView || !backButton) return;

  grid.replaceChildren();
  articles.forEach(article=>{
    const card = document.createElement('article');
    card.className = 'news-card';
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumb';
    if(article.images?.[0]){
      const image = document.createElement('img');
      image.src = article.images[0];
      image.alt = '';
      thumbnail.appendChild(image);
    }
    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = formatNewsDate(article.date);
    thumbnail.appendChild(date);

    const content = document.createElement('div');
    content.className = 'body';
    const category = document.createElement('span');
    category.className = 'tag';
    category.textContent = article.category || 'Actualité';
    const title = document.createElement('h3');
    title.textContent = article.title;
    const summary = document.createElement('p');
    summary.textContent = article.summary || '';
    const readMore = document.createElement('button');
    readMore.className = 'read-more';
    readMore.type = 'button';
    readMore.dataset.newsOpen = article.slug;
    readMore.textContent = 'Lire la suite →';
    readMore.addEventListener('click', ()=>{
      detail.replaceChildren();
      if(article.images?.length){
        const gallery = document.createElement('div');
        gallery.className = 'news-carousel';
        gallery.setAttribute('role', 'region');
        gallery.setAttribute('aria-label', `Photos de l’article : ${article.title}`);
        const image = document.createElement('img');
        image.src = article.images[0];
        image.alt = `${article.title} — photo 1 sur ${article.images.length}`;
        gallery.appendChild(image);
        const dateLabel = document.createElement('span');
        dateLabel.className = 'date';
        dateLabel.textContent = formatNewsDate(article.date);
        gallery.appendChild(dateLabel);

        if(article.images.length > 1){
          let currentIndex = 0;
          const previous = document.createElement('button');
          previous.className = 'news-carousel-control previous';
          previous.type = 'button';
          previous.setAttribute('aria-label', 'Photo précédente');
          previous.textContent = '‹';
          const next = document.createElement('button');
          next.className = 'news-carousel-control next';
          next.type = 'button';
          next.setAttribute('aria-label', 'Photo suivante');
          next.textContent = '›';
          const counter = document.createElement('span');
          counter.className = 'news-carousel-counter';
          counter.setAttribute('aria-live', 'polite');
          counter.textContent = `1 / ${article.images.length}`;

          const showImage = index=>{
            currentIndex = (index + article.images.length) % article.images.length;
            image.src = article.images[currentIndex];
            image.alt = `${article.title} — photo ${currentIndex + 1} sur ${article.images.length}`;
            counter.textContent = `${currentIndex + 1} / ${article.images.length}`;
          };

          previous.addEventListener('click', ()=>showImage(currentIndex - 1));
          next.addEventListener('click', ()=>showImage(currentIndex + 1));
          gallery.append(previous, next, counter);
        }
        detail.appendChild(gallery);
      }
      const articleBody = document.createElement('div');
      articleBody.className = 'body';
      const articleCategory = document.createElement('span');
      articleCategory.className = 'tag';
      articleCategory.textContent = article.category || 'Actualité';
      const articleTitle = document.createElement('h3');
      articleTitle.textContent = article.title;
      articleBody.append(articleCategory, articleTitle);
      renderNewsBody(article.body, articleBody);
      detail.appendChild(articleBody);
      listView.hidden = true;
      detailView.hidden = false;
      window.scrollTo({top:0, behavior:'smooth'});
    });
    content.append(category, title, summary, readMore);
    card.append(thumbnail, content);
    grid.appendChild(card);
  });

  backButton.onclick = ()=>{
    detailView.hidden = true;
    listView.hidden = false;
    window.scrollTo({top:0, behavior:'smooth'});
  };
}

async function loadNewsArticles(){
  const status = document.getElementById('news-status');
  try {
    const response = await fetch('/data/actualites.json', { cache: 'no-cache' });
    if(!response.ok) throw new Error(`Chargement des actualités impossible (${response.status}).`);
    const data = await response.json();
    if(!data || !Array.isArray(data.articles)){
      throw new Error('Le fichier des actualités a un format invalide.');
    }
    const validDate = value => {
      if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    };
    const articles = data.articles.filter(article =>
      article && typeof article.title === 'string' &&
      validDate(article.date) && typeof article.slug === 'string'
    ).map(article=>({
      ...article,
      category: typeof article.category === 'string' ? article.category : '',
      summary: typeof article.summary === 'string' ? article.summary : '',
      body: typeof article.body === 'string' ? article.body : '',
      images: Array.isArray(article.images)
        ? article.images.filter(image => typeof image === 'string' && image.trim())
        : [],
    })).sort((first, second)=>new Date(second.date).getTime() - new Date(first.date).getTime());
    renderNewsArticles(articles);
    status.hidden = true;
  } catch(error) {
    console.error('Unable to load news articles:', error);
    status.textContent = 'Les actualités ne sont pas accessibles actuellement.';
    status.setAttribute('role', 'alert');
  }
}

function bindNewsArticles(){
  const listView = document.getElementById('news-list-view');
  const detailView = document.getElementById('news-detail-view');
  if(!listView || !detailView) return;
  loadNewsArticles();
}
 
/* ---------- Initialisation ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  buildEquipes();
  buildContacts();
  loadResultats();
  buildAgenda();
  bindAdhesionTabs();
  bindPreinscriptionForm();
  buildDropdownsAndPlanning();
  bindNavLinks();
  bindDropdowns();
  bindBurger();
  bindStaticSubtabs();
  bindNewsArticles();
  showPage('accueil');

  document.getElementById('year').textContent = new Date().getFullYear();
});
