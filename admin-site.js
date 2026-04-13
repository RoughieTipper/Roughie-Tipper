// ─── ADMIN SITE — roughietips site-admin-only functions ─────────────────────
// Included via <script src="admin-site.js"> in index.html
// All functions here are guarded by SITE_ADMIN_UID checks

// ─── ADMIN ───────────────────────────────────────────────────
function renderAdmin(){
  const isSiteAdmin = currentUser?.uid===SITE_ADMIN_UID||userProfile?.isAdmin;
  if (isSiteAdmin) renderAdminEditTips();
  if(!isSiteAdmin) return;
  // Load admin moderation ack state
  if (currentCompId && allComps[currentCompId]) {
    const ackBox = el('admin-moderation-ack');
    const ackStatus = el('admin-ack-status');
    if (ackBox) ackBox.checked = !!allComps[currentCompId].adminAck;
    if (ackStatus && allComps[currentCompId].adminAck) {
      ackStatus.innerHTML = '<span style="color:var(--green);">✓ Previously acknowledged.</span>';
    }
  }
  renderAdminUsers();
  renderAdminRoundsList();
  populateAdminRoundSelects();
  renderAdminMatchesList();
  renderAdminResults();
  renderAdminComps();
}
function showAdminTab(tab,btn){
  document.querySelectorAll('.admin-section').forEach(s=>s.style.display='none');
  document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
  el('admin-'+tab).style.display='block';
  if(btn) btn.classList.add('active');
  if(tab==='matches'){populateAdminRoundSelects();renderAdminMatchesList();}
  if(tab==='results'){populateAdminRoundSelects();renderAdminResults();}
  if(tab==='settings') renderAdminSettings();
  if(tab==='comps') renderAdminComps();
  if(tab==='activity') renderAdminActivity();
}
function renderAdminUsers(){
  el('admin-users-list').innerHTML=Object.entries(allUsers).map(([uid,u])=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:10px;">
        ${renderUserAvatar(u, 36)}
        <div>
          <span style="font-weight:600;">${escHtml(u.name)}</span>
          ${u.nick?`<span style="color:var(--muted);font-size:13px;"> · ${escHtml(u.nick)}</span>`:''}
          ${u.isAdmin?'<span class="result-badge badge-win" style="margin-left:8px;">Admin</span>':''}
          <div style="font-size:12px;color:var(--muted);">${escHtml(u.email||'')} · Comps: ${(u.compIds||[]).map(id=>allComps[id]?.name||id).join(', ')||'None'}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        ${uid!==currentUser.uid
          ?`<button class="btn btn-outline" style="font-size:12px;padding:5px 10px;" onclick="toggleAdmin('${uid}',${u.isAdmin})">${u.isAdmin?'Remove Admin':'Make Admin'}</button>
            <button class="btn btn-red" style="font-size:12px;padding:5px 10px;" onclick="removeUser('${uid}')">Remove</button>`
          :'<span style="color:var(--muted);font-size:12px;">You</span>'}
      </div>
    </div>`).join('')||'<div style="color:var(--muted);">No users yet.</div>';
}
async function saveAdminAck() {
  if (!currentCompId) return;
  const checked = el('admin-moderation-ack')?.checked;
  await updateDoc(doc(db,'comps',currentCompId),{ adminAck: checked, adminAckBy: currentUser.uid, adminAckAt: serverTimestamp() });
  const status = el('admin-ack-status');
  if (status) status.innerHTML = checked
    ? '<span style="color:var(--green);">✓ Acknowledged — thank you for taking this seriously.</span>'
    : '<span style="color:var(--muted);">Acknowledgement removed.</span>';
}

async function toggleAdmin(uid,currentlyAdmin){
  if(!confirm(currentlyAdmin?'Remove admin?':'Make admin?')) return;
  await updateDoc(doc(db,'users',uid),{isAdmin:!currentlyAdmin});
  toast(currentlyAdmin?'Admin removed':'Admin granted');
}
async function removeUser(uid){
  if(!confirm('Remove this user?')) return;
  await deleteDoc(doc(db,'users',uid));
  await deleteDoc(doc(db,'tips',uid));
  toast('User removed');
}
async function addRound(){
  const nameInput = el('new-round-name');
  const name = nameInput ? nameInput.value.trim() : '';
  if(!name){toast('Enter a round name first',true);return;}
  const id='round_'+Date.now(), num=rounds.length+1;
  const season = new Date().getFullYear().toString();
  await setDoc(doc(db,'rounds',id),{name,order:num,matches:[],season});
  if(nameInput) nameInput.value='';
  toast(`${name} added!`);
}
function populateAdminRoundSelects(){
  ['admin-match-round','admin-view-round','admin-results-round'].forEach(id=>{
    const e=el(id); if(!e) return;
    const current=e.value;
    e.innerHTML=rounds.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
    if(current && rounds.find(r=>r.id===current)) e.value=current;
  });
}
async function addMatch(){
  const home=el('nm-home').value.trim();
  const homeOdds=parseFloat(el('nm-home-odds').value);
  const away=el('nm-away').value.trim();
  const awayOdds=parseFloat(el('nm-away-odds').value);
  const date=el('nm-date').value, time=to24hr(el('nm-time').value||'7:30', el('nm-ampm').value||'PM'), venue=el('nm-venue').value.trim(), roundId=el('admin-match-round').value;
  if(!home){toast('Please enter home team name',true);return;}
  if(!homeOdds||isNaN(homeOdds)){toast('Please enter home team odds',true);return;}
  if(!away){toast('Please enter away team name',true);return;}
  if(!awayOdds||isNaN(awayOdds)){toast('Please enter away team odds',true);return;}
  if(!date){toast('Please enter match date',true);return;}
  if(!roundId){toast('Select a round first',true);return;}
  const round=rounds.find(r=>r.id===roundId); if(!round) return;
  const newMatch={id:'m'+Date.now(),home,homeOdds,away,awayOdds,date,time,venue,winner:null};
  await updateDoc(doc(db,'rounds',roundId),{matches:[...(round.matches||[]),newMatch]});
  ['nm-home','nm-home-odds','nm-away','nm-away-odds','nm-date','nm-time','nm-venue'].forEach(i=>el(i).value='');
  if(el('nm-ampm')) el('nm-ampm').value='PM';
  toast('Match added!');
}
function renderAdminMatchesList(){
  const saved=el('admin-view-round')?.value;
  const roundId=saved||el('admin-view-round')?.value, round=rounds.find(r=>r.id===roundId);
  const container=el('admin-matches-list'); if(!container) return;
  if(!round||!(round.matches||[]).length){container.innerHTML='<div style="color:var(--muted);padding:10px 0;">No matches yet.</div>';return;}
  container.innerHTML=round.matches.map(m=>`
    <div style="border-bottom:1px solid var(--border);padding:12px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          ${clubBadge(m.home,22)} <span style="font-weight:600;">${escHtml(m.home)}</span> <span style="color:${m.homeOdds>=2.5?'var(--gold)':'var(--green)'};">$${Number(m.homeOdds).toFixed(2)}</span>
          <span style="color:var(--muted);margin:0 4px;">vs</span>
          ${clubBadge(m.away,22)} <span style="font-weight:600;">${escHtml(m.away)}</span> <span style="color:${m.awayOdds>=2.5?'var(--gold)':'var(--green)'};">$${Number(m.awayOdds).toFixed(2)}</span>
          <span style="color:var(--muted);font-size:12px;">📅 ${formatMatchDate(m.date)} ${m.time?'@ '+to12hr(m.time):''} ${m.venue?'· '+escHtml(m.venue):''}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-outline" style="font-size:11px;padding:4px 8px;" onclick="moveMatch('${roundId}','${m.id}',-1)">↑</button>
          <button class="btn btn-outline" style="font-size:11px;padding:4px 8px;" onclick="moveMatch('${roundId}','${m.id}',1)">↓</button>
          <button class="btn btn-outline" style="font-size:12px;padding:5px 12px;" onclick="toggleEditMatch('${roundId}','${m.id}')">✏️ Edit</button>
          <button class="btn btn-red" style="font-size:12px;padding:5px 12px;" onclick="removeMatch('${roundId}','${m.id}')">Remove</button>
        </div>
      </div>
      <div id="edit-form-${m.id}" style="display:none;margin-top:12px;padding:14px;background:var(--card2);border-radius:10px;">
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px;font-weight:600;">EDIT MATCH DETAILS</div>
        <div style="display:grid;grid-template-columns:90px 90px 90px 120px 100px;gap:10px;align-items:center;flex-wrap:wrap;">
          <div><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">Home Odds</div>
            <input type="number" id="edit-homeodds-${m.id}" value="${m.homeOdds}" step="0.05" min="1" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;"/></div>
          <div><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">Away Odds</div>
            <input type="number" id="edit-awayodds-${m.id}" value="${m.awayOdds}" step="0.05" min="1" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;"/></div>
          <div><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">Date</div>
            <input type="date" id="edit-date-${m.id}" value="${m.date||''}" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;"/></div>
          <div><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">Kick-off</div>
            <input type="text" id="edit-time-${m.id}" value="${m.time||'19:30'}" placeholder="19:30" maxlength="5" oninput="formatTimeInput(this)" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;"/></div>
          <div><div style="font-size:11px;color:var(--muted);margin-bottom:4px;">Venue</div>
            <input type="text" id="edit-venue-${m.id}" value="${escHtml(m.venue||'')}" placeholder="e.g. MCG" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;"/></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn" style="font-size:13px;padding:8px 18px;" onclick="saveMatchEdit('${roundId}','${m.id}')">💾 Save Changes</button>
          <button class="btn btn-outline" style="font-size:13px;padding:8px 14px;" onclick="toggleEditMatch('${roundId}','${m.id}')">Cancel</button>
        </div>
      </div>
    </div>`).join('');
}
async function moveMatch(roundId, matchId, direction) {
  const round = rounds.find(r => r.id === roundId); if (!round) return;
  const matches = [...(round.matches || [])];
  const idx = matches.findIndex(m => m.id === matchId); if (idx === -1) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= matches.length) return;
  // Swap
  [matches[idx], matches[swapIdx]] = [matches[swapIdx], matches[idx]];
  await updateDoc(doc(db, 'rounds', roundId), { matches });
  toast('Match moved');
}

function toggleEditMatch(roundId, matchId) {
  const form = el('edit-form-'+matchId); if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
async function saveMatchEdit(roundId, matchId) {
  const round = rounds.find(r=>r.id===roundId); if(!round) return;
  const homeOdds = parseFloat(el('edit-homeodds-'+matchId)?.value);
  const awayOdds = parseFloat(el('edit-awayodds-'+matchId)?.value);
  const date = el('edit-date-'+matchId)?.value;
  const time = el('edit-time-'+matchId)?.value||'19:30';
  const venue = el('edit-venue-'+matchId)?.value.trim()||'';
  if(isNaN(homeOdds)||isNaN(awayOdds)){toast('Please enter valid odds',true);return;}
  // Save selected round before update triggers re-render
  const viewRound = el('admin-view-round');
  const savedViewRound = viewRound?.value;
  const matches = round.matches.map(m=>m.id===matchId?{...m,homeOdds,awayOdds,date,time,venue}:m);
  await updateDoc(doc(db,'rounds',roundId),{matches});
  // Restore dropdown selection after re-render
  setTimeout(()=>{
    if(savedViewRound && el('admin-view-round')) {
      el('admin-view-round').value = savedViewRound;
      renderAdminMatchesList();
    }
  }, 300);
  toast('Match updated! ✓');
}
async function removeMatch(roundId,matchId){
  if(!confirm('Remove this match?')) return;
  const round=rounds.find(r=>r.id===roundId);
  await updateDoc(doc(db,'rounds',roundId),{matches:(round.matches||[]).filter(m=>m.id!==matchId)});
  toast('Match removed');
}
function renderAdminResults(){
  const roundId=el('admin-results-round')?.value, round=rounds.find(r=>r.id===roundId);
  const container=el('admin-results-form'); if(!container) return;
  if(!round||!(round.matches||[]).length){container.innerHTML='<div style="color:var(--muted);padding:10px 0;">No matches in this round.</div>';return;}
  container.innerHTML=round.matches.map((m,idx)=>`
    <div style="padding:14px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <div style="flex:1;min-width:180px;">
          ${idx===0?'<span class="result-badge badge-pending" style="margin-bottom:6px;display:inline-block;">🎯 Margin Game</span><br/>':''}
          <div style="font-weight:600;display:flex;align-items:center;gap:6px;">${clubBadge(m.home,20)} ${escHtml(m.home)} vs ${clubBadge(m.away,20)} ${escHtml(m.away)}</div>
          <div style="font-size:12px;color:var(--muted);">📅 ${formatMatchDate(m.date)} ${m.venue?'· '+escHtml(m.venue):''}</div>
        </div>
        <select id="result-${m.id}" style="background:var(--card2);border:1px solid var(--border);color:var(--text);padding:8px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;min-width:220px;">
          <option value="">-- Pick Winner --</option>
          <option value="${m.home}" ${m.winner===m.home?'selected':''}>${escHtml(m.home)} ($${Number(m.homeOdds).toFixed(2)} → ${pts(m.homeOdds)}pt${pts(m.homeOdds)>1?'s':''})</option>
          <option value="${m.away}" ${m.winner===m.away?'selected':''}>${escHtml(m.away)} ($${Number(m.awayOdds).toFixed(2)} → ${pts(m.awayOdds)}pt${pts(m.awayOdds)>1?'s':''})</option>
          <option value="Draw" ${m.winner==='Draw'?'selected':''}>🤝 Draw — everyone gets 1pt</option>
        </select>
        ${idx===0?`<div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:12px;color:var(--muted);">Winning margin:</label>
          <input type="number" id="margin-${m.id}" value="${m.actualMargin||''}" min="1" max="200" placeholder="pts" style="width:72px;background:var(--card2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;"/>
        </div>`:''}
        <button class="btn" style="font-size:13px;padding:8px 16px;" onclick="saveResult('${round.id}','${m.id}',${idx===0})">Save</button>
        ${m.winner==='Draw'?'<span class="result-badge badge-pending">🤝 Draw</span>':m.winner?`<span class="result-badge badge-win">✓ ${escHtml(m.winner)} ${m.actualMargin?'by '+m.actualMargin+'pts':''}</span>`:'<span class="result-badge badge-pending">Pending</span>'}
      </div>
    </div>`).join('');
}
async function saveResult(roundId,matchId,isMarginGame=false){
  const winner=el('result-'+matchId)?.value||null;
  const round=rounds.find(r=>r.id===roundId); if(!round) return;
  const savedResultsRound = el('admin-results-round')?.value;
  const matches = (round.matches||[]).map(m=>{
    if(m.id!==matchId) return m;
    const updated = {...m,winner};
    if(isMarginGame){ const marginVal = parseInt(el('margin-'+matchId)?.value||'0'); updated.actualMargin = marginVal||null; }
    return updated;
  });
  await updateDoc(doc(db,'rounds',roundId),{matches});
  setTimeout(()=>{
    if(savedResultsRound && el('admin-results-round')) {
      el('admin-results-round').value = savedResultsRound;
      renderAdminResults();
    }
  }, 300);
  toast(winner==='Draw'?'Result saved: Draw! 🤝 Everyone gets 1pt':winner?`Result saved: ${winner} wins! 🎉`:'Result cleared');
}

function shareRoundResult() {
  if (!currentCompId || !currentUser) return;
  track('share_result');
  const completedRounds = rounds.filter(r=>(r.matches||[]).length>0&&(r.matches||[]).every(m=>m.winner));
  if (!completedRounds.length) { toast('No completed rounds yet!', true); return; }
  const latestRound = completedRounds[completedRounds.length-1];
  const myTips = allTips[currentUser.uid]||{};
  const matches = latestRound.matches||[];
  const emojis = matches.map(m=>{
    const pick = myTips[m.id] || m.away;
    const isGenerated = myTips['gen_'+m.id];
    if (isGenerated) return '🎲';
    if (!m.winner) return '⬜';
    if (m.winner === 'Draw') return '🤝';
    return pick === m.winner ? '✅' : '❌';
  });
  const correct = matches.filter(m=>{ const pick = myTips[m.id] || m.away; return m.winner && pick === m.winner && !myTips['gen_'+m.id]; }).length;
  const total = matches.filter(m=>m.winner).length;
  const memberIds = Object.entries(allUsers).filter(([uid,u])=>(u.compIds||[]).includes(currentCompId)).map(([uid])=>uid);
  const scores = calcScoresForUsers(memberIds).filter(Boolean);
  const myPos = scores.findIndex(s=>s.uid===currentUser.uid)+1;
  const totalPlayers = scores.length;
  const compName = currentComp?.name || 'Roughie Tips';
  const siteUrl = 'https://roughietips.com.au';
  const roughies = scores.find(s=>s.uid===currentUser.uid)?.roughieBonus||0;
  const roughieLine = roughies > 0 ? `\n🤑 ${roughies} roughie${roughies>1?'s':''} this round!` : '';
  const text = `🏉 ${compName} — ${latestRound.name}\n\n${emojis.join(' ')}\n\n${correct}/${total} correct${roughieLine}\n📍 ${myPos}${ordinal(myPos)} of ${totalPlayers}\n\n${siteUrl}`;
  if (navigator.share) { navigator.share({ text }).catch(()=>{}); }
  else { navigator.clipboard.writeText(text).then(()=>toast('Result copied! Paste it anywhere 📋')).catch(()=>{ const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Result copied! Paste it anywhere 📋'); }); }
}

function ordinal(n) { const s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }

function copyInviteLink() {
  if (!currentComp) return;
  track('share_invite');
  const compName = currentComp.name || 'our AFL tipping comp';
  const code = currentComp.joinCode || '';
  const siteUrl = 'https://roughietips.com.au';
  const inviteUrl = siteUrl + '?join=' + encodeURIComponent(code);
  const missedRounds = rounds.filter(r=>(r.matches||[]).length>0&&(r.matches||[]).every(m=>m.winner)).length;
  let msg;
  if (missedRounds > 0) { msg = `🏉 Join ${compName} on Roughie Tips!\n\nMissed the start of the season? No problem — you'll automatically receive the away team for any rounds you missed and enter with a real score. You're in from here!\n\n👉 ${inviteUrl}`; }
  else { msg = `🏉 Join ${compName} on Roughie Tips!\n\nAFL tipping with roughie points for picking big upsets.\n\n👉 ${inviteUrl}`; }
  if (navigator.share) { navigator.share({ text: msg }).catch(()=>{}); }
  else { navigator.clipboard.writeText(msg).then(()=>toast('Invite copied! Send it to your mates 📋')).catch(()=>{ const ta = document.createElement('textarea'); ta.value = msg; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Invite copied! Send it to your mates 📋'); }); }
}

function renderAdminRoundsList() {
  const container = el('admin-rounds-list'); if(!container) return;
  if(!rounds.length){container.innerHTML='<div style="color:var(--muted);font-size:13px;">No rounds yet.</div>';return;}
  container.innerHTML = rounds.map(r=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);gap:10px;">
      <div style="display:flex;align-items:center;gap:10px;flex:1;">
        <span style="font-size:12px;color:var(--muted);width:24px;text-align:right;">${r.order||'—'}</span>
        <span id="round-name-display-${r.id}" style="font-weight:600;font-size:14px;">${escHtml(r.name)}</span>
        <span style="font-size:12px;color:var(--muted);">(${(r.matches||[]).length} matches)</span>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-outline" style="font-size:11px;padding:4px 10px;" onclick="promptRenameRound('${r.id}','${escHtml(r.name)}')">✏️ Rename</button>
        <button class="btn btn-outline" style="font-size:11px;padding:4px 8px;" onclick="moveRound('${r.id}',-1)">↑</button>
        <button class="btn btn-outline" style="font-size:11px;padding:4px 8px;" onclick="moveRound('${r.id}',1)">↓</button>
        <button class="btn btn-red" style="font-size:11px;padding:4px 10px;" onclick="removeRound('${r.id}')">Delete</button>
      </div>
    </div>`).join('');
}

