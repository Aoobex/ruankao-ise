/* 软考信息安全工程师 5天冲刺 — 纯前端离线版，进度存 localStorage */
(function () {
  const DATA = window.RK_DATA || { modules: [], questions: [] };
  const MODULES = DATA.modules;
  const QUESTIONS = DATA.questions;
  const CASES = window.RK_CASES || [];
  const BY_ID = {};
  QUESTIONS.forEach(q => { BY_ID[q.id] = q; });
  const M = {};
  MODULES.forEach(m => { M[m.id] = m; });

  /* ---------- 状态 ---------- */
  const KEY = 'ise5.v1';
  let storageMode = '浏览器 localStorage';
  const DEF = { cards: {}, days: {}, picked: {}, wrong: {}, mock: [], cases: {}, start: todayStr(), examDate: '2026-10-24' };
  let S = load();
  function todayStr() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function load() {
    const base = JSON.parse(JSON.stringify(DEF));
    try { return Object.assign(base, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return base; }
  }
  function save() {
    S.savedAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(S));
    if (typeof pushProfile === 'function') pushProfile();
  }

  /* ---------- 5天计划 ---------- */
  const PLAN = [
    { d: 1, title: '安全基础 + 密码学（上午卷最值钱的一天）', mods: ['basic', 'crypto'], hours: '4h 知识卡 + 2h 刷题',
      tasks: [
        '背「安全基础」12 张卡：CIA 五属性、网络安全法 6 个月日志、等保五级名称',
        '背「密码学」14 张卡：对称/非对称/哈希三大类，每类记 2 个算法名',
        '手算 3 道 RSA 小题（n=pq、φ(n)、e·d mod φ(n)=1）',
        '刷 basic + crypto 各 15 题，错题当场看解析',
        '今天目标：这两章正确率 ≥ 65%（上午卷这里占 17 分）'
      ] },
    { d: 2, title: '网络协议 + 攻击手法（题量最大）', mods: ['net', 'attack'], hours: '4h 知识卡 + 2h 刷题',
      tasks: [
        '背「网络协议」10 张卡：端口号表、TCP 三次握手、ARP/DNS 攻击',
        '背「攻击原理」14 张卡：攻击五步、SQL 注入/XSS/CSRF 三件套的区别',
        '把 OWASP Top 10 十个名字默写一遍',
        '刷 net + attack 各 15 题，攻击类题目重点看解析里的"防御措施"',
        '今天目标：看到题干能判断"这是哪类攻击"'
      ] },
    { d: 3, title: '防火墙 + VPN + 检测 + 恶意代码', mods: ['fw', 'vpn', 'ids', 'malware'], hours: '4h 知识卡 + 2h 刷题',
      tasks: [
        '背「防火墙」10 张卡：包过滤/状态检测/代理的区别，iptables 四表五链',
        '背「VPN」8 张卡：AH 不加密、ESP 加密、隧道模式用于网关',
        '背「入侵检测」9 张卡：CIDF 四组件、误用 vs 异常',
        '背「恶意代码」10 张卡：病毒/蠕虫/木马三者的区别（必考）',
        '刷这 4 章各 10-15 题'
      ] },
    { d: 4, title: '认证访问控制 + 系统安全 + 安全管理', mods: ['auth', 'sys', 'mgmt'], hours: '4h 知识卡 + 2h 刷题',
      tasks: [
        '背「认证与访问控制」11 张卡：四类认证依据、DAC/MAC/RBAC、Linux 权限位',
        '背「系统与应用安全」12 张卡：数据库/Web 服务器加固要点',
        '背「安全管理」14 张卡：风险四处置、应急响应六阶段、RTO/RPO',
        '刷 auth + sys + mgmt 各 12 题',
        '把「等保五级」「应急六阶段」「风险四策略」写在纸上默写'
      ] },
    { d: 5, title: '案例套路 + 计算 + 英语 + 两次模考', mods: ['case', 'calc', 'en'], hours: '3h 案例 + 2 次模考',
      tasks: [
        '看「下午案例专项」10 个案例，每个先自己在纸上写采分点，再展开对照',
        '背 8 张答题模板卡（Web 类、防火墙类、日志类、密码类、等保类、应急类）',
        '刷 calc 22 题（RSA、子网、可用性、风险值，都是送分计算）',
        '刷 en 18 题（专业英语 5 分，靠术语）',
        '做 2 次 75 题模考，各 120 分钟；错题本清零'
      ] }
  ];

  /* 上午卷 75 题的分值分布，模考按这个权重抽题（合计 75） */
  const MOCK_W = { basic: 6, crypto: 11, net: 6, attack: 9, fw: 6, vpn: 4, ids: 4, malware: 5, auth: 5, sys: 6, mgmt: 7, calc: 3, en: 3 };

  /* ---------- 工具 ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  /* 部分题库解析自带「解析：」前缀，渲染时去掉，避免出现「解析：解析：…」 */
  function ex(s) { return nl(String(s == null ? '' : s).replace(/^\s*解析[：:]\s*/, '')); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
  function questionsOf(mid) { return QUESTIONS.filter(q => q.m === mid); }
  function cardKey(mid, i) { return mid + '#' + i; }
  function cardProgress(m) { let n = 0; m.cards.forEach((c, i) => { if (S.cards[cardKey(m.id, i)]) n++; }); return n; }
  function answeredCount() { return Object.keys(S.picked).length; }
  function correctCount() { return Object.values(S.picked).filter(p => p.ok).length; }
  function rate() { const a = answeredCount(); return a ? Math.round(correctCount() / a * 100) : 0; }
  function totalCards() { return MODULES.reduce((s, m) => s + m.cards.length, 0); }
  function knownCards() { return Object.keys(S.cards).length; }
  function daysLeft() {
    if (!S.examDate) return 5;
    const t = new Date(S.examDate + 'T00:00:00'), n = new Date(todayStr() + 'T00:00:00');
    return Math.max(0, Math.round((t - n) / 86400000));
  }
  /* 第几天：手动选过就用手动值；否则按考试倒计时推（剩 5 天 = D1） */
  function currentDay() {
    if (S.manualDay) return Math.min(5, Math.max(1, S.manualDay));
    if (S.examDate) return Math.min(5, Math.max(1, 6 - daysLeft()));
    const s = new Date((S.start || todayStr()) + 'T00:00:00'), n = new Date(todayStr() + 'T00:00:00');
    return Math.min(5, Math.max(1, Math.round((n - s) / 86400000) + 1));
  }
  function weakest() {
    return MODULES.filter(m => questionsOf(m.id).length).map(m => {
      const qs = questionsOf(m.id);
      const done = qs.filter(q => S.picked[q.id]);
      const ok = done.filter(q => S.picked[q.id].ok).length;
      return { m, total: qs.length, done: done.length, ok, r: done.length ? ok / done.length : -1 };
    }).sort((a, b) => (a.r < 0 ? 9 : a.r) - (b.r < 0 ? 9 : b.r)).slice(0, 3);
  }
  function jsArr(mods) { return mods && mods.length ? '[' + mods.map(m => "'" + m + "'").join(',') + ']' : 'null'; }

  /* 每张知识卡配一道同模块例题：复用题库，不另写一份，避免两处答案不一致。
     匹配用二字组 + 逆文档频率过滤（"攻击""安全"这类满屏词不参与打分），
     再按分数从高到低贪心分配，尽量让同一模块内不出现重复例题。 */
  const CARD_EG = {};
  (function buildExamples() {
    function grams(s) {
      s = String(s).toLowerCase().replace(/[\s，。、（）()：:？?；;的与和及]/g, '');
      const out = new Set();
      for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
      return out;
    }
    const df = {}, all = [];
    MODULES.forEach(m => m.cards.forEach((c, i) => {
      const g = grams(c.t + c.b.join(''));
      all.push({ m, c, i, g });
      g.forEach(x => { df[x] = (df[x] || 0) + 1; });
    }));
    const common = new Set(Object.keys(df).filter(k => df[k] / Math.max(1, all.length) > 0.35));
    const w = g => (common.has(g) ? 0 : 1);

    MODULES.forEach(m => {
      const qs = questionsOf(m.id);
      if (!qs.length) return;
      const pairs = [];
      m.cards.forEach((c, i) => {
        const tg = grams(c.t), bg = grams(c.b.join(''));
        qs.forEach(q => {
          const qg = grams((q.tag || '') + ' ' + q.q);
          let s = 0;
          tg.forEach(g => { if (w(g) && qg.has(g)) s += 5; });
          bg.forEach(g => { if (w(g) && qg.has(g)) s += 1; });
          pairs.push({ k: cardKey(m.id, i), q: q.id, s });
        });
      });
      pairs.sort((a, b) => b.s - a.s);
      const usedCard = {}, usedQ = {};
      pairs.forEach(p => {
        if (usedCard[p.k] || usedQ[p.q] || p.s <= 0) return;
        CARD_EG[p.k] = p.q; usedCard[p.k] = 1; usedQ[p.q] = 1;
      });
      // 剩下的卡片：用最高分（可能重复），再不行就按顺序兜底
      m.cards.forEach((c, i) => {
        const k = cardKey(m.id, i);
        if (CARD_EG[k]) return;
        const best = pairs.filter(p => p.k === k).sort((a, b) => b.s - a.s)[0];
        CARD_EG[k] = best && best.s > 0 ? best.q : qs[i % qs.length].id;
      });
    });
  })();
  function exampleOf(m, i) { return BY_ID[CARD_EG[cardKey(m.id, i)]]; }

  /* ---------- 路由 ---------- */
  let tab = 'home';
  window.go = function (t) { tab = t; render(); window.scrollTo(0, 0); };
  function renderTop() {
    document.getElementById('topStats').innerHTML =
      '已刷 <b>' + answeredCount() + '</b> 题 · 正确率 <b>' + rate() + '%</b> · 卡片 <b>' + knownCards() + '/' + totalCards() + '</b>' +
      (S.examDate ? ' · 距考试 <b>' + daysLeft() + '</b> 天' : '');
  }
  function render() {
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    renderTop();
    const el = document.getElementById('main');
    el.innerHTML = ({ home: vHome, plan: vPlan, learn: vLearn, quiz: vQuiz, case: vCase, mock: vMock, wrong: vWrong }[tab] || vHome)();
    if (tab === 'quiz' && quizState) renderQuizBody();
    if (tab === 'case' && caseState) renderCaseBody();
    if (tab === 'mock' && mockState) mountMock();
  }

  /* ---------- 首页 ---------- */
  function vHome() {
    const dl = daysLeft();
    const dayIdx = currentDay();
    const plan = PLAN[dayIdx - 1] || PLAN[4];
    const weak = weakest().filter(w => w.done > 0);
    return `
    <h1>${S.examDate ? '距考试还有 ' + dl + ' 天' : '5 天冲刺计划'}</h1>
    <p class="sub">上午卷 75 题单选 · 下午卷 5 道案例 · 每科满分 75、<b>45 分及格</b>、两科必须一次都过。2026 年下半年信息安全工程师考试时间是 <b>10 月 24 日</b>（仅一天、一个批次）。</p>

    <div class="row" style="margin:14px 0 0">
      <span class="sub">现在是第几天：</span>
      ${PLAN.map(p => `<button class="btn sm ${p.d === dayIdx ? '' : 'ghost'}" onclick="setDay(${p.d})">D${p.d}</button>`).join('')}
      <span class="sub">（不确定就从 D1 开始，按顺序走）</span>
    </div>

    <div class="grid g3" style="margin:18px 0">
      <div class="card"><div class="sub">题库总量</div><div style="font-size:30px;font-weight:700">${QUESTIONS.length}<span class="sub" style="font-size:14px"> 题</span></div><div class="sub">${MODULES.length} 个模块 · ${CASES.length} 个案例</div></div>
      <div class="card"><div class="sub">我的正确率</div><div style="font-size:30px;font-weight:700;color:${rate() >= 60 ? 'var(--accent)' : 'var(--accent2)'}">${rate()}%</div><div class="bar" style="margin-top:8px"><i style="width:${rate()}%"></i></div></div>
      <div class="card"><div class="sub">知识卡掌握</div><div style="font-size:30px;font-weight:700">${knownCards()}<span class="sub" style="font-size:14px"> / ${totalCards()}</span></div><div class="bar" style="margin-top:8px"><i style="width:${totalCards() ? Math.round(knownCards() / totalCards() * 100) : 0}%"></i></div></div>
    </div>

    <div class="card hl">
      <div class="row"><h3>今天该干这些（第 ${dayIdx} 天：${esc(plan.title)}）</h3><span class="spacer"></span><span class="pill">${plan.hours}</span></div>
      <ul style="margin:10px 0 14px 18px;display:grid;gap:6px">${plan.tasks.map(t => '<li style="color:#c7d1db">' + esc(t) + '</li>').join('')}</ul>
      <div class="row">
        ${plan.mods.filter(x => M[x] && questionsOf(x).length).map(x => `<button class="btn sm ghost" onclick="startQuiz(['${x}'],15)">刷 ${esc(M[x].name)}</button>`).join('')}
        <span class="spacer"></span>
        <button class="btn" onclick="${dayIdx >= 5 ? "go('mock')" : "learnToday(" + dayIdx + ")"}">${dayIdx >= 5 ? '开始模考' : '学今天的卡'}</button>
      </div>
    </div>

    ${weak.length ? `<h2>最该补的三个模块</h2><div class="grid g3">${weak.map(w => `
      <div class="card"><div class="row"><b>${esc(w.m.name)}</b><span class="spacer"></span><span class="pill ${w.m.priority}">${w.r === -1 ? '未做' : Math.round(w.r * 100) + '%'}</span></div>
      <div class="sub" style="margin:6px 0 10px">已做 ${w.done}/${w.total} 题</div>
      <button class="btn sm ghost" onclick="startQuiz(['${w.m.id}'],15)">马上练</button></div>`).join('')}</div>` : ''}

    <h2>进度文件 / 导出 / 重置</h2>
    <div class="card">
      <p class="sub" style="margin-bottom:12px">进度默认存在浏览器 localStorage；用 <code>run-server.ps1</code> 启动时，会自动读写项目根目录的 <b>profile.json</b>——把它 git push 上去，另一台设备 pull 下来打开就是同一份进度。</p>
      <div class="row">
        <button class="btn sm" onclick="exportProgress()">导出进度（profile.json）</button>
        <button class="btn sm ghost" onclick="resetAll()">重置进度</button>
        <span class="spacer"></span>
        <span class="sub" id="syncHint">${S.savedAt ? '上次保存：' + new Date(S.savedAt).toLocaleString('zh-CN') : '还没有保存过'}</span>
      </div>
      <hr>
      <div class="sub"><b>当前存储：</b>${storageMode}。${storageMode === 'profile.json（自动读写）'
        ? '换设备时把 profile.json 一起同步（git / 网盘）即可。'
        : '双击打开时浏览器不允许网页写本地文件，所以进度只存在本机；想用 profile.json 请用 run-server.ps1 启动（或点「导出进度」手动保存文件）。'}</div>
    </div>

    <h2>零基础就按这四步走</h2>
    <div class="card">
      <ol style="margin-left:18px;display:grid;gap:8px;color:#c7d1db">
        <li><b>先背卡再刷题</b>：知识卡是"能直接背的结论"，看不懂原理没关系，先记住结论。</li>
        <li><b>刷题只刷不会的</b>：选完立刻出解析，做错的自动进错题本，做对一次就移出。</li>
        <li><b>第 5 天必须做案例</b>：下午卷是主观题，光背不写，考场上写不出采分点。</li>
        <li><b>模考至少两次</b>：75 题 120 分钟，练的是时间感和"不会就蒙一个"的果断。</li>
      </ol>
      <hr>
      <div class="row"><span class="sub">考试日期（可选，用来倒计时）</span>
        <input type="date" value="${S.examDate}" onchange="setExamDate(this.value)" style="background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:6px 10px">
        <button class="btn sm ghost" onclick="resetAll()">清空全部进度</button></div>
    </div>

    <h2>先把考试规则搞清楚</h2>
    <div class="card"><table>
      <tr><th>项目</th><th>上午：综合知识</th><th>下午：案例分析</th></tr>
      <tr><td>题型</td><td>75 道单选（含 5 分专业英语）</td><td>5 道大题，总分 75，每题约 15 分</td></tr>
      <tr><td>满分 / 及格</td><td>75 / <b>45</b></td><td>75 / <b>45</b></td></tr>
      <tr><td>时长</td><td>两科连考 240 分钟，本科目 90-120 分钟</td><td>本科目约 120 分钟</td></tr>
      <tr><td>机考</td><td>全部机考，可标记、可回改</td><td>打字作答，注意分点写</td></tr>
    </table>
    <p class="sub" style="margin-top:10px">及格线是 45 分（60%），<b>两科都要过</b>，单科成绩不保留。所以策略是：上午靠背 + 刷题拿 60，下午靠模板 + 采分点拿 45-50。</p></div>`;
  }

  window.setExamDate = function (v) { S.examDate = v; save(); render(); };

  /* ---------- 进度持久化：localStorage + profile.json ----------
     用 run-server.ps1 启动时，页面通过 /api/profile 读写项目根目录的 profile.json；
     双击 index.html（file://）时浏览器不允许写本地文件，自动退回 localStorage。 */
  const PROFILE_URL = 'api/profile';

  async function pullProfile() {
    try {
      const r = await fetch(PROFILE_URL, { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      if (!data || typeof data !== 'object' || !('picked' in data || 'cards' in data)) return;
      storageMode = 'profile.json（自动读写）';
      /* 文件比本机新才覆盖，避免把刚做过的进度冲掉 */
      if ((data.savedAt || 0) > (S.savedAt || 0)) {
        S = Object.assign(JSON.parse(JSON.stringify(DEF)), data);
        localStorage.setItem(KEY, JSON.stringify(S));
      }
    } catch (e) { /* 没启动服务器：继续用 localStorage */ }
  }

  let pushTimer = null;
  function pushProfile() {
    if (storageMode !== 'profile.json（自动读写）') return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      fetch(PROFILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(S)
      }).catch(() => {});
    }, 400);
  }

  window.exportProgress = function () {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'profile.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    hint('已导出 profile.json，替换项目里的同名文件即可');
  };

  function hint(msg) {
    const el = document.getElementById('syncHint');
    if (!el) return;
    el.textContent = msg;
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000);
  }

  window.resetAll = function () {
    if (!confirm('确定清空所有学习进度？')) return;
    Object.keys(S).forEach(k => delete S[k]);
    Object.assign(S, JSON.parse(JSON.stringify(DEF)));
    quizState = null; mockState = null; caseState = null;
    save(); render();
  };

  /* ---------- 计划 ---------- */
  function vPlan() {
    return `<h1>5 天计划表</h1><p class="sub">按"性价比"排的，不是按教材顺序。每天约 6 小时，第 5 天全用来案例和模考。</p>
    ${PLAN.map(p => {
      const done = S.days[p.d];
      const mods = p.mods.map(id => M[id]).filter(Boolean);
      const qs = mods.reduce((s, m) => s + questionsOf(m.id).length, 0);
      return `<div class="day ${done ? 'done' : ''}">
        <div class="num">D${p.d}</div>
        <div class="body">
          <div class="row"><b>${esc(p.title)}</b><span class="spacer"></span><span class="pill">${p.hours}</span></div>
          <ul style="margin:8px 0 0 18px;display:grid;gap:5px">${p.tasks.map(t => '<li class="tasks" style="list-style:disc">' + esc(t) + '</li>').join('')}</ul>
          <div class="row" style="margin-top:10px">
            ${mods.filter(m => questionsOf(m.id).length).map(m => `<button class="btn sm ghost" onclick="startQuiz(['${m.id}'],15)">刷 ${esc(m.name)}</button>`).join('')}
            ${p.mods.indexOf('case') >= 0 ? `<button class="btn sm ghost" onclick="go('case')">练案例</button>` : ''}
            <span class="spacer"></span><span class="badge">共 ${qs} 题</span>
            <button class="btn sm ${done ? 'ghost' : ''}" onclick="toggleDay(${p.d})">${done ? '✓ 已完成' : '标记完成'}</button>
          </div>
        </div></div>`;
    }).join('')}
    <h2>保过公式（自己心里有数）</h2>
    <div class="card"><ul style="margin-left:18px;display:grid;gap:6px;color:#c7d1db">
      <li><b>上午 60 分</b>：密码学 10 + 攻击 8 + 防火墙 5 + 系统安全 6 + 安全管理 6 + 认证访问控制 8 + 恶意代码 4 + 网络协议 5 + VPN/IDS 6 + 英语 2 ≈ 60。</li>
      <li><b>下午 45 分</b>：5 道题每题 15 分左右，每题拿到 9-10 分就够。案例题只要写对关键词就给分，宁可多写 3 条。</li>
      <li><b>放弃策略</b>：物理安全、标准化细节、生僻标准号，看不懂就跳过，不要耗时间。</li>
    </ul></div>`;
  }
  window.toggleDay = function (d) { S.days[d] = !S.days[d]; save(); render(); };

  /* ---------- 知识卡 ---------- */
  let learnMod = MODULES[0] ? MODULES[0].id : '';
  let openCards = {};
  let exOpen = {};
  function vLearn() {
    const m = M[learnMod] || MODULES[0];
    if (!m) return '<div class="empty">没有知识卡数据</div>';
    const cp = cardProgress(m);
    return `<h1>知识卡</h1><p class="sub">每张卡 = 能直接背的结论 + 一道同考点例题。先看结论，再点「看答案」对例题，最后勾「已掌握」。</p>
    <div class="modtabs" style="margin-top:16px">${MODULES.map(x => {
      const p = cardProgress(x);
      return `<button class="${x.id === m.id ? 'active' : ''}" onclick="setLearn('${x.id}')">${esc(x.name)} <span style="opacity:.7">${p}/${x.cards.length}</span></button>`;
    }).join('')}</div>
    <div class="row" style="margin:-6px 0 14px"><span class="sub">全部 ${MODULES.length} 个模块共 ${totalCards()} 张卡。想打印整本速查表：逐个模块点「打印本章」，或按 D1-D5 顺序过一遍。</span><span class="spacer"></span><button class="btn ghost sm" onclick="window.print()">打印本章</button></div>
    <div class="card">
      <div class="row"><b>${esc(m.name)}</b><span class="pill ${m.priority}">${m.priority === 'high' ? '高性价比' : m.priority === 'mid' ? '中等' : '快速过'}</span><span class="pill">第 ${m.day} 天</span><span class="pill">约 ${m.weight} 分</span><span class="spacer"></span>${questionsOf(m.id).length ? `<button class="btn sm ghost" onclick="startQuiz(['${m.id}'],15)">刷这章题</button>` : ''}</div>
      <p class="sub" style="margin-top:8px">${esc(m.intro)}</p>
      <div class="bar" style="margin-top:10px"><i style="width:${m.cards.length ? Math.round(cp / m.cards.length * 100) : 0}%"></i></div>
    </div>
    ${m.cards.map((c, i) => {
      const k = cardKey(m.id, i), on = !!S.cards[k], open = !!openCards[k];
      const eg = exampleOf(m, i), showEx = !!exOpen[k];
      return `<details class="kcard" ${open ? 'open' : ''} ontoggle="setOpen('${k}',this.open)"><summary>${esc(c.t)}${on ? ' <span class="badge" style="color:var(--accent)">已掌握</span>' : ''}</summary>
      <div class="inner"><ul>${c.b.map(x => '<li>' + nl(x) + '</li>').join('')}</ul>
      ${c.code ? '<pre><code>' + esc(c.code) + '</code></pre>' : ''}
      ${c.tip ? '<div class="tip">💡 ' + esc(c.tip) + '</div>' : ''}
      ${!eg && m.id === 'case' ? `<div class="eg"><div class="row"><b>看完就练一道题</b><span class="spacer"></span><button class="btn sm" onclick="startRandomCase()">随机练一个案例</button><button class="btn sm ghost" onclick="go('case')">看案例列表</button></div></div>` : ''}
      ${eg ? `<div class="eg">
        <div class="row"><b>例题（先自己想，再展开）</b><span class="spacer"></span><span class="badge">${esc(eg.tag || '')}</span>
        <button class="btn sm ghost" onclick="toggleEx('${k}')">${showEx ? '收起答案' : '看答案'}</button></div>
        <div class="qtext" style="font-size:15px;margin:10px 0 0">${esc(eg.q)}</div>
        <div class="opts" style="margin-top:10px">${eg.o.map((o, oi) => `<div class="opt ${showEx ? (oi === eg.a ? 'right' : 'dim') : 'plain'}"><span class="k">${'ABCD'[oi]}</span><span>${esc(o)}</span></div>`).join('')}</div>
        ${showEx ? `<div class="explain"><b>答案：${'ABCD'[eg.a]}</b><br>${ex(eg.e)}</div>` : ''}
      </div>` : ''}
      <div class="row" style="margin-top:12px"><button class="btn sm ${on ? 'ghost' : ''}" onclick="toggleCard('${m.id}',${i})">${on ? '取消已掌握' : '标记已掌握'}</button>
      ${eg ? `<button class="btn sm ghost" onclick="startQuiz(['${m.id}'],10)">刷这章的题</button>` : ''}</div>
      </div></details>`;
    }).join('')}`;
  }
  window.setLearn = function (id) { learnMod = id; if (tab !== 'learn') tab = 'learn'; render(); };
  /* 首页「学今天的卡」：跳到当天计划里第一个有卡片的模块 */
  window.learnToday = function (d) {
    const p = PLAN[d - 1];
    const m = p && p.mods.map(x => M[x]).filter(Boolean)[0];
    setLearn(m ? m.id : MODULES[0].id);
  };
  window.setOpen = function (k, open) { if (open) openCards[k] = 1; else delete openCards[k]; };
  window.toggleEx = function (k) { if (exOpen[k]) delete exOpen[k]; else exOpen[k] = 1; render(); };
  window.toggleCard = function (mid, i) {
    const k = cardKey(mid, i);
    if (S.cards[k]) delete S.cards[k]; else S.cards[k] = 1;
    openCards[k] = 1;
    save(); render();
  };

  /* ---------- 刷题 ---------- */
  let quizState = null;
  window.startQuiz = function (mods, n) {
    if (mods === false) return startWrong();
    if (!mods) mods = null;
    const all = questionsOfMulti(mods);
    if (!all.length) mods = null;
    const pool = shuffle(all.filter(q => !S.picked[q.id] || !S.picked[q.id].ok));
    const list = (pool.length >= (n || 20) ? pool : shuffle(all)).slice(0, n || 20);
    quizState = { list, idx: 0, mods };
    tab = 'quiz'; render();
  };
  function questionsOfMulti(mods) {
    if (!mods || !mods.length) return QUESTIONS.slice();
    return QUESTIONS.filter(q => mods.indexOf(q.m) >= 0);
  }
  function startWrong() {
    const list = shuffle(Object.keys(S.wrong).map(id => BY_ID[id]).filter(Boolean));
    if (!list.length) { alert('错题本是空的，先去刷题吧'); return; }
    quizState = { list, idx: 0, mods: null };
    tab = 'quiz'; render();
  }
  window.startWrong = startWrong;

  function vQuiz() {
    if (!quizState) {
      return `<h1>刷题</h1><p class="sub">选择题库范围，每组 15-25 题。选完立刻出解析，做错的自动进错题本。</p>
      <div class="card"><div class="row">
        <button class="btn" onclick="startQuiz(null,20)">随机 20 题（全题库）</button>
        <button class="btn blue" onclick="startQuiz(null,40)">随机 40 题</button>
        <span class="spacer"></span><span class="sub">题库共 ${QUESTIONS.length} 题</span>
      </div></div>
      <h2>按模块练习</h2>
      <div class="grid g3">${MODULES.filter(m => questionsOf(m.id).length).map(m => {
        const qs = questionsOf(m.id);
        const done = qs.filter(q => S.picked[q.id]);
        const ok = done.filter(q => S.picked[q.id].ok).length;
        const r = done.length ? Math.round(ok / done.length * 100) : -1;
        return `<div class="card"><div class="row"><b>${esc(m.name)}</b><span class="spacer"></span><span class="pill ${m.priority}">${m.weight}分</span></div>
        <div class="sub" style="margin:8px 0">${qs.length} 题 · ${done.length ? '正确率 ' + r + '%' : '未开始'}</div>
        <div class="bar"><i style="width:${r < 0 ? 0 : r}%"></i></div>
        <div class="row" style="margin-top:10px"><button class="btn sm" onclick="startQuiz(['${m.id}'],15)">练 15 题</button><button class="btn sm ghost" onclick="startQuiz(['${m.id}'],${Math.min(40, qs.length)})">练 ${Math.min(40, qs.length)} 题</button></div></div>`;
      }).join('')}</div>`;
    }
    return `<div id="quizBody"></div>`;
  }
  function renderQuizBody() {
    const st = quizState;
    const box = document.getElementById('quizBody');
    if (!box) return;
    if (st.idx >= st.list.length) { box.innerHTML = quizSummary(); return; }
    const q = st.list[st.idx];
    const p = S.picked[q.id];
    const m = M[q.m] || { name: q.m };
    box.innerHTML = `<div class="qwrap">
      <div class="qmeta"><span class="pill">${esc(m.name)}</span><span class="pill">${esc(q.tag || '')}</span><span class="pill">难度 ${q.lv || 1}</span><span class="spacer"></span><span>${st.idx + 1} / ${st.list.length}</span></div>
      <div class="bar" style="margin-bottom:16px"><i style="width:${Math.round(st.idx / st.list.length * 100)}%"></i></div>
      <div class="qtext">${esc(q.q)}</div>
      <div class="opts">${q.o.map((o, i) => {
        let cls = 'opt';
        if (p) { cls += ' locked'; if (i === q.a) cls += ' right'; else if (i === p.i) cls += ' wrong'; }
        return `<button class="${cls}" ${p ? '' : `onclick="pick('${q.id}',${i})"`}><span class="k">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`;
      }).join('')}</div>
      ${p ? `<div class="explain"><b>${p.ok ? '✓ 答对了' : '✗ 正确答案：' + 'ABCD'[q.a]}</b><br>${ex(q.e)}</div>
        <div class="row" style="margin-top:14px"><button class="btn" onclick="nextQ()">下一题 →</button>
        <span class="spacer"></span><button class="btn ghost sm" onclick="startQuiz(${jsArr(st.mods)},${st.list.length})">换一批</button></div>`
        : `<div class="row" style="margin-top:14px"><span class="sub">选一个答案，不确定就凭第一印象</span><span class="spacer"></span><button class="btn ghost sm" onclick="nextQ()">跳过</button></div>`}
    </div>`;
  }
  window.pick = function (id, i) {
    const q = BY_ID[id]; if (!q) return;
    const ok = i === q.a;
    S.picked[id] = { i, ok };
    if (!ok) S.wrong[id] = (S.wrong[id] || 0) + 1;
    else if (S.wrong[id]) delete S.wrong[id];
    save(); renderQuizBody(); renderTop();
  };
  window.nextQ = function () { quizState.idx++; renderQuizBody(); };
  function quizSummary() {
    const st = quizState;
    const done = st.list.filter(q => S.picked[q.id]);
    const ok = done.filter(q => S.picked[q.id].ok).length;
    const bad = done.length - ok;
    return `<div class="qwrap"><h1>本组完成</h1>
      <div class="row" style="margin:16px 0;gap:26px">
        <div><div class="sub">做题</div><div class="score-big">${done.length}<span class="sub" style="font-size:16px">/${st.list.length}</span></div></div>
        <div><div class="sub">正确</div><div class="score-big ${ok / Math.max(1, done.length) >= .6 ? 'pass' : 'fail'}">${ok}</div></div>
        <div><div class="sub">正确率</div><div class="score-big">${Math.round(ok / Math.max(1, done.length) * 100)}%</div></div>
      </div>
      ${bad ? `<p class="sub">做错的 ${bad} 题已进错题本，现在就去清一遍效率最高。</p>` : '<p class="sub">全对，继续下一组。</p>'}
      <div class="row" style="margin-top:18px">
        <button class="btn" onclick="startQuiz(${jsArr(st.mods)},${st.list.length})">再来一组</button>
        <button class="btn ghost" onclick="go('wrong')">看错题本</button>
        <button class="btn ghost" onclick="abandonQuiz()">返回题库</button>
      </div></div>`;
  }
  window.abandonQuiz = function () { quizState = null; render(); };

  /* ---------- 下午案例 ---------- */
  let caseState = null;
  function vCase() {
    if (caseState) return `<div id="caseBody"></div>`;
    if (!CASES.length) return '<div class="empty">案例数据未加载</div>';
    const doneN = Object.keys(S.cases).length;
    return `<h1>下午案例专项（${CASES.length} 题）</h1>
    <p class="sub">真实下午卷是 5 道大题、总分 75 分（每题 15 分左右）。这里 10 道题按 20 分/题练，每题拿到 12 分（60%）就是过线水平。做法：<b>先自己在纸上写答案，再点开采分点对照</b>，勾上你写到的点，系统自动算分。</p>
    <div class="card hl"><div class="row">
      <div><div class="sub">已练</div><div style="font-size:22px;font-weight:700">${doneN} / ${CASES.length}</div></div>
      <span class="spacer"></span>
      <button class="btn" onclick="openCase('${CASES[0].id}')">从第一题开始</button>
      <button class="btn ghost" onclick="startRandomCase()">随机练一个</button>
    </div></div>
    <div class="grid g2">${CASES.map((c, i) => {
      const sc = S.cases[c.id];
      return `<div class="card"><div class="row"><b>${esc(c.title)}</b><span class="spacer"></span><span class="pill">${c.score} 分</span>${sc ? `<span class="pill low">${sc}/${c.score}</span>` : ''}</div>
      <div class="sub" style="margin:8px 0 12px">${c.qs.length} 个小问 · ${sc ? '已练过，得分 ' + Math.round(sc / c.score * 100) + '%' : '未练习'}</div>
      <button class="btn sm ${sc ? 'ghost' : ''}" onclick="openCase('${c.id}')">${sc ? '再练一次' : '开始练习'}</button></div>`;
    }).join('')}</div>
    <h2>案例题怎么拿分（先看这个）</h2>
    <div class="card"><ul style="margin-left:18px;display:grid;gap:7px;color:#c7d1db">
      <li><b>问什么答什么</b>：问"风险"就别写整改措施，写多了不给分也不扣分，但浪费时间。</li>
      <li><b>一条一行，编号写</b>：阅卷按关键词给分，写成一坨老师找不到关键词就 0 分。</li>
      <li><b>用术语</b>：写"SQL 注入""最小权限原则""DMZ 区"，别写"有漏洞""权限小一点"。</li>
      <li><b>措施题写两类</b>：技术措施（防火墙、加密、加固）+ 管理措施（制度、培训、审计），各写 2-3 条。</li>
      <li><b>时间</b>：5 题约 120 分钟，每题 20-22 分钟，先做会的，不会的先写满再回头。</li>
    </ul></div>`;
  }
  window.startRandomCase = function () { openCase(CASES[Math.floor(Math.random() * CASES.length)].id); };
  window.openCase = function (id) {
    const c = CASES.filter(x => x.id === id)[0];
    if (!c) return;
    caseState = { c, checked: {}, show: false };
    tab = 'case'; render(); window.scrollTo(0, 0);
  };
  function caseScore() {
    let got = 0, total = 0;
    caseState.c.qs.forEach((q, qi) => q.points.forEach((p, pi) => {
      total += p.s;
      if (caseState.checked[qi + '#' + pi]) got += p.s;
    }));
    return { got, total };
  }
  function renderCaseBody() {
    const box = document.getElementById('caseBody');
    if (!box) return;
    const c = caseState.c;
    const sc = caseScore();
    box.innerHTML = `<div class="row"><button class="btn ghost sm" onclick="closeCase()">← 返回案例列表</button><span class="spacer"></span><span class="pill">${c.score} 分</span><span class="pill">自评 ${sc.got} / ${sc.total}</span></div>
      <h1 style="margin-top:14px">${esc(c.title)}</h1>
      <div class="card"><div class="sub" style="margin-bottom:8px">背景材料</div><div style="white-space:pre-wrap;line-height:1.85">${esc(c.bg)}</div></div>
      ${c.qs.map((q, qi) => `<div class="card">
        <div class="qtext" style="font-size:16px;margin-bottom:12px">${nl(q.q)}</div>
        <div class="sub" style="margin-bottom:8px">对照采分点：你写到了就勾上（每条后面是分值）</div>
        ${q.points.map((p, pi) => {
          const k = qi + '#' + pi, on = !!caseState.checked[k];
          return `<label class="opt ${on ? 'right' : ''}" style="cursor:pointer;margin-bottom:8px" onclick="caseCheck('${k}')">
            <span class="k">${on ? '✓' : ''}</span><span>${esc(p.t)} <span class="badge">${p.s} 分</span></span></label>`;
        }).join('')}
        ${caseState.show ? `<div class="explain"><b>参考答案</b><br>${nl(q.ans)}</div>` : ''}
      </div>`).join('')}
      <div class="card hl"><div class="row">
        <button class="btn" onclick="caseReveal()">${caseState.show ? '收起参考答案' : '对完采分点，看参考答案'}</button>
        <button class="btn ghost" onclick="caseSave()">保存这次自评（${sc.got} 分）</button>
        <span class="spacer"></span><span class="sub">${sc.total ? Math.round(sc.got / sc.total * 100) : 0}%</span>
      </div>
      ${caseState.show && sc.total ? `<p class="sub" style="margin-top:10px">${sc.got / sc.total >= .6 ? '这个水平下午卷能过。继续保持，重点练"写全采分点"。' : '低于 60%，把参考答案里的关键词抄一遍，下一题先想"阅卷老师想看到哪几个词"。'}</p>` : ''}</div>`;
    window.scrollTo(0, 0);
  }
  window.caseCheck = function (k) {
    if (caseState.checked[k]) delete caseState.checked[k]; else caseState.checked[k] = 1;
    renderCaseBody();
  };
  window.caseReveal = function () { caseState.show = !caseState.show; renderCaseBody(); };
  window.caseSave = function () {
    const sc = caseScore();
    const prev = S.cases[caseState.c.id] || 0;
    S.cases[caseState.c.id] = Math.max(prev, sc.got);
    save(); alert('已保存：' + sc.got + ' / ' + sc.total + ' 分');
    renderTop();
  };
  window.closeCase = function () { caseState = null; render(); };

  /* ---------- 错题本 ---------- */
  function vWrong() {
    const ids = Object.keys(S.wrong);
    const list = ids.map(id => BY_ID[id]).filter(Boolean);
    if (!list.length) return `<h1>错题本</h1><div class="empty">还没有错题。<br><br><button class="btn" onclick="go('quiz')">去刷题</button></div>`;
    return `<h1>错题本（${list.length} 题）</h1><p class="sub">错过的题留在这里，做对一次就自动移出。考前只看这一页。</p>
    <div class="card"><div class="row"><button class="btn" onclick="startWrong()">全部重做（${list.length} 题）</button>
      <span class="sub">建议先做错 2 次以上的</span></div></div>
    ${list.sort((a, b) => S.wrong[b.id] - S.wrong[a.id]).map(q => {
      const m = M[q.m] || { name: q.m };
      return `<div class="card"><div class="qmeta" style="display:flex;gap:8px;margin-bottom:8px"><span class="pill">${esc(m.name)}</span><span class="pill">${esc(q.tag || '')}</span><span class="pill" style="color:var(--bad)">错 ${S.wrong[q.id]} 次</span></div>
      <div class="qtext" style="font-size:15px">${esc(q.q)}</div>
      <div class="sub" style="margin:8px 0;color:var(--accent)">正确答案：${'ABCD'[q.a]}. ${esc(q.o[q.a])}</div>
      <div class="explain">${ex(q.e)}</div>
      <div class="row" style="margin-top:12px"><button class="btn sm ghost" onclick="removeWrong('${q.id}')">移出错题本</button><button class="btn sm ghost" onclick="startQuiz(['${q.m}'],15)">再练这个模块</button></div></div>`;
    }).join('')}`;
  }
  window.removeWrong = function (id) { delete S.wrong[id]; save(); render(); };

  /* ---------- 模考 ---------- */
  let mockState = null, mockTimer = null, mockSec = 0;
  function vMock() {
    if (mockState && mockState.phase === 'run') return `<div id="mockRun"></div>`;
    const hist = S.mock.slice(-5);
    return `<h1>模拟考试（上午卷）</h1><p class="sub">按真实分值分布抽 75 题，限时 120 分钟，75 分制。45 分及格，目标 60 分。</p>
    <div class="card hl"><div class="row" style="gap:26px">
      <div><div class="sub">题量</div><div style="font-size:22px;font-weight:700">75 题</div></div>
      <div><div class="sub">时长</div><div style="font-size:22px;font-weight:700">120 分钟</div></div>
      <div><div class="sub">及格 / 目标</div><div style="font-size:22px;font-weight:700">45 / 60</div></div>
      <span class="spacer"></span>
      <button class="btn" onclick="startMock()">开始模考</button>
      <button class="btn ghost" onclick="startMock(30)">30 题快测</button>
    </div></div>
    ${hist.length ? `<h2>历史成绩</h2><table><tr><th>时间</th><th>得分</th><th>正确</th><th>结论</th></tr>
      ${hist.map(h => `<tr><td>${esc(h.t)}</td><td class="num">${h.score}/75</td><td class="num">${h.ok}/${h.n}</td><td class="${h.score >= 45 ? 'pass' : 'fail'}">${h.score >= 60 ? '稳' : h.score >= 45 ? '刚过线' : '还需努力'}</td></tr>`).join('')}</table>` : ''}
    <h2>模考怎么用</h2>
    <div class="card"><ul style="margin-left:18px;display:grid;gap:6px;color:#c7d1db">
      <li>不会的题先标记，凭第一印象选一个，别空着——空着必然 0 分。</li>
      <li>一题超过 2 分钟就跳，75 题平均 1.6 分钟一题。</li>
      <li>交卷后看「失分最多的模块」，直接跳过去专项练。</li>
      <li>第 5 天至少做 2 次完整 75 题，把时间感练出来。</li>
    </ul></div>`;
  }
  window.startMock = function (n) {
    const target = n || 75;
    const totalW = Object.values(MOCK_W).reduce((a, b) => a + b, 0);
    let list = [];
    const picked = {};
    Object.keys(MOCK_W).forEach(mid => {
      const cnt = Math.max(1, Math.round(target * MOCK_W[mid] / totalW));
      shuffle(questionsOf(mid)).slice(0, cnt).forEach(q => { if (!picked[q.id]) { list.push(q); picked[q.id] = 1; } });
    });
    if (list.length < target) {
      shuffle(QUESTIONS).forEach(q => { if (list.length < target && !picked[q.id]) { list.push(q); picked[q.id] = 1; } });
    }
    list = shuffle(list).slice(0, target);
    mockState = { list, picks: {}, idx: 0, phase: 'run', started: Date.now() };
    mockSec = target >= 75 ? 120 * 60 : Math.round(target * 1.6 * 60);
    tab = 'mock'; render();
  };
  function mockRemaining() {
    const used = Math.floor((Date.now() - mockState.started) / 1000);
    return Math.max(0, mockSec - used);
  }
  function mountMock() {
    clearInterval(mockTimer);
    const holder = document.getElementById('mockRun');
    if (!holder) return;
    holder.innerHTML = `<div class="card" style="position:sticky;top:56px;z-index:10">
      <div class="row"><b>模拟考试</b><span class="pill">${mockState.list.length} 题</span>
      <span class="spacer"></span><span class="timer" id="tmr">--:--</span>
      <button class="btn ghost sm" onclick="abandonMock()">放弃</button>
      <button class="btn" onclick="submitMock()">交卷</button></div></div>
      <div class="grid" style="grid-template-columns:1fr;gap:14px"><div id="mockQ"></div>
      <div class="card"><b>答题卡</b><div class="qlist" id="mockList" style="margin-top:10px"></div></div></div>`;
    tick(); mockTimer = setInterval(tick, 1000);
    renderMockQ();
  }
  window.abandonMock = function () { clearInterval(mockTimer); mockState = null; render(); };
  function tick() {
    if (!mockState || mockState.phase !== 'run') { clearInterval(mockTimer); return; }
    const r = mockRemaining();
    const el = document.getElementById('tmr');
    if (el) { el.textContent = pad(Math.floor(r / 60)) + ':' + pad(r % 60); el.classList.toggle('warn', r < 300); }
    if (r <= 0) submitMock();
  }
  function renderMockQ() {
    const q = mockState.list[mockState.idx];
    const sel = mockState.picks[q.id];
    const box = document.getElementById('mockQ');
    box.innerHTML = `<div class="qwrap">
      <div class="qmeta"><span class="pill">${esc((M[q.m] || {}).name || q.m)}</span><span class="spacer"></span><span>第 ${mockState.idx + 1} / ${mockState.list.length} 题</span></div>
      <div class="qtext">${esc(q.q)}</div>
      <div class="opts">${q.o.map((o, i) => `<button class="opt ${sel === i ? 'right' : ''}" onclick="mockPick(${i})"><span class="k">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="row" style="margin-top:16px">
        <button class="btn ghost" onclick="mockNav(-1)" ${mockState.idx === 0 ? 'disabled' : ''}>← 上一题</button>
        <button class="btn" onclick="mockNav(1)">下一题 →</button>
        <span class="spacer"></span><button class="btn ghost sm" onclick="submitMock()">交卷</button>
      </div></div>`;
    renderMockList();
  }
  function renderMockList() {
    const el = document.getElementById('mockList'); if (!el) return;
    el.innerHTML = mockState.list.map((q, i) => `<button class="qitem ${mockState.picks[q.id] !== undefined ? 'done' : ''} ${i === mockState.idx ? 'cur' : ''}" onclick="mockGoto(${i})"><span class="n">${i + 1}</span><span>${esc(String(q.q).slice(0, 26))}${String(q.q).length > 26 ? '…' : ''}</span></button>`).join('');
  }
  window.mockPick = function (i) { mockState.picks[mockState.list[mockState.idx].id] = i; renderMockQ(); };
  window.mockNav = function (d) {
    const n = mockState.idx + d;
    if (n < 0 || n >= mockState.list.length) return;
    mockState.idx = n; renderMockQ();
  };
  window.mockGoto = function (i) { mockState.idx = i; renderMockQ(); };
  window.submitMock = function () {
    clearInterval(mockTimer);
    const st = mockState;
    let ok = 0;
    st.list.forEach(q => {
      const p = st.picks[q.id];
      if (p !== undefined) {
        const good = p === q.a;
        if (good) ok++;
        S.picked[q.id] = { i: p, ok: good };
        if (!good) S.wrong[q.id] = (S.wrong[q.id] || 0) + 1;
        else if (S.wrong[q.id]) delete S.wrong[q.id];
      }
    });
    const score = Math.round(ok / st.list.length * 75);
    S.mock.push({ t: todayStr() + ' ' + new Date().toTimeString().slice(0, 5), score, ok, n: st.list.length });
    save();
    const byMod = {};
    st.list.forEach(q => {
      byMod[q.m] = byMod[q.m] || { ok: 0, n: 0 };
      byMod[q.m].n++;
      if (st.picks[q.id] === q.a) byMod[q.m].ok++;
    });
    const rows = Object.keys(byMod).map(mid => ({ mid, ...byMod[mid], name: (M[mid] || {}).name || mid })).sort((a, b) => (a.ok / a.n) - (b.ok / b.n));
    document.getElementById('main').innerHTML = `<h1>模考结果</h1>
      <div class="card hl"><div class="row" style="gap:30px">
        <div><div class="sub">得分（75 分制）</div><div class="score-big ${score >= 45 ? 'pass' : 'fail'}">${score}</div></div>
        <div><div class="sub">答对</div><div style="font-size:26px;font-weight:700">${ok} / ${st.list.length}</div></div>
        <div><div class="sub">结论</div><div style="font-size:20px;font-weight:700" class="${score >= 60 ? 'pass' : 'fail'}">${score >= 60 ? '这个状态能过' : score >= 45 ? '刚过线，再补短板' : '还差 ' + (45 - score) + ' 分'}</div></div>
      </div>
      <hr><div class="row"><button class="btn" onclick="go('wrong')">清错题（${Object.keys(S.wrong).length} 题）</button>
      <button class="btn ghost" onclick="go('mock')">再考一次</button>
      <button class="btn ghost" onclick="go('case')">去练下午案例</button></div></div>
      <h2>分模块得分</h2><table><tr><th>模块</th><th>答对/总数</th><th>得分率</th><th></th></tr>
      ${rows.map(r => `<tr><td>${esc(r.name)}</td><td class="num">${r.ok}/${r.n}</td><td class="num ${r.ok / r.n >= .6 ? 'pass' : 'fail'}">${Math.round(r.ok / r.n * 100)}%</td>
      <td><button class="btn sm ghost" onclick="startQuiz(['${r.mid}'],15)">补这章</button></td></tr>`).join('')}</table>`;
    mockState = null;
    window.scrollTo(0, 0);
  };

  boot();
  async function boot() {
    await pullProfile();
    render();
  }
})();
