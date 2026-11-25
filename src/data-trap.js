/* ==========================================================
   语法题「干扰项分析」数据源
   ----------------------------------------------------------
   为什么单独一个文件：trap 是逐题手写的教学内容，和题库的题干/选项
   属于不同的维护节奏（题目可能要改，讲解不用跟着动）。放在一起会让
   data-quiz*.js 变得难读。

   写法约定（与篇章题的 trap 一致）：
   - 说清「错在哪」，不要只说「不符合题意」
   - 错项错误类型归类：形式错误 / 搭配错误 / 语义相反 / 时态错位 /
     张冠李戴 / 过度推断 / 语序错误
   - 同一考点下错误类型相同的，可以复用句式，但必须点到具体选项

   key = 题号，value = 干扰项分析文本
   ========================================================== */

export const TRAPS = {
  /* ---------------- 名词：可数/不可数 ---------------- */
  q001: 'A. city 是单数，前面有 many 必须用复数。B. citys 拼写错——「辅音字母 + y」结尾要变 y 为 i 再加 -es。D. cityes 保留了 y 又加 es，等于变了两次。',
  q002: 'A. child 单数，与 Three 冲突。B. childs 是规则化误加 -s，child 属不规则变化。D. childrens 在已经变好的复数 children 上又加 -s，属重复变化。',
  q003: 'A. potato 单数，与 two 冲突。B. potatos 漏了 -es：以 -o 结尾且有生命的词要加 -es。D. potatoe 把 -es 写成了 -e，属拼写错误。',
  q004: 'A. sheeps 给单复数同形的 sheep 硬加了 -s。C. sheepes、D. sheepies 都是把 sheep 当成普通可数名词乱变形。sheep 单复数同形，复数仍写 sheep。',
  q005: 'A. advices 给不可数名词加了复数。C. an advice 用 a/an 修饰不可数名词，错误。D. advice s 中间加了空格，是把不可数名词当可数处理的典型错法。',
  q006: 'A. news are、D. newses are 都以为 news 是复数（因为以 -s 结尾）。C. news were 错在两点：news 不可数用单数谓语，且此处是现在的状态不用过去时。',
  q007: 'A. glass 单数，与 two 冲突。C. glasss 是拼写错误。D. glass of 少了复数标记——单位词被数词修饰时要变复数：two glasses of milk。',

  /* ---------------- 名词：所有格 ---------------- */
  q008: "A. the students's 在以 -s 结尾的复数后加 's，重复了。C. the student's 是单数所有格，与「阅览室供全体学生使用」不符。D. the students 完全没有所有格标记，无法修饰 reading room。",
  q009: "B. Childrens 把不规则复数 children 又加了 -s。C. Childrens' 同时犯了两个错：加 -s 又用撇号。D. Children 没有所有格标记。children 不以 -s 结尾，所有格要加 's。",

  /* ---------------- 名词：词形变化 ---------------- */
  q010: 'A. pollute 是动词，air pollution 需要名词作中心词。B. polluted 是过去分词/形容词，不能直接作名词。D. polluting 是动名词，指「污染这个行为」，而这里说的是「空气污染」这一现象，用 pollution。',
  q011: 'A. happy 是形容词，great 后面要名词。B. happily 是副词，不能作宾语。D. happier 是比较级形容词，句子没有比较对象。',
  q012: 'A. develop 是动词，作主语要用名词。C. developing 是现在分词/动名词。D. developed 是过去分词/形容词。the development of 才是「……的发展」。',

  /* ---------------- 冠词 a/an ---------------- */
  q013: 'A. a 用在辅音音素前，honest 的 h 不发音，首音是元音 /ɒ/。C. the 表特指，此处是首次提及的泛指。D. 零冠词不能修饰单数可数名词 boy。',
  q014: 'B. an 用在元音音素前，useful 首音是 /j/（辅音）。C. the 表特指，此处泛指「一本有用的书」。D. 零冠词不能修饰单数可数名词 book。',
  q015: 'A. a 用在辅音音素前，hour 的 h 不发音，首音是元音 /aʊ/。C. the 表特指，此处泛指「一个小时」。D. 零冠词不能修饰单数可数名词 hour。',

  /* ---------------- 冠词 the ---------------- */
  q016: 'A. A sun 错——太阳是世上唯一的事物，必须用 the。C. an east 错——方位名词 east 前用 the。D. 两处都错：sun 要用 the，east 也要用 the。',
  q017: 'A. the football 错——球类运动前不加冠词。B. the; / 前半对（乐器加 the）后半对（球类不加），但选项顺序是「乐器在前、球类在后」，本项把两处都写成 the，错在 football 前多加了 the。C. /; the 完全反了：乐器必须加 the，球类不能加。D. 两处都空，乐器前漏了 the。',
  q018: 'A. by the bus 错——by + 交通工具是固定搭配，中间不加冠词。C. in the bus 是「在公交车里」，不表示交通方式。D. on the bus 同样表示位置而非方式。',
  q019: 'A. a first 错——序数词前通常用 the。B. an first 错在两点：序数词前不用 an，且 first 首音是辅音。D. 零冠词不能用于「the + 序数词 + 名词」结构。',

  /* ---------------- 代词：人称 ---------------- */
  q020: 'A. I 是主格，介词 for 后要用宾格。C. my 是形容词性物主代词，不能单独作介词宾语。D. mine 是名词性物主代词，指「我的东西」，与 you and ___ 并列时要用宾格 me。',
  q021: 'A. my 是形容词性物主代词，后面必须跟名词。B. me 是宾格，不能作表语表示所属。D. I 是主格，不能作表语。',
  q022: "A. it's 是 it is 的缩写，不是所有格。C. it 是主格/宾格，不能修饰 paw。D. itself 是反身代词，此处需要「它的」这个所属关系。",
  q023: 'A. him 是宾格，主语 He 与宾语指同一人时要用反身代词。B. his 是物主代词，不能作 hurt 的宾语。D. he 是主格，不能作宾语。',

  /* ---------------- 代词：不定代词 ---------------- */
  q024: 'A. anything 多用于否定句和疑问句，这里是期待对方接受的委婉邀请，用 something 更自然。C. nothing 语义相反。D. everything 指「所有东西」，与「要不要来点喝的」不符。',
  q025: 'A. like 与 everybody 搭配时谓语要用单数第三人称。C. are liking 错——like 是状态动词，一般不用进行时。D. have liked 现在完成时与 in our class 的一般陈述不符。',
  q026: 'A. something 位置错——形容词修饰不定代词时要后置。B. important something 语序错，且缺了句末的 to tell you 结构对应。C. anything important 用于疑问/否定句，本句是肯定句。',
  q027: 'A. are 错——neither of 作主语时谓语用单数。C. were 同样是复数谓语，且句子陈述现在的判断不用过去时。D. be 是原形，不能单独作谓语。',

  /* ---------------- 数词：序数词 ---------------- */
  q028: 'A. nine 是基数词，表示「第几层」要用序数词。C. nineth 拼写错——nine 变序数词要去 e 加 th。D. ninthth 在正确的 ninth 后又加了 th。',
  q029: 'A. twelve 是基数词，不能表示「第十二个月」。B. twelveth 拼写错——twelve 变序数词要变 ve 为 f 再加 th。D. twelvth 把 f 又写回了 v。',
  q030: 'A. twenty-one 是基数词。C. twenty-oneth 只给 one 加 th，但 twenty-one 变序数词是 twenty-first（用 first 不用 oneth）。D. twentieth-one 把 twentieth 和 one 顺序搞反了。',

  /* ---------------- 数词：hundred/thousand ---------------- */
  q031: 'A. two hundreds 错——hundred 前有具体数词时不加 -s。C. two hundreds of 错在两点：加了 -s，且 hundreds of 表示「数以百计」不能与具体数词连用。D. hundreds 缺了数词 two，且单独 hundreds 不能直接修饰名词。',
  q032: 'A. Thousand 缺 of——表示「数以千计」要用 thousands of。B. Thousand of 少了 -s。C. Thousands 缺 of，不能单独修饰名词。',
  q033: 'A. Two third 错——分子大于 1 时分母要加 -s。C. Two three 两个都是基数词，不是分数。D. Second three 把序数词和基数词的位置搞反了（应为「基数词 + 序数词」）。',

  /* ---------------- 形容词副词：比较级 ---------------- */
  q034: 'A. heavy 是原级，than 要求比较级。C. heaviest 是最高级，用于三者以上比较。D. more heavy 错——heavy 是单音节词，比较级加 -er 不加 more。',
  q035: 'A. tallest 缺 the——最高级前要加定冠词。C. taller 是比较级，in our class 表示范围，要用最高级。D. the taller 是比较级加了 the，但比较级不能用于「全班之最」。',
  q036: 'A. very 不能修饰比较级。C. too 表示「太……」，不修饰比较级。D. so 不能直接修饰比较级（so much 才可以，且位置不同）。修饰比较级用 much / far / even / a lot。',
  q037: 'A. than 用于比较级，not so ... as 是原级比较的固定结构。C. like 是介词，不能连接比较的两端。D. to 与 difficult 不构成比较结构。',
  q038: 'A. better; me 前半对，后半错——比较对象要用名词性物主代词 mine，不能用宾格 me。C. gooder 错——good 的比较级是不规则形式 better。D. more good 同样是规则化误用，good 不能加 more。',

  /* ---------------- 形容词：-ed / -ing ---------------- */
  q039: 'B. interested; interesting 完全反了——物作主语用 -ing，人作主语用 -ed。C. interesting; interesting 第二空错，人感到兴趣要用 interested。D. interested; interested 第一空错，film 是「令人感兴趣的」。',
  q040: 'A. surprising; surprised 反了——人作主语用 -ed，news 作主语用 -ing。C. surprised; surprised 第二空错，news 是「令人惊讶的」。D. surprising; surprising 第一空错，we 是「感到惊讶的」。',

  /* ---------------- 形容词副词：词形 ---------------- */
  q041: 'A. beautiful 是形容词，修饰动词 sings 要用副词。C. beauty 是名词。D. beautify 是动词。',
  q042: 'A. happy 是形容词，修饰 played 要用副词。C. happiness 是名词。D. happier 是比较级形容词，句子没有比较对象。',
  q043: 'B. hardly; hard 两处都反了——hardly 是「几乎不」，hard 才是「努力地」。C. hard; hard 第一空对，第二空错：has time to rest 前要用 hardly（几乎没时间）。D. hardly; hardly 两处都错，第一空应是「努力工作」。',

  /* ---------------- 介词：时间 ---------------- */
  q044: 'A. in 用于月份/年份/季节，具体某天的上午要用 on。C. at 用于具体时刻。D. for 表示持续时长，不表示时间点。',
  q045: 'B. in; at 两处都反了——具体时刻用 at，in the morning 是固定搭配。C. on; in 第一空错，六点用 at 不用 on。D. at; on 第二空错，in the morning 不能换成 on。',

  /* ---------------- 介词：固定搭配 ---------------- */
  q046: 'A. since 后接时间点，three years 是时间段。C. in 表示「在……之内」，不表示持续。D. during 后接名词性时段（during the holiday），不接 three years 这种持续量。',
  q047: 'A. for 后接时间段，2019 是时间点。C. in 表示「在……之内」。D. from 要与 to/till 搭配表示起止，不能单独用。',
  q048: 'A. hear 错——look forward to 的 to 是介词，后接动名词。C. heard 是过去式/过去分词。D. be heard 是被动，语义不通。',
  q049: 'A. good in 不表示「擅长」。C. good on 无此搭配。D. good for 表示「对……有益」，不表示「擅长」。be good at 才是「擅长」。',
  q050: 'A. different with 无此搭配。C. different to 是英式少见用法，中学阶段统一用 from。D. different than 是美式口语，中考标准答案用 from。',
  q051: 'A. get 错——be used to 的 to 是介词，后接动名词。C. got 是过去式。D. gets 是第三人称单数，与 be used to 结构不符。注意区分 be used to doing（习惯于）与 used to do（过去常常）。',

  /* ---------------- 时态：一般现在 ---------------- */
  q052: 'A. go 与主语 My brother（第三人称单数）不一致。C. is going 是进行时，every day 表示习惯要用一般现在时。D. went 是过去时，与 every day 冲突。',
  q053: 'A. will arrive 错——as soon as 引导的时间状语从句用一般现在时表将来。C. arrived 是过去时，与主句 will call 的将来时间不符。D. am arriving 是进行时表将来，但时间状语从句中仍应用一般现在时。',
  q054: 'A. will leave 与时刻表冲突——按时刻表发生的动作要用一般现在时表将来。C. is leaving 是进行时表将来，但时刻表类更标准的是一般现在时。D. left 是过去时，与 tomorrow 冲突。',
  q055: 'A. moved 是过去时，但地球绕太阳是客观真理，要用一般现在时。B. is moving 是进行时，客观真理不用进行时。D. has moved 现在完成时暗示「已经完成」，与恒常事实不符。',

  /* ---------------- 时态：现在进行 ---------------- */
  q056: 'A. play 是一般现在时，Look! 提示动作正在发生。C. played 是过去时。D. have played 是现在完成时，不表示「正在」。',
  q057: 'A. sleeps 是一般现在时，Please be quiet 提示「此刻正在睡」。C. has slept 是现在完成时。D. slept 是过去时。',
  q058: 'A. am knowing 错——know 是状态动词，不用进行时。C. am known 是被动语态，主语 I 与 know 是主动关系。D. have known 现在完成时与「我知道答案」这一现在状态不符。',

  /* ---------------- 时态：动词形式 ---------------- */
  q059: 'A. swiming 拼写错——重读闭音节要双写 m。C. swimmming 多写了一个 m。D. swim 是原形，is 后要用现在分词。',
  q060: 'A. go 是一般现在时，last summer 要求过去时。C. have gone 是现在完成时，与明确的过去时间状语冲突。D. will go 是将来时。',
  q061: 'A. didn\'t went 错——didn\'t 后要用动词原形。C. doesn\'t go 是现在时，与 yesterday 冲突。D. wasn\'t go 结构错——be 动词后不能直接跟原形动词。',
  q062: 'A. buyed 错——buy 是不规则动词，过去式是 bought。C. buys 是现在时，与 last week 冲突。D. has bought 是现在完成时，与明确的过去时间冲突。',

  /* ---------------- 时态：将来 ---------------- */
  q063: 'A. call 错——as soon as 引导的时间状语从句用一般现在时，但主句要用将来时 will call。C. called 是过去时。D. am calling 是进行时。',
  q064: 'B. will be 后面缺动词，结构不完整。C. would 是过去将来时，与 Look at the dark clouds 的现在判断不符。D. is 后面缺动词，且 is rain 语法错误。',
  q065: 'A. have 是一般现在时，this Sunday 要求将来表达。C. had 是过去时。D. has had 是现在完成时。',

  /* ---------------- 时态：现在完成 ---------------- */
  q066: 'A. lose 是一般现在时，与「已经丢了导致进不去」的现状不符。B. lost 是一般过去时，强调过去动作；此处强调对现在的影响，用现在完成时。D. am losing 是进行时，不表示结果状态。',
  q067: 'A. lives 是一般现在时，since 2019 要求现在完成时。B. lived 是一般过去时，与 since 冲突。D. is living 是进行时，不表示「从过去持续到现在」。',
  q068: 'A. have seen 是现在完成时，与明确的过去时间 last week 冲突。C. see 是一般现在时。D. have been seeing 是完成进行时，不用于这种一次性动作。',
  q069: 'A. has gone 表示「去了还没回来」，与 twice（去过两次）不符。C. went 是一般过去时，twice 强调经历，用现在完成时更准确。D. goes 是一般现在时。',
  q070: 'A. has died 错——die 是瞬间动词，不能与 for three years 这种时间段连用。B. died 是一般过去时，同样不能接 for three years。D. dies 是一般现在时。表示「去世三年」要用延续性的 be dead。',
  q071: 'A. went 是过去式，have 后要用过去分词。B. gone 表示「去了（未回）」，与 Let\'s go together next time（还没去过）矛盾。D. being 是现在分词，不能用于 have 后表示经历。',

  /* ---------------- 时态：过去进行 ---------------- */
  q072: 'A. read 是一般过去时，at eight last night 强调「那一刻正在」。C. am reading 是现在进行时。D. have read 是现在完成时。',
  q073: 'A. play 是一般现在时，与 began 的过去背景不符。B. played 是一般过去时，强调「正在踢时下雨」，要用过去进行时。D. are playing 是现在进行时。',
  q074: 'A. cooks 是一般现在时。B. cooked 是一般过去时，While 引导的持续动作要用过去进行时。D. is cooking 是现在进行时，与主句 was doing 的过去背景不一致。',

  /* ---------------- 被动语态 ---------------- */
  q075: 'A. speaks 是主动语态，English 是被说的对象。C. spoke 是过去式主动。D. is speaking 是进行时主动，English 不会自己「说」。',
  q076: 'A. builds 是一般现在时主动。B. built 是过去式主动，但 bridge 是「被建造」的。D. is building 是现在进行时主动。',
  q077: 'A. finish 是主动，work 是「被完成」的。C. to be finished 多了 to——情态动词 must 后接动词原形。D. finishing 是现在分词，不能作 must 后的谓语部分。',
  q078: 'A. was broke 错——break 的过去分词是 broken，不是 broke。C. broke 是主动语态。D. is broken 是一般现在时被动，与 yesterday 冲突。',
  q079: 'A. was happened 错——happen 是不及物动词，没有被动语态。C. is happened 同样错用了被动。D. has happened 是现在完成时，与 yesterday evening 冲突。',
  q080: 'A. built 是主动。C. is built 是一般现在时被动，与 in 2000 冲突。D. has built 是主动的现在完成时。',
  q081: 'A. is sold 是被动，但 sell 在此表示「卖得（好）」，是不及物用法，用主动表被动。C. is selling 是进行时，不表示商品的固有属性。D. sold 是过去时。',

  /* ---------------- 情态动词 ---------------- */
  q082: 'B. can 表示能力或许可，头盔是法规要求，用 must。C. may 表示允许或推测，语气不够强。D. need 作情态动词多用于否定和疑问。',
  q083: 'A. mustn\'t 表示「禁止」，回答 Must I...? 的否定是「不必」用 needn\'t。C. can\'t 表示「不能」，语义不对。D. shouldn\'t 表示「不应该」，不回答「必须吗」。',
  q084: 'A. don\'t have to 表示「不必」，但医院里吸烟是「禁止」用 mustn\'t。C. needn\'t 是「不必」，语气太弱。D. couldn\'t 是过去能力，与现在语境不符。',
  q085: 'A. can 是现在时，when he was five 要求过去时。C. must 表示「必须」，不表示能力。D. should 表示「应该」，不表示「能够」。',
  q086: 'A. must 表示主观必须，但「家远」是客观原因导致的不得不，用 have to 更准确。C. can 表示能力。D. should 表示建议。',
  q087: 'A. can be 表示「可能是」，但灯亮着是较强的推断，用 must be（一定）。B. may be 表示「可能」，语气比 must be 弱。D. need be 结构错——need 作情态动词多用于否定疑问。',
  q088: 'A. mustn\'t 表示「禁止」，但这里是否定推测「不可能」，用 can\'t。C. needn\'t 表示「不必」。D. shouldn\'t 表示「不应该」。',
  q089: 'A. must 表示肯定推测「一定」，但 I\'m not sure 说明不确定。C. can 表示能力。D. should 表示「应该」，不表示推测。may 表示「可能」。',

  /* ---------------- 非谓语：不定式 ---------------- */
  q090: 'A. buy 是原形，want 后要接不定式。C. buying 是动名词，want 不接动名词。D. bought 是过去分词。',
  q091: 'A. borrow 是原形，表示目的要用不定式。C. borrowing 是动名词，不表目的。D. borrowed 是过去分词。',
  q092: 'A. clean 是原形，ask sb to do sth 是固定结构。C. cleaning 是动名词。D. cleaned 是过去分词。',
  q093: 'B. to not be 语序错——否定不定式要把 not 放在 to 前。C. don\'t be 是祈使句否定，不能作 tell sb 的宾补。D. not be 缺了 to。',
  q094: 'A. to laugh 错——make sb do sth 用不带 to 的不定式。C. laughing 是现在分词，make 不接这种结构。D. laughed 是过去分词。',

  /* ---------------- 非谓语：动名词 ---------------- */
  q095: 'A. listen to 是原形，enjoy 后接动名词。B. to listen to 是不定式，enjoy 不接不定式。D. listened to 是过去分词。',
  q096: 'A. play 是原形，be interested in 的 in 是介词，后接动名词。B. to play 是不定式。D. played 是过去分词。',
  q097: 'A. Read 是原形，不能作主语。C. To read books every day 虽可作主语，但与本句「泛泛而谈阅读」的语境相比，动名词 Reading 更简洁自然。D. Reads 是第三人称单数谓语形式，不能作主语。',
  q098: 'A. locking 错——remember doing 表示「记得做过」，remember to do 表示「记得去做（还没做）」。C. lock 是原形。D. locked 是过去分词。',
  q099: 'A. to smoke 错——stop to do 表示「停下来去做另一件事」，stop doing 表示「停止做某事」。此处是戒烟，用 smoking。C. smoke 是原形。D. smoked 是过去分词。',

  /* ---------------- there be ---------------- */
  q100: 'B. are 错——there be 句型就近原则，最近的主语 a pen 是单数。C. have 是「有」的实义动词，与 there be 结构冲突。D. has 同样不能与 there 搭配。',
  q101: 'A. is 错——最近的主语 many students 是复数。C. have、D. has 都是实义动词，不能用于 there be 句型。',
  q102: 'A. are 错——water 是不可数名词，谓语用单数。C. have、D. has 不能用于 there be 句型。',

  /* ---------------- 反意疑问句 ---------------- */
  q103: 'B. does he 错——前半句是肯定，后半句要用否定。C. isn\'t he 错——前半句谓语是 likes（实义动词），助动词用 doesn\'t 不用 isn\'t。D. is he 两处都错。',
  q104: 'A. doesn\'t she 错——never 是否定词，前半句视为否定，后半句要用肯定。C. isn\'t she 助动词错，且应为肯定。D. is she 助动词错。',
  q105: 'A. will you 用于祈使句，Let\'s 开头的用 shall we。C. don\'t we 结构不符。D. do we 结构不符。',
  q106: 'A. What 缺冠词——day 是可数名词单数，感叹句要 What a。C. How 修饰形容词/副词，不修饰名词。D. How a 结构错——How 后不接冠词。',
  q107: 'A. What a 错——weather 是不可数名词，不能加 a。C. How 修饰形容词/副词，此处中心词是名词 weather。D. How a 结构错。',
  q108: 'A. What 错——中心词是形容词 beautiful，用 How。B. What a 错——此处没有名词。D. How a 结构错——How 后不接冠词。',

  /* ---------------- 宾语从句 ---------------- */
  q109: 'A. where did I live 语序错——宾语从句要用陈述语序。C. where do I live 同样语序错，且时态与 asked 不符。D. I lived where 语序错——连接词要在从句开头。',
  q110: 'A. is 是一般现在时，主句 said 是过去时，从句要相应后移。C. will be 是将来时。D. has been 是现在完成时。',
  q111: 'A. if 不能与 or not 直接连用（if ... or not 结构不成立）。C. that 不表示「是否」。D. what 在从句中要充当成分，此处不缺成分。',
  q112: 'A. moved 错——从句是客观真理，即使主句是过去时也用一般现在时。C. will move 是将来时。D. has moved 是现在完成时。',

  /* ---------------- 状语从句 ---------------- */
  q113: 'A. will rain 错——if 引导的条件状语从句用一般现在时表将来。C. rained 是过去时。D. is raining 是进行时。',
  q114: 'B. But 不能与 Although 同时使用，且句首用 But 不符合书面语规范。C. Because 表示原因，但前后是让步关系。D. So 表示结果。',
  q115: 'A. so 表示结果，但「错过早班车」是「迟到」的原因。C. although 表示让步。D. but 表示转折。',
  q116: 'B. not until 结构错——此处已有 won\'t，再加 not 构成双重否定。C. since 表示「自从」，与「八点前不回来」不符。D. for 表示持续时长。',

  /* ---------------- 定语从句 ---------------- */
  q117: 'A. which 指物，先行词 the boy 是人。C. whose 表示所属，从句中缺的是主语不是定语。D. where 指地点。',
  q118: 'A. who 指人，先行词 the book 是物。B. whose 表示所属。D. where 指地点，从句中缺宾语。',
  q119: 'A. which 在从句中要充当主语或宾语，但 my mother works 已完整。B. that 同样会使从句缺成分。D. who 指人，先行词是 school。',
  q120: 'A. which 在先行词被最高级修饰时通常用 that。C. who 指人。D. what 不能引导定语从句。',

  /* ---------------- 情景交际 ---------------- */
  q121: 'A. Fine, thank you 回答 How are you。C. I\'m fine 同样回答 How are you。D. Nice day! 是寒暄天气。How do you do? 的固定答语就是 How do you do?',
  q122: 'A. Me too 用于「我也是」，不回应初次见面。C. Thank you 回应感谢或赞美。D. You\'re welcome 回应感谢。',
  q123: 'A. How do you do? 回答初次见面。C. I\'m Tom 是自我介绍。D. Yes, I am 回答一般疑问句。',
  q124: 'A. Never mind 回应道歉。C. That\'s OK 也可回应感谢，但更常用于回应道歉；对感谢最标准的答语是 You\'re welcome。D. I\'m sorry 是道歉。',
  q125: 'A. You\'re welcome 回应感谢。C. My pleasure 回应感谢（事后）。D. With pleasure 回应请求（事前答应）。回应道歉用 Never mind。',
  q126: 'A. My pleasure 是「（帮完后）不客气」。C. Never mind 回应道歉。D. That\'s OK 回应道歉或感谢。答应请求用 With pleasure。',
  q127: 'A. With pleasure 是答应请求。C. Never mind 回应道歉。D. Don\'t mention it 也可回应感谢，但 B. My pleasure 与「感谢你的建议」最贴合。',
  q128: 'A. Yes, I would 结构不完整——Would you like to... 的肯定回答是 Yes, I\'d love to。C. Yes, I like 语法错，like 后缺宾语。D. Yes, please 用于 Would you like + 名词。',
  q129: 'B. Yes, I would 回答 Would you like to。C. That\'s right 表示「没错」。D. You\'re welcome 回应感谢。How about... 的建议用 Good idea! 回应。',
  q130: 'B. Never mind 回应道歉。C. With pleasure 答应请求。D. You\'re welcome 回应感谢。Why not... 是建议，用 That\'s a good idea 回应。',
  q131: 'A. Yes, I would 结构不完整。C. No, I don\'t 语法错。D. Of course not 语义相反。回答 Would you like to 时，先肯定再转折用 I\'d love to, but...',
  q132: 'A. I am Tom 是当面自我介绍，电话中要说 This is Tom speaking。C. Are you Tom? 是提问。D. Who are you? 不礼貌且不符合语境。',
  q133: 'A. I\'m Lily 是当面介绍，电话中要用 This is Lily speaking。C. Are you Lily? 是提问。D. That is Lily 指第三方，不是自报。',
  q134: 'B. Come on 是「加油/快点」。C. Go on 是「继续」。D. Put on 是「穿上」。电话中请对方稍等用 Hold on。',
  q135: 'A. What do you want 语气生硬不礼貌。C. How are you 是问候。D. What\'s this 询问物品。服务场景用 Can I help you。',
  q136: 'B. It\'s very nice 是评价。C. I like it very much 是喜好。D. You\'re welcome 回应感谢。问路要回答路线。',
  q137: 'B. It\'s Monday 回答星期。C. At six o\'clock 回答时间点。D. Very good 是评价。How far 问距离，用「十分钟步行」回答。',

  /* ---------------- 补充题 ---------------- */
  q138: 'A. apple 单数，a lot of 后可数名词要用复数。B. apples 与 some 搭配可以，但 Would you like some 后应接不可数或复数，此处 bread 与 a lot of 搭配最自然。D. books 与「桌上有很多」语境不符。',
  q139: 'A. a 错——三餐名词前一般不加冠词。B. an 同样错。C. the 表示特指某一顿，此处是日常习惯。have breakfast 是固定搭配。',
  q140: 'B. anything 用于疑问/否定句。C. nothing 使句意变成「没毛病」，与 It doesn\'t work 矛盾。D. everything 语义不符。There is something wrong with 是固定句型。',
  q141: 'A. famous as 表示「作为……而闻名」。C. famous with 无此搭配。D. famous to 表示「对……来说有名」。be famous for 表示「因……而闻名」。',
  q142: 'A. spend ... in 后接动名词，但此处是名词 homework，用 on。C. at 无此搭配。D. for 不用于 spend 结构。spend time on sth / (in) doing sth。',
  q143: 'B. don\'t be 是祈使句否定。C. not to be 多了 to——had better 后接不带 to 的不定式。D. be not 语序错。',
  q144: 'B. to go 多了 to——Why not 后接动词原形。C. going 是动名词。D. went 是过去式。',
  q145: 'A. to worry 是不定式，It\'s no use doing sth 是固定句型。C. worry 是原形。D. worried 是过去分词/形容词。',
  q146: 'B. are 错——there be going to be 结构中，be 的单复数由后面的名词决定，a football match 是单数。C. will 缺 be。D. has 不能用于 there be 句型。',
  q147: 'A. shall we 用于 Let\'s 开头的句子。C. don\'t you 结构不符。D. do you 结构不符。祈使句的反意疑问句用 will you。',
  q148: 'A. What 修饰名词，此处中心词是副词 fast。B. What a 同样错。D. How a 结构错——How 后不接冠词。',
  q149: 'A. how can I get there 语序错——宾语从句用陈述语序。C. how could I get there 语序错且时态与 Could you tell me 的委婉语气不符。D. I can get there how 语序错。',
  q150: 'B. since 表示「自从」。C. while 表示「在……期间」。D. as soon as 表示「一……就」。此处是「等到你回来」，用 until。',
  q151: 'A. who 在从句中作主语，但 bag 前需要的是定语。B. which 指物。D. where 指地点。表示「她的包」用 whose。',
  q152: 'A. which 在从句中要充当主语或宾语，但 we first met 已完整。B. that 同样会使从句缺成分。D. where 指地点，the day 是时间。先行词是时间且从句缺状语用 when。',
  q153: 'A. builds 是主动。B. will build 是主动，library 是「被建」的。D. is built 是一般现在时被动，与 next year 冲突。',
  q154: 'A. Did; go 是一般过去时，与 ever（曾经）搭配要用现在完成时。C. Have; gone 表示「去了未回」，与 Yes, twice 矛盾。D. Are; going 是进行时。',
  q155: 'A. teaches 是一般现在时，for five years 要求现在完成时。B. taught 是一般过去时。D. is teaching 是进行时。',
  q156: 'A. a paper 错——paper 作「纸」是不可数。B. some papers 指「论文/报纸」，语义不符。D. papers 同样指「文件/论文」。表示「一张纸」用 a piece of paper。',
  q157: 'A. nine hundreds 错——有具体数词时 hundred 不加 -s。C. nine hundreds of 同样错。D. hundred of 缺了数词且少了 -s。',
  q158: 'B. tired; tiring 反了——walk 是「令人疲倦的」，人「感到疲倦」。C. tiring; tiring 第二空错。D. tired; tired 第一空错。',
  q159: 'B. after 用于过去时或「after + 时间点」。C. for 表示持续时长。D. since 表示「自从」。in + 时间段用于将来时，表示「……之后」。',
  q160: 'B. Never mind 回应道歉。C. You\'re welcome 回应感谢。D. I\'m sorry 是道歉。Shall we... 的同意用 OK, that\'s fine。',

  /* ---------------- 盲填：连词 ---------------- */
  b001: 'A. and 表并列，前后语义相反。C. so 表结果。D. or 表选择或「否则」。前后「年纪小」与「懂很多」是转折，用 but。',
  b002: 'A. and 表并列。B. but 表转折。D. so 表结果。「祈使句 + or + 句子」表示「否则会……」，or 在此是「否则」。',
  b003: 'A. and 表并列。B. but 表转折。C. or 表选择。「下雨」是原因，「待在家里」是结果，用 so。',
  b004: 'A. and 用于肯定句并列。C. but 表转折。D. so 表结果。否定句中并列成分用 or 不用 and。',
  b005: 'A. Either; or 是「两者之一」。B. Neither; nor 是「两者都不」。D. Not only; but also 是「不仅……而且」，谓语要就近一致。「两人都」用 Both; and。',
  b006: 'A. Either; or 是「两者之一」，与 One of you must be wrong 矛盾。C. Both; and 是「两者都」，同样矛盾。D. Not only; but also 语义不符。neither...nor 表示「两者都不」。',
  b007: 'A. and 不能构成「不仅……而且」。C. or 表选择。D. so 表结果。not only...but also 是固定搭配。',
  b008: 'A. although 表让步。C. if 表条件。D. unless 表「除非」。「迟到」与「错过早班车」是因果关系，用 because。',
  b009: 'A. Because 表原因，但前后是让步关系。C. If 表条件。D. Unless 表「除非」。Although 表示「虽然」。',
  b010: 'A. Although 表让步。B. Because 表原因。D. Unless 表「除非」。「明天下雨」是条件，用 If。',
  b011: 'A. If 表「如果」，但「否则你会失败」提示前面是「除非」。C. Although 表让步。D. Because 表原因。Unless = if not。',
  b012: 'A. While 后接持续性动作。C. Until 表「直到」。D. Since 表「自从」。「我到家时」是短暂动作，用 When。',
  b013: 'A. When 后接短暂动作。C. Until 表「直到」。D. If 表条件。「我在看书」是持续动作，用 While。',
  b014: 'A. when 表「当……时」。B. while 表「在……期间」。D. since 表「自从」。「等着直到我回来」用 until。',
  b015: 'B. as well as 是「以及」。C. as long as 是「只要」。D. so that 是「为了」。「一到就打电话」用 as soon as。',
  b016: 'A. because 表原因。B. although 表让步。D. unless 表「除非」。「早起」是为了「赶上第一班车」，用 so that。',
  b017: 'A. Although 表让步。C. Unless 表「除非」。D. While 表「在……期间」。「既然你来了」用 Since。',

  /* ---------------- 盲填：冠词 ---------------- */
  b018: 'A. a 用在辅音音素前，honest 的 h 不发音，首音是元音。C. the 表特指，此处是泛指。D. 零冠词不能修饰单数可数名词 boy。',
  b019: 'B. an 用在元音音素前，useful 首音是 /j/（辅音）。C. the 表特指。D. 零冠词不能修饰单数可数名词 dictionary。',
  b020: 'A. A sun 错——太阳是唯一事物，要用 The。C. an east 错——方位名词前用 the。D. 两处都错。',
  b021: 'A. a 错——乐器前用 the。B. an 同样错。D. 零冠词错——play the piano 是固定搭配。',
  b022: 'A. a 错——三餐前不加冠词。B. an 同样错。C. the 表示特指某一顿。have breakfast 是固定搭配。',
  b023: 'A. a 错——最高级前用 the。B. an 同样错。D. 零冠词错——the tallest 是固定结构。',

  /* ---------------- 盲填：介词 ---------------- */
  b024: 'B. in 表示「在……里」。C. on 表示「在……上」。D. with 表示「和……一起」。by + 交通工具是固定搭配。',
  b025: 'B. an 错——good 首音是辅音。C. the 表特指。D. 零冠词错——have a good time 是固定搭配。',
  b026: 'A. in 用于月份/年份，具体某天的上午用 on。C. at 用于具体时刻。D. for 表示持续时长。',
  b027: 'A. in 用于月份/年份。B. on 用于具体某天。D. for 表示持续时长。具体时刻用 at。',
  b028: 'B. On 用于具体某天。C. At 用于具体时刻。D. For 表示持续时长。in the morning 是固定搭配。',
  b029: 'A. good in 不表示「擅长」。C. good on 无此搭配。D. good for 表示「对……有益」。be good at 才是「擅长」。',
  b030: 'A. interested at 无此搭配。C. interested on 无此搭配。D. interested with 无此搭配。be interested in 是固定搭配。',
  b031: 'B. afraid at 无此搭配。C. afraid from 无此搭配。D. afraid with 无此搭配。be afraid of 是固定搭配。',
  b032: 'A. famous as 表示「作为……而闻名」。C. famous with 无此搭配。D. famous to 表示「对……来说有名」。be famous for 表示「因……而闻名」。',
  b033: 'A. look forward at 无此搭配。C. look forward for 无此搭配。D. look forward in 无此搭配。look forward to 是固定搭配，to 是介词。',
  b034: 'A. spend ... in 后接动名词，此处是名词 homework。C. at 无此搭配。D. for 不用于 spend 结构。spend time on sth。',
  b035: 'A. thank you to 无此搭配。C. thank you of 无此搭配。D. thank you at 无此搭配。thank you for 是固定搭配。',

  /* ---------------- 盲填：数词 ---------------- */
  b036: 'A. twelve 是基数词。B. twelveth 拼写错——twelve 变序数词要变 ve 为 f 再加 th。D. twelvth 把 f 又写回了 v。',
  b037: 'A. nine 是基数词。C. nineth 拼写错——nine 变序数词要去 e 加 th。D. ninthth 在正确的 ninth 后又加了 th。',
  b038: 'A. three 是基数词。C. threeth 拼写错。D. thirdth 在正确的 third 后又加了 th。表示「第三名」用 third。',
  b039: 'A. three thousands 错——有具体数词时 thousand 不加 -s。C. three thousands of 同样错。D. thousands 缺了数词。',
  b040: 'A. Hundred 缺 of。B. Hundred of 少了 -s。C. Hundreds 缺 of，不能单独修饰名词。表示「数以百计」用 Hundreds of。',
  b041: 'A. Two third 错——分子大于 1 时分母要加 -s。C. Two three 两个都是基数词。D. Second three 序数词和基数词位置反了。',
  b042: 'B. percents 错——percent 没有复数形式。C. percentage 是「百分比」这个名词，与 70 搭配要用 percent。D. per cent of 多了一个 of，70 percent of 才是完整结构。',

  /* ---------------- 盲填：冠词进阶 ---------------- */
  b043: 'A. a 用在辅音音素前，umbrella 首音是元音 /ʌ/。C. the 表特指。D. 零冠词不能修饰单数可数名词 umbrella。',
  b044: 'B. an 错——university 首音是 /j/（辅音）。C. the 表特指。D. 零冠词不能修饰单数可数名词 student。',
  b045: 'A. a 用在辅音音素前，hour 的 h 不发音，首音是元音。C. the 表特指。D. 零冠词不能修饰单数可数名词 hour。',
  b046: 'A. A 错——长城是独一无二的事物。B. An 同样错。D. 零冠词错——the Great Wall 是固定搭配。',
  b047: 'A. a; a 错——形容词 + 复数名词表示一类人时用 the。B. an; an 同样错。D. 零冠词错——the old / the poor 表示「老年人/穷人」这一类。',
  b048: 'A. a 错——球类运动前不加冠词。B. an 同样错。C. the 错——play basketball 是固定搭配。',

  /* ---------------- 盲填：情态与助动 ---------------- */
  b049: 'A. to 错——had better 后接不带 to 的不定式。B. not to 同样多了 to。C. 零冠词错——此处需要否定词。had better not do 是固定结构。',
  b050: 'B. mustn\'t 表示「禁止」。C. needn\'t 表示「不必」。D. shouldn\'t 表示「不应该」。回答 Can you...? 的否定用 can\'t。',
  b051: 'A. can 表示能力。C. need 作情态动词多用于否定疑问。D. would 表示意愿。此处是较强推断「一定累了」，用 must。',
  b052: 'A. Must 表示「必须」，请求许用 May。B. Should 表示「应该」。D. Need 多用于否定疑问。May I...? 是请求许可的标准表达。',
  b053: 'A. mustn\'t 表示「禁止」，但「可以明天还」说明是「不必」。C. can\'t 表示「不能」。D. shouldn\'t 表示「不应该」。',
  b054: 'A. mustn\'t 表示「禁止」。C. needn\'t 表示「不必」。D. shouldn\'t 表示「不应该」。否定推测「不可能」用 can\'t。',
  b055: 'A. must 表示肯定推测。C. can 表示能力。D. should 表示「应该」。but I am not sure 说明不确定，用 may。',
  b056: 'B. isn\'t he 错——前半句有否定词 isn\'t，后半句要用肯定。C. does he 助动词错——前半句谓语是 is。D. doesn\'t he 两处都错。',
  b057: 'A. is there 错——前半句是肯定，后半句要用否定。C. is it 主语错——there be 句型的反意部分用 there。D. isn\'t it 主语错。',
  b058: 'A. am I 错——前半句是肯定，后半句要用否定。B. am not I 结构错——am not 没有缩写形式，反意部分用 aren\'t I。D. don\'t I 助动词错——前半句谓语是 am。',
  b059: 'B. didn\'t they 错——few 是否定词，前半句视为否定，后半句要用肯定。C. do they 时态错——前半句是过去时 came。D. don\'t they 两处都错。',
  b060: 'A. What 缺冠词——book 是可数名词单数。C. How 修饰形容词/副词。D. How an 结构错——How 后不接冠词。',
  b061: 'A. What 修饰名词，此处中心词是副词 hard。B. What a 同样错。D. How a 结构错。',
  b062: 'B. What a 错——news 是不可数名词，不能加 a。C. How 修饰形容词/副词。D. How a 结构错。',

  /* ---------------- 盲填：there be 与动词形式 ---------------- */
  b063: 'A. is 是一般现在时，last summer 要求过去时。B. are 同样是现在时且与不可数 rain 不符。D. were 错——rain 是不可数名词，谓语用单数。',
  b064: 'A. is 错——就近原则，最近的主语 some apples 是复数。C. have、D. has 不能用于 there be 句型。',
  b065: 'A. open 是原形，mind 后接动名词。B. to open 是不定式。D. opened 是过去分词。Would you mind doing sth 是固定结构。',
  b066: 'A. smoke 是原形，give up 后接动名词。B. to smoke 是不定式。D. smoked 是过去分词。',
  b067: 'A. do 是原形，be busy doing sth 是固定结构。B. to do 是不定式。D. done 是过去分词。',
  b068: 'A. go 是原形，too...to 结构中 to 后接动词原形，但此处需要完整的不定式符号。C. going 是动名词。D. went 是过去式。too young to go 是固定结构。',
  b069: 'A. tell 是原形，不定式作后置定语修饰 something。C. telling 是动名词。D. told 是过去分词。',
  b070: 'B. to tell 多了 to——Why not 后接动词原形。C. telling 是动名词。D. told 是过去式。',
  b071: 'A. what is he doing 语序错——宾语从句用陈述语序。C. what does he do 语序错。D. he is doing what 语序错——连接词要在从句开头。',
  b072: 'A. that 不表示「是否」。C. what 在从句中要充当成分，此处不缺。D. which 表示「哪一个」，与「是否完成作业」不符。',
  b073: 'B. as long as 是「只要」。C. so that 是「为了」。D. even if 是「即使」。「一到北京就打电话」用 as soon as。',
  b074: 'A. too; to 结构不完整——too tired to fall asleep 表示「太累以至于睡不着」，与「立刻睡着」相反。C. such; that 修饰名词，tired 是形容词。D. enough; to 语序错——enough 要放在形容词后。',
  b075: 'A. which 指物，先行词 the man 是人。C. whose 表示所属，从句中缺主语。D. where 指地点。',
  b076: 'A. who 指人，先行词 the book 是物。B. whose 表示所属。D. where 指地点，从句中缺宾语。',
  b077: 'A. I 是主格。B. me 是宾格。D. mine 是名词性物主代词，后面不能再跟名词 book。此处需要形容词性物主代词 my。',
  b078: 'A. us 是宾格，主语 We 与宾语指同一群体时用反身代词。B. our 是形容词性物主代词。D. ourself 形式错——ourselves 才是复数反身代词。',
  b079: 'A. somebody 多用于肯定句。C. nobody 语义相反。D. everybody 指「每个人」，与疑问句「有人吗」不符。',
  b080: 'A. Both 表示「两者都」，与 is correct（单数谓语）矛盾。B. Either 表示「两者之一」，与 Try again 矛盾。D. All 用于三者以上。',
  b081: 'A. something 与 It works well 矛盾。B. anything 用于疑问/否定句。D. everything 语义不符。There is nothing wrong with 表示「没毛病」。',
  b082: 'A. knifes 错——knife 变复数要变 f 为 v 再加 -es。C. knifs 同样没变 f 为 v。D. knife 是单数，与 three 冲突。',

  /* ---------------- 盲填：名词复数与所有格 ---------------- */
  b083: 'A. man 是单数，Two 要求复数。B. mans 是规则化误加 -s，man 的复数是 men。D. mens 在正确的 men 上又加了 -s。',
  b084: 'A. photoes 错——photo 是缩略词，复数只加 -s。C. photo 是单数，many 要求复数。D. photose 拼写错。注意区分 photo→photos 与 potato→potatoes。',
  b085: 'A. piece 单数，two 要求复数。C. piece of 缺了复数标记且少了第二空的结构。D. pieces of 多了 of——此处 two pieces of bread 是完整结构，但选项 D 的 of 使句子变成 two pieces of of bread。',

  /* ---------------- 盲填：不可数与名词化 ---------------- */
  b086: 'A. informations 给不可数名词加了复数。C. an information 用 a/an 修饰不可数名词。D. information s 中间加空格，是把不可数当可数的典型错法。',
  b087: "A. Tom's and Jim's 表示「两人各自的书房」，与 They share it（共用）矛盾。C. Tom and Jim 完全没有所有格标记。D. Toms and Jims 把专有名词当普通名词加了 -s。共用一处用 Tom and Jim's。",
  b088: 'A. achieve 是动词，His 后面要名词。C. achieving 是动名词，此处需要抽象名词。D. achieved 是过去分词。',
  b089: 'A. important 是形容词，The 后面要名词作主语。B. importantly 是副词。D. import 是动词/「进口」，与「重要性」不符。',

  /* ---------------- 盲填：比较级进阶 ---------------- */
  b090: 'A. good 是原级，Of the three 表示三者比较要用最高级。B. better 是比较级，用于两者。D. well 是副词/形容词（表健康），不能作表语表示「最好」。',
  b091: 'B. most 错——the more..., the more... 是「越……越……」的固定结构，前后都要比较级。C. many 是原级。D. much 是原级。',
  b092: 'A. big 是原级，than 要求比较级。C. biggest 是最高级，与 than 冲突。D. more big 错——big 是单音节词，比较级加 -er。',
  b093: 'A. exciting 是「令人兴奋的」，主语是人的感受要用 excited。C. excite 是动词。D. excitement 是名词。',
  b094: 'A. surprised 是「感到惊讶的」，主语 news 是「令人惊讶的」，用 surprising。C. surprise 是动词/名词。D. surprisingly 是副词。',
  b095: 'A. clear 是形容词，修饰动词 spoke 要用副词。C. clearness 是名词。D. clearer 是比较级形容词。',
  b096: 'A. possible 是「可能的」，与「一天内完成」的语义矛盾，此处是「不可能」。C. possibly 是副词。D. impossibly 是副词，不能作 It is ... 的表语。',

  /* ---------------- 盲填：被动语态进阶 ---------------- */
  b097: 'A. cleans 是主动，classroom 是「被打扫」的。C. cleaned 是过去式主动。D. is cleaning 是现在进行时主动。',
  b098: 'A. builds 是一般现在时主动。B. built 是过去式主动。D. is built 是一般现在时被动，与 last year 冲突。',
  b099: 'A. solve 是主动，problem 是「被解决」的。C. to solve 多了 to——情态动词 can 后接动词原形。D. solving 是现在分词。',
  b100: 'A. use 是主动，Computers 是「被使用」的。C. is used 单复数错——Computers 是复数。D. were used 是过去时，原句是一般现在时。',
};
