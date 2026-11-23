# -*- coding: utf-8 -*-
"""生成 src/data-words.js
基座：ECDICT 的 zk（中考）标签词表 1603 条 = 义务教育英语课程标准（2022 年版）三级词汇表口径
再补：初中必会派生词、英式/美式拼写别名、高频词人工校订释义、按课标主题分组
用法：python3 tools/build_words.py
"""
import csv, json, re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ECDICT = os.path.join(ROOT, '..', 'pet-site', 'reference', 'ecdict.csv')

POSMAP = {
    'n.': '名词', 'v.': '动词', 'vt.': '动词', 'vi.': '动词',
    'a.': '形容词', 'adj.': '形容词', 'adv.': '副词', 'pron.': '代词',
    'prep.': '介词', 'conj.': '连词', 'num.': '数词', 'art.': '冠词',
    'interj.': '感叹词', 'aux.': '助动词', 'pl.': '名词', 'abbr.': '缩写',
}
POS_SHORT = {
    '名词': 'n', '动词': 'v', '形容词': 'adj', '副词': 'adv', '代词': 'pron',
    '介词': 'prep', '连词': 'conj', '数词': 'num', '冠词': 'art',
    '感叹词': 'interj', '助动词': 'aux', '缩写': 'abbr', '短语': 'phr',
}

