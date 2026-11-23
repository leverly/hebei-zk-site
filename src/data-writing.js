/* ==========================================================
   河北中考领航 · 书面表达数据源（P1）
   仿真河北卷书面表达（15 分）：
     体裁：发言稿 / 书信 / 跟帖 / 通知
     词数：80–100 词
     结构：三段式（点题 → 展开 → 收束）
   每篇提供：题目要求 / 写作思路 / 高分范文 / 亮点句型 / 评分要点
   ========================================================== */

export const WRITING = [
  {
    id: 'wr-01',
    title: 'Proud of My School',
    genre: '发言稿',
    words: '80–100 词',
    level: 'B1',
    scene: '英语班会上，老师请同学们以 Proud of My School 为题发言。',
    task: '请根据以下提示写一篇发言稿：\n1. 学校最美的地方；\n2. 你最喜欢的一门课或一位老师；\n3. 你对学校的祝愿。',
    outline: [
      '第一段：点题 + 学校最美之处（一句话带出）',
      '第二段：具体写课程或老师（用细节，不要空泛）',
      '第三段：祝愿 + 收束（呼应开头）',
    ],
    model: `Good morning, everyone. Today I want to talk about why I am proud of our school.

The most beautiful place in our school is the library. It has large windows, and in the afternoon the sunlight falls on the desks. I often read there after class.

What I love most is our English class. Our teacher, Ms. Wang, never makes us afraid of making mistakes. She says a mistake is just a step on the way to being right. Because of her, I began to enjoy speaking English.

I hope our school will always be a place where students feel safe to try. Thank you.`,
    highlights: [
      { en: 'Today I want to talk about why I am proud of our school.', zh: '点题句：用 why 引导宾语从句，直接亮出主题。' },
      { en: 'It has large windows, and in the afternoon the sunlight falls on the desks.', zh: '细节描写：不说「图书馆很美」，而是写阳光落在桌上，画面感强。' },
      { en: 'She says a mistake is just a step on the way to being right.', zh: '高分句：用比喻把抽象道理讲具体，是拉开档次的写法。' },
      { en: 'I hope our school will always be a place where students feel safe to try.', zh: '收束句：where 引导定语从句，主题升华。' },
    ],
    scoring: [
      '内容完整：三个提示点都要写到（最美之处、课程或老师、祝愿）。',
      '语言准确：时态以一般现在时为主，注意第三人称单数。',
      '结构清晰：分段，有开头问候与结尾致谢（发言稿格式）。',
      '亮点加分：至少 1–2 个复合句（宾语从句、定语从句）与 1 处细节描写。',
    ],
  },
  {
    id: 'wr-02',
    title: 'A Letter to My Pen Friend',
    genre: '书信',
    words: '80–100 词',
    level: 'B1',
    scene: '你的英国笔友 Peter 想了解你的暑假生活。',
    task: '请给 Peter 写一封回信：\n1. 你暑假做了什么（至少两件事）；\n2. 你印象最深的一件事及原因；\n3. 询问他的暑假安排。',
    outline: [
      '第一段：问候 + 说明收到来信（一句话）',
      '第二段：暑假活动 + 印象最深的事（用具体细节）',
      '第三段：询问对方 + 期待回信',
    ],
    model: `Dear Peter,

Thank you for your letter. I am glad to hear that you had a good holiday.

This summer I did two things. First, I joined a reading club at the city library, where we read one book every week. Second, I learned to cook. My grandmother taught me how to make dumplings, and my first ones looked terrible! But the thing I remember most is a trip to the mountains with my father. We got up at four in the morning to watch the sunrise. When the sun came up, nobody spoke. I have never seen anything so beautiful.

What about you? What did you do this summer? Please write back soon.

Yours,
Li Hua`,
    highlights: [
      { en: 'I joined a reading club at the city library, where we read one book every week.', zh: 'where 引导非限制性定语从句，是 B1 高分结构。' },
      { en: 'my first ones looked terrible!', zh: '自嘲式细节，真实自然，比「我学会了做饭」生动得多。' },
      { en: 'When the sun came up, nobody spoke.', zh: '用「没人说话」侧面写震撼，不直说 beautiful。' },
      { en: 'I have never seen anything so beautiful.', zh: '现在完成时 + never，强调「至今最」，结尾有力。' },
    ],
    scoring: [
      '格式正确：称呼 Dear Peter, / 结尾 Yours, Li Hua（书信必备）。',
      '内容完整：两件事 + 最深的一件事及原因 + 询问对方。',
      '时态正确：暑假活动用一般过去时；询问对方可用一般过去或将来。',
      '亮点加分：定语从句、现在完成时、细节描写各一处。',
    ],
  },
  {
    id: 'wr-03',
    title: 'Online Forum: Should Students Use Phones at School?',
    genre: '跟帖',
    words: '80–100 词',
    level: 'B1+',
    scene: '学校论坛在讨论「学生是否应该带手机进校园」，请跟帖发表看法。',
    task: '请用英语跟帖：\n1. 你的观点（支持/反对/有条件允许）；\n2. 两条理由；\n3. 一句建议。',
    outline: [
      '第一段：亮明观点（一句话，立场清楚）',
      '第二段：两条理由（用 First / Second 或 For one thing / For another）',
      '第三段：给建议 + 收束',
    ],
    model: `I think students should be allowed to bring phones to school, but not to use them in class.

First, a phone is a safety tool. If something happens on the way home, a student can call parents at once. Second, phones can help with learning. We use ours to look up new words and to check our answers.

However, the key word is "control". A phone in class takes attention away from the lesson. So my suggestion is simple: phones stay in schoolbags during class, and come out only when a teacher says they are needed.

Used in the right way, a phone is a tool, not a toy.`,
    highlights: [
      { en: 'I think students should be allowed to bring phones to school, but not to use them in class.', zh: '观点句用 but not 限定条件，比「支持」或「反对」更有层次。' },
      { en: 'However, the key word is "control".', zh: '用 However 转折 + 关键词提炼，是议论文的高分写法。' },
      { en: 'So my suggestion is simple: ...', zh: '用冒号引出具体建议，结构清晰。' },
      { en: 'Used in the right way, a phone is a tool, not a toy.', zh: '过去分词作状语 + 对偶（tool/toy），结尾金句。' },
    ],
    scoring: [
      '立场明确：第一句就要让读者知道你的观点。',
      '理由充分：两条理由，且要有具体支撑（不是空话）。',
      '逻辑连接：First / Second / However / So 等连接词齐全。',
      '亮点加分：分词作状语、对偶句、条件限定各一处。',
    ],
  },
  {
    id: 'wr-04',
    title: 'A Notice for the Reading Week',
    genre: '通知',
    words: '80–100 词',
    level: 'B1',
    scene: '你校将举办「阅读周」，你是学生会成员，需要写一则通知。',
    task: '请写一则通知：\n1. 活动时间与地点；\n2. 活动内容（至少两项）；\n3. 参加方式与注意事项。',
    outline: [
      '标题：NOTICE（居中）',
      '第一段：活动名称、时间、地点',
      '第二段：活动内容（分条列出）',
      '第三段：参加方式 + 落款（学生会 + 日期）',
    ],
    model: `NOTICE

Our school will hold a Reading Week from May 12 to May 16. All students are welcome to take part.

During the week, there will be three activities. First, a book sale will be held in the school hall on Monday, where you can buy used books for as little as two yuan. Second, on Wednesday afternoon, a teacher from the city library will give a talk on how to choose good books. Third, on Friday, every class will share their favourite story.

If you want to join the talk, please sign your name on the list outside the school office before May 10. Please remember to keep quiet in the hall.

The Student Union
May 5`,
    highlights: [
      { en: 'Our school will hold a Reading Week from May 12 to May 16.', zh: '通知首句交代 what + when，信息完整。' },
      { en: 'a book sale will be held in the school hall on Monday, where you can buy used books for as little as two yuan', zh: '被动语态 + where 定语从句 + as little as，一句包含三个得分点。' },
      { en: 'If you want to join the talk, please sign your name on the list outside the school office before May 10.', zh: '条件从句 + 祈使句，通知的典型句式。' },
    ],
    scoring: [
      '格式正确：NOTICE 标题、落款（The Student Union + 日期）。',
      '信息完整：时间、地点、内容、参加方式四项齐全。',
      '语言得体：通知用一般将来时与祈使句，语气客观。',
      '亮点加分：被动语态、定语从句、条件从句各一处。',
    ],
  },
  {
    id: 'wr-05',
    title: 'An Invitation to My English Teacher',
    genre: '邀请信',
    words: '80–100 词',
    level: 'B1',
    scene: '你们班将举办英语角活动，想邀请外教 Ms. Green 参加。',
    task: '请给 Ms. Green 写一封邀请信：\n1. 活动时间与地点；\n2. 活动内容；\n3. 期待她参加并说明她能带来什么。',
    outline: [
      '第一段：说明写信目的 + 活动时间地点',
      '第二段：活动内容（分两点，说明为什么想请她）',
      '第三段：期待回复 + 落款',
    ],
    model: `Dear Ms. Green,

I am writing to invite you to our English Corner. It will be held in the school library on Friday, June 6, from 4:00 to 5:30 p.m.

During the activity, students will talk about their favourite books in English. Then we will have a free discussion about school life. We would be very happy if you could come, because you can help us with pronunciation and tell us how students in your country spend their weekends.

Please let me know if you are free that day. I am looking forward to your reply.

Yours,
Li Hua`,
    highlights: [
      { en: 'I am writing to invite you to our English Corner.', zh: '点题句：I am writing to invite you to... 是邀请信的标准开头。' },
      { en: 'It will be held in the school library on Friday, June 6, from 4:00 to 5:30 p.m.', zh: '被动语态 + 时间地点齐全，一句话交代清楚活动信息。' },
      { en: 'We would be very happy if you could come, because ...', zh: '虚拟语气 would + if 从句，礼貌得体，是邀请信的高分句式。' },
      { en: 'I am looking forward to your reply.', zh: '收尾句：look forward to + 名词/动名词，书信必备。' },
    ],
    scoring: [
      '格式正确：称呼 Dear Ms. Green, + 落款 Yours, Li Hua。',
      '信息完整：时间、地点、内容、邀请理由四项齐全。',
      '语气得体：邀请信要用 would / could 这类委婉表达，不能用 must。',
      '亮点加分：被动语态、虚拟语气、look forward to 各一处。',
    ],
  },
  {
    id: 'wr-06',
    title: 'Applying to Be a Volunteer',
    genre: '申请信',
    words: '80–100 词',
    level: 'B1',
    scene: '学校在招募运动会志愿者，你想申请。',
    task: '请写一封申请信：\n1. 从哪得知招募消息；\n2. 你的两项优势（各配一个具体经历）；\n3. 表达期待并提供联系方式。',
    outline: [
      '第一段：得知消息 + 表明申请意愿',
      '第二段：两项优势，每项配具体经历',
      '第三段：期待 + 联系方式 + 落款',
    ],
    model: `Dear Mr. Wang,

I learned from the school notice board that you are looking for volunteers for the sports meeting. I would like to apply for this job.

I think I can be helpful in two ways. First, I am good at English, so I can help foreign visitors. Last year I won the school speech contest. Second, I am strong and I enjoy working with people. I have been a class monitor for two years, and I am used to organizing activities.

I hope you will give me this chance. You can call me at 1234-5678.

Yours,
Li Hua`,
    highlights: [
      { en: 'I learned from the school notice board that you are looking for volunteers.', zh: '申请信标准开头：说明从哪得知消息。learn from... that 引导宾语从句。' },
      { en: 'I think I can be helpful in two ways.', zh: '过渡句：一句话引出下文的两个优势，结构清晰。' },
      { en: 'Last year I won the school speech contest.', zh: '优势必须配事实。只写「我英语好」拿不到分，写出获奖经历才有说服力。' },
      { en: 'I am used to organizing activities.', zh: 'be used to doing = 「习惯于做」，注意 to 是介词，后接动名词。' },
    ],
    scoring: [
      '格式正确：称呼 + 落款。',
      '内容完整：消息来源、两项优势（含事实）、联系方式。',
      '态度得体：诚恳但不夸张，用 I would like to / I hope 而非 I must。',
      '亮点加分：宾语从句、be used to doing、举例支撑各一处。',
    ],
  },
  {
    id: 'wr-07',
    title: 'Let Us Save Water',
    genre: '倡议书',
    words: '80–100 词',
    level: 'B1',
    scene: '你班要出一期「节约用水」主题黑板报，需要一篇倡议书。',
    task: '请写一篇倡议书：\n1. 指出浪费水的现象；\n2. 提出两条具体做法；\n3. 呼吁大家一起行动。',
    outline: [
      '第一段：摆问题 + 发出倡议',
      '第二段：两条具体做法（用祈使句）',
      '第三段：呼吁 + 号召',
    ],
    model: `Dear classmates,

Water is important to us, but many students waste it every day. Some leave the tap running while they wash their hands. Let us take action from today.

First, turn off the tap as soon as you finish washing. Second, do not throw away water that can be used again — you can use it to clean the floor or water the plants. These are small things, but they add up.

If everyone does a little, we can make a big difference. Let us start today, and let us start with ourselves.

The Student Union`,
    highlights: [
      { en: 'Water is important to us, but many students waste it every day.', zh: '开头先摆问题：用 but 转折，从「重要」转到「却在浪费」，为倡议铺垫。' },
      { en: 'Some leave the tap running while they wash their hands.', zh: '具体描写浪费现象，比空说「有人在浪费水」有力得多。' },
      { en: 'These are small things, but they add up.', zh: 'add up = 「积少成多」，是倡议书常用的说理句。' },
      { en: 'If everyone does a little, we can make a big difference.', zh: '收尾金句：条件从句 + make a difference，号召力强。' },
    ],
    scoring: [
      '格式正确：称呼 Dear classmates, + 落款。',
      '内容完整：问题、两条做法、呼吁三项齐全。',
      '语言得体：多用祈使句与 Let us，体现集体口吻。',
      '亮点加分：条件从句、祈使句、add up / make a difference 这类短语。',
    ],
  },
  {
    id: 'wr-08',
    title: 'A Day at the Museum',
    genre: '日记',
    words: '80–100 词',
    level: 'B1',
    scene: '学校组织参观博物馆，请写一篇日记。',
    task: '请写一篇日记：\n1. 日期、天气与事件；\n2. 参观过程（按时间顺序）；\n3. 你的感受或收获。',
    outline: [
      '第一段：日期 + 天气 + 事件（一句话）',
      '第二段：按时间顺序写过程（First / Then / Finally）',
      '第三段：感受或收获',
    ],
    model: `Sunday, May 12    Sunny

Today our class visited the city museum. It was my first time there.

In the morning, we saw an exhibition about old China. First, a guide showed us how people lived a hundred years ago. Then she told us the story behind a broken bowl — it belonged to a family who lost everything in a flood. Finally, we tried making paper by ourselves, and my sheet came out terrible!

On the way back, I kept thinking about that bowl. History is not far away. It is in the things we can still touch.`,
    highlights: [
      { en: 'Sunday, May 12    Sunny', zh: '日记格式：日期 + 天气写在最上方，这是格式分，不能漏。' },
      { en: 'First, a guide showed us ... Then she told us ... Finally, we tried ...', zh: '按时间顺序叙述，First / Then / Finally 让过程一目了然。' },
      { en: 'my sheet came out terrible!', zh: '自嘲式细节，真实自然，比「我学会了造纸」生动得多。' },
      { en: 'History is not far away. It is in the things we can still touch.', zh: '结尾升华：对偶句 + 短句收束，是日记拿高分的关键。' },
    ],
    scoring: [
      '格式正确：日期 + 天气（日记必备，漏了扣格式分）。',
      '内容完整：事件、过程、感受三段齐全。',
      '时态正确：叙述用一般过去时，感想可用一般现在时。',
      '亮点加分：时间顺序连接词、细节描写、结尾升华各一处。',
    ],
  },
];

export const WRITING_STATS = (() => ({
  total: WRITING.length,
  genres: [...new Set(WRITING.map((w) => w.genre))],
  highlights: WRITING.reduce((a, w) => a + w.highlights.length, 0),
}))();
