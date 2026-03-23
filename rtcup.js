// ─── RT CUP ───────────────────────────────────────────────────
const RT_MAX = 32;
const RT_START_ROUND = 4;

// These are set by the main app and passed in
let _db, _auth, _SITE_ADMIN_UID, _serverTimestamp, _doc, _setDoc, _updateDoc, _deleteDoc,
    _collection, _onSnapshot, _getDocs, _addDoc, _deleteField;

// State (shared with main app via window)
let rtCupConfig = null;
let rtCupPlayers = {};
let rtCupBracket = [];
let unsubRTCup = [];

function rtCupInit(deps) {
  _db = deps.db;
  _auth = deps.auth;
  _SITE_ADMIN_UID = deps.SITE_ADMIN_UID;
  _serverTimestamp = deps.serverTimestamp;
  _doc = deps.doc;
  _setDoc = deps.setDoc;
  _updateDoc = deps.updateDoc;
  _deleteDoc = deps.deleteDoc;
  _collection = deps.collection;
  _onSnapshot = deps.onSnapshot;
  _getDocs = deps.getDocs;
  _addDoc = deps.addDoc;
  _deleteField = deps.deleteField;
}

function subscribeRTCup(rounds, allUsers, calcScoresForUsers, renderRTCupPageCallback, updateRTCupBannerCallback) {
  unsubRTCup.forEach(fn=>fn()); unsubRTCup=[];

  const u1 = _onSnapshot(_doc(_db,'rtcup','config'), snap=>{
    rtCupConfig = snap.exists() ? snap.data() : null;
    window.rtCupConfig = rtCupConfig;
    if(document.getElementById('page-rtcup')?.classList.contains('active')) renderRTCupPage();
    updateRTCupBanner();
  });
  unsubRTCup.push(u1);

  const u2 = _onSnapshot(_collection(_db,'rtcup','config','players'), snap=>{
    rtCupPlayers={};
    snap.docs.forEach(d=>{ rtCupPlayers[d.id]=d.data(); });
    window.rtCupPlayers = rtCupPlayers;
    if(document.getElementById('page-rtcup')?.classList.contains('active')) renderRTCupPage();
    updateRTCupBanner();
  });
  unsubRTCup.push(u2);

  const u3 = _onSnapshot(_collection(_db,'rtcup','config','bracket'), snap=>{
    rtCupBracket = snap.docs.map(d=>({id:d.id,...d.data()}));
    window.rtCupBracket = rtCupBracket;
    if(document.getElementById('page-rtcup')?.classList.contains('active')) renderRTCupPage();
    if(rtCupConfig?.status==='active') autoAdvanceRTCup();
  });
  unsubRTCup.push(u3);
}

function updateRTCupBanner() {
  const banner = document.getElementById('rtcup-banner');
  if (!banner) return;
  const currentUser = window._currentUser;
  if (!currentUser) { banner.style.display='none'; return; }
  if (rtCupPlayers[currentUser.uid]) { banner.style.display='none'; return; }
  if (rtCupConfig?.status === 'active') { banner.style.display='none'; return; }
  const dismissKey = `rtcup_banner_dismissed_${currentUser.uid}`;
  if (localStorage.getItem(dismissKey) === 'permanent') { banner.style.display='none'; return; }
  banner.style.display = 'flex';
}

function dismissRTCupBanner(permanent) {
  const banner = document.getElementById('rtcup-banner');
  if (banner) banner.style.display='none';
  if (permanent) {
    const currentUser = window._currentUser;
    const dismissKey = `rtcup_banner_dismissed_${currentUser?.uid||'anon'}`;
    localStorage.setItem(dismissKey, 'permanent');
  }
}

async function rtCupOptIn() {
  const currentUser = window._currentUser;
  const userProfile = window._userProfile;
  if (!currentUser) return;
  const count = Object.keys(rtCupPlayers).length;
  if (count >= RT_MAX) { window.toast('RT Cup is full — sorry!', true); return; }
  if (rtCupPlayers[currentUser.uid]) { window.toast('Already opted in!'); return; }
  if (rtCupConfig?.status === 'active') { window.toast('RT Cup bracket already drawn — opt-in closed', true); return; }
  await _setDoc(_doc(_db,'rtcup','config','players',currentUser.uid), {
    uid: currentUser.uid,
    name: userProfile.name,
    nick: userProfile.nick||'',
    joinedAt: _serverTimestamp()
  });
  dismissRTCupBanner(true);
  window.toast('You\'re in! 🏆 Good luck in the RT Cup!');
}