# ---------- 人工校订：ECDICT 首义偏离中学教材义的词 ----------
# word: (词性中文, 释义, 可选例句列表)
OVERRIDE = {
    # 功能词
    'a': ('冠词', '一个（辅音音素前）'),
    'an': ('冠词', '一个（元音音素前）'),
    'the': ('冠词', '这；那（特指）'),
    'and': ('连词', '和；然后'),
    'but': ('连词', '但是；除了'),
    'or': ('连词', '或者；否则'),
    'so': ('连词', '所以；如此'),
    'as': ('连词', '当…时；因为；作为'),
    'than': ('连词', '比'),
    'if': ('连词', '如果；是否'),
    'because': ('连词', '因为'),
    'although': ('连词', '虽然；尽管'),
    'though': ('连词', '虽然；不过'),
    'while': ('连词', '当…的时候；然而'),
    'when': ('连词', '当…时；什么时候'),
    'whether': ('连词', '是否'),
    'unless': ('连词', '除非'),
    'until': ('连词', '直到'),
    'since': ('连词', '自从；既然'),
    'before': ('介词', '在…之前'),
    'after': ('介词', '在…之后'),
    'during': ('介词', '在…期间'),
    'among': ('介词', '在…之中'),
    'between': ('介词', '在…之间'),
    'across': ('介词', '穿过；在…对面'),
    'along': ('介词', '沿着'),
    'beside': ('介词', '在…旁边'),
    'besides': ('副词', '此外；除…之外'),
    'except': ('介词', '除…之外'),
    'toward': ('介词', '朝；向'),
    'towards': ('介词', '朝；向'),
    'beyond': ('介词', '超出；在…那边'),
    'upon': ('介词', '在…之上'),
    'within': ('介词', '在…之内'),
    'without': ('介词', '没有'),
    'about': ('介词', '关于；大约'),
    'above': ('介词', '在…上方'),
    'below': ('介词', '在…下方'),
    'under': ('介词', '在…下面'),
    'over': ('介词', '在…上方；超过'),
    'through': ('介词', '穿过；通过'),
    'against': ('介词', '反对；靠着'),
    'among': ('介词', '在…之中'),
    'into': ('介词', '进入'),
    'onto': ('介词', '到…上面'),
    'of': ('介词', '…的'),
    'off': ('副词', '离开；关掉'),
    'out': ('副词', '出去；向外'),
    'up': ('副词', '向上；起来'),
    'down': ('副词', '向下'),
    'on': ('介词', '在…上；关于'),
    'in': ('介词', '在…里'),
    'at': ('介词', '在（某地/某时）'),
    'to': ('介词', '到；向（不定式符号）'),
    'for': ('介词', '为了；给'),
    'with': ('介词', '和…一起；带有'),
    'by': ('介词', '通过；乘（车）；在…旁'),
    'from': ('介词', '从；来自'),
    # 代词
    'I': ('代词', '我'),
    'me': ('代词', '我（宾格）'),
    'my': ('代词', '我的'),
    'mine': ('代词', '我的（名词性）'),
    'myself': ('代词', '我自己'),
    'you': ('代词', '你；你们'),
    'your': ('代词', '你的；你们的'),
    'yours': ('代词', '你的；你们的（名词性）'),
    'yourself': ('代词', '你自己'),
    'yourselves': ('代词', '你们自己'),
    'he': ('代词', '他'),
    'him': ('代词', '他（宾格）'),
    'his': ('代词', '他的'),
    'himself': ('代词', '他自己'),
    'she': ('代词', '她'),
    'her': ('代词', '她的；她（宾格）'),
    'hers': ('代词', '她的（名词性）'),
    'herself': ('代词', '她自己'),
    'it': ('代词', '它'),
    'its': ('代词', '它的'),
    'itself': ('代词', '它自己'),
    'we': ('代词', '我们'),
    'us': ('代词', '我们（宾格）'),
    'our': ('代词', '我们的'),
    'ours': ('代词', '我们的（名词性）'),
    'ourselves': ('代词', '我们自己'),
    'they': ('代词', '他们；它们'),
    'them': ('代词', '他们（宾格）'),
    'their': ('代词', '他们的'),
    'theirs': ('代词', '他们的（名词性）'),
    'themselves': ('代词', '他们自己'),
    'this': ('代词', '这个'),
    'that': ('代词', '那个；那'),
    'these': ('代词', '这些'),
    'those': ('代词', '那些'),
    'who': ('代词', '谁（主格）'),
    'whom': ('代词', '谁（宾格）'),
    'whose': ('代词', '谁的'),
    'which': ('代词', '哪一个；哪些'),
    'what': ('代词', '什么'),
    'whatever': ('代词', '无论什么'),
    'whenever': ('连词', '无论何时'),
    'wherever': ('连词', '无论哪里'),
    'some': ('代词', '一些'),
    'any': ('代词', '任何；一些（疑问/否定）'),
    'none': ('代词', '没有一个'),
    'all': ('代词', '全部；所有'),
    'both': ('代词', '两者都'),
    'either': ('代词', '两者之一'),
    'neither': ('代词', '两者都不'),
    'each': ('代词', '每个'),
    'every': ('形容词', '每一个'),
    'other': ('形容词', '别的；其他的'),
    'another': ('形容词', '另一个'),
    'others': ('代词', '其他人/物'),
    'one': ('数词', '一；一个'),
    'oneself': ('代词', '自己'),
    'something': ('代词', '某事；某物'),
    'nothing': ('代词', '没有什么'),
    'anything': ('代词', '任何事物'),
    'everything': ('代词', '一切；每件事'),
    'someone': ('代词', '某人'),
    'somebody': ('代词', '某人'),
    'anyone': ('代词', '任何人'),
    'anybody': ('代词', '任何人'),
    'everyone': ('代词', '每个人'),
    'everybody': ('代词', '每个人'),
    'nobody': ('代词', '没有人'),
    'somewhere': ('副词', '在某处'),
    'anywhere': ('副词', '在任何地方'),
    'everywhere': ('副词', '到处'),
    'nowhere': ('副词', '无处'),
    # 情态/助动词
    'can': ('情态动词', '能；会；可以'),
    'could': ('情态动词', '能（过去）；可以（委婉）'),
    'may': ('情态动词', '可以；可能'),
    'might': ('情态动词', '可能（语气更弱）'),
    'must': ('情态动词', '必须；一定'),
    'shall': ('情态动词', '将；应该（征求意愿）'),
    'should': ('情态动词', '应该'),
    'will': ('情态动词', '将；会'),
    'would': ('情态动词', '将会（过去）；愿意'),
    'dare': ('动词', '敢'),
    'need': ('动词', '需要'),
    'have': ('动词', '有；吃；进行'),
    'be': ('动词', '是；存在'),
    'do': ('动词', '做；助动词'),
    'does': ('动词', '做（第三人称单数）'),
    'did': ('动词', '做（过去式）'),
    # 高频多义动词
    'get': ('动词', '得到；变得；到达'),
    'make': ('动词', '制作；使得'),
    'take': ('动词', '拿；花费；乘坐'),
    'give': ('动词', '给'),
    'go': ('动词', '去'),
    'come': ('动词', '来'),
    'see': ('动词', '看见；明白'),
    'look': ('动词', '看；看起来'),
    'watch': ('动词', '观看；手表'),
    'say': ('动词', '说'),
    'tell': ('动词', '告诉；讲述'),
    'speak': ('动词', '说话；讲（语言）'),
    'talk': ('动词', '谈话'),
    'think': ('动词', '想；认为'),
    'know': ('动词', '知道；认识'),
    'find': ('动词', '找到；发现'),
    'keep': ('动词', '保持；保存'),
    'leave': ('动词', '离开；留下'),
    'put': ('动词', '放；摆'),
    'turn': ('动词', '转动；变成'),
    'bring': ('动词', '带来'),
    'carry': ('动词', '携带；搬运'),
    'hold': ('动词', '握住；举行'),
    'play': ('动词', '玩；演奏；比赛'),
    'run': ('动词', '跑；经营'),
    'stand': ('动词', '站；忍受'),
    'set': ('动词', '放置；设置'),
    'show': ('动词', '展示；表明'),
    'call': ('动词', '打电话；称呼'),
    'ask': ('动词', '问；请求'),
    'answer': ('动词', '回答；答案'),
    'help': ('动词', '帮助'),
    'want': ('动词', '想要'),
    'like': ('动词', '喜欢；像'),
    'love': ('动词', '爱'),
    'hate': ('动词', '讨厌'),
    'hope': ('动词', '希望'),
    'wish': ('动词', '希望；祝愿'),
    'need': ('动词', '需要'),
    'use': ('动词', '使用'),
    'mean': ('动词', '意思是；意味着'),
    'matter': ('动词', '要紧；事情'),
    'mind': ('动词', '介意；头脑'),
    'miss': ('动词', '错过；想念'),
    'pass': ('动词', '传递；通过'),
    'pay': ('动词', '支付'),
    'spend': ('动词', '花费'),
    'cost': ('动词', '花费；成本'),
    'win': ('动词', '赢'),
    'lose': ('动词', '失去；输'),
    'beat': ('动词', '打败；敲打'),
    'fall': ('动词', '落下；跌倒'),
    'feel': ('动词', '感觉'),
    'grow': ('动词', '生长；种植'),
    'become': ('动词', '变成'),
    'begin': ('动词', '开始'),
    'start': ('动词', '开始'),
    'finish': ('动词', '完成'),
    'stop': ('动词', '停止'),
    'try': ('动词', '尝试'),
    'decide': ('动词', '决定'),
    'choose': ('动词', '选择'),
    'agree': ('动词', '同意'),
    'refuse': ('动词', '拒绝'),
    'allow': ('动词', '允许'),
    'let': ('动词', '让'),
    'promise': ('动词', '承诺'),
    'remember': ('动词', '记得'),
    'forget': ('动词', '忘记'),
    'learn': ('动词', '学习'),
    'teach': ('动词', '教'),
    'study': ('动词', '学习；研究'),
    'read': ('动词', '读'),
    'write': ('动词', '写'),
    'draw': ('动词', '画；拉'),
    'sing': ('动词', '唱'),
    'dance': ('动词', '跳舞'),
    'swim': ('动词', '游泳'),
    'climb': ('动词', '攀登'),
    'fly': ('动词', '飞；乘飞机'),
    'drive': ('动词', '驾驶'),
    'ride': ('动词', '骑；乘'),
    'walk': ('动词', '走；散步'),
    'arrive': ('动词', '到达'),
    'reach': ('动词', '到达；伸手'),
    'return': ('动词', '返回；归还'),
    'follow': ('动词', '跟随；遵循'),
    'lead': ('动词', '带领；导致'),
    'join': ('动词', '参加；连接'),
    'share': ('动词', '分享；共用'),
    'spend': ('动词', '花费'),
    'save': ('动词', '节省；拯救'),
    'waste': ('动词', '浪费'),
    'protect': ('动词', '保护'),
    'improve': ('动词', '改善；提高'),
    'develop': ('动词', '发展；培养'),
    'provide': ('动词', '提供'),
    'offer': ('动词', '提供；主动提出'),
    'suggest': ('动词', '建议'),
    'advise': ('动词', '建议'),
    'warn': ('动词', '警告'),
    'encourage': ('动词', '鼓励'),
    'prevent': ('动词', '阻止；预防'),
    'avoid': ('动词', '避免'),
    'consider': ('动词', '考虑；认为'),
    'imagine': ('动词', '想象'),
    'realise': ('动词', '意识到；实现'),
    'realize': ('动词', '意识到；实现'),
    'notice': ('动词', '注意到；通知'),
    'describe': ('动词', '描述'),
    'explain': ('动词', '解释'),
    'express': ('动词', '表达'),
    'introduce': ('动词', '介绍'),
    'invite': ('动词', '邀请'),
    'thank': ('动词', '感谢'),
    'welcome': ('动词', '欢迎'),
    'celebrate': ('动词', '庆祝'),
    'compare': ('动词', '比较'),
    'complete': ('动词', '完成；完整的'),
    'continue': ('动词', '继续'),
    'control': ('动词', '控制'),
    'create': ('动词', '创造'),
    'cross': ('动词', '穿过；十字'),
    'depend': ('动词', '依靠；取决于'),
    'die': ('动词', '死'),
    'discover': ('动词', '发现'),
    'discuss': ('动词', '讨论'),
    'disturb': ('动词', '打扰'),
    'divide': ('动词', '分开；划分'),
    'expect': ('动词', '期望；预料'),
    'fail': ('动词', '失败；不及格'),
    'fight': ('动词', '打架；战斗'),
    'fill': ('动词', '装满；填写'),
    'fix': ('动词', '修理；固定'),
    'hang': ('动词', '悬挂'),
    'happen': ('动词', '发生'),
    'hurry': ('动词', '匆忙'),
    'hurt': ('动词', '伤害；疼痛'),
    'include': ('动词', '包括'),
    'increase': ('动词', '增加'),
    'insist': ('动词', '坚持'),
    'invent': ('动词', '发明'),
    'kill': ('动词', '杀死'),
    'knock': ('动词', '敲'),
    'laugh': ('动词', '笑'),
    'lie': ('动词', '躺；撒谎；谎言'),
    'lie': ('动词', '躺；位于；说谎'),
    'lift': ('动词', '举起；电梯'),
    'listen': ('动词', '听'),
    'live': ('动词', '居住；生活'),
    'lock': ('动词', '锁'),
    'marry': ('动词', '结婚'),
    'mend': ('动词', '修理'),
    'mention': ('动词', '提到'),
    'move': ('动词', '移动；搬家'),
    'nod': ('动词', '点头'),
    'open': ('动词', '打开；开放的'),
    'paint': ('动词', '绘画；油漆'),
    'pick': ('动词', '挑选；摘'),
    'plant': ('动词', '种植；植物'),
    'practise': ('动词', '练习'),
    'practice': ('动词', '练习'),
    'praise': ('动词', '表扬'),
    'prepare': ('动词', '准备'),
    'print': ('动词', '打印；印刷'),
    'produce': ('动词', '生产'),
    'pronounce': ('动词', '发音'),
    'prove': ('动词', '证明'),
    'pull': ('动词', '拉'),
    'push': ('动词', '推'),
    'raise': ('动词', '举起；提高；筹集'),
    'recite': ('动词', '背诵'),
    'record': ('动词', '记录；录音'),
    'relax': ('动词', '放松'),
    'remain': ('动词', '保持；剩下'),
    'repair': ('动词', '修理'),
    'repeat': ('动词', '重复'),
    'reply': ('动词', '回答'),
    'report': ('动词', '报告；报道'),
    'require': ('动词', '需要；要求'),
    'rest': ('动词', '休息；剩余部分'),
    'retell': ('动词', '复述'),
    'review': ('动词', '复习；回顾'),
    'rise': ('动词', '上升'),
    'rush': ('动词', '冲；匆忙'),
    'satisfy': ('动词', '使满意'),
    'search': ('动词', '搜索；寻找'),
    'seem': ('动词', '似乎'),
    'sell': ('动词', '卖'),
    'send': ('动词', '寄；送'),
    'separate': ('动词', '分开'),
    'serve': ('动词', '服务；供应'),
    'shake': ('动词', '摇动；握手'),
    'shine': ('动词', '照耀；发光'),
    'shout': ('动词', '喊叫'),
    'shut': ('动词', '关闭'),
    'smell': ('动词', '闻；气味'),
    'smile': ('动词', '微笑'),
    'smoke': ('动词', '吸烟；烟'),
    'sound': ('动词', '听起来；声音'),
    'spell': ('动词', '拼写'),
    'spread': ('动词', '传播；展开'),
    'steal': ('动词', '偷'),
    'stick': ('动词', '粘贴；棍子'),
    'succeed': ('动词', '成功'),
    'suppose': ('动词', '假设；认为'),
    'sweep': ('动词', '扫'),
    'swing': ('动词', '摇摆；秋千'),
    'taste': ('动词', '品尝；味道'),
    'throw': ('动词', '扔'),
    'touch': ('动词', '触摸；感动'),
    'train': ('动词', '训练；火车'),
    'translate': ('动词', '翻译'),
    'travel': ('动词', '旅行'),
    'treat': ('动词', '对待；治疗'),
    'trust': ('动词', '信任'),
    'wake': ('动词', '醒来；唤醒'),
    'wash': ('动词', '洗'),
    'wear': ('动词', '穿；戴'),
    'weigh': ('动词', '称重'),
    'wonder': ('动词', '想知道；惊奇'),
    'worry': ('动词', '担心'),
    'wound': ('动词', '使受伤；伤口'),
    # 高频多义名词
    'time': ('名词', '时间；次数'),
    'way': ('名词', '方法；道路'),
    'thing': ('名词', '东西；事情'),
    'people': ('名词', '人；人们'),
    'man': ('名词', '男人；人类'),
    'woman': ('名词', '女人'),
    'child': ('名词', '孩子'),
    'family': ('名词', '家庭'),
    'home': ('名词', '家'),
    'house': ('名词', '房子'),
    'room': ('名词', '房间；空间'),
    'school': ('名词', '学校'),
    'class': ('名词', '班级；课'),
    'lesson': ('名词', '课；教训'),
    'book': ('名词', '书；预订'),
    'word': ('名词', '单词；话语'),
    'story': ('名词', '故事'),
    'news': ('名词', '新闻；消息'),
    'message': ('名词', '消息；信息'),
    'letter': ('名词', '信；字母'),
    'phone': ('名词', '电话'),
    'phone': ('名词', '电话'),
    'work': ('名词', '工作；作品'),
    'job': ('名词', '工作；职业'),
    'life': ('名词', '生活；生命'),
    'world': ('名词', '世界'),
    'country': ('名词', '国家；乡村'),
    'city': ('名词', '城市'),
    'place': ('名词', '地方；放置'),
    'part': ('名词', '部分；角色'),
    'end': ('名词', '结束；末端'),
    'side': ('名词', '边；方面'),
    'top': ('名词', '顶部'),
    'front': ('名词', '前面'),
    'back': ('名词', '后面；背部；返回'),
    'middle': ('名词', '中间'),
    'left': ('形容词', '左边的'),
    'right': ('形容词', '右边的；正确的；权利'),
    'present': ('名词', '现在；礼物；出席的'),
    'order': ('名词', '顺序；命令；点餐'),
    'point': ('名词', '点；观点；要点'),
    'question': ('名词', '问题'),
    'problem': ('名词', '问题；难题'),
    'answer': ('名词', '答案；回答'),
    'reason': ('名词', '原因；理由'),
    'result': ('名词', '结果'),
    'chance': ('名词', '机会；可能性'),
    'choice': ('名词', '选择'),
    'idea': ('名词', '主意；想法'),
    'mind': ('名词', '头脑；介意'),
    'sense': ('名词', '感觉；意义'),
    'interest': ('名词', '兴趣；利息'),
    'experience': ('名词', '经验；经历'),
    'example': ('名词', '例子'),
    'fact': ('名词', '事实'),
    'truth': ('名词', '真相'),
    'secret': ('名词', '秘密；秘密的'),
    'trouble': ('名词', '麻烦'),
    'danger': ('名词', '危险'),
    'health': ('名词', '健康'),
    'money': ('名词', '钱'),
    'price': ('名词', '价格'),
    'cost': ('名词', '费用；成本'),
    'value': ('名词', '价值'),
    'business': ('名词', '生意；事务'),
    'company': ('名词', '公司；陪伴'),
    'group': ('名词', '组；群体'),
    'team': ('名词', '队；团队'),
    'member': ('名词', '成员'),
    'leader': ('名词', '领导者'),
    'music': ('名词', '音乐'),
    'art': ('名词', '艺术；美术'),
    'film': ('名词', '电影；胶卷'),
    'movie': ('名词', '电影'),
    'game': ('名词', '游戏；比赛'),
    'match': ('名词', '比赛；火柴；相配'),
    'race': ('名词', '比赛；种族'),
    'sport': ('名词', '运动'),
    'exercise': ('名词', '锻炼；练习'),
    'food': ('名词', '食物'),
    'water': ('名词', '水'),
    'fire': ('名词', '火；解雇'),
    'light': ('名词', '光；灯；轻的'),
    'sound': ('名词', '声音'),
    'voice': ('名词', '嗓音'),
    'noise': ('名词', '噪音'),
    'weather': ('名词', '天气'),
    'earth': ('名词', '地球；土壤'),
    'nature': ('名词', '自然'),
    'environment': ('名词', '环境'),
    'energy': ('名词', '能量；精力'),
    'space': ('名词', '空间；太空'),
    'field': ('名词', '田野；领域'),
    'ground': ('名词', '地面'),
    'land': ('名词', '陆地；土地'),
    'sea': ('名词', '海'),
    'river': ('名词', '河流'),
    'mountain': ('名词', '山'),
    'forest': ('名词', '森林'),
    'tree': ('名词', '树'),
    'flower': ('名词', '花'),
    'grass': ('名词', '草'),
    'animal': ('名词', '动物'),
    'head': ('名词', '头；领导'),
    'face': ('名词', '脸；面对'),
    'eye': ('名词', '眼睛'),
    'ear': ('名词', '耳朵'),
    'nose': ('名词', '鼻子'),
    'mouth': ('名词', '嘴'),
    'hand': ('名词', '手'),
    'foot': ('名词', '脚；英尺'),
    'leg': ('名词', '腿'),
    'arm': ('名词', '手臂'),
    'heart': ('名词', '心脏；内心'),
    'body': ('名词', '身体'),
    'hair': ('名词', '头发'),
    'blood': ('名词', '血'),
    'health': ('名词', '健康'),
    'illness': ('名词', '疾病'),
    'disease': ('名词', '疾病'),
    'medicine': ('名词', '药；医学'),
    'doctor': ('名词', '医生'),
    'nurse': ('名词', '护士'),
    'hospital': ('名词', '医院'),
    'teacher': ('名词', '教师'),
    'student': ('名词', '学生'),
    'pupil': ('名词', '小学生'),
    'friend': ('名词', '朋友'),
    'parent': ('名词', '父/母亲'),
    'father': ('名词', '父亲'),
    'mother': ('名词', '母亲'),
    'brother': ('名词', '兄弟'),
    'sister': ('名词', '姐妹'),
    'son': ('名词', '儿子'),
    'daughter': ('名词', '女儿'),
    'uncle': ('名词', '叔叔；舅舅'),
    'aunt': ('名词', '阿姨；姑姑'),
    'cousin': ('名词', '堂/表兄弟姐妹'),
    'grandfather': ('名词', '祖父；外祖父'),
    'grandmother': ('名词', '祖母；外祖母'),
    'grandpa': ('名词', '爷爷；外公'),
    'grandma': ('名词', '奶奶；外婆'),
    'wife': ('名词', '妻子'),
    'husband': ('名词', '丈夫'),
    'child': ('名词', '孩子'),
    'baby': ('名词', '婴儿'),
    'kid': ('名词', '小孩'),
    'boy': ('名词', '男孩'),
    'girl': ('名词', '女孩'),
    'person': ('名词', '人'),
    'human': ('名词', '人类'),
    'neighbour': ('名词', '邻居'),
    'neighbor': ('名词', '邻居'),
    'stranger': ('名词', '陌生人'),
    'visitor': ('名词', '参观者；访客'),
    'guest': ('名词', '客人'),
    'customer': ('名词', '顾客'),
    'police': ('名词', '警察（总称）'),
    'policeman': ('名词', '男警察'),
    'worker': ('名词', '工人'),
    'farmer': ('名词', '农民'),
    'driver': ('名词', '司机'),
    'scientist': ('名词', '科学家'),
    'engineer': ('名词', '工程师'),
    'artist': ('名词', '艺术家'),
    'writer': ('名词', '作家'),
    'singer': ('名词', '歌手'),
    'actor': ('名词', '男演员'),
    'player': ('名词', '运动员；播放器'),
    'coach': ('名词', '教练；长途汽车'),
    'boss': ('名词', '老板'),
    'manager': ('名词', '经理'),
    'secretary': ('名词', '秘书'),
    'servant': ('名词', '仆人'),
    'owner': ('名词', '主人；所有者'),
    'hero': ('名词', '英雄'),
    'pioneer': ('名词', '先锋'),
    'pilot': ('名词', '飞行员'),
    'soldier': ('名词', '士兵'),
    'captain': ('名词', '队长；船长'),
    'president': ('名词', '总统；主席'),
    'king': ('名词', '国王'),
    'queen': ('名词', '女王'),
    'prisoner': ('名词', '囚犯'),
    'enemy': ('名词', '敌人'),
    # 高频形容词副词
    'good': ('形容词', '好的'),
    'bad': ('形容词', '坏的'),
    'big': ('形容词', '大的'),
    'small': ('形容词', '小的'),
    'long': ('形容词', '长的'),
    'short': ('形容词', '短的；矮的'),
    'high': ('形容词', '高的'),
    'low': ('形容词', '低的'),
    'new': ('形容词', '新的'),
    'old': ('形容词', '老的；旧的'),
    'young': ('形容词', '年轻的'),
    'hot': ('形容词', '热的'),
    'cold': ('形容词', '冷的'),
    'warm': ('形容词', '温暖的'),
    'cool': ('形容词', '凉爽的；酷的'),
    'easy': ('形容词', '容易的'),
    'hard': ('形容词', '困难的；硬的；努力地'),
    'difficult': ('形容词', '困难的'),
    'busy': ('形容词', '忙的'),
    'free': ('形容词', '自由的；免费的；空闲的'),
    'full': ('形容词', '满的；饱的'),
    'empty': ('形容词', '空的'),
    'heavy': ('形容词', '重的'),
    'strong': ('形容词', '强壮的'),
    'weak': ('形容词', '虚弱的'),
    'rich': ('形容词', '富有的'),
    'poor': ('形容词', '贫穷的；可怜的'),
    'fast': ('形容词', '快的'),
    'slow': ('形容词', '慢的'),
    'quick': ('形容词', '快的'),
    'early': ('形容词', '早的'),
    'late': ('形容词', '晚的；迟的'),
    'near': ('形容词', '近的'),
    'far': ('形容词', '远的'),
    'right': ('形容词', '正确的；右边的'),
    'wrong': ('形容词', '错误的'),
    'true': ('形容词', '真的'),
    'real': ('形容词', '真实的'),
    'same': ('形容词', '相同的'),
    'different': ('形容词', '不同的'),
    'similar': ('形容词', '相似的'),
    'special': ('形容词', '特别的'),
    'important': ('形容词', '重要的'),
    'necessary': ('形容词', '必要的'),
    'possible': ('形容词', '可能的'),
    'impossible': ('形容词', '不可能的'),
    'famous': ('形容词', '著名的'),
    'popular': ('形容词', '受欢迎的'),
    'interesting': ('形容词', '有趣的'),
    'boring': ('形容词', '无聊的'),
    'funny': ('形容词', '滑稽的；有趣的'),
    'beautiful': ('形容词', '美丽的'),
    'pretty': ('形容词', '漂亮的；相当'),
    'handsome': ('形容词', '英俊的'),
    'ugly': ('形容词', '丑的'),
    'clean': ('形容词', '干净的'),
    'dirty': ('形容词', '脏的'),
    'quiet': ('形容词', '安静的'),
    'loud': ('形容词', '响亮的'),
    'safe': ('形容词', '安全的'),
    'dangerous': ('形容词', '危险的'),
    'healthy': ('形容词', '健康的'),
    'sick': ('形容词', '生病的'),
    'ill': ('形容词', '生病的'),
    'tired': ('形容词', '疲倦的'),
    'sleepy': ('形容词', '困倦的'),
    'hungry': ('形容词', '饥饿的'),
    'thirsty': ('形容词', '口渴的'),
    'happy': ('形容词', '快乐的'),
    'sad': ('形容词', '悲伤的'),
    'angry': ('形容词', '生气的'),
    'afraid': ('形容词', '害怕的'),
    'glad': ('形容词', '高兴的'),
    'proud': ('形容词', '自豪的'),
    'sorry': ('形容词', '抱歉的；难过的'),
    'sure': ('形容词', '确信的'),
    'certain': ('形容词', '确定的；某个'),
    'ready': ('形容词', '准备好的'),
    'careful': ('形容词', '仔细的'),
    'careless': ('形容词', '粗心的'),
    'polite': ('形容词', '有礼貌的'),
    'kind': ('形容词', '善良的；种类'),
    'friendly': ('形容词', '友好的'),
    'honest': ('形容词', '诚实的'),
    'brave': ('形容词', '勇敢的'),
    'clever': ('形容词', '聪明的'),
    'smart': ('形容词', '聪明的'),
    'stupid': ('形容词', '愚蠢的'),
    'silly': ('形容词', '傻的'),
    'lazy': ('形容词', '懒惰的'),
    'lucky': ('形容词', '幸运的'),
    'lonely': ('形容词', '孤独的'),
    'lively': ('形容词', '活泼的'),
    'active': ('形容词', '积极的；活跃的'),
    'serious': ('形容词', '严肃的；严重的'),
    'strict': ('形容词', '严格的'),
    'gentle': ('形容词', '温柔的'),
    'cruel': ('形容词', '残酷的'),
    'mad': ('形容词', '发疯的；生气的'),
    'crazy': ('形容词', '疯狂的'),
    'deaf': ('形容词', '聋的'),
    'blind': ('形容词', '瞎的'),
    'dead': ('形容词', '死的'),
    'alive': ('形容词', '活着的'),
    'asleep': ('形容词', '睡着的'),
    'awake': ('形容词', '醒着的'),
    'modern': ('形容词', '现代的'),
    'ancient': ('形容词', '古代的'),
    'traditional': ('形容词', '传统的'),
    'national': ('形容词', '国家的'),
    'international': ('形容词', '国际的'),
    'personal': ('形容词', '个人的'),
    'private': ('形容词', '私人的'),
    'public': ('形容词', '公共的'),
    'social': ('形容词', '社会的'),
    'natural': ('形容词', '自然的'),
    'medical': ('形容词', '医学的'),
    'electric': ('形容词', '电的'),
    'basic': ('形容词', '基本的'),
    'common': ('形容词', '普通的；共同的'),
    'usual': ('形容词', '通常的'),
    'sudden': ('形容词', '突然的'),
    'final': ('形容词', '最后的'),
    'main': ('形容词', '主要的'),
    'total': ('形容词', '总的'),
    'whole': ('形容词', '整个的'),
    'several': ('形容词', '几个的'),
    'few': ('形容词', '很少的'),
    'little': ('形容词', '少的；小的'),
    'much': ('形容词', '许多的'),
    'many': ('形容词', '许多的'),
    'enough': ('形容词', '足够的'),
    'only': ('形容词', '唯一的；仅仅'),
    'just': ('副词', '刚才；仅仅；正好'),
    'well': ('副词', '好地；健康的；嗯（感叹）'),
    'matter': ('动词', '要紧；事情；问题'),
    'very': ('副词', '非常'),
    'too': ('副词', '也；太'),
    'also': ('副词', '也'),
    'either': ('副词', '也（否定句）'),
    'neither': ('副词', '也不'),
    'so': ('副词', '如此；也（肯定句）'),
    'now': ('副词', '现在'),
    'then': ('副词', '然后；那时'),
    'soon': ('副词', '很快'),
    'still': ('副词', '仍然；安静的'),
    'already': ('副词', '已经'),
    'yet': ('副词', '还；已经'),
    'ever': ('副词', '曾经'),
    'never': ('副词', '从不'),
    'always': ('副词', '总是'),
    'often': ('副词', '经常'),
    'sometimes': ('副词', '有时'),
    'seldom': ('副词', '很少'),
    'usually': ('副词', '通常'),
    'hardly': ('副词', '几乎不'),
    'nearly': ('副词', '几乎'),
    'almost': ('副词', '几乎'),
    'quite': ('副词', '相当'),
    'rather': ('副词', '相当；宁可'),
    'really': ('副词', '真正地；确实'),
    'especially': ('副词', '尤其'),
    'probably': ('副词', '大概'),
    'perhaps': ('副词', '也许'),
    'maybe': ('副词', '也许'),
    'certainly': ('副词', '当然'),
    'immediately': ('副词', '立刻'),
    'finally': ('副词', '最后；终于'),
    'suddenly': ('副词', '突然'),
    'actually': ('副词', '实际上'),
    'quickly': ('副词', '迅速地'),
    'slowly': ('副词', '缓慢地'),
    'carefully': ('副词', '仔细地'),
    'happily': ('副词', '快乐地'),
    'easily': ('副词', '容易地'),
    'safely': ('副词', '安全地'),
    'quietly': ('副词', '安静地'),
    'loudly': ('副词', '大声地'),
    'angrily': ('副词', '生气地'),
    'luckily': ('副词', '幸运地'),
    'badly': ('副词', '糟糕地；严重地'),
    'truly': ('副词', '真正地'),
    'widely': ('副词', '广泛地'),
    'together': ('副词', '一起'),
    'alone': ('副词', '独自'),
    'around': ('副词', '周围；大约'),
    'away': ('副词', '离开；远处'),
    'forward': ('副词', '向前'),
    'instead': ('副词', '代替；反而'),
    'however': ('副词', '然而'),
    'therefore': ('副词', '因此'),
    'otherwise': ('副词', '否则'),
    'besides': ('副词', '此外'),
    'beside': ('介词', '在…旁边'),
    'twice': ('副词', '两次；两倍'),
    'once': ('副词', '一次；曾经'),
    'again': ('副词', '再次'),
    'ago': ('副词', '以前'),
    'later': ('副词', '后来；以后'),
    'recently': ('副词', '最近'),
    'daily': ('副词', '每日的；每天'),
    'outdoors': ('副词', '在户外'),
    'upstairs': ('副词', '在楼上'),
    'downstairs': ('副词', '在楼下'),
    'abroad': ('副词', '在国外'),
    'overseas': ('副词', '在海外'),
    # 数词
    'one': ('数词', '一'), 'two': ('数词', '二'), 'three': ('数词', '三'),
    'four': ('数词', '四'), 'five': ('数词', '五'), 'six': ('数词', '六'),
    'seven': ('数词', '七'), 'eight': ('数词', '八'), 'nine': ('数词', '九'),
    'ten': ('数词', '十'), 'eleven': ('数词', '十一'), 'twelve': ('数词', '十二'),
    'thirteen': ('数词', '十三'), 'fourteen': ('数词', '十四'), 'fifteen': ('数词', '十五'),
    'sixteen': ('数词', '十六'), 'seventeen': ('数词', '十七'), 'eighteen': ('数词', '十八'),
    'nineteen': ('数词', '十九'), 'twenty': ('数词', '二十'), 'thirty': ('数词', '三十'),
    'forty': ('数词', '四十'), 'fifty': ('数词', '五十'), 'sixty': ('数词', '六十'),
    'seventy': ('数词', '七十'), 'eighty': ('数词', '八十'), 'ninety': ('数词', '九十'),
    'hundred': ('数词', '百'), 'thousand': ('数词', '千'), 'million': ('数词', '百万'),
    'first': ('数词', '第一'), 'second': ('数词', '第二'), 'third': ('数词', '第三'),
    'fourth': ('数词', '第四'), 'fifth': ('数词', '第五'), 'sixth': ('数词', '第六'),
    'seventh': ('数词', '第七'), 'eighth': ('数词', '第八'), 'ninth': ('数词', '第九'),
    'tenth': ('数词', '第十'), 'twelfth': ('数词', '第十二'), 'twentieth': ('数词', '第二十'),
    'zero': ('数词', '零'),
    # 缩写与常见词
    'Mr.': ('名词', '先生'), 'Mr': ('名词', '先生'),
    'Ms.': ('名词', '女士'), 'Ms': ('名词', '女士'),
    'Mrs.': ('名词', '夫人'), 'Mrs': ('名词', '夫人'),
    'OK': ('形容词', '好的；行'),
    'TV': ('名词', '电视'),
    'CD': ('名词', '光盘'),
    'CD-ROM': ('名词', '只读光盘'),
    'DVD': ('名词', '数字光盘'), 'dvd': ('名词', '数字光盘'),
    'VCD': ('名词', '影音光盘'), 'vcd': ('名词', '影音光盘'),
    'internet': ('名词', '互联网'),
    'Internet': ('名词', '互联网'),
    'email': ('名词', '电子邮件'),
    'e-mail': ('名词', '电子邮件'),
    'website': ('名词', '网站'),
    'x-ray': ('名词', 'X 光'),
    'X-ray': ('名词', 'X 光'),
    'ice cream': ('名词', '冰淇淋'),
    'T-shirt': ('名词', 'T 恤衫'),
    'socks': ('名词', '袜子'),
    'shorts': ('名词', '短裤'),
    'trousers': ('名词', '裤子'),
    'jeans': ('名词', '牛仔裤'),
    'clothes': ('名词', '衣服'),
    'chopsticks': ('名词', '筷子'),
    'pence': ('名词', '便士（复数）'),
    'penny': ('名词', '便士'),
    'percent': ('名词', '百分之…'),
    'math': ('名词', '数学'),
    'maths': ('名词', '数学'),
    'mathematics': ('名词', '数学'),
    'gym': ('名词', '体育馆；体操'),
    'gymnasium': ('名词', '体育馆'),
    'lab': ('名词', '实验室'),
    'laboratory': ('名词', '实验室'),
    'exam': ('名词', '考试'),
    'examination': ('名词', '考试；检查'),
    'photo': ('名词', '照片'),
    'photograph': ('名词', '照片'),
    'bike': ('名词', '自行车'),
    'bicycle': ('名词', '自行车'),
    'fridge': ('名词', '冰箱'),
    'airplane': ('名词', '飞机'),
    'aeroplane': ('名词', '飞机'),
    'centre': ('名词', '中心'),
    'center': ('名词', '中心'),
    'colour': ('名词', '颜色'),
    'color': ('名词', '颜色'),
    'favourite': ('形容词', '最喜爱的'),
    'favorite': ('形容词', '最喜爱的'),
    'theatre': ('名词', '剧院'),
    'theater': ('名词', '剧院'),
    'metre': ('名词', '米'),
    'meter': ('名词', '米；仪表'),
    'kilometre': ('名词', '千米；公里'),
    'kilometer': ('名词', '千米；公里'),
    'programme': ('名词', '节目；计划'),
    'program': ('名词', '节目；程序'),
    'labour': ('名词', '劳动'),
    'labor': ('名词', '劳动'),
    'honour': ('名词', '荣誉'),
    'honor': ('名词', '荣誉'),
    'travelling': ('名词', '旅行'),
    'traveling': ('名词', '旅行'),
    'behaviour': ('名词', '行为'),
    'behavior': ('名词', '行为'),
}

