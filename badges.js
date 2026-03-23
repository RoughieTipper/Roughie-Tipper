// ─── CLUB COLOURS ────────────────────────────────────────────
const CLUB_COLOURS = {
  'Adelaide Crows':    { type:'hoops',   c1:'#002B5C', c2:'#E21937',  c3:'#FFB700' },
  'Brisbane Lions':    { type:'split-h', c1:'#0054A4', c2:'#78003B',  c3:'#FFD200' },
  'Carlton':           { type:'solid',   c1:'#002B5C', c2:'#002B5C'  },
  'Collingwood':       { type:'stripes', c1:'#000000', c2:'#FFFFFF'  },
  'Essendon':          { type:'sash',    c1:'#CC2031', c2:'#000000'  },
  'Fremantle':         { type:'chevron', c1:'#2E1A6E', c2:'#FFFFFF'  },
  'Geelong':           { type:'hoops',   c1:'#003087', c2:'#FFFFFF',  c3:'#003087' },
  'Gold Coast Suns':   { type:'split-h', c1:'#FFD200', c2:'#E8261A'  },
  'GWS Giants':        { type:'split-h', c1:'#333333', c2:'#F47920'  },
  'Hawthorn':          { type:'stripes', c1:'#4D2004', c2:'#FBBF15'  },
  'Melbourne':         { type:'split-v', c1:'#CC2031', c2:'#003C71'  },
  'North Melbourne':   { type:'stripes', c1:'#003087', c2:'#FFFFFF',  thin:true },
  'Port Adelaide':     { type:'split-h', c1:'#008AAB', c2:'#000000'  },
  'Richmond':          { type:'sash',    c1:'#000000', c2:'#FFD200'  },
  'St Kilda':          { type:'thirds',  c1:'#ED0F05', c2:'#FFFFFF',  c3:'#000000' },
  'Sydney Swans':      { type:'hoops',   c1:'#CC2031', c2:'#FFFFFF',  c3:'#CC2031' },
  'West Coast Eagles': { type:'split-h', c1:'#F2A900', c2:'#002B5C'  },
  'Western Bulldogs':  { type:'thirds-h',c1:'#014896', c2:'#CC2031',  c3:'#FFFFFF' },
};

// ─── NFL CLUB COLOURS ────────────────────────────────────────
const NFL_COLOURS = {
  'Buffalo Bills':         { type:'split-v',  c1:'#00338D', c2:'#C60C30' },
  'Miami Dolphins':        { type:'split-h',  c1:'#008E97', c2:'#FC4C02', c3:'#005778' },
  'New England Patriots':  { type:'thirds',   c1:'#002244', c2:'#C60C30', c3:'#B0B7BC' },
  'New York Jets':         { type:'solid',    c1:'#125740', c2:'#ffffff' },
  'Baltimore Ravens':      { type:'sash',     c1:'#241773', c2:'#000000' },
  'Cincinnati Bengals':    { type:'stripes',  c1:'#FB4F14', c2:'#000000' },
  'Cleveland Browns':      { type:'split-h',  c1:'#311D00', c2:'#FF3C00' },
  'Pittsburgh Steelers':   { type:'thirds',   c1:'#FFB612', c2:'#101820', c3:'#C60C30' },
  'Houston Texans':        { type:'split-v',  c1:'#03202F', c2:'#A71930' },
  'Indianapolis Colts':    { type:'split-h',  c1:'#002C5F', c2:'#A2AAAD' },
  'Jacksonville Jaguars':  { type:'thirds-h', c1:'#006778', c2:'#D7A22A', c3:'#101820' },
  'Tennessee Titans':      { type:'hoops',    c1:'#0C2340', c2:'#4B92DB', c3:'#C8102E' },
  'Denver Broncos':        { type:'split-h',  c1:'#FB4F14', c2:'#002244' },
  'Kansas City Chiefs':    { type:'split-v',  c1:'#E31837', c2:'#FFB81C' },
  'Las Vegas Raiders':     { type:'split-v',  c1:'#000000', c2:'#A5ACAF' },
  'Los Angeles Chargers':  { type:'split-h',  c1:'#0080C6', c2:'#FFC20E', c3:'#FFFFFF' },
  'Dallas Cowboys':        { type:'sash',     c1:'#003594', c2:'#869397' },
  'New York Giants':       { type:'split-v',  c1:'#0B2265', c2:'#A71930' },
  'Philadelphia Eagles':   { type:'split-h',  c1:'#004C54', c2:'#A5ACAF' },
  'Washington Commanders': { type:'split-h',  c1:'#5A1414', c2:'#FFB612' },
  'Chicago Bears':         { type:'split-v',  c1:'#0B162A', c2:'#C83803' },
  'Detroit Lions':         { type:'split-h',  c1:'#0076B6', c2:'#B0B7BC' },
  'Green Bay Packers':     { type:'split-h',  c1:'#203731', c2:'#FFB612' },
  'Minnesota Vikings':     { type:'sash',     c1:'#4F2683', c2:'#FFC62F' },
  'Atlanta Falcons':       { type:'split-v',  c1:'#A71930', c2:'#000000' },
  'Carolina Panthers':     { type:'split-h',  c1:'#0085CA', c2:'#101820' },
  'New Orleans Saints':    { type:'split-h',  c1:'#D3BC8D', c2:'#101820' },
  'Tampa Bay Buccaneers':  { type:'thirds',   c1:'#D50A0A', c2:'#FF7900', c3:'#0A0A08' },
  'Arizona Cardinals':     { type:'split-v',  c1:'#97233F', c2:'#000000' },
  'Los Angeles Rams':      { type:'hoops',    c1:'#003594', c2:'#FFA300', c3:'#003594' },
  'San Francisco 49ers':   { type:'split-h',  c1:'#AA0000', c2:'#B3995D' },
  'Seattle Seahawks':      { type:'thirds',   c1:'#002244', c2:'#69BE28', c3:'#A5ACAF' },
};

