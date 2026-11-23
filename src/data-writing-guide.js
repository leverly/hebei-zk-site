/* ==========================================================
   河北中考领航 · 书面表达支撑体系
   对标河北卷书面表达 15 分（80–100 词、三段式）
   四个模块：
     WRITING_STEPS      五步写作流程（审题 → 定调 → 搭架 → 成文 → 自查）
     WRITING_STRUCTURES 六类常考体裁的三段式骨架
     WRITING_PHRASES    按功能分类的高分句型库（开头/过渡/结尾/各体裁专用）
     WRITING_TRAPS      八条最常见的扣分点
   ========================================================== */

/* ---------------- 五步写作流程 ---------------- */
export const WRITING_STEPS = [
  {
    no: 1, icon: '🔍', title: '审题划要点',
    time: '2 分钟',
    detail: '把题目要求拆成编号要点——河北卷通常给 3 条。每条在草稿上写一个中文关键词，写完逐条打勾。',
    why: '这是内容分。漏写一条要点，直接掉一档（15 分里通常丢 2–3 分），比语法错误严重得多。',
  },
  {
    no: 2, icon: '⏱', title: '定时态定人称',
    time: '1 分钟',
    detail: '先确定全文主时态：介绍学校/发通知用一般现在时或将来时；写发生过的事（日记、经历）用一般过去时；提建议用 should / 祈使句。人称也要先定：I / we / you。',
    why: '时态一乱，全文都错。中途改时态是最常见的失分原因，先定好就不用返工。',
  },
  {
    no: 3, icon: '🏗', title: '搭三段框架',
    time: '2 分钟',
    detail: '第一段点题（我是谁、为什么写、写什么）；第二段主体（3 个要点各 1–2 句，用 First / Second / Besides 串起来）；第三段收尾（期待回复 / 表示感谢 / 发出呼吁）。',
    why: '阅卷老师先看结构。分段清楚、有头有尾，格式分先拿到手；三段都糊在一起会被判「结构不清」。',
  },
  {
    no: 4, icon: '✍️', title: '套句式写正文',
    time: '8 分钟',
    detail: '用背熟的句型搭骨架，再填具体内容。宁可用简单句写对，也不要临场造复杂句写错。每段留 1 个亮点（一个从句、一个分词短语或一组对偶）。',
    why: '考场上没有时间推敲长难句。套句式能保证语法正确，把精力留给内容。',
  },
  {
    no: 5, icon: '✅', title: '查三样东西',
    time: '2 分钟',
    detail: '① 要点齐不齐（对着第 1 步的关键词逐条打勾）；② 动词形式对不对（第三人称单数 -s、时态、被动语态）；③ 名词单复数与冠词（a/an/the 有没有漏）。',
    why: '这三类错误占书面表达语法扣分的绝大多数，用 2 分钟专查，通常能救回 1–2 分。',
  },
];