# ---------- 补充：初中必会的派生词与词形（ECDICT 未打 zk 标签但考纲必考） ----------
EXTRA = [
    ('matter', '动词', '要紧；事情；问题', "mætә", 600),
    ('better', '形容词', '更好的（good/well 的比较级）', "betә", 200),
    ('best', '形容词', '最好的（good/well 的最高级）', "best", 260),
    ('worse', '形容词', '更坏的（bad/ill 的比较级）', "wә:s", 1200),
    ('worst', '形容词', '最坏的（bad/ill 的最高级）', "wә:st", 2400),
    ('more', '形容词', '更多的（many/much 的比较级）', "mɔ:", 60),
    ('most', '形容词', '最多的（many/much 的最高级）', "mәust", 70),
    ('less', '形容词', '更少的（little 的比较级）', "les", 900),
    ('least', '形容词', '最少的（little 的最高级）', "li:st", 1600),
    ('fewer', '形容词', '更少的（few 的比较级）', "fju:ә", 3200),
    ('further', '形容词', '更远的；进一步的', "fә:ðә", 1400),
    ('elder', '形容词', '年长的', "eldә", 4200),
    ('usually', '副词', '通常', "ju:ʒuәli", 700),
    ('quickly', '副词', '迅速地', "kwikli", 1300),
    ('carefully', '副词', '仔细地', "kєәfuli", 2100),
    ('happily', '副词', '快乐地', "hæpili", 2600),
    ('slowly', '副词', '缓慢地', "slәuli", 1900),
    ('suddenly', '副词', '突然', "sʌdәnli", 1500),
    ('finally', '副词', '最后；终于', "fainәli", 1100),
    ('actually', '副词', '实际上', "æktʃuәli", 1000),
    ('easily', '副词', '容易地', "i:zili", 1700),
    ('quietly', '副词', '安静地', "kwaiәtli", 2900),
    ('loudly', '副词', '大声地', "laudli", 3600),
    ('safely', '副词', '安全地', "seifli", 3000),
    ('angrily', '副词', '生气地', "æŋgrili", 4800),
    ('luckily', '副词', '幸运地', "lʌkili", 3400),
    ('badly', '副词', '糟糕地；严重地', "bædli", 1600),
    ('truly', '副词', '真正地', "tru:li", 2700),
    ('widely', '副词', '广泛地', "waidli", 2000),
    ('softly', '副词', '轻柔地', "sɒftli", 4300),
    ('politely', '副词', '有礼貌地', "pәlaitli", 5200),
    ('carelessly', '副词', '粗心地', "kєәlisli", 6400),
    ('successfully', '副词', '成功地', "sәksesfuli", 2800),
    ('comfortably', '副词', '舒适地', "kʌmfәtәbli", 3900),
    ('towards', '介词', '朝；向', "tәwɔ:dz", 1200),
    ('toward', '介词', '朝；向', "tәwɔ:d", 1500),
    ('an', '冠词', '一个（元音音素前）', "æn", 40),
    ('won', '动词', '赢（win 的过去式/过去分词）', "wʌn", 1900),
    ('written', '动词', '写（write 的过去分词）', "ritn", 1300),
    ('spoken', '动词', '说（speak 的过去分词）', "spәukәn", 2200),
    ('broken', '形容词', '破碎的；坏了的', "brәukәn", 1800),
    ('chosen', '动词', '选择（choose 的过去分词）', "tʃәuzn", 2500),
    ('drunk', '动词', '喝（drink 的过去分词）', "drʌŋk", 4100),
    ('eaten', '动词', '吃（eat 的过去分词）', "i:tn", 3700),
    ('fallen', '动词', '落下（fall 的过去分词）', "fɔ:lәn", 3100),
    ('forgotten', '动词', '忘记（forget 的过去分词）', "fәgɒtn", 3300),
    ('given', '动词', '给（give 的过去分词）', "givn", 1400),
    ('hidden', '形容词', '隐藏的', "hidn", 2600),
    ('known', '形容词', '已知的；著名的', "nәun", 1000),
    ('left', '动词', '离开（leave 的过去式/过去分词）', "left", 400),
    ('lost', '形容词', '丢失的；迷路的', "lɒst", 1000),
    ('paid', '动词', '支付（pay 的过去式/过去分词）', "peid", 1500),
    ('seen', '动词', '看见（see 的过去分词）', "si:n", 500),
    ('sold', '动词', '卖（sell 的过去式/过去分词）', "sәuld", 1700),
    ('sung', '动词', '唱（sing 的过去分词）', "sʌŋ", 6000),
    ('taken', '动词', '拿（take 的过去分词）', "teikәn", 900),
    ('taught', '动词', '教（teach 的过去式/过去分词）', "tɔ:t", 2300),
    ('thought', '名词', '想法；思想', "θɔ:t", 600),
    ('told', '动词', '告诉（tell 的过去式/过去分词）', "tәuld", 800),
    ('understood', '动词', '理解（understand 的过去式/过去分词）', "ʌndәstud", 2400),
]

