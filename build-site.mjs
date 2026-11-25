/* ==========================================================
   河北中考领航 · 静态站点生成器
   用法：node build-site.mjs
   输出：根目录 index.html + topics/ grammar/ 等
   口径：义务教育英语课程标准（2022 年版）三级 + 河北中考考试说明
   ========================================================== */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WORDS, TOPICS, STATS } from './src/data-words.js';
let AUDIO = {};
try {
  ({ AUDIO } = await import('./src/data-audio.js'));
} catch (e) {
  AUDIO = {};
}
import { GRAMMAR, GRAMMAR_STATS } from './src/data-grammar.js';
import { QUESTIONS } from './src/data-quiz.js';
import { QUESTIONS_2 } from './src/data-quiz2.js';
import { QUESTIONS_3 } from './src/data-quiz3.js';
import { TRAPS } from './src/data-trap.js';
import { CLOZE, READING, TASK_READING } from './src/data-passage.js';
import { READING_EXTRA } from './src/data-reading-extra.js';
import { WRITING, WRITING_STATS } from './src/data-writing.js';
import { WRITING_STEPS, WRITING_STRUCTURES, WRITING_PHRASES, WRITING_TRAPS, WRITING_GUIDE_STATS } from './src/data-writing-guide.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = __dir;

const assetHash = (rel) => createHash('sha256').update(readFileSync(join(__dir, rel))).digest('hex').slice(0, 8);
const CSS_VER = assetHash('assets/style.css');
const JS_VER = assetHash('assets/app.js');

const ALL_Q = [...QUESTIONS, ...QUESTIONS_2, ...QUESTIONS_3];

/* 把逐题手写的「干扰项分析」合并进题库。
   trap 放在单独文件里维护，这里按题号挂回去；找不到 trap 的题保持原样，
   由构建时的一致性检查报出来。 */
ALL_Q.forEach((q) => {
  if (TRAPS[q.id]) q.trap = TRAPS[q.id];
});

/* 一致性检查：有选项的题都该有 trap（填空题没有选项，不需要） */
const Q_NEED_TRAP = ALL_Q.filter((q) => q.options && q.options.length);
const Q_TRAP_MISS = Q_NEED_TRAP.filter((q) => !q.trap).map((q) => q.id);
const Q_WITH_TRAP = Q_NEED_TRAP.filter((q) => q.trap).length;
const Q_ID_SET = new Set(ALL_Q.map((q) => q.id));
const Q_TRAP_ORPHAN = Object.keys(TRAPS).filter((id) => !Q_ID_SET.has(id));

/* ---------------- 阅读分级：A 应用文 / B 记叙文 / C 说明文 / D 议论文 ---------------- */
const LEVEL_OF_TYPE = { '应用文': 'A', '记叙文': 'B', '说明文': 'C', '议论文': 'D' };
const ALL_READING = [
  ...READING.map((r) => ({ ...r, level: LEVEL_OF_TYPE[r.type] || 'A' })),
  ...READING_EXTRA,
].sort((a, b) => (a.level === b.level ? a.id.localeCompare(b.id) : a.level.localeCompare(b.level)));

const READING_LEVELS = ['A', 'B', 'C', 'D'];

/* 四类文章读法（策略卡） */
const READING_METHODS = {
  A: {
    name: '应用文', icon: '📋',
    tagline: '信息查找型 —— 答案就在原文里，考的是「找得快、看得准」',
    steps: [
      { t: '先看题干，划出关键词', d: '不要从第一句读起。先看题目问的是「谁 / 什么时间 / 什么条件」，圈出关键词。' },
      { t: '带着关键词扫读原文', d: '眼睛只找那个词或它的同义表达，找到就停下来精读那一两句。' },
      { t: '警惕四类陷阱', d: '① 时间张冠李戴（把 A 活动的时间安到 B）；② 条件互换；③ 范围扩大（原文说「一种」，选项说「所有」）；④ 方向反了（把「免费」说成「要付费」）。' },
    ],
    trap: '应用文每题 2 分。信息题最忌「凭印象选」，必须回原文核对——特别是多个活动并列时，看清问的是哪一个。',
  },
  B: {
    name: '记叙文', icon: '📖',
    tagline: '情节理解型 —— 考的是「谁做了什么、为什么、心情怎么变」',
    steps: [
      { t: '先抓时间线', d: '按「先…然后…最后…」理清事件顺序。记叙文常按时间推进，理清顺序就不会把先后弄反。' },
      { t: '盯住转折词', d: 'but / however / suddenly / then 后面往往是关键信息，也是出题点。' },
      { t: '体会人物情感变化', d: '注意形容词与对话里的情绪词。推断题常问「他为什么这么说」「这句话是什么意思」，答案就在前后文。' },
    ],
    trap: '记叙文的错误选项常是「无中生有」（原文没提的事）或「过度推断」（从一句话推出太多）。选之前问自己：原文哪句话支持这个选项？',
  },
  C: {
    name: '说明文', icon: '🔬',
    tagline: '信息理解型 —— 考的是「抓主旨、辨数据、看清结构」',
    steps: [
      { t: '先读首段与每段首句', d: '说明文的结构很规整：首段点题，每段第一句是该段主旨。先读这些，全文框架就有了。' },
      { t: '数据要一一对应', d: '看到数字、百分比、年代，立刻在原文标注它对应的是什么。最常见错误就是把 A 的数据安到 B 上。' },
      { t: '区分「事实」与「观点」', d: '科学家说、研究显示——这些是别人的观点；原文直接陈述的才是事实。题目问「according to the passage」时尤其要小心。' },
    ],
    trap: '说明文最爱设「张冠李戴」的坑：把两个对象的特征互换。做题时把关键名词圈出来，逐个比对。',
  },
  D: {
    name: '议论文', icon: '⚖️',
    tagline: '观点辨析型 —— 考的是「分清谁的观点、作者到底站哪边」',
    steps: [
      { t: '先找作者立场', d: '议论文常先摆双方观点，最后才给作者自己的看法。注意 but / however / perhaps / the real question is 后面的内容。' },
      { t: '区分三种声音', d: '① 支持者的观点；② 反对者的观点；③ 作者的观点。三者常常不同，题目会故意混淆。' },
      { t: '警惕绝对化表述', d: '选项里出现 always / never / completely / only 时高度警惕——议论文作者通常持平衡立场，很少绝对化。' },
    ],
    trap: '议论文最容易错在「把作者写成支持某一方」。作者往往是「双方都有道理，但关键在于…」，最后一段才是他的真实立场。',
  },
};

/* ---------------- 篇章题统计 ---------------- */
const PASSAGE_STATS = {
  cloze: CLOZE.length,
  clozeBlanks: CLOZE.reduce((a, c) => a + c.blanks.length, 0),
  reading: ALL_READING.length,
  readingQ: ALL_READING.reduce((a, r) => a + r.questions.length, 0),
  task: TASK_READING.length,
  taskQ: TASK_READING.reduce((a, t) => a + t.questions.length, 0),
};
PASSAGE_STATS.totalQ = PASSAGE_STATS.clozeBlanks + PASSAGE_STATS.readingQ + PASSAGE_STATS.taskQ;
const TYPE_OF_Q = (q) => q.type || 'choice';
const Q_STATS = {
  total: ALL_Q.length,
  choice: ALL_Q.filter((q) => TYPE_OF_Q(q) === 'choice').length,
  correct: ALL_Q.filter((q) => TYPE_OF_Q(q) === 'correct').length,
  fill: ALL_Q.filter((q) => TYPE_OF_Q(q) === 'fill').length,
  dialogue: ALL_Q.filter((q) => TYPE_OF_Q(q) === 'dialogue').length,
  blind: ALL_Q.filter((q) => q.blind).length,
};
// 盲填题在站内以四选一呈现（type 记为 choice），单独计数时须从单选里扣掉，否则总数会重复
Q_STATS.choicePlain = Q_STATS.choice - Q_STATS.blind;

const TOTAL_Q = Q_STATS.total + PASSAGE_STATS.totalQ;

/* ---------------- 卷面覆盖：120 分里本站覆盖哪些、哪些建议配合真题 ---------------- */
const PAPER_COVERAGE = [
  { part: '听力理解', score: 30, covered: false, note: '需音频，建议配合真题听力', href: '' },
  { part: '完形填空', score: 10, covered: true, note: `${PASSAGE_STATS.cloze} 篇 · ${PASSAGE_STATS.clozeBlanks} 空`, href: 'reading.html' },
  { part: '短文填空', score: 15, covered: true, note: `给词变形 + 盲填 ${Q_STATS.blind} 题`, href: 'review.html' },
  { part: '阅读理解', score: 30, covered: true, note: `A/B/C/D 四类 · ${PASSAGE_STATS.reading} 篇 ${PASSAGE_STATS.readingQ} 题`, href: 'reading.html' },
  { part: '任务型阅读', score: 10, covered: true, note: `${PASSAGE_STATS.task} 篇 · 简答与完成句子`, href: 'reading.html' },
  { part: '情景交际', score: 10, covered: true, note: `${Q_STATS.dialogue} 题 · 2025 新增题型`, href: 'review.html' },
  { part: '书面表达', score: 15, covered: true, note: `${WRITING_STATS.total} 篇范文 · ${WRITING_STATS.highlights} 个句型`, href: 'writing.html' },
];
const COVERED_SCORE = PAPER_COVERAGE.filter((x) => x.covered).reduce((a, x) => a + x.score, 0);
const TOTAL_SCORE = PAPER_COVERAGE.reduce((a, x) => a + x.score, 0);



/* ---------------- 派生数据 ---------------- */
const WORD_BY_TOPIC = new Map();
TOPICS.forEach((t) => WORD_BY_TOPIC.set(t.id, []));
WORDS.forEach((w) => (w.tp || []).forEach((id) => {
  if (WORD_BY_TOPIC.has(id)) WORD_BY_TOPIC.get(id).push(w);
}));
const TOPIC_SORTED = TOPICS
  .map((t) => ({ ...t, n: (WORD_BY_TOPIC.get(t.id) || []).length }))
  .filter((t) => t.n > 0)
  .sort((a, b) => b.n - a.n);

const Q_BY_TOPIC = new Map();
ALL_Q.forEach((q) => {
  if (!Q_BY_TOPIC.has(q.topic)) Q_BY_TOPIC.set(q.topic, []);
  Q_BY_TOPIC.get(q.topic).push(q);
});
const GT_IDS = new Set(GRAMMAR.flatMap((g) => g.topics.map((t) => t.id)));
const Q_TOPIC_MISS = [...GT_IDS].filter((id) => !Q_BY_TOPIC.has(id));


/* ---------------- 数据内联 ---------------- */
const __inlineCache = new Map();

function inlineData(keys, extra) {
  const ALL = {
    WORDS, TOPICS, STATS, GRAMMAR, GRAMMAR_STATS, QUESTIONS, QUESTIONS_2, QUESTIONS_3,
    QUESTIONS_ALL: ALL_Q,
  };
  const extraKeys = Object.keys(extra || {});
  const extraSig = extraKeys.length
    ? '|' + extraKeys.map((k) => k + ':' + JSON.stringify(extra[k]).length + ':' + JSON.stringify(extra[k]).slice(0, 48)).join(',')
    : '';
  const id = keys.join(',') + extraSig;
  if (__inlineCache.has(id)) return __inlineCache.get(id);
  const body = keys.map((k) => {
    if (!(k in ALL)) throw new Error('inlineData: unknown key ' + k);
    return `window.HBZK_DATA.${k}=${JSON.stringify(ALL[k])};`;
  }).concat(extraKeys.map((k) => `window.HBZK_DATA.${k}=${JSON.stringify(extra[k])};`)).join('\n');
  const out = `<script>window.HBZK_DATA=window.HBZK_DATA||{};\n${body}</scr` + `ipt>`;
  __inlineCache.set(id, out);
  return out;
}

/* ---------------- 工具 ---------------- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function rich(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function write(rel, content) {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

/* ---------------- 导航 & 品牌 ---------------- */
const SITE_NAME = '河北中考领航';

const NAV = [
  { href: 'index.html', label: '首页', key: 'home' },
  { href: 'quiz.html', label: '背单词', key: 'words-study' },
  { href: 'review.html', label: '练语法', key: 'grammar-drill' },
  { href: 'reading.html', label: '学阅读', key: 'reading' },
  { href: 'words.html', label: '词库', key: 'words' },
  { href: 'grammar.html', label: '语法', key: 'grammar' },
  { href: 'writing.html', label: '写作', key: 'writing' },
  { href: 'wrong.html', label: '错题本', key: 'wrong' },
  { href: 'stats.html', label: '学情诊断', key: 'stats' },
  { href: 'diagnose.html', label: '摸底诊断', key: 'diagnose' },
  { href: 'content.html', label: '内容说明', key: 'content' },
];

const LOGO_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;

const LOGO_HTML = (base) => `<a class="logo" href="${base}index.html">
  <span class="logo-mark">${LOGO_SVG}</span>
  <span>河北中考领航</span>
  <span class="logo-badge">英语</span>
</a>`;

const HEADER = (base, active) => `<div class="scroll-progress"></div>
<header class="hdr">
  <div class="hdr-in">
    ${LOGO_HTML(base)}
    <nav class="hdr-nav">
      ${NAV.map((n) => `<a href="${base}${n.href}"${n.key === active ? ' class="on"' : ''}>${n.label}</a>`).join('')}
    </nav>
    <div class="hdr-tools">
      <button class="theme-btn" aria-label="切换主题">☾</button>
      <button class="menu-btn" aria-label="菜单" aria-expanded="false">☰</button>
    </div>
  </div>
</header>`;

const FOOTER = (base) => `<footer class="foot">
  <div class="foot-in">
    <div class="col">
      <div class="logo" style="margin-bottom:10px">
        <span class="logo-mark">${LOGO_SVG}</span>
        <span>河北中考领航</span>
        <span class="logo-badge">英语</span>
      </div>
      <p style="line-height:1.7;margin:0;color:var(--text-2)">面向河北省初中生的中考英语系统备考站。${STATS.total} 个课标词条全配英音、${GRAMMAR_STATS.topics} 个语法考点、${TOTAL_Q} 道题（语法 · 完形 · 阅读 · 任务型）、${WRITING_STATS.total} 篇写作范文，覆盖卷面 ${TOTAL_SCORE} 分中的 ${COVERED_SCORE} 分。</p>
    </div>
    <div class="col">
      <h4>每日备考</h4>
      <a href="${base}quiz.html">听音背单词</a>
      <a href="${base}review.html">题型练语法</a>
      <a href="${base}wrong.html">智能错题本</a>
    </div>
    <div class="col">
      <h4>考纲体系</h4>
      <a href="${base}words.html">课标词表</a>
      <a href="${base}topics/index.html">17 个话题词库</a>
      <a href="${base}grammar.html">${GRAMMAR_STATS.sections} 大语法族</a>
    </div>
    <div class="col">
      <h4>诊断与帮助</h4>
      <a href="${base}diagnose.html">摸底诊断（先测再练）</a>
      <a href="${base}stats.html">学情诊断与档案</a>
      <a href="${base}content.html">内容与数据说明</a>
      <a href="${base}index.html#faq">常见问题</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>河北中考领航 · 依据义务教育英语课程标准与河北省中考考试说明</span>
    <span>词表以课标三级词汇为基础 · 离线与在线均可顺畅使用</span>
  </div>
</footer>`;