/* ---------------- 六类体裁的三段式骨架 ---------------- */
export const WRITING_STRUCTURES = [
  {
    id: 'notice', name: '通知', icon: '📢',
    use: '学校活动、社团招新、讲座安排、比赛报名',
    tense: '一般将来时 + 一般现在时',
    frame: [
      { part: '第一段', job: '交代 what + when + where', sample: 'Our school will hold a Reading Week from May 12 to May 16 in the school hall.' },
      { part: '第二段', job: '分条列出活动内容（First / Second / Third）', sample: 'First, there will be a book sale. Second, a teacher will give a talk on how to choose books.' },
      { part: '第三段', job: '参加方式 + 注意事项', sample: 'If you want to join, please sign your name before May 10. Remember to keep quiet in the hall.' },
    ],
    must: ['标题 NOTICE 居中', '落款：The Student Union + 日期', '用一般将来时', '祈使句写要求'],
    avoid: ['用 I 开头（通知是集体口吻，应用 we 或不用主语）', '漏掉时间地点'],
  },
  {
    id: 'letter', name: '书信 / 回信', icon: '✉️',
    use: '给笔友回信、给老师写信、邀请信、感谢信',
    tense: '按内容定：回信讲近况用现在时/过去时，邀请用将来时',
    frame: [
      { part: '第一段', job: '称呼 + 说明收到来信 / 写信目的', sample: 'Dear Peter, Thank you for your letter. I am glad to hear that you had a good holiday.' },
      { part: '第二段', job: '按要点回答或叙述（这是主体，占 2/3 篇幅）', sample: 'This summer I did two things. First, I joined a reading club. Second, I learned to cook.' },
      { part: '第三段', job: '反问对方 / 期待回信 + 落款', sample: 'What about you? Please write back soon. Yours, Li Hua' },
    ],
    must: ['称呼 Dear xxx, 顶格', '落款 Yours, / Best wishes, + 署名', '回信要先回应对方'],
    avoid: ['忘记落款', '正文用 Dear 开头却没称呼', '署名写自己真名（题目要求一律用 Li Hua）'],
  },
  {
    id: 'opinion', name: '议论文 / 观点', icon: '⚖️',
    use: '该不该做某事、如何看待某现象、跟帖发表看法',
    tense: '一般现在时为主',
    frame: [
      { part: '第一段', job: '亮明观点（一句话，立场清楚）', sample: 'I think students should be allowed to bring phones to school, but not to use them in class.' },
      { part: '第二段', job: '两条理由 + 具体支撑（First / Second）', sample: 'First, a phone is a safety tool. Second, phones can help with learning.' },
      { part: '第三段', job: '让步或建议 + 收束', sample: 'However, the key word is "control". So my suggestion is simple: phones stay in schoolbags during class.' },
    ],
    must: ['第一句就表明立场', '用 First / Second / Besides 分层', '结尾给建议或呼吁'],
    avoid: ['观点模糊（既说好又说不好，最后没立场）', '理由空泛（只说「有好处」不给具体例子）', '用 always / never 这类绝对词'],
  },
  {
    id: 'apply', name: '申请信 / 自荐', icon: '📝',
    use: '申请志愿者、社团、比赛、学生会',
    tense: '一般现在时（介绍自己）+ 一般将来时（表决心）',
    frame: [
      { part: '第一段', job: '得知消息 + 表明申请意愿', sample: 'I learned from the school website that you are looking for volunteers. I would like to apply.' },
      { part: '第二段', job: '我的优势（2–3 点，每点配一个具体经历）', sample: 'First, I am good at English. Last year I won the school speech contest. Second, I am patient with children.' },
      { part: '第三段', job: '表达期待 + 联系方式 + 落款', sample: 'I hope you will give me this chance. You can call me at 1234-5678. Yours, Li Hua' },
    ],
    must: ['说明「从哪知道的」', '优势要配具体例子', '留联系方式', '态度诚恳但不夸张'],
    avoid: ['只堆形容词没有事实（「我很优秀」但不说做过什么）', '忘记落款与联系方式'],
  },
  {
    id: 'proposal', name: '倡议书', icon: '🌱',
    use: '节约用水、保护环境、光盘行动、文明上网',
    tense: '一般现在时 + 祈使句',
    frame: [
      { part: '第一段', job: '指出问题 + 发出倡议', sample: 'Water is important to us, but many students waste it every day. Let us take action.' },
      { part: '第二段', job: '具体做法（First / Second / Third，用祈使句）', sample: 'First, turn off the tap after washing. Second, reuse water to clean the floor.' },
      { part: '第三段', job: '呼吁 + 号召大家一起做', sample: 'If everyone does a little, we can make a big difference. Let us start today.' },
    ],
    must: ['先摆问题再倡议', '做法要具体可执行', '多用祈使句与 Let us'],
    avoid: ['只喊口号没有具体做法', '通篇 I think（倡议书应以 we / us 为主体）'],
  },
  {
    id: 'diary', name: '日记 / 经历', icon: '📔',
    use: '记一次活动、一次难忘的经历、一天的生活',
    tense: '一般过去时（主体）+ 现在时（感想）',
    frame: [
      { part: '第一段', job: '时间 + 天气 + 事件（一句话交代）', sample: 'Sunday, May 12  Sunny. Today our class visited the city museum.' },
      { part: '第二段', job: '按时间顺序写过程（先…然后…最后…）', sample: 'First we saw an exhibition about old China. Then a guide told us stories behind the objects. Finally we tried making paper ourselves.' },
      { part: '第三段', job: '感受或收获', sample: 'I learned that history is not far away. It is in the things we touch every day.' },
    ],
    must: ['开头交代时间天气（日记格式）', '用一般过去时叙述', '结尾写感受'],
    avoid: ['叙述用现在时', '只记流水账没有感受', '漏掉日记的日期天气'],
  },
];