# ---------- 英式/美式拼写别名 ----------
ALIAS = {
    'colour': ['color'], 'favourite': ['favorite'], 'centre': ['center'],
    'realise': ['realize'], 'programme': ['program'], 'theatre': ['theater'],
    'metre': ['meter'], 'neighbour': ['neighbor'], 'labour': ['labor'],
    'honour': ['honor'], 'practise': ['practice'], 'travelling': ['traveling'],
    'behaviour': ['behavior'], 'kilometre': ['kilometer'],
}

# ---------- 课标主题分组（人与自我 / 人与社会 / 人与自然） ----------
TOPICS = [
    ('personal-family', '个人与家庭', 'Personal Information & Family', '家'),
    ('school-study', '学校与学习', 'School & Study', '学'),
    ('health-sport', '健康与运动', 'Health & Sport', '健'),
    ('hobbies-leisure', '兴趣与休闲', 'Hobbies & Leisure', '趣'),
    ('feelings-personality', '情绪与性格', 'Feelings & Personality', '情'),
    ('daily-life', '日常生活', 'Daily Life', '日'),
    ('friends-social', '朋友与交往', 'Friends & Social Life', '友'),
    ('shopping-money', '购物与消费', 'Shopping & Money', '购'),
    ('food-drink', '饮食', 'Food & Drink', '食'),
    ('travel-transport', '旅行与交通', 'Travel & Transport', '行'),
    ('tech-media', '科技与媒体', 'Science, Technology & Media', '技'),
    ('work-jobs', '工作与职业', 'Work & Jobs', '职'),
    ('culture-festival', '文化与节日', 'Culture & Festivals', '文'),
    ('society-people', '社会与人物', 'Society & People', '社'),
    ('nature-weather', '自然与天气', 'Nature & Weather', '天'),
    ('animals-plants', '动物与植物', 'Animals & Plants', '动'),
    ('environment-protection', '环境与保护', 'Environment & Protection', '境'),
]