const BADGE_GROUPS = [
  { label: '🏉 AFL Teams', teams: Object.keys(CLUB_COLOURS) },
  { label: '🏈 NFL Teams', teams: Object.keys(NFL_COLOURS) }
];

function getBadgeColours(teamName) {
  return CLUB_COLOURS[teamName] || NFL_COLOURS[teamName] || null;
}

function _buildBadgePattern(c, size) {
  let pattern = '';
  switch(c.type) {
    case 'hoops':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <rect x="0" y="${size*0.3}" width="${size}" height="${size*0.22}" fill="${c.c2}"/>
        <rect x="0" y="${size*0.57}" width="${size}" height="${size*0.22}" fill="${c.c3||c.c1}"/>`;
      break;
    case 'stripes':
      const sw = c.thin ? size/8 : size/5;
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <rect x="${sw}" y="0" width="${sw}" height="${size}" fill="${c.c2}"/>
        <rect x="${sw*3}" y="0" width="${sw}" height="${size}" fill="${c.c2}"/>
        <rect x="${sw*5}" y="0" width="${sw}" height="${size}" fill="${c.c2}"/>`;
      break;
    case 'sash':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <polygon points="${size*0.45},0 ${size},0 ${size},${size*0.05} ${size*0.55},${size} 0,${size} 0,${size*0.95}" fill="${c.c2}"/>`;
      break;
    case 'chevron':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <polyline points="${size*0.1},${size*0.35} ${size*0.5},${size*0.72} ${size*0.9},${size*0.35}" fill="none" stroke="${c.c2}" stroke-width="${size*0.14}" stroke-linejoin="round" stroke-linecap="round"/>`;
      break;
    case 'split-h':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c2}"/>
        <rect x="0" y="0" width="${size}" height="${size*0.48}" fill="${c.c1}"/>
        ${c.c3?`<rect x="0" y="${size*0.46}" width="${size}" height="${size*0.08}" fill="${c.c3}"/>`:''}`;
      break;
    case 'split-v':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <rect x="${size*0.5}" y="0" width="${size*0.5}" height="${size}" fill="${c.c2}"/>`;
      break;
    case 'thirds':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c2}"/>
        <rect x="0" y="0" width="${size*0.33}" height="${size}" fill="${c.c1}"/>
        <rect x="${size*0.67}" y="0" width="${size*0.33}" height="${size}" fill="${c.c3||c.c1}"/>`;
      break;
    case 'thirds-h':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <rect x="0" y="${size*0.55}" width="${size}" height="${size*0.22}" fill="${c.c2}"/>
        <rect x="0" y="${size*0.77}" width="${size}" height="${size*0.23}" fill="${c.c3||c.c1}"/>`;
      break;
    default:
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>`;
  }
  return pattern;
}

function _buildSVG(id, size, pattern) {
  const r = size/2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;border-radius:50%;overflow:hidden;" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${id}"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath></defs>
    <g clip-path="url(#${id})">${pattern}</g>
    <circle cx="${r}" cy="${r}" r="${r-0.75}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  </svg>`;
}

