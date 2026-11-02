(function(){
  const h = window.h;
  const createClass = window.createClass;

  if(!window.CMS || typeof h !== 'function' || typeof createClass !== 'function'){
    throw new Error('Impossible d’initialiser les outils de saisie du CMS.');
  }

  const CONVOCATION_CATEGORIES = [
    {id: 'u6u7', label: 'U6/U7'},
    {id: 'u8u9', label: 'U8/U9'},
    {id: 'u10', label: 'U10'},
    {id: 'u11', label: 'U11'},
    {id: 'u11F', label: 'U11 F'},
    {id: 'u12', label: 'U12'},
    {id: 'u13', label: 'U13'},
    {id: 'u13F', label: 'U13 F'},
  ];

  const RESULT_CATEGORIES = [
    {competition: 'championnat', team: 'u14', label: 'Championnat - U14'},
    {competition: 'championnat', team: 'u15F', label: 'Championnat - U15 F'},
    {competition: 'championnat', team: 'u16', label: 'Championnat - U16'},
    {competition: 'championnat', team: 'u18', label: 'Championnat - U18'},
    {competition: 'championnat', team: 'seniorsF', label: 'Championnat - Séniors F'},
    {competition: 'championnat', team: 'seniors1', label: 'Championnat - Séniors 1'},
    {competition: 'championnat', team: 'seniors2', label: 'Championnat - Séniors 2'},
    {competition: 'championnat', team: 'veterans55', label: 'Championnat - Vétérans +55'},
    {competition: 'coupe', team: 'u14', label: 'Coupe - U14'},
    {competition: 'coupe', team: 'u16', label: 'Coupe - U16'},
    {competition: 'coupe', team: 'seniors1', label: 'Coupe - Séniors 1'},
    {competition: 'coupe', team: 'seniors2', label: 'Coupe - Séniors 2'},
  ];
  const CLUB_CATEGORIES = [
    {id: 'u6u7', label: 'U6 - U7'},
    {id: 'u8', label: 'U8'},
    {id: 'u9', label: 'U9'},
    {id: 'u10', label: 'U10'},
    {id: 'u11', label: 'U11'},
    {id: 'u12', label: 'U12'},
    {id: 'u13F', label: 'U13 F'},
    {id: 'u13', label: 'U13'},
    {id: 'u14', label: 'U14'},
    {id: 'u15F', label: 'U15 F'},
    {id: 'u16', label: 'U16'},
    {id: 'u18', label: 'U18'},
    {id: 'seniorsF', label: 'Séniors F'},
    {id: 'seniors', label: 'Séniors'},
    {id: 'veterans35', label: 'Vétérans +35'},
    {id: 'veterans55', label: 'Vétérans +55'},
  ];

  function toPlain(value){
    return value && typeof value.toJS === 'function' ? value.toJS() : value;
  }

  function renderTextField(label, value, onChange, key, type){
    return h('label', {key, className: 'results-cms-field'}, [
      h('span', {key: 'label'}, label),
      h('input', {
        key: 'input',
        type: type || 'text',
        value: value || '',
        onChange: event => onChange(event.target.value),
      }),
    ]);
  }

  function expandCmsList(fieldName){
    const list = document.querySelector(`#nc-root [id^="${fieldName}-field-"]`);
    if(!list || list.dataset.cmsListOpened) return;

    const toggle = list.querySelector('button[data-testid="expand-button"]');
    if(!toggle) return;

    list.dataset.cmsListOpened = 'pending';
    requestAnimationFrame(() => {
      if(!list.isConnected || !toggle.isConnected) return;
      toggle.click();
      list.dataset.cmsListOpened = 'true';
    });
  }

  function expandCmsLists(){
    expandCmsList('roles');
  }

  const cmsListObserver = new MutationObserver(expandCmsLists);
  cmsListObserver.observe(document.body, {childList: true, subtree: true});
  expandCmsLists();

  function createEmptyTeam(){
    return {opponent: '', date: '', location: '', meetingTime: '', matchTime: '', players: []};
  }

  function updateCategory(value, categoryId, teams, onChange){
    const categories = toPlain(value);
    onChange({
      ...((categories && typeof categories === 'object' && !Array.isArray(categories)) ? categories : {}),
      [categoryId]: {teams},
    });
  }

  const ConvocationCategoriesControl = createClass({
    getInitialState(){
      return {categoryId: CONVOCATION_CATEGORIES[0].id};
    },

    getTeams(){
      const categories = toPlain(this.props.value);
      const category = categories?.[this.state.categoryId];
      return Array.isArray(category?.teams) ? category.teams : [];
    },

    updateTeams(teams){
      updateCategory(this.props.value, this.state.categoryId, teams, this.props.onChange);
    },

    changeTeamField(teamIndex, field, value){
      const teams = this.getTeams().map(team => ({...team}));
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), [field]: value};
      this.updateTeams(teams);
    },

    changePlayer(teamIndex, playerIndex, value){
      const teams = this.getTeams().map(team => ({...team}));
      const players = Array.isArray(teams[teamIndex]?.players) ? [...teams[teamIndex].players] : [];
      players[playerIndex] = value;
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), players};
      this.updateTeams(teams);
    },

    addPlayer(teamIndex){
      const teams = this.getTeams().map(team => ({...team}));
      const players = Array.isArray(teams[teamIndex]?.players) ? [...teams[teamIndex].players] : [];
      players.push('');
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), players};
      this.updateTeams(teams);
    },

    removePlayer(teamIndex, playerIndex){
      const teams = this.getTeams().map(team => ({...team}));
      const players = Array.isArray(teams[teamIndex]?.players) ? [...teams[teamIndex].players] : [];
      players.splice(playerIndex, 1);
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), players};
      this.updateTeams(teams);
    },

    addTeam(){
      this.updateTeams([...this.getTeams(), createEmptyTeam()]);
    },

    removeTeam(teamIndex){
      this.updateTeams(this.getTeams().filter((team, index) => index !== teamIndex));
    },

    resetCategory(){
      const teams = this.getTeams();
      if(!window.confirm('Effacer toutes les informations de convocation de cette catégorie ?')) return;
      this.updateTeams(teams.map(() => createEmptyTeam()));
    },

    render(){
      const teams = this.getTeams();
      const field = (teamIndex, key, label) => h('label', {className: 'convocation-cms-field'}, [
        h('span', {key: 'label'}, label),
        h('input', {
          key: 'input',
          type: 'text',
          value: teams[teamIndex]?.[key] || '',
          onChange: event => this.changeTeamField(teamIndex, key, event.target.value),
        }),
      ]);

      return h('div', {className: 'convocation-cms-editor'}, [
        h('label', {key: 'category-label', className: 'convocation-cms-selector'}, [
          h('span', {key: 'label'}, '1. Choisissez une catégorie'),
          h('select', {
            key: 'select',
            value: this.state.categoryId,
            onChange: event => this.setState({categoryId: event.target.value}),
          }, CONVOCATION_CATEGORIES.map(category =>
            h('option', {key: category.id, value: category.id}, category.label)
          )),
        ]),
        h('p', {key: 'help', className: 'convocation-cms-help'}, '2. Renseignez les convocations de la catégorie sélectionnée.'),
        h('button', {
          key: 'reset',
          type: 'button',
          onClick: this.resetCategory,
        }, 'Effacer toutes les convocations de cette catégorie'),
        ...teams.map((team, teamIndex) => h('fieldset', {
          key: `team-${teamIndex}`,
          className: 'convocation-cms-team',
        }, [
          h('legend', {key: 'legend'}, `Équipe ${teamIndex + 1}`),
          field(teamIndex, 'opponent', 'Adversaire'),
          field(teamIndex, 'date', 'Date du match'),
          field(teamIndex, 'location', 'Lieu'),
          field(teamIndex, 'meetingTime', 'Heure du rendez-vous'),
          field(teamIndex, 'matchTime', 'Heure du match'),
          h('div', {key: 'players', className: 'convocation-cms-players'}, [
            h('strong', {key: 'heading'}, 'Joueurs / joueuses convoqués'),
            ...(Array.isArray(team.players) ? team.players : []).map((player, playerIndex) =>
              h('div', {key: `player-${playerIndex}`, className: 'convocation-cms-player'}, [
                h('input', {
                  key: 'input',
                  type: 'text',
                  value: player || '',
                  'aria-label': `Équipe ${teamIndex + 1}, joueur ${playerIndex + 1}`,
                  onChange: event => this.changePlayer(teamIndex, playerIndex, event.target.value),
                }),
                h('button', {
                  key: 'remove',
                  type: 'button',
                  onClick: () => this.removePlayer(teamIndex, playerIndex),
                }, 'Retirer'),
              ])
            ),
            h('button', {
              key: 'add',
              type: 'button',
              onClick: () => this.addPlayer(teamIndex),
            }, 'Ajouter un joueur / une joueuse'),
          ]),
          h('button', {
            key: 'remove-team',
            type: 'button',
            onClick: () => this.removeTeam(teamIndex),
          }, 'Supprimer cette équipe'),
        ])),
        h('button', {
          key: 'add-team',
          type: 'button',
          onClick: this.addTeam,
        }, 'Ajouter une équipe'),
      ]);
    },
  });

  function createEmptyMatch(category){
    return {
      competition: category.competition,
      team: category.team,
      round: '',
      date: '',
      opponent: '',
      home: true,
      goalsFor: 0,
      goalsAgainst: 0,
    };
  }

  const ResultsByCategoryControl = createClass({
    getInitialState(){
      return {categoryIndex: 0};
    },

    getMatches(){
      const matches = toPlain(this.props.value);
      return Array.isArray(matches) ? matches : [];
    },

    updateMatch(matchIndex, changes){
      const matches = this.getMatches().map(match => ({...match}));
      matches[matchIndex] = {...matches[matchIndex], ...changes};
      this.props.onChange(matches);
    },

    addMatch(){
      const category = RESULT_CATEGORIES[this.state.categoryIndex];
      this.props.onChange([...this.getMatches(), createEmptyMatch(category)]);
    },

    removeMatch(matchIndex){
      this.props.onChange(this.getMatches().filter((match, index) => index !== matchIndex));
    },

    render(){
      const category = RESULT_CATEGORIES[this.state.categoryIndex];
      const matches = this.getMatches()
        .map((match, index) => ({match, index}))
        .filter(({match}) => match.competition === category.competition && match.team === category.team);
      const field = (matchIndex, key, label, type, min) => h('label', {className: 'results-cms-field'}, [
        h('span', {key: 'label'}, label),
        h('input', {
          key: 'input',
          type: type || 'text',
          value: this.getMatches()[matchIndex]?.[key] ?? '',
          min,
          onChange: event => {
            const value = type === 'number' ? Number(event.target.value) : event.target.value;
            this.updateMatch(matchIndex, {[key]: value});
          },
        }),
      ]);

      return h('div', {className: 'results-cms-editor'}, [
        h('label', {key: 'category-label', className: 'results-cms-selector'}, [
          h('span', {key: 'label'}, '1. Choisissez une compétition et une équipe'),
          h('select', {
            key: 'select',
            value: String(this.state.categoryIndex),
            onChange: event => this.setState({categoryIndex: Number(event.target.value)}),
          }, RESULT_CATEGORIES.map((item, index) =>
            h('option', {key: `${item.competition}-${item.team}`, value: String(index)}, item.label)
          )),
        ]),
        h('p', {key: 'help', className: 'results-cms-help'}, '2. Ajoutez ou modifiez les résultats de cette équipe.'),
        ...matches.map(({match, index: matchIndex}, displayedIndex) => h('fieldset', {
          key: `match-${matchIndex}`,
          className: 'results-cms-match',
        }, [
          h('legend', {key: 'legend'}, `Match ${displayedIndex + 1}`),
          field(matchIndex, 'round', category.competition === 'coupe' ? 'Tour' : 'Journée', 'text'),
          field(matchIndex, 'date', 'Date du match', 'date'),
          field(matchIndex, 'opponent', 'Adversaire', 'text'),
          h('label', {key: 'home', className: 'results-cms-checkbox'}, [
            h('input', {
              key: 'input',
              type: 'checkbox',
              checked: Boolean(match.home),
              onChange: event => this.updateMatch(matchIndex, {home: event.target.checked}),
            }),
            h('span', {key: 'label'}, 'Match à domicile'),
          ]),
          field(matchIndex, 'goalsFor', 'Buts du Boussy Quincy FC', 'number', 0),
          field(matchIndex, 'goalsAgainst', 'Buts de l’adversaire', 'number', 0),
          h('button', {
            key: 'remove',
            type: 'button',
            onClick: () => this.removeMatch(matchIndex),
          }, 'Supprimer ce résultat'),
        ])),
        h('button', {
          key: 'add',
          type: 'button',
          onClick: this.addMatch,
        }, 'Ajouter un résultat'),
      ]);
    },
  });

  const PlanningByCategoryControl = createClass({
    getInitialState(){
      return {categoryId: CLUB_CATEGORIES[0].id};
    },

    getCategories(){
      const categories = toPlain(this.props.value);
      return Array.isArray(categories) ? categories : [];
    },

    getCategory(){
      return this.getCategories().find(item => item.id === this.state.categoryId) ||
        {id: this.state.categoryId, label: '', years: '', schedule: '', coach: ''};
    },

    updateCategory(changes){
      const categories = this.getCategories();
      const categoryIndex = categories.findIndex(item => item.id === this.state.categoryId);
      const category = {...this.getCategory(), ...changes};
      if(categoryIndex === -1){
        const selected = CLUB_CATEGORIES.find(item => item.id === this.state.categoryId);
        category.label = selected.label;
        this.props.onChange([...categories, category]);
        return;
      }
      this.props.onChange(categories.map((item, index) =>
        index === categoryIndex ? category : item
      ));
    },

    render(){
      const category = this.getCategory();
      const field = (key, label) => renderTextField(
        label,
        category[key],
        value => this.updateCategory({[key]: value}),
        key
      );

      return h('div', {className: 'results-cms-editor club-cms-editor'}, [
        h('label', {key: 'selector', className: 'results-cms-selector'}, [
          h('span', {key: 'label'}, '1. Choisissez une catégorie'),
          h('select', {
            key: 'select',
            value: this.state.categoryId,
            onChange: event => this.setState({categoryId: event.target.value}),
          }, CLUB_CATEGORIES.map(item =>
            h('option', {key: item.id, value: item.id}, item.label)
          )),
        ]),
        h('p', {key: 'help', className: 'results-cms-help'}, '2. Modifiez les informations qui seront affichées dans le planning public.'),
        h('fieldset', {key: 'planning', className: 'results-cms-match'}, [
          h('legend', {key: 'legend'}, category.label || CLUB_CATEGORIES.find(item => item.id === category.id).label),
          field('years', 'Année(s) de naissance'),
          field('schedule', 'Jours et horaires d’entraînement'),
          field('coach', 'Entraîneur(s)'),
        ]),
      ]);
    },
  });

  const CategoryContactsControl = createClass({
    getInitialState(){
      return {categoryId: CLUB_CATEGORIES[0].id};
    },

    getContacts(){
      const contacts = toPlain(this.props.value);
      return Array.isArray(contacts) ? contacts : [];
    },

    getContact(){
      return this.getContacts().find(item => item.id === this.state.categoryId) ||
        {id: this.state.categoryId, name: '', phone: ''};
    },

    updateContact(changes){
      const contacts = this.getContacts();
      const contactIndex = contacts.findIndex(item => item.id === this.state.categoryId);
      const contact = {...this.getContact(), ...changes};
      if(contactIndex === -1){
        this.props.onChange([...contacts, contact]);
        return;
      }
      this.props.onChange(contacts.map((item, index) =>
        index === contactIndex ? contact : item
      ));
    },

    render(){
      const contact = this.getContact();
      const category = CLUB_CATEGORIES.find(item => item.id === this.state.categoryId);

      return h('div', {className: 'results-cms-editor club-cms-editor'}, [
        h('label', {key: 'selector', className: 'results-cms-selector'}, [
          h('span', {key: 'label'}, '1. Choisissez une catégorie'),
          h('select', {
            key: 'select',
            value: this.state.categoryId,
            onChange: event => this.setState({categoryId: event.target.value}),
          }, CLUB_CATEGORIES.map(item =>
            h('option', {key: item.id, value: item.id}, item.label)
          )),
        ]),
        h('p', {key: 'help', className: 'results-cms-help'}, '2. Saisissez les coordonnées de la personne à contacter pour cette catégorie.'),
        h('fieldset', {key: 'contact', className: 'results-cms-match'}, [
          h('legend', {key: 'legend'}, category.label),
          renderTextField('Nom du ou des responsables', contact.name, value => this.updateContact({name: value}), 'name'),
          renderTextField('Téléphone (facultatif)', contact.phone, value => this.updateContact({phone: value}), 'phone', 'tel'),
        ]),
      ]);
    },
  });

  const ClubContactDetailsControl = createClass({
    getDetails(){
      const details = toPlain(this.props.value);
      return details && typeof details === 'object' && !Array.isArray(details)
        ? details
        : {address: '', email: '', mapEmbedUrl: '', mapLinkUrl: ''};
    },

    updateField(key, value){
      this.props.onChange({...this.getDetails(), [key]: value});
    },

    render(){
      const details = this.getDetails();
      const field = (key, label, help, type) => h('label', {
        key,
        className: 'results-cms-field',
      }, [
        h('span', {key: 'label'}, label),
        h('input', {
          key: 'input',
          type: type || 'text',
          value: details[key] || '',
          onChange: event => this.updateField(key, event.target.value),
        }),
        help ? h('small', {key: 'help'}, help) : null,
      ]);

      return h('div', {className: 'results-cms-editor club-cms-editor'}, [
        h('p', {key: 'help', className: 'results-cms-help'}, 'Modifiez les informations de contact affichées sur le site. Les adresses de carte doivent commencer par https://.'),
        h('fieldset', {key: 'details', className: 'results-cms-match'}, [
          h('legend', {key: 'legend'}, 'Coordonnées principales'),
          field('address', 'Adresse postale', 'Affichée sur la page Contact et dans le pied de page.'),
          field('email', 'Adresse e-mail', 'Affichée sur la page Contact et dans le pied de page. La destination des messages du formulaire reste configurée séparément.', 'email'),
          field('mapEmbedUrl', 'Adresse de la carte intégrée', 'URL complète Google Maps pour la carte affichée sur la page Contact.'),
          field('mapLinkUrl', 'Lien d’itinéraire', 'URL complète ouverte par le bouton d’itinéraire.'),
        ]),
      ]);
    },
  });

  const ClubContactsControl = createClass({
    getContacts(){
      const contacts = toPlain(this.props.value);
      return Array.isArray(contacts) ? contacts : [];
    },

    updateContact(contactIndex, changes){
      this.props.onChange(this.getContacts().map((contact, index) =>
        index === contactIndex ? {...contact, ...changes} : contact
      ));
    },

    addContact(){
      this.props.onChange([...this.getContacts(), {role: '', name: '', phone: ''}]);
    },

    removeContact(contactIndex){
      this.props.onChange(this.getContacts().filter((contact, index) => index !== contactIndex));
    },

    render(){
      return h('div', {className: 'results-cms-editor club-cms-editor'}, [
        h('p', {key: 'help', className: 'results-cms-help'}, 'Renseignez le rôle, le nom et le téléphone. Les personnes sans nom ou numéro restent indiquées « Prochainement » sur le site.'),
        ...this.getContacts().map((contact, index) => h('fieldset', {
          key: `contact-${index}`,
          className: 'results-cms-match',
        }, [
          h('legend', {key: 'legend'}, `Responsable ${index + 1}`),
          renderTextField('Rôle', contact.role, value => this.updateContact(index, {role: value}), 'role'),
          renderTextField('Nom', contact.name, value => this.updateContact(index, {name: value}), 'name'),
          renderTextField('Téléphone (facultatif)', contact.phone, value => this.updateContact(index, {phone: value}), 'phone', 'tel'),
          h('button', {
            key: 'remove',
            type: 'button',
            onClick: () => this.removeContact(index),
          }, 'Supprimer ce responsable'),
        ])),
        h('button', {
          key: 'add',
          type: 'button',
          onClick: this.addContact,
        }, 'Ajouter un responsable'),
      ]);
    },
  });

  window.CMS.registerWidget('convocationCategories', ConvocationCategoriesControl);
  window.CMS.registerWidget('resultsByCategory', ResultsByCategoryControl);
  window.CMS.registerWidget('planningByCategory', PlanningByCategoryControl);
  window.CMS.registerWidget('categoryContacts', CategoryContactsControl);
  window.CMS.registerWidget('clubContactDetails', ClubContactDetailsControl);
  window.CMS.registerWidget('clubContacts', ClubContactsControl);
})();