function page({ base = '', active = '', title, desc = '', body, script = '', rawScript = '', dataKeys = [], dataExtra = null }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%232563eb'/%3E%3Cstop offset='1' stop-color='%234f46e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='9' fill='url(%23g)'/%3E%3Ctext x='16' y='22' font-family='system-ui,sans-serif' font-size='16' font-weight='800' fill='%23fff' text-anchor='middle'%3E冀%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/style.css?v=${CSS_VER}">
<script>try{var m=JSON.parse(localStorage.getItem('pet-theme-manual')||'null');var h=new Date().getHours();var t=(m==='light'||m==='dark')?m:((h>=19||h<6)?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){var h2=new Date().getHours();document.documentElement.setAttribute('data-theme',(h2>=19||h2<6)?'dark':'light');}</script>
</head>
<body data-base="${base}">
${HEADER(base, active)}
<main class="main">
<div class="wrap">
${body}
</div>
</main>
${FOOTER(base)}
<script src="${base}assets/app.js?v=${JS_VER}"></script>
${script ? `${inlineData(dataKeys, dataExtra)}<script>${script}</script>` : ''}
${rawScript}
</body>
</html>`;
}

/* ==========================================================
   1. 首页（商业落地页 + 今日学习驾驶舱）
   ========================================================== */
function buildHome() {
  /* ---- 三层分区：把已覆盖的 90 分按「练法不同」切成三块，题量正好分完 405 题 ---- */
  const TIERS = [
    {
      cls: 'send', score: 25, name: '送分区', goal: '目标 95%',
      desc: `情景交际 10 分 + 短文填空 15 分`,
      count: `${Q_STATS.total} 题 · ${GRAMMAR_STATS.topics} 个考点`,
      note: '规则型：冠词、介词、连词、词形变化，练够就能拿满',
    },
    {
      cls: 'mid', score: 40, name: '中档区', goal: '目标 80%',
      desc: `完形填空 10 分 + 阅读理解 30 分`,
      count: `${PASSAGE_STATS.clozeBlanks + PASSAGE_STATS.readingQ} 题 · A/B/C/D 四类`,
      note: '语篇型：在文章里定位与推理，靠方法不靠词量',
    },
    {
      cls: 'dist', score: 25, name: '区分区', goal: '目标 60%',
      desc: `任务型阅读 10 分 + 书面表达 15 分`,
      count: `${PASSAGE_STATS.taskQ} 题 + ${WRITING_STATS.total} 篇范文`,
      note: '输出型：决定你能不能上 105，前面的分都在这里兑现',
    },
  ];

  /* ---- 解析样本：直接取站内真实题目，让访客先看到「答完之后多知道了什么」 ---- */
  const BLIND_SAMPLE = ALL_Q.find((q) => q.id === 'b026');
  const READ_SAMPLE = ALL_READING.find((r) => r.id === 'read-02')
    .questions.find((q) => q.skill === 'inference');
  const WRITE_SAMPLE = WRITING[0];

  const sampleCard = `<div class="sample-card">
    <span class="sample-cap">阅读理解 · 推理判断 · 原文定位 + 为什么对 + 干扰项错在哪</span>
    <div class="wb-gram">
      <div class="qmeta">
        <span class="qtype">阅读理解</span>
        <span class="flag">推理判断</span>
        <span class="flag" style="background:var(--bg-3);color:var(--text-2)">记叙文 · B 篇</span>
      </div>
      <div class="wb-stem">${esc(READ_SAMPLE.stem)}</div>
      <div class="wb-opts">${READ_SAMPLE.options.map((o, k) => `<span class="wb-opt">${'ABCD'[k]}. ${esc(o)}</span>`).join('')}</div>
      <div class="wb-ans"><b>正确答案：</b><span style="color:var(--ok);font-weight:700">${'ABCD'[READ_SAMPLE.answer]}</span></div>
      <div class="wb-locate"><b>原文定位：</b><q>${esc(READ_SAMPLE.locate)}</q></div>
      <div class="wb-why">${esc(READ_SAMPLE.why)}</div>
      <div class="wb-trap"><b>干扰项分析：</b>${esc(READ_SAMPLE.trap)}</div>
    </div>
  </div>`;

  /* ---- 常见问题：并入「边界」节，默认折叠，不单独占一节 ---- */
  const FAQ = [
    {
      q: '这套系统适合几年级？河北中考英语的卷面结构是怎样的？',
      a: `适合初中 7–9 年级、准备参加河北省初中学业水平考试（中考）的学生。2025 年起河北中考英语全省统一命题，满分 <b>120 分</b>，结构为：听力理解 30 分、语言运用 25 分（完形填空 10 分 + 短文填空 15 分）、阅读理解 40 分、情景交际（补全对话）10 分、书面表达 15 分。相比改革前，取消了单项选择和连词成句，新增了<b>情景交际</b>，更强调真实语境中的语言运用。`,
    },
    {
      q: '词表是怎么确定的？和学校教材对得上吗？',
      a: `本站词表以《义务教育英语课程标准（2022 年版）》<b>三级词汇表</b>为基座（约 1600 词，对应初中 7–9 年级），并补充了初中必会的派生词、词形变化与英式/美式拼写别名。河北各地市教材版本不尽相同（人教版、冀教版均有使用），但中考词汇范围统一以课标为准，因此本站词表与任何版本教材都能对上。`,
    },
    {
      q: '孩子平时作业多，每天需要花多长时间？',
      a: '建议每天 15–20 分钟：10 分钟听音背 20 个单词（系统自动安排到期复习 + 新词），5–10 分钟刷 10 道语法或情景交际题。周末再花 10 分钟清一次错题本，两个月就能走完一轮完整体系。',
    },
    {
      q: '手机、iPad 和电脑都能用吗？需要下载 App 吗？',
      a: '全端自适应，手机、iPad 平板和电脑浏览器打开就能直接学，无需下载安装 App，也没有弹窗广告。所有词条均可点击朗读，离线也能使用。',
    },
    {
      q: '孩子的背词进度和错题本会丢失吗？换设备怎么办？',
      a: '学习记录实时保存在当前浏览器中，离线也能用。如果需要在电脑和 iPad 之间切换，或担心清缓存丢失，可以随时在「学情诊断」页点击<b>导出学情档案</b>，在新设备上导入即可无缝恢复。',
    },
    {
      q: '这个网站覆盖了中考英语的哪些部分？',
      a: `覆盖卷面 <b>${TOTAL_SCORE} 分中的 ${COVERED_SCORE} 分</b>：<b>词汇</b>（${STATS.total} 课标词条）、<b>语法</b>（${GRAMMAR_STATS.topics} 考点 + ${Q_STATS.total} 道语法题，含盲填 ${Q_STATS.blind} 道）、<b>完形填空</b>（${PASSAGE_STATS.cloze} 篇 ${PASSAGE_STATS.clozeBlanks} 空）、<b>阅读理解</b>（${PASSAGE_STATS.reading} 篇 ${PASSAGE_STATS.readingQ} 题，A/B/C/D 四类）、<b>任务型阅读</b>（${PASSAGE_STATS.task} 篇 ${PASSAGE_STATS.taskQ} 题）、<b>情景交际</b>（${Q_STATS.dialogue} 题）、<b>书面表达</b>（${WRITING_STATS.total} 篇范文）。合计 <b>${TOTAL_Q} 道题</b>。<br><br>唯一未覆盖的是<b>听力理解 30 分</b>——它需要音频素材，本站不提供模拟音频，建议用真题听力配合练习。`,
    },
  ];

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>河北中考英语 · 对齐 2025 年新卷面结构</div>
      <h1>单词都背了，<br><span class="accent-word">短文填空还是错</span></h1>
      <p class="lede">
 河北卷短文填空有 <b>盲填</b>——不给提示词，只考冠词、介词、连词；阅读与完形共 50 分，考的是<b>语篇里定位与推理</b>。这两块都不是背单词能解决的。
 </p>
      <div class="hero-cta">
        <a class="btn primary" href="quiz.html">免费开始 <span aria-hidden="true">→</span></a>
        <a class="btn" href="reading.html">先看阅读怎么教</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 无需注册</span>
        <span><b>✓</b> 记录只存本地</span>
        <span><b>✓</b> 离线可用</span>
        <span><b>✓</b> 每题带解析</span>
      </div>
    </div>

    <div class="cockpit-card" id="today">
      <div class="cockpit-top">
        <span class="level-pill" id="cLevel">🏅 Lv.1 中考萌新 · 0 XP</span>
        <button class="countdown-pill" data-open-exam="1" id="cCountdown">📅 <span>设置中考倒计时</span></button>
      </div>
      <div class="cockpit-metrics">
        <div class="streak-box">
          <b id="tStreak">0</b>
          <span id="tStreakLabel">天连学</span>
        </div>
        <div class="today-goal">
          <div class="today-goal-row">
            <span>今日词汇闯关 <b id="tWords">0</b> / <b id="tGoal">20</b> 词</span>
            <span class="today-pct" id="tPct">0%</span>
          </div>
          <div class="bar"><i id="tBar" style="width:0%"></i></div>
          <div class="cockpit-sub">
            <span id="cTarget">目标：100+ 分</span>
            <a href="stats.html" style="font-weight:600">查看学情诊断 →</a>
          </div>
        </div>
      </div>
      <div class="mission-list" id="missionList">
        <a class="mission-item" href="quiz.html" data-mod="words">
          <span class="mi-ico blue">🎧</span>
          <span class="mi-main"><b><span class="mi-step">第一步</span>：听音闯关背单词</b><small id="ttWords">按遗忘曲线先过高频词，每词英音朗读</small></span>
          <span class="mi-go">开始 →</span>
        </a>
        <a class="mission-item" href="review.html" data-mod="grammar">
          <span class="mi-ico purple">⚡</span>
          <span class="mi-main"><b><span class="mi-step">第二步</span>：中考题型练语法</b><small id="ttGrammar">每天 10–20 题，专攻正确率低的薄弱考点</small></span>
          <span class="mi-go">去练 →</span>
        </a>
        <a class="mission-item" href="wrong.html" data-mod="wrong">
          <span class="mi-ico rose">🎯</span>
          <span class="mi-main"><b><span class="mi-step">第三步</span>：清空今日错题本</b><small id="ttWrong">自动收纳错词错题，支持一键打印复习纸</small></span>
          <span class="mi-go">查看 →</span>
        </a>
      </div>
      <a class="mission-diag" id="diagCta" href="diagnose.html">
        <span>🧭 不知道从哪开始？先做一次 15 分钟摸底 →</span>
      </a>
    </div>
  </div>

  <div class="stats reveal">
    <div class="stat"><b data-count="${STATS.total}">${STATS.total}</b><span>课标词条</span><small>全部附英音朗读</small></div>
    <div class="stat"><b data-count="${GRAMMAR_STATS.topics}">${GRAMMAR_STATS.topics}</b><span>语法考点</span><small>${GRAMMAR_STATS.sections} 族 · 含情景交际</small></div>
    <div class="stat"><b data-count="${TOTAL_Q}">${TOTAL_Q}</b><span>总题量</span><small>语法 · 完形 · 阅读 · 任务型</small></div>
    <div class="stat"><b data-count="${WRITING_STATS.total}">${WRITING_STATS.total}</b><span>写作范文</span><small>${WRITING_STATS.highlights} 个高分句型</small></div>
  </div>
</section>

<section class="section reveal coverage-section" id="tiers">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">卷面覆盖</span>
      <h2>河北卷 120 分，本站覆盖 ${COVERED_SCORE} 分</h2>
      <span class="sub">三块练法不同：规则型靠练够，语篇型靠方法，输出型靠句型。混着刷等于三块都用错方法</span>
    </div>
  </div>
  <div class="coverage-split">
    <div class="coverage-list">
      ${PAPER_COVERAGE.map((x) => `
      <${x.covered ? `a href="${x.href}"` : 'div'} class="coverage-row ${x.covered ? 'on' : 'off'}">
        <span class="cv-score">${x.score}</span>
        <span class="cv-part">${esc(x.part)}</span>
        <span class="cv-note">${esc(x.note)}</span>
        <span class="cv-flag">${x.covered ? '✓ 已覆盖' : '建议配合真题'}</span>
      </${x.covered ? 'a' : 'div'}>`).join('')}
      <div class="coverage-total">
        <span>本站覆盖 <b>${COVERED_SCORE}</b> / ${TOTAL_SCORE} 分</span>
        <span class="cv-bar"><i style="width:${Math.round(COVERED_SCORE / TOTAL_SCORE * 100)}%"></i></span>
        <span>${Math.round(COVERED_SCORE / TOTAL_SCORE * 100)}%</span>
      </div>
    </div>
    <div class="tier-stack">
      ${TIERS.map((t) => `<div class="tier-mini ${t.cls}">
        <div class="tier-mini-score">${t.score}<span>分</span></div>
        <div class="tier-mini-name">${t.name}</div>
        <div class="tier-mini-desc">${t.desc}</div>
        <div class="tier-mini-goal">${t.goal} · ${t.count}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section reveal" id="sample">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">解析样本 · 站内真实题目</span>
      <h2>答完之后，你多知道了什么</h2>
      <span class="sub">普通题库只告诉你选 C。本站每题给三段：原文定位、为什么对、另外三个错在哪</span>
    </div>
    <a class="btn sm soft" href="reading.html">进入阅读训练 →</a>
  </div>
  <div class="sample-rows">
    <a class="sample-row" href="review.html">
      <span class="sample-tier send">盲填</span>
      <span class="sample-main">
        <b>${esc(BLIND_SAMPLE.stem)}</b>
        <span class="sample-signal">不给提示词，只考冠词 / 介词 / 连词</span>
      </span>
      <span class="sample-meta">${BLIND_SAMPLE.options.length} 选 1 · 附解析</span>
      <span class="sample-go">→</span>
    </a>
    <a class="sample-row" href="reading.html">
      <span class="sample-tier mid">推理</span>
      <span class="sample-main">
        <b>${esc(READ_SAMPLE.stem)}</b>
        <span class="sample-signal">答案不在字面上，要回到定位句再推一步</span>
      </span>
      <span class="sample-meta">原文定位 + 干扰项分析</span>
      <span class="sample-go">→</span>
    </a>
    <a class="sample-row" href="writing.html">
      <span class="sample-tier dist">写作</span>
      <span class="sample-main">
        <b>${esc(WRITE_SAMPLE.genre)} · ${esc(WRITE_SAMPLE.title)}</b>
        <span class="sample-signal">范文不整篇背，拆成思路、亮点句与评分要点</span>
      </span>
      <span class="sample-meta">${WRITE_SAMPLE.words} · ${WRITE_SAMPLE.highlights.length} 个亮点句</span>
      <span class="sample-go">→</span>
    </a>
  </div>
  ${sampleCard}
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">五大学习模块</span>
      <h2>每个模块都对应卷面上具体的分</h2>
    </div>
  </div>
  <div class="grid c3">
    <div class="card card-stretch">
      <div class="card-ico">📚</div>
      <h3><a href="words.html">课标词表 · ${STATS.total} 条</a></h3>
      <p class="desc">课标三级词汇为基座，含音标、词性、释义，点击即读英音。</p>
      <div class="meta" style="margin-top:12px">高频 ${STATS.b1} · 中频 ${STATS.b2} · 拓展 ${STATS.b3}</div>
      <div class="card-sub"><a href="topics/index.html">按 ${TOPIC_SORTED.length} 个话题成组记词 →</a></div>
    </div>
    <div class="card card-stretch">
      <div class="card-ico purple">📐</div>
      <h3><a href="grammar.html">语法体系 · ${GRAMMAR_STATS.sections} 族 ${GRAMMAR_STATS.topics} 考点</a></h3>
      <p class="desc">按中考考查密度排序，每个考点可一键跳转专项刷题。</p>
      <div class="meta" style="margin-top:12px">${GRAMMAR_STATS.traps} 条易错对比 · ${GRAMMAR_STATS.examples} 个例句</div>
      <div class="card-sub"><a href="grammar.html">进入完整语法体系 →</a></div>
    </div>
    <a class="card" href="review.html">
      <div class="card-ico ok">✍️</div>
      <h3>考点专项刷题 · ${Q_STATS.total} 题</h3>
      <p class="desc">自动统计各考点正确率，可「专攻最弱考点」或「只练错题本」。</p>
      <div class="meta" style="margin-top:12px">单选 ${Q_STATS.choicePlain} · 短文填空 ${Q_STATS.fill} · 补全对话 ${Q_STATS.dialogue} · 盲填 ${Q_STATS.blind}</div>
    </a>
    <a class="card" href="reading.html">
      <div class="card-ico blue">📖</div>
      <h3>篇章阅读 · ${PASSAGE_STATS.totalQ} 题</h3>
      <p class="desc">A/B/C/D 四类各配读法策略卡，整篇训练，每题给原文定位与干扰项分析。</p>
      <div class="meta" style="margin-top:12px">完形 ${PASSAGE_STATS.cloze} 篇 ${PASSAGE_STATS.clozeBlanks} 空 · 阅读 ${PASSAGE_STATS.reading} 篇 ${PASSAGE_STATS.readingQ} 题 · 任务型 ${PASSAGE_STATS.task} 篇</div>
    </a>
    <a class="card" href="writing.html">
      <div class="card-ico gold">📝</div>
      <h3>书面表达 · ${WRITING_STATS.total} 篇范文</h3>
      <p class="desc">四种常考体裁，每篇拆解思路、亮点句与评分要点，换题目还能用。</p>
      <div class="meta" style="margin-top:12px">${WRITING_STATS.highlights} 个高分句型 · 80–100 词三段式</div>
    </a>
  </div>
</section>

<section class="section reveal" id="start-cta">
  <div class="final-cta">
    <div>
      <b>现在就开始，第一组题不用注册</b>
      <span>记录只存你自己的浏览器，随时可导出备份</span>
    </div>
    <a class="btn primary lg" href="quiz.html">免费开始 →</a>
  </div>
</section>

<section class="section reveal" id="honest">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">边界</span>
      <h2>本站不做什么</h2>
      <span class="sub">把能做的和不能做的都说清，比「全都能提分」有用</span>
    </div>
  </div>
  <div class="honest-list">
    <div><b>不覆盖听力 30 分</b><span>听力需真实音频，本站不提供。缺口就是这 30 分，建议配合真题。</span></div>
    <div><b>不夸大词表数量</b><span>严格按课标三级词汇，共 ${STATS.total} 条，不掺超纲词充数。</span></div>
    <div><b>不做作文 AI 批改</b><span>AI 判作文一旦判错，信任就崩。改为范文 + 评分要点对照自查。</span></div>
    <div><b>不搬运真题原文</b><span>阅读与完形均为原创，只复刻题型结构与难度梯度。</span></div>
  </div>
</section>

<section class="section reveal" id="faq">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">常见问题</span>
      <h2>${FAQ.length} 个问题</h2>
      <span class="sub">点标题展开或收起</span>
    </div>
  </div>
  <div class="faq-list">
    ${FAQ.map((f, i) => `<details class="faq-item"${i === 0 ? ' open' : ''}>
      <summary>${f.q}</summary>
      <p>${f.a}</p>
    </details>`).join('')}
  </div>
</section>
`;

  write('index.html', page({
    title: '河北中考领航 · 中考英语全题型备考平台',
    desc: `面向河北省初中生的中考英语备考站：${STATS.total} 个课标词条、${GRAMMAR_STATS.topics} 个语法考点、${TOTAL_Q} 道题（语法 · 完形 · 阅读 · 任务型）与 ${WRITING_STATS.total} 篇写作范文，覆盖卷面 ${TOTAL_SCORE} 分中的 ${COVERED_SCORE} 分。`,
    active: 'home',
    body,
    dataKeys: ['STATS'],
    script: `
const P = window.HBZK;
function refresh() {
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  const lv = P.levelInfo();
  set('#cLevel', '🏅 Lv.' + lv.lv + ' ' + lv.name + ' · ' + lv.xp + ' XP');
  const days = P.daysLeft();
  const cd = document.querySelector('#cCountdown');
  if (cd) {
    if (days === null) cd.innerHTML = '📅 <span>设置中考倒计时</span>';
    else if (days >= 0) cd.innerHTML = '⏳ 距中考还有 <b>' + days + '</b> 天';
    else cd.innerHTML = '📅 <span>更新中考日期</span>';
  }
  set('#cTarget', '目标：' + P.targetLabel());
  const st = P.streak();
  set('#tStreak', st);
  set('#tStreakLabel', st === 0 ? '今日开启' : '天连学');
  set('#tWords', P.todayWords());
  set('#tGoal', P.goal());
  const pct = P.todayPct();
  set('#tPct', pct + '%');
  const bar = document.querySelector('#tBar');
  if (bar) bar.style.width = pct + '%';
  const q = P.todayQuestions();
  set('#ttGrammar', q ? '今天已精练 ' + q + ' 题，继续保持手感' : '每天 10–20 题，专攻正确率低的考点');
  const due = P.srsStats().due;
  set('#ttWords', due ? '今天有 ' + due + ' 个词到期，先复习再学新词' : '按遗忘曲线先过高频词，每词英音朗读');
  const wn = P.wordBookCount() + P.wrongIds().length;
  const dueAll = P.dueTotals ? P.dueTotals() : null;
  set('#ttWrong', wn
    ? (dueAll && dueAll.total
        ? '今天有 ' + dueAll.total + ' 条到期该复习（共 ' + wn + ' 条待攻克）'
        : '共 ' + wn + ' 条待攻克，今天没有到期的')
    : '太棒了，错题本目前干干净净');

  applyRoute();
}

/* 按摸底结果重排首页三步：最弱的一条线排到「第一步」。
   没做过摸底就保持默认顺序（词 → 语法 → 错题），并在下方露出摸底入口；
   做过之后把这个入口收起来，避免反复打扰。 */
const MOD_HREF = { words: 'quiz.html', grammar: 'review.html', reading: 'reading.html' };
const MOD_LABEL = { words: '听音闯关背单词', grammar: '中考题型练语法', reading: '整篇理解学阅读' };
const MOD_ICO = { words: '🎧', grammar: '⚡', reading: '📄' };

function applyRoute() {
  const list = document.querySelector('#missionList');
  const cta = document.querySelector('#diagCta');
  const order = P.routeOrder ? P.routeOrder() : null;
  if (!list) return;

  if (!order) {
    // 没有摸底：恢复默认三步（词 → 语法 → 错题），露出摸底入口。
    // 若之前插入过阅读项（例如清空了摸底记录），要一并移除并复位步号，
    // 否则会留下没有步号的「第—步」和「第4步」这种错位。
    const stray = list.querySelector('[data-mod="reading"]');
    if (stray) stray.remove();
    const defaults = ['words', 'grammar', 'wrong'];
    defaults.forEach((id, i) => {
      const el = list.querySelector('[data-mod="' + id + '"]');
      if (!el) return;
      list.appendChild(el);
      el.classList.remove('mi-first');
      const stepEl = el.querySelector('.mi-step');
      if (stepEl) stepEl.textContent = ['第一步', '第二步', '第三步'][i];
    });
    if (cta) cta.style.display = '';
    return;
  }
  if (cta) cta.style.display = 'none';

  // 把「阅读」这条线也纳入任务列表：摸底测出来它最弱时，首页要能直接推它
  const items = {
    words: list.querySelector('[data-mod="words"]'),
    grammar: list.querySelector('[data-mod="grammar"]'),
    wrong: list.querySelector('[data-mod="wrong"]'),
  };
  let readingEl = list.querySelector('[data-mod="reading"]');
  if (!readingEl) {
    readingEl = document.createElement('a');
    readingEl.className = 'mission-item';
    readingEl.setAttribute('data-mod', 'reading');
    readingEl.href = 'reading.html';
    readingEl.innerHTML = '<span class="mi-ico rose">📄</span>' +
      '<span class="mi-main"><b><span class="mi-step">—</span>：整篇理解学阅读</b>' +
      '<small>完形与阅读的方法练习，靠方法不靠词量</small></span>' +
      '<span class="mi-go">去练 →</span>';
  }
  // 必须在 if 外面赋值：applyRoute 会被事件反复调用，
  // 只在创建时赋值会让第二次调用漏掉阅读项，顺序与步号就乱了。
  items.reading = readingEl;

  // 摸底排出的顺序只覆盖「词 / 语法 / 阅读」三条线，错题本永远垫底（它是清理项）
  const seq = order.slice();
  if (seq.indexOf('reading') < 0) seq.push('reading');
  const finalOrder = seq.concat(['wrong']);

  finalOrder.forEach((id, i) => {
    const el = items[id];
    if (!el) return;
    list.appendChild(el);                       // appendChild 按调用顺序重排
    const stepEl = el.querySelector('.mi-step');
    if (stepEl) stepEl.textContent = '第' + (i + 1) + '步';
  });

  // 给最弱的一条线加一个「今天先做这个」的标记。
  // 先清掉旧的：applyRoute 会重复调用，不清会让高亮越积越多。
  finalOrder.forEach((id) => {
    const el = items[id];
    if (el) el.classList.remove('mi-first');
  });
  const first = items[finalOrder[0]];
  if (first) first.classList.add('mi-first');
}
refresh();
document.addEventListener('hbzk:daily', refresh);
document.addEventListener('hbzk:srs', refresh);
document.addEventListener('hbzk:profile', refresh);
document.addEventListener('hbzk:placement', refresh);
document.addEventListener('hbzk:qlog', applyRoute);
`,
  }));
}

/* ==========================================================
   2. 官方词表（补齐全量英音一键朗读）
   ========================================================== */
function buildWords() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 中考课标词表</div>
  <h1>中考课标词表</h1>
  <p class="lede">以《义务教育英语课程标准（2022 年版）》三级词汇为基座，共 <b>${STATS.total}</b> 个词条，按真实语料词频分三档，<b>卷面最常出现的高频词排在最前</b>，点 🔊 可听英音。</p>
</div>

<section class="section" style="margin-top:24px">
  <div class="kv">
    <div class="k"><b>${STATS.b1}</b><span>核心高频（必背，先拿稳）</span><div class="bar"><i style="width:${Math.round(STATS.b1 / STATS.total * 100)}%"></i></div></div>
    <div class="k"><b>${STATS.b2}</b><span>中频主力（阅读与写作关键）</span><div class="bar warn"><i style="width:${Math.round(STATS.b2 / STATS.total * 100)}%"></i></div></div>
    <div class="k"><b>${STATS.b3}</b><span>拓展词汇（认识即可）</span><div class="bar rose"><i style="width:${Math.round(STATS.b3 / STATS.total * 100)}%"></i></div></div>
    <div class="k" id="kKnown"><b>0</b><span>已标记掌握</span><div class="bar ok"><i style="width:0%"></i></div></div>
  </div>
</section>

<section class="section" style="margin-top:30px">
  <div class="toolbar">
    <input class="field" id="wq" type="search" placeholder="输入英文单词或中文释义快速查找…" autocomplete="off">
    <a class="btn sm soft" href="topics/index.html">按 ${TOPIC_SORTED.length} 个话题浏览 →</a>
    <a class="btn sm primary" href="quiz.html">去闯关背单词 →</a>
  </div>
  <div class="chips" style="margin-bottom:18px">
    <button class="chip on" data-filter="all">全部词条</button>
    <button class="chip" data-filter="b1">核心高频</button>
    <button class="chip" data-filter="b2">中频主力</button>
    <button class="chip" data-filter="b3">拓展词汇</button>
    <button class="chip" data-filter="phrase">仅高频短语</button>
    <button class="chip" data-filter="new">未掌握</button>
    <button class="chip" data-filter="known">已掌握</button>
  </div>
  <div id="wlist"></div>
</section>
`;
  const script = `
const { WORDS, STATS } = window.HBZK_DATA;
const P = window.HBZK;
P.renderWordList({ mount: '#wlist', words: WORDS, pageSize: 40, search: '#wq', initialFilter: 'new' });
function drawKnown() {
  const n = P.knownCount();
  const el = document.querySelector('#kKnown');
  if (!el) return;
  el.querySelector('b').textContent = n.toLocaleString('en-US');
  el.querySelector('i').style.width = Math.min(100, n / STATS.total * 100) + '%';
}
drawKnown();
document.addEventListener('hbzk:known', drawKnown);
`;
  write('words.html', page({
    dataKeys: ['WORDS', 'STATS'],
    dataExtra: { HBZK_AUDIO: AUDIO },
    title: `课标词库 · ${STATS.total} 条带英音朗读`,
    desc: '义务教育英语课程标准三级词汇全量，含中文释义、音标、词性与英音朗读。',
    active: 'words',
    body, script,
  }));
}

/* ==========================================================
   3. 话题索引 + 话题详情（含英音朗读）
   ========================================================== */
function buildTopics() {
  const cards = TOPIC_SORTED.map((t) => `<a class="card" href="${t.id}.html">
    <div class="card-ico">${t.icon}</div>
    <h3>${esc(t.name)}</h3>
    <div class="meta">${t.n} 个词条 · ${esc(t.official)}</div>
  </a>`).join('');

  write('topics/index.html', page({
    base: '../',
    title: `${TOPIC_SORTED.length} 个中考话题词库`,
    desc: '按课标人与自我、人与社会、人与自然三大主题分组的初中话题词库，成组记忆更高效。',
    active: 'words',
    body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../words.html">中考课标词表</a> / 按话题</div>
  <h1>按话题记词 · ${TOPIC_SORTED.length} 个中考场景</h1>
  <p class="lede">按课标「人与自我、人与社会、人与自然」三大主题，把初中词汇分成 ${TOPIC_SORTED.length} 个话题。同话题单词成组记忆，做阅读理解和写作文时更容易整块联想。</p>
</div>
<section class="section" style="margin-top:26px">
  <div class="grid c3">${cards}</div>
  <div class="note">注：功能词（the / and / of 等）与跨场景通用词归在<a href="../words.html">全部词表</a>中；部分多义词会同时出现在多个相关话题里。</div>
</section>`,
  }));

  TOPIC_SORTED.forEach((t) => {
    const list = WORD_BY_TOPIC.get(t.id) || [];
    const topicAudio = {};
    list.forEach((w) => { if (AUDIO[w.w]) topicAudio[w.w] = AUDIO[w.w]; });
    write(`topics/${t.id}.html`, page({
      base: '../',
      dataKeys: [],
      dataExtra: {
        TOPIC_WORDS: list.map((w) => ({ w: w.w, pos: w.pos, posZh: w.posZh, t: w.t, zh: w.zh, tag: w.tag, ph: w.ph, ex: w.ex, tp: w.tp, al: w.al, frq: w.frq })),
        HBZK_AUDIO: topicAudio,
      },
      title: `${t.name} · ${list.length} 个话题词汇`,
      desc: `${t.official} 话题下的初中课标词汇与英音朗读。`,
      active: 'words',
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../words.html">中考课标词表</a> / <a href="index.html">话题</a> / ${esc(t.name)}</div>
  <h1>${t.icon} ${esc(t.name)}</h1>
  <p class="lede">${esc(t.official)} · 共 ${list.length} 个词条。点击 🔊 听英音，点右侧按钮标记已掌握。</p>
</div>
<section class="section" style="margin-top:26px">
  <div class="toolbar">
    <input class="field" id="wq" type="search" placeholder="在本话题内搜索英文或中文…" autocomplete="off">
    <a class="btn sm soft" href="index.html">← 返回全部话题</a>
  </div>
  <div class="chips" style="margin-bottom:18px">
    <button class="chip" data-filter="all">全部</button>
    <button class="chip" data-filter="b1">核心高频</button>
    <button class="chip" data-filter="b2">中频主力</button>
    <button class="chip" data-filter="b3">拓展词</button>
    <button class="chip on" data-filter="new">未掌握</button>
  </div>
  <div id="wlist"></div>
</section>`,
      script: `
const list = window.HBZK_DATA.TOPIC_WORDS;
window.HBZK.renderWordList({ mount: '#wlist', words: list, pageSize: 40, search: '#wq', initialFilter: 'new' });
`,
    }));
  });
}