async function rtCupOptOut() {
  const currentUser = window._currentUser;
  if (!currentUser) return;
  if (rtCupConfig?.status === 'active') { window.toast('Bracket already drawn — can\'t opt out now', true); return; }
  if (!confirm('Are you sure you want to opt out of the RT Cup?')) return;
  await _deleteDoc(_doc(_db,'rtcup','config','players',currentUser.uid));
  window.toast('Opted out of RT Cup');
}

async function generateRTCupBracket() {
  const currentUser = window._currentUser;
  if (currentUser?.uid !== _SITE_ADMIN_UID) return;
  const playerIds = Object.keys(rtCupPlayers);
  if (playerIds.length < 2) { window.toast('Not enough players to generate bracket', true); return; }
  if (!confirm(`Generate RT Cup bracket for ${playerIds.length} players? This cannot be undone.`)) return;

  const allUsers = window._allUsers || {};
  const rounds = window._rounds || [];
  const globalScores = window.calcScoresForUsers(Object.keys(allUsers));
  const seededPlayers = playerIds.map(uid => {
    const s = globalScores.find(g=>g.uid===uid);
    return { uid, rank: s ? globalScores.indexOf(s)+1 : 999 };
  }).sort((a,b)=>a.rank-b.rank);

  const bracketSize = Math.min(RT_MAX, playerIds.length <= 16 ? 16 : 32);
  const byeCount = bracketSize - seededPlayers.length;
  const shuffled = [...seededPlayers].sort(()=>Math.random()-0.5);
  for (let i=0; i<byeCount; i++) shuffled.push({uid:'BYE_'+i, rank:999});

  const matchups = [];
  for (let i=0; i<shuffled.length; i+=2) {
    const p1 = shuffled[i];
    const p2 = shuffled[i+1];
    matchups.push({
      stage: 1, matchupIndex: i/2,
      player1: p1.uid, player1Seed: p1.rank,
      player2: p2.uid, player2Seed: p2.rank,
      p1Wins: 0, p2Wins: 0,
      roundsPlayed: [], winner: null, status: 'active'
    });
  }

  await _setDoc(_doc(_db,'rtcup','config'), {
    status: 'active', startRound: RT_START_ROUND, bracketSize,
    totalStages: Math.log2(bracketSize), currentStage: 1,
    generatedAt: _serverTimestamp(), seededAt: _serverTimestamp()
  });

  const writes = matchups.map((m,i)=>
    _setDoc(_doc(_db,'rtcup','config','bracket','m_'+i), m)
  );
  await Promise.all(writes);
  window.toast('🏆 RT Cup bracket generated!');
}

function getRTCupRoundScore(uid, roundId) {
  const rounds = window._rounds || [];
  const allTips = window._allTips || {};
  const allMargins = window._allMargins || {};
  if (uid.startsWith('BYE_')) return { pts: 0, marginDiff: 999 };
  const round = rounds.find(r=>r.id===roundId);
  if (!round) return { pts: 0, marginDiff: 999 };
  const myTips = allTips[uid]||{};
  const myMarg = allMargins[uid]||{};
  let pts_total = 0;
  (round.matches||[]).forEach(m=>{
    if (!m.winner) return;
    const pick = myTips[m.id] || m.away;
    if (m.winner==='Draw') { pts_total+=1; return; }
    if (pick===m.winner) {
      const winOdds = m.winner===m.home ? m.homeOdds : m.awayOdds;
      pts_total += window.pts(winOdds);
    }
  });
  const firstMatch = (round.matches||[])[0];
  let marginDiff = 999;
  if (firstMatch?.actualMargin && firstMatch.winner) {
    const guess = myMarg[firstMatch.id] ? parseInt(myMarg[firstMatch.id]) : 1;
    const pick = myTips[firstMatch.id] || firstMatch.away;
    const tippedWinner = pick === firstMatch.winner;
    marginDiff = tippedWinner
      ? Math.abs(firstMatch.actualMargin - guess)
      : firstMatch.actualMargin + 1 + guess;
  }
  return { pts: pts_total, marginDiff };
}

