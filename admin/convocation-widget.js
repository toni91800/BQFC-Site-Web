(function(){
  const h = window.h;
  const createClass = window.createClass;

  if(!window.CMS || typeof h !== 'function' || typeof createClass !== 'function'){
    throw new Error('Impossible d’initialiser le widget de gestion des convocations.');
  }

  function getTeams(value){
    const plainValue = value && typeof value.toJS === 'function' ? value.toJS() : value;
    return Array.isArray(plainValue?.teams) ? plainValue.teams : [];
  }

  function updateTeams(value, teams, onChange){
    const plainValue = value && typeof value.toJS === 'function' ? value.toJS() : value;
    onChange({...((plainValue && typeof plainValue === 'object') ? plainValue : {}), teams});
  }

  function createEmptyTeam(){
    return {
      opponent: '',
      date: '',
      location: '',
      meetingTime: '',
      matchTime: '',
      players: [],
    };
  }

  const ConvocationTeamsControl = createClass({
    handleFieldChange(teamIndex, field, value){
      const teams = getTeams(this.props.value).map(team => ({...team}));
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), [field]: value};
      updateTeams(this.props.value, teams, this.props.onChange);
    },

    handlePlayerChange(teamIndex, playerIndex, value){
      const teams = getTeams(this.props.value).map(team => ({...team}));
      const players = Array.isArray(teams[teamIndex]?.players) ? [...teams[teamIndex].players] : [];
      players[playerIndex] = value;
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), players};
      updateTeams(this.props.value, teams, this.props.onChange);
    },

    addPlayer(teamIndex){
      const teams = getTeams(this.props.value).map(team => ({...team}));
      const players = Array.isArray(teams[teamIndex]?.players) ? [...teams[teamIndex].players] : [];
      players.push('');
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), players};
      updateTeams(this.props.value, teams, this.props.onChange);
    },

    removePlayer(teamIndex, playerIndex){
      const teams = getTeams(this.props.value).map(team => ({...team}));
      const players = Array.isArray(teams[teamIndex]?.players) ? [...teams[teamIndex].players] : [];
      players.splice(playerIndex, 1);
      teams[teamIndex] = {...(teams[teamIndex] || createEmptyTeam()), players};
      updateTeams(this.props.value, teams, this.props.onChange);
    },

    addTeam(){
      updateTeams(this.props.value, [...getTeams(this.props.value), createEmptyTeam()], this.props.onChange);
    },

    removeTeam(teamIndex){
      const teams = getTeams(this.props.value).filter((team, index) => index !== teamIndex);
      updateTeams(this.props.value, teams, this.props.onChange);
    },

    resetCategory(){
      const teams = getTeams(this.props.value);
      if(!window.confirm('Effacer toutes les informations de convocation de cette catégorie ?')){
        return;
      }
      updateTeams(this.props.value, teams.map(() => createEmptyTeam()), this.props.onChange);
    },

    render(){
      const teams = getTeams(this.props.value);
      const field = (teamIndex, key, label, type) => h('label', {className: 'convocation-cms-field'}, [
        h('span', {key: 'label'}, label),
        h('input', {
          key: 'input',
          type: type || 'text',
          value: teams[teamIndex]?.[key] || '',
          onChange: event => this.handleFieldChange(teamIndex, key, event.target.value),
        }),
      ]);

      return h('div', {className: 'convocation-cms-editor'}, [
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
                  onChange: event => this.handlePlayerChange(teamIndex, playerIndex, event.target.value),
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

  window.CMS.registerWidget('convocationTeams', ConvocationTeamsControl);
})();