/* ==========================================================
   4. 语法体系（族索引 + 详情页，带实时正确率徽章）
   ========================================================== */
function topicCardHtml(t, index) {
  const qn = (Q_BY_TOPIC.get(t.id) || []).length;
  const trapN = t.traps.length;
  const plainRule = t.rule.replace(/\*\*([^*]*)\*\*/g, '$1').replace(/`([^`]*)`/g, '$1');
  const quick = plainRule.length > 68 ? plainRule.slice(0, 66) + '…' : plainRule;
  const lvLabel = t.level === 'A2' ? 'A2 巩固' : t.level === 'B1+' ? 'B1+ 冲卓越' : 'B1 核心';

  const body = `
  <p class="grule">${rich(t.rule)}</p>
  ${t.form ? `<div class="gform">${esc(t.form)}</div>` : ''}
  ${t.table ? `<table class="gtable"><thead><tr>${t.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
    t.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
  }</tbody></table>` : ''}
  <ul class="exlist">${t.examples.map((e) => `<li><span class="en">${esc(e.en)}</span><span class="zh">${esc(e.zh)}</span></li>`).join('')}</ul>
  <div class="traps">${t.traps.map((x) => `
    <div class="trap">
      <div class="tth">${esc(x.t)}</div>
      <span class="bad">${esc(x.bad)}</span>
      <span class="good">${esc(x.good)}</span>
      <div class="why">${rich(x.why)}</div>
    </div>`).join('')}
  </div>
  ${qn ? `<div style="margin-top:18px"><a class="btn sm primary" href="../review.html?topic=${t.id}">专项刷这个考点（${qn} 题）→</a></div>` : ''}`;

  return `
<details class="tcard" id="${t.id}">
  <summary class="tcard-sum">
    <span class="tcard-num">${String(index + 1).padStart(2, '0')}</span>
    <span class="tcard-main">
      <span class="tcard-title">${esc(t.name)}<span class="lv ${esc(t.level)}">${lvLabel}</span></span>
      <span class="tcard-quick">${esc(quick)}</span>
    </span>
    <span class="tcard-meta">${trapN} 条避坑${qn ? ` · ${qn} 题` : ''}</span>
    <span class="tcard-caret" aria-hidden="true"></span>
  </summary>
  <div class="tcard-body">${body}</div>