async function addRoundFromMgmt() {
  const nameInput = el('new-round-name-mgmt');
  const name = nameInput ? nameInput.value.trim() : '';
  if(!name){toast('Enter a round name first',true);return;}
  const id='round_'+Date.now(), num=rounds.length+1;
  const season = new Date().getFullYear().toString();
  await setDoc(doc(db,'rounds',id),{name,order:num,matches:[],season});
  if(nameInput) nameInput.value='';
  toast(name+' added!');
}

async function promptRenameRound(roundId, currentName) {
  const newName = prompt('Rename round:', currentName);
  if(!newName||newName.trim()===currentName) return;
  await updateDoc(doc(db,'rounds',roundId),{name:newName.trim()});
  toast('Round renamed!');
}

async function moveRound(roundId, direction) {
  const idx = rounds.findIndex(r=>r.id===roundId); if(idx===-1) return;
  const swapIdx = idx + direction; if(swapIdx<0||swapIdx>=rounds.length) return;
  const a = rounds[idx], b = rounds[swapIdx];
  await updateDoc(doc(db,'rounds',a.id),{order:b.order||swapIdx+1});
  await updateDoc(doc(db,'rounds',b.id),{order:a.order||idx+1});
  toast('Round moved');
}

async function removeRound(roundId){
  if(!confirm('Delete this round and all its matches?')) return;
  await deleteDoc(doc(db,'rounds',roundId));
  toast('Round deleted');
}
function renderAdminActivity() {
  const container = el('activity-content');
  if (!container) return;

  // Find the current open round (has matches, not all locked)
  const openRound = rounds.find(r => (r.matches||[]).length > 0 && (r.matches||[]).some(m => !isLocked(m.date, m.time)));
  const nextRound = rounds.find(r => (r.matches||[]).length > 0 && !(r.matches||[]).every(m => m.winner));
  const activeRound = openRound || nextRound;

  if (!activeRound) {
    container.innerHTML = '<div style="color:var(--muted);padding:20px 0;text-align:center;">No open rounds right now</div>';
    return;
  }

  const allUids = Object.keys(allUsers);
  const firstMatch = (activeRound.matches||[])[0];
  const roundLocked = firstMatch && isLocked(firstMatch.date, firstMatch.time);

  // Count tips per user for this round
  const tipped = [], notTipped = [];
  allUids.forEach(uid => {
    const u = allUsers[uid]; if (!u) return;
    const myTips = allTips[uid] || {};
    const roundMatches = activeRound.matches || [];
    const tippedCount = roundMatches.filter(m => myTips[m.id]).length;
    const total = roundMatches.length;
    const hasTipped = tippedCount > 0;
    const entry = { uid, name: u.nick || u.name, fullName: u.name, tippedCount, total, avatar: renderUserAvatar(u, 28) };
    if (hasTipped) tipped.push(entry);
    else notTipped.push(entry);
  });

  // Sort tipped by most complete first
  tipped.sort((a,b) => b.tippedCount - a.tippedCount);
  notTipped.sort((a,b) => (a.name||'').localeCompare(b.name||''));

  const pct = Math.round(tipped.length / allUids.length * 100);

  container.innerHTML = `
    <div style="margin-bottom:20px;">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--green);letter-spacing:1px;margin-bottom:4px;">
        ${activeRound.name} ${roundLocked ? '🔒' : ''}
      </div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:16px;">
        ${roundLocked ? 'Tips are locked' : 'Tips are open'} · ${firstMatch ? 'First game: ' + formatMatchDate(firstMatch.date) + (firstMatch.time ? ' @ ' + to12hr(firstMatch.time) : '') : ''}
      </div>

      <!-- Progress bar -->
      <div style="background:var(--card2);border-radius:99px;height:12px;margin-bottom:8px;overflow:hidden;">
        <div style="background:var(--green);height:100%;border-radius:99px;width:${pct}%;transition:width .5s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:20px;">
        <span style="color:var(--green);font-weight:700;">${tipped.length} tipped in (${pct}%)</span>
        <span style="color:var(--muted);">${notTipped.length} yet to tip</span>
      </div>

      <!-- Tipped in -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--green);margin-bottom:10px;">✓ Tipped In</div>
        ${tipped.length === 0 ? '<div style="color:var(--muted);font-size:13px;">Nobody yet</div>' :
          tipped.map(u => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
            ${u.avatar}
            <div style="flex:1;">
              <span style="font-weight:600;font-size:14px;">${escHtml(u.name)}</span>
              ${u.name !== u.fullName ? `<span style="color:var(--muted);font-size:12px;"> · ${escHtml(u.fullName)}</span>` : ''}
            </div>
            <span style="font-size:12px;color:var(--green);font-weight:700;">${u.tippedCount}/${u.total} games</span>
          </div>`).join('')}
      </div>

      <!-- Not tipped -->
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px;">⏳ Yet to Tip</div>
        ${notTipped.length === 0 ? '<div style="color:var(--green);font-size:13px;font-weight:600;">Everyone has tipped! 🎉</div>' :
          notTipped.map(u => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
            ${u.avatar}
            <div style="flex:1;">
              <span style="font-weight:600;font-size:14px;">${escHtml(u.name)}</span>
              ${u.name !== u.fullName ? `<span style="color:var(--muted);font-size:12px;"> · ${escHtml(u.fullName)}</span>` : ''}
            </div>
            <span style="font-size:12px;color:var(--muted);">0/${u.total} games</span>
          </div>`).join('')}
      </div>

      <button class="btn btn-outline" style="margin-top:16px;font-size:13px;" onclick="renderAdminActivity()">↻ Refresh</button>
    </div>
  `;
}

function renderAdminSettings(){
  getDoc(doc(db,'config','joinCode')).then(snap=>{ el('current-join-code').textContent=snap.exists()?snap.data().code:'HUNTERSTIPPING2026'; });
}
async function saveJoinCode(){
  const code=el('new-join-code').value.trim().toUpperCase();
  if(!code){toast('Enter a code',true);return;}
  await setDoc(doc(db,'config','joinCode'),{code});
  el('current-join-code').textContent=code; el('new-join-code').value='';
  toast('Join code updated!');
}
function renderAdminComps(){
  const comps=Object.entries(allComps);
  el('admin-comps-list').innerHTML=comps.length===0
    ?'<div style="color:var(--muted);">No competitions created yet.</div>'
    :comps.map(([id,c])=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);">
        <div>
          <div style="font-weight:700;">${escHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--muted);">Created by ${escHtml(c.ownerName||'')} · Code: <span style="color:var(--gold);font-weight:700;">${escHtml(c.joinCode||'')}</span></div>
          <div style="font-size:12px;color:var(--muted);">Members: ${Object.values(allUsers).filter(u=>(u.compIds||[]).includes(id)).length}</div>
        </div>
        <button class="btn btn-red" style="font-size:12px;padding:5px 12px;" onclick="deleteComp('${id}')">Delete</button>
      </div>`).join('');
}
async function deleteComp(compId){
  if(!confirm('Delete this competition? Members will lose access to it.')) return;
  await deleteDoc(doc(db,'comps',compId)); toast('Competition deleted');
}

// ─── CHAT ────────────────────────────────────────────────────
let unsubChat = null;
function subscribeChat() {
  if (unsubChat) { unsubChat(); unsubChat = null; }
  if (!currentCompId) return;
  const chatQ = query(collection(db, 'chats', currentCompId, 'messages'), orderBy('ts','asc'), limit(100));
  unsubChat = onSnapshot(chatQ, snap=>{ renderChat(snap.docs.map(d=>({id:d.id,...d.data()}))); });
  // Wire mention input listener directly in module scope
  setTimeout(() => {
    const chatInput = el('chat-input');
    if (chatInput && !chatInput._mentionWired) {
      chatInput._mentionWired = true;
      chatInput.addEventListener('input', () => handleMentionInput(chatInput));
      // Hide suggestions when input loses focus (slight delay so click registers first)
      chatInput.addEventListener('blur', () => setTimeout(hideMentionSuggestions, 150));
    }
  }, 500);
}

function renderChat(messages){
  const feed=el('chat-feed'); if(!feed) return;
  const wasAtBottom=feed.scrollHeight-feed.scrollTop-feed.clientHeight<60;
  feed.innerHTML=messages.length===0
    ?`<div style="text-align:center;color:var(--muted);padding:32px;font-size:14px;">No messages yet — get the heckling started! 🏉</div>`
    :messages.map(m=>{
      const isMe=m.uid===currentUser?.uid, u=allUsers[m.uid];
      const isCompAdmin = currentComp?.ownerId === currentUser?.uid;
      const isSiteAdmin = currentUser?.uid === SITE_ADMIN_UID || userProfile?.isAdmin;
      const canDelete = isMe || isSiteAdmin || isCompAdmin;
      const displayName=u?(u.nick||u.name):(m.displayName||'Unknown');
      const timeStr=m.ts?.toDate?formatTime(m.ts.toDate()):'';
      const avatarHtml=renderUserAvatar(u, 28);
      const deleteBtn = canDelete
        ? `<button onclick="deleteMessage('${m.id}')" title="${isMe?'Delete your message':'Remove (admin)'}" style="background:none;border:none;color:${isMe?'rgba(0,200,83,0.35)':'rgba(255,61,61,0.35)'};font-size:13px;cursor:pointer;padding:0 2px;line-height:1;transition:color .15s;flex-shrink:0;" onmouseover="this.style.color='${isMe?'var(--green)':'var(--red)'}'" onmouseout="this.style.color='${isMe?'rgba(0,200,83,0.35)':'rgba(255,61,61,0.35)'}'">🗑</button>`
        : '';
      return `<div class="chat-msg ${isMe?'chat-msg-me':''}">
        ${!isMe?avatarHtml:''}
        <div class="chat-bubble ${isMe?'bubble-me':'bubble-them'}">
          ${!isMe?`<div class="chat-sender">${escHtml(displayName)}</div>`:''}
          <div class="chat-text">${renderChatMessage(m.text)}</div>
          <div class="chat-time" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;">${timeStr}${deleteBtn}</div>
        </div>
        ${isMe?avatarHtml:''}
      </div>`;
    }).join('');
  if(wasAtBottom||messages.length<=5) feed.scrollTop=feed.scrollHeight;
  // Notify if chat panel not active
  if(messages.length > 0) { try { window.notifyNewChat && window.notifyNewChat(); } catch(e){} }
  checkForMentions(messages);
}
function formatTime(d){
  const now=new Date();
  if(d.toDateString()===now.toDateString()) return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  return d.toLocaleDateString([],{day:'numeric',month:'short'})+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
}
async function sendChat(){
  const input=el('chat-input'), text=input.value.trim();
  if(!text||!currentUser) return;
  if(text.length>280){toast('Max 280 characters',true);return;}
  input.value=''; input.style.height='auto';
  track('chat_message_sent');
  const chatCol = currentCompId ? 'chats/'+currentCompId+'/messages' : 'chat';
  await addDoc(collection(db, ...chatCol.split('/')),{ uid:currentUser.uid, displayName:userProfile?.nick||userProfile?.name||'', text, ts:serverTimestamp() });
}
function showCompSettings() {
  if (!currentComp || !currentCompId) return;
  // Populate fields
  const prizes = currentComp.prizes || {};
  if (el('cs-prize-entry')) el('cs-prize-entry').value = prizes.entry||'';
  if (el('cs-prize-first')) el('cs-prize-first').value = prizes.first||'';
  if (el('cs-prize-second')) el('cs-prize-second').value = prizes.second||'';
  if (el('cs-prize-third')) el('cs-prize-third').value = prizes.third||'';
  if (el('cs-prize-payment')) el('cs-prize-payment').value = prizes.paymentInfo||'';
  if (el('cs-biz-name')) el('cs-biz-name').value = currentComp.businessName||'';
  if (el('cs-biz-logo')) el('cs-biz-logo').value = currentComp.businessLogo||'';
  if (el('cs-biz-contact')) el('cs-biz-contact').value = currentComp.businessContact||'';
  if (el('cs-biz-about')) el('cs-biz-about').value = currentComp.businessAbout||'';
  if (el('cs-sponsor-name')) el('cs-sponsor-name').value = currentComp.roundSponsor?.name||'';
  if (el('cs-sponsor-logo')) el('cs-sponsor-logo').value = currentComp.roundSponsor?.logo||'';
  // Populate members list
  const memberIds = Object.entries(allUsers).filter(([uid,u])=>(u.compIds||[]).includes(currentCompId)).map(([uid,u])=>({uid,name:u.nick||u.name||'Unknown'}));
  const membersList = el('cs-members-list');
  if (membersList) {
    membersList.innerHTML = memberIds.length
      ? memberIds.map(m => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
          <div style="flex:1;font-size:14px;">${escHtml(m.name)}</div>
          ${m.uid !== currentUser.uid ? `<button class="btn btn-red" style="font-size:12px;padding:5px 10px;" onclick="removeCompMember('${m.uid}')">Remove</button>` : '<span style="font-size:12px;color:var(--muted);">You (admin)</span>'}
        </div>`).join('')
      : '<div style="color:var(--muted);font-size:13px;">No members yet</div>';
  }
  const sub = el('comp-settings-sub');
  if (sub) sub.textContent = currentComp.name || 'Manage your competition';
  showPage('compsettings');
}

