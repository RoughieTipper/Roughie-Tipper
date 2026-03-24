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
      // Carlton — circular PNG embedded directly
      pattern = `
        <rect x="0" y="0" width="${size}" height="${size}" fill="${c.c1}"/>
        <image href="data:image/png;base64,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" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>
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