function teamBadge(name, size=40) {
  const c = getBadgeColours(name) || { type:'solid', c1:'#1e3054', c2:'#00c853' };
  const id = 'tb-'+name.replace(/[^a-z]/gi,'').toLowerCase()+size;
  return _buildSVG(id, size, _buildBadgePattern(c, size));
}

function clubBadge(name, size=40) {
  const c = CLUB_COLOURS[name] || { type:'solid', c1:'#1e3054', c2:'#00c853' };
  const id = 'cb-'+name.replace(/[^a-z]/gi,'').toLowerCase()+size;
  return _buildSVG(id, size, _buildBadgePattern(c, size));
}

function clubPrimaryColour(name) {
  const c = CLUB_COLOURS[name];
  if (!c) return '#1e3054';
  return c.c1;
}

function renderUserAvatar(user, size=32) {
  if (user && user.badgeTeam && getBadgeColours(user.badgeTeam)) {
    return teamBadge(user.badgeTeam, size);
  }
  const initial = ((user && (user.nick || user.name)) || '?')[0].toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.4)}px;font-weight:700;color:var(--green);flex-shrink:0;">${initial}</div>`;
}

function renderBadgePicker(containerId, selectedTeam, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = `<div style="display:flex;flex-direction:column;gap:14px;">`;
  BADGE_GROUPS.forEach(group => {
    html += `<div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:8px;">${group.label}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">`;
    group.teams.forEach(team => {
      const isSelected = team === selectedTeam;
      const escaped = team.replace(/'/g,"\\'");
      html += `<button type="button" onclick="selectBadge(this,'${containerId}','${escaped}','${containerId}')"
        style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:10px;border:2px solid ${isSelected?'var(--green)':'var(--border)'};background:${isSelected?'rgba(0,200,83,0.12)':'var(--card2)'};cursor:pointer;transition:all 0.15s;min-width:0;"
        data-team="${team.replace(/"/g,'&quot;')}"
        data-container="${containerId}">
        ${teamBadge(team, 28)}
        <span style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;">${team.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>
      </button>`;
    });
    html += `</div></div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function selectBadge(btnEl, containerId, teamName, _unused) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('button[data-team]').forEach(b => {
    b.style.borderColor = 'var(--border)';
    b.style.background = 'var(--card2)';
  });
  btnEl.style.borderColor = 'var(--green)';
  btnEl.style.background = 'rgba(0,200,83,0.12)';
  if (containerId === 'profile-badge-picker') {
    const hidden = document.getElementById('profile-badge-hidden');
    if (hidden) hidden.value = teamName;
    updateProfileBadgePreview(teamName);
  } else if (containerId === 'reg-badge-picker') {
    const hidden = document.getElementById('reg-badge-hidden');
    if (hidden) hidden.value = teamName;
    updateRegBadgePreview(teamName);
  }
}

function updateProfileBadgePreview(teamName) {
  const wrap = document.getElementById('profile-avatar-wrap-inner');
  if (!wrap) return;
  if (teamName && getBadgeColours(teamName)) {
    wrap.innerHTML = teamBadge(teamName, 90);
  } else {
    wrap.innerHTML = '<span style="font-size:32px;">👤</span>';
  }
}

function updateRegBadgePreview(teamName) {
  const wrap = document.getElementById('reg-badge-preview');
  if (!wrap) return;
  if (teamName && getBadgeColours(teamName)) {
    wrap.innerHTML = teamBadge(teamName, 44) + `<span style="font-size:13px;font-weight:600;color:var(--text);margin-left:8px;">${teamName}</span>`;
    wrap.style.display = 'flex';
  } else {
    wrap.style.display = 'none';
  }
}

function updateHeaderAvatar(userProfile) {
  const ha = document.getElementById('header-avatar');
  if (!ha) return;
  const bt = userProfile?.badgeTeam;
  if (bt && getBadgeColours(bt)) {
    ha.innerHTML = teamBadge(bt, 32);
    ha.style.backgroundImage = '';
    ha.style.display = 'flex';
    ha.style.alignItems = 'center';
    ha.style.justifyContent = 'center';
    ha.style.padding = '0';
  } else {
    ha.innerHTML = '';
    ha.style.display = 'none';
  }
}

// Export all functions to window so they are accessible globally
Object.assign(window, {
  CLUB_COLOURS, NFL_COLOURS, BADGE_GROUPS,
  getBadgeColours, teamBadge, clubBadge, clubPrimaryColour,
  renderUserAvatar, renderBadgePicker, selectBadge,
  updateProfileBadgePreview, updateRegBadgePreview, updateHeaderAvatar
});