/* ---------------- 高分句型库（按功能分类） ---------------- */
export const WRITING_PHRASES = [
  {
    fn: '开头点题', icon: '🚩',
    hint: '第一段第一句。作用是让阅卷老师立刻知道你要写什么。',
    items: [
      { en: 'I am writing to tell you about …', zh: '我写信是想告诉你关于……', tag: '书信' },
      { en: 'I am glad to hear that …', zh: '很高兴听说……', tag: '回信' },
      { en: 'Our school will hold … next week.', zh: '我们学校下周将举办……', tag: '通知' },
      { en: 'I learned from the school website that …', zh: '我从学校网站得知……', tag: '申请信' },
      { en: 'In my opinion, …', zh: '在我看来……', tag: '议论文' },
      { en: 'Water is important to us, but many students waste it.', zh: '水对我们很重要，但很多学生在浪费它。', tag: '倡议书' },
    ],
  },
  {
    fn: '分层展开', icon: '📊',
    hint: '第二段主体。把 2–3 个要点串起来，让结构一眼可见。',
    items: [
      { en: 'First, … Second, … Besides, …', zh: '第一……第二……此外……', tag: '通用' },
      { en: 'For one thing, … For another, …', zh: '一方面……另一方面……', tag: '议论文' },
      { en: 'The most important reason is that …', zh: '最重要的原因是……', tag: '议论文' },
      { en: 'What I love most is …', zh: '我最喜欢的是……', tag: '发言稿' },
      { en: 'There are three activities during the week.', zh: '这一周有三项活动。', tag: '通知' },
    ],
  },
  {
    fn: '举例支撑', icon: '🔎',
    hint: '理由后面必须跟事实。空说「有好处」拿不到分。',
    items: [
      { en: 'For example, last year I …', zh: '例如，去年我……', tag: '通用' },
      { en: 'Take my own experience as an example.', zh: '以我自己的经历为例。', tag: '通用' },
      { en: 'Last year I won the school speech contest.', zh: '去年我获得了学校演讲比赛奖。', tag: '申请信' },
      { en: 'This is because …', zh: '这是因为……', tag: '通用' },
    ],
  },
  {
    fn: '让步转折', icon: '🔄',
    hint: '议论文必备。先承认对方有理，再说自己的看法，显得成熟。',
    items: [
      { en: 'It is true that …, but …', zh: '诚然……，但是……', tag: '议论文' },
      { en: 'However, the key word is …', zh: '然而，关键词是……', tag: '议论文' },
      { en: 'Some people think …, but I believe …', zh: '有些人认为……，但我认为……', tag: '议论文' },
      { en: 'Of course, we should not …', zh: '当然，我们不应该……', tag: '议论文' },
    ],
  },
  {
    fn: '结尾收束', icon: '🎯',
    hint: '第三段。期待、感谢、呼吁三选一，要与开头呼应。',
    items: [
      { en: 'I hope you will give me this chance.', zh: '希望您能给我这个机会。', tag: '申请信' },
      { en: 'Please write back soon.', zh: '请尽快回信。', tag: '书信' },
      { en: 'I am looking forward to your reply.', zh: '期待您的回复。', tag: '书信' },
      { en: 'If everyone does a little, we can make a big difference.', zh: '如果每个人都做一点，我们就能带来大改变。', tag: '倡议书' },
      { en: 'Let us start today.', zh: '让我们从今天开始。', tag: '倡议书' },
      { en: 'I hope our school will always be a place where …', zh: '我希望我们学校永远是一个……的地方。', tag: '发言稿' },
    ],
  },
  {
    fn: '提分亮点句', icon: '⭐',
    hint: '每篇留 1–2 个就够。这三种结构最容易得分。',
    items: [
      { en: '… a place where students feel safe to try.', zh: '……一个学生敢于尝试的地方。（where 定语从句）', tag: '定语从句' },
      { en: 'Used in the right way, a phone is a tool, not a toy.', zh: '用得恰当，手机是工具而不是玩具。（分词作状语 + 对偶）', tag: '分词' },
      { en: 'She says a mistake is just a step on the way to being right.', zh: '她说错误只是通往正确答案的一步。（比喻）', tag: '比喻' },
      { en: 'The more you read, the more you know.', zh: '读得越多，懂得越多。（the + 比较级）', tag: '比较级' },
      { en: 'Nothing is really broken. It just needs someone to take the time.', zh: '没有什么是真正坏的，只是需要有人肯花时间。（对偶 + 主题句）', tag: '主题句' },
    ],
  },
];