async function saveCompSettingsPrizes() {
  if (!currentCompId) return;
  const prizes = { entry: el('cs-prize-entry')?.value.trim()||'', first: el('cs-prize-first')?.value.trim()||'', second: el('cs-prize-second')?.value.trim()||'', third: el('cs-prize-third')?.value.trim()||'', paymentInfo: el('cs-prize-payment')?.value.trim()||'' };
  await updateDoc(doc(db,'comps',currentCompId),{prizes});
  currentComp.prizes = prizes;
  toast('Prize pool saved! 🏆');
}

async function saveCompSettings() {
  if (!currentCompId) return;
  const businessName = el('cs-biz-name')?.value.trim()||'';
  const businessLogo = el('cs-biz-logo')?.value.trim()||'';
  const businessContact = el('cs-biz-contact')?.value.trim()||'';
  const businessAbout = el('cs-biz-about')?.value.trim()||'';
  const sponsorName = el('cs-sponsor-name')?.value.trim()||'';
  const sponsorLogo = el('cs-sponsor-logo')?.value.trim()||'';
  const roundSponsor = sponsorName ? { name: sponsorName, logo: sponsorLogo } : null;
  await updateDoc(doc(db,'comps',currentCompId),{businessName,businessLogo,businessContact,businessAbout,roundSponsor});
  currentComp.businessName=businessName; currentComp.businessLogo=businessLogo;
  currentComp.businessContact=businessContact; currentComp.businessAbout=businessAbout;
  currentComp.roundSponsor=roundSponsor;
  toast('Business settings saved! 🏢');
}

