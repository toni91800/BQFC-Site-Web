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
    {competition: 'championnat', team: 'u14', label: 'Championnat — U14'},
    {competition: 'championnat', team: 'u15F', label: 'Championnat — U15 F'},
    {competition: 'championnat', team: 'u16', label: 'Championnat — U16'},
    {competition: 'championnat', team: 'u18', label: 'Championnat — U18'},
    {competition: 'championnat', team: 'seniorsF', label: 'Championnat — Séniors F'},
    {competition: 'championnat', team: 'seniors1', label: 'Championnat — Séniors 1'},
    {competition: 'championnat', team: 'seniors2', label: 'Championnat — Séniors 2'},
    {competition: 'championnat', team: 'veterans55', label: 'Championnat — Vétérans +55'},
    {competition: 'coupe', team: 'u14', label: 'Coupe — U14'},
    {competition: 'coupe', team: 'u16', label: 'Coupe — U16'},
    {competition: 'coupe', team: 'seniors1', label: 'Coupe — Séniors 1'},
    {competition: 'coupe', team: 'seniors2', label: 'Coupe — Séniors 2'},
  ];
  const NEWS_CATEGORY_CHOICES = ['Matchs', 'Résultats', 'Reprise', 'Vie du club', 'Informations', 'Autre'];
  const newsCategoryOptions = new Set(NEWS_CATEGORY_CHOICES);
  let newsCategoryLoadPromise;

  function loadNewsCategoryOptions(){
    if(!newsCategoryLoadPromise){
      newsCategoryLoadPromise = fetch('/data/actualites.json', {cache: 'no-cache'})
        .then(response => {
          if(!response.ok) throw new Error(`Chargement des catégories impossible (${response.status}).`);
          return response.json();
        })
        .then(data => {
          if(!data || !Array.isArray(data.articles)){
            throw new Error('Le fichier des actualités ne contient pas une liste d’articles valide.');
          }
          data.articles.forEach(article => {
            if(typeof article?.category === 'string' && article.category.trim()){
              newsCategoryOptions.add(article.category.trim());
            }
          });
        });
    }
    return newsCategoryLoadPromise;
  }

  function toPlain(value){
    return value && typeof value.toJS === 'function' ? value.toJS() : value;
  }

  function createNewsSlug(title){
    const slug = String(title || '')
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || 'actualite';
  }

  function createNewsSummary(body){
    const summary = String(body || '').replace(/\s+/g, ' ').trim();
    if(summary.length <= 180) return summary;
    const excerpt = summary.slice(0, 177);
    const lastSpace = excerpt.lastIndexOf(' ');
    return `${excerpt.slice(0, lastSpace > 120 ? lastSpace : 177).trimEnd()}…`;
  }

  function getNewsDate(article){
    const date = article.get('date');
    if(typeof date !== 'string') return '';
    let year;
    let month;
    let day;
    let match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(match){
      [, year, month, day] = match;
    } else {
      match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if(!match) return '';
      [, day, month, year] = match;
    }
    const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if(
      parsedDate.getUTCFullYear() !== Number(year) ||
      parsedDate.getUTCMonth() !== Number(month) - 1 ||
      parsedDate.getUTCDate() !== Number(day)
    ) return '';
    return parsedDate.toISOString().slice(0, 10);
  }

  window.CMS.registerEventListener({
    name: 'preSave',
    handler: ({entry}) => {
      const data = entry.get('data');
      const articles = data.get('articles');
      if(!articles || typeof articles.map !== 'function') return data;

      const reservedSlugs = new Set();
      articles.forEach(article => {
        const baseSlug = createNewsSlug(article.get('title'));
        const existingSlug = article.get('slug');
        const existingSuffix = typeof existingSlug === 'string' && existingSlug.startsWith(`${baseSlug}-`)
          ? existingSlug.slice(baseSlug.length + 1)
          : '';
        if(existingSlug === baseSlug || (/^\d+$/.test(existingSuffix) &&
          Number(existingSuffix) >= 2 && String(Number(existingSuffix)) === existingSuffix)){
          reservedSlugs.add(existingSlug);
        }
      });

      const assignedSlugs = new Set();
      const updatedArticles = articles.map(article => {
        const baseSlug = createNewsSlug(article.get('title'));
        const existingSlug = article.get('slug');
        const existingSuffix = typeof existingSlug === 'string' && existingSlug.startsWith(`${baseSlug}-`)
          ? existingSlug.slice(baseSlug.length + 1)
          : '';
        const canKeepSlug = (existingSlug === baseSlug ||
          (/^\d+$/.test(existingSuffix) &&
            Number(existingSuffix) >= 2 && String(Number(existingSuffix)) === existingSuffix)) &&
          !assignedSlugs.has(existingSlug);
        let slug = canKeepSlug ? existingSlug : baseSlug;
        let numberSuffix = 2;
        while(assignedSlugs.has(slug) || (!canKeepSlug && reservedSlugs.has(slug))) {
          slug = `${baseSlug}-${numberSuffix++}`;
        }
        assignedSlugs.add(slug);
        return article
          .set('slug', slug)
          .set('summary', createNewsSummary(article.get('body')));
      });
      const sortedArticles = updatedArticles.sort((first, second) => {
        const firstDate = getNewsDate(first);
        const secondDate = getNewsDate(second);
        if(!firstDate) return secondDate ? 1 : 0;
        if(!secondDate) return -1;
        return secondDate.localeCompare(firstDate);
      });
      return data.set('articles', sortedArticles);
    },
  });

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
    expandCmsList('articles');
    expandCmsList('roles');
  }

  const cmsListObserver = new MutationObserver(expandCmsLists);
  cmsListObserver.observe(document.body, {childList: true, subtree: true});
  expandCmsLists();

  const NewsCategoryControl = createClass({
    getInitialState(){
      return {
        customMode: this.props.value === 'Autre',
        optionsLoaded: false,
        optionsError: '',
      };
    },

    componentDidMount(){
      loadNewsCategoryOptions()
        .then(() => this.setState({optionsLoaded: true}))
        .catch(error => {
          console.error('Unable to load saved news categories:', error);
          this.setState({
            optionsLoaded: true,
            optionsError: 'Les anciennes catégories n’ont pas pu être chargées. Vous pouvez toujours choisir une catégorie existante ou en saisir une nouvelle.',
          });
        });
    },

    changeCategory(event){
      const value = event.target.value;
      const customMode = value === 'Autre';
      this.setState({customMode});
      this.props.onChange(value);
    },

    changeCustomCategory(event){
      const value = event.target.value;
      const normalizedValue = value.trim();
      if(normalizedValue) newsCategoryOptions.add(normalizedValue);
      this.props.onChange(value);
    },

    render(){
      const currentValue = typeof this.props.value === 'string' ? this.props.value : '';
      const customOptions = [...newsCategoryOptions]
        .filter(category => !NEWS_CATEGORY_CHOICES.includes(category))
        .sort((first, second) => first.localeCompare(second, 'fr'));
      if(currentValue && !newsCategoryOptions.has(currentValue)){
        customOptions.push(currentValue);
      }
      const selectValue = this.state.customMode ? 'Autre' : currentValue;
      return h('div', {className: 'news-category-control'}, [
        h('label', {key: 'select-label', className: 'news-category-field'}, [
          h('span', {key: 'label'}, 'Catégorie de l’article'),
          h('select', {
            key: 'select',
            value: selectValue,
            onChange: event => this.changeCategory(event),
          }, [
            ...NEWS_CATEGORY_CHOICES.slice(0, -1).map(category =>
              h('option', {key: category, value: category}, category)
            ),
            ...customOptions.map(category =>
              h('option', {key: `custom-${category}`, value: category}, category)
            ),
            h('option', {key: 'other', value: 'Autre'}, 'Autre — saisir une catégorie'),
          ]),
        ]),
        this.state.customMode ? h('label', {
          key: 'custom-label',
          className: 'news-category-field',
        }, [
          h('span', {key: 'label'}, 'Nom de la nouvelle catégorie'),
          h('input', {
            key: 'input',
            type: 'text',
            value: currentValue === 'Autre' ? '' : currentValue,
            placeholder: 'Saisissez votre catégorie',
            onChange: event => this.changeCustomCategory(event),
          }),
        ]) : null,
        this.state.optionsError ? h('p', {
          key: 'error',
          className: 'news-category-error',
          role: 'alert',
        }, this.state.optionsError) : null,
        !this.state.optionsLoaded || customOptions.length === 0 ? null : h('p', {
          key: 'help',
          className: 'news-category-help',
        }, 'Les catégories personnalisées enregistrées sont également disponibles dans cette liste.'),
      ]);
    },
  });

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

  window.CMS.registerWidget('newsCategory', NewsCategoryControl);
  window.CMS.registerWidget('convocationCategories', ConvocationCategoriesControl);
  window.CMS.registerWidget('resultsByCategory', ResultsByCategoryControl);
})();