TOPIC_WORDS = {
    'personal-family': """a an I me my mine myself you your yours yourself yourselves he him his himself
    she her hers herself it its itself we us our ours ourselves they them their theirs themselves
    this that these those family father mother parent brother sister son daughter uncle aunt cousin
    grandfather grandmother grandpa grandma grandchild grandson granddaughter granny wife husband
    child baby kid boy girl man woman person human people neighbour neighbour name age birthday
    birth marry marriage handsome pretty beautiful lovely kind friendly shy lively brave honest
    polite humorous clever lazy careful careless""",
    'school-study': """school class classroom classmate student pupil teacher lesson study learn teach
    book notebook textbook pen pencil eraser ruler schoolbag blackboard chalk desk homework exam
    examination test grade mark score question answer problem result knowledge subject English
    Chinese math mathematics maths science physics chemistry history geography art music PE
    education grammar composition dictionary library lab laboratory experiment
    primary college university term lesson recite review practise practice exam fail pass
    clever stupid smart attention monitor chairman secretary""",
    'health-sport': """health healthy ill illness sick disease medicine medical doctor nurse hospital
    patient fever flu cough headache toothache stomachache cold hurt wound pain ache blood
    exercise sport sports football basketball volleyball tennis baseball ping-pong swimming
    swim run jump kick throw catch climb skate ski coach player team match game race score win
    lose winner competition training train fit strong weak tired sleepy rest relax breath breathe
    tooth toothbrush toothpaste dentist eye ear nose mouth hand foot leg arm head heart body
    weight weigh height tall short fat thin heavy""",
    'hobbies-leisure': """hobby interest interesting fun funny enjoy like love prefer favourite
    music song sing dance dancing draw drawing paint painting picture photo photograph film movie
    cinema theatre concert guitar piano violin drum chess kite doll toy game play collect
    collection reading read story novel poem magazine newspaper comic cartoon TV television
    radio video computer internet website email camera travel trip picnic camp camping fishing
    garden gardening free spare leisure""",
    'feelings-personality': """happy glad pleased sad sorry angry mad afraid fear scared worried worry
    nervous excited exciting surprise surprised proud shame shy lonely lonely glad joy pleasure
    pain pity courage brave cruel gentle honest kind friendly polite rude strict serious
    humorous funny clever stupid silly lazy active lively quiet silent calm crazy nervous
    feel feeling mood hope wish regret hate love like enjoy interest bored boring tired
    comfortable uncomfortable glad wonderful terrible afraid""",
    'daily-life': """day daily week weekday weekend month year hour minute second morning afternoon
    evening night noon tonight today tomorrow yesterday time o'clock clock watch early late
    always usually often sometimes seldom never already yet soon again once twice
    get up wash brush clean tidy cook meal housework home house room bedroom bathroom kitchen
    living room bed sofa chair table desk door window wall floor ceiling lamp light mirror
    sleep wake dream shower bath toilet towel soap comb key lock bell
    busy free ready""",
    'friends-social': """friend friendly friendship classmate neighbour stranger guest visitor
    invite invitation visit meet meeting together alone help helpful share talk chat conversation
    dialogue discuss discussion agree disagreement argue quarrel trust honest true promise
    thank thanks sorry pardon please excuse welcome greeting greet hello hi bye goodbye
    polite rude respect kind friendly social society""",
    'shopping-money': """shop store supermarket market buy sell sale price cost cheap expensive
    money coin bill pound dollar cent pence penny pay spend save waste rich poor
    customer shopkeeper shop assistant boss owner goods thing product basket bag
    clothes coat jacket shirt T-shirt dress skirt trousers pants shorts jeans socks shoe
    hat cap scarf glove belt handbag purse wallet
    big small size colour red green blue black white yellow brown pink purple orange grey
    try choose choice change discount cheap""",
    'food-drink': """food drink eat meal breakfast lunch supper dinner snack dish cook cooker kitchen
    rice noodle bread cake biscuit pie sandwich hamburger hotdog dumpling pancake salad soup
    meat beef pork chicken fish egg milk tea coffee juice water coke wine beer
    apple banana orange pear grape strawberry watermelon lemon peach
    potato tomato cabbage carrot onion vegetable fruit sugar salt pepper oil butter cheese
    delicious taste sweet sour bitter hot cold fresh hungry thirsty
    restaurant menu waiter waitress order bottle cup glass bowl plate spoon fork knife chopsticks""",
    'travel-transport': """travel trip journey tour tourist visit holiday vacation
    bus car taxi train plane airplane aeroplane ship boat bike bicycle motorcycle truck
    underground subway railway station airport ticket passport luggage bag suitcase
    road street bridge corner path way map direction north south east west
    drive ride fly sail arrive leave departure return
    hotel room restaurant ticket tour guide travel abroad
    far near distance kilometre mile metre""",
    'tech-media': """computer internet website email phone telephone mobile TV television radio
    video camera photo photograph screen keyboard mouse program programme software
    technology science scientist invent invention discover discovery experiment
    robot machine electric electricity energy information message news newspaper magazine
    communicate communication media film movie music programme channel
    clone DNA space rocket satellite""",
    'work-jobs': """work job career boss manager worker farmer driver teacher doctor nurse
    police policeman postman waiter waitress shop assistant secretary servant
    engineer scientist artist writer singer actor player coach captain
    president king queen leader member team company factory office business
    busy free pay salary money earn hire fire retire
    interview application experience skill""",
    'culture-festival': """culture traditional festival holiday celebrate celebration
    Spring Festival Christmas New Year birthday party gift present card
    custom history ancient modern story poem music art dance theatre
    Chinese China English America American England Europe European Asia Asian
    Africa African Japan Japanese India Indian Russia Russian Canada Australia Australian
    country nation national international foreign foreigner language
    museum palace tower church temple custom tradition""",
    'society-people': """society social public private people person human citizen
    government law rule policy peace war army soldier enemy hero pioneer
    police prison prisoner crime murder steal thief kill fight
    help support protect service serve volunteer charity
    news report message information communication
    right duty responsibility freedom""",
    'nature-weather': """nature natural weather sunny cloudy rainy snowy windy foggy
    rain snow wind cloud sun moon star sky air water fire earth
    spring summer autumn winter season hot warm cool cold freeze
    temperature degree weather forecast
    mountain hill river lake sea ocean island forest field ground land
    tree flower grass leaf stone rock sand pond stream coast beach""",
    'animals-plants': """animal bird fish insect dog cat pig cow sheep goat horse duck hen chicken
    mouse rat rabbit lion tiger elephant monkey panda bear wolf fox deer snake frog
    whale shark butterfly bee ant spider
    tree flower grass leaf plant seed root bamboo rose
    pet zoo farm wild""",
    'environment-protection': """environment protection protect pollute pollution waste rubbish
    litter garbage recycle reuse reduce save energy water
    clean dirty fresh green natural nature resource
    earth planet climate""",
}