async function removeCompMember(uid) {
  if (!currentCompId) return;
  if (!confirm('Remove this member from the comp?')) return;
  const userRef = doc(db,'users',uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const compIds = (userSnap.data().compIds||[]).filter(id => id !== currentCompId);
  await updateDoc(userRef,{compIds});
  toast('Member removed');
  showCompSettings();
}

function closeModerationAckModal() {
  const modal = el('moderation-ack-modal');
  if (modal) modal.classList.remove('open');
  _pendingCompData = null;
}

async function confirmModerationAck() {
  if (!_pendingCompData) return;
  const { name, code, sport, season } = _pendingCompData;
  const modal = el('moderation-ack-modal');
  if (modal) modal.classList.remove('open');
  _pendingCompData = null;
  const btn = el('create-comp-btn');
  if (btn) btn.textContent = 'Creating…';
  try {
    const compId = 'comp_'+Date.now();
    await setDoc(doc(db,'comps',compId),{ name, joinCode:code, ownerId:currentUser.uid, ownerName:userProfile.name, createdAt:serverTimestamp(), plan:'free', sport, season, businessName:'', businessLogo:'', businessContact:'', businessAbout:'', roundSponsor:null, memberLimit:50, adminAck:true, adminAckBy:currentUser.uid, adminAckAt:serverTimestamp() });
    const compIds = [...(userProfile.compIds||[]), compId];
    await updateDoc(doc(db,'users',currentUser.uid),{compIds});
    userProfile.compIds = compIds;
    allComps[compId] = { name, joinCode:code, ownerId:currentUser.uid, ownerName:userProfile.name, plan:'free', sport, season };
    toast('Competition created! 🏉');
    if (el('new-comp-name')) el('new-comp-name').value = '';
    if (el('new-comp-code')) el('new-comp-code').value = '';
    renderMyComps();
    await loadComp(compId);
  } catch(e) { console.error('Create comp error:', e); toast('Error creating comp',true); }
  if (btn) btn.textContent = 'Create Competition';
}

async function savePrizes() {
  if (!currentCompId||!currentComp) return;
  if (!currentUser || currentComp.ownerId !== currentUser.uid) return;
  const prizes = { entry: el('prize-input-entry').value.trim(), first: el('prize-input-first').value.trim(), second: el('prize-input-second').value.trim(), third: el('prize-input-third').value.trim(), paymentInfo: el('prize-input-payment').value.trim() };
  await updateDoc(doc(db,'comps',currentCompId),{prizes});
  currentComp.prizes = prizes; renderLeaderboard(); toast('Prize money updated! 🏆');
}

async function saveBusinessSettings() {
  if (!currentCompId||!currentComp) return;
  if (!currentUser || currentComp.ownerId !== currentUser.uid) return;
  const businessName = el('biz-name-input')?.value.trim()||'';
  const businessLogo = el('biz-logo-input')?.value.trim()||'';
  const businessContact = el('biz-contact-input')?.value.trim()||'';
  const businessAbout = el('biz-about-input')?.value.trim()||'';
  const sponsorName = el('round-sponsor-input')?.value.trim()||'';
  const sponsorLogo = el('round-sponsor-logo-input')?.value.trim()||'';
  const roundSponsor = sponsorName ? { name: sponsorName, logo: sponsorLogo } : null;
  await updateDoc(doc(db,'comps',currentCompId),{businessName,businessLogo,businessContact,businessAbout,roundSponsor});
  currentComp.businessName=businessName; currentComp.businessLogo=businessLogo;
  currentComp.businessContact=businessContact; currentComp.businessAbout=businessAbout;
  currentComp.roundSponsor=roundSponsor;
  toast('Business settings saved! 🏢');
}

async function togglePaid(uid, currentlyPaid) {
  if (!currentCompId||!currentComp) return;
  if (!currentUser || currentComp.ownerId !== currentUser.uid) return;
  const paidUids = {...(currentComp.paidUids||{})};
  if (currentlyPaid) delete paidUids[uid]; else paidUids[uid] = true;
  await updateDoc(doc(db,'comps',currentCompId),{paidUids});
  currentComp.paidUids = paidUids; renderLeaderboard();
  toast(currentlyPaid ? 'Marked as unpaid' : 'Marked as paid 💰');
}

// ─── SIDE BETS ───────────────────────────────────────────────
function populateBetTargets() {
  const sel = el('bet-target'); if(!sel||!currentCompId) return;
  const memberIds = Object.entries(allUsers).filter(([uid,u])=>(u.compIds||[]).includes(currentCompId) && uid !== currentUser.uid).map(([uid,u])=>({uid,name:u.nick||u.name}));
  sel.innerHTML = '<option value="">Select who you are challenging...</option>' + memberIds.map(m=>`<option value="${m.uid}">${escHtml(m.name)}</option>`).join('');
}

async function proposeBet() {
  const targetUid = el('bet-target').value, text = el('bet-text').value.trim(), stake = el('bet-stake').value.trim();
  if(!targetUid){toast('Select who you are challenging',true);return;}
  if(!text){toast('Enter your bet details',true);return;}
  if(!stake){toast('Enter the stake',true);return;}
  const targetUser = allUsers[targetUid];
  await addDoc(collection(db,'comps',currentCompId,'sidebets'),{ fromUid: currentUser.uid, fromName: userProfile.nick||userProfile.name, toUid: targetUid, toName: targetUser.nick||targetUser.name, text, stake, status: 'open', createdAt: serverTimestamp() });
  el('bet-text').value=''; el('bet-stake').value=''; el('bet-target').value='';
  track('side_bet_proposed');
  toast('Challenge sent! 🤑');
}

async function acceptBet(betId) {
  const responderName = userProfile?.nick || userProfile?.name || 'They';
  await updateDoc(doc(db,'comps',currentCompId,'sidebets',betId),{ status: 'accepted', responseNotify: 'accepted', responderName, respondedAt: serverTimestamp() });
  track('side_bet_accepted');
  toast('Bet accepted! Honour system from here 🤝');
}

async function declineBet(betId) {
  if(!confirm('Decline this challenge?')) return;
  const responderName = userProfile?.nick || userProfile?.name || 'They';
  await updateDoc(doc(db,'comps',currentCompId,'sidebets',betId),{ responseNotify: 'declined', responderName, respondedAt: serverTimestamp() });
  toast('Challenge declined');
}

async function deleteBet(betId) {
  if(!confirm('Remove this bet?')) return;
  await deleteDoc(doc(db,'comps',currentCompId,'sidebets',betId));
}

let unsubSideBets = null;
function subscribeSideBets() {
  if(unsubSideBets){unsubSideBets();unsubSideBets=null;}
  if(!currentCompId) return;
  const q = collection(db,'comps',currentCompId,'sidebets');
  unsubSideBets = onSnapshot(q, snap=>{
    const bets = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)));
    renderSideBets(bets);
  });
}