</details>`;
}

function buildGrammar() {
  const cards = GRAMMAR.map((g) => {
    const trapN = g.topics.reduce((a, t) => a + t.traps.length, 0);
    const qN = g.topics.reduce((a, t) => a + (Q_BY_TOPIC.get(t.id) || []).length, 0);
    const names = g.topics.map((t) => esc(t.name)).join(' · ');
    return `<a class="card gfam" href="grammar/${g.id}.html" data-gid="${g.id}">
      <div class="gfam-top"><span class="card-ico purple">${g.icon}</span><span class="gfam-count">${g.topics.length} 个考点</span></div>
      <h3>${esc(g.name)}</h3>
      <p class="gfam-list">${names}</p>
      <div class="gfam-foot">
        <span class="meta">${trapN} 条易错避坑 · ${qN} 道题</span>
        <span class="meta" data-gacc="${g.id}"></span>
      </div>
    </a>`;
  }).join('');

  write('grammar.html', page({
    title: `语法体系 · ${GRAMMAR_STATS.sections} 族 ${GRAMMAR_STATS.topics} 考点`,
    desc: `河北中考领航 ${GRAMMAR_STATS.sections} 大族 ${GRAMMAR_STATS.topics} 个必考语法点，含公式表、例句与易错避坑对比。`,
    active: 'grammar',
    dataKeys: ['GRAMMAR'],
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 语法体系</div>
  <h1>中考英语语法体系</h1>
  <p class="lede">按河北中考考查密度排成 ${GRAMMAR_STATS.sections} 个语法族、${GRAMMAR_STATS.topics} 个核心考点，覆盖课标三级全部语法项目与 2025 年新增的情景交际。
 点进任意模块即可展开公式表、精选例句与 <b>✕ 易错句 vs ✓ 正确句</b> 对比，学完直接刷专项题。</p>
</div>

<section class="section" style="margin-top:24px">
  <div class="kv">
    <div class="k"><b>${GRAMMAR_STATS.sections}</b><span>核心语法族</span></div>
    <div class="k"><b>${GRAMMAR_STATS.topics}</b><span>必考语法点</span></div>
    <div class="k"><b>${GRAMMAR_STATS.traps}</b><span>易错避坑对比</span></div>
    <div class="k"><b>${Q_STATS.total}</b><span>配套精练题</span></div>
  </div>
</section>

<section class="section" style="margin-top:28px">
  <div class="grid c3">${cards}</div>
</section>

<div class="note">难度标签说明：<span class="lv A2">A2 巩固</span> 为小学与七年级基础，<span class="lv B1">B1 核心</span> 为中考必考主力，<span class="lv B1+">B1+ 拔高</span> 多见于短文填空与阅读长难句。</div>
`,
    script: `
const { GRAMMAR } = window.HBZK_DATA;
const P = window.HBZK;
const stats = P.qTopicStats();
const byTopic = new Map(stats.map(x => [x.topic, x]));
GRAMMAR.forEach(g => {
  let n = 0, ok = 0;
  g.topics.forEach(t => { const s = byTopic.get(t.id); if (s) { n += s.n; ok += s.ok; } });
  const el = document.querySelector('[data-gacc="' + g.id + '"]');
  if (el && n > 0) {
    const pct = Math.round(ok / n * 100);
    el.textContent = '正确率 ' + pct + '%';
    el.style.color = pct >= 80 ? 'var(--ok)' : pct >= 60 ? 'var(--gold)' : 'var(--rose)';
    el.style.fontWeight = '700';
  }
});
`,
  }));

  GRAMMAR.forEach((g, gi) => {
    const prev = GRAMMAR[gi - 1];
    const next = GRAMMAR[gi + 1];
    const cardsHtml = g.topics.map((t, i) => topicCardHtml(t, i)).join('');
    const navBtns = `
  <div class="gfam-pager">
    ${prev ? `<a class="btn sm" href="${prev.id}.html">← ${esc(prev.name)}</a>` : '<span></span>'}
    <a class="btn sm soft" href="../grammar.html">全部语法族</a>
    ${next ? `<a class="btn sm" href="${next.id}.html">${esc(next.name)} →</a>` : '<span></span>'}
  </div>`;

    write(`grammar/${g.id}.html`, page({
      base: '../',
      title: `${g.name} · ${g.topics.length} 个语法考点`,
      desc: `${g.name}：${g.topics.map((t) => t.name).join('、')}。含规则公式、例句与中式易错避坑对比。`,
      active: 'grammar',
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../grammar.html">语法体系</a> / ${esc(g.name)}</div>
  <h1>${g.icon} ${esc(g.name)}</h1>
  <p class="lede">${esc(g.hook)}</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="toolbar">
    <button class="chip" id="expandAll">全部展开</button>
    <button class="chip" id="collapseAll">全部收起</button>
    <a class="btn sm primary" href="../review.html" style="margin-left:auto">去练语法题 →</a>
  </div>
  <div class="tcards">${cardsHtml}</div>
  ${navBtns}
</section>

<div class="note">点击任意考点标题展开公式与避坑对比。<span class="lv A2">A2 巩固</span> 基础复习 · <span class="lv B1">B1 核心</span> 中考必考 · <span class="lv B1+">B1+ 拔高</span> 进阶加分。</div>
`,
      rawScript: `<script>
(function(){
  var expand = document.querySelector('#expandAll');
  var collapse = document.querySelector('#collapseAll');
  var all = function(){ return document.querySelectorAll('.tcard'); };

  // 默认全部收起：浏览器前进/后退会恢复 details 的展开状态，
  // 这里在首屏与 pageshow 时强制收起，保证每次进入页面都是折叠态。
  function collapseAll(){
    all().forEach(function(d){ d.open = false; });
  }
  collapseAll();
  window.addEventListener('pageshow', function(e){
    if (e.persisted) collapseAll();
  });

  if (expand) expand.addEventListener('click', function(){ all().forEach(function(d){ d.open = true; }); });
  if (collapse) collapse.addEventListener('click', collapseAll);

  // 仅当 URL 明确指向某个考点（#考点id）时才展开该条
  var hash = location.hash.replace('#','');
  if (hash) {
    var target = document.getElementById(hash);
    if (target && target.tagName === 'DETAILS') {
      target.open = true;
      setTimeout(function(){ target.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 60);
    }
  }
})();
</script>`,
    }));
  });
}

/* ==========================================================
   5. 闯关背单词（支持四选一 + 闪卡回忆双模式 + 音效开关）
   ========================================================== */
function buildStudy() {
  write('quiz.html', page({
    dataKeys: ['WORDS', 'STATS'],
    dataExtra: { HBZK_AUDIO: AUDIO },
    title: '听音背单词 · 遗忘曲线闯关',
    desc: `用艾宾浩斯遗忘曲线背 ${STATS.total} 个中考课标词条：英音自动朗读，支持四选一闯关与闪卡回忆双模式。`,
    active: 'words-study',
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 听音背单词</div>
  <h1>听音闯关背单词</h1>
  <p class="lede">按 <b>艾宾浩斯遗忘曲线</b> 科学排期：答错 10 分钟后再现，答稳了自动拉长间隔（1 天 → 3 天 → 7 天 → 21 天+），每个词都配英音朗读。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv" id="srsKv">
    <div class="k"><b id="kLeft">—</b><span>尚未学习</span></div>
    <div class="k"><b id="kTotal">—</b><span>已学词数（牢固 <b id="kMature" style="display:inline;font-size:1em;color:var(--ok)">0</b>）</span></div>
    <div class="k"><b id="kDue" style="color:var(--accent)">—</b><span>今日待复习</span></div>
    <div class="k"><b id="kAcc">—</b><span id="kAccSub">背词准确率</span></div>
    <div class="k"><b id="kScope">—</b><span>本范围总词量</span></div>
  </div>
</section>

<section class="section" style="margin-top:16px">
  <div class="scope-bar" style="margin-top:0">
    <div class="scope-bar-label">选择背词词库范围</div>
    <div class="chips" id="scopeBar">
      <button class="chip on" data-s="all">全部词条 <b>${STATS.total}</b></button>
      <button class="chip" data-s="b1">核心高频 <b>${STATS.b1}</b></button>
      <button class="chip" data-s="b2">中频主力 <b>${STATS.b2}</b></button>
      <button class="chip" data-s="b3">拓展词汇 <b>${STATS.b3}</b></button>
      <button class="chip" data-s="phrase">只背短语 <b>${STATS.phrases}</b></button>
    </div>
    <p class="scope-bar-hint" id="scopeHint">全部课标词条，覆盖最全</p>
  </div>
</section>

<section class="section" style="margin-top:16px">
  <div class="card" style="padding:20px 24px">
    <div class="today-goal-row">
      <span>今日已背 <b id="kToday">0</b> / <b id="kGoal">20</b> 词 · 🔥 连续打卡 <b id="kStreak">0</b> 天</span>
      <span class="today-pct" id="kPct">0%</span>
    </div>
    <div class="bar"><i id="kBar" style="width:0%"></i></div>
    <div class="chips" style="margin-top:14px" id="goalChips">
      <span class="quiz-count" style="margin-right:6px">每日目标</span>
      <button class="chip" data-goal="10">10 词</button>
      <button class="chip on" data-goal="20">20 词</button>
      <button class="chip" data-goal="30">30 词</button>
      <button class="chip" data-goal="50">50 词</button>
    </div>
  </div>
</section>

<section class="section" style="margin-top:26px" id="setup">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>开始本轮闯关</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startBtn">开始背单词 →</button>
        <button class="btn ghost sm" id="resetBtn">重置进度</button>
      </div>
    </div>

    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">学习模式</div>
        <div class="chips" id="cardChips">
          <button class="chip on" data-c="choice">四选一 · 看英选义</button>
          <button class="chip" data-c="recall">闪卡 · 主动回忆</button>
        </div>
        <p class="setup-hint" id="cardHint">听音看词选中文，系统自动判分，中小学生最易上手</p>
      </div>

      <div class="setup-group">
        <div class="kicker">学习内容</div>
        <div class="chips" id="modeChips">
          <button class="chip on" data-m="mix">智能混合</button>
          <button class="chip" data-m="due">只复习到期</button>
          <button class="chip" data-m="new">只学新词</button>
        </div>
        <p class="setup-hint" id="modeHint">到期复习 + 适量新词，兼顾巩固与推进</p>
      </div>

      <div class="setup-group">
        <div class="kicker">英音朗读与音效</div>
        <div class="chips" id="sayChips">
          <button class="chip on" data-say="on">自动朗读 3 遍</button>
          <button class="chip" data-say="off">静音（手动点 🔊）</button>
          <button class="chip on" id="sfxToggle">提示音：开</button>
        </div>
        <p class="setup-hint" id="sayHint">每题出现自动朗读 3 遍英音，耳朵眼睛一起记</p>
      </div>

      <div class="setup-group">
        <div class="kicker">本轮词数</div>
        <p class="setup-hint" style="margin-top:0">每轮出 <b id="lenEcho">20</b> 词，与上方「每日目标」保持一致</p>
      </div>
    </div>

    <div class="note setup-note">
      电脑快捷键：<b>1–4</b> 选答案、<b>空格</b>翻卡、<b>Enter</b> 下一词。答错的词会自动收进<a href="wrong.html">错题本</a>。
    </div>
  </div>
</section>

<section class="section" id="zone" style="display:none"><div id="fc"></div></section>
`,
    script: `
const { WORDS } = window.HBZK_DATA;
const P = window.HBZK;
let mode = 'mix', src = 'all', card = 'choice';
let autoSay = (function () {
  try { var v = localStorage.getItem('pet-autosay'); return v === null ? true : v === '1'; } catch (e) { return true; }
})();

function refreshKv() {
  const pool = src === 'phrase' ? WORDS.filter(w => w.t === 'phrase')
             : src === 'all' ? WORDS
             : WORDS.filter(w => w.tag === src);
  const all = P.srsAll ? P.srsAll() : {};
  const now = Date.now();
  let learned = 0, due = 0, mature = 0, left = 0;
  pool.forEach(w => {
    const r = all[w.w.toLowerCase()];
    if (!r) { left++; return; }
    learned++;
    if ((r.due || 0) <= now) due++;
    if ((r.ivl || 0) >= 21) mature++;
  });
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  set('#kScope', pool.length);
  set('#kLeft', left);
  set('#kTotal', learned);
  set('#kMature', mature);
  set('#kDue', due);

  const acc = P.wordAccStats ? P.wordAccStats(pool) : { answered: 0, rate: null };
  set('#kAcc', acc.rate === null ? '—' : Math.round(acc.rate * 100) + '%');
  const accSub = document.querySelector('#kAccSub');
  if (accSub) accSub.textContent = acc.answered ? '背词准确率（' + acc.answered + ' 次作答）' : '背词准确率';
  const accEl = document.querySelector('#kAcc');
  if (accEl) {
    accEl.style.color = acc.rate === null ? '' : acc.rate >= 0.8 ? 'var(--ok)' : acc.rate >= 0.6 ? 'var(--gold)' : 'var(--rose)';
  }
}
refreshKv();
document.addEventListener('hbzk:srs', refreshKv);

function refreshDaily() {
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  set('#kToday', P.todayWords());
  set('#kGoal', P.goal());
  set('#kStreak', P.streak());
  const pct = P.todayPct();
  set('#kPct', pct + '%');
  const bar = document.querySelector('#kBar');
  if (bar) bar.style.width = pct + '%';
  document.querySelectorAll('#goalChips .chip').forEach(c => {
    c.classList.toggle('on', parseInt(c.getAttribute('data-goal'), 10) === P.goal());
  });
  set('#lenEcho', P.goal());
}
refreshDaily();
document.addEventListener('hbzk:daily', refreshDaily);
document.querySelectorAll('#goalChips .chip').forEach(c => {
  c.addEventListener('click', () => { P.setGoal(c.getAttribute('data-goal')); refreshDaily(); });
});

function pick(sel, attr, cb) {
  document.querySelectorAll(sel + ' .chip[' + attr + ']').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll(sel + ' .chip[' + attr + ']').forEach(x => x.classList.remove('on'));
    c.classList.add('on'); cb(c.getAttribute(attr));
  }));
}
const HINTS = {
  card: {
    choice: '听音看词选中文，系统自动判分，中小学生最易上手',
    recall: '先看英文独立回想，再翻卡自评掌握程度，记忆更深刻'
  },
  mode: {
    mix: '到期复习 + 适量新词，兼顾巩固与推进',
    due: '只复习今天到期的词，专心把旧词钉牢',
    new: '只学还没背过的新词，适合周末集中抢进度'
  },
  src: {
    b1: '先拿下卷面最常见的高频词，性价比最高',
    b2: '阅读与写作的核心主力词，稳冲 100 分',
    b3: '低频拓展词，考前冲刺高分时再补齐',
    all: '全部课标词条，覆盖最全',
    phrase: '高频固定搭配与短语，专攻完形填空与写作'
  }
};
function setHint(id, text) { const el = document.querySelector('#' + id); if (el) el.textContent = text; }

pick('#cardChips', 'data-c', v => { card = v; setHint('cardHint', HINTS.card[v]); });
pick('#modeChips', 'data-m', v => { mode = v; setHint('modeHint', HINTS.mode[v]); refreshKv(); });

document.querySelectorAll('#sayChips .chip[data-say]').forEach(c => {
  if ((c.getAttribute('data-say') === 'on') !== autoSay) c.classList.remove('on');
  else c.classList.add('on');
  c.addEventListener('click', () => {
    document.querySelectorAll('#sayChips .chip[data-say]').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    autoSay = c.getAttribute('data-say') === 'on';
    try { localStorage.setItem('pet-autosay', autoSay ? '1' : '0'); } catch (e) {}
    setHint('sayHint', autoSay ? '每题出现自动朗读 3 遍英音，耳朵眼睛一起记' : '静音模式；想听发音时点单词旁的 🔊');
  });
});

const sfxBtn = document.querySelector('#sfxToggle');
function syncSfx() {
  if (!sfxBtn) return;
  const on = P.sfxEnabled();
  sfxBtn.classList.toggle('on', on);
  sfxBtn.textContent = on ? '提示音：开' : '提示音：关';
}
syncSfx();
if (sfxBtn) sfxBtn.addEventListener('click', () => { P.setSfx(!P.sfxEnabled()); syncSfx(); });

(function initScope() {
  document.querySelectorAll('#scopeBar .chip').forEach(c => {
    c.classList.toggle('on', c.getAttribute('data-s') === src);
    c.addEventListener('click', () => {
      document.querySelectorAll('#scopeBar .chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      src = c.getAttribute('data-s');
      setHint('scopeHint', HINTS.src[src]);
      refreshKv();
    });
  });
  setHint('scopeHint', HINTS.src[src]);
})();

document.querySelector('#startBtn').addEventListener('click', () => {
  const pool = src === 'phrase' ? WORDS.filter(w => w.t === 'phrase')
             : src === 'all' ? WORDS
             : WORDS.filter(w => w.tag === src);
  document.querySelector('#setup').style.display = 'none';
  document.querySelector('#zone').style.display = '';
  P.wordStudy({ mount: '#fc', words: pool, mode, card, limit: P.goal(), backHref: 'quiz.html', autoSay });
  const zone = document.querySelector('#zone');
  window.scrollTo({ top: Math.max(0, zone.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' });
});

document.querySelector('#resetBtn').addEventListener('click', () => {
  if (confirm('确定清空所有背单词进度？此操作无法撤销。')) { P.srsReset(); P.clearKnown(); refreshKv(); P.toast('已重置背单词进度'); }
});
`,
  }));
}

/* ==========================================================
   6. 真题练语法
   ========================================================== */
function buildDrill() {
  const groupOptions = GRAMMAR.map((g) => {
    const n = g.topics.reduce((a, t) => a + (Q_BY_TOPIC.get(t.id) || []).length, 0);
    return `<button class="chip" data-g="${g.id}">${esc(g.name)} · ${n}</button>`;
  }).join('');

  write('review.html', page({
    dataKeys: ['QUESTIONS_ALL', 'GRAMMAR'],
    title: '题型练语法 · 考点专项精练',
    desc: `${Q_STATS.total} 道河北中考题型精练题，覆盖全部 ${GT_IDS.size} 个考点，自动定位最弱考点并收集错题。`,
    active: 'grammar-drill',
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 题型练语法</div>
  <h1>中考题型练语法</h1>
  <p class="lede">${Q_STATS.total} 道精练题完整覆盖 <b>${GT_IDS.size} 个中考核心考点</b>，题型对齐河北卷面：单项选择、短文填空、情景交际。系统实时追踪各考点正确率，自动把薄弱项浮到最前，答错的题一键收进错题本。</p>
</div>

<section class="section" style="margin-top:24px">
  <div class="kv">
    <div class="k"><b id="kQn">0</b><span>累计精练题数</span></div>
    <div class="k"><b id="kRate" style="color:var(--accent)">—</b><span>综合正确率</span></div>
    <div class="k"><b id="kWrong" style="color:var(--rose)">0</b><span>语法错题本</span></div>
  </div>
</section>

<section class="section" style="margin-top:28px" id="setup">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>配置本组练习</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startBtn">开始刷题 →</button>
        <button class="btn ghost sm" id="resetBtn">清空记录</button>
      </div>
    </div>

    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">练习范围</div>
        <div class="chips" id="scopeChips">
          <button class="chip on" data-scope="all">全部考点</button>
          <button class="chip" data-scope="wrong">只练错题本 <span id="wrongN">0</span></button>
          <button class="chip" data-scope="weak">专攻最弱考点</button>
        </div>
        <p class="setup-hint">选「专攻最弱考点」会自动挑出正确率最低的薄弱项集中突破 · <b id="dueN">—</b> 题待复习</p>
      </div>

      <div class="setup-group">
        <div class="kicker">中考题型</div>
        <div class="chips" id="typeChips">
          <button class="chip on" data-t="all">混合题型</button>
          <button class="chip" data-t="choice">单项选择 · ${Q_STATS.choicePlain}</button>
          <button class="chip" data-t="fill">短文填空 · ${Q_STATS.fill}</button>
          <button class="chip" data-t="dialogue">补全对话 · ${Q_STATS.dialogue}</button>
          <button class="chip" data-t="blind">短文填空盲填 · ${Q_STATS.blind}</button>
        </div>
        <p class="setup-hint">盲填是河北短文填空的固定考法（不给提示词，考冠词/介词/连词）</p>
      </div>

      <div class="setup-group">
        <div class="kicker">本组题量</div>
        <div class="chips" id="lenChips">
          <button class="chip" data-l="10">10 题</button>
          <button class="chip on" data-l="20">20 题</button>
          <button class="chip" data-l="40">40 题</button>
        </div>
        <p class="setup-hint">20 题约 8–10 分钟，适合日常打卡</p>
      </div>

      <div class="setup-group wide">
        <div class="kicker">按语法族筛选 <span style="text-transform:none;letter-spacing:0;font-weight:500">· 仅在「全部考点」时生效</span></div>
        <div class="chips" id="groupChips">
          <button class="chip on" data-g="all">不限语法族</button>
          ${groupOptions}
        </div>
      </div>
    </div>

    <div class="note setup-note">
      快捷键：<b>1–4</b> 选答案、<b>Enter</b> 下一题；填空题按 <b>Enter</b> 提交。答错自动进入<a href="wrong.html">错题本</a>。
    </div>
  </div>
</section>

<section class="section" id="zone" style="display:none"><div id="qz"></div></section>
`,
    script: `
const { QUESTIONS_ALL, GRAMMAR } = window.HBZK_DATA;
const P = window.HBZK;
const ALL = QUESTIONS_ALL;
const BY_TOPIC = new Map();
ALL.forEach(q => { if (!BY_TOPIC.has(q.topic)) BY_TOPIC.set(q.topic, []); BY_TOPIC.get(q.topic).push(q); });
const GT = new Map();
const TNAME = new Map();
GRAMMAR.forEach(g => g.topics.forEach(t => { GT.set(t.id, g.id); TNAME.set(t.id, t.name); }));

let scope = 'all', grp = 'all', type = 'all', len = 20, topic = null;

function pick(sel, attr, cb) {
  document.querySelectorAll(sel + ' .chip').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll(sel + ' .chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on'); cb(c.getAttribute(attr));
  }));
}
pick('#scopeChips', 'data-scope', v => scope = v);
pick('#groupChips', 'data-g', v => grp = v);
pick('#typeChips', 'data-t', v => type = v);
pick('#lenChips', 'data-l', v => len = parseInt(v, 10));

function weakestTopic() {
  const st = P.qTopicStats().filter(x => x.n >= 3).sort((a, b) => a.rate - b.rate);
  return st.length ? st[0].topic : null;
}

function refreshStats() {
  const st = P.qTopicStats();
  const n = st.reduce((a, x) => a + x.n, 0);
  const ok = st.reduce((a, x) => a + x.ok, 0);
  const wrong = P.wrongIds().length;
  const set = (id, v) => { const e = document.querySelector(id); if (e) e.textContent = v; };
  set('#kQn', n);
  set('#kRate', n ? Math.round(ok / n * 100) + '%' : '—');
  set('#kWrong', wrong);
  const wn = document.querySelector('#wrongN'); if (wn) wn.textContent = wrong;
  const dueEl = document.querySelector('#dueN');
  if (dueEl) {
    const dm = P.qDueMap ? P.qDueMap() : {};
    const t = Date.now();
    dueEl.textContent = ALL.filter(q => { const d = dm[q.id]; return !d || (d.due || 0) <= t; }).length;
  }
}
refreshStats();
document.addEventListener('hbzk:qlog', refreshStats);

const tp = new URLSearchParams(location.search).get('topic');
if (tp && TNAME.has(tp)) {
  topic = tp;
  const scopeChips = document.querySelector('#scopeChips');
  if (scopeChips) scopeChips.style.display = 'none';
  const banner = document.createElement('div');
  banner.className = 'note';
  banner.style.cssText = 'margin-top:18px;border-left-color:var(--accent)';
  banner.innerHTML = '当前专项考点：<b>' + P.esc(TNAME.get(tp)) + '</b> · 共 ' +
    (BY_TOPIC.get(tp) || []).length + ' 题 · <a href="review.html">切回全部自由练习 →</a>';
  const setup = document.querySelector('#setup');
  if (setup) setup.parentNode.insertBefore(banner, setup);
}

document.querySelector('#startBtn').addEventListener('click', () => {
  let pool = ALL.slice();
  if (topic) {
    pool = pool.filter(q => q.topic === topic);
  } else if (scope === 'wrong') {
    const ids = new Set(P.wrongIds());
    pool = pool.filter(q => ids.has(q.id));
    if (!pool.length) { P.toast('错题本目前是空的，先练一组吧！'); return; }
  } else if (scope === 'weak') {
    const w = weakestTopic();
    if (!w) { P.toast('先练满几题，系统就能自动识别最弱考点'); return; }
    pool = pool.filter(q => q.topic === w);
  } else {
    if (grp !== 'all') pool = pool.filter(q => GT.get(q.topic) === grp);
  }
  if (type === 'blind') pool = pool.filter(q => q.blind);
  else if (type === 'choice') pool = pool.filter(q => (q.type || 'choice') === 'choice' && !q.blind);
  else if (type !== 'all') pool = pool.filter(q => (q.type || 'choice') === type);
  if (!pool.length) { P.toast('当前筛选组合下没有题目，换个条件试试'); return; }

  // 遗忘曲线排期：未练过或已到期的题优先；未到复习时间的答对题不再重复塞进本轮。
  // 「只练错题本」「专攻最弱考点」是用户点名的范围，按原样出，不做排期过滤。
  let finalPool = pool;
  if (scope !== 'wrong' && scope !== 'weak' && !topic) {
    const now = Date.now();
    const dueMap = P.qDueMap ? P.qDueMap() : {};
    const isDue = q => { const d = dueMap[q.id]; return !d || (d.due || 0) <= now; };
    const duePool = pool.filter(isDue);
    if (duePool.length) {
      finalPool = duePool;
    } else {
      // 全部都在复习周期内：挑最早到期的凑一组，避免"没题可练"
      finalPool = pool.slice().sort((a, b) => (dueMap[a.id] ? dueMap[a.id].due : 0) - (dueMap[b.id] ? dueMap[b.id].due : 0));
      P.toast('当前范围的题都在复习周期内，本轮复习最早到期的题');
    }
  }

  document.querySelector('#setup').style.display = 'none';
  document.querySelector('#zone').style.display = '';
  P.quiz({ mount: '#qz', questions: finalPool, limit: len, shuffle: true,
    reviewHref: 'grammar.html', reviewLabel: '回顾语法考点',
    onRestart: () => location.reload(),
    onFinish: refreshStats });
  const zone = document.querySelector('#zone');
  window.scrollTo({ top: Math.max(0, zone.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' });
});

document.querySelector('#resetBtn').addEventListener('click', () => {
  if (confirm('确定清空全部语法练习记录与错题本？')) { P.qReset(); refreshStats(); P.toast('已清空语法记录'); }
});
`,
  }));
}

/* ==========================================================
   6.5 摸底诊断卷（冷启动入口）
   ----------------------------------------------------------
   为什么需要这一页：本站的诊断是按「你做过的题」算的，可新用户一道题都没做过，
   诊断页只能显示「先做 10 道语法题」。对学习主动性不强的学生来说，
   「先做什么」本身就是最难的一步——他会卡在入口。

   这里给一个 15 分钟的小卷：词汇 / 语法 / 阅读三条线各抽几题，
   答完直接告诉他「先补哪条线」，并把这个顺序写进首页的学习路线。
   ========================================================== */
function buildDiagnose() {
  write('diagnose.html', page({
    dataKeys: ['WORDS', 'QUESTIONS_ALL', 'GRAMMAR'],
    dataExtra: { ALL_READING },
    title: '摸底诊断 · 15 分钟找到该先补哪一块',
    desc: '不知道从哪开始？做一份 15 分钟的小卷，按词汇、语法、阅读三条线测出强弱，直接给出该先补哪一块和今天的复习顺序。',
    active: 'diagnose',
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 摸底诊断</div>
  <h1>先测一次，再决定练什么</h1>
  <p class="lede">每个模块都薄弱的时候，最难的不是练，是<b>决定先练哪个</b>。这份小卷从词汇、语法、阅读三条线各抽几题，15 分钟内测完，直接告诉你该先补哪一块，并把顺序写进首页的学习路线。</p>
</div>

<section class="section" id="introSec">
  <div class="card" style="padding:26px 28px">
    <div class="diag-lines">
      <div class="diag-line">
        <span class="dl-ico blue">📖</span>
        <div><b>词汇 · 8 题</b><small>看英文选中文，测词义掌握</small></div>
      </div>
      <div class="diag-line">
        <span class="dl-ico purple">⚡</span>
        <div><b>语法 · 7 题</b><small>跨语法族抽题，测考点短板</small></div>
      </div>
      <div class="diag-line">
        <span class="dl-ico rose">📄</span>
        <div><b>阅读 · 5 题</b><small>一篇短文，测定位与推理</small></div>
      </div>
    </div>
    <div class="diag-actions">
      <button class="btn primary" id="startBtn">开始摸底（约 15 分钟）</button>
      <span class="diag-note" id="lastNote"></span>
    </div>
    <p class="diag-tip">测完不会留错题进错题本——这只是一次「体检」，目的是定方向。之后的练习才计入学习记录。</p>
  </div>
</section>

<section class="section" id="quizSec" style="display:none">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker" id="qKicker">第 1 部分 · 词汇</span>
      <h2 id="qTitle">—</h2>
    </div>
  </div>
  <div id="quizHost"></div>
</section>

<section class="section" id="resultSec" style="display:none">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">诊断结果</span>
      <h2>三条线的强弱，和今天的顺序</h2>
      <span class="sub">下面这个顺序会直接写进首页的学习路线</span>
    </div>
  </div>
  <div id="resultHost"></div>
</section>
`,
    script: `
const { WORDS, QUESTIONS_ALL, GRAMMAR, ALL_READING } = window.HBZK_DATA;
const P = window.HBZK;

const N_WORD = 8, N_GRAM = 7, N_READ = 5;

/* ---- 抽题 ---- */

/* 词汇：跨频档均匀抽，避免全抽到高频简单词或全抽到低频难词。
   频档字段是 tag（b1 高频 / b2 中频 / b3 低频）。 */
function pickWords() {
  const byBand = { b1: [], b2: [], b3: [] };
  WORDS.forEach(w => {
    const b = w.tag || 'b1';
    if (byBand[b] && w.zh) byBand[b].push(w);
  });
  const picked = [];
  const perBand = Math.ceil(N_WORD / 3);
  ['b1', 'b2', 'b3'].forEach(b => {
    picked.push(...P.shuffle(byBand[b].slice()).slice(0, perBand));
  });
  return P.shuffle(picked).slice(0, N_WORD);
}

/* 语法：按语法族轮转抽，保证覆盖面而不是集中在某一族 */
function pickGrammar() {
  const byTopic = new Map();
  QUESTIONS_ALL.forEach(q => {
    if (q.type === 'fill') return;          // 填空题不适合快速摸底
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic).push(q);
  });
  const topics = P.shuffle([...byTopic.keys()]);
  const picked = [];
  for (const t of topics) {
    if (picked.length >= N_GRAM) break;
    const pool = byTopic.get(t);
    picked.push(P.shuffle(pool.slice())[0]);
  }
  return picked;
}

/* 阅读：抽一篇中等难度（B/C 级）的篇章，取前 5 题 */
function pickReading() {
  const pool = (ALL_READING || []).filter(r => r.questions && r.questions.length >= 4);
  if (!pool.length) return null;
  const mid = pool.filter(r => r.level === 'B1' || r.level === 'C');
  const r = P.shuffle((mid.length ? mid : pool).slice())[0];
  return r;
}

const words = pickWords();
const grams = pickGrammar();
const readPassage = pickReading();
const readQs = readPassage ? readPassage.questions.slice(0, N_READ) : [];

/* ---- 结果统计 ---- */
const lines = {
  words:   { n: 0, ok: 0, label: '词汇' },
  grammar: { n: 0, ok: 0, label: '语法' },
  reading: { n: 0, ok: 0, label: '阅读' },
};
function rate(L) { return L.n ? L.ok / L.n : null; }

function showResult() {
  document.querySelector('#quizSec').style.display = 'none';
  const host = document.querySelector('#resultHost');
  const res = {
    lines: {
      words:   { n: lines.words.n, ok: lines.words.ok, rate: rate(lines.words) },
      grammar: { n: lines.grammar.n, ok: lines.grammar.ok, rate: rate(lines.grammar) },
      reading: { n: lines.reading.n, ok: lines.reading.ok, rate: rate(lines.reading) },
    },
    at: Date.now(),
  };
  P.savePlacement(res);
  const order = P.routeOrder();

  const ROUTE_META = {
    words:   { href: 'quiz.html', name: '背单词', ico: '🎧', cls: 'blue',   why: '词义认不出，后面的语法和阅读都会卡在「看不懂」这一层' },
    grammar: { href: 'review.html', name: '练语法', ico: '⚡', cls: 'purple', why: '规则没吃透，短文填空和单选会持续丢分' },
    reading: { href: 'reading.html', name: '学阅读', ico: '📄', cls: 'rose',   why: '读懂了但选错，是定位与推理的方法问题，不是词汇量问题' },
  };

  function bar(L, cls) {
    const r = rate(L);
    const pct = r === null ? 0 : Math.round(r * 100);
    return '<div class="rx-bar-row">' +
      '<span class="rx-bar-label">' + L.label + '</span>' +
      '<span class="rx-bar"><i class="' + cls + '" style="width:' + pct + '%"></i></span>' +
      '<span class="rx-bar-val">' + (r === null ? '未测' : pct + '%') + '</span>' +
      '<span class="rx-bar-sub">' + L.ok + '/' + L.n + ' 题</span>' +
    '</div>';
  }

  const cards = order.map((id, i) => {
    const m = ROUTE_META[id];
    const L = lines[id];
    const r = rate(L);
    return '<div class="rx-card' + (i === 0 ? ' rx-first' : '') + '">' +
      '<span class="rx-tag ' + m.cls + '">' + (i === 0 ? '先练这个' : '第 ' + (i + 1) + ' 位') + '</span>' +
      '<b class="rx-title">' + m.ico + ' ' + m.name + '</b>' +
      '<p class="rx-desc">' + (r === null ? '这次没测到，按顺序排后。' : '正确率 <b>' + Math.round(r * 100) + '%</b>。') + m.why + '</p>' +
      '<a class="btn sm ' + (i === 0 ? 'primary' : 'soft') + '" href="' + m.href + '">去练 →</a>' +
    '</div>';
  }).join('');

  host.innerHTML =
    '<div class="card" style="padding:26px 28px;margin-bottom:22px">' +
      '<b style="display:block;margin-bottom:16px">三条线的正确率</b>' +
      bar(lines.words, 'blue') + bar(lines.grammar, 'purple') + bar(lines.reading, 'rose') +
      '<p class="diag-tip" style="margin-top:16px">正确率低的排在前面。这个顺序已经写进首页的「今日任务」，明天打开首页会按它排。</p>' +
    '</div>' +
    '<div class="rx-grid">' + cards + '</div>' +
    '<div class="card" style="padding:22px 26px;margin-top:22px">' +
      '<b style="display:block;margin-bottom:10px">接下来做什么</b>' +
      '<p style="color:var(--text-2);line-height:1.75;margin:0">' +
        '先按上面的顺序练一周，再回<a href="stats.html">学情诊断</a>看数据变化。' +
        '如果一周后某条线还是最弱，说明那一块不是「练得少」而是「方法不对」，' +
        '这时再去对应的专项页看方法，而不是继续加题量。' +
      '</p>' +
      '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
        '<a class="btn primary" href="' + ROUTE_META[order[0]].href + '">从「' + ROUTE_META[order[0]].name + '」开始 →</a>' +
        '<button class="btn soft" id="retakeBtn">重新测一次</button>' +
        '<a class="btn ghost" href="index.html">回首页</a>' +
      '</div>' +
    '</div>';

  document.querySelector('#resultSec').style.display = '';
  document.querySelector('#resultSec').scrollIntoView({ block: 'start', behavior: 'smooth' });
  const rt = document.querySelector('#retakeBtn');
  if (rt) rt.addEventListener('click', () => location.reload());
}

/* ---- 三段测验依次跑 ---- */
function runWords() {
  document.querySelector('#qKicker').textContent = '第 1 部分 / 3 · 词汇';
  document.querySelector('#qTitle').textContent = '看英文，选出正确的中文释义';
  document.querySelector('#quizSec').style.display = '';
  document.querySelector('#quizSec').scrollIntoView({ block: 'start', behavior: 'smooth' });

  // 词汇题在这里现造：P.quiz 只认 q.stem/options/answer 结构
  const qs = words.map(w => {
    const ds = P.pickDistractors(WORDS, w, 3);
    const opts = [w].concat(ds);
    P.shuffle(opts);
    return {
      id: 'pl-w-' + w.w,
      stem: w.w,
      _isWord: true,
      _word: w,
      options: opts.map(o => o.zh || ''),
      answer: opts.indexOf(w),
    };
  });

  P.quiz({
    mount: '#quizHost',
    questions: qs,
    shuffle: false,
    reviewHref: '',
    placement: true,
    onAnswer: (q, ok) => {
      lines.words.n++;
      if (ok) lines.words.ok++;
    },
    onFinish: () => runGrammar(),
  });
}

function runGrammar() {
  document.querySelector('#qKicker').textContent = '第 2 部分 / 3 · 语法';
  document.querySelector('#qTitle').textContent = '跨语法族抽题，看哪个考点不稳';
  document.querySelector('#quizHost').innerHTML = '';

  P.quiz({
    mount: '#quizHost',
    questions: grams,
    shuffle: true,
    reviewHref: '',
    placement: true,
    onAnswer: (q, ok) => {
      lines.grammar.n++;
      if (ok) lines.grammar.ok++;
    },
    onFinish: () => runReading(),
  });
}

function runReading() {
  if (!readPassage) { showResult(); return; }
  document.querySelector('#qKicker').textContent = '第 3 部分 / 3 · 阅读';
  document.querySelector('#qTitle').textContent = readPassage.title + '（' + readPassage.type + '）';
  document.querySelector('#quizHost').innerHTML = '';

  const passageHtml = '<div class="card" style="padding:22px 26px;margin-bottom:20px">' +
    '<div class="passage-body" style="font-family:var(--en);line-height:1.95;font-size:.95rem">' +
      readPassage.passage.map(l => l ? P.esc(l) : '<br>').join('<br>') +
    '</div></div>';
  const host = document.querySelector('#quizHost');
  host.innerHTML = passageHtml + '<div id="readQuizHost"></div>';

  P.quiz({
    mount: '#readQuizHost',
    questions: readQs,
    shuffle: false,
    reviewHref: '',
    placement: true,
    onAnswer: (q, ok) => {
      lines.reading.n++;
      if (ok) lines.reading.ok++;
    },
    onFinish: () => showResult(),
  });
}

document.querySelector('#startBtn').addEventListener('click', () => {
  document.querySelector('#introSec').style.display = 'none';
  runWords();
});

/* 已有摸底结果时，在入口页提示「上次测过」 */
(function initNote() {
  const el = document.querySelector('#lastNote');
  if (!el) return;
  const pl = P.placement && P.placement();
  if (!pl || !pl.at) return;
  const d = new Date(pl.at);
  el.textContent = '上次摸底：' + d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') +
    '（重测会覆盖上次结果）';
})();
`,
  }));
}

/* ==========================================================
   7. 智能错题本（支持发音 + 一键打印 A4 错题纸）
   ========================================================== */
function buildWrongBook() {
  write('wrong.html', page({
    dataKeys: ['WORDS', 'QUESTIONS_ALL', 'GRAMMAR'],
    dataExtra: { HBZK_AUDIO: AUDIO, CLOZE, ALL_READING, TASK_READING },
    title: '智能错题本 · 重做与打印复习纸',
    desc: '自动收纳错词和语法错题，支持一键重做、英音朗读和 A4 错题复习纸打印。',
    active: 'wrong',
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 智能错题本</div>
  <h1>智能错题本</h1>
  <p class="lede">错词和错题会自动收录，并按<b>遗忘曲线排期</b>：到期的排在最前，<b>连续答对 3 次</b>才移出——同一个词要在第 1、3、7 天各答对一次，才算真的记住。家长可随时点击「打印错题纸」，方便睡前或考前纸质复盘。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="chips" id="tabs">
    <button class="chip on" data-tab="word">单词错题 <span id="nWord">0</span></button>
    <button class="chip" data-tab="gram">语法错题 <span id="nGram">0</span></button>
    <button class="chip" data-tab="passage">篇章错题 <span id="nPassage">0</span></button>
  </div>
  <div class="toolbar" style="margin-top:16px">
    <input class="field" id="wq" type="search" placeholder="在错题本里搜索…" autocomplete="off">
    <button class="chip" id="dueOnly" data-due="1">⏰ 只看到期的 <span id="nDue">0</span></button>
    <select class="field" id="psize" style="max-width:130px;padding:8px 10px;font-size:.84rem">
      <option value="10">每页 10 条</option>
      <option value="20">每页 20 条</option>
      <option value="50">每页 50 条</option>
    </select>
    <button class="btn primary sm" id="redoBtn">重做本页</button>
    <button class="btn soft sm" id="printBtn">🖨️ 打印错题纸</button>
    <button class="btn ghost sm" id="clearBtn">清空列表</button>
  </div>
  <div id="wbList"></div>
  <div class="pager" id="wbPager"></div>
  <div class="empty" id="wbEmpty" style="display:none">
    <b>🎉 错题本是空的！</b>去<a href="quiz.html">背单词</a>或<a href="review.html">练语法</a>，做错的题会自动收进来方便复盘
  </div>
</section>

<section class="section" id="redoZone" style="display:none">
  <div class="section-head"><h2>本页错题重做</h2><span class="sub" id="redoInfo"></span></div>
  <div id="redoHost"></div>
</section>
`,
    script: `
const { WORDS, QUESTIONS_ALL, GRAMMAR } = window.HBZK_DATA;
const P = window.HBZK;
const ALLQ = QUESTIONS_ALL;
const QBYID = new Map(ALLQ.map(q => [q.id, q]));
const WBYW = new Map(WORDS.map(w => [w.w.toLowerCase(), w]));
const { CLOZE, ALL_READING, TASK_READING } = window.HBZK_DATA;
// 篇章题索引：id 形如 cloze-01-3（第3空）、read-02-q2（第2题）
const PBYID = new Map();
CLOZE.forEach(c => c.blanks.forEach(b => {
  PBYID.set(c.id + '-' + b.no, {
    kind: 'cloze', title: c.title, skill: b.skill,
    stem: '第 ' + b.no + ' 空',
    answer: b.options[b.answer], options: b.options, why: b.why,
    passage: c.passage.join(' '),
  });
}));
[ALL_READING, TASK_READING].forEach(list => list.forEach(r => r.questions.forEach((q, i) => {
  PBYID.set(r.id + '-q' + (i + 1), {
    kind: 'reading', title: r.title, skill: q.skill,
    stem: q.stem,
    answer: q.type === 'short' || q.type === 'complete' ? q.answer : q.options[q.answer],
    options: q.options || null, why: q.why, locate: q.locate || '', trap: q.trap || '',
    passage: r.passage.join(' '),
  });
})));
const TNAME = new Map();
GRAMMAR.forEach(g => g.topics.forEach(t => TNAME.set(t.id, t.name)));

const PSIZE_KEY = 'pet-wb-psize';
let PAGE_SIZE = parseInt(localStorage.getItem(PSIZE_KEY) || '10', 10);
if ([10, 20, 50].indexOf(PAGE_SIZE) < 0) PAGE_SIZE = 10;
let tab = 'word', page = 0, query = '', onlyDue = false;

function wordItems() {
  return P.wordBookList().map(x => ({ kind: 'word', key: x.w, rec: x, meta: WBYW.get(x.w) || {} }));
}
function gramItems() {
  return P.wrongIds().map(id => {
    const q = QBYID.get(id);
    if (!q) return { kind: 'gram', key: id, rec: {}, q: null, topicName: '' };
    const rec = (P.qLog().wrongIds || {})[id] || {};
    return { kind: 'gram', key: id, rec, q, topicName: TNAME.get(q && q.topic) || '' };
  }).filter(x => x.q);
}
function passageItems() {
  return P.wrongIds().map(id => {
    const rec = (P.qLog().wrongIds || {})[id] || {};
    return { kind: 'passage', key: id, rec, p: PBYID.get(id) };
  }).filter(x => x.p);
}
/* 排序与筛选都按「真正该复习的那天」：
   错词查 SRS 排期，错题查题目排期；已到期的排前面，再按到期日升序。
   这样学生打开错题本看到的第一个就是「现在最该复习的」，而不是「最近错的」。 */
function sortByDue(arr, kindOf) {
  const now = Date.now();
  return arr.map(it => {
    const ts = P.nextDue(it.key, kindOf(it));
    return Object.assign({}, it, { dueAt: ts, isDue: ts === null || ts <= now });
  }).sort((a, b) => {
    if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
    return (a.dueAt || 0) - (b.dueAt || 0);
  });
}
function currentItems() {
  let arr = tab === 'word' ? sortByDue(wordItems(), () => 'word')
    : tab === 'gram' ? sortByDue(gramItems(), () => 'q')
    : sortByDue(passageItems(), () => 'q');
  if (onlyDue) arr = arr.filter(it => it.isDue);
  if (query) {
    const t = query.toLowerCase();
    arr = arr.filter(it => JSON.stringify(it).toLowerCase().includes(t));
  }
  return arr;
}
/* 下次复习日的小标签 */
function dueTag(it) {
  if (!it.dueAt) return '<span class="flag due-now">待首次复习</span>';
  return '<span class="flag ' + (it.isDue ? 'due-now' : 'due-later') + '">' +
    P.esc(P.dueLabel(it.dueAt)) + '</span>';
}
/* 连对进度：3 次连对才移出，界面上要说清还差几次 */
function streakTag(right) {
  const need = P.MASTER_STREAK;
  return '<span class="flag">连对 ' + (right || 0) + '/' + need + '</span>';
}

function wordRow(it) {
  const m = it.meta;
  const origWord = m.w || it.key;
  const canPlay = P.hasAudio(origWord);
  return '<div class="wrow wb-row" data-key="' + P.esc(it.key) + '">' +
    '<span class="w-cell">' +
      (canPlay ? '<button class="w-say" data-say="' + P.esc(origWord) + '" title="听英音">🔊</button>' : '') +
      '<span class="w">' + P.esc(origWord) + (m.ph ? '<span class="ph">/' + P.esc(m.ph) + '/</span>' : '') + '</span>' +
    '</span>' +
    '<span class="pos">' + P.esc(m.posZh || '') + '</span>' +
    '<span class="zh">' + P.esc(m.zh || '（无释义）') + '</span>' +
    '<span class="flag">错 ' + it.rec.wrong + ' 次 · ' + (it.rec.right || 0) + '/' + P.MASTER_STREAK + ' 连对</span>' +
    dueTag(it) +
    '<span class="wb-actions"><button class="btn xs" data-master="' + P.esc(it.key) + '">✓ 已掌握</button></span>' +
  '</div>';
}

function gramRow(it) {
  const q = it.q;
  const typeName = q.type === 'correct' ? '改错' : q.type === 'fill' ? '短文填空' : q.type === 'dialogue' ? '补全对话' : '单项选择';
  return '<div class="wb-gram" data-key="' + P.esc(it.key) + '">' +
    '<div class="qmeta"><span class="qtype">' + typeName + '</span>' +
      '<span class="flag">' + P.esc(it.topicName) + '</span>' +
      (q.level ? '<span class="lv ' + P.esc(q.level) + '">' + P.esc(q.level) + '</span>' : '') +
      streakTag(it.rec.right) + dueTag(it) +
    '</div>' +
    '<div class="wb-stem">' + P.esc(q.stem) + '</div>' +
    '<div class="wb-why">' + P.esc(q.why) + '</div>' +
    (q.trap ? '<div class="wb-trap"><b>干扰项分析：</b>' + P.esc(q.trap) + '</div>' : '') +
    '<div class="wb-actions"><button class="btn xs" data-master="' + P.esc(it.key) + '">✓ 已掌握</button></div>' +
  '</div>';
}

function passageRow(it) {
  const p = it.p;
  const skillName = P.skillName(p.skill);
  const kindName = p.kind === 'cloze' ? '完形填空' : '阅读理解';
  const optHtml = p.options
    ? '<div class="wb-opts">' + p.options.map((o, k) => '<span class="wb-opt">' + 'ABCD'[k] + '. ' + P.esc(o) + '</span>').join('') + '</div>'
    : '';
  return '<div class="wb-gram wb-passage" data-key="' + P.esc(it.key) + '">' +
    '<div class="qmeta">' +
      '<span class="qtype">' + kindName + '</span>' +
      '<span class="flag">' + P.esc(skillName) + '</span>' +
      '<span class="flag" style="background:var(--bg-3);color:var(--text-2)">' + P.esc(p.title) + '</span>' +
      streakTag(it.rec.right) + dueTag(it) +
    '</div>' +
    '<div class="wb-stem">' + P.esc(p.stem) + '</div>' +
    optHtml +
    '<div class="wb-ans"><b>正确答案：</b><span style="color:var(--ok);font-weight:700">' + P.esc(p.answer) + '</span></div>' +
    (p.locate ? '<div class="wb-locate"><b>原文定位：</b><q>' + P.esc(p.locate) + '</q></div>' : '') +
    '<div class="wb-why">' + P.esc(p.why) + '</div>' +
    (p.trap ? '<div class="wb-trap"><b>干扰项分析：</b>' + P.esc(p.trap) + '</div>' : '') +
    '<div class="wb-actions"><button class="btn xs" data-master="' + P.esc(it.key) + '">✓ 已掌握</button></div>' +
  '</div>';
}

function draw() {
  const items = currentItems();
  const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (page >= total) page = total - 1;
  if (page < 0) page = 0;
  const slice = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  document.querySelector('#nWord').textContent = P.wordBookCount();
  document.querySelector('#nGram').textContent = gramItems().length;
  const nP = document.querySelector('#nPassage');
  if (nP) nP.textContent = passageItems().length;
  /* 当前标签页里已到期的条数：学生只想知道「现在该清几条」 */
  const nDueEl = document.querySelector('#nDue');
  if (nDueEl) {
    const now = Date.now();
    const kindOf = tab === 'word' ? 'word' : 'q';
    const src = tab === 'word' ? wordItems() : tab === 'gram' ? gramItems() : passageItems();
    nDueEl.textContent = src.filter(it => {
      const ts = P.nextDue(it.key, kindOf);
      return ts === null || ts <= now;
    }).length;
  }

  const host = document.querySelector('#wbList');
  const empty = document.querySelector('#wbEmpty');
  const pager = document.querySelector('#wbPager');
  const redoBtn = document.querySelector('#redoBtn');
  const clearBtn = document.querySelector('#clearBtn');
  const printBtn = document.querySelector('#printBtn');

  if (!items.length) {
    host.innerHTML = ''; pager.innerHTML = ''; empty.style.display = '';
    redoBtn.disabled = true; clearBtn.disabled = true; printBtn.disabled = true;
    return;
  }
  empty.style.display = 'none';
  redoBtn.disabled = false; clearBtn.disabled = false; printBtn.disabled = false;

  host.innerHTML = tab === 'word'
    ? '<div class="wordlist">' + slice.map(wordRow).join('') + '</div>'
    : tab === 'gram' ? slice.map(gramRow).join('')
    : slice.map(passageRow).join('');

  let html = '<button data-pg="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>‹</button>';
  for (let i = 0; i < total; i++) {
    if (total > 9 && i > 1 && i < total - 2 && Math.abs(i - page) > 1) {
      if (i === 2 || i === total - 3) html += '<span class="pager dots">…</span>';
      continue;
    }
    html += '<button data-pg="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
  }
  html += '<button data-pg="' + (page + 1) + '"' + (page === total - 1 ? ' disabled' : '') + '>›</button>';
  pager.innerHTML = html;
  pager.querySelectorAll('[data-pg]').forEach(b => {
    b.addEventListener('click', () => {
      const p = parseInt(b.getAttribute('data-pg'), 10);
      if (!isNaN(p)) { page = p; draw(); window.scrollTo({ top: 180, behavior: 'smooth' }); }
    });
  });

  host.querySelectorAll('[data-say]').forEach(b => {
    b.addEventListener('click', e => { e.stopPropagation(); P.playWord(b.getAttribute('data-say'), { times: 1 }); });
  });
  host.querySelectorAll('[data-master]').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.getAttribute('data-master');
      if (tab === 'word') P.wordMaster(key); else P.qClearWrong(key);
      P.toast('已移出错题本');
      draw();
    });
  });
}

document.querySelectorAll('#tabs .chip').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('#tabs .chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    tab = c.getAttribute('data-tab');
    page = 0; draw();
  });
});
document.querySelector('#wq').addEventListener('input', e => { query = e.target.value.trim(); page = 0; draw(); });
const dueBtn = document.querySelector('#dueOnly');
if (dueBtn) {
  dueBtn.addEventListener('click', () => {
    onlyDue = !onlyDue;
    dueBtn.classList.toggle('on', onlyDue);
    page = 0; draw();
  });
}
const psizeSel = document.querySelector('#psize');
if (psizeSel) {
  psizeSel.value = String(PAGE_SIZE);
  psizeSel.addEventListener('change', () => {
    PAGE_SIZE = parseInt(psizeSel.value, 10);
    try { localStorage.setItem(PSIZE_KEY, String(PAGE_SIZE)); } catch (e) {}
    page = 0; draw();
  });
}
document.querySelector('#printBtn').addEventListener('click', () => window.print());
document.addEventListener('pet:wordbook', draw);
document.addEventListener('hbzk:qlog', draw);