# 主题之外的功能词/抽象词仍留在全量词表，只是不进话题页


def norm_lines(tr):
    if not tr:
        return []
    tr = tr.replace('\\r\\n', '\n').replace('\\n', '\n').replace('\r', '')
    out = []
    for line in tr.split('\n'):
        line = re.split(r'\[[^\]]*\]', line)[0]
        line = line.strip()
        if line:
            out.append(line)
    return out


def senses(tr):
    out = []
    for line in norm_lines(tr):
        m = re.match(r'^([a-zA-Z]{1,6}\.)\s*(.*)$', line)
        if m:
            pos, body = m.group(1), m.group(2)
        else:
            pos, body = '', line
        body = re.sub(r'\([^)]*\)', '', body)
        for p in re.split(r'[;；,，、]', body):
            p = p.strip(' .。')
            if not p or len(p) > 14:
                continue
            if re.search(r'[A-Za-z]{2,}', p):
                continue
            out.append((pos, p))
    seen = set()
    res = []
    for pos, zh in out:
        if (pos, zh) in seen:
            continue
        seen.add((pos, zh))
        res.append((pos, zh))
    return res


def safe_frq(raw):
    """ECDICT 里 0 表示无词频数据（多为专有名词、缩写），给一个偏后但不至于垫底的默认值"""
    try:
        v = int(raw or 0)
    except Exception:
        v = 0
    return v if v > 0 else 12000