function showBetNotification(betId, fromName, text, stake) {
  localStorage.setItem('bet_seen_' + betId, '1');
  addNotification('bet_' + betId, '🤑', '<strong>' + escHtml(fromName) + '</strong> challenged you to a side bet: ' + escHtml(text||'') + (stake ? ' <em>(' + escHtml(stake) + ')</em>' : ''), () => showPage('leaderboard'));
}

function showBetResponseNotification(betId, responderName, text, stake, accepted) {
  addNotification('betresp_' + betId, accepted ? '🤝' : '😤', '<strong>' + escHtml(responderName) + '</strong> ' + (accepted ? 'accepted' : 'declined') + ' your side bet' + (text ? ': ' + escHtml(text) : '') + (stake && accepted ? ' — stake: <em>' + escHtml(stake) + '</em>' : ''), () => showPage('leaderboard'));
}

function renderSideBets(bets) {
  populateBetTargets();
  const container = el('sidebets-list'); if(!container) return;
  if (currentUser) {
    const unseenBet = bets.find(b => b.toUid === currentUser.uid && b.status === 'open' && !b.responseNotify && !localStorage.getItem('bet_seen_' + b.id));
    if (unseenBet) { const fromName = allUsers[unseenBet.fromUid]?.nick || allUsers[unseenBet.fromUid]?.name || 'Someone'; showBetNotification(unseenBet.id, fromName, unseenBet.text, unseenBet.stake); }
    const respondedBet = bets.find(b => b.fromUid === currentUser.uid && b.responseNotify && !localStorage.getItem('bet_resp_seen_' + b.id));
    if (respondedBet) {
      localStorage.setItem('bet_resp_seen_' + respondedBet.id, '1');
      const responder = respondedBet.responderName || allUsers[respondedBet.toUid]?.nick || allUsers[respondedBet.toUid]?.name || 'They';
      showBetResponseNotification(respondedBet.id, responder, respondedBet.text, respondedBet.stake, respondedBet.responseNotify === 'accepted');
    }
  }
  if(!bets.length){ container.innerHTML='<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px;">No side bets yet — someone start one! 👀</div>'; return; }
  container.innerHTML = bets.map(b=>{
    const isFrom = b.fromUid === currentUser.uid, isTo = b.toUid === currentUser.uid;
    const isAdmin = allComps[currentCompId]?.ownerId === currentUser.uid;
    const statusBadge = b.status==='accepted' ? `<span class="result-badge badge-win">🤝 Accepted</span>` : `<span class="result-badge badge-pending">⏳ Awaiting Response</span>`;
    const acceptBtn = b.status==='open' && isTo ? `<button class="btn" style="font-size:12px;padding:6px 14px;" onclick="acceptBet('${b.id}')">🤝 Accept</button><button class="btn btn-outline" style="font-size:12px;padding:6px 12px;" onclick="declineBet('${b.id}')">✕ Decline</button>` : '';
    const deleteBtn = (isFrom || isAdmin) ? `<button class="btn btn-red" style="font-size:12px;padding:6px 10px;" onclick="deleteBet('${b.id}')">✕</button>` : '';
    return `<div style="padding:14px;margin-bottom:10px;background:var(--card2);border-radius:12px;border-left:3px solid ${b.status==='accepted'?'var(--green)':'var(--gold)'};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
        <div style="flex:1;">
          <div style="font-size:13px;margin-bottom:6px;"><strong style="color:var(--green);">${escHtml(b.fromName)}</strong><span style="color:var(--muted);"> challenges </span><strong style="color:var(--gold);">${escHtml(b.toName)}</strong></div>
          <div style="font-size:14px;margin-bottom:6px;">${escHtml(b.text)}</div>
          <div style="font-size:12px;color:var(--gold);font-weight:600;">💰 Stake: ${escHtml(b.stake)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">${statusBadge}<div style="display:flex;gap:6px;">${acceptBtn}${deleteBtn}</div></div>
      </div>
    </div>`;
  }).join('');
}