/* ---------------- 八条常见扣分点 ---------------- */
export const WRITING_TRAPS = [
  {
    t: '要点漏写', level: '最严重',
    bad: '题目给 3 条提示，只写了 2 条。',
    fix: '动笔前把 3 条要点编号写在草稿上，每写完一条打勾。漏一条通常丢 2–3 分，比语法错误严重。',
  },
  {
    t: '时态混用', level: '高频',
    bad: '同一篇里前句用一般现在时，后句突然变成过去时。',
    fix: '第 2 步就定好全文主时态。日记/经历用过去时；通知/介绍用现在时或将来时。写完专查一遍动词。',
  },
  {
    t: '第三人称单数漏 -s', level: '高频',
    bad: 'She say a mistake is just a step.',
    fix: '主语是 he / she / it / 单数名词时，动词必须加 -s/-es。这是书面表达最高频的语法扣分点。',
  },
  {
    t: '可数名词忘复数', level: '高频',
    bad: 'There are many student in our school.',
    fix: 'many / a lot of / several 后面的可数名词必须用复数。写完把每个名词扫一遍。',
  },
  {
    t: '字数不达标', level: '中等',
    bad: '要求 80–100 词，只写了 55 词。',
    fix: '低于 80 词会扣分。三个要点各写 2 句、每句 10 词左右，正好 60–70 词，加上开头结尾刚好 80+。',
  },
  {
    t: '全文没有连接词', level: '中等',
    bad: '句子一句接一句堆着，没有任何 First / Besides / However。',
    fix: '至少用 3 个连接词：First、Second、Besides 分层；However 转折；So / Therefore 收束。有连接词会明显提档。',
  },
  {
    t: '格式缺失', level: '中等',
    bad: '写书信却忘记 Dear / Yours；写通知却没有 NOTICE 标题和落款。',
    fix: '动笔前先写出格式框架（称呼、落款、标题），再填内容。格式分是白送的。',
  },
  {
    t: '通篇简单句无亮点', level: '提分项',
    bad: '全篇都是 I like it. It is good. 这类短句。',
    fix: '至少放 1 个定语从句或宾语从句，再加 1 个分词短语或对偶句。这是从 12 分到 14 分的关键。',
  },
];

export const WRITING_GUIDE_STATS = {
  steps: WRITING_STEPS.length,
  structures: WRITING_STRUCTURES.length,
  phrases: WRITING_PHRASES.reduce((a, g) => a + g.items.length, 0),
  phraseGroups: WRITING_PHRASES.length,
  traps: WRITING_TRAPS.length,
};