async function autoAdvanceRTCup() {
  const currentUser = window._currentUser;
  if (currentUser?.uid !== _SITE_ADMIN_UID) return;
  if (!rtCupConfig || rtCupConfig.status !== 'active') return;

  const rounds = window._rounds || [];
  const currentStage = rtCupConfig.currentStage;
  const stageMatchups = rtCupBracket.filter(m=>m.stage===currentStage && m.status==='active');
  if (stageMatchups.length === 0) return;

  const updates = [];
  for (const matchup of stageMatchups) {
    if (matchup.player1.startsWith('BYE_') || matchup.player2.startsWith('BYE_')) {
      const winner = matchup.player1.startsWith('BYE_') ? matchup.player2 : matchup.player1;
      updates.push({ id: matchup.id, winner, status: 'complete', p1Wins: matchup.p1Wins, p2Wins: matchup.p2Wins });
      continue;
    }

    const stageStartOrder = RT_START_ROUND + (currentStage-1) * 3;
    const eligibleRounds = rounds.filter(r =>
      (r.order||0) >= stageStartOrder &&
      (r.order||0) < stageStartOrder + 3 &&
      (r.matches||[]).length > 0 &&
      (r.matches||[]).every(m=>m.winner)
    ).sort((a,b)=>(a.order||0)-(b.order||0));

    let p1w = 0, p2w = 0;
    const played = [];

    for (const round of eligibleRounds) {
      if ((matchup.roundsPlayed||[]).includes(round.id)) continue;
      const s1 = getRTCupRoundScore(matchup.player1, round.id);
      const s2 = getRTCupRoundScore(matchup.player2, round.id);
      let roundWinner = null;
      if (s1.pts > s2.pts) roundWinner = 'p1';
      else if (s2.pts > s1.pts) roundWinner = 'p2';
      else if (s1.marginDiff < s2.marginDiff) roundWinner = 'p1';
      else if (s2.marginDiff < s1.marginDiff) roundWinner = 'p2';
      else roundWinner = matchup.player1Seed <= matchup.player2Seed ? 'p1' : 'p2';
      if (roundWinner==='p1') p1w++; else p2w++;
      played.push(round.id);
    }

    const totalP1 = (matchup.p1Wins||0) + p1w;
    const totalP2 = (matchup.p2Wins||0) + p2w;

    if (played.length > 0 || totalP1 !== matchup.p1Wins || totalP2 !== matchup.p2Wins) {
      const winner = totalP1>=2 ? matchup.player1 : totalP2>=2 ? matchup.player2 : null;
      updates.push({
        id: matchup.id, p1Wins: totalP1, p2Wins: totalP2,
        roundsPlayed: [...(matchup.roundsPlayed||[]), ...played],
        winner, status: winner ? 'complete' : 'active'
      });
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates.map(u => {
      const { id, ...data } = u;
      return _updateDoc(_doc(_db,'rtcup','config','bracket',id), data);
    }));
  }

  const allComplete = rtCupBracket
    .filter(m=>m.stage===currentStage)
    .every(m=>m.status==='complete' || updates.find(u=>u.id===m.id)?.status==='complete');

  if (allComplete) {
    const nextStage = currentStage + 1;
    const totalStages = rtCupConfig.totalStages;
    if (nextStage > totalStages) {
      await _updateDoc(_doc(_db,'rtcup','config'), { status: 'complete' });
      return;
    }
    const winners = rtCupBracket
      .filter(m=>m.stage===currentStage)
      .map(m=> updates.find(u=>u.id===m.id)?.winner || m.winner)
      .filter(Boolean);

    const shuffledWinners = [...winners].sort(()=>Math.random()-0.5);
    const nextMatchups = [];
    for (let i=0; i<shuffledWinners.length; i+=2) {
      const p1uid = shuffledWinners[i];
      const p2uid = shuffledWinners[i+1];
      const p1seed = rtCupBracket.find(m=>m.player1===p1uid||m.player2===p1uid)?.player1===p1uid
        ? rtCupBracket.find(m=>m.player1===p1uid)?.player1Seed
        : rtCupBracket.find(m=>m.player2===p1uid)?.player2Seed;
      const p2seed = rtCupBracket.find(m=>m.player1===p2uid||m.player2===p2uid)?.player1===p2uid
        ? rtCupBracket.find(m=>m.player1===p2uid)?.player1Seed
        : rtCupBracket.find(m=>m.player2===p2uid)?.player2Seed;
      nextMatchups.push({
        stage: nextStage, matchupIndex: i/2,
        player1: p1uid, player1Seed: p1seed||999,
        player2: p2uid||'BYE_next', player2Seed: p2seed||999,
        p1Wins: 0, p2Wins: 0, roundsPlayed: [], winner: null, status: 'active'
      });
    }
    const nextWrites = nextMatchups.map((m,i)=>
      _setDoc(_doc(_db,'rtcup','config','bracket',`m_s${nextStage}_${i}`), m)
    );
    await Promise.all([
      ...nextWrites,
      _updateDoc(_doc(_db,'rtcup','config'), { currentStage: nextStage })
    ]);
    window.toast(`🏆 Stage ${nextStage} bracket generated!`);
  }
}