async function deleteMessage(msgId){
  if(!userProfile?.isAdmin) return;
  if(!confirm('Delete this message?')) return;
  if(currentCompId) await deleteDoc(doc(db,'chats',currentCompId,'messages',msgId));
  else await deleteDoc(doc(db,'chat',msgId));
}
function chatKeydown(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}
function insertEmoji(emoji){const i=el('chat-input');i.value+=emoji;i.focus();}

// ─── PWA INSTALL ──────────────────────────────────────────────
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; showInstallBanner(); });
window.addEventListener('appinstalled', () => { hideInstallBanner(); deferredInstallPrompt = null; });
function showInstallBanner() { const b = el('install-banner'); if (!b) return; if (window.matchMedia('(display-mode: standalone)').matches) return; b.style.display = 'block'; }
function hideInstallBanner() { const b = el('install-banner'); if (b) b.style.display = 'none'; }
function dismissInstall() { hideInstallBanner(); }
async function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') { hideInstallBanner(); track('pwa_install'); }
  deferredInstallPrompt = null;
}
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream; }
function initInstallBanner() {
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  const banner = el('install-banner'); if (!banner) return;
  if (isIOS()) { el('install-android').style.display = 'none'; el('install-ios').style.display = 'flex'; banner.style.display = 'block'; }
}