document.querySelector('#clearBtn').addEventListener('click', () => {
  const label = tab === 'word' ? '单词错题' : '语法错题';
  if (!confirm('确定清空全部' + label + '？此操作不可撤销。')) return;
  if (tab === 'word') P.wordBookReset(); else P.qClearWrong();
  draw();
});

document.querySelector('#redoBtn').addEventListener('click', () => {
  const items = currentItems();
  const slice = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  if (!slice.length) return;
  const zone = document.querySelector('#redoZone');
  zone.style.display = '';
  document.querySelector('#redoInfo').textContent = '本页 ' + slice.length + ' 题 · 答对即推进掌握进度';
  if (tab === 'word') redoWords(slice); else redoGram(slice);
  zone.scrollIntoView({ block: 'start', behavior: 'smooth' });
});

function redoWords(slice) {
  const host = document.querySelector('#redoHost');
  let i = 0, done = 0, released = 0;
  let autoNextTimer = null;
  const AUTO_NEXT_MS = 780;
  function step() {
    clearTimeout(autoNextTimer);
    autoNextTimer = null;
    if (i >= slice.length) {
      P.sfx('win');
      host.innerHTML = '<div class="qcard" style="text-align:center">' +
        '<div style="font-size:1.45rem;font-weight:700">🎉 本页错词重做完成</div>' +
        '<div style="color:var(--text-2);margin-top:8px">答对 ' + done + ' / ' + slice.length + ' · 其中 ' + released + ' 个已移出错题本</div>' +
        '<div style="margin-top:20px"><button class="btn primary" id="rdAgain">返回错题本</button></div></div>';
      host.querySelector('#rdAgain').addEventListener('click', () => { document.querySelector('#redoZone').style.display = 'none'; draw(); });
      return;
    }
    const w = slice[i].meta;
    const ds = P.pickDistractors(WORDS, w, 3);
    const opts = [w].concat(ds);
    P.shuffle(opts);
    const ans = opts.indexOf(w);
    host.innerHTML = '<div class="flash-shell">' +
      '<div class="quiz-top"><div class="quiz-progress"><i style="width:' + (i / slice.length * 100) + '%"></i></div>' +
      '<span class="quiz-count">' + (i + 1) + ' / ' + slice.length + '</span></div>' +
      '<div class="fcard" style="justify-content:flex-start;padding-top:30px;min-height:0">' +
        '<div class="fword" style="font-size:clamp(1.6rem,5vw,2.1rem)">' + P.esc(w.w) + '</div>' +
        '<div style="font-size:.84rem;color:var(--text-3);margin-top:10px">选出正确的中文释义</div></div>' +
      '<div class="qopts" style="margin-top:14px">' +
        opts.map((o, k) => '<button class="qopt" data-k="' + k + '"><span class="key">' + 'ABCD'[k] + '</span><span>' + P.esc(o.zh || '') + '</span></button>').join('') +
      '</div><div id="rfb"></div></div>';
    let answered = false;
    host.querySelectorAll('.qopt').forEach(b => {
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const k = parseInt(b.getAttribute('data-k'), 10);
        const ok = k === ans;
        P.sfx(ok ? 'ok' : 'bad');
        host.querySelectorAll('.qopt').forEach(x => {
          const xi = parseInt(x.getAttribute('data-k'), 10);
          x.classList.add('locked');
          if (xi === ans) x.classList.add('right');
          else if (xi === k) x.classList.add('wrong');
        });
        const mastered = P.wordAttempt(w.w, ok);
        if (ok) { done++; if (mastered) released++; }
        const fb = host.querySelector('#rfb');
        if (ok) {
          // 与背单词页一致：答对后短暂确认，自动进入下一题
          fb.innerHTML = '<div class="feedback auto-next"><b>✓ 对了！' +
            (mastered ? '已移出错题本' : '再对 ' + Math.max(1, P.MASTER_STREAK - (P.wordBook()[w.w.toLowerCase()] || {}).right) + ' 次即移出') +
            '</b>' + P.esc(w.w) + ' · ' + P.esc(w.posZh || '') +
            '<span class="auto-next-hint">即将进入下一题…</span></div>';
          clearTimeout(autoNextTimer);
          autoNextTimer = setTimeout(() => {
            if (!document.body.contains(host)) return;
            i++; step();
          }, AUTO_NEXT_MS);
        } else {
          fb.innerHTML = '<div class="feedback bad"><b>✕ 正确答案：' + P.esc(w.zh) + '</b>' +
            P.esc(w.w) + ' · ' + P.esc(w.posZh || '') + '</div>' +
            '<div class="quiz-actions"><span class="spacer"></span><button class="btn primary" id="rn">下一题 →</button></div>';
          fb.querySelector('#rn').addEventListener('click', () => { i++; step(); });
        }
      });
    });
  }
  step();
}

function redoGram(slice) {
  P.quiz({
    mount: '#redoHost',
    questions: slice.map(it => it.q),
    shuffle: true,
    reviewHref: '',
    onRestart: () => { document.querySelector('#redoZone').style.display = 'none'; draw(); },
  });
}

