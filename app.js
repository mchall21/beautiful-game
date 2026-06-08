/* ============================================================
   THE BEAUTIFUL GAME · app shell + screens (vanilla JS, no build)
   ============================================================ */
(function () {
  const GC = window.GC;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
  const money = (n) => "$" + Number(n).toLocaleString();

  /* country accent tints for player monograms */
  const FLAG_TINT = {
    FRA:"#1E53FF", ESP:"#C8102E", ARG:"#75AADB", ENG:"#CF142B", BRA:"#1FA85C",
    POR:"#1FA85C", NED:"#FF6A13", BEL:"#E8B600", GER:"#15161B", CRO:"#C8102E",
    MAR:"#C8102E", COL:"#FFD100", URU:"#5B92E5", USA:"#1E53FF", MEX:"#1FA85C",
    CAN:"#CF142B", SUI:"#C8102E", JPN:"#BC002D", SEN:"#1FA85C", ECU:"#FFD100",
    NOR:"#C8102E", AUT:"#C8102E", TUR:"#E30A17", KOR:"#003478", EGY:"#C8102E",
    AUS:"#1FA85C", IRN:"#C8102E", CIV:"#FF6A13", PAR:"#C8102E", SCO:"#003478",
    QAT:"#8A1538", KSA:"#1FA85C", RSA:"#1FA85C", TUN:"#C8102E", ALG:"#1FA85C",
    COD:"#1E53FF", UZB:"#1E53FF", IRQ:"#C8102E", CPV:"#1E53FF", PAN:"#C8102E",
    CUW:"#1E53FF", HAI:"#1E53FF", GHA:"#FFD100", NZL:"#15161B", BIH:"#FFD100",
    CZE:"#C8102E", SWE:"#FFCD00", JOR:"#C8102E",
  };
  const HOT_VIBES = ["Favorite", "Main Character", "Penalty Demon", "Goal Goblin"];
  const vibeClass = (v) => HOT_VIBES.includes(v) ? "hot" : "";

  function flag(code, size) {
    const c = GC.countryByCode(code);
    if (!c) return "";
    return `<img class="flagimg${size ? " " + size : ""}" src="${esc(c.flag)}" alt="${esc(c.name)} flag" loading="lazy" />`;
  }
  function flagRow(code) {
    const c = GC.countryByCode(code);
    if (!c) return esc(code);
    return `<span class="flagrow">${flag(code, "sm")}<span class="flag-code">${esc(code)}</span></span>`;
  }
  function pmedia(p) {
    const initials = String(p.name).split(" ").filter(Boolean).slice(-2).map(w => w[0]).join("").toUpperCase();
    const tint = FLAG_TINT[p.cc] || "#9a9a9a";
    const img = p.photo
      ? `<img class="pphoto" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()" />`
      : "";
    return `<span class="avatar avatar-lg pavatar" aria-hidden="true"><span class="avatar-stripe" style="background:${tint}"></span>${esc(initials)}${img}</span>`;
  }
  function oddsBar(items) {
    const f = items.filter(i => i.v != null && i.v !== "");
    if (!f.length) return "";
    return `<div class="oddsbar">${f.map(i =>
      `<span class="ochip${i.line ? " ochip-line" : ""}"><span class="ok">${esc(i.k)}</span><span class="ov tnum">${esc(i.v)}</span>${i.sub ? `<span class="osub tnum">${esc(i.sub)}</span>` : ""}</span>`).join("")}</div>`;
  }
  function winsValue(c) {
    if (c.winsLine == null) return null;
    return c.winsOver ? `${c.winsLine} (o ${c.winsOver} / u ${c.winsUnder})` : `${c.winsLine}`;
  }
  function gaValue(a) {
    if (a.gaLine == null) return null;
    return a.gaOver ? `${a.gaLine} (o ${a.gaOver} / u ${a.gaUnder})` : `${a.gaLine}`;
  }
  function goalsValue(a) {
    if (a.goalsLine == null) return null;
    return a.goalsOver ? `${a.goalsLine} (o ${a.goalsOver} / u ${a.goalsUnder})` : `${a.goalsLine}`;
  }
  // American odds -> implied probability, shown as a percentage.
  function impliedPct(odds) {
    if (odds == null || odds === "") return null;
    const n = parseInt(String(odds).trim().replace("+", ""), 10);
    if (isNaN(n)) return null;
    const p = (n < 0 ? -n / (-n + 100) : 100 / (n + 100)) * 100;
    if (p > 0 && p < 1) return "<1%";
    return Math.round(p) + "%";
  }
  const CAT_COLOR = { country: "var(--accent)", attacker: "var(--hot)", keeper: "var(--ink)" };
  function cleanRole(role) {
    const r = String(role || "").replace(/golden boot[^;]*;?\s*/i, "").replace(/^[,;\s]+/, "").trim();
    return r ? r.charAt(0).toUpperCase() + r.slice(1) : "Forward";
  }

  /* ============================================================ OVERVIEW */
  function Overview() {
    const P = GC.POOL;
    const tiles = [
      { go: "rules", step: "01 · The game", h: "How to Play", p: "A six-round snake draft fills three country slots, two attacker slots, and one keeper slot. Six prizes pay out, and there is no master leaderboard." },
      { go: "payouts", step: "02 · The money", h: "Payouts", p: `The ${money(P.pot)} pot splits across six prize races, and you can win any number of them.` },
      { go: "scouting", step: "03 · The board", h: "Scouting", p: `${GC.COUNTRIES.length} countries, ${GC.ATTACKERS.length} attackers, and ${GC.GOALKEEPERS.length} keepers, each carrying a read, a case, a risk, and live market odds.` },
      { go: "schedule", step: "04 · The calendar", h: "Schedule", p: "Every group, every group-stage kickoff time, and the knockout road to the final at MetLife." },
    ];
    return `
      <div class="gc-container">
        <section class="hero">
          <div class="hero-eyebrow">${esc(P.sub)} · ${esc(P.hosts)}</div>
          <h1><span class="w-the">the </span><span class="accent">beautiful </span><span class="w-game">game</span><span class="dot">.</span></h1>
          <p class="hero-lead">What if the beautiful game wasn't played with a ball? What if it was actually played
            with a spreadsheet and a group of soccer casuals that only care for a 1 month period of time every 4 years?
            This is that Beautiful Game.</p>
          <div class="hero-cta">
            <button class="btn btn-accent" data-go="scouting">Scout the field →</button>
            <button class="btn btn-ghost" data-go="rules">How it works</button>
          </div>
        </section>

        <div class="statband">
          <div class="statcell"><div class="k">The pot</div><div class="v accent tnum">${money(P.pot)}</div></div>
          <div class="statcell"><div class="k">Buy-in</div><div class="v tnum">${money(P.buyIn)}</div></div>
          <div class="statcell"><div class="k">Squads</div><div class="v tnum">${P.teams}</div></div>
          <div class="statcell"><div class="k">Tournament</div><div class="v" style="font-size:1.15rem;letter-spacing:-0.01em">${esc(P.dates)}</div></div>
        </div>

        <div class="section-gap"></div>
        <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:18px">
          <span class="gc-handnote">start here.</span>
        </div>
        <div class="tilegrid">
          ${tiles.map(t => `
            <button class="tile" data-go="${t.go}">
              <span class="tnum-step">${esc(t.step)}</span>
              <h3>${esc(t.h)}</h3>
              <p>${esc(t.p)}</p>
              <span class="go">Open →</span>
            </button>`).join("")}
        </div>

        <div class="section-gap"></div>
        <div class="note-band">
          <b>Numbers to confirm:</b> the buy-in, pot, and six prize amounts are placeholders carried over from the design.
          Set them in <b>data.js</b> (the <b>POOL</b> and <b>PRIZES</b> blocks) once the commissioner locks them in.
        </div>
      </div>`;
  }

  /* ============================================================ RULES */
  function Rules() {
    const D = GC.DRAFT;
    // one card per roster slot
    const slotType = { country: "Country", attacker: "Attacker", goalkeeper: "Goalkeeper" };
    const slots = [
      { cls: "country", k: "Country 1 of 3", note: "Your anchor nation. A title contender drives the winner and runner-up prizes." },
      { cls: "country", k: "Country 2 of 3", note: "A wins engine. Pick a team that racks up victories home and away." },
      { cls: "country", k: "Country 3 of 3", note: "A dark horse or host that adds combined wins and upset upside." },
      { cls: "attacker", k: "Attacker 1 of 2", note: "A Golden Boot contender for the top-scorer prize." },
      { cls: "attacker", k: "Attacker 2 of 2", note: "A second scorer to complete your goals-plus-assists pair." },
      { cls: "goalkeeper", k: "Keeper 1 of 1", note: "A busy keeper for the total-saves prize." },
    ];
    // snake board + sample draft (from the 4th slot)
    const youIdx = 3;
    const sample = [
      { cat: "country",  name: "Brazil",        why: "Open with a heavyweight. Brazil score in bunches and go deep, which feeds both the title race and combined wins." },
      { cat: "country",  name: "Morocco",       why: "Add an elite defense. Morocco bank wins and set up a keeper stack in the final round." },
      { cat: "attacker", name: "Harry Kane",    why: "Take Golden Boot equity. Kane has penalties and a soft group, so the goals come early." },
      { cat: "country",  name: "United States", why: "Round out three nations with host wins in a friendly group." },
      { cat: "attacker", name: "Cody Gakpo",    why: "Complete the attacker pair with a proven tournament scorer at value." },
      { cat: "keeper",   name: "Yassine Bounou",why: "Stack the keeper with Morocco. Bounou reaches shootouts and racks up saves." },
    ];
    const arrow = (r) => r % 2 === 1 ? "↓" : "↑";
    const pickNum = (r, i) => (r - 1) * 8 + (r % 2 === 1 ? i + 1 : 8 - i);
    let snakeGrid = `<div class="snake-cell snake-head snake-label">Squad</div>` +
      [1,2,3,4,5,6].map(r => `<div class="snake-cell snake-head">R${r}<span class="arrow">${arrow(r)}</span></div>`).join("");
    for (let i = 0; i < 8; i++) {
      snakeGrid += `<div class="snake-cell snake-label${i === youIdx ? " you" : ""}">${i === youIdx ? "You" : "Drafter " + (i + 1)}</div>`;
      for (let r = 1; r <= 6; r++) {
        const cat = i === youIdx ? sample[r - 1].cat : null;
        snakeGrid += `<div class="snake-cell${cat ? " cat-" + cat : ""}"><span class="snake-pick">${pickNum(r, i)}</span></div>`;
      }
    }
    const sampleList = sample.map((s, idx) => `
      <div class="srow">
        <span class="sp">Pick ${pickNum(idx + 1, youIdx)}</span>
        <span class="sn"><span class="cat-dot ${s.cat}"></span>${esc(s.name)}</span>
        <span class="sw">${esc(s.why)}</span>
      </div>`).join("");
    return `
      <div class="gc-container">
        <div class="gc-page-head">
          <p class="gc-eyebrow">The Game</p>
          <h1 class="gc-page-title">How to <span class="accent">play.</span></h1>
          <p class="gc-page-sub">This is a season-long draft pool. You build a roster of countries and players,
            then chase six separate prizes across the whole tournament.</p>
        </div>

        <div class="sub-head"><h2>Your squad</h2><span class="meta">${esc(D.rosterShape)}</span></div>
        <p class="gc-page-sub" style="margin:0 0 18px">${esc(D.summary)}</p>
        <div class="draft-rounds slots-6">
          ${slots.map(s => `
            <div class="dround ${s.cls}">
              <div class="rn">${esc(s.k)}</div>
              <div class="rt">${esc(slotType[s.cls])}</div>
              <div class="rd">${esc(s.note)}</div>
            </div>`).join("")}
        </div>
        <div class="section-gap"></div>
        <div class="note-band">
          <b>Snake order:</b> the draft order reverses every round, so whoever picks last in the first round picks
          first in the second. Positions are open, so you can take any category in any round as long as your final
          squad has all six slots filled.
        </div>

        <div class="section-gap"></div>
        <div class="sub-head"><h2>How the snake works</h2><span class="meta">8 squads · 6 rounds · 48 picks</span></div>
        <p class="gc-page-sub" style="margin:0 0 18px">Each column is a round and each row is a squad. The pick order runs
          down the board in round one, then back up in round two, snaking through all six rounds so every squad gets a fair
          mix of early and late picks. The highlighted row shows where you would pick from the fourth slot.</p>
        <div class="snake"><div class="snake-scroll"><div class="snake-grid">${snakeGrid}</div></div></div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);align-items:center">
          <span style="display:inline-flex;align-items:center;gap:7px"><span class="cat-dot country"></span> Country</span>
          <span style="display:inline-flex;align-items:center;gap:7px"><span class="cat-dot attacker"></span> Attacker</span>
          <span style="display:inline-flex;align-items:center;gap:7px"><span class="cat-dot keeper"></span> Keeper</span>
        </div>

        <div class="section-gap"></div>
        <div class="sub-head"><h2>A sample draft</h2><span class="meta">from the 4th slot · illustrative</span></div>
        <p class="gc-page-sub" style="margin:0 0 16px">Here is one way to build a balanced roster from the fourth pick.
          The goal is to cover several prizes at once and stack a couple of them on purpose.</p>
        <div class="sample">${sampleList}</div>
        <div class="note-band" style="margin-top:16px">This roster chases the title and combined wins through Brazil and
          the United States, the Golden Boot and best pair through Kane and Gakpo, and the saves prize through Bounou.
          Drafting Morocco and Bounou together is a deliberate stack, because a deep Moroccan run lifts both their wins and his saves.</div>

        <div class="section-gap"></div>
        <div class="sub-head"><h2>What you are drafting towards</h2></div>
        <div class="draft-rounds">
          <div class="dround country"><div class="rn">3 COUNTRIES</div><div class="rt">3 prizes</div><div class="rd">Title, runner-up, and combined wins. Pair one heavyweight for title equity with two teams that pile up wins.</div></div>
          <div class="dround attacker"><div class="rn">2 ATTACKERS</div><div class="rt">2 prizes</div><div class="rd">Golden Boot and best attacker pair. Pair one favorite with one value scorer to raise both your floor and ceiling.</div></div>
          <div class="dround goalkeeper"><div class="rn">1 KEEPER</div><div class="rt">1 prize</div><div class="rd">Total saves. Target a busy keeper who defends deep or tends to reach shootouts.</div></div>
        </div>

        <div class="section-gap"></div>
        <div class="sub-head"><h2>The fine print</h2></div>
        <div class="rules">
          ${GC.RULES.map(r => `<div class="rule"><h3>${esc(r.q)}</h3><p>${esc(r.a)}</p></div>`).join("")}
        </div>
        <div class="section-gap"></div>
        <div class="hero-cta">
          <button class="btn btn-accent" data-go="payouts">See the payouts →</button>
          <button class="btn btn-ghost" data-go="scouting">Start scouting</button>
        </div>
      </div>`;
  }

  /* ============================================================ PAYOUTS */
  function Payouts() {
    const P = GC.POOL;
    const total = GC.PRIZES.reduce((t, p) => t + p.amount, 0);
    return `
      <div class="gc-container">
        <div class="gc-page-head">
          <p class="gc-eyebrow">Six races · ${money(total)} · no master score</p>
          <h1 class="gc-page-title">The <span class="accent">payouts.</span></h1>
          <p class="gc-page-sub">There is no overall winner. The pot splits into six independent prizes, and you can
            win one, several, or none. Draft for the prizes you most want to chase.</p>
        </div>

        <div class="potbar" title="How the pot splits">
          ${GC.PRIZES.map(p => `<div class="potseg" style="background:${CAT_COLOR[p.cat]};flex:${p.amount}">${money(p.amount)}</div>`).join("")}
        </div>
        <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:12px;font-family:var(--font-mono);font-size:11px;color:var(--fg-muted);align-items:center">
          <span style="display:inline-flex;align-items:center;gap:7px"><span class="cat-dot country"></span> Country prizes</span>
          <span style="display:inline-flex;align-items:center;gap:7px"><span class="cat-dot attacker"></span> Attacker prizes</span>
          <span style="display:inline-flex;align-items:center;gap:7px"><span class="cat-dot keeper"></span> Keeper prize</span>
        </div>
        <div class="section-gap"></div>

        <div class="prizegrid">
          ${GC.PRIZES.map(p => `
            <div class="prize" style="border-left:3px solid ${CAT_COLOR[p.cat]}">
              <div class="prize-cat" style="color:${CAT_COLOR[p.cat]}">${esc(p.catLabel)}</div>
              <div class="prize-head">
                <div class="prize-title">${esc(p.name)}</div>
                <div class="prize-amount tnum" style="background:${CAT_COLOR[p.cat]}">${money(p.amount)}</div>
              </div>
              <div class="prize-how">${esc(p.how)}</div>
              <p class="prize-blurb">${esc(p.blurb)}</p>
              <div class="prize-foot"><span>Live across the tournament</span><span>Cash prize</span></div>
            </div>`).join("")}
        </div>
      </div>`;
  }

  /* ============================================================ SCOUTING */
  const scoutState = { type: "country", q: "" };

  function countryCard(c) {
    const odds = oddsBar([
      { k: "To QF", v: impliedPct(c.qfOdds) },
      { k: "To final", v: impliedPct(c.finalOdds) },
      { k: "To win", v: impliedPct(c.titleOdds) },
    ]);
    return `
      <div class="acard">
        <div class="acard-top">
          <div class="acard-id">
            ${flag(c.code, "lg")}
            <div>
              <div class="acard-name">${esc(c.name)}</div>
              <div class="acard-meta">Group ${esc(c.group)} · FIFA ${esc(c.fifa)}</div>
            </div>
          </div>
          <span class="vibe ${vibeClass(c.vibe)}">${esc(c.vibe)}</span>
        </div>
        <div class="acard-body">
          ${odds}
          <div class="acard-line"><span class="lbl">The read</span>${esc(c.copy)}</div>
          <div class="acard-line"><span class="lbl">Reason to draft</span>${esc(c.draftCase)}</div>
          <div class="acard-fun"><span class="lbl">Risk · </span>${esc(c.risk)}</div>
        </div>
        <div class="acard-foot">
          <span class="nm">GROUP ${esc(c.group)} · ${esc(c.status)}</span>
          <span class="flag-code">${esc(c.code)}</span>
        </div>
      </div>`;
  }

  function attackerCard(a) {
    const c = GC.countryByCode(a.cc);
    const odds = oddsBar([
      { k: "Golden Boot", v: impliedPct(a.bootOdds) },
      { k: "Goals O/U", v: a.goalsLine != null ? String(a.goalsLine) : null, sub: a.goalsLine != null ? impliedPct(a.goalsOver) + " over" : null, line: true },
      { k: "G+A O/U", v: a.gaLine != null ? String(a.gaLine) : null, sub: a.gaLine != null ? impliedPct(a.gaOver) + " over" : null, line: true },
    ]);
    return `
      <div class="acard">
        <div class="acard-top">
          <div class="acard-id">
            ${pmedia(a)}
            <div>
              <div class="acard-name">${esc(a.name)}</div>
              <div class="acard-meta">${flagRow(a.cc)} · ${esc(a.club)}</div>
            </div>
          </div>
          <span class="vibe ${vibeClass(a.vibe)}">${esc(a.vibe)}</span>
        </div>
        <div class="acard-body">
          ${odds}
          <div class="acard-line"><span class="lbl">The read</span>${esc(a.copy)}</div>
          <div class="acard-line"><span class="lbl">Role · </span>${esc(cleanRole(a.role))} · ${esc(a.pos)}</div>
          <div class="acard-line"><span class="lbl">Reason to draft</span>${esc(a.draftCase)}</div>
          <div class="acard-fun"><span class="lbl">Risk · </span>${esc(a.risk)}</div>
        </div>
        <div class="acard-foot">
          <span class="nm">${c ? "GROUP " + esc(c.group) : esc(a.pos)} · ${esc(a.status)}</span>
          <span class="flag-code">${esc(a.cc)}</span>
        </div>
      </div>`;
  }

  function keeperCard(g) {
    const c = GC.countryByCode(g.cc);
    const odds = oddsBar([{ k: "Golden Glove", v: impliedPct(g.ggOdds) }]);
    return `
      <div class="acard">
        <div class="acard-top">
          <div class="acard-id">
            ${pmedia(g)}
            <div>
              <div class="acard-name">${esc(g.name)}</div>
              <div class="acard-meta">${flagRow(g.cc)} · ${esc(g.club)}</div>
            </div>
          </div>
          <span class="vibe ${vibeClass(g.vibe)}">${esc(g.vibe)}</span>
        </div>
        <div class="acard-body">
          ${odds}
          <div class="acard-line"><span class="lbl">The read</span>${esc(g.copy)}</div>
          <div class="acard-line"><span class="lbl">Saves case</span>${esc(g.savesCase)}</div>
          <div class="acard-line"><span class="lbl">Reason to draft</span>${esc(g.draftCase)}</div>
          <div class="acard-fun"><span class="lbl">Risk · </span>${esc(g.risk)}</div>
        </div>
        <div class="acard-foot">
          <span class="nm">${c ? "GROUP " + esc(c.group) : ""} · ${esc(g.status)}</span>
          <span class="flag-code">${esc(g.cc)}</span>
        </div>
      </div>`;
  }

  function Scouting() {
    const labels = { country: "Countries", attacker: "Attackers", goalkeeper: "Keepers" };
    const lists = { country: GC.COUNTRIES, attacker: GC.ATTACKERS, goalkeeper: GC.GOALKEEPERS };
    return `
      <div class="gc-container">
        <div class="gc-page-head">
          <p class="gc-eyebrow">The Draft Guide</p>
          <h1 class="gc-page-title">Scouting <span class="accent">cards.</span></h1>
          <p class="gc-page-sub">The whole board, filterable by category, with every card carrying a read, a draft case,
            a risk, and the live market odds. There are ${GC.COUNTRIES.length} countries, ${GC.ATTACKERS.length} attackers,
            and ${GC.GOALKEEPERS.length} keepers to study.</p>
        </div>
        <div style="display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:22px">
          <div class="seg" id="scout-seg">
            ${Object.keys(labels).map(k => `
              <button data-type="${k}" class="${scoutState.type === k ? "active" : ""}">${labels[k]}
                <span class="tnum" style="opacity:.55;margin-left:4px">${lists[k].length}</span></button>`).join("")}
          </div>
          <input class="gc-input" id="scout-q" style="max-width:300px" placeholder="Search name, club, vibe…" value="${esc(scoutState.q)}" />
        </div>
        <div id="scout-grid" class="cardgrid"></div>
        <div class="section-gap"></div>
      </div>`;
  }

  function renderScoutGrid() {
    const grid = $("#scout-grid");
    if (!grid) return;
    const lists = { country: GC.COUNTRIES, attacker: GC.ATTACKERS, goalkeeper: GC.GOALKEEPERS };
    let items = lists[scoutState.type];
    const s = scoutState.q.trim().toLowerCase();
    if (s) {
      items = items.filter(a =>
        a.name.toLowerCase().includes(s) ||
        (a.cc || a.code || "").toLowerCase().includes(s) ||
        (a.club || "").toLowerCase().includes(s) ||
        (a.vibe || "").toLowerCase().includes(s) ||
        (a.group ? ("group " + a.group).toLowerCase().includes(s) : false));
    }
    if (!items.length) { grid.innerHTML = `<div class="empty">No matches for “${esc(scoutState.q)}”.</div>`; return; }
    const render = scoutState.type === "country" ? countryCard : scoutState.type === "attacker" ? attackerCard : keeperCard;
    grid.innerHTML = items.map(render).join("");
  }

  /* ============================================================ SCHEDULE */
  function groupsMap() {
    // prefer explicit SCHEDULE.groups (real draw); fall back to grouping countries
    if (GC.SCHEDULE && GC.SCHEDULE.groups && Object.keys(GC.SCHEDULE.groups).length) {
      const out = {};
      Object.keys(GC.SCHEDULE.groups).forEach(L => {
        out[L] = GC.SCHEDULE.groups[L].map(code => GC.countryByCode(code)).filter(Boolean);
      });
      return out;
    }
    const g = {};
    GC.COUNTRIES.forEach(c => { (g[c.group] = g[c.group] || []).push(c); });
    Object.keys(g).forEach(k => g[k].sort((a, b) => GC.fifaNum(a) - GC.fifaNum(b)));
    return g;
  }

  function fixturesByMatchday() {
    const fx = (GC.SCHEDULE && GC.SCHEDULE.fixtures) || [];
    const by = {};
    fx.forEach(f => { (by[f.md] = by[f.md] || []).push(f); });
    return by;
  }

  function Schedule() {
    const groups = groupsMap();
    const letters = Object.keys(groups).sort();

    const groupCards = letters.map(L => {
      const teams = groups[L];
      return `
        <div class="gcard">
          <div class="gcard-head"><span class="gl">Group <b>${L}</b></span><span class="gm">${teams.length} teams</span></div>
          ${teams.map((c, i) => `
            <div class="grow">
              <span class="seed">${i + 1}</span>
              ${flag(c.code, "sm")}
              <span class="gn">${esc(c.name)}</span>
              <span class="grk">FIFA ${esc(c.fifa)}</span>
            </div>`).join("")}
        </div>`;
    }).join("");

    // fixtures: prefer real schedule data, else seeded round-robin
    const byMd = fixturesByMatchday();
    const hasReal = Object.keys(byMd).length > 0;
    let fixturesHtml;
    if (hasReal) {
      fixturesHtml = Object.keys(byMd).sort().map(md => {
        const rows = byMd[md].map(f => `
          <div class="frow">
            <span class="fteam home">${esc((GC.countryByCode(f.home) || {}).name || f.home)} ${flag(f.home, "sm")}</span>
            <span class="fmid"><span class="fvs">vs</span>${f.kickoffET ? `<span class="ftime">${esc(f.kickoffET)}</span>` : ""}</span>
            <span class="fteam away">${flag(f.away, "sm")} ${esc((GC.countryByCode(f.away) || {}).name || f.away)}</span>
            <span class="fmeta">Grp ${esc(f.group)}${f.venue ? " · " + esc(f.venue) : ""}${f.date ? " · " + esc(f.date) : ""}</span>
          </div>`).join("");
        const dateLabel = (GC.MATCHDAYS.find(m => String(m.md) === String(md)) || {}).dates || "";
        return `
          <div class="sub-head" style="margin-top:${md === Object.keys(byMd).sort()[0] ? "0" : "28px"}">
            <h2>Matchday ${esc(md)}</h2><span class="meta">${esc(dateLabel)} · ${byMd[md].length} matches</span>
          </div>
          <div class="fixtures wide">${rows}</div>`;
      }).join("");
    } else {
      const rr = [[[0,1],[2,3]],[[0,2],[3,1]],[[0,3],[1,2]]];
      fixturesHtml = GC.MATCHDAYS.map((mdObj, mdi) => {
        const rows = letters.map(L => {
          const teams = groups[L];
          return rr[mdi].map(([h, a]) => (!teams[h] || !teams[a]) ? "" : `
            <div class="frow">
              <span class="fteam home">${esc(teams[h].name)} ${flag(teams[h].code, "sm")}</span>
              <span class="fmid"><span class="fvs">vs</span></span>
              <span class="fteam away">${flag(teams[a].code, "sm")} ${esc(teams[a].name)}</span>
              <span class="fmeta">Group ${L}</span>
            </div>`).join("");
        }).join("");
        return `
          <div class="sub-head" style="margin-top:${mdi ? "28px" : "0"}">
            <h2>Matchday ${mdObj.md}</h2><span class="meta">${esc(mdObj.dates)} · ${letters.length * 2} matches</span>
          </div>
          <div class="fixtures wide">${rows}</div>`;
      }).join("");
    }

    const fixturesNote = hasReal
      ? `Kickoff times are shown in US Eastern. Fixtures reflect the finalized 2026 draw.`
      : `Fixtures pair each group's teams in a seeded round-robin. Exact kickoff times and venues finalize closer to the tournament.`;

    return `
      <div class="gc-container">
        <div class="gc-page-head">
          <p class="gc-eyebrow">${esc(GC.POOL.dates)} · ${esc(GC.POOL.hosts)}</p>
          <h1 class="gc-page-title">The <span class="accent">schedule.</span></h1>
          <p class="gc-page-sub">Forty-eight teams, twelve groups, one hundred four matches, and one trophy. Here are the
            groups, every group-stage kickoff, and the knockout road to the final at MetLife.</p>
        </div>

        <div class="seg" id="sched-seg" style="margin-bottom:24px">
          <button data-view="groups" class="active">Groups</button>
          <button data-view="fixtures">Group fixtures</button>
          <button data-view="knockout">Knockout & venues</button>
        </div>

        <div id="sched-groups">
          <div class="groupgrid">${groupCards}</div>
        </div>

        <div id="sched-fixtures" style="display:none">
          <div class="note-band" style="margin-bottom:22px">${esc(fixturesNote)}</div>
          ${fixturesHtml}
        </div>

        <div id="sched-knockout" style="display:none">
          <div class="sub-head"><h2>The road to the final</h2><span class="meta">Jun 11 – Jul 19</span></div>
          <div class="phasestrip">
            ${GC.PHASES.map(p => `
              <div class="phase ${p.name === "Final" ? "final" : ""}">
                <div class="pn">${esc(p.name)}</div>
                <div><div class="pd">${esc(p.dates)}</div><div class="pm">${p.matches} ${p.matches === 1 ? "match" : "matches"}</div></div>
                <div class="pb">${esc(p.blurb)}</div>
              </div>`).join("")}
          </div>
          <div class="section-gap"></div>
          <div class="sub-head"><h2>Host cities</h2><span class="meta">16 venues · 3 nations</span></div>
          <div class="venuegrid">
            ${GC.VENUES.map(v => `
              <div class="venue">
                <div class="vc">${esc(v.city)} <span class="pin">${esc(v.country)}</span></div>
                <div class="vv">${esc(v.venue)}</div>
                ${v.note ? `<div class="vn">${esc(v.note)}</div>` : ""}
              </div>`).join("")}
          </div>
          <div class="section-gap"></div>
          <div class="sub-head"><h2>Before you draft</h2><span class="meta">heads-up</span></div>
          <div class="watchlist">
            ${GC.WATCH.map(w => `<div class="watch"><div class="wt">${esc(w.topic)}</div><div class="wn">${esc(w.note)}</div></div>`).join("")}
          </div>
        </div>
        <div class="section-gap"></div>
      </div>`;
  }

  /* ============================================================ ROUTER */
  const SCREENS = {
    overview: { label: "Overview", render: Overview },
    rules: { label: "How to Play", render: Rules },
    payouts: { label: "Payouts", render: Payouts },
    scouting: { label: "Scouting", render: Scouting },
    schedule: { label: "Schedule", render: Schedule },
  };
  const ORDER = ["overview", "rules", "payouts", "scouting", "schedule"];
  let current = "overview";

  function go(screen) {
    if (!SCREENS[screen]) screen = "overview";
    current = screen;
    if (location.hash !== "#" + screen) history.replaceState(null, "", "#" + screen);
    $("#gc-main").innerHTML = SCREENS[screen].render();
    document.querySelectorAll(".gc-nav-link").forEach(b => b.classList.toggle("active", b.dataset.go === screen));
    window.scrollTo(0, 0);
    if (screen === "scouting") {
      renderScoutGrid();
      const q = $("#scout-q");
      if (q) q.addEventListener("input", e => { scoutState.q = e.target.value; renderScoutGrid(); });
      const seg = $("#scout-seg");
      if (seg) seg.addEventListener("click", e => {
        const btn = e.target.closest("button[data-type]"); if (!btn) return;
        scoutState.type = btn.dataset.type;
        seg.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
        renderScoutGrid();
      });
    }
    if (screen === "schedule") {
      const seg = $("#sched-seg");
      const views = { groups: "#sched-groups", fixtures: "#sched-fixtures", knockout: "#sched-knockout" };
      if (seg) seg.addEventListener("click", e => {
        const btn = e.target.closest("button[data-view]"); if (!btn) return;
        seg.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
        Object.entries(views).forEach(([k, sel]) => { const el = $(sel); if (el) el.style.display = k === btn.dataset.view ? "" : "none"; });
      });
    }
  }

  function buildShell() {
    const nav = ORDER.map(id => `<button class="gc-nav-link" data-go="${id}">${SCREENS[id].label}</button>`).join("");
    document.body.innerHTML = `
      <header class="gc-header">
        <div style="display:flex;align-items:baseline">
          <span class="gc-wordmark" data-go="overview">
            <span class="w-the">the </span><span class="w-beautiful">beautiful </span><span class="w-game">game</span><span class="w-dot">.</span>
          </span>
          <span class="gc-wordmark-sub">${esc(GC.POOL.sub)}</span>
        </div>
        <nav class="gc-nav">
          ${nav}
          <span class="gc-pot-pill tnum">${money(GC.POOL.pot)} POT</span>
        </nav>
      </header>
      <main id="gc-main" class="gc-main"></main>
      <footer class="gc-footer">
        <div><span class="dot"></span>${esc(GC.POOL.name)} · Prep desk</div>
        <div class="r">
          <span>${esc(GC.POOL.hosts)}</span>
          <span>${esc(GC.POOL.dates)}</span>
          <span>${money(GC.POOL.pot)} pot</span>
        </div>
      </footer>
      <div class="gc-noise"></div>`;
    document.body.addEventListener("click", e => {
      const t = e.target.closest("[data-go]"); if (!t) return;
      go(t.dataset.go);
    });
    window.addEventListener("hashchange", () => go((location.hash || "").replace("#", "") || "overview"));
  }

  buildShell();
  go((location.hash || "").replace("#", "") || "overview");
})();