// ─── SERVICE WORKER ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered:', reg.scope)).catch(err => console.log('SW error:', err)); });
}

function downloadCalendarReminder() {
  const now = new Date();
  const daysUntilThursday = (4 - now.getDay() + 7) % 7 || 7;
  const next = new Date(now); next.setDate(now.getDate() + daysUntilThursday);
  function pad(n){return String(n).padStart(2,'0');}
  function icsStamp(d){return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+'00Z';}
  const y = next.getFullYear(), mo = pad(next.getMonth()+1), d = pad(next.getDate());
  const stamp = icsStamp(new Date());
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Roughie Tips//AFL Tipping//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:roughietips-weekly-reminder@roughietips.com.au','DTSTAMP:'+stamp,'DTSTART:'+y+mo+d+'T083000Z','DTEND:'+y+mo+d+'T090000Z','SUMMARY:🏉 Roughie Tips — Tips Close at 7:30pm AEST!','DESCRIPTION:Get your AFL tips in before 7:30pm Melbourne time tonight. Visit roughietips.com.au','URL:https://roughietips.com.au','RRULE:FREQ=WEEKLY;BYDAY=TH','BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:🏉 Roughie Tips close in 30 minutes — get your tips in!','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'roughie-tips-reminder.ics'; a.click();
  URL.revokeObjectURL(url);
  track('calendar_reminder_downloaded');
  toast('Calendar reminder downloaded! Open the file to add it 📅');
}