function renderRTCupPage() {
  const container = document.getElementById('rtcup-content');
  if (!container) return;
  const currentUser = window._currentUser;
  const allUsers = window._allUsers || {};
  const isOptedIn = !!(currentUser && rtCupPlayers[currentUser.uid]);
  const playerCount = Object.keys(rtCupPlayers).length;
  const isFull = playerCount >= RT_MAX;
  const status = rtCupConfig?.status || 'signup';
  const isAdmin = currentUser?.uid === _SITE_ADMIN_UID;

  if (status === 'signup' || !rtCupConfig) {
    const optedInUids = Object.keys(rtCupPlayers);
    const globalScores = window.calcScoresForUsers(Object.keys(allUsers));
    const seededList = optedInUids.map(uid=>{
      const s = globalScores.find(g=>g.uid===uid);
      const rank = s ? globalScores.indexOf(s)+1 : 999;
      return { uid, rank, name: allUsers[uid]?.nick||allUsers[uid]?.name||uid, pts: s?.totalPts||0 };
    }).sort((a,b)=>a.rank-b.rank);

    container.innerHTML = `
      <div class="card" style="margin-bottom:14px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--gold);letter-spacing:2px;margin-bottom:2px;">🏆 RT CUP</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:16px;">Knockout Competition — 32 Tippers. 5 Stages. One Champion.</div>
        <div style="display:flex;flex-direction:column;gap:14px;font-size:13px;">
          <div><div style="font-weight:700;color:var(--green);margin-bottom:4px;">⚡ No extra effort required</div>
          <div style="color:var(--muted);">The RT Cup runs entirely off your normal weekly tips. Just tip as you always do and let the competition take care of itself.</div></div>
          <div><div style="font-weight:700;color:var(--green);margin-bottom:4px;">🥊 Head-to-head matchups</div>
          <div style="color:var(--muted);">Each stage you're drawn against one other tipper. You play each other over 3 rounds. First to win 2 rounds advances. Lose 2 and you're eliminated.</div></div>
          <div><div style="font-weight:700;color:var(--green);margin-bottom:4px;">📊 How a round is decided</div>
          <div style="color:var(--muted);">1. Highest round score wins<br>2. If tied → closest margin guess wins<br>3. If still tied → higher seed gets the nod</div></div>
          <div><div style="font-weight:700;color:var(--green);margin-bottom:4px;">🌱 Seeding</div>
          <div style="color:var(--muted);">Official seedings locked from the <strong style="color:var(--text);">Overall leaderboard at end of Round 3</strong>.</div></div>
          <div style="background:rgba(255,214,0,0.08);border:1px solid rgba(255,214,0,0.3);border-radius:8px;padding:10px 14px;">
            <span style="color:var(--gold);font-weight:700;">🏁 Kicks off Round ${RT_START_ROUND}</span>
            <span style="color:var(--muted);font-size:12px;margin-left:8px;">Limited spots — first in, best dressed</span>
          </div>
        </div>
      </div>
      <div class="card" style="margin-bottom:14px;text-align:center;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:${isFull?'var(--muted)':isOptedIn?'var(--green)':'var(--gold)'};letter-spacing:2px;margin-bottom:8px;">
          🏆 ${playerCount} / ${RT_MAX} Registered
        </div>
        <div style="height:10px;background:var(--card2);border-radius:99px;overflow:hidden;max-width:300px;margin:0 auto 12px;">
          <div style="height:100%;width:${Math.min(100,(playerCount/RT_MAX)*100)}%;background:${isFull?'var(--gold)':'var(--green)'};border-radius:99px;transition:.5s;"></div>
        </div>
        ${isFull
          ? '<div style="color:var(--muted);font-size:14px;">Competition is full — bracket will be drawn at Round '+RT_START_ROUND+'</div>'
          : isOptedIn
            ? `<div style="color:var(--green);font-weight:700;font-size:16px;margin-bottom:10px;">✅ You're in! Good luck! 🏆</div>
               <button class="btn btn-outline" style="font-size:13px;padding:8px 16px;" onclick="rtCupOptOut()">Opt Out</button>`
            : `<button class="btn" style="font-size:17px;padding:14px 32px;letter-spacing:1px;" onclick="rtCupOptIn()">🏆 Opt In to RT Cup</button>
               <div style="font-size:12px;color:var(--muted);margin-top:8px;">Free to enter — works off your existing tips</div>`
        }
        ${isAdmin && status==='signup' ? `
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
            <button class="btn btn-outline" style="font-size:13px;" onclick="generateRTCupBracket()">⚙️ Generate Bracket (Admin)</button>
          </div>` : ''}
      </div>
      <div class="card">
        <div style="font-weight:700;margin-bottom:4px;">Current Standings <span style="font-size:12px;color:var(--muted);font-weight:400;">(becomes official seedings after Round 3)</span></div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:14px;">Only opted-in tippers shown</div>
        ${seededList.length === 0
          ? '<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px;">No tippers opted in yet — be the first!</div>'
          : `<div style="display:flex;flex-direction:column;gap:6px;">
              ${seededList.map(p=>`
                <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:${p.uid===currentUser?.uid?'rgba(0,200,83,0.08)':'var(--card2)'};">
                  <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--muted);min-width:28px;">${p.rank}</span>
                  <span style="font-weight:600;flex:1;">${p.name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span>
                  <span style="color:var(--gold);font-size:13px;">${p.pts}pts</span>
                </div>`).join('')}
            </div>`
        }
      </div>`;
  } else {
    const totalStages = rtCupConfig.totalStages || 5;
    const currentStage = rtCupConfig.currentStage || 1;
    const stageNames = ['','Round of 32','Round of 16','Quarter-Finals','Semi-Finals','Grand Final'];
    container.innerHTML = `
      <div class="card" style="margin-bottom:14px;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--gold);letter-spacing:2px;">🏆 RT CUP ${rtCupConfig.status==='complete'?'— COMPLETE':'— LIVE'}</div>
        ${rtCupConfig.status==='complete'
          ? (() => {
              const finalMatchup = rtCupBracket.find(m=>m.stage===totalStages && m.status==='complete');
              const champ = finalMatchup?.winner ? allUsers[finalMatchup.winner] : null;
              return `<div style="text-align:center;padding:20px 0;">
                <div style="font-size:40px;margin-bottom:8px;">🏆</div>
                <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--gold);">${champ?.nick||champ?.name||'Champion'}</div>
                <div style="color:var(--muted);font-size:13px;">RT Cup Champion</div>
              </div>`;
            })()
          : `<div style="font-size:13px;color:var(--muted);">Stage ${currentStage} of ${totalStages} — ${stageNames[currentStage]||'Stage '+currentStage}</div>`
        }
      </div>
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
        ${Array.from({length:totalStages},(_,i)=>i+1).map(s=>`
          <button onclick="renderRTCupStage(${s},this)" id="rtcup-stage-btn-${s}"
            class="btn ${s===currentStage?'':'btn-outline'}" style="font-size:12px;padding:7px 12px;">
            ${stageNames[s]||'Stage '+s}
          </button>`).join('')}
      </div>
      <div id="rtcup-stage-content"></div>
      ${isAdmin ? `<div class="card" style="margin-top:14px;background:rgba(255,214,0,0.05);border:1px solid rgba(255,214,0,0.2);">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;">⚙️ Admin Controls</div>
        <button class="btn btn-outline" style="font-size:13px;" onclick="autoAdvanceRTCup()">🔄 Check & Advance Bracket</button>
      </div>` : ''}`;
    setTimeout(()=>renderRTCupStage(currentStage, document.getElementById('rtcup-stage-btn-'+currentStage)), 50);
  }
}

