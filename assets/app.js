/* ==========================================================
   河北中考领航 · 运行时
   主题 / 进度 / 间隔重复（SRS）/ 词表朗读 / 测验 / 闪卡
   备考倒计时 / XP等级 / 轻音效 / 学习档案备份
   纯前端，localStorage 持久化，向后兼容全部 v1 数据键
   ========================================================== */
(function () {
  'use strict';
  var P = window.HBZK = window.HBZK || {};

  /* ---------------- 工具 ---------------- */
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  P.esc = esc;
  var escRe = function (s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  P.hl = function (t, q) {
    if (!q) return esc(t);
    return esc(t).replace(new RegExp('(' + escRe(q) + ')', 'gi'), '<mark>$1</mark>');
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }

  /* ---------------- Toast 提示 ---------------- */
  var toastEl = null, toastTimer = null;
  P.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  };

  /* ---------------- Web Audio 轻提示音效 ---------------- */
  var sfxOn = load('hbzk-sfx-v1', true);
  var audioCtx = null;
  P.sfxEnabled = function () { return !!sfxOn; };
  P.setSfx = function (on) { sfxOn = !!on; store('hbzk-sfx-v1', sfxOn); };
  P.sfx = function (kind) {
    if (!sfxOn) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      function tone(freq, start, dur, gainVal, type) {
        var o = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(gainVal, start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(start); o.stop(start + dur + 0.02);
      }
      if (kind === 'ok') {
        tone(587.33, now, 0.11, 0.06, 'sine');
        tone(880, now + 0.07, 0.16, 0.06, 'sine');
      } else if (kind === 'bad') {
        tone(240, now, 0.18, 0.05, 'triangle');
      } else if (kind === 'win') {
        tone(523.25, now, 0.13, 0.06, 'sine');
        tone(659.25, now + 0.09, 0.13, 0.06, 'sine');
        tone(783.99, now + 0.18, 0.24, 0.07, 'sine');
      }
    } catch (e) {}
  };

  /* ---------------- 主题（按系统本地时间自动切换：6:00-19:00 浅色，19:00-6:00 深色，支持手动切换） ---------------- */
  var THEME_KEY = 'hbzk-theme-manual';
  function autoThemeByTime() {
    var h = new Date().getHours();
    return (h >= 19 || h < 6) ? 'dark' : 'light';
  }
  function resolveTheme() {
    var m = load(THEME_KEY, null);
    return (m === 'light' || m === 'dark') ? m : autoThemeByTime();
  }
  function applyTheme(t, persist) {
    document.documentElement.setAttribute('data-theme', t);
    if (persist) store(THEME_KEY, t);
    var isManual = !!load(THEME_KEY, null);
    var b = document.querySelector('.theme-btn');
    if (b) {
      b.textContent = t === 'light' ? '☾' : '☀';
      b.setAttribute('aria-label', t === 'light' ? '切换到深色模式' : '切换到浅色模式');
      b.title = (t === 'light' ? '切换到深色模式' : '切换到浅色模式') + (isManual ? '（当前手动设置）' : '（当前随系统时间自动切换）');
    }
  }
  P.theme = function () { return document.documentElement.getAttribute('data-theme') || resolveTheme(); };
  P.toggleTheme = function () { applyTheme(P.theme() === 'light' ? 'dark' : 'light', true); };
  P.resetThemeAuto = function () {
    try { localStorage.removeItem(THEME_KEY); } catch (e) {}
    applyTheme(autoThemeByTime(), false);
  };

  document.documentElement.setAttribute('data-theme', resolveTheme());

  /* ---------------- 考生档案 / 备考倒计时 ---------------- */
  var PROFILE_KEY = 'hbzk-profile-v1';
  var profile = load(PROFILE_KEY, null) || {
    childName: '',
    examDate: '',
    targetGrade: 'merit'
  };
  P.profile = function () { return Object.assign({}, profile); };
  P.saveProfile = function (patch) {
    profile = Object.assign({}, profile, patch || {});
    store(PROFILE_KEY, profile);
    document.dispatchEvent(new CustomEvent('hbzk:profile', { detail: profile }));
    return profile;
  };
  P.daysLeft = function () {
    if (!profile.examDate) return null;
    var t = new Date(profile.examDate + 'T00:00:00');
    if (isNaN(t.getTime())) return null;
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((t.getTime() - now.getTime()) / 86400000);
  };
  P.targetLabel = function (g) {
    var v = g || profile.targetGrade || 'good';
    if (v === 'top') return '冲刺 110+ 分';
    if (v === 'pass') return '稳过 90 分';
    return '100+ 分';
  };

  /* ---------------- 摸底诊断结果 ----------------
     一次性小卷（词汇 + 语法 + 阅读）的答题结果，用来给「完全没有练习记录」
     的学生一个起点：三条线的得分直接决定首页先推哪个模块。
     与日常记录分开存，因为它代表「入学水平」，不该被之后的刷题稀释。 */
  var PLACE_KEY = 'hbzk-placement-v1';
  var placement = load(PLACE_KEY, null);

  P.placement = function () { return placement; };
  P.hasPlacement = function () { return !!(placement && placement.at); };
  P.savePlacement = function (res) {
    placement = Object.assign({ at: Date.now() }, res || {});
    store(PLACE_KEY, placement);
    document.dispatchEvent(new CustomEvent('hbzk:placement', { detail: placement }));
    return placement;
  };
  P.clearPlacement = function () {
    placement = null;
    store(PLACE_KEY, null);
    document.dispatchEvent(new CustomEvent('hbzk:placement', { detail: null }));
  };
  /* 三条线的强弱排序：返回按「越弱越靠前」排好的模块 id 列表。
     没有摸底结果时返回 null，调用方回退到默认顺序（词→语法→错题）。 */
  P.routeOrder = function () {
    if (!placement || !placement.lines) return null;
    var L = placement.lines;
    var arr = [
      { id: 'words', rate: L.words && L.words.rate !== null ? L.words.rate : 1, n: L.words ? L.words.n : 0 },
      { id: 'grammar', rate: L.grammar && L.grammar.rate !== null ? L.grammar.rate : 1, n: L.grammar ? L.grammar.n : 0 },
      { id: 'reading', rate: L.reading && L.reading.rate !== null ? L.reading.rate : 1, n: L.reading ? L.reading.n : 0 },
    ];
    // 没测到的线（n=0）排最后，避免「没测=最弱」的误判
    arr.sort(function (a, b) {
      if ((a.n === 0) !== (b.n === 0)) return a.n === 0 ? 1 : -1;
      return a.rate - b.rate;
    });
    return arr.map(function (x) { return x.id; });
  };

  /* ---------------- 已掌握进度 ---------------- */
  var KNOWN_KEY = 'hbzk-known-v1';
  var known = load(KNOWN_KEY, {}) || {};
  P.isKnown = function (w) { return !!known[String(w).toLowerCase()]; };
  P.toggleKnown = function (w) {
    var k = String(w).toLowerCase();
    if (known[k]) delete known[k]; else known[k] = 1;
    store(KNOWN_KEY, known);
    document.dispatchEvent(new CustomEvent('hbzk:known', { detail: { word: w, on: !!known[k] } }));
    return !!known[k];
  };
  // 背单词判分时调用：设成确定状态，不来回翻转，且状态没变就不广播事件
  P.setKnown = function (w, on) {
    var k = String(w).toLowerCase();
    var had = !!known[k];
    if (on === had) return had;
    if (on) known[k] = 1; else delete known[k];
    store(KNOWN_KEY, known);
    document.dispatchEvent(new CustomEvent('hbzk:known', { detail: { word: w, on: on } }));
    return on;
  };
  P.knownCount = function () { return Object.keys(known).length; };
  P.clearKnown = function () { known = {}; store(KNOWN_KEY, known); document.dispatchEvent(new CustomEvent('hbzk:known', { detail: { reset: true } })); };

  /* ---------------- 间隔重复（SM-2 简化版） ---------------- */
  var SRS_KEY = 'hbzk-srs-v1';
  var srs = load(SRS_KEY, {}) || {};
  var DAY = 86400000;

  P.srsGet = function (w) { return srs[String(w).toLowerCase()] || null; };
  P.srsAll = function () { return srs; };
  P.srsDueCount = function (list) {
    var now = Date.now();
    if (!list) return Object.keys(srs).filter(function (k) { return (srs[k].due || 0) <= now; }).length;
    return list.filter(function (w) {
      var r = srs[String(w).toLowerCase()];
      return !r || (r.due || 0) <= now;
    }).length;
  };
  P.srsStats = function () {
    var now = Date.now(), keys = Object.keys(srs);
    var due = 0, learning = 0, mature = 0, sum = 0;
    keys.forEach(function (k) {
      var r = srs[k];
      if (!r) return;
      if ((r.due || 0) <= now) due++;
      if ((r.ivl || 0) >= 21) mature++; else learning++;
      sum += (r.reps || 0);
    });
    return { total: keys.length, due: due, learning: learning, mature: mature, reviews: sum };
  };

  /* ---------------- 每日学习量 + 连续天数 + 7日趋势 ---------------- */
  var DAYLOG_KEY = 'hbzk-daylog-v1';
  var daylog = load(DAYLOG_KEY, {}) || {};
  var GOAL_KEY = 'hbzk-goal-v1';
  var goal = load(GOAL_KEY, 20) || 20;

  function dayKey(d) {
    var x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }
  P.todayKey = function () { return dayKey(); };
  P.todayWords = function () { return (daylog[dayKey()] || {}).words || 0; };
  P.todayQuestions = function () { return (daylog[dayKey()] || {}).questions || 0; };
  P.goal = function () { return goal; };
  P.setGoal = function (n) {
    goal = Math.max(5, Math.min(200, parseInt(n, 10) || 20));
    store(GOAL_KEY, goal);
    document.dispatchEvent(new CustomEvent('hbzk:daily', { detail: {} }));
    return goal;
  };
  P.todayPct = function () {
    return goal ? Math.min(100, Math.round(P.todayWords() / goal * 100)) : 0;
  };
  P.bumpDay = function (kind, n) {
    var k = dayKey();
    var d = daylog[k] || (daylog[k] = {});
    d[kind] = (d[kind] || 0) + (n || 1);
    store(DAYLOG_KEY, daylog);
    document.dispatchEvent(new CustomEvent('hbzk:daily', { detail: { kind: kind } }));
  };
  P.streak = function () {
    var n = 0, d = new Date();
    for (var i = 0; i < 3660; i++) {
      var rec = daylog[dayKey(d)];
      var active = rec && ((rec.words || 0) + (rec.questions || 0) > 0);
      if (!active && i === 0) { d.setDate(d.getDate() - 1); continue; }
      if (!active) break;
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  };
  P.last7Days = function () {
    var out = [];
    var d = new Date();
    for (var i = 6; i >= 0; i--) {
      var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
      var k = dayKey(x);
      var rec = daylog[k] || {};
      var words = rec.words || 0;
      var questions = rec.questions || 0;
      out.push({
        key: k,
        label: (x.getMonth() + 1) + '/' + x.getDate(),
        words: words,
        questions: questions,
        total: words + questions
      });
    }
    return out;
  };
  P.resetDaily = function () { daylog = {}; store(DAYLOG_KEY, daylog); };

  /* ---------------- 8周计划打卡 ---------------- */
  var PLAN_KEY = 'hbzk-plan-v1';
  var planDoneMap = load(PLAN_KEY, {}) || {};
  P.planDone = function (w) { return !!planDoneMap[String(w)]; };
  P.togglePlanWeek = function (w) {
    var k = String(w);
    if (planDoneMap[k]) delete planDoneMap[k]; else planDoneMap[k] = Date.now();
    store(PLAN_KEY, planDoneMap);
    document.dispatchEvent(new CustomEvent('pet:plan', { detail: { week: w, done: !!planDoneMap[k] } }));
    return !!planDoneMap[k];
  };
  P.planCompletedCount = function () { return Object.keys(planDoneMap).length; };

  /* ---------------- 单词错题本 ---------------- */
  var WBOOK_KEY = 'hbzk-wordbook-v1';
  var wbook = load(WBOOK_KEY, {}) || {};
  /* 错题出本门槛：连续答对 3 次。英语错词需要多次复现才真记住，
     只对 1–2 次就移出，等于「看一眼就过掉」。与 SRS 阶梯（1→3→7 天）
     的前三次复现对齐。 */
  var MASTER_STREAK = 3;

  P.wordBook = function () { return wbook; };
  P.wordBookList = function () {
    return Object.keys(wbook).map(function (k) {
      var r = wbook[k];
      return { w: k, wrong: r.wrong || 1, right: r.right || 0, last: r.last || 0, at: r.at || 0 };
    }).sort(function (a, b) { return b.at - a.at; });
  };
  P.wordBookCount = function () { return Object.keys(wbook).length; };
  P.wordAttempt = function (w, ok) {
    var k = String(w).toLowerCase();
    if (!ok) {
      var r = wbook[k] || { wrong: 0, right: 0, at: 0 };
      r.wrong = (r.wrong || 0) + 1;
      r.right = 0;
      r.at = Date.now();
      r.last = r.at;
      wbook[k] = r;
      store(WBOOK_KEY, wbook);
      document.dispatchEvent(new CustomEvent('pet:wordbook', { detail: { word: w, ok: false } }));
      return false;
    }
    var e = wbook[k];
    if (!e) return false;
    e.right = (e.right || 0) + 1;
    e.last = Date.now();
    var mastered = e.right >= MASTER_STREAK;
    if (mastered) delete wbook[k];
    store(WBOOK_KEY, wbook);
    document.dispatchEvent(new CustomEvent('pet:wordbook', { detail: { word: w, ok: true, mastered: mastered } }));
    return mastered;
  };
  P.wordMaster = function (w) {
    var k = String(w).toLowerCase();
    if (!wbook[k]) return false;
    delete wbook[k];
    store(WBOOK_KEY, wbook);
    document.dispatchEvent(new CustomEvent('pet:wordbook', { detail: { word: w, ok: true, mastered: true } }));
    return true;
  };
  P.wordBookReset = function () {
    wbook = {};
    store(WBOOK_KEY, wbook);
    document.dispatchEvent(new CustomEvent('pet:wordbook', { detail: { reset: true } }));
  };
  P.MASTER_STREAK = MASTER_STREAK;

  P.srsRate = function (w, grade) {
    P.wordAttempt(w, grade >= 2);
    var k = String(w).toLowerCase();
    var r = srs[k] || { ease: 2.5, ivl: 0, due: 0, reps: 0, lapses: 0 };
    if (grade === 0) {
      r.ease = Math.max(1.3, r.ease - 0.2);
      r.ivl = 0;
      r.lapses = (r.lapses || 0) + 1;
      r.due = Date.now() + 10 * 60000;
    } else {
      if (grade === 1) r.ease = Math.max(1.3, r.ease - 0.15);
      if (grade === 3) r.ease = Math.min(3.2, r.ease + 0.15);
      if (r.reps === 0) r.ivl = grade === 1 ? 0.5 : grade === 2 ? 1 : 2;
      else if (r.reps === 1) r.ivl = grade === 1 ? 1 : grade === 2 ? 3 : 5;
      else r.ivl = Math.max(1, Math.round(r.ivl * r.ease * (grade === 1 ? 0.8 : grade === 3 ? 1.25 : 1)));
      r.due = Date.now() + r.ivl * DAY;
    }
    r.reps = (r.reps || 0) + 1;
    r.last = Date.now();
    // 准确率计数：ans 累计作答，okc 累计答对；「有点模糊」(g=1) 是模糊自评，不计入分子分母
    if (grade !== 1) {
      r.ans = (r.ans || 0) + 1;
      if (grade >= 2) r.okc = (r.okc || 0) + 1;
    }
    srs[k] = r;
    store(SRS_KEY, srs);
    P.bumpDay('words', 1);
    document.dispatchEvent(new CustomEvent('hbzk:srs', { detail: { word: w } }));
    return r;
  };
  // 按给定词表统计背词准确率；不传则统计全部学过的词
  P.wordAccStats = function (list) {
    var ans = 0, okc = 0;
    var keys = list ? list.map(function (w) { return String(w.w || w).toLowerCase(); }) : Object.keys(srs);
    keys.forEach(function (k) {
      var r = srs[k];
      if (!r) return;
      ans += r.ans || 0;
      okc += r.okc || 0;
    });
    return { answered: ans, correct: okc, rate: ans ? okc / ans : null };
  };
  P.srsReset = function () { srs = {}; store(SRS_KEY, srs); document.dispatchEvent(new CustomEvent('hbzk:srs', { detail: { reset: true } })); };

  /* ---------------- 答题记录 ---------------- */
  var QLOG_KEY = 'hbzk-qlog-v2';
  var qlog = load(QLOG_KEY, null);
  if (!qlog || typeof qlog !== 'object' || !qlog.topicStats) {
    var legacy = qlog && qlog.topicStats === undefined ? qlog : {};
    qlog = { topicStats: {}, wrongIds: {} };
    Object.keys(legacy).forEach(function (t) {
      var r = legacy[t];
      if (r && typeof r.n === 'number') qlog.topicStats[t] = { n: r.n, ok: r.ok || 0 };
    });
  }
  if (!qlog.qdue) qlog.qdue = {};
  P.qLog = function () { return qlog; };
  // 语法题按题排期（间隔重复）：qdue[qid] = { due, ivl, reps, lapses, last }
  var qdue = qlog.qdue = qlog.qdue || {};
  var Q_IVL = [0.5, 1, 3, 7, 21, 60];   // 天：连续答对的间隔阶梯
  P.qDue = function (id) { return qdue[id] || null; };
  P.qDueMap = function () { return qdue; };
  var Q_MASTER_STREAK = 3;   // 错题连续答对 3 次才移出错题本（与错词门槛一致）
  P.qRecord = function (topic, ok, id) {
    var r = qlog.topicStats[topic] = qlog.topicStats[topic] || { n: 0, ok: 0 };
    r.n++;
    if (ok) r.ok++;
    if (id) {
      // 错题出本不看「答对一次」，而看「连续答对几次」：
      // 只对一次就移出，学生下次遇到同题照样错，这正是错题本失效的主因。
      var wr = qlog.wrongIds[id];
      if (ok) {
        if (wr) {
          wr.right = (wr.right || 0) + 1;
          if (wr.right >= Q_MASTER_STREAK) delete qlog.wrongIds[id];
        }
      } else {
        qlog.wrongIds[id] = { t: topic, at: (wr && wr.at) || Date.now(), right: 0, times: ((wr && wr.times) || 0) + 1 };
      }
      // 排期：答错立即回到第一级（半小时后即可再练）；答对逐级拉长间隔
      var d = qdue[id] || { due: 0, ivl: 0, reps: 0, lapses: 0 };
      if (ok) {
        d.reps = (d.reps || 0) + 1;
        var lv = Math.min(d.reps, Q_IVL.length) - 1;
        d.ivl = Q_IVL[lv];
        d.due = Date.now() + d.ivl * 86400000;
      } else {
        d.reps = 0;
        d.lapses = (d.lapses || 0) + 1;
        d.ivl = Q_IVL[0];
        d.due = Date.now() + 30 * 60000;
      }
      d.last = Date.now();
      qdue[id] = d;
    }
    store(QLOG_KEY, qlog);
    P.bumpDay('questions', 1);
    document.dispatchEvent(new CustomEvent('hbzk:qlog', { detail: { topic: topic, ok: ok, id: id } }));
  };
  P.qTopicStats = function () {
    var out = [];
    Object.keys(qlog.topicStats).forEach(function (t) {
      var r = qlog.topicStats[t];
      out.push({ topic: t, n: r.n, ok: r.ok, rate: r.n ? r.ok / r.n : 0 });
    });
    return out;
  };
  P.wrongIds = function () { return Object.keys(qlog.wrongIds || {}); };
  P.qMasterStreak = Q_MASTER_STREAK;
  /* 某道错题当前「连对 / 目标」进度；用于错题本展示与移出提示 */
  P.qWrongInfo = function (id) {
    var wr = qlog.wrongIds[id];
    if (!wr) return null;
    return { right: wr.right || 0, need: Q_MASTER_STREAK, times: wr.times || 1, at: wr.at || 0 };
  };
  P.qClearWrong = function (id) {
    if (id) delete qlog.wrongIds[id]; else qlog.wrongIds = {};
    store(QLOG_KEY, qlog);
  };
  P.qReset = function () { qlog = { topicStats: {}, wrongIds: {}, qdue: {}, skillStats: {} }; qdue = qlog.qdue; store(QLOG_KEY, qlog); };

  /* ---------------- 统一的「下次复习」查询 ----------------
     错词走 SRS（srs[k].due），错题走题目排期（qdue[id].due）。
     错题本原来只看「加入时间」，于是排期算出来的日期根本没人用——
     学生看到的顺序和系统算的顺序是两套。这里统一成一个入口，
     让错题本能按「真正该复习的那天」排序与筛选。 */
  P.nextDue = function (key, kind) {
    var k = String(key).toLowerCase();
    if (kind === 'word') {
      var s = srs[k];
      return s && s.due ? s.due : null;
    }
    var d = qdue[key];
    return d && d.due ? d.due : null;
  };
  P.isDue = function (key, kind, now) {
    var t = P.nextDue(key, kind);
    return t === null ? true : t <= (now || Date.now());
  };
  /* 到期日的短标签：今天 / 明天 / N 天后 / 已过期 N 天 */
  P.dueLabel = function (ts, now) {
    if (!ts) return '';
    var t0 = now || Date.now();
    var d0 = new Date(t0); d0.setHours(0, 0, 0, 0);
    var d1 = new Date(ts); d1.setHours(0, 0, 0, 0);
    var diff = Math.round((d1 - d0) / DAY);
    if (diff < 0) return '已过期 ' + (-diff) + ' 天';
    if (diff === 0) return '今天该复习';
    if (diff === 1) return '明天复习';
    return diff + ' 天后';
  };
  /* 全站到期总数（错词 + 错题），首页与诊断页共用 */
  P.dueTotals = function () {
    var now = Date.now(), w = 0, q = 0;
    Object.keys(wbook).forEach(function (k) {
      if (P.isDue(k, 'word', now)) w++;
    });
    Object.keys(qlog.wrongIds || {}).forEach(function (id) {
      if (P.isDue(id, 'q', now)) q++;
    });
    return { words: w, questions: q, total: w + q };
  };

  /* ---------------- 篇章题：能力维度统计与错题收录 ----------------
     篇章题不按语法考点，而按「阅读能力」统计：detail 细节定位 / inference 推理判断 /
     mainidea 主旨观点 / context 上下文逻辑 / collocation 固定搭配 / grammar 语法词形。
     与语法题共用错题本（wrongIds）与每日题量，但单独记能力维度。 */
  var SKILL_NAME = {
    detail: '细节定位',
    inference: '推理判断',
    mainidea: '主旨与观点',
    context: '上下文逻辑',
    collocation: '固定搭配',
    grammar: '语法与词形'
  };
  P.skillName = function (k) { return SKILL_NAME[k] || k; };
  if (!qlog.skillStats) qlog.skillStats = {};
  P.pRecord = function (skill, ok, id) {
    var key = skill || 'detail';
    var r = qlog.skillStats[key] = qlog.skillStats[key] || { n: 0, ok: 0 };
    r.n++;
    if (ok) r.ok++;
    if (id) {
      var wr = qlog.wrongIds[id];
      if (ok) {
        if (wr) {
          wr.right = (wr.right || 0) + 1;
          if (wr.right >= Q_MASTER_STREAK) delete qlog.wrongIds[id];
        }
      } else {
        qlog.wrongIds[id] = { t: key, at: (wr && wr.at) || Date.now(), kind: 'passage', right: 0, times: ((wr && wr.times) || 0) + 1 };
      }
    }
    store(QLOG_KEY, qlog);
    P.bumpDay('questions', 1);
    document.dispatchEvent(new CustomEvent('hbzk:qlog', { detail: { skill: key, ok: ok, id: id } }));
  };
  P.pSkillStats = function () {
    var out = [];
    Object.keys(qlog.skillStats || {}).forEach(function (k) {
      var r = qlog.skillStats[k];
      out.push({ skill: k, name: SKILL_NAME[k] || k, n: r.n, ok: r.ok, rate: r.n ? r.ok / r.n : 0 });
    });
    return out;
  };
  P.pTotal = function () {
    var n = 0, ok = 0;
    Object.keys(qlog.skillStats || {}).forEach(function (k) {
      n += qlog.skillStats[k].n; ok += qlog.skillStats[k].ok;
    });
    return { n: n, ok: ok, rate: n ? ok / n : 0 };
  };

  /* ---------------- 学习等级与 XP 激励 ---------------- */
  P.levelInfo = function () {
    var srsSt = P.srsStats();
    var qSt = P.qTopicStats();
    var qTotal = qSt.reduce(function (a, x) { return a + x.n; }, 0);
    var xp = srsSt.total * 5 + P.knownCount() * 2 + qTotal * 8 + P.streak() * 20;
    var tiers = [
      { lv: 1, name: '中考萌新', min: 0 },
      { lv: 2, name: '词海探索者', min: 150 },
      { lv: 3, name: '语法小达人', min: 500 },
      { lv: 4, name: '中考冲刺手', min: 1200 },
      { lv: 5, name: '卓越挑战者', min: 2800 },
      { lv: 6, name: '中考英语学霸', min: 5500 }
    ];
    var cur = tiers[0];
    for (var i = 0; i < tiers.length; i++) {
      if (xp >= tiers[i].min) cur = tiers[i];
    }
    return { lv: cur.lv, name: cur.name, xp: xp };
  };

  /* ---------------- 学习档案备份 ---------------- */
  P.exportBackup = function () {
    var data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      known: known,
      srs: srs,
      daylog: daylog,
      goal: goal,
      wbook: wbook,
      qlog: qlog,
      profile: profile,
      plan: planDoneMap,
      placement: placement
    };
    return JSON.stringify(data, null, 2);
  };

  P.importBackup = function (raw) {
    var d = JSON.parse(raw);
    if (!d || typeof d !== 'object') throw new Error('无效的备份文件');
    if (d.known) { known = d.known; store(KNOWN_KEY, known); }
    if (d.srs) { srs = d.srs; store(SRS_KEY, srs); }
    if (d.daylog) { daylog = d.daylog; store(DAYLOG_KEY, daylog); }
    if (d.goal) { goal = d.goal; store(GOAL_KEY, goal); }
    if (d.wbook) { wbook = d.wbook; store(WBOOK_KEY, wbook); }
    if (d.qlog) { qlog = d.qlog; store(QLOG_KEY, qlog); }
    if (d.profile) { profile = Object.assign(profile, d.profile); store(PROFILE_KEY, profile); }
    if (d.plan) { planDoneMap = d.plan; store(PLAN_KEY, planDoneMap); }
    if (d.placement !== undefined) { placement = d.placement; store(PLACE_KEY, placement); }
    P.toast('学习档案已恢复，正在刷新页面…');
    setTimeout(function () { location.reload(); }, 600);
  };

  /* ---------------- 全局弹窗（考试倒计时设置） ---------------- */
  function ensureModals() {
    if (document.getElementById('hbzkExamModal')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="modal-backdrop" id="hbzkExamModal" role="dialog" aria-modal="true" aria-labelledby="examModalTitle">' +
        '<div class="modal-box">' +
          '<button class="modal-close" data-close="hbzkExamModal" aria-label="关闭">✕</button>' +
          '<span class="kicker">个性化备考设置</span>' +
          '<h3 id="examModalTitle">设置中考倒计时与目标分数</h3>' +
          '<p class="modal-sub">设定目标后，首页学习面板与备考计划会自动匹配冲刺节奏。</p>' +
          '<div class="form-row"><label for="exChildName">昵称（选填）</label><input class="field" id="exChildName" type="text" placeholder="例如：乐乐 / Alex" maxlength="20"></div>' +
          '<div class="form-row"><label for="exDate">预计中考英语考试日期</label><input class="field" id="exDate" type="date"></div>' +
          '<div class="form-row"><label for="exGrade">目标成绩档位</label>' +
            '<select class="field" id="exGrade">' +
              '<option value="pass">稳过 90 分（基础题全拿下）</option>' +
              '<option value="good">目标 100+ 分（多数同学的现实目标）</option>' +
              '<option value="top">冲刺 110+ 分（冲重点高中）</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">' +
            '<button class="btn ghost sm" data-close="hbzkExamModal">取消</button>' +
            '<button class="btn primary sm" id="exSaveBtn">保存设置</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = document.getElementById(b.getAttribute('data-close'));
        if (m) m.classList.remove('open');
      });
    });
    wrap.querySelectorAll('.modal-backdrop').forEach(function (bd) {
      bd.addEventListener('click', function (e) {
        if (e.target === bd) bd.classList.remove('open');
      });
    });

    document.getElementById('exSaveBtn').addEventListener('click', function () {
      var name = (document.getElementById('exChildName').value || '').trim();
      var date = document.getElementById('exDate').value || '';
      var grade = document.getElementById('exGrade').value || 'merit';
      P.saveProfile({ childName: name, examDate: date, targetGrade: grade });
      P.toast('✓ 备考档案已更新');
      document.getElementById('hbzkExamModal').classList.remove('open');
    });
  }

  P.openExamModal = function () {
    ensureModals();
    document.getElementById('exChildName').value = profile.childName || '';
    document.getElementById('exDate').value = profile.examDate || '';
    document.getElementById('exGrade').value = profile.targetGrade || 'merit';
    document.getElementById('hbzkExamModal').classList.add('open');
  };

  /* ---------------- DOM 就绪 ---------------- */
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  P.ready = ready;

  ready(function () {
    document.body.classList.add('js-ready');

    var tb = document.querySelector('.theme-btn');
    if (tb) tb.addEventListener('click', P.toggleTheme);
    applyTheme(resolveTheme(), false);

    function syncAutoTheme() {
      if (!load(THEME_KEY, null)) {
        var autoT = autoThemeByTime();
        if (P.theme() !== autoT) applyTheme(autoT, false);
      }
    }
    setInterval(syncAutoTheme, 60000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) syncAutoTheme();
    });

    document.querySelectorAll('[data-open-exam]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        P.openExamModal();
      });
    });

    /* 移动菜单 */
    var mb = document.querySelector('.menu-btn');
    var nav = document.querySelector('.hdr-nav');
    if (mb && nav) {
      mb.addEventListener('click', function (e) {
        e.stopPropagation();
        nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', nav.classList.contains('open'));
      });
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && e.target !== mb) nav.classList.remove('open');
      });
    }

    /* 当前页高亮 */
    var path = location.pathname.split('/').pop() || 'index.html';
    var dir = location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean).pop() || '';
    document.querySelectorAll('.hdr-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var parts = href.split('/');
      var file = parts.pop();
      var folder = parts.filter(function (p) { return p && p !== '..'; }).pop() || '';
      var match = file === 'index.html'
        ? (folder ? folder === dir : (path === 'index.html' || path === ''))
        : (file === path);
      if (match) {
        document.querySelectorAll('.hdr-nav a').forEach(function (x) { x.classList.remove('on'); });
        a.classList.add('on');
      }
    });

    /* 阅读进度 */
    var sp = document.querySelector('.scroll-progress');
    if (sp) {
      var onScroll = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        sp.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      };
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* 数字滚动 */
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
      var animateCount = function (el) {
        if (el.__animated) return;
        el.__animated = 1;
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var dec = (el.getAttribute('data-count') || '').indexOf('.') >= 0 ? 1 : 0;
        var finalText = dec ? target.toFixed(1) : target.toLocaleString('en-US');
        var t0 = performance.now(), dur = 850;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          if (p >= 1) { el.textContent = finalText; return; }
          var v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = dec ? v.toFixed(1) : Math.round(v).toLocaleString('en-US');
          requestAnimationFrame(tick);
        })(t0);
        // rAF 被节流时，1.1s 后强制落终值
        setTimeout(function () { el.textContent = finalText; }, dur + 250);
      };
      // 直接落终值（不依赖 IO 与 rAF）：保证任何环境下数字都不会停在 0
      counters.forEach(function (c) {
        var t = parseFloat(c.getAttribute('data-count')) || 0;
        var d = (c.getAttribute('data-count') || '').indexOf('.') >= 0 ? 1 : 0;
        c.textContent = d ? t.toFixed(1) : t.toLocaleString('en-US');
      });
      // 再尝试一次滚动动画（可选增强，失败也不影响正确性）
      if (!reduceMotion && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
          });
        }, { threshold: .3 });
        counters.forEach(function (c) { io.observe(c); });
      }
    }

    /* 滚动揭示 */
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var revealNodes = document.querySelectorAll('.reveal');
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.remove('out'); io2.unobserve(e.target); }
        });
      }, { threshold: .06, rootMargin: '0px 0px -30px 0px' });
      revealNodes.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top > window.innerHeight) { n.classList.add('out'); io2.observe(n); }
      });
    }
  });

  /* ==========================================================
     发音播放（预合成英音 MP3，自动适配子目录 data-base）
     ========================================================== */
  function audioMapGet() {
    return (window.HBZK_DATA && window.HBZK_DATA.HBZK_AUDIO) || window.HBZK_AUDIO || {};
  }
  var currentAudio = null;
  var playTimer = null;
  var playToken = 0;

  // 是否可朗读：有预置音频，或浏览器支持语音合成
  var TTS_OK = (typeof window !== 'undefined') && 'speechSynthesis' in window;
  P.hasAudio = function (w) { return !!audioMapGet()[w] || TTS_OK; };
  P.audioSrc = function (w) {
    var rel = audioMapGet()[w];
    if (!rel) return '';
    var base = (document.body && document.body.getAttribute('data-base')) || '';
    return base + rel;
  };

  /* 浏览器语音合成朗读（无预置音频时的回退方案） */
  var ttsVoice = null;
  function pickEnVoice() {
    if (!TTS_OK) return null;
    if (ttsVoice) return ttsVoice;
    var vs = window.speechSynthesis.getVoices() || [];
    // 优先英式，其次任意英语
    var en = vs.filter(function (v) { return /^en(-|_)?/i.test(v.lang || ''); });
    ttsVoice = en.filter(function (v) { return /en[-_]GB/i.test(v.lang); })[0] || en[0] || null;
    return ttsVoice;
  }
  if (TTS_OK) {
    try { window.speechSynthesis.onvoiceschanged = function () { ttsVoice = null; pickEnVoice(); }; } catch (e) {}
  }

  P.speak = function (text, opts) {
    if (!TTS_OK || !text) return false;
    var o = opts || {};
    var times = o.times || 1;
    var gap = o.gap == null ? 260 : o.gap;
    try {
      var token = ++playToken;
      window.speechSynthesis.cancel();
      var v = pickEnVoice();
      var n = 0;
      function once() {
        if (token !== playToken) return;
        var u = new SpeechSynthesisUtterance(String(text));
        u.lang = (v && v.lang) || 'en-GB';
        if (v) u.voice = v;
        u.rate = o.rate == null ? 0.92 : o.rate;
        u.pitch = 1;
        u.onend = function () {
          if (token !== playToken) return;
          n++;
          if (n < times) {
            playTimer = setTimeout(function () {
              if (token !== playToken) return;
              once();
            }, gap);
          } else if (o.onend) {
            o.onend();
          }
        };
        try { window.speechSynthesis.speak(u); } catch (e) {}
      }
      once();
      return true;
    } catch (e) {
      return false;
    }
  };

  /* 按文本内容朗读：先查预置音频（Edge TTS 生成的 mp3），没有再用浏览器 TTS 回退。
     映射由 tools/gen_audio.py 生成，key 为文本的前 10 位 md5。 */
  P.say = function (text, opts) {
    var t = String(text || '').trim();
    if (!t) return false;
    var map = audioMapGet();
    var rel = map && map[t];
    if (!rel) return P.speak(t, opts);
    var o = opts || {};
    var times = o.times || 1;
    var gap = o.gap == null ? 260 : o.gap;
    var base = (document.body && document.body.getAttribute('data-base')) || '';
    try {
      var token = ++playToken;
      if (playTimer) { clearTimeout(playTimer); playTimer = null; }
      var a = currentAudio || (currentAudio = new Audio());
      a.onended = null;
      try { a.pause(); } catch (e) {}
      a.src = base + rel;
      a.volume = o.volume == null ? 1 : o.volume;
      var played = 0;
      a.onended = function () {
        if (token !== playToken) return;
        played++;
        if (played < times) {
          playTimer = setTimeout(function () {
            if (token !== playToken) return;
            try { a.currentTime = 0; a.play().catch(function () {}); } catch (e) {}
          }, gap);
        } else if (o.onend) { o.onend(); }
      };
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () {});
      return true;
    } catch (e) {
      return P.speak(t, opts);
    }
  };

  P.playWord = function (w, opts) {
    var src = P.audioSrc(w);
    if (!src) return P.speak(w, opts);
    var o = opts || {};
    var times = o.times || 3;
    var gap = o.gap == null ? 260 : o.gap;
    try {
      var token = ++playToken;
      if (playTimer) { clearTimeout(playTimer); playTimer = null; }
      var a = currentAudio || (currentAudio = new Audio());
      a.onended = null;
      try { a.pause(); } catch (e) {}
      a.src = src;
      a.volume = o.volume == null ? 1 : o.volume;
      var played = 0;
      a.onended = function () {
        if (token !== playToken) return;
        played++;
        if (played < times) {
          playTimer = setTimeout(function () {
            if (token !== playToken) return;
            try { a.currentTime = 0; a.play().catch(function () {}); } catch (e) {}
          }, gap);
        } else if (o.onend) {
          o.onend();
        }
      };
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      return true;
    } catch (e) {
      return false;
    }
  };
  P.stopAudio = function () {
    playToken++;
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    if (currentAudio) {
      try { currentAudio.onended = null; currentAudio.pause(); } catch (e) {}
    }
    if (TTS_OK) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  };

  /* ==========================================================
     单词列表渲染（词表页 / 话题页共用，支持一键英音朗读与掌握标记）
     ========================================================== */
  P.renderWordList = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var all = (opts.words || []).slice().sort(function (a, b) {
      var fa = a.frq || 999999, fb = b.frq || 999999;
      if (fa !== fb) return fa - fb;
      return a.w.toLowerCase() < b.w.toLowerCase() ? -1 : 1;
    });
    var pageSize = opts.pageSize || 40;
    var page = 0;
    var query = '';
    var filter = opts.initialFilter || 'all';

    function match(w) {
      if (filter === 'b1' && w.tag !== 'b1') return false;
      if (filter === 'b2' && w.tag !== 'b2') return false;
      if (filter === 'b3' && w.tag !== 'b3') return false;
      if (filter === 'phrase' && w.t !== 'phrase') return false;
      if (filter === 'known' && !P.isKnown(w.w)) return false;
      if (filter === 'new' && P.isKnown(w.w)) return false;
      if (!query) return true;
      var q = query.toLowerCase();
      if (w.w.toLowerCase().indexOf(q) >= 0) return true;
      if ((w.zh || '').indexOf(query) >= 0) return true;
      return (w.al || []).some(function (a) { return a.toLowerCase().indexOf(q) >= 0; });
    }

    function rowHtml(w) {
      var tagCls = w.tag === 'b1' ? 'tag-b1' : w.tag === 'b2' ? 'tag-b2' : 'tag-b3';
      var tagTxt = w.tag === 'b1' ? '核心高频' : w.tag === 'b2' ? '中频主力' : '拓展词';
      var isK = P.isKnown(w.w);
      var canPlay = P.hasAudio(w.w);
      var h = '<div class="wrow' + (isK ? ' known' : '') + '" data-w="' + esc(w.w) + '">';
      var al = (w.al && w.al.length) ? '<span class="ph">= ' + esc(w.al[0]) + '</span>' : '';
      h += '<span class="w-cell">' +
        (canPlay ? '<button class="w-say" data-say="' + esc(w.w) + '" title="听英音朗读" aria-label="朗读 ' + esc(w.w) + '">🔊</button>' : '') +
        '<span class="w">' + P.hl(w.w, query) + al + (w.ph ? '<span class="ph">/' + esc(w.ph) + '/</span>' : '') + '</span>' +
        '</span>';
      h += '<span class="pos">' + esc(w.posZh || '') + '</span>';
      h += '<span class="zh">' + P.hl(w.zh, query) + '</span>';
      h += '<span class="w-right">' +
        '<span class="flag ' + tagCls + '">' + tagTxt + '</span>' +
        '<button class="known-pill" data-kbtn="' + esc(w.w) + '">' + (isK ? '✓ 已掌握' : '标掌握') + '</button>' +
        '</span>';
      if (w.ex && w.ex.length) h += '<span class="ex">' + esc(w.ex[0]) + '</span>';
      h += '</div>';
      return h;
    }

    function draw() {
      var list = all.filter(match);
      var total = Math.ceil(list.length / pageSize) || 1;
      if (page >= total) page = total - 1;
      if (page < 0) page = 0;
      var slice = list.slice(page * pageSize, (page + 1) * pageSize);
      var html = '<div class="wordlist">' + slice.map(rowHtml).join('') + '</div>';
      if (!list.length) {
        html = '<div class="empty"><b>没有找到匹配的词条</b>换个中英文关键词或筛选条件试试</div>';
      }
      var pager = '';
      if (list.length > pageSize) {
        pager = '<div class="pager">';
        pager += '<button data-pg="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>‹</button>';
        var pages = [];
        if (total <= 9) { for (var i = 0; i < total; i++) pages.push(i); }
        else {
          pages = [0];
          if (page > 2) pages.push('…');
          for (var j = Math.max(1, page - 1); j <= Math.min(total - 2, page + 1); j++) pages.push(j);
          if (page < total - 3) pages.push('…');
          pages.push(total - 1);
        }
        pages.forEach(function (p) {
          if (p === '…') pager += '<span class="pager dots">…</span>';
          else pager += '<button data-pg="' + p + '"' + (p === page ? ' class="on"' : '') + '>' + (p + 1) + '</button>';
        });
        pager += '<button data-pg="' + (page + 1) + '"' + (page === total - 1 ? ' disabled' : '') + '>›</button>';
        pager += '</div>';
      }
      var count = '<div class="note" style="margin-top:14px">共 <b>' + list.length + '</b> 条' +
        (list.length !== all.length ? '（已筛选，总计 ' + all.length + '）' : '') +
        ' · 第 ' + (page + 1) + ' / ' + total + ' 页 · 点击 🔊 听英音朗读，点右侧按钮标记掌握</div>';
      host.innerHTML = html + pager + count;

      host.querySelectorAll('[data-say]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          P.playWord(b.getAttribute('data-say'), { times: 1 });
        });
      });
      host.querySelectorAll('[data-kbtn], .wrow .w').forEach(function (el) {
        el.addEventListener('click', function () {
          var row = el.closest('.wrow');
          var w = row.getAttribute('data-w');
          var on = P.toggleKnown(w);
          row.classList.toggle('known', on);
          var btn = row.querySelector('.known-pill');
          if (btn) btn.textContent = on ? '✓ 已掌握' : '标掌握';
          // 在「未掌握 / 已掌握」视图里，标记后该行已不属于当前筛选，稍后重绘把它移出
          if (filter === 'new' || filter === 'known') {
            row.style.transition = 'opacity .25s';
            row.style.opacity = '.35';
            setTimeout(draw, 320);
          }
        });
      });
      host.querySelectorAll('[data-pg]').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = parseInt(b.getAttribute('data-pg'), 10);
          if (!isNaN(p)) { page = p; draw(); window.scrollTo({ top: 180, behavior: 'smooth' }); }
        });
      });
    }

    var tb = document.querySelector(opts.search || '#wq');
    if (tb) {
      var t;
      tb.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { query = tb.value.trim(); page = 0; draw(); }, 140);
      });
    }
    document.querySelectorAll('[data-filter]').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-filter') === filter);
      c.addEventListener('click', function () {
        document.querySelectorAll('[data-filter]').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        filter = c.getAttribute('data-filter');
        page = 0; draw();
      });
    });
    if (opts.onKnown) document.addEventListener('hbzk:known', function () { draw(); });
    draw();
    return { redraw: draw };
  };

  /* ==========================================================
     测验引擎（练语法）
     ========================================================== */
  P.quiz = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var pool = (opts.questions || []).slice();
    if (opts.shuffle !== false) pool = shuffle(pool);
    if (opts.limit) pool = pool.slice(0, opts.limit);
    var i = 0, correct = 0, streak = 0, best = 0, answered = false;
    var total = pool.length;
    var autoNextTimer = null;              // 答对后自动翻页
    var AUTO_NEXT_MS = 780;

    host.innerHTML =
      '<div class="quiz-shell">' +
        '<div class="quiz-top">' +
          '<div class="quiz-progress"><i id="qp"></i></div>' +
          '<span class="quiz-count" id="qc">1 / ' + total + '</span>' +
          '<span class="combo-pill" id="qs">🔥 连击 0</span>' +
        '</div>' +
        '<div id="qbody"></div>' +
      '</div>';

    var body = host.querySelector('#qbody');

    function draw() {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      answered = false;
      var q = pool[i];
      if (!q) return done();
      var typeName = q.type === 'correct' ? '短文改错 · 挑出正确句'
        : q.type === 'fill' ? '短文填空 · 用所给词的适当形式填空'
        : q.type === 'dialogue' ? '情景交际 · 补全对话'
        : q.blind ? '短文填空 · 盲填（无提示词）'
        : '单项选择';
      var stem = esc(q.stem).replace(/___/g, '<span class="blank">　</span>');
      var h = '<div class="qcard">';
      h += '<div class="qmeta"><span class="qtype">' + typeName + '</span>' +
           (q.level ? '<span class="lv ' + esc(q.level) + '">' + esc(q.level) + '</span>' : '') + '</div>';
      h += '<div class="qstem">' + stem + '</div>';

      if (q.type === 'fill') {
        h += '<div class="qfill"><input id="qin" type="text" autocomplete="off" spellcheck="false" placeholder="输入英文答案后按 Enter 提交…">' +
             '<button class="btn primary" id="qsub">提交检查</button></div>';
      } else {
        h += '<div class="qopts">';
        q.options.forEach(function (o, k) {
          h += '<button class="qopt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>';
        });
        h += '</div>';
      }
      h += '<div id="qfb"></div>';
      h += '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="qnext" disabled>下一题 →</button></div>';
      h += '</div>';
      body.innerHTML = h;

      host.querySelector('#qp').style.width = ((i) / total * 100) + '%';
      host.querySelector('#qc').textContent = (i + 1) + ' / ' + total;
      host.querySelector('#qs').textContent = '🔥 连击 ' + streak;

      if (q.type === 'fill') {
        var inp = host.querySelector('#qin');
        inp.focus();
        var submit = function () { judgeFill(q, inp.value); };
        host.querySelector('#qsub').addEventListener('click', submit);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      } else {
        host.querySelectorAll('.qopt').forEach(function (b) {
          b.addEventListener('click', function () { judgeChoice(q, parseInt(b.getAttribute('data-k'), 10)); });
        });
      }
      host.querySelector('#qnext').addEventListener('click', function () { i++; draw(); });
      if (opts.onQuestion) opts.onQuestion(q);
    }

    if (!host.__keys) {
      host.__keys = 1;
      document.addEventListener('keydown', function (e) {
        if (!document.body.contains(host)) return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        var q = pool[i];
        if (!q) return;
        if (/^[1-4]$/.test(e.key) && q.type !== 'fill' && !answered) {
          var btn = host.querySelector('.qopt[data-k="' + (parseInt(e.key, 10) - 1) + '"]');
          if (btn) { e.preventDefault(); btn.click(); }
        } else if (e.key === 'Enter' && answered) {
          // 答对后已经安排了自动翻页，此时 Enter 不应再触发一次，避免连跳两题
          if (autoNextTimer) { e.preventDefault(); return; }
          var nx = host.querySelector('#qnext');
          if (nx && !nx.disabled) { e.preventDefault(); nx.click(); }
        }
      });
    }

    function judgeChoice(q, k) {
      if (answered) return;
      answered = true;
      var ok = k === q.answer;
      host.querySelectorAll('.qopt').forEach(function (b) {
        var bi = parseInt(b.getAttribute('data-k'), 10);
        b.classList.add('locked');
        if (bi === q.answer) b.classList.add('right');
        else if (bi === k) b.classList.add('wrong');
      });
      finish(ok, q);
    }

    function judgeFill(q, val) {
      if (answered) return;
      answered = true;
      var norm = function (s) {
        return String(s).toLowerCase().trim()
          .replace(/[’‘]/g, "'")
          .replace(/[.,!?;:]+$/, '')
          .replace(/\s+/g, ' ');
      };
      var ok = (q.accept || [q.answer]).some(function (a) { return norm(a) === norm(val); });
      var inp = host.querySelector('#qin');
      inp.classList.add(ok ? 'right' : 'wrong');
      inp.readOnly = true;
      host.querySelector('#qsub').disabled = true;
      finish(ok, q, ok ? '' : q.answer);
    }

    function finish(ok, q, refAnswer) {
      if (ok) { correct++; streak++; if (streak > best) best = streak; P.sfx('ok'); }
      else { streak = 0; P.sfx('bad'); }
      host.querySelector('#qs').textContent = '🔥 连击 ' + streak;
      var fb = host.querySelector('#qfb');
      var ref = refAnswer
        ? '<div style="margin-bottom:6px"><b style="display:inline">参考答案：</b><span style="color:var(--ok);font-family:var(--en);font-weight:700;font-size:1rem">' + esc(refAnswer) + '</span></div>'
        : '';
      if (ok) {
        // 答对：给一句确认，然后自动进下一题，不打断节奏
        fb.innerHTML = '<div class="feedback auto-next"><b>✓ 回答正确！' +
          (streak >= 3 ? ' 已连击 ' + streak + ' 题！' : '') +
          '</b><span class="auto-next-hint">即将进入下一题…</span></div>';
      } else {
        // 答错：停住，让用户看完正确答案、解析与干扰项分析
        fb.innerHTML = '<div class="feedback bad"><b>✕ 这题进了错题本，看看解析：</b>' +
          ref + esc(q.why) +
          (q.trap ? '<div class="fb-trap"><b>为什么其他选项不对：</b>' + esc(q.trap) + '</div>' : '') +
          '</div>';
        var nx = host.querySelector('#qnext');
        nx.disabled = false;
        nx.focus();
      }
      // 摸底卷只用来定方向，不计入练习记录，也不往错题本里塞题
      if (!opts.placement && P.qRecord) P.qRecord(q.topic, ok, q.id);
      if (opts.onAnswer) opts.onAnswer(q, ok);
      if (ok) {
        clearTimeout(autoNextTimer);
        autoNextTimer = setTimeout(function () {
          if (!document.body.contains(host)) return;
          i++;
          draw();
        }, AUTO_NEXT_MS);
      }
    }

    function done() {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      P.sfx('win');
      var rate = total ? Math.round(correct / total * 100) : 0;
      var badge = rate >= 90 ? '🏆 卓越表现！' : rate >= 75 ? '🌟 稳步提升！' : '💪 发现薄弱点就是进步！';
      host.querySelector('#qp').style.width = '100%';
      body.innerHTML = '<div class="qcard" style="text-align:center;justify-content:center">' +
        '<div class="kicker">本轮精练完成</div>' +
        '<div style="font-size:1.15rem;font-weight:700;margin-bottom:6px">' + badge + '</div>' +
        '<div style="font-family:var(--display);font-size:3.2rem;font-weight:800;color:var(--accent);margin:6px 0">' + rate + '<span style="font-size:1.3rem">%</span></div>' +
        '<div style="color:var(--text-2)">答对 <b>' + correct + ' / ' + total + '</b> 题 · 最高连击 <b>' + best + '</b> · 获得 <b>+' + (total * 8) + ' XP</b></div>' +
        '<div style="margin-top:26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          (opts.placement
            ? '<button class="btn primary" id="qnextpart">继续下一部分 →</button>'
            : '<button class="btn primary" id="qagain">再来一轮</button>' +
              '<a class="btn soft" href="wrong.html">去清错题本</a>') +
          (opts.reviewHref ? '<a class="btn ghost" href="' + opts.reviewHref + '">' + (opts.reviewLabel || '返回') + '</a>' : '') +
        '</div></div>';
      var np = host.querySelector('#qnextpart');
      if (np) np.addEventListener('click', function () { if (opts.onFinish) opts.onFinish(); });
      var b = host.querySelector('#qagain');
      if (b) b.addEventListener('click', function () {
        if (opts.onRestart) { opts.onRestart(); return; }
        i = 0; correct = 0; streak = 0; best = 0;
        pool = shuffle(pool.slice());
        host.querySelector('#qbody').innerHTML = '';
        draw();
      });
      // 摸底模式下由「继续下一部分」按钮推进，不在这里自动跳，
      // 否则学生会看不到自己的本部分成绩。
      if (opts.onFinish && !opts.placement) opts.onFinish({ correct: correct, total: total, rate: rate, best: best });
    }

    draw();
  };

  /* ----------------------------------------------------------
     干扰项挑选：优先同话题 + 同词性，并排除释义高度重叠的词
     ---------------------------------------------------------- */
  function glossSegments(t) {
    return String(t || '').split(/[；;,，、]/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function tooSimilar(a, b) {
    if (!a || !b) return false;
    var sa = glossSegments(a), sb = glossSegments(b);
    for (var i = 0; i < sa.length; i++) {
      for (var j = 0; j < sb.length; j++) {
        if (sa[i].length >= 2 && sa[i] === sb[j]) return true;
      }
    }
    return false;
  }
  function pickDistractors(pool, target, n) {
    var sameTopic = [], samePos = [], others = [];
    var taken = [target.zh];
    pool.forEach(function (w) {
      if (w.w === target.w || !w.zh) return;
      if (tooSimilar(w.zh, target.zh)) return;
      var share = (w.tp || []).some(function (t) { return (target.tp || []).indexOf(t) >= 0; });
      if (share && w.pos === target.pos) sameTopic.push(w);
      else if (w.pos === target.pos) samePos.push(w);
      else others.push(w);
    });
    var out = [];
    [sameTopic, samePos, others].forEach(function (arr) {
      var a = shuffle(arr.slice());
      for (var k = 0; k < a.length && out.length < n; k++) {
        if (taken.some(function (t) { return tooSimilar(t, a[k].zh); })) continue;
        taken.push(a[k].zh);
        out.push(a[k]);
      }
    });
    return out;
  }
  P.pickDistractors = pickDistractors;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  P.shuffle = shuffle;

  /* ==========================================================
     背单词（SRS 驱动：四选一 + 闪卡回忆双模式）
     ========================================================== */
  P.wordStudy = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var pool = (opts.words || []).filter(function (w) { return w.w; });
    if (!pool.length) { host.innerHTML = '<div class="empty"><b>没有可学的词</b></div>'; return; }
    var mode = opts.mode || 'due';
    var card = opts.card || 'choice';
    var autoSayOn = opts.autoSay !== false;
    var queue = [], idx = 0, revealed = false;
    var sessionN = 0, sessionOk = 0, streak = 0, best = 0;
    var answered = false, finished = false;
    var autoNextTimer = null;
    var pendingAdvance = false;
    var AUTO_NEXT_MS = 780;

    function advance() {
      if (!pendingAdvance) return;
      pendingAdvance = false;
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      idx++;
      draw();
    }

    function build() {
      clearTimeout(autoNextTimer);
      var now = Date.now();
      var scored = pool.map(function (w) {
        var r = P.srsGet(w.w);
        return { w: w, due: r ? r.due : 0, has: !!r, ivl: r ? (r.ivl || 0) : 0 };
      });
      if (mode === 'due') scored = scored.filter(function (s) { return !s.has || (s.due || 0) <= now; });
      else if (mode === 'new') scored = scored.filter(function (s) { return !s.has; });

      var limit = opts.limit || 20;
      var dueList = scored.filter(function (s) { return s.has && (s.due || 0) <= now; })
        .sort(function (a, b) { return (a.due || 0) - (b.due || 0); });
      var newList = scored.filter(function (s) { return !s.has; });
      var picked = [];

      if (mode === 'due') {
        picked = dueList.slice(0, limit);
      } else if (mode === 'new') {
        picked = sampleByFrequency(newList, limit);
      } else {
        picked = dueList.slice(0, limit);
        if (picked.length < limit) {
          var room = limit - picked.length;
          var takenKeys = {};
          picked.forEach(function (s) { takenKeys[s.w.w] = 1; });
          var extra = sampleByFrequency(newList.filter(function (s) { return !takenKeys[s.w.w]; }), room);
          picked = picked.concat(extra);
        }
      }

      queue = picked.map(function (s) { return s.w; });
      shuffle(queue);
      idx = 0; sessionN = 0; sessionOk = 0; streak = 0; best = 0; finished = false;
      draw();
    }

    function sampleByFrequency(list, n) {
      if (n <= 0 || !list.length) return [];
      var sorted = list.slice().sort(function (a, b) {
        var fa = a.w.frq == null ? 1e9 : a.w.frq;
        var fb = b.w.frq == null ? 1e9 : b.w.frq;
        return fa - fb;
      });
      var win = Math.max(n * 4, 80);
      var sub = sorted.slice(0, win);
      shuffle(sub);
      return sub.slice(0, n);
    }

    function header() {
      return '<div class="quiz-top">' +
        '<div class="quiz-progress"><i style="width:' + (queue.length ? idx / queue.length * 100 : 0) + '%"></i></div>' +
        '<span class="quiz-count">' + Math.min(idx + 1, queue.length) + ' / ' + queue.length + '</span>' +
        '<span class="combo-pill" id="qs">🔥 连击 ' + streak + '</span></div>';
    }

    function draw() {
      if (!queue.length) return emptyState();
      if (idx >= queue.length) return done();
      revealed = false; answered = false; pendingAdvance = false;
      var w = queue[idx];
      host.innerHTML = card === 'choice' ? choiceView(w) : recallView(w);
      bindKeys();
    }

    function emptyState() {
      host.innerHTML = '<div class="qcard" style="text-align:center;justify-content:center">' +
        '<div style="font-size:1.35rem;font-weight:700;margin-bottom:10px">🎉 今天到期的词全部复习完啦！</div>' +
        '<div style="color:var(--text-2);font-size:.93rem;line-height:1.7">按艾宾浩斯遗忘曲线，今天已经达标。<br>如果想继续抢跑，可以切到「混合模式」学习一批新词。</div>' +
        '<div style="margin-top:24px"><button class="btn primary" id="wsMix">切到混合模式学新词</button></div></div>';
      var b = host.querySelector('#wsMix');
      if (b) b.addEventListener('click', function () { mode = 'mix'; build(); });
    }

    function recallView(w) {
      var canPlay = P.hasAudio(w.w);
      var h = '<div class="flash-shell">' + header();
      h += '<div class="fcard">';
      h += '<div class="fword">' + esc(w.w) +
           (canPlay ? '<button class="say-btn" id="sayBtn" title="朗读 3 遍" aria-label="朗读单词三遍">🔊</button>' : '') +
           '</div>';
      if (w.ph) h += '<div class="fph">/' + esc(w.ph) + '/</div>';
      if (w.posZh) h += '<div class="fpos">' + esc(w.posZh) + (w.t === 'phrase' ? ' · 短语' : '') + '</div>';
      h += '<div id="frev"></div>';
      h += '<div class="fhint">先在脑海里回想中文含义，再点击「查看释义」或按空格</div>';
      h += '</div>';
      h += '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="fshow">查看释义 (空格)</button></div>';
      h += '</div>';
      setTimeout(function () {
        var say = host.querySelector('#sayBtn');
        if (say) say.addEventListener('click', function (e) { e.stopPropagation(); P.playWord(w.w); });
        if (canPlay && autoSayOn) P.playWord(w.w);
        var b = host.querySelector('#fshow');
        if (b) b.addEventListener('click', revealRecall);
      }, 0);
      return h;
    }

    function revealRecall() {
      if (revealed) return;
      revealed = true;
      var w = queue[idx];
      var h = '<div class="fzh">' + esc(w.zh || '（无释义）') + '</div>';
      if (w.ex && w.ex.length) h += '<div class="fex">' + esc(w.ex[0]) + '</div>';
      host.querySelector('#frev').innerHTML = h;
      var hint = host.querySelector('.fhint');
      if (hint) hint.style.display = 'none';
      var act = host.querySelector('.quiz-actions');
      act.innerHTML = '<div class="rate-row" style="width:100%">' +
        '<button class="rate again" data-g="0"><b>忘了</b><small>10 分钟后再来</small></button>' +
        '<button class="rate hard" data-g="1"><b>有点模糊</b><small>约 1 天后</small></button>' +
        '<button class="rate good" data-g="2"><b>记住了</b><small>按遗忘曲线</small></button>' +
        '<button class="rate easy" data-g="3"><b>秒杀很熟</b><small>拉长间隔</small></button></div>';
      act.querySelectorAll('[data-g]').forEach(function (b) {
        b.addEventListener('click', function () { rate(parseInt(b.getAttribute('data-g'), 10)); });
      });
    }

    function choiceView(w) {
      var ds = pickDistractors(pool, w, 3);
      if (ds.length < 3) return recallView(w);
      var choices = [w].concat(ds);
      shuffle(choices);
      var ans = choices.indexOf(w);
      var h = '<div class="flash-shell">' + header();
      var canPlay = P.hasAudio(w.w);
      h += '<div class="fcard" style="justify-content:flex-start;padding-top:32px;min-height:0">';
      h += '<div class="fword" style="font-size:clamp(1.6rem,5vw,2.2rem)">' + esc(w.w) +
           (canPlay ? '<button class="say-btn" id="sayBtn" title="朗读 3 遍" aria-label="朗读单词三遍">🔊</button>' : '') +
           '</div>';
      if (w.ph) h += '<div class="fph">/' + esc(w.ph) + '/</div>';
      if (w.posZh) h += '<div class="fpos">' + esc(w.posZh) + '</div>';
      h += '<div style="font-size:.84rem;color:var(--text-3);margin-top:14px">' +
           (canPlay ? '听音朗读，选出最准确的中文释义' : '选出最准确的中文释义') + '</div></div>';
      h += '<div class="qopts" style="margin-top:16px">';
      choices.forEach(function (o, k) {
        h += '<button class="qopt" data-k="' + k + '"' + (k === ans ? ' data-ans="1"' : '') + '>' +
             '<span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o.zh || '') + '</span></button>';
      });
      h += '</div><div id="wfb"></div></div>';
      setTimeout(function () {
        var say = host.querySelector('#sayBtn');
        if (say) say.addEventListener('click', function (e) { e.stopPropagation(); P.playWord(w.w); });
        if (canPlay && autoSayOn) P.playWord(w.w);
        host.querySelectorAll('.qopt').forEach(function (b) {
          b.addEventListener('click', function () {
            judgeChoice(w, parseInt(b.getAttribute('data-k'), 10), ans);
          });
        });
      }, 0);
      return h;
    }

    function judgeChoice(w, k, ans) {
      if (answered) return;
      answered = true;
      var ok = k === ans;
      host.querySelectorAll('.qopt').forEach(function (b) {
        var bi = parseInt(b.getAttribute('data-k'), 10);
        b.classList.add('locked');
        if (bi === ans) b.classList.add('right');
        else if (bi === k) b.classList.add('wrong');
      });
      if (ok) { streak++; if (streak > best) best = streak; P.sfx('ok'); }
      else { streak = 0; P.sfx('bad'); }
      var fb = host.querySelector('#wfb');
      if (ok) {
        fb.innerHTML = '<div class="feedback auto-next"><b>✓ 答对了！' +
          (streak >= 3 ? ' 🔥 连击 ' + streak : '') + '</b>' +
          esc(w.zh) + (w.posZh ? ' · ' + esc(w.posZh) : '') +
          '<span class="auto-next-hint">自动进入下一词…</span></div>';
      } else {
        fb.innerHTML = '<div class="feedback bad"><b>✕ 正确释义：' + esc(w.zh) + '</b>' +
          esc(w.w) + (w.ph ? ' /' + esc(w.ph) + '/' : '') + (w.posZh ? ' · ' + esc(w.posZh) : '') +
          (w.ex && w.ex[0] ? '<div style="margin-top:6px;font-style:italic;font-size:.85rem">' + esc(w.ex[0]) + '</div>' : '') +
          '</div>' +
          '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="wnext">记住了，下一词 →</button></div>';
        var nx = fb.querySelector('#wnext');
        nx.addEventListener('click', function () { idx++; draw(); });
        nx.focus();
      }
      recordAndRate(w, ok ? 2 : 0, ok);
      if (ok) {
        pendingAdvance = true;
        clearTimeout(autoNextTimer);
        autoNextTimer = setTimeout(advance, AUTO_NEXT_MS);
      }
    }

    function recordAndRate(w, g, countedOk) {
      P.srsRate(w.w, g);
      // 背单词的结果同步到词库「已掌握」：四选一按对错，闪卡按自评
      // 闪卡的「有点模糊」(g=1) 不算掌握也不算答错，保持原状态
      if (countedOk) P.setKnown(w.w, true);
      else if (g === 0) P.setKnown(w.w, false);
      sessionN++;
      if (countedOk) sessionOk++;
      if (opts.onRate) opts.onRate(w, g);
      var st = host.querySelector('#qs');
      if (st) st.textContent = '🔥 连击 ' + streak;
    }

    function rate(g) {
      var w = queue[idx];
      if (g >= 2) { streak++; if (streak > best) best = streak; P.sfx('ok'); }
      else { streak = 0; P.sfx('bad'); }
      recordAndRate(w, g, g >= 2);
      if (g === 0) queue.push(w);
      idx++;
      draw();
    }

    function bindKeys() {
      if (host.__keys) return;
      host.__keys = 1;
      document.addEventListener('keydown', function (e) {
        if (!document.body.contains(host) || finished) return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (card === 'choice') {
          if (/^[1-4]$/.test(e.key) && !answered) {
            var b = host.querySelector('.qopt[data-k="' + (parseInt(e.key, 10) - 1) + '"]');
            if (b) { e.preventDefault(); b.click(); }
          } else if (e.key === 'Enter' && answered) {
            if (pendingAdvance) { e.preventDefault(); advance(); }
            else {
              var nx = host.querySelector('#wnext');
              if (nx) { e.preventDefault(); nx.click(); }
            }
          }
          return;
        }
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!revealed) revealRecall(); else rate(2);
        } else if (revealed && /^[1-4]$/.test(e.key)) {
          rate(parseInt(e.key, 10) - 1);
        }
      });
    }

    function done() {
      finished = true;
      pendingAdvance = false;
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
      P.sfx('win');
      var st = P.srsStats();
      var pct = sessionN ? Math.round(sessionOk / sessionN * 100) : 100;
      host.innerHTML = '<div class="qcard" style="text-align:center;justify-content:center">' +
        '<div class="kicker">本轮闯关完成</div>' +
        '<div style="font-size:1.2rem;font-weight:700;margin-bottom:4px">' + (pct >= 85 ? '🎉 太棒了，词感超稳！' : '💪 坚持复习，越背越牢！') + '</div>' +
        '<div style="font-family:var(--display);font-size:2.9rem;font-weight:800;color:var(--accent);margin:8px 0">' + sessionOk +
          '<span style="font-size:1.3rem;color:var(--text-3)"> / ' + sessionN + '</span></div>' +
        '<div style="color:var(--text-2)">个词已记住 · 最高连击 <b>' + best + '</b> · 获得 <b>+' + (sessionN * 5) + ' XP</b><br>' +
          '词库累计已学 ' + st.total + ' 词，今日还剩 ' + st.due + ' 个待复习</div>' +
        '<div style="margin-top:26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn primary" id="wagain">再来一轮</button>' +
          '<a class="btn soft" href="review.html">顺手练一组语法</a>' +
          '<a class="btn ghost" href="' + (opts.backHref || 'index.html') + '">返回</a>' +
        '</div></div>';
      host.querySelector('#wagain').addEventListener('click', build);
      if (opts.onFinish) opts.onFinish({ ok: sessionOk, total: sessionN, best: best });
    }

    build();
    return { rebuild: build };
  };

  P.flashcards = function (opts) {
    return P.wordStudy(Object.assign({}, opts, { card: opts.card || 'recall' }));
  };

  /* ==========================================================
     篇章练习：完形填空（带原文阅读区）
     ========================================================== */
  P.cloze = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var data = opts.data;                 // 一篇完形
    if (!data) return;
    var blanks = data.blanks.slice();
    var i = 0, correct = 0, answered = false;
    var total = blanks.length;
    var picks = {};                       // 已选答案 {no: optionIndex}

    // 渲染带空格的原文：把 __n__ 替换成可点击的编号块
    function renderPassage() {
      var html = data.passage.map(function (para) {
        var safe = esc(para).replace(/__(\d+)__/g, function (m, n) {
          return '<button class="cz-blank" data-no="' + n + '">' + n + '</button>';
        });
        return '<p class="cz-p">' + safe + '</p>';
      }).join('');
      return '<div class="cz-passage">' + html + '</div>';
    }

    function draw() {
      answered = false;
      var b = blanks[i];
      if (!b) return done();

      // 原文中已完成/当前的空高亮
      var passageHtml = renderPassage();
      // has-passage：这一屏含整段原文，需要放宽宽度（见 style.css）
      var h = '<div class="quiz-shell has-passage">' +
        '<div class="quiz-top">' +
          '<div class="quiz-progress"><i id="czp" style="width:' + (i / total * 100) + '%"></i></div>' +
          '<span class="quiz-count" id="czc">' + (i + 1) + ' / ' + total + '</span>' +
          '<span class="combo-pill" id="czs">✓ 已对 ' + correct + '</span>' +
        '</div>' +
        '<div class="cz-meta">' +
          '<span class="qtype">完形填空</span>' +
          '<span class="lv ' + esc(data.level) + '">' + esc(data.level) + '</span>' +
          '<span class="cz-tag">' + esc(data.type) + ' · 约 ' + data.words + ' 词</span>' +
        '</div>' +
        '<h3 class="cz-title">' + esc(data.title) + '</h3>' +
        passageHtml +
        '<div class="cz-question">' +
          '<div class="cz-qhead">第 <b>' + b.no + '</b> 空</div>' +
          '<div class="qopts">' +
            b.options.map(function (o, k) {
              return '<button class="qopt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div id="czfb"></div>' +
        '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="cznext" disabled>下一空 →</button></div>' +
      '</div>';
      host.innerHTML = h;

      // 已填空位标注状态
      host.querySelectorAll('.cz-blank').forEach(function (el) {
        var no = parseInt(el.getAttribute('data-no'), 10);
        if (no === b.no) el.classList.add('cur');
        else if (picks[no] !== undefined) {
          el.classList.add(picks[no] === findBlank(no).answer ? 'ok' : 'bad');
          el.textContent = no;
        }
        el.addEventListener('click', function () {
          var target = blanks.findIndex(function (x) { return x.no === no; });
          if (target >= 0 && target !== i && picks[no] !== undefined) { i = target; draw(); }
        });
      });

      host.querySelectorAll('.qopt').forEach(function (btn) {
        btn.addEventListener('click', function () { judge(parseInt(btn.getAttribute('data-k'), 10)); });
      });
      host.querySelector('#cznext').addEventListener('click', function () { i++; draw(); });
    }

    function findBlank(no) {
      return blanks.filter(function (x) { return x.no === no; })[0] || {};
    }

    function judge(k) {
      if (answered) return;
      answered = true;
      var b = blanks[i];
      var ok = k === b.answer;
      picks[b.no] = k;
      if (ok) correct++;
      host.querySelectorAll('.qopt').forEach(function (btn) {
        var bi = parseInt(btn.getAttribute('data-k'), 10);
        btn.classList.add('locked');
        if (bi === b.answer) btn.classList.add('right');
        else if (bi === k) btn.classList.add('wrong');
      });
      var fb = host.querySelector('#czfb');
      if (ok) {
        fb.innerHTML = '<div class="feedback"><b>✓ 正确</b>' + esc(b.why) + '</div>';
      } else {
        fb.innerHTML = '<div class="feedback bad"><b>✕ 正确答案：' + 'ABCD'[b.answer] + '. ' + esc(b.options[b.answer]) + '</b>' + esc(b.why) + '</div>';
      }
      // 立即把当前空位在原文中标注对错（不必等切到下一空）
      host.querySelectorAll('.cz-blank').forEach(function (el) {
        if (parseInt(el.getAttribute('data-no'), 10) === b.no) {
          el.classList.remove('cur');
          el.classList.add(ok ? 'ok' : 'bad');
        }
      });
      var nx = host.querySelector('#cznext');
      nx.disabled = false;
      nx.focus();
      // 写入学习闭环：能力维度统计 + 错题本（id 用 篇id-空号 保证唯一）
      if (P.pRecord) P.pRecord(b.skill, ok, data.id + '-' + b.no);
      if (opts.onAnswer) opts.onAnswer(b, ok);
    }

    function done() {
      var pct = Math.round(correct / total * 100);
      host.innerHTML = '<div class="quiz-done"><div class="qdone-ico">' + (pct >= 80 ? '🎉' : '💪') + '</div>' +
        '<div class="qdone-title">本篇完成！</div>' +
        '<div class="qdone-score"><b>' + correct + '</b><span style="font-size:1.3rem;color:var(--text-3)"> / ' + total + '</span></div>' +
        '<div style="color:var(--text-2)">正确率 <b>' + pct + '%</b>' +
          (pct >= 80 ? ' · 上下文逻辑掌握得不错' : ' · 建议重读原文，注意前后呼应') + '</div>' +
        '<div class="note" style="text-align:left;margin-top:18px">' + esc(data.moral || '') + '</div>' +
        '<div style="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn primary" id="czagain">再做一遍</button>' +
          '<a class="btn soft" href="' + (opts.backHref || 'reading.html') + '">返回篇章练习</a>' +
        '</div></div>';
      host.querySelector('#czagain').addEventListener('click', function () {
        i = 0; correct = 0; picks = {}; draw();
      });
      if (opts.onFinish) opts.onFinish({ ok: correct, total: total });
    }

    draw();
    return { redraw: draw };
  };

  /* ==========================================================
     篇章练习：阅读理解（左原文右题目，逐题作答）
     ========================================================== */
  P.reading = function (opts) {
    var host = document.querySelector(opts.mount);
    if (!host) return;
    var data = opts.data;
    if (!data) return;
    var qs = data.questions.slice();
    var i = 0, correct = 0, answered = false;
    var total = qs.length;

    function passageHtml() {
      return '<div class="rd-passage">' + data.passage.map(function (para) {
        return para === '' ? '<div style="height:10px"></div>' : '<p class="cz-p">' + esc(para) + '</p>';
      }).join('') + '</div>';
    }

    function draw() {
      answered = false;
      var q = qs[i];
      if (!q) return done();

      var optsHtml = '';
      if (q.type === 'short' || q.type === 'complete') {
        optsHtml = '<div class="qfill"><input id="rdin" type="text" autocomplete="off" spellcheck="false" placeholder="' +
          (q.type === 'complete' ? '补全句子，输入缺少的部分…' : '用英文简略回答…') + '">' +
          '<button class="btn primary" id="rdsub">提交检查</button></div>';
      } else {
        optsHtml = '<div class="qopts">' + q.options.map(function (o, k) {
          return '<button class="qopt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>';
        }).join('') + '</div>';
      }

      host.innerHTML = '<div class="quiz-shell has-passage">' +
        '<div class="quiz-top">' +
          '<div class="quiz-progress"><i style="width:' + (i / total * 100) + '%"></i></div>' +
          '<span class="quiz-count">' + (i + 1) + ' / ' + total + '</span>' +
          '<span class="combo-pill">✓ 已对 ' + correct + '</span>' +
        '</div>' +
        '<div class="cz-meta">' +
          '<span class="qtype">' + (q.type === 'short' ? '任务型阅读 · 简答' : q.type === 'complete' ? '任务型阅读 · 完成句子' : '阅读理解') + '</span>' +
          '<span class="lv ' + esc(data.level) + '">' + esc(data.level) + '</span>' +
          '<span class="cz-tag">' + esc(data.type) + ' · 约 ' + data.words + ' 词</span>' +
        '</div>' +
        '<h3 class="cz-title">' + esc(data.title) + '</h3>' +
        passageHtml() +
        '<div class="cz-question">' +
          '<div class="cz-qhead">第 ' + (i + 1) + ' 题</div>' +
          '<div class="qstem">' + esc(q.stem) + '</div>' +
          optsHtml +
        '</div>' +
        '<div id="rdfb"></div>' +
        '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="rdnext" disabled>下一题 →</button></div>' +
      '</div>';

      if (q.type === 'short' || q.type === 'complete') {
        var inp = host.querySelector('#rdin');
        inp.focus();
        var submit = function () { judgeFill(inp.value); };
        host.querySelector('#rdsub').addEventListener('click', submit);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
      } else {
        host.querySelectorAll('.qopt').forEach(function (btn) {
          btn.addEventListener('click', function () { judgeChoice(parseInt(btn.getAttribute('data-k'), 10)); });
        });
      }
      host.querySelector('#rdnext').addEventListener('click', function () { i++; draw(); });
    }

    // 判分归一化：忽略大小写、首尾标点、多余空格与冠词差异（a/an/the）
    function norm(s) {
      return String(s).toLowerCase().trim()
        .replace(/[’‘]/g, "'")
        .replace(/[.,!?;:"']/g, '')
        .replace(/\b(a|an|the)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function judgeChoice(k) {
      if (answered) return;
      answered = true;
      var q = qs[i];
      var ok = k === q.answer;
      if (ok) correct++;
      host.querySelectorAll('.qopt').forEach(function (btn) {
        var bi = parseInt(btn.getAttribute('data-k'), 10);
        btn.classList.add('locked');
        if (bi === q.answer) btn.classList.add('right');
        else if (bi === k) btn.classList.add('wrong');
      });
      finish(ok, q, ok ? '' : q.options[q.answer]);
    }

    function judgeFill(val) {
      if (answered) return;
      answered = true;
      var q = qs[i];
      var pool = (q.accept || [q.answer]).map(norm);
      var ok = pool.indexOf(norm(val)) >= 0;
      if (ok) correct++;
      var inp = host.querySelector('#rdin');
      inp.classList.add(ok ? 'right' : 'wrong');
      inp.readOnly = true;
      host.querySelector('#rdsub').disabled = true;
      finish(ok, q, ok ? '' : q.answer);
    }

    /* 把定位句放回原文上下文，用 <mark> 圈出命中的句子。
       返回 { before, hit, after } 三段，渲染时 hit 高亮。 */
    function locateContext(locate) {
      if (!locate) return null;
      var norm = function (t) {
        return String(t).replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ');
      };
      var target = norm(locate).trim();
      var full = data.passage.join('\n\n');
      var idx = norm(full).indexOf(target);
      if (idx < 0) {
        // 找不到就退回整句展示，不报错
        return { before: '', hit: locate, after: '' };
      }
      // 在归一化后的串上定位，但按原串切片：用逐段匹配定位所在段落
      var paras = data.passage;
      for (var pi = 0; pi < paras.length; pi++) {
        var np = norm(paras[pi]);
        var pos = np.indexOf(target);
        if (pos >= 0) {
          // 在原段落中按比例定位（归一化只压缩空白，长度可能不同）
          var orig = paras[pi];
          var ratio = np.length ? orig.length / np.length : 1;
          var start = Math.floor(pos * ratio);
          var hitLen = Math.floor(target.length * ratio);
          var hit = orig.substr(start, hitLen);
          // 校正：若切出的与目标差异过大，直接整段高亮
          if (Math.abs(hit.length - target.length) > target.length * 0.35) hit = target;
          return {
            before: orig.substr(0, start),
            hit: hit,
            after: orig.substr(start + hit.length),
            para: pi,
          };
        }
      }
      return { before: '', hit: locate, after: '' };
    }

    function annotationHtml(q) {
      var list = q.annotations || [];
      if (!list.length) return '';
      return '<div class="fb-annot"><b class="fb-annot-title">重点句型与注释</b>' +
        list.map(function (a) {
          return '<div class="annot-item">' +
            '<div class="annot-en">' + esc(a.en) + '</div>' +
            '<div class="annot-zh">' + esc(a.zh) + '</div>' +
            '<div class="annot-note">' + esc(a.note) + '</div>' +
          '</div>';
        }).join('') + '</div>';
    }

    function finish(ok, q, ref) {
      if (P.pRecord) P.pRecord(q.skill, ok, data.id + '-q' + (i + 1));
      var fb = host.querySelector('#rdfb');
      var refHtml = ref ? '<div class="fb-ref"><b>参考答案：</b><span>' + esc(ref) + '</span></div>' : '';

      // 原文圈画：把定位句放回上下文并高亮
      var ctx = locateContext(q.locate);
      var locateHtml = '';
      if (ctx) {
        var body = ctx.before !== '' || ctx.after !== ''
          ? '…' + esc(ctx.before) + '<mark class="circle-mark">' + esc(ctx.hit) + '</mark>' + esc(ctx.after) + '…'
          : '<mark class="circle-mark">' + esc(ctx.hit) + '</mark>';
        locateHtml = '<div class="fb-locate"><b>原文圈画：</b>' +
          '<div class="locate-ctx">' + body + '</div></div>';
      }

      var whyHtml = '<div class="fb-why">' + esc(q.why) + '</div>';
      var trapHtml = q.trap
        ? '<div class="fb-trap"><b>干扰项分析：</b>' + esc(q.trap) + '</div>' : '';
      var annotHtml = annotationHtml(q);

      fb.innerHTML = '<div class="feedback' + (ok ? '' : ' bad') + '">' +
        '<b class="fb-head">' + (ok ? '✓ 正确' : '✕ 看看解析') + '</b>' +
        refHtml + locateHtml + whyHtml + trapHtml + annotHtml + '</div>';
      var nx = host.querySelector('#rdnext');
      nx.disabled = false;
      nx.focus();
      if (opts.onAnswer) opts.onAnswer(q, ok);
    }

    function done() {
      var pct = Math.round(correct / total * 100);
      host.innerHTML = '<div class="quiz-done"><div class="qdone-ico">' + (pct >= 80 ? '🎉' : '💪') + '</div>' +
        '<div class="qdone-title">本篇完成！</div>' +
        '<div class="qdone-score"><b>' + correct + '</b><span style="font-size:1.3rem;color:var(--text-3)"> / ' + total + '</span></div>' +
        '<div style="color:var(--text-2)">正确率 <b>' + pct + '%</b></div>' +
        '<div style="margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
          '<button class="btn primary" id="rdagain">再做一遍</button>' +
          '<a class="btn soft" href="' + (opts.backHref || 'reading.html') + '">返回篇章练习</a>' +
        '</div></div>';
      host.querySelector('#rdagain').addEventListener('click', function () {
        i = 0; correct = 0; draw();
      });
      if (opts.onFinish) opts.onFinish({ ok: correct, total: total });
    }

    draw();
    return { redraw: draw };
  };
})();