def load_ecdict():
    d = {}
    with open(ECDICT, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            d[row['word'].lower()] = row
    return d


def build():
    D = load_ecdict()
    zk_rows = [r for r in D.values() if 'zk' in (r.get('tag') or '').split()]

    entries = []
    seen = set()

    def add_entry(w, pos_zh, zh, ph, frq, ex=None):
        key = w.lower()
        if key in seen:
            return
        seen.add(key)
        entries.append({
            'w': w,
            'pos': POS_SHORT.get(pos_zh, 'n'),
            'posZh': pos_zh,
            't': 'phrase' if ' ' in w or '-' in w and w.lower() in ('ice cream',) else 'word',
            'zh': zh,
            'tag': '',
            'ph': ph or '',
            'ex': ex or [],
            'tp': [],
            'al': ALIAS.get(w, []),
            'frq': frq,
        })

    # 1) 基础词表
    for r in zk_rows:
        w = r['word']
        if w.lower() in ('a',) and w == 'a':
            pass
        ov = OVERRIDE.get(w)
        if ov:
            pos_zh, zh = ov[0], ov[1]
            ex = ov[2] if len(ov) > 2 else []
        else:
            s = senses(r['translation'])
            if not s:
                # 兜底：无释义的极少数词
                pos_zh, zh = '名词', w
            else:
                pos_zh = POSMAP.get(s[0][0], '名词')
                zh = '；'.join([z for _, z in s[:3]])
            ex = []
        frq = safe_frq(r['frq'])
        add_entry(w, pos_zh, zh, r['phonetic'], frq, ex)

    # 2) 补充派生词
    for w, pos_zh, zh, ph, frq in EXTRA:
        add_entry(w, pos_zh, zh, ph, frq)

    # 3) 大小写归一（把 zk 里的小写形式补上，便于检索；如 internet/Internet）
    for r in zk_rows:
        w = r['word']
        if w[:1].isupper():
            low = w.lower()
            if low not in seen:
                ov = OVERRIDE.get(w)
                if ov:
                    pos_zh, zh = ov[0], ov[1]
                    ex = ov[2] if len(ov) > 2 else []
                else:
                    s = senses(r['translation'])
                    pos_zh = POSMAP.get(s[0][0], '名词') if s else '名词'
                    zh = '；'.join([z for _, z in s[:3]]) if s else w
                    ex = []
                frq = safe_frq(r['frq'])
                add_entry(low, pos_zh, zh, r['phonetic'], frq + 1, ex)
                # 互为别名
                for e in entries:
                    if e['w'] == w:
                        e['al'] = sorted(set(e['al'] + [low]))
                    if e['w'] == low:
                        e['al'] = sorted(set(e['al'] + [w]))

    # 4) 分级：按词频
    #    核心高频 b1（最常考）<= 1500；中频 b2 1500–5000；拓展 b3 > 5000
    for e in entries:
        f = e['frq']
        if f <= 1500:
            e['tag'] = 'b1'
        elif f <= 5000:
            e['tag'] = 'b2'
        else:
            e['tag'] = 'b3'

    # 5) 话题归属
    topic_index = {tid: [] for tid, *_ in TOPICS}
    lower_map = {e['w'].lower(): e for e in entries}
    for tid, words in TOPIC_WORDS.items():
        for raw in words.split():
            w = raw.strip()
            if not w:
                continue
            e = lower_map.get(w.lower())
            if not e:
                continue
            if tid not in e['tp']:
                e['tp'].append(tid)

    # 6) 排序：词频升序（最常用在前），同频按字母
    entries.sort(key=lambda e: (e['frq'], e['w'].lower()))

    # 7) STATS
    stats = {
        'words': sum(1 for e in entries if e['t'] == 'word'),
        'phrases': sum(1 for e in entries if e['t'] == 'phrase'),
        'total': len(entries),
        'b1': sum(1 for e in entries if e['tag'] == 'b1'),
        'b2': sum(1 for e in entries if e['tag'] == 'b2'),
        'b3': sum(1 for e in entries if e['tag'] == 'b3'),
        'topics': len(TOPICS),
        'withExample': sum(1 for e in entries if e['ex']),
    }

    topics_out = []
    for tid, name, official, icon in TOPICS:
        n = sum(1 for e in entries if tid in e['tp'])
        topics_out.append({'id': tid, 'name': name, 'official': official, 'icon': icon, 'count': n})

    # 8) 输出
    lines = []
    lines.append('/* 自动生成 — tools/build_words.py，请勿手改 */')
    lines.append('/* 基座：义务教育英语课程标准（2022 年版）三级词汇表口径（ECDICT zk 标签 1603 词）+ 初中必会派生词 */')
    lines.append('export const WORDS = [')
    for e in entries:
        lines.append(json.dumps(e, ensure_ascii=False, separators=(',', ':')) + ',')
    lines.append('];')
    lines.append('')
    lines.append('export const TOPICS = ' + json.dumps(topics_out, ensure_ascii=False, separators=(',', ':')) + ';')
    lines.append('')
    lines.append('export const STATS = ' + json.dumps(stats, ensure_ascii=False, separators=(',', ':')) + ';')
    lines.append('')

    out = os.path.join(ROOT, 'src', 'data-words.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print('词条', stats['total'], '（单词', stats['words'], '/ 短语', stats['phrases'], '）')
    print('分级 高频', stats['b1'], '/ 中频', stats['b2'], '/ 拓展', stats['b3'])
    print('话题覆盖', sum(t['count'] for t in topics_out), '条归属')
    empty = [t for t in topics_out if t['count'] == 0]
    if empty:
        print('⚠ 空话题：', [t['id'] for t in empty])
    # 未归类词数
    un = sum(1 for e in entries if not e['tp'])
    print('未进话题', un, '条（功能词与抽象词，仍在全量词表与背单词中）')


if __name__ == '__main__':
    build()