function showNewUrlBanner() {
  const key = 'new_url_banner_seen_v1';
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  const banner = document.createElement('div'); banner.id = 'new-url-banner';
  banner.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9000;width:calc(100% - 32px);max-width:480px;background:linear-gradient(135deg,rgba(0,200,83,0.15),rgba(0,200,83,0.08));border:2px solid rgba(0,200,83,0.5);border-radius:16px;padding:16px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:slideInPage .3s ease;`;
  banner.innerHTML = `<div style="display:flex;align-items:flex-start;gap:12px;"><div style="font-size:26px;flex-shrink:0;">🏠</div><div style="flex:1;"><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--green);letter-spacing:1px;margin-bottom:4px;">WE'VE MOVED!</div><div style="font-size:13px;color:var(--text);margin-bottom:6px;">Roughie Tips has a new home at <strong style="color:var(--green);">roughietips.com.au</strong></div><div style="font-size:12px;color:var(--muted);">Please update your bookmark or home screen shortcut to the new address.</div></div><button onclick="document.getElementById('new-url-banner').remove()" style="background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;flex-shrink:0;padding:0;line-height:1;">×</button></div>`;
  document.body.appendChild(banner);
  setTimeout(() => { if (el('new-url-banner')) el('new-url-banner').remove(); }, 15000);
}

// ─── LOGIN SIREN ──────────────────────────────────────────────
function playLoginSiren() {
  try {
    const siren = new Audio('aflsiren.mp3'); siren.volume = 0.9; siren.play().catch(() => {});
    setTimeout(() => { const crowd = new Audio('crowdcheer.mp3'); crowd.volume = 0.7; crowd.play().catch(() => {}); }, 500);
  } catch(e) {}
}

// ─── AUTH USER COUNT ─────────────────────────────────────────
async function startAuthUserCount() {
  const countEl = el('auth-count-num'); if (!countEl) return;
  for (let i = 0; i < 5; i++) {
    try {
      const snap = await getDoc(doc(db,'public','stats'));
      if (snap.exists()) { const count = snap.data().userCount; if (count !== undefined && count !== null) { countEl.textContent = count; return; } }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
}
setTimeout(startAuthUserCount, 800);

// ─── ADMIN EDIT TIPS ─────────────────────────────────────────
function renderAdminEditTips() {
  if (currentUser?.uid !== SITE_ADMIN_UID) return;
  const tabBtn = el('edit-tips-tab-btn'); if (tabBtn) tabBtn.style.display = 'inline-flex';
  const userSel = el('et-user'); if (!userSel) return;
  const sortedUsers = Object.entries(allUsers).map(([uid, u]) => ({ uid, name: u.name, nick: u.nick })).sort((a, b) => (a.nick||a.name).localeCompare(b.nick||b.name));
  userSel.innerHTML = '<option value="">— Select user —</option>' + sortedUsers.map(u => `<option value="${u.uid}">${escHtml(u.nick||u.name)}${u.nick?' ('+escHtml(u.name)+')':''}</option>`).join('');
  const roundSel = el('et-round'); if (!roundSel) return;
  const activeRounds = rounds.filter(r => (r.matches||[]).length > 0);
  roundSel.innerHTML = '<option value="">— Select round —</option>' + activeRounds.map(r => `<option value="${r.id}">${escHtml(r.name)}</option>`).join('');
  el('et-matches').innerHTML = '';
}

function renderEditTipsMatches() {
  if (currentUser?.uid !== SITE_ADMIN_UID) return;
  const uid = el('et-user')?.value, roundId = el('et-round')?.value, container = el('et-matches');
  if (!uid || !roundId || !container) { container && (container.innerHTML = ''); return; }
  const round = rounds.find(r => r.id === roundId); if (!round) return;
  const userTips = allTips[uid] || {}, userName = allUsers[uid]?.nick || allUsers[uid]?.name || uid;
  container.innerHTML = `<div style="font-weight:600;margin-bottom:12px;color:var(--green);">Tips for ${escHtml(userName)} — ${escHtml(round.name)}</div>
    ${(round.matches||[]).map((m, idx) => {
      const savedPick = userTips[m.id] || '', isAuto = !savedPick;
      return `<div style="padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">${escHtml(m.home)} vs ${escHtml(m.away)}<span style="font-size:11px;color:var(--muted);font-weight:400;margin-left:8px;">${formatMatchDate(m.date)} ${m.time?'@ '+to12hr(m.time):''}</span>${isAuto?'<span class="result-badge badge-loss" style="margin-left:8px;font-size:11px;">No tip — auto away</span>':''}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="adminSetTip('${uid}','${m.id}','${m.home.replace(/'/g,"\'")}','${roundId}')" style="padding:8px 14px;border-radius:8px;border:2px solid ${savedPick===m.home?'var(--green)':'var(--border)'};background:${savedPick===m.home?'rgba(0,200,83,0.15)':'var(--card2)'};color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;">${savedPick===m.home?'✓ ':''} ${escHtml(m.home)}</button>
          <button onclick="adminSetTip('${uid}','${m.id}','${m.away.replace(/'/g,"\'")}','${roundId}')" style="padding:8px 14px;border-radius:8px;border:2px solid ${savedPick===m.away?'var(--green)':'var(--border)'};background:${savedPick===m.away?'rgba(0,200,83,0.15)':'var(--card2)'};color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;">${savedPick===m.away?'✓ ':''} ${escHtml(m.away)}</button>
          ${savedPick?`<button onclick="adminClearTip('${uid}','${m.id}','${roundId}')" style="padding:8px 14px;border-radius:8px;border:2px solid var(--border);background:var(--card2);color:var(--muted);font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;">Clear</button>`:''}
        </div>
      </div>`;
    }).join('')}`;
}

async function adminSetTip(uid, matchId, team, roundId) {
  if (currentUser?.uid !== SITE_ADMIN_UID) return;
  try { await setDoc(doc(db, 'tips', uid), { [matchId]: team }, { merge: true }); toast(`Tip set: ${team} ✓`); renderEditTipsMatches(); }
  catch(e) { toast('Error saving tip', true); }
}

async function adminClearTip(uid, matchId, roundId) {
  if (currentUser?.uid !== SITE_ADMIN_UID) return;
  try { await updateDoc(doc(db, 'tips', uid), { [matchId]: deleteField() }); toast('Tip cleared'); renderEditTipsMatches(); }
  catch(e) { toast('Error clearing tip', true); }
}


async function deleteHonoursEntry(id) {
  if (!confirm('Delete this honours entry?')) return;
  try { await deleteDoc(doc(db,'honours',id)); toast('Entry removed'); renderHonoursPage(); }
  catch(e) { toast('Error deleting entry', true); }
}