draw();
`,
  }));
}

/* ==========================================================
   8. 8 周通关计划（交互式打卡 + 考试倒计时节奏推荐）
   ========================================================== */
/* ==========================================================
   11. 篇章阅读（完形填空 + 阅读理解 + 任务型阅读）
   ========================================================== */
function buildReading() {
  const levelCount = {};
  const levelQ = {};
  READING_LEVELS.forEach((lv) => {
    const list = ALL_READING.filter((r) => r.level === lv);
    levelCount[lv] = list.length;
    levelQ[lv] = list.reduce((a, r) => a + r.questions.length, 0);
  });

  const levelName = (lv) => READING_METHODS[lv].name;

  /* ==========================================================
     一级：reading.html —— 类型索引
     ========================================================== */
  const levelCards = READING_LEVELS.map((lv) => {
    const m = READING_METHODS[lv];
    return `<a class="card level-card" href="reading/${lv.toLowerCase()}.html">
      <div class="level-badge">${lv}</div>
      <h3>${m.icon} ${esc(m.name)}</h3>
      <p class="desc">${esc(m.tagline)}</p>
      <div class="meta">${levelCount[lv]} 篇 · ${levelQ[lv]} 题</div>
      <span class="level-go">进入 →</span>
    </a>`;
  }).join('');

  const clozeQn = CLOZE.reduce((a, c) => a + c.blanks.length, 0);
  const taskQn = TASK_READING.reduce((a, t) => a + t.questions.length, 0);

  write('reading.html', page({
    title: '整篇理解学阅读 · 完形与阅读专项',
    desc: `仿真河北卷阅读部分：${PASSAGE_STATS.cloze} 篇完形（${PASSAGE_STATS.clozeBlanks} 空）、${PASSAGE_STATS.reading} 篇阅读（${PASSAGE_STATS.readingQ} 题，A/B/C/D 四类各 ${levelCount.A} 篇）、${PASSAGE_STATS.task} 篇任务型阅读（${PASSAGE_STATS.taskQ} 题）。`,
    active: 'reading',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 整篇理解学阅读</div>
  <h1>整篇理解学阅读</h1>
  <p class="lede">河北卷阅读部分共 <b>50 分</b>（完形填空 10 + 阅读理解 40），是拉开分差的主战场。阅读理解按 <b>A 应用文 / B 记叙文 / C 说明文 / D 议论文</b> 四类编排，每类配独立的「读法」策略卡——<b>四类文章读法不同，先学方法再刷题</b>。</p>
</div>

<section class="section reader-stats" style="margin-top:24px">
  <div class="kv">
    <div class="k"><b>${PASSAGE_STATS.cloze}</b><span>完形填空（${PASSAGE_STATS.clozeBlanks} 空）</span></div>
    <div class="k"><b>${PASSAGE_STATS.reading}</b><span>阅读理解（${PASSAGE_STATS.readingQ} 题）</span></div>
    <div class="k"><b>${PASSAGE_STATS.task}</b><span>任务型阅读（${PASSAGE_STATS.taskQ} 题）</span></div>
    <div class="k"><b>${PASSAGE_STATS.totalQ}</b><span>篇章题合计</span></div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">阅读理解 · 四类文章</span>
      <h2>四类文章，四种读法</h2>
      <span class="sub">共 ${PASSAGE_STATS.reading} 篇，每类 ${levelCount.A} 篇。先看读法，再练篇章</span>
    </div>
  </div>
  <div class="grid c4 level-cards">${levelCards}</div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">完形与任务型</span>
      <h2>另两类篇章题型</h2>
      <span class="sub">完形考上下文逻辑，任务型考定位与转述</span>
    </div>
  </div>
  <div class="grid c2">
    <a class="card level-card" href="reading/cloze.html">
      <div class="level-badge" style="background:linear-gradient(135deg,#2563eb,#4f46e5)">CZ</div>
      <h3>🧩 完形填空</h3>
      <p class="desc">先通读全文，再逐空选择。考的是前后呼应、复现与情感线索，不是单句语法。</p>
      <div class="meta">${PASSAGE_STATS.cloze} 篇 · ${clozeQn} 空 · 10 分</div>
      <span class="level-go">进入 →</span>
    </a>
    <a class="card level-card" href="reading/task.html">
      <div class="level-badge" style="background:linear-gradient(135deg,#059669,#10b981)">TK</div>
      <h3>📝 任务型阅读</h3>
      <p class="desc">读短文后按问题简答、补全句子。考的是定位与信息转述能力。</p>
      <div class="meta">${PASSAGE_STATS.task} 篇 · ${taskQn} 题 · 10 分</div>
      <span class="level-go">进入 →</span>
    </a>
  </div>
</section>
`,
    script: ``,
  }));

  /* ==========================================================
     二级：reading/<level>.html —— 该类读法 + 篇章列表
     ========================================================== */
  READING_LEVELS.forEach((lv) => {
    const m = READING_METHODS[lv];
    const list = ALL_READING.filter((r) => r.level === lv);
    const cards = list.map((p2, i) => `
      <a class="card passage-card" href="${p2.id}.html">
        <span class="passage-no">第 ${i + 1} 篇</span>
        <h3>${esc(p2.title)}</h3>
        <p class="desc">${esc(p2.intro)}</p>
        <div class="meta">${p2.questions.length} 题 · 约 ${p2.words} 词</div>
        <span class="level-go">开始练习 →</span>
      </a>`).join('');

    const otherLevels = READING_LEVELS.filter((x) => x !== lv);

    write(`reading/${lv.toLowerCase()}.html`, page({
      base: '../',
      title: `${lv} 篇 · ${m.name}阅读 · 整篇理解学阅读`,
      desc: `${m.name}阅读专项：${m.tagline}。共 ${list.length} 篇，含三步读法与陷阱提示。`,
      active: 'reading',
      dataKeys: [],
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / ${lv} 篇</div>
  <h1>${m.icon} ${esc(m.name)}阅读</h1>
  <p class="lede">${esc(m.tagline)}</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="card method-card">
    <div class="method-title">${m.icon} ${esc(m.name)}的读法</div>
    <p class="method-tagline">${esc(m.tagline)}</p>
    <ol class="method-steps">
      ${m.steps.map((st) => `<li><b>${esc(st.t)}</b><span>${esc(st.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ ${esc(m.trap)}</div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">${lv} 篇 · 共 ${list.length} 篇</span>
      <h2>点开一篇开始练</h2>
      <span class="sub">每篇先读原文再答题，每题给原文定位 + 干扰项分析</span>
    </div>
  </div>
  <div class="grid c2 passage-cards">${cards}</div>
</section>

<section class="section">
  <div class="gfam-pager">
    <a class="btn sm soft" href="../reading.html">← 返回阅读首页</a>
    <span>${otherLevels.map((x) => `<a class="btn sm" href="${x.toLowerCase()}.html">${x} ${esc(levelName(x))}</a>`).join(' ')}</span>
  </div>
</section>
`,
    }));
  });

  /* ==========================================================
     二级：reading/cloze.html 与 reading/task.html
     ========================================================== */
  const clozeCards = CLOZE.map((c, i) => `
    <a class="card passage-card" href="${c.id}.html">
      <span class="passage-no">第 ${i + 1} 篇</span>
      <h3>${esc(c.title)}</h3>
      <p class="desc">${esc(c.intro)}</p>
      <div class="meta">${c.blanks.length} 空 · 约 ${c.words} 词 · ${esc(c.type)}</div>
      <span class="level-go">开始练习 →</span>
    </a>`).join('');

  write('reading/cloze.html', page({
    base: '../',
    title: '完形填空 · 整篇理解学阅读',
    desc: `河北中考完形填空专项：${CLOZE.length} 篇 ${clozeQn} 空，先通读全文再逐空选择，考上下文逻辑。`,
    active: 'reading',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / 完形填空</div>
  <h1>🧩 完形填空</h1>
  <p class="lede">河北卷完形填空 <b>10 空 10 分</b>。考的不是单句语法，而是<b>上下文逻辑</b>——前后呼应、词汇复现、情感线索。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="card method-card">
    <div class="method-title">🧩 完形填空的读法</div>
    <p class="method-tagline">语境还原型 —— 考的是「前后呼应、词义辨析、情感线索」</p>
    <ol class="method-steps">
      <li><b>先通读，不看选项</b><span>花 1 分钟读完，抓住「谁、做了什么、结果如何」这条主线。不看选项时反而更容易读懂。</span></li>
      <li><b>逐空找依据</b><span>每个空都要在上下文找到线索：前文交代、后文呼应、固定搭配、或情感色彩一致。找不到依据就先空着。</span></li>
      <li><b>回读查逻辑</b><span>填完把全文再读一遍，检查时态、人称、褒贬是否一致。这步最容易被跳过，也最容易丢分。</span></li>
    </ol>
    <div class="method-trap">⚠ 完形 10 空通常覆盖动词 2–3、名词 1–2、形容词/副词 1–2、连词或介词 1、固定搭配 1。选项看着都通顺时，回原文找「谁和谁呼应」。</div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">共 ${CLOZE.length} 篇</span>
      <h2>点开一篇开始练</h2>
      <span class="sub">答题时原文可点击空位编号回看，答完即时标对错色</span>
    </div>
  </div>
  <div class="grid c2 passage-cards">${clozeCards}</div>
</section>

<section class="section">
  <div class="gfam-pager">
    <a class="btn sm soft" href="../reading.html">← 返回阅读首页</a>
    <a class="btn sm" href="task.html">任务型阅读 →</a>
  </div>
</section>
`,
  }));

  const taskCards = TASK_READING.map((t, i) => `
    <a class="card passage-card" href="${t.id}.html">
      <span class="passage-no">第 ${i + 1} 篇</span>
      <h3>${esc(t.title)}</h3>
      <p class="desc">${esc(t.intro)}</p>
      <div class="meta">${t.questions.length} 题 · 约 ${t.words} 词</div>
      <span class="level-go">开始练习 →</span>
    </a>`).join('');

  write('reading/task.html', page({
    base: '../',
    title: '任务型阅读 · 整篇理解学阅读',
    desc: `河北中考任务型阅读专项：${TASK_READING.length} 篇 ${taskQn} 题，简略回答与完成句子，考定位与转述。`,
    active: 'reading',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / 任务型阅读</div>
  <h1>📝 任务型阅读</h1>
  <p class="lede">河北卷阅读第二节 <b>5 题 10 分</b>。读短文后按问题简答或补全句子，考的是<b>定位</b>与<b>信息转述</b>——答案要能对应原文的信息点。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="card method-card">
    <div class="method-title">📝 任务型阅读的读法</div>
    <p class="method-tagline">定位转述型 —— 答案在原文里，但要自己组织语言</p>
    <ol class="method-steps">
      <li><b>先看问题，带着问题读</b><span>五个问题通常按文章顺序出，先扫一遍问题，读的时候就知道该在哪停留。</span></li>
      <li><b>找到定位句再作答</b><span>每题都能在原文找到一句依据。先划出那句，再用自己的话压缩成答案，不要整句照抄。</span></li>
      <li><b>控制答案长度</b><span>简答题一般 3–8 个词即可；补全句子要注意语法与原文一致（时态、单复数）。</span></li>
    </ol>
    <div class="method-trap">⚠ 常见失分：① 照抄整句（超字数、扣分）；② 只写关键词不成句；③ 补全句子时态与原文不一致。系统判分会接受多种合理表述，但语法错误仍算错。</div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">共 ${TASK_READING.length} 篇</span>
      <h2>点开一篇开始练</h2>
      <span class="sub">简答题输入英文，按 Enter 提交，系统接受多种合理表述</span>
    </div>
  </div>
  <div class="grid c2 passage-cards">${taskCards}</div>
</section>

<section class="section">
  <div class="gfam-pager">
    <a class="btn sm soft" href="../reading.html">← 返回阅读首页</a>
    <a class="btn sm" href="cloze.html">← 完形填空</a>
  </div>
</section>
`,
  }));

  /* ==========================================================
     三级：reading/<篇id>.html —— 单篇练习（独立 URL）
     ========================================================== */
  const pager = (list, idx, dir) => {
    const prev = list[idx - 1];
    const next = list[idx + 1];
    return `<div class="gfam-pager" style="margin-top:26px">
      ${prev ? `<a class="btn sm" href="${prev.id}.html">← 上一篇</a>` : '<span></span>'}
      <a class="btn sm soft" href="${dir}.html">全部 ${list.length} 篇</a>
      ${next ? `<a class="btn sm" href="${next.id}.html">下一篇 →</a>` : '<span></span>'}
    </div>`;
  };

  // 阅读（A/B/C/D）
  READING_LEVELS.forEach((lv) => {
    const m = READING_METHODS[lv];
    const list = ALL_READING.filter((r) => r.level === lv);
    list.forEach((p2, idx) => {
      write(`reading/${p2.id}.html`, page({
        base: '../',
        title: `${p2.title} · ${lv} ${m.name}阅读`,
        desc: `${p2.title}（${m.name} · 约 ${p2.words} 词 · ${p2.questions.length} 题）：先读原文再逐题作答，每题给原文定位与干扰项分析。`,
        active: 'reading',
        dataKeys: [],
        dataExtra: { PASSAGE: p2, METHOD: m },
        body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / <a href="${lv.toLowerCase()}.html">${lv} ${esc(m.name)}</a> / 第 ${idx + 1} 篇</div>
  <h1>${esc(p2.title)}</h1>
  <p class="lede">${esc(p2.intro)}</p>
</div>

<section class="section" style="margin-top:18px">
  <details class="method-fold">
    <summary>${m.icon} ${esc(m.name)}的读法（点开复习）</summary>
    <ol class="method-steps">
      ${m.steps.map((st) => `<li><b>${esc(st.t)}</b><span>${esc(st.d)}</span></li>`).join('')}
    </ol>
    <div class="method-trap">⚠ ${esc(m.trap)}</div>
  </details>
</section>

<section class="section">
  <div id="pz"></div>
  ${pager(list, idx, lv.toLowerCase())}
</section>
`,
        script: `
const P = window.HBZK;
const { PASSAGE } = window.HBZK_DATA;
P.reading({ mount: '#pz', data: PASSAGE, backHref: '../reading.html' });
`,
      }));
    });
  });

  // 完形
  CLOZE.forEach((c, idx) => {
    write(`reading/${c.id}.html`, page({
      base: '../',
      title: `${c.title} · 完形填空`,
      desc: `${c.title}（完形填空 · ${c.blanks.length} 空 · 约 ${c.words} 词）：先通读全文再逐空选择，每空给上下文依据。`,
      active: 'reading',
      dataKeys: [],
      dataExtra: { CLOZE_ONE: c },
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / <a href="cloze.html">完形填空</a> / 第 ${idx + 1} 篇</div>
  <h1>${esc(c.title)}</h1>
  <p class="lede">${esc(c.intro)}</p>
</div>

<section class="section">
  <div id="pz"></div>
  ${pager(CLOZE, idx, 'cloze')}
</section>
`,
      script: `
const P = window.HBZK;
const { CLOZE_ONE } = window.HBZK_DATA;
P.cloze({ mount: '#pz', data: CLOZE_ONE, backHref: '../reading.html' });
`,
    }));
  });

  // 任务型
  TASK_READING.forEach((t, idx) => {
    write(`reading/${t.id}.html`, page({
      base: '../',
      title: `${t.title} · 任务型阅读`,
      desc: `${t.title}（任务型阅读 · ${t.questions.length} 题 · 约 ${t.words} 词）：简略回答与完成句子，系统接受多种合理表述。`,
      active: 'reading',
      dataKeys: [],
      dataExtra: { TASK_ONE: t },
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../reading.html">整篇理解学阅读</a> / <a href="task.html">任务型阅读</a> / 第 ${idx + 1} 篇</div>
  <h1>${esc(t.title)}</h1>
  <p class="lede">${esc(t.intro)}</p>
</div>

<section class="section">
  <div id="pz"></div>
  ${pager(TASK_READING, idx, 'task')}
</section>
`,
      script: `
const P = window.HBZK;
const { TASK_ONE } = window.HBZK_DATA;
P.reading({ mount: '#pz', data: TASK_ONE, backHref: '../reading.html' });
`,
    }));
  });
}

function buildWriting() {
  /* ==========================================================
     写作模块：一级导航页 + 4 个子页 + 8 个范文页
     ========================================================== */

  /* ---------- 一级：writing.html —— 导航 ---------- */
  const guideCards = [
    {
      href: 'writing/steps.html', icon: '🪜', kicker: '方法',
      title: '五步写作流程',
      desc: '从审题到自查，15 分钟怎么分配。每步讲清做什么、为什么。',
      meta: `${WRITING_GUIDE_STATS.steps} 步 · 含时间分配`,
    },
    {
      href: 'writing/structures.html', icon: '🏗', kicker: '骨架',
      title: `${WRITING_GUIDE_STATS.structures} 类体裁的三段式`,
      desc: '通知、书信、议论文、申请信、倡议书、日记。每类给出逐段任务、示例句、必须有与千万别。',
      meta: WRITING_STRUCTURES.map((x) => x.name).join(' · '),
    },
    {
      href: 'writing/phrases.html', icon: '💬', kicker: '句型',
      title: `${WRITING_GUIDE_STATS.phrases} 条高分句型`,
      desc: '按功能分组：开头点题、分层展开、举例支撑、让步转折、结尾收束、提分亮点。每条可朗读。',
      meta: `${WRITING_GUIDE_STATS.phraseGroups} 组 · 可朗读`,
    },
    {
      href: 'writing/traps.html', icon: '⚠️', kicker: '避坑',
      title: `${WRITING_GUIDE_STATS.traps} 条常见扣分点`,
      desc: '按严重程度排序。漏要点与时态混用最致命，亮点句决定能不能上 14 分。',
      meta: '按严重度分级 · 含 ✕ 错例 / ✓ 改法',
    },
  ].map((c) => `
    <a class="card wguide-card" href="${c.href}">
      <div class="wguide-top">
        <span class="wguide-icon">${c.icon}</span>
        <span class="wguide-kicker">${esc(c.kicker)}</span>
      </div>
      <h3>${esc(c.title)}</h3>
      <p class="desc">${esc(c.desc)}</p>
      <div class="meta">${esc(c.meta)}</div>
      <span class="level-go">进入 →</span>
    </a>`).join('');

  const sampleCards = WRITING.map((w, i) => `
    <a class="card writing-card" href="writing/${w.id}.html">
      <span class="passage-no">第 ${i + 1} 篇</span>
      <div class="pc-top">
        <span class="card-ico gold">✎</span>
        <span class="pc-type">${esc(w.genre)}</span>
        <span class="lv ${esc(w.level)}">${esc(w.level)}</span>
      </div>
      <h3>${esc(w.title)}</h3>
      <p class="pc-intro">${esc(w.scene)}</p>
      <div class="pc-foot"><span>${esc(w.words)} · ${w.highlights.length} 个句型</span><span class="pc-go">看范文 →</span></div>
    </a>`).join('');

  write('writing.html', page({
    title: '写作书面表达 · 方法、句型与范文',
    desc: `河北中考书面表达 15 分专项：五步写作流程、${WRITING_GUIDE_STATS.structures} 类体裁骨架、${WRITING_GUIDE_STATS.phrases} 条高分句型、${WRITING_GUIDE_STATS.traps} 条常见扣分点与 ${WRITING_STATS.total} 篇范文。`,
    active: 'writing',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 写作书面表达</div>
  <h1>写作书面表达</h1>
  <p class="lede">河北卷书面表达 <b>15 分</b>，要求 80–100 词、三段式结构。按「<b>方法 → 骨架 → 句型 → 避坑</b>」四步学，最后看范文对照。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="kv">
    <div class="k"><b>${WRITING_GUIDE_STATS.steps}</b><span>步写作流程</span></div>
    <div class="k"><b>${WRITING_GUIDE_STATS.structures}</b><span>类体裁骨架</span></div>
    <div class="k"><b>${WRITING_GUIDE_STATS.phrases}</b><span>条高分句型</span></div>
    <div class="k"><b>${WRITING_STATS.total}</b><span>篇完整范文</span></div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">先学方法</span>
      <h2>四步学会写一篇 15 分的作文</h2>
      <span class="sub">建议按顺序学：先懂流程，再挑骨架，然后备句型，最后避开扣分点</span>
    </div>
  </div>
  <div class="grid c2 wguides">${guideCards}</div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">再看范文</span>
      <h2>${WRITING_STATS.total} 篇完整范文</h2>
      <span class="sub">${WRITING_STATS.genres.join(' · ')} —— 每篇拆解题目要求、写作思路、亮点句型与评分要点</span>
    </div>
  </div>
  <div class="grid c2">${sampleCards}</div>
</section>
`,
  }));

  /* ---------- 子页公共：面包屑 + 子页间导航 ---------- */
  const SUBNAV = [
    { id: 'steps', label: '五步流程', icon: '🪜' },
    { id: 'structures', label: '体裁骨架', icon: '🏗' },
    { id: 'phrases', label: '高分句型', icon: '💬' },
    { id: 'traps', label: '常见扣分', icon: '⚠️' },
  ];
  const subPager = (cur) => {
    const idx = SUBNAV.findIndex((x) => x.id === cur);
    const prev = SUBNAV[idx - 1];
    const next = SUBNAV[idx + 1];
    return `<div class="gfam-pager">
      ${prev ? `<a class="btn sm" href="${prev.id}.html">← ${prev.icon} ${prev.label}</a>` : '<span></span>'}
      <a class="btn sm soft" href="../writing.html">全部写作内容</a>
      ${next ? `<a class="btn sm" href="${next.id}.html">${next.icon} ${next.label} →</a>` : '<span></span>'}
    </div>`;
  };
  const subCrumb = (label) => `<a href="../index.html">首页</a> / <a href="../writing.html">写作书面表达</a> / ${label}`;

  /* ---------- 子页 1：五步流程 ---------- */
  const stepsHtml = WRITING_STEPS.map((st) => `
    <div class="card wstep">
      <div class="wstep-head">
        <span class="wstep-no">${st.no}</span>
        <span class="wstep-title">${st.icon} ${esc(st.title)}</span>
        <span class="wstep-time">${esc(st.time)}</span>
      </div>
      <p class="wstep-detail">${esc(st.detail)}</p>
      <div class="wstep-why">💡 ${esc(st.why)}</div>
    </div>`).join('');

  write('writing/steps.html', page({
    base: '../',
    title: '五步写作流程 · 写作书面表达',
    desc: `河北中考书面表达五步流程：审题、定调、搭架、成文、自查，含 15 分钟时间分配。`,
    active: 'writing',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb">${subCrumb('五步流程')}</div>
  <h1>🪜 五步写作流程</h1>
  <p class="lede">15 分钟写完一篇 15 分的作文：<b>审题 2 分 + 定调 1 分 + 搭架 2 分 + 成文 8 分 + 自查 2 分</b>。每步都讲清做什么、为什么这么做。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="wsteps">${stepsHtml}</div>
</section>

<section class="section">${subPager('steps')}</section>
`,
  }));

  /* ---------- 子页 2：体裁骨架 ---------- */
  const structHtml = WRITING_STRUCTURES.map((st) => `
    <details class="wstruct">
      <summary>
        <span class="wstruct-icon">${st.icon}</span>
        <span class="wstruct-name">${esc(st.name)}</span>
        <span class="wstruct-use">${esc(st.use)}</span>
      </summary>
      <div class="wstruct-body">
        <div class="wstruct-tense"><b>主时态：</b>${esc(st.tense)}</div>
        <div class="wstruct-frame">
          ${st.frame.map((f) => `
            <div class="wf-row">
              <span class="wf-part">${esc(f.part)}</span>
              <span class="wf-job">${esc(f.job)}</span>
              <div class="wf-sample">${esc(f.sample)}</div>
            </div>`).join('')}
        </div>
        <div class="wstruct-notes">
          <div class="wn-must"><b>必须有</b><ul>${st.must.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="wn-avoid"><b>千万别</b><ul>${st.avoid.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </details>`).join('');

  write('writing/structures.html', page({
    base: '../',
    title: `${WRITING_GUIDE_STATS.structures} 类体裁三段式骨架 · 写作书面表达`,
    desc: `河北中考书面表达 ${WRITING_GUIDE_STATS.structures} 类常考体裁的三段式骨架：通知、书信、议论文、申请信、倡议书、日记。`,
    active: 'writing',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb">${subCrumb('体裁骨架')}</div>
  <h1>🏗 体裁三段式骨架</h1>
  <p class="lede">${WRITING_GUIDE_STATS.structures} 类常考体裁，每类给出<b>逐段任务 + 示例句 + 必须有 + 千万别</b>。动笔前先挑一个骨架，照着填内容就不会跑偏。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="wstructs">${structHtml}</div>
</section>

<section class="section">${subPager('structures')}</section>
`,
  }));

  /* ---------- 子页 3：高分句型 ---------- */
  const phraseHtml = WRITING_PHRASES.map((g) => `
    <div class="card wphrase-group">
      <div class="wphrase-head">
        <span class="wphrase-icon">${g.icon}</span>
        <span class="wphrase-fn">${esc(g.fn)}</span>
        <span class="wphrase-count">${g.items.length} 句</span>
      </div>
      <p class="wphrase-hint">${esc(g.hint)}</p>
      <div class="wphrase-list">
        ${g.items.map((it) => `
          <div class="wphrase-item">
            <div class="wphrase-en">${esc(it.en)}<button class="btn xs ghost wph-say" data-en="${esc(it.en)}" title="朗读">🔊</button></div>
            <div class="wphrase-zh">${esc(it.zh)}<span class="wphrase-tag">${esc(it.tag)}</span></div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  write('writing/phrases.html', page({
    base: '../',
    title: `${WRITING_GUIDE_STATS.phrases} 条高分句型 · 写作书面表达`,
    desc: `河北中考书面表达 ${WRITING_GUIDE_STATS.phrases} 条高分句型，按开头、分层、举例、转折、结尾、亮点六组分类，可朗读。`,
    active: 'writing',
    dataKeys: [],
    dataExtra: { HBZK_AUDIO: AUDIO },
    body: `
<div class="page-head">
  <div class="crumb">${subCrumb('高分句型')}</div>
  <h1>💬 高分句型库</h1>
  <p class="lede">${WRITING_GUIDE_STATS.phrases} 条句型分 ${WRITING_GUIDE_STATS.phraseGroups} 组。背句型不要整篇背范文——把这 ${WRITING_GUIDE_STATS.phrases} 句吃透，换题目也能用。点 🔊 可朗读。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="grid c2 wphrases">${phraseHtml}</div>
</section>

<section class="section">${subPager('phrases')}</section>
`,
    script: `
const P = window.HBZK;
document.querySelectorAll('.wph-say').forEach(b => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    P.say(b.getAttribute('data-en'), { times: 1 });
  });
});
`,
  }));

  /* ---------- 子页 4：常见扣分点 ---------- */
  const trapsHtml = WRITING_TRAPS.map((t) => `
    <div class="wtraps-row">
      <div class="wtraps-left">
        <span class="wtraps-name">${esc(t.t)}</span>
        <span class="wtraps-level ${t.level === '最严重' ? 'lv-red' : t.level === '高频' ? 'lv-orange' : 'lv-grey'}">${esc(t.level)}</span>
      </div>
      <div class="wtraps-right">
        <div class="wtraps-bad">✕ ${esc(t.bad)}</div>
        <div class="wtraps-fix">✓ ${esc(t.fix)}</div>
      </div>
    </div>`).join('');

  write('writing/traps.html', page({
    base: '../',
    title: `${WRITING_GUIDE_STATS.traps} 条常见扣分点 · 写作书面表达`,
    desc: `河北中考书面表达 ${WRITING_GUIDE_STATS.traps} 条最常见扣分点，按严重程度分级，每条给错例与改法。`,
    active: 'writing',
    dataKeys: [],
    body: `
<div class="page-head">
  <div class="crumb">${subCrumb('常见扣分')}</div>
  <h1>⚠️ 常见扣分点</h1>
  <p class="lede">${WRITING_GUIDE_STATS.traps} 条扣分点，按严重程度排序。<b>漏要点</b>与<b>时态混用</b>最致命；<b>亮点句</b>决定能不能从 12 分上到 14 分。</p>
</div>

<section class="section" style="margin-top:22px">
  <div class="wtraps">${trapsHtml}</div>
</section>

<section class="section">${subPager('traps')}</section>
`,
  }));

  /* ---------- 范文单篇页 ---------- */
  WRITING.forEach((w, idx) => {
    const prev = WRITING[idx - 1];
    const next = WRITING[idx + 1];
    const words = w.model.split(/\s+/).filter(Boolean).length;
    const matched = WRITING_STRUCTURES.filter((st) =>
      st.name.includes(w.genre) || w.genre.includes(st.name.replace(' / ', '/')) ||
      (w.genre === '跟帖' && st.id === 'opinion') ||
      (w.genre === '发言稿' && st.id === 'opinion'));

    write(`writing/${w.id}.html`, page({
      base: '../',
      title: `${w.title} · ${w.genre}范文`,
      desc: `${w.title}（${w.genre} · ${w.words}）：完整高分范文、写作思路、${w.highlights.length} 个可套用句型与评分要点。`,
      active: 'writing',
      dataKeys: [],
      body: `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../writing.html">写作书面表达</a> / ${esc(w.genre)} / 第 ${idx + 1} 篇</div>
  <h1>${esc(w.title)}</h1>
  <p class="lede">${esc(w.scene)}</p>
  <div class="chips" style="margin-top:14px">
    <span class="chip on" style="cursor:default">${esc(w.genre)}</span>
    <span class="chip" style="cursor:default">${esc(w.words)}</span>
    <span class="chip" style="cursor:default">范文 ${words} 词</span>
    <span class="lv ${esc(w.level)}" style="margin-left:4px">${esc(w.level)}</span>
  </div>
</div>

<section class="section" style="margin-top:24px">
  <div class="wd-grid">
    <div class="wd-col">
      <div class="card" style="padding:20px 22px">
        <div class="kicker">题目要求</div>
        <p style="white-space:pre-line;margin:8px 0 0;line-height:1.9">${esc(w.task)}</p>
      </div>
      <div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">写作思路</div>
        <ol class="wd-outline">${w.outline.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
      </div>
      <div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">评分要点</div>
        <ul class="wd-scoring">${w.scoring.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="wd-col">
      <div class="card wd-model" style="padding:20px 22px">
        <div class="kicker" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span>高分范文</span>
          <button class="btn xs soft" id="sayModel" title="朗读范文">🔊 朗读</button>
        </div>
        <pre class="wd-text">${esc(w.model)}</pre>
      </div>
      <div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">亮点句型（背下来直接用）</div>
        <div class="wd-hl">
          ${w.highlights.map((h, hi) => `<div class="wd-hl-item">
            <div class="wd-hl-en">${esc(h.en)} <button class="btn xs ghost wd-say" data-hl="${hi}" title="朗读这句">🔊</button></div>
            <div class="wd-hl-zh">${esc(h.zh)}</div>
          </div>`).join('')}
        </div>
      </div>
      ${matched.length ? `<div class="card" style="padding:20px 22px;margin-top:16px">
        <div class="kicker">这个体裁的三段式骨架</div>
        ${matched.map((st) => `
          <div class="wd-frame">
            <div class="wd-frame-head">${st.icon} ${esc(st.name)} <span class="wd-frame-tense">${esc(st.tense)}</span></div>
            ${st.frame.map((f) => `<div class="wd-frame-row"><span>${esc(f.part)}</span><span>${esc(f.job)}</span></div>`).join('')}
          </div>`).join('')}
        <div style="margin-top:12px"><a class="btn sm soft" href="structures.html">看完整结构模板 →</a></div>
      </div>` : ''}
    </div>
  </div>
</section>

<section class="section">
  <div class="gfam-pager">
    ${prev ? `<a class="btn sm" href="${prev.id}.html">← 上一篇</a>` : '<span></span>'}
    <a class="btn sm soft" href="../writing.html">全部 ${WRITING.length} 篇</a>
    ${next ? `<a class="btn sm" href="${next.id}.html">下一篇 →</a>` : '<span></span>'}
  </div>
</section>
`,
      dataExtra: { WRITING_ONE: w, HBZK_AUDIO: AUDIO },
      script: `
const P = window.HBZK;
const { WRITING_ONE } = window.HBZK_DATA;
const sayBtn = document.querySelector('#sayModel');
if (sayBtn) sayBtn.addEventListener('click', () => {
  P.say(WRITING_ONE.model, { times: 1 });
  P.toast('正在朗读范文');
});
document.querySelectorAll('.wd-say').forEach(b => {
  b.addEventListener('click', () => {
    const i = parseInt(b.getAttribute('data-hl'), 10);
    const h = WRITING_ONE.highlights[i];
    if (h) P.say(h.en, { times: 1 });
  });
});
`,
    }));
  });
}

/* ==========================================================
   9. 内容与数据说明（纯静态：词表规模、语法分布、口径）
   ========================================================== */
function buildContent() {
  const tagRows = [
    ['核心高频 b1（卷面最常见）', STATS.b1],
    ['中频主力 b2（阅读写作主力）', STATS.b2],
    ['拓展词汇 b3（冲刺阶段认识）', STATS.b3],
  ];
  const topicRows = TOPIC_SORTED.map((t) => `<tr><td>${t.icon} ${esc(t.name)}</td><td>${esc(t.official)}</td><td style="text-align:right">${t.n}</td></tr>`).join('');
  const gramRows = GRAMMAR.map((g) => {
    const n = g.topics.reduce((s, t) => s + t.traps.length, 0);
    const q = g.topics.reduce((s, t) => s + (Q_BY_TOPIC.get(t.id) || []).length, 0);
    return `<tr><td>${g.icon} ${esc(g.name)}</td><td style="text-align:right">${g.topics.length}</td><td style="text-align:right">${n}</td><td style="text-align:right">${q}</td></tr>`;
  }).join('');

  write('content.html', page({
    title: '内容与数据说明',
    desc: `河北中考领航收录的 ${STATS.total} 条课标词表、${GRAMMAR_STATS.topics} 个语法考点、${Q_STATS.total} 道语法题、${PASSAGE_STATS.totalQ} 道篇章题与 ${WRITING_STATS.total} 篇写作范文的规模明细与口径说明。`,
    active: 'content',
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 内容与数据说明</div>
  <h1>内容与数据说明</h1>
  <p class="lede">本站内容依据《义务教育英语课程标准（2022 年版）》与河北省中考英语考试说明编写。这里列出<b>卷面覆盖情况</b>、词表与题库的完整规模，以及每个数字的口径来源。</p>
</div>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">卷面覆盖</span>
      <h2>河北卷 ${TOTAL_SCORE} 分，本站覆盖 ${COVERED_SCORE} 分</h2>
      <span class="sub">未覆盖的部分明确说明原因，不做「全都包了」的模糊表述</span>
    </div>
  </div>
  <table class="gtable">
    <thead><tr><th>卷面部分</th><th style="text-align:right">分值</th><th>本站内容</th><th style="text-align:center">是否覆盖</th></tr></thead>
    <tbody>
      ${PAPER_COVERAGE.map((x) => `<tr>
        <td>${esc(x.part)}</td>
        <td style="text-align:right">${x.score}</td>
        <td>${esc(x.note)}</td>
        <td style="text-align:center">${x.covered ? '<span style="color:var(--ok);font-weight:700">✓</span>' : '<span style="color:var(--text-3)">—</span>'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="note" style="margin-top:14px">合计覆盖 <b>${COVERED_SCORE} / ${TOTAL_SCORE} 分（${Math.round(COVERED_SCORE / TOTAL_SCORE * 100)}%）</b>。唯一未覆盖的是<b>听力理解 30 分</b>——它需要音频素材，本站不提供模拟音频，建议用真题听力配合练习。</div>
</section>

<section class="section">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">内容规模与口径</span>
      <h2>本站全量词表与题库数据明细</h2>
      <span class="sub">所有数字均由构建脚本实时统计，词表基座为课标三级词汇（约 1600 词）</span>
    </div>
  </div>
  <div class="kv">
    <div class="k"><b>${STATS.words}</b><span>单词</span></div>
    <div class="k"><b>${STATS.phrases}</b><span>短语</span></div>
    <div class="k"><b>${STATS.total}</b><span>词条总计</span></div>
    <div class="k"><b>${STATS.topics}</b><span>话题分组</span></div>
    <div class="k"><b>${GRAMMAR_STATS.topics}</b><span>语法考点</span></div>
  </div>
  <table class="gtable" style="margin-top:20px">
    <thead><tr><th>频档分级</th><th style="text-align:right">词条数</th><th style="text-align:right">占比</th></tr></thead>
    <tbody>${tagRows.map(([n, v]) => `<tr><td>${n}</td><td style="text-align:right">${v}</td><td style="text-align:right">${(v / STATS.total * 100).toFixed(1)}%</td></tr>`).join('')}</tbody>
  </table>
</section>

<section class="section">
  <div class="section-head"><h2>篇章题与书面表达</h2><span class="sub">仿真河北卷阅读与写作部分</span></div>
  <table class="gtable">
    <thead><tr><th>模块</th><th style="text-align:right">篇数</th><th style="text-align:right">题量</th><th>对应卷面</th></tr></thead>
    <tbody>
      <tr><td>完形填空</td><td style="text-align:right">${PASSAGE_STATS.cloze}</td><td style="text-align:right">${PASSAGE_STATS.clozeBlanks} 空</td><td>语言运用 10 分</td></tr>
      <tr><td>阅读理解</td><td style="text-align:right">${PASSAGE_STATS.reading}</td><td style="text-align:right">${PASSAGE_STATS.readingQ} 题</td><td>阅读第一节 30 分</td></tr>
      <tr><td>任务型阅读</td><td style="text-align:right">${PASSAGE_STATS.task}</td><td style="text-align:right">${PASSAGE_STATS.taskQ} 题</td><td>阅读第二节 10 分</td></tr>
      <tr><td>书面表达</td><td style="text-align:right">${WRITING_STATS.total}</td><td style="text-align:right">${WRITING_STATS.highlights} 个句型</td><td>书面表达 15 分</td></tr>
    </tbody>
  </table>

  <div class="section-head" style="margin-top:34px"><h2>语法体系与题量分布</h2></div>
  <table class="gtable">
    <thead><tr><th>语法族</th><th style="text-align:right">考点数</th><th style="text-align:right">易错避坑</th><th style="text-align:right">配套题量</th></tr></thead>
    <tbody>${gramRows}</tbody>
  </table>
</section>

<section class="section">
  <div class="section-head"><h2>${TOPIC_SORTED.length} 个话题词量</h2><span class="sub">部分多义词归属多个话题</span></div>
  <table class="gtable">
    <thead><tr><th>中文话题</th><th>英文名</th><th style="text-align:right">词数</th></tr></thead>
    <tbody>${topicRows}</tbody>
  </table>
</section>

<section class="section">
  <div class="section-head"><h2>数据来源与口径说明</h2></div>
  <div class="note">
    <b>词表基座</b>：以《义务教育英语课程标准（2022 年版）》三级词汇表（对应初中 7–9 年级，约 1600 词）为准，词条数据取自 ECDICT 开源词典的「中考」标签词库（1603 条），再补齐初中必会的派生词、词形变化（比较级、过去分词等）与英式/美式拼写别名，合计 ${STATS.total} 条。<br><br>
    <b>中文释义</b>：ECDICT 原始释义存在「首义偏离中学教材义」的情况（如 just 首义为「正直的」、present 首义为「瞄准」），已对 500+ 高频词做人工校订，统一为教材与中考语境的义项；其余词条保留按词性去噪后的前三义。<br><br>
    <b>教材版本</b>：河北省各地市初中英语教材版本不统一（人教版 Go for it! 与冀教版均有使用），但中考词汇与语法范围全省统一以课标与省考试说明为准，因此本站内容与任一版本教材均可对接。<br><br>
    <b>卷面结构</b>：依据 2025 年起河北中考英语全省统一命题方案——满分 120 分，听力理解 30 分、语言运用 25 分（完形填空 10 + 短文填空 15）、阅读理解 40 分、情景交际（补全对话）10 分、书面表达 15 分；相比改革前取消了单项选择与连词成句，新增情景交际。<br><br>
    <b>频档与题库</b>：频档按真实英语语料词频启发式分为高频/中频/低频三档；${GRAMMAR_STATS.topics} 个语法考点与 ${Q_STATS.total} 道精练题依据课标三级语法项目与河北省中考题型（单项选择、短文填空、情景交际）原创编写，覆盖全部考点。其中 <b>${Q_STATS.blind} 道盲填题</b>专门对应河北短文填空「不给提示词、考冠词/介词/连词」的固定考法（该题型在站内以四选一呈现，便于即时判分）。<br><br>
    <b>篇章题与写作</b>：${PASSAGE_STATS.cloze} 篇完形（${PASSAGE_STATS.clozeBlanks} 空）、${PASSAGE_STATS.reading} 篇阅读（${PASSAGE_STATS.readingQ} 题）、${PASSAGE_STATS.task} 篇任务型阅读（${PASSAGE_STATS.taskQ} 题）与 ${WRITING_STATS.total} 篇书面表达范文，<b>语篇均为原创</b>——仅复刻河北卷的题型结构、题材分布与难度梯度（完形 10 空、记叙文/夹叙夹议、220–300 词；阅读四类体裁；写作 80–100 词三段式），<b>不收录真题原文</b>，以避免版权问题与网络流传版本的录入错误。
</div>
</section>

<section class="section">
  <div class="note">
    想看你当前的薄弱项与复习顺序？见<a href="stats.html">学情诊断 →</a>
  </div>
</section>
`,
  }));
}

/* ==========================================================
   10. 学情诊断（错题驱动的薄弱项诊断 + 复习处方）
   ========================================================== */
function buildStats() {
  /* 错词按话题/频档归因，需要 word -> [频档, 话题] 的轻量映射 */
  const WORD_META = {};
  WORDS.forEach((w) => { WORD_META[String(w.w).toLowerCase()] = [w.tag, (w.tp && w.tp[0]) || '']; });
  const TOPIC_NAMES = {};
  TOPICS.forEach((t) => { TOPIC_NAMES[t.id] = t.name; });

  write('stats.html', page({
    title: '学情诊断与复习处方',
    desc: '先看数据再看结论的学情诊断：词汇、语法、阅读三条线分别给出错题量与正确率排行，每条附数据小结，最后生成今天的复习顺序。',
    active: 'stats',
    dataKeys: ['STATS', 'GRAMMAR'],
    dataExtra: { WORD_META, TOPIC_NAMES },
    body: `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 学情诊断</div>
  <h1>学情诊断</h1>
  <p class="lede">先看数据，再看结论。做错的题自动按 <b>词汇 · 语法 · 阅读</b> 三条线归档，每条线给出错题量与正确率；看完三条线的数据，最后一段结论告诉你今天先补哪一块。</p>
</div>

<section class="section" style="margin-top:24px">
  <div class="report-banner">
    <div>
      <h2 id="dxHeading">学情诊断报告</h2>
      <p id="dxSub">做一组题，这里就会列出你当前最该补的薄弱项</p>
    </div>
    <div class="report-actions">
      <button class="btn solid sm" data-open-exam="1">📅 设置考试档案</button>
      <button class="btn sm" id="exportBtn">⬇ 导出学情档案</button>
      <label class="btn sm" style="cursor:pointer">⬆ 导入恢复<input type="file" id="importFile" accept=".json" style="display:none"></label>
    </div>
  </div>
</section>

<section class="section" style="margin-top:30px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">第一步 · 看数据</span>
      <h2>学习数据总览</h2>
      <span class="sub">下面三条线都从这里取数：练习量、正确率与错题沉淀</span>
    </div>
  </div>
  <div class="kv">
    <div class="k"><b id="rWords" style="color:var(--accent)">0</b><span id="rWordsSub">已学词数</span><small id="rWordsNote">已牢固 —</small></div>
    <div class="k"><b id="rQRate" style="color:var(--ok)">—</b><span id="rQSub">语法精练正确率</span><small id="rQNote">累计 — 题</small></div>
    <div class="k"><b id="rPassage" style="color:var(--accent-2)">—</b><span id="rPassageSub">篇章题正确率</span><small id="rPassageNote">累计 — 题</small></div>
    <div class="k"><b id="rWrong" style="color:var(--rose)">0</b><span>错题待清理</span></div>
    <div class="k"><b id="rStreak" style="color:var(--gold)">0 天</b><span>当前连续打卡</span></div>
    <div class="k"><b id="rLevel">Lv.1</b><span id="rXp">中考萌新 · 0 XP</span></div>
  </div>
</section>

<section class="section" id="wDiagSection" style="margin-top:34px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">数据一 · 词汇</span>
      <h2>错词集中在哪些话题</h2>
      <span class="sub">条形长度＝该组错词占全部错词的比重；越集中，越适合成组重记</span>
    </div>
    <a class="btn sm soft" href="wrong.html">去清错词 →</a>
  </div>
  <div id="wDiagList"></div>
  <p class="diag-sum" id="wSum"></p>
</section>

<section class="section" id="gDiagSection" style="margin-top:34px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">数据二 · 语法</span>
      <h2>语法错题落在哪些考点</h2>
      <span class="sub">按错题量从多到少排；红色＝错题未清且正确率偏低</span>
    </div>
    <a class="btn sm soft" href="review.html">去练语法 →</a>
  </div>
  <div id="gDiagList"></div>
  <p class="diag-sum" id="gSum"></p>
</section>

<section class="section" id="rDiagSection" style="margin-top:34px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">数据三 · 阅读</span>
      <h2>篇章错题卡在哪项能力</h2>
      <span class="sub">六项能力：细节定位 / 推理判断 / 主旨与观点 / 上下文逻辑 / 固定搭配 / 语法与词形</span>
    </div>
    <a class="btn sm soft" href="reading.html">去练阅读 →</a>
  </div>
  <div id="rDiagList"></div>
  <p class="diag-sum" id="rSum"></p>
</section>

<section class="section" style="margin-top:40px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">第二步 · 看结论</span>
      <h2>当前遗留的薄弱项与复习顺序</h2>
      <span class="sub" id="dxVerdict">—</span>
    </div>
  </div>
  <div class="rx-grid" id="rxGrid"></div>
  <div class="note" id="dxDueNote" style="display:none;margin-top:16px"></div>
</section>

<section class="section" style="margin-top:34px">
  <div class="card">
    <span class="kicker">练习量</span>
    <h3 style="margin-bottom:4px">近 7 天每天做了多少词和题</h3>
    <p class="meta" id="chartSummary">每天保持节奏，记忆效果远胜考前突击</p>
    <div class="chart-bars" id="chartBars"></div>
  </div>
</section>

<section class="section">
  <div class="note">
    诊断依据只来自你自己做过的题，记录存在本机浏览器。换设备或清缓存前，记得用上方「导出学情档案」备份。想看词表规模与数据口径？见<a href="content.html">内容与数据说明 →</a>
  </div>
</section>
`,
    script: `
const P = window.HBZK;
const D = window.HBZK_DATA;
const TNAME = new Map();
(D.GRAMMAR || []).forEach(function (g) { g.topics.forEach(function (t) { TNAME.set(t.id, t.name); }); });
const WORD_META = D.WORD_META || {};
const TOPIC_NAMES = D.TOPIC_NAMES || {};

function setText(sel, v) { var e = document.querySelector(sel); if (e) e.textContent = v; }
function pctColor(p) { return p === null ? 'var(--text-3)' : p < 60 ? 'var(--rose)' : p < 80 ? 'var(--gold)' : 'var(--ok)'; }
function barCls(p) { return p === null ? 'bar' : p < 60 ? 'bar rose' : p < 80 ? 'bar warn' : 'bar ok'; }

function diagRow(o) {
  var p = o.rate === null ? null : Math.round(o.rate * 100);
  // 词汇行画的是「占全部错词的比重」，不是正确率：用中性配色与「占 X%」表述，避免被误读
  var isShare = o.mode === 'share';
  var barStyle = isShare ? 'bar' : barCls(p);
  var pctStyle = isShare ? 'var(--text-2)' : pctColor(p);
  var pctText = p === null ? '—' : (isShare ? '占 ' + p + '%' : p + '%');
  return '<div class="diag-row">' +
    '<span class="diag-name">' + P.esc(o.name) +
      (o.sub ? '<span class="diag-sub">' + P.esc(o.sub) + '</span>' : '') + '</span>' +
    '<span class="diag-num">' + P.esc(o.num) + '</span>' +
    '<span class="diag-bar ' + barStyle + '"><i style="width:' + (p === null ? 0 : p) + '%"></i></span>' +
    '<span class="diag-pct" style="color:' + pctStyle + '">' + pctText + '</span>' +
    '<span class="diag-act"><span class="sev ' + o.sevCls + '">' + P.esc(o.sevLabel) + '</span>' +
      (o.href ? '<a class="btn xs" href="' + o.href + '">' + P.esc(o.act) + '</a>' : '') + '</span>' +
  '</div>';
}

function emptyBox(text, href, label) {
  return '<div class="empty"><b>' + P.esc(text) + '</b>' +
    (href ? '去<a href="' + href + '">' + P.esc(label) + '</a>，做错的题会自动归到这里' : '') + '</div>';
}

/* 诊断明细列表：超过 DIAG_LIMIT 条时，只显示前 10 条，其余折进「展开剩余 N 项」 */
var DIAG_LIMIT = 10;

function diagList(rows, rowFn) {
  if (rows.length <= DIAG_LIMIT) {
    return '<div class="diag-list">' + rows.map(rowFn).join('') + '</div>';
  }
  var head = rows.slice(0, DIAG_LIMIT).map(rowFn).join('');
  var rest = rows.slice(DIAG_LIMIT).map(rowFn).join('');
  var more = rows.length - DIAG_LIMIT;
  return '<div class="diag-list">' + head + '</div>' +
    '<details class="diag-more">' +
      '<summary>展开剩余 ' + more + ' 项<span class="diag-more-caret" aria-hidden="true"></span></summary>' +
      '<div class="diag-list">' + rest + '</div>' +
    '</details>';
}

/* ---------- 语法考点 ---------- */
function grammarRows() {
  var sm = {};
  P.qTopicStats().forEach(function (x) { sm[x.topic] = x; });
  var wm = {};
  var wl = P.qLog().wrongIds || {};
  Object.keys(wl).forEach(function (id) {
    var r = wl[id] || {};
    if (r.kind === 'passage') return;
    if (!r.t) return;
    wm[r.t] = (wm[r.t] || 0) + 1;
  });
  var ids = Object.keys(sm);
  Object.keys(wm).forEach(function (k) { if (!sm[k]) ids.push(k); });
  var rows = ids.map(function (id) {
    var s = sm[id] || { n: 0, ok: 0 };
    var wq = wm[id] || 0;
    var rate = s.n ? s.ok / s.n : null;
    var sev = wq > 0 ? ((rate === null || rate < 0.6) ? 'high' : 'mid')
            : (rate !== null && s.n >= 3 ? (rate < 0.6 ? 'mid' : 'low') : 'na');
    return { id: id, name: TNAME.get(id) || id, n: s.n, wq: wq, rate: rate, sev: sev };
  });
  var ord = { high: 0, mid: 1, na: 2, low: 3 };
  rows.sort(function (a, b) {
    return (ord[a.sev] - ord[b.sev]) || (b.wq - a.wq) ||
      ((a.rate === null ? 1 : a.rate) - (b.rate === null ? 1 : b.rate));
  });
  return rows;
}

/* ---------- 阅读能力 ---------- */
function readingRows() {
  var sm = {};
  (P.pSkillStats ? P.pSkillStats() : []).forEach(function (x) { sm[x.skill] = x; });
  var wm = {};
  var wl = P.qLog().wrongIds || {};
  Object.keys(wl).forEach(function (id) {
    var r = wl[id] || {};
    if (r.kind !== 'passage') return;
    if (!r.t) return;
    wm[r.t] = (wm[r.t] || 0) + 1;
  });
  var ids = Object.keys(sm);
  Object.keys(wm).forEach(function (k) { if (!sm[k]) ids.push(k); });
  var rows = ids.map(function (k) {
    var s = sm[k] || { n: 0, ok: 0, name: k };
    var wq = wm[k] || 0;
    var rate = s.n ? s.ok / s.n : null;
    var sev = wq > 0 ? ((rate === null || rate < 0.6) ? 'high' : 'mid')
            : (rate !== null && s.n >= 3 ? (rate < 0.6 ? 'mid' : 'low') : 'na');
    return { skill: k, name: s.name || k, n: s.n, wq: wq, rate: rate, sev: sev };
  });
  var ord = { high: 0, mid: 1, na: 2, low: 3 };
  rows.sort(function (a, b) {
    return (ord[a.sev] - ord[b.sev]) || (b.wq - a.wq) ||
      ((a.rate === null ? 1 : a.rate) - (b.rate === null ? 1 : b.rate));
  });
  return rows;
}

/* ---------- 词汇话题 ---------- */
function wordRows() {
  var list = P.wordBookList();
  var map = {};
  list.forEach(function (it) {
    var m = WORD_META[String(it.w).toLowerCase()] || [];
    var tid = m[1] || '';
    var tag = m[0] || 'b3';
    // 词表里有相当一部分词没有话题归属，直接归成「未归类」会让这一行长期霸榜、
    // 诊断价值为零；这里退回按频档分组（高频/中频/拓展），至少能指导复习优先级。
    var k = tid || ('freq_' + tag);
    var cur = map[k] || (map[k] = { id: k, n: 0, times: 0 });
    cur.n++;
    cur.times += (it.wrong || 1);
  });
  var rows = Object.keys(map).map(function (k) { return map[k]; });
  rows.sort(function (a, b) { return (b.n - a.n) || (b.times - a.times); });
  return { rows: rows, total: list.length };
}

var SEV_LABEL = { high: '重点薄弱', mid: '待巩固', low: '状态良好', na: '数据不足' };
var SEV_CLS = { high: 'sev-high', mid: 'sev-mid', low: 'sev-low', na: 'sev-na' };
var FREQ_NAME = { freq_b1: '核心高频词', freq_b2: '中频主力词', freq_b3: '拓展词汇' };

function wordGroupName(id) {
  if (FREQ_NAME[id]) return FREQ_NAME[id];
  return TOPIC_NAMES[id] || id;
}
function wordGroupHref(id) {
  if (FREQ_NAME[id]) return 'words.html';
  return 'topics/' + id + '.html';
}

function renderRx(gRows, rRows, wData) {
  var gTop = null, rTop = null;
  gRows.forEach(function (x) { if (!gTop && (x.sev === 'high' || x.sev === 'mid')) gTop = x; });
  if (!gTop) gTop = gRows[0] || null;
  rRows.forEach(function (x) { if (!rTop && (x.sev === 'high' || x.sev === 'mid')) rTop = x; });
  if (!rTop) rTop = rRows[0] || null;
  var wTop = wData.rows[0] || null;

  function card(o) {
    return '<div class="rx-card">' +
      '<span class="rx-tag ' + o.cls + '">' + P.esc(o.tag) + '</span>' +
      '<b class="rx-title">' + P.esc(o.title) + '</b>' +
      '<p class="rx-desc">' + o.desc + '</p>' +
      (o.href
        ? '<a class="btn sm primary" href="' + o.href + '">' + P.esc(o.act) + '</a>'
        : '<span class="rx-idle">' + P.esc(o.idle) + '</span>') +
    '</div>';
  }

  var cards = [];

  /* 顺序与上方数据线一致：词汇 → 语法 → 阅读 */
  if (wTop) {
    cards.push(card({
      cls: 't-word', tag: '词汇', title: wordGroupName(wTop.id),
      desc: '错词 <b>' + wTop.n + '</b> 个 · 累计答错 ' + wTop.times + ' 次 · 占全部错词 ' +
        (wData.total ? Math.round(wTop.n / wData.total * 100) : 0) + '%',
      href: 'wrong.html', act: '重做这些错词 →'
    }));
  } else {
    cards.push(card({ cls: 't-word', tag: '词汇', title: '错词本是空的', desc: '背单词时答错的词会自动进来，连续答对 3 次才移出。', idle: '暂无诊断', }));
  }

  if (gTop) {
    var gp = gTop.rate === null ? null : Math.round(gTop.rate * 100);
    cards.push(card({
      cls: 't-gram', tag: '语法考点', title: gTop.name,
      desc: (gTop.wq ? '错题 <b>' + gTop.wq + '</b> 条未清 · ' : '') +
        (gp === null ? '还没练过这个考点' : '已练 ' + gTop.n + ' 题 · 正确率 <b>' + gp + '%</b>'),
      href: 'review.html?topic=' + encodeURIComponent(gTop.id), act: '专攻这个考点 →'
    }));
  } else {
    cards.push(card({ cls: 't-gram', tag: '语法考点', title: '还没有语法记录', desc: '做一组语法题，系统就能定位你最容易错的考点。', idle: '暂无诊断', }));
  }

  if (rTop) {
    var rp = rTop.rate === null ? null : Math.round(rTop.rate * 100);
    cards.push(card({
      cls: 't-read', tag: '阅读能力', title: rTop.name,
      desc: (rTop.wq ? '错题 <b>' + rTop.wq + '</b> 条未清 · ' : '') +
        (rp === null ? '还没练过这类题' : '已练 ' + rTop.n + ' 题 · 正确率 <b>' + rp + '%</b>'),
      href: 'wrong.html', act: '重做篇章错题 →'
    }));
  } else {
    cards.push(card({ cls: 't-read', tag: '阅读能力', title: '还没有篇章记录', desc: '做完形或阅读，六项能力哪项最弱会直接算出来。', idle: '暂无诊断', }));
  }

  var host = document.querySelector('#rxGrid');
  if (host) host.innerHTML = cards.join('');
}

function renderReport() {
  var prof = P.profile();
  var lv = P.levelInfo();
  var srs = P.srsStats();
  var qst = P.qTopicStats();
  var qN = qst.reduce(function (a, x) { return a + x.n; }, 0);
  var qOk = qst.reduce(function (a, x) { return a + x.ok; }, 0);
  var days = P.daysLeft();

  setText('#dxHeading', (prof.childName ? prof.childName + '的 ' : '') + '学情诊断报告');
  setText('#dxSub', '目标：' + P.targetLabel() +
    (days !== null && days >= 0 ? ' · 距考试还有 ' + days + ' 天' : ' · 点击右侧可设置考试倒计时'));
  setText('#rLevel', 'Lv.' + lv.lv);
  setText('#rXp', lv.name + ' · ' + lv.xp + ' XP');
  setText('#rStreak', P.streak() + ' 天');
  setText('#rWords', srs.total);
  setText('#rWordsSub', '已学词数');
  setText('#rWordsNote', '已牢固 ' + srs.mature + ' 词');
  setText('#rQRate', qN ? Math.round(qOk / qN * 100) + '%' : '—');
  setText('#rQSub', qN ? '语法精练正确率' : '暂未开始语法练习');
  setText('#rQNote', qN ? '累计 ' + qN + ' 题' : '');
  var pt = P.pTotal ? P.pTotal() : { n: 0, rate: 0 };
  setText('#rPassage', pt.n ? Math.round(pt.rate * 100) + '%' : '—');
  setText('#rPassageSub', '篇章题正确率');
  setText('#rPassageNote', pt.n ? '累计 ' + pt.n + ' 题' : '');
  var wbN = P.wordBookCount(), qwN = P.wrongIds().length;
  setText('#rWrong', wbN + qwN);

  var gRows = grammarRows();
  var rRows = readingRows();
  var wData = wordRows();

  /* 结论一句话：顺序与上方三条数据线一致（词汇 → 语法 → 阅读） */
  var gBad = null, rBad = null;
  gRows.forEach(function (x) { if (!gBad && (x.sev === 'high' || x.sev === 'mid')) gBad = x; });
  rRows.forEach(function (x) { if (!rBad && (x.sev === 'high' || x.sev === 'mid')) rBad = x; });
  var totalWrong = wbN + qwN;
  var verdict;
  if (!totalWrong && !qN && !pt.n) {
    verdict = '还没有练习记录 —— 先做 10 道语法题，上面三条数据线就会有内容';
  } else {
    var bits = [];
    bits.push('共 <b>' + totalWrong + '</b> 条错题待清理');
    if (wData.rows[0]) {
      var wn0 = wData.rows[0];
      bits.push('错词集中在 <b>' + P.esc(wordGroupName(wn0.id)) + '</b>（' + wn0.n + ' 个）');
    }
    if (gBad) bits.push('语法最弱是 <b>' + P.esc(gBad.name) + '</b>' + (gBad.wq ? '（错 ' + gBad.wq + ' 条）' : ''));
    if (rBad) bits.push('阅读最弱是 <b>' + P.esc(rBad.name) + '</b>' + (rBad.wq ? '（错 ' + rBad.wq + ' 条）' : ''));
    verdict = bits.join(' · ') + '。按下方处方逐项清掉，下次诊断会直接看到正确率回升。';
  }
  var vEl = document.querySelector('#dxVerdict');
  if (vEl) vEl.innerHTML = verdict;

  renderRx(gRows, rRows, wData);

  /* 三条数据线的小结：把「看了这些数字说明什么」直接写在数据下面 */
  function sumLine(sel, text, warn) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.innerHTML = text;
    el.style.display = text ? '' : 'none';
    el.className = 'diag-sum' + (warn ? ' warn' : '');
  }

  /* 词汇小结 */
  if (wData.rows.length) {
    var wTotal = wData.total, wTop3 = wData.rows.slice(0, 3);
    var wTop3n = wTop3.reduce(function (a, x) { return a + x.n; }, 0);
    var wConc = wTotal ? Math.round(wTop3n / wTotal * 100) : 0;
    sumLine('#wSum',
      '共 <b>' + wTotal + '</b> 个错词，分布在 <b>' + wData.rows.length + '</b> 组里。' +
      '最多的 3 组占 <b>' + wConc + '%</b>' +
      (wConc >= 60 ? ' —— 很集中，先把这 3 组啃下来收益最大。' : ' —— 比较分散，建议按频档从高频词开始过。'),
      wConc < 60);
  } else {
    sumLine('#wSum', '');
  }

  /* 语法小结 */
  if (gRows.length) {
    var gPracticed = gRows.filter(function (x) { return x.n > 0; });
    var gWeak = gRows.filter(function (x) { return x.sev === 'high'; });
    var gAvg = null;
    if (gPracticed.length) {
      var gn = 0, gok = 0;
      gPracticed.forEach(function (x) { gn += x.n; gok += x.n * x.rate; });
      gAvg = gn ? Math.round(gok / gn * 100) : null;
    }
    sumLine('#gSum',
      '已练 <b>' + gPracticed.length + '</b> 个考点' +
      (gAvg !== null ? '，平均正确率 <b>' + gAvg + '%</b>' : '') +
      (gWeak.length
        ? '。<b>' + gWeak.length + '</b> 个考点错题未清且正确率偏低（红色行），优先专攻。'
        : '。暂无红色项，保持节奏即可。'),
      gWeak.length > 0);
  } else {
    sumLine('#gSum', '');
  }

  /* 阅读小结 */
  if (rRows.length) {
    var rPracticed = rRows.filter(function (x) { return x.n > 0; });
    var rWeak = rRows.filter(function (x) { return x.sev === 'high'; });
    sumLine('#rSum',
      '六项能力里已练 <b>' + rPracticed.length + '</b> 项' +
      (rWeak.length
        ? '，其中 <b>' + rWeak.length + '</b> 项薄弱：' + rWeak.map(function (x) { return P.esc(x.name); }).join('、') + '。'
        : '，暂无红色项。'),
      rWeak.length > 0);
  } else {
    sumLine('#rSum', '');
  }

  /* 到期复习提醒：按「错题本里实际到期的条数」算，而不是只数排期表——
     学生关心的是「打开错题本有几条要清」，两者口径必须一致。 */
  var dueAll = P.dueTotals ? P.dueTotals() : { words: 0, questions: 0, total: 0 };
  var dueNote = document.querySelector('#dxDueNote');
  if (dueNote) {
    if (dueAll.total) {
      dueNote.style.display = '';
      dueNote.innerHTML = '⏰ 今天有 <b>' + dueAll.words + '</b> 个错词、<b>' + dueAll.questions + '</b> 道错题到期 —— ' +
        '先清到期项，比重刷新题更划算：' +
        '<a href="wrong.html">去清错题本</a>';
    } else {
      dueNote.style.display = 'none';
    }
  }

  /* 语法考点 */
  var gHost = document.querySelector('#gDiagList');
  if (gHost) {
    gHost.innerHTML = gRows.length
      ? diagList(gRows, function (x) {
          return diagRow({
            name: x.name,
            sub: x.n ? ('已练 ' + x.n + ' 题') : '还没练过',
            num: '错题 ' + x.wq,
            rate: x.rate,
            sevCls: SEV_CLS[x.sev], sevLabel: SEV_LABEL[x.sev],
            href: 'review.html?topic=' + encodeURIComponent(x.id), act: '专攻 →'
          });
        })
      : emptyBox('还没有语法练习记录', 'review.html', '练语法');
  }

  /* 阅读能力 */
  var rHost = document.querySelector('#rDiagList');
  if (rHost) {
    rHost.innerHTML = rRows.length
      ? diagList(rRows, function (x) {
          return diagRow({
            name: x.name,
            sub: x.n ? ('已练 ' + x.n + ' 题') : '还没练过',
            num: '错题 ' + x.wq,
            rate: x.rate,
            sevCls: SEV_CLS[x.sev], sevLabel: SEV_LABEL[x.sev],
            href: 'wrong.html', act: '重做错题 →'
          });
        })
      : emptyBox('还没有篇章练习记录', 'reading.html', '练阅读');
  }

  /* 词汇话题 */
  var wHost = document.querySelector('#wDiagList');
  if (wHost) {
    var wt = wData.total;
    wHost.innerHTML = wData.rows.length
      ? diagList(wData.rows, function (x) {
          var share = wt ? x.n / wt : 0;
          // 词汇线看「集中度」，但要同时看绝对词数：单个错词占比再高也谈不上集中。
          // 只用绝对阈值（≥5/≥3）会让总量少的用户全落成「零星」；只看占比又会把 1 个词说成「较集中」。
          var sev = (x.n >= 3 && share >= 0.3) ? 'high'
                  : (x.n >= 2 && share >= 0.15) ? 'mid' : 'low';
          return diagRow({
            name: wordGroupName(x.id),
            sub: '累计答错 ' + x.times + ' 次',
            num: x.n + ' 个错词',
            rate: share,
            mode: 'share',
            sevCls: SEV_CLS[sev],
            sevLabel: sev === 'high' ? '集中' : sev === 'mid' ? '较集中' : '零星',
            href: wordGroupHref(x.id),
            act: '看词表 →'
          });
        })
      : emptyBox('错词本是空的', 'quiz.html', '背单词');
  }

  /* 7 日柱状图 */
  var days7 = P.last7Days();
  var maxV = Math.max(10, Math.max.apply(null, days7.map(function (d) { return d.total; })));
  var sum7 = days7.reduce(function (a, d) { return a + d.total; }, 0);
  setText('#chartSummary', sum7
    ? '近 7 天累计完成 ' + sum7 + ' 次词/题练习，继续加油！'
    : '今天开始背第一组词，这里就会点亮 7 天学习曲线');
  var chart = document.querySelector('#chartBars');
  if (chart) {
    chart.innerHTML = days7.map(function (d) {
      var h = d.total ? Math.max(8, Math.round(d.total / maxV * 100)) : 4;
      return '<div class="chart-col">' +
        '<span class="chart-val">' + (d.total || '') + '</span>' +
        '<div class="chart-bar-wrap"><div class="chart-bar" style="height:' + h + '%;' + (d.total ? '' : 'opacity:.25') + '"></div></div>' +
        '<span class="chart-day">' + d.label + '</span>' +
      '</div>';
    }).join('');
  }
}

renderReport();
document.addEventListener('hbzk:profile', renderReport);
document.addEventListener('hbzk:qlog', renderReport);
document.addEventListener('pet:wordbook', renderReport);
document.addEventListener('hbzk:srs', renderReport);

document.querySelector('#exportBtn').addEventListener('click', function () {
  var blob = new Blob([P.exportBackup()], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'hbzk-xueqing-' + P.todayKey() + '.json';
  a.click();
  P.toast('✓ 学情档案已导出保存');
});

document.querySelector('#importFile').addEventListener('change', function (e) {
  var f = e.target.files && e.target.files[0];
  if (!f) return;
  var r = new FileReader();
  r.onload = function () {
    try { P.importBackup(String(r.result || '')); renderReport(); P.toast('✓ 学情档案已导入'); }
    catch (err) { P.toast('导入失败：请确认是导出的 JSON 备份文件'); }
  };
  r.readAsText(f);
});
`,
  }));
}

/* ==========================================================
   构建
   ========================================================== */
function main() {
  const t0 = Date.now();
  buildHome();
  buildWords();
  buildTopics();
  buildGrammar();
  buildStudy();
  buildDrill();
  buildReading();
  buildWriting();
  buildWrongBook();
  buildDiagnose();
  buildStats();
  buildContent();

  const msg = [
    '构建完成（河北中考领航）',
    `  词条 ${STATS.total}（单词 ${STATS.words} / 短语 ${STATS.phrases}）`,
    `  频档 高频 ${STATS.b1} / 中频 ${STATS.b2} / 低频 ${STATS.b3}`,
    `  话题 ${TOPIC_SORTED.length}`,
    `  语法 ${GRAMMAR_STATS.sections} 族 / ${GRAMMAR_STATS.topics} 考点 / ${GRAMMAR_STATS.traps} 条易错`,
    `  语法题 ${Q_STATS.total}（单选 ${Q_STATS.choicePlain} / 短文填空 ${Q_STATS.fill} / 补全对话 ${Q_STATS.dialogue} / 盲填 ${Q_STATS.blind}）`,
    `  篇章题 ${PASSAGE_STATS.totalQ}（完形 ${PASSAGE_STATS.clozeBlanks} 空 / 阅读 ${PASSAGE_STATS.readingQ} 题 / 任务型 ${PASSAGE_STATS.taskQ} 题）`,
    `  书面表达 ${WRITING_STATS.total} 篇`,
    `  发音 ${Object.keys(AUDIO).length} 条`,
    `  考点覆盖 ${GT_IDS.size - Q_TOPIC_MISS.length}/${GT_IDS.size}`,
    `  干扰项分析 ${Q_WITH_TRAP}/${Q_NEED_TRAP.length}`,
    `  耗时 ${Date.now() - t0}ms`,
  ].join('\n');
  console.log(msg);
  if (Q_TOPIC_MISS.length) {
    console.warn('  ⚠ 以下考点还没有题目：', Q_TOPIC_MISS.join(', '));
    process.exitCode = 1;
  }
  if (Q_TRAP_MISS.length) {
    console.warn(`  ⚠ 以下 ${Q_TRAP_MISS.length} 道有选项的题缺 trap：`, Q_TRAP_MISS.join(', '));
    process.exitCode = 1;
  }
  if (Q_TRAP_ORPHAN.length) {
    console.warn('  ⚠ data-trap.js 里有题号在题库中不存在：', Q_TRAP_ORPHAN.join(', '));
    process.exitCode = 1;
  }
}

main();