function renderRTCupStage(stage, btn) {
  document.querySelectorAll('[id^="rtcup-stage-btn-"]').forEach(b=>{
    b.classList.remove('btn'); b.classList.add('btn-outline');
  });
  if (btn) { btn.classList.add('btn'); btn.classList.remove('btn-outline'); }
  const container = document.getElementById('rtcup-stage-content');
  if (!container) return;
  const allUsers = window._allUsers || {};
  const rounds = window._rounds || [];
  const matchups = rtCupBracket.filter(m=>m.stage===stage).sort((a,b)=>a.matchupIndex-b.matchupIndex);
  if (matchups.length===0) {
    container.innerHTML='<div class="card" style="color:var(--muted);text-align:center;padding:20px;">No matchups yet for this stage.</div>';
    return;
  }
  container.innerHTML = matchups.map(m=>{
    const p1 = allUsers[m.player1]||{name:m.player1.startsWith('BYE')?'BYE':'Unknown'};
    const p2 = allUsers[m.player2]||{name:m.player2?.startsWith('BYE')?'BYE':'Unknown'};
    const p1name = p1.nick||p1.name;
    const p2name = p2.nick||p2.name;
    const isComplete = m.status==='complete';
    const p1isWinner = isComplete && m.winner===m.player1;
    const p2isWinner = isComplete && m.winner===m.player2;
    const p1Elim = isComplete && !p1isWinner;
    const p2Elim = isComplete && !p2isWinner;
    const stageStartOrder = (rtCupConfig?.startRound||RT_START_ROUND) + (stage-1)*3;
    const stageRounds = rounds.filter(r=>(r.order||0)>=stageStartOrder && (r.order||0)<stageStartOrder+3)
      .sort((a,b)=>(a.order||0)-(b.order||0));
    const roundRows = stageRounds.map(r=>{
      const allDone = (r.matches||[]).every(m=>m.winner);
      if (!allDone) return `<div style="font-size:11px;color:var(--muted);padding:3px 0;">${r.name}: <em>In progress…</em></div>`;
      const s1 = getRTCupRoundScore(m.player1, r.id);
      const s2 = getRTCupRoundScore(m.player2, r.id);
      let rw1='', rw2='';
      if (s1.pts>s2.pts||(s1.pts===s2.pts&&s1.marginDiff<s2.marginDiff)||(s1.pts===s2.pts&&s1.marginDiff===s2.marginDiff&&m.player1Seed<=m.player2Seed)) rw1='✓';
      else rw2='✓';
      return `<div style="font-size:11px;color:var(--muted);padding:3px 0;display:flex;gap:6px;">
        <span style="flex:1;color:${rw1?'var(--green)':'inherit'};">${rw1?'✓ ':''} ${s1.pts}pts</span>
        <span style="color:var(--muted);font-size:10px;">${r.name}</span>
        <span style="flex:1;text-align:right;color:${rw2?'var(--green)':'inherit'};">${s2.pts}pts ${rw2?'✓':''}</span>
      </div>`;
    }).join('');
    return `<div class="card" style="margin-bottom:10px;">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <div style="flex:1;min-width:100px;position:relative;${p1Elim?'opacity:0.45;':''}">
          ${p1Elim?'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-15deg);font-size:28px;opacity:0.8;">❌</div>':''}
          <div style="font-weight:700;font-size:14px;color:${p1isWinner?'var(--green)':p1Elim?'var(--muted)':'var(--text)'};">${p1isWinner?'🏆 ':''}${p1name}</div>
          <div style="font-size:11px;color:var(--muted);">Seed #${m.player1Seed}</div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--gold);letter-spacing:4px;">${m.p1Wins} — ${m.p2Wins}</div>
          <div style="font-size:10px;color:var(--muted);">${isComplete?'FINAL':'BEST OF 3'}</div>
        </div>
        <div style="flex:1;min-width:100px;text-align:right;position:relative;${p2Elim?'opacity:0.45;':''}">
          ${p2Elim?'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(15deg);font-size:28px;opacity:0.8;">❌</div>':''}
          <div style="font-weight:700;font-size:14px;color:${p2isWinner?'var(--green)':p2Elim?'var(--muted)':'var(--text)'};">${p2isWinner?'🏆 ':''}${p2name}</div>
          <div style="font-size:11px;color:var(--muted);">Seed #${m.player2Seed}</div>
        </div>
      </div>
      ${roundRows?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">${roundRows}</div>`:''}
    </div>`;
  }).join('');
}

// Expose everything to window
Object.assign(window, {
  subscribeRTCup, updateRTCupBanner, dismissRTCupBanner,
  rtCupOptIn, rtCupOptOut, generateRTCupBracket,
  autoAdvanceRTCup, renderRTCupPage, renderRTCupStage,
  getRTCupRoundScore, rtCupInit,
  get rtCupConfig() { return rtCupConfig; },
  get rtCupPlayers() { return rtCupPlayers; },
  get rtCupBracket() { return rtCupBracket; },
  get unsubRTCup() { return unsubRTCup; }
});
