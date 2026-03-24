// ─── CLUB COLOURS ────────────────────────────────────────────
const CLUB_COLOURS = {
  'Adelaide Crows':    { type:'hoops',   c1:'#002B5C', c2:'#E21937',  c3:'#FFB700' },
  'Brisbane Lions':    { type:'split-h', c1:'#0054A4', c2:'#78003B',  c3:'#FFD200' },
  'Carlton':           { type:'carlton', c1:'#002B5C', c2:'#002B5C'  },
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
    case 'carlton': {
      const pad = size * 0.1;
      const imgSize = size - pad * 2;
      pattern = `
        <rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <image href="data:image/png;base64,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" x="${pad}" y="${pad}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid meet"/>
      `;
      break;
    }
    case 'hoops':
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <rect x="0" y="${size*0.3}" width="${size}" height="${size*0.22}" fill="${c.c2}"/>
        <rect x="0" y="${size*0.57}" width="${size}" height="${size*0.22}" fill="${c.c3||c.c1}"/>`;
      break;
    case 'stripes':
      const sw2 = c.thin ? size/8 : size/5;
      pattern = `<rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <rect x="${sw2}" y="0" width="${sw2}" height="${size}" fill="${c.c2}"/>
        <rect x="${sw2*3}" y="0" width="${sw2}" height="${size}" fill="${c.c2}"/>
        <rect x="${sw2*5}" y="0" width="${sw2}" height="${size}" fill="${c.c2}"/>`;
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
Object.assign(window, {
  CLUB_COLOURS, NFL_COLOURS, BADGE_GROUPS,
  getBadgeColours, teamBadge, clubBadge, clubPrimaryColour,
  renderUserAvatar, renderBadgePicker, selectBadge,
  updateProfileBadgePreview, updateRegBadgePreview, updateHeaderAvatar
});
