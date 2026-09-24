// Original beginner course content. Dictionary definitions are attributed separately.
const topicRows = [
 ['第一句话','💧','I:我|want:想要|water:水|please:请|thanks:谢谢','I want water, please.','我想要水，谢谢。'],
 ['认识你我','☺','you:你；你们|he:他|she:她|we:我们|they:他们；她们；它们','We like you.','我们喜欢你。'],
 ['打个招呼','☀','hello:你好|goodbye:再见|yes:是；是的|no:不；不是|sorry:对不起','Hello! I am sorry.','你好！对不起。'],
 ['介绍自己','✦','name:名字|am:是（与 I 连用）|are:是（与 you、we、they 连用）|is:是（与 he、she、it 连用）|my:我的','My name is Sam.','我的名字是 Sam。'],
 ['喝点什么','☕','milk:牛奶|tea:茶|coffee:咖啡|juice:果汁|drink:喝；饮料','I drink milk.','我喝牛奶。'],
 ['吃点什么','♧','eat:吃|rice:米饭|bread:面包|egg:鸡蛋|food:食物','I want bread, please.','我想要面包，谢谢。'],
 ['新鲜水果','◒','apple:苹果|banana:香蕉|orange:橙子|fruit:水果|grape:葡萄','I like apples.','我喜欢苹果。'],
 ['一家人','♡','mother:母亲|father:父亲|sister:姐妹|brother:兄弟|family:家庭；家人','This is my family.','这是我的家人。'],
 ['身边的人','♙','friend:朋友|teacher:老师|student:学生|child:孩子|person:人','She is my friend.','她是我的朋友。'],
 ['从一数到五','⑤','one:一|two:二|three:三|four:四|five:五','I have two apples.','我有两个苹果。'],
 ['从六数到十','⑩','six:六|seven:七|eight:八|nine:九|ten:十','I have six books.','我有六本书。'],
 ['看看颜色','◐','red:红色的|blue:蓝色的|green:绿色的|black:黑色的|white:白色的','My bag is blue.','我的包是蓝色的。'],
 ['随身物品','▤','book:书|pen:笔|bag:包|phone:电话；手机|key:钥匙','This is my book.','这是我的书。'],
 ['在家里','⌂','home:家|room:房间|door:门|window:窗户|bed:床','I am at home.','我在家。'],
 ['每天的动作','↗','go:去|come:来|get:得到；拿到|make:制作；使|use:使用','I go home.','我回家。'],
 ['学习与工作','✎','read:阅读|write:写|learn:学习|work:工作|study:学习；研究','I learn English.','我学习英语。'],
 ['表达需要','♡','like:喜欢|need:需要|have:有|help:帮助|know:知道','I need help.','我需要帮助。'],
 ['今天的感觉','☻','happy:高兴的|sad:难过的|tired:疲倦的|hungry:饥饿的|thirsty:口渴的','I am hungry.','我饿了。'],
 ['大小与好坏','↔','big:大的|small:小的|good:好的|bad:坏的|new:新的','This is a new book.','这是一本新书。'],
 ['说说时间','◷','today:今天|tomorrow:明天|yesterday:昨天|morning:早晨|night:夜晚','I work in the morning.','我在早上工作。'],
 ['出门走走','➜','shop:商店|school:学校|park:公园|street:街道|station:车站','I go to school.','我去学校。'],
 ['交通工具','▱','bus:公共汽车|train:火车|car:汽车|bike:自行车|taxi:出租车','I need a taxi.','我需要一辆出租车。'],
 ['提出问题','?','what:什么|where:哪里|when:什么时候|who:谁|how:怎样；如何','Where is the station?','车站在哪里？'],
 ['天气怎么样','☂','sun:太阳|rain:雨；下雨|hot:热的|cold:冷的|weather:天气','It is cold today.','今天很冷。'],
 ['身体与健康','♡','head:头|hand:手|eye:眼睛|doctor:医生|feel:感觉','I feel tired.','我感觉很累。'],
 ['购物付款','▣','buy:购买|money:钱|price:价格|cheap:便宜的|expensive:昂贵的','This bag is expensive.','这个包很贵。'],
 ['方位与位置','⌁','here:这里|there:那里|left:左边|right:右边|near:在……附近','The shop is near here.','商店就在这附近。'],
 ['爱好和休息','♪','music:音乐|movie:电影|play:玩；演奏|walk:走路|sleep:睡觉','I like music.','我喜欢音乐。'],
 ['让句子连起来','+','and:和；并且|but:但是|or:或者|because:因为|with:和……一起','I like tea and coffee.','我喜欢茶和咖啡。'],
 ['沟通小帮手','“”','speak:说；讲|listen:听|understand:理解|slowly:慢慢地|again:再一次','Please speak slowly.','请说慢一点。'],
];
const starterPhonetics = {I:'aɪ',want:'wɒnt',water:'ˈwɔːtə',please:'pliːz',thanks:'θæŋks',am:'æm',are:'ɑː',is:'ɪz'};
export const topics = topicRows.map(([title, icon, words, sentence, translation], index) => ({id:`topic-${index+1}`,title,icon,sentence,translation,words:words.split('|').map(pair=>{const [word,meaning]=pair.split(':');return {word,meaning,topic:title,phonetic:starterPhonetics[word]||''};})}));

const grammarRows = [
 ['认识英语句子','先说“谁”，再说“做什么”。I want water. 中，I 是“我”，want 是“想要”，water 是“水”。','I want water.','我想要水。',[
  ['我想要水。',['I want water.','Water I want.','Want water I.'],'I want water.','普通陈述句可以先说主语 I，再说动作 want。'],
  ['I ___ milk.（我想要牛奶。）',['want','water','I'],'want','want 表示想要，放在 I 后面。']]],
 ['am / is / are','表示“是”或描述状态时，I 搭配 am；he、she、it 搭配 is；you、we、they 搭配 are。','She is my friend.','她是我的朋友。',[
  ['I ___ happy.',['is','am','are'],'am','I 要搭配 am。'],['They ___ students.',['am','is','are'],'are','They 要搭配 are。'],['He ___ tired.',['are','is','am'],'is','He 要搭配 is。']]],
 ['a / an 和复数','一个可数物品常用 a 或 an。后面的词以元音音素开头时用 an，如 an apple。多个物品常在名词后加 s，也有不规则变化。','I have an apple.','我有一个苹果。',[
  ['___ apple（一个苹果）',['a','an','two'],'an','apple 以元音音素开头，用 an。'],['two ___（两本书）',['book','books','a book'],'books','two 表示两个，book 用复数 books。']]],
 ['一般现在时','表达习惯或通常的情况。I / you / we / they 后用动词原形；he / she / it 后的动词通常加 s 或 es。','She drinks milk every day.','她每天喝牛奶。',[
  ['She ___ tea every day.',['drink','drinks','drinking'],'drinks','She 是第三人称单数，drink 变为 drinks。'],['We ___ English.',['learns','learning','learn'],'learn','We 后用动词原形 learn。']]],
 ['说“不”','am / is / are 后加 not。一般现在时的普通动词用 do not 或 does not，后面的动词保持原形。','I do not like coffee.','我不喜欢咖啡。',[
  ['She ___ like coffee.',['do not','does not','is not'],'does not','She 搭配 does not，后面用 like 原形。'],['I ___ tired.（我不累。）',['am not','do not','does not'],'am not','描述状态 tired，使用 am not。']]],
 ['问一个问题','含 am / is / are 时可把它移到主语前。普通动词的一般现在时，用 Do 或 Does 开头。','Do you like tea?','你喜欢茶吗？',[
  ['___ you like milk?',['Are','Do','Is'],'Do','like 是普通动词，用 Do you like…?'],['___ she a teacher?',['Does','Do','Is'],'Is','问她是否是老师，用 Is she…?']]],
 ['现在进行时','表达此刻正在做什么：am / is / are + 动词 ing 形式。','I am reading a book.','我正在读一本书。',[
  ['She is ___ water now.',['drink','drinks','drinking'],'drinking','is 后加 drinking，表示正在喝。'],['We ___ studying now.',['are','is','am'],'are','We 搭配 are，组成 are studying。']]],
 ['一般过去时','表达已经发生的事情。规则动词常加 ed，也有不规则变化，如 go → went、drink → drank。be 的过去式是 was / were。','I went to the park yesterday.','我昨天去了公园。',[
  ['I ___ to school yesterday.',['go','went','going'],'went','yesterday 表示昨天，go 的过去式是 went。'],['They ___ happy yesterday.',['was','are','were'],'were','过去的状态用 were，主语是 They。']]],
 ['过去时的否定与提问','普通动词用 did not 表示过去的否定，用 Did 提问。出现 did 后，主要动词恢复原形。','Did you drink water?','你喝水了吗？',[
  ['Did you ___ to school?',['went','go','goes'],'go','Did 后使用动词原形 go。'],['I did not ___ coffee.',['drank','drinks','drink'],'drink','did not 后使用 drink 原形。']]],
 ['表达将来','will + 动词原形可表达将来的事情；be going to + 动词原形常用于计划。','I will study tomorrow.','我明天会学习。',[
  ['I will ___ tomorrow.',['work','worked','working'],'work','will 后用动词原形。'],['She ___ going to read.',['am','are','is'],'is','She 搭配 is，组成 is going to。']]],
 ['can 与礼貌请求','can + 动词原形表达能力或请求。Could you…? 可以更委婉地请别人帮忙。','Could you help me, please?','请问你能帮我吗？',[
  ['I can ___ English.',['speaks','speak','speaking'],'speak','can 后用动词原形 speak。'],['礼貌地请人帮忙：',['Could you help me, please?','You help!','I help you.'],'Could you help me, please?','Could you…please? 是常见的礼貌请求。']]],
 ['现在完成时入门','have / has + 过去分词，表达与现在有关的经历或结果。I have finished. 表示我已经完成了。明确的过去时间通常配一般过去时。','I have finished my work.','我已经完成了我的工作。',[
  ['She ___ finished her work.',['have','has','is'],'has','She 搭配 has。'],['I have ___ this book.',['read','reading','reads'],'read','read 的过去分词仍写作 read，读音与原形不同。本课不对该多音词单独示范。']]],
];
export const grammar = grammarRows.map(([title,explanation,sentence,translation,questions],index)=>({id:`grammar-${index+1}`,title,explanation,sentence,translation,questions:questions.map(([prompt,options,answer,explanation])=>({prompt,options,answer,explanation}))}));

const sceneRows = [
 ['初次见面','介绍自己，认识一个新朋友。',[
  ['Hello! What is your name?','你好！你叫什么名字？'],['My name is Sam.','我的名字是 Sam。'],['Nice to meet you.','很高兴认识你。'],['Nice to meet you, too.','我也很高兴认识你。']]],
 ['点一杯饮料','表达需要，再礼貌地说谢谢。',[
  ['What would you like?','你想要点什么？'],['I would like water, please.','我想要水，谢谢。'],['Here you are.','给你。'],['Thank you.','谢谢你。']]],
 ['餐厅点餐','练习点食物与结账。',[
  ['Can I see the menu, please?','请给我看看菜单好吗？'],['I would like rice and chicken.','我想要米饭和鸡肉。'],['Anything to drink?','喝点什么吗？'],['Water, please.','请给我水。'],['Could I have the bill, please?','请给我账单好吗？']]],
 ['问路','听不懂时，可以请对方慢一点。',[
  ['Excuse me. Where is the station?','打扰一下，车站在哪里？'],['Go straight and turn left.','直走，然后左转。'],['Could you say that again, please?','请再说一遍好吗？'],['Please speak slowly.','请说慢一点。']]],
 ['买东西','问价格，表达自己的选择。',[
  ['How much is this bag?','这个包多少钱？'],['It is twenty dollars.','二十美元。'],['Do you have a blue one?','你们有蓝色的吗？'],['I will take it.','我要这个。']]],
 ['住酒店','办理入住，询问基本信息。',[
  ['Hello. I have a reservation.','你好，我有预订。'],['What is your name?','你叫什么名字？'],['My name is Sam.','我的名字是 Sam。'],['What time is breakfast?','早餐是几点？']]],
 ['聊聊日常','说出你的喜好和计划。',[
  ['What do you like to do?','你喜欢做什么？'],['I like reading and music.','我喜欢阅读和音乐。'],['What are you doing tomorrow?','你明天打算做什么？'],['I am going to the park.','我打算去公园。']]],
 ['寻求帮助','练习在不舒服或不理解时表达需求。',[
  ['Excuse me. I need help.','打扰一下，我需要帮助。'],['I do not feel well.','我感觉不舒服。'],['Where is the nearest hospital?','最近的医院在哪里？'],['I do not understand.','我不明白。'],['Could you help me, please?','请问你能帮我吗？']]],
];
sceneRows.push(
 ['预约时间','约定见面时间。', [['When can we meet?','我们什么时候可以见面？'],['We can meet on Friday.','我们可以星期五见面。'],['Is ten in the morning OK?','上午十点可以吗？'],['Yes, that works for me.','可以，我这个时间方便。']]],
 ['买车票','确认目的地和班次。', [['Where would you like to go?','你想去哪里？'],['I would like to go to London.','我想去伦敦。'],['Would you like a morning train?','你想乘上午的火车吗？'],['Yes, one ticket, please.','是的，请给我一张票。']]],
 ['电话留言','接电话并留下口信。', [['Hello. Can I speak to Sam?','你好，我可以和 Sam 通话吗？'],['Sam is out. Can I take a message?','Sam 不在。我可以帮你留言吗？'],['Please ask Sam to call me.','请让 Sam 给我回电话。'],['Of course. What is your number?','当然。你的电话号码是多少？']]],
 ['谈论周末','描述过去的活动。', [['What did you do last weekend?','你上周末做了什么？'],['I visited my friend.','我拜访了朋友。'],['Did you have a good time?','你玩得开心吗？'],['Yes, we cooked dinner together.','开心，我们一起做了晚饭。']]],
 ['邀请朋友','发出邀请并回应。', [['Would you like to have lunch with me?','你愿意和我一起吃午饭吗？'],['Yes, I would love to.','愿意，我很乐意。'],['Shall we meet at twelve?','我们十二点见好吗？'],['Great. See you then.','好，到时候见。']]],
 ['说明问题','说明买到的东西出了问题。', [['How can I help you?','有什么可以帮你？'],['This phone does not work.','这部手机无法使用。'],['When did you buy it?','你什么时候买的？'],['I bought it yesterday.','我昨天买的。']]],
 ['讨论学习','介绍自己的学习方法。', [['How do you study English?','你如何学习英语？'],['I read a little every day.','我每天读一点。'],['What do you do with new words?','你如何处理生词？'],['I write them down and review them.','我记下它们，然后复习。']]],
 ['表达看法','说出偏好与简单理由。', [['Do you like the city or the country?','你喜欢城市还是乡村？'],['I like the country.','我喜欢乡村。'],['Why do you like it?','你为什么喜欢那里？'],['Because it is quiet and green.','因为那里安静，绿意盎然。']]]
);
export const scenes = sceneRows.map(([title,description,lines],index)=>({id:`scene-${index+1}`,title,description,roleplay:index>=8,lines:lines.map(([en,zh])=>({en,zh}))}));

// Original short readings; levels describe the local learning path, not certified CEFR bands.
export const readings = [
 {id:'read-1',level:'入门',title:'一杯水',text:'I am Sam. I have a cup. I want water. My friend has water. I say please. My friend gives me water. I say thank you.',translation:'我是 Sam。我有一个杯子。我想喝水。我的朋友有水。我说“请”。朋友给了我水。我说“谢谢”。',notes:{sam:'Sam，人名',has:'有（have 的第三人称单数形式）',gives:'给（give 的第三人称单数形式）'},questions:[{prompt:'Sam 想要什么？',options:['水','茶','牛奶'],answer:0,evidence:'I want water.'},{prompt:'谁给了 Sam 水？',options:['老师','朋友','医生'],answer:1,evidence:'My friend gives me water.'}]},
 {id:'read-2',level:'入门',title:'我的书包',text:'My bag is blue. I have a book and a pen in my bag. The book is new. The pen is black. I take my bag to school every day.',translation:'我的书包是蓝色的。书包里有一本书和一支笔。书是新的。笔是黑色的。我每天背着书包去学校。',questions:[{prompt:'书包是什么颜色？',options:['黑色','蓝色','红色'],answer:1,evidence:'My bag is blue.'},{prompt:'哪一样东西是新的？',options:['笔','书包','书'],answer:2,evidence:'The book is new.'}]},
 {id:'read-3',level:'基础',title:'周六的早餐',text:'It is Saturday morning. Lily is at home with her brother. They make breakfast together. Lily wants bread and milk. Her brother wants an egg and tea. After breakfast, they walk to the park.',translation:'星期六早上，Lily 和弟弟在家。他们一起做早餐。Lily 想吃面包、喝牛奶。弟弟想吃鸡蛋、喝茶。早餐后，他们步行去公园。',notes:{lily:'Lily，人名',they:'他们；这里指 Lily 和弟弟',wants:'想要（want 的第三人称单数形式）'},questions:[{prompt:'Lily 想喝什么？',options:['茶','水','牛奶'],answer:2,evidence:'Lily wants bread and milk.'},{prompt:'他们什么时候去公园？',options:['早餐后','早餐前','晚上'],answer:0,evidence:'After breakfast, they walk to the park.'}]},
 {id:'read-4',level:'基础',title:'去图书馆',text:'Ben likes reading, but he has no new books at home. On Monday, he goes to the library after school. He finds a book about animals. He reads for an hour. Then he takes the book home. He plans to return it next week.',translation:'Ben 喜欢阅读，但家里没有新书。周一放学后，他去了图书馆。他找到一本关于动物的书，读了一个小时，然后把书借回家。他计划下周归还。',notes:{ben:'Ben，人名',likes:'喜欢（like 的第三人称单数形式）',books:'书（book 的复数）',goes:'去（go 的第三人称单数形式）',finds:'找到（find 的第三人称单数形式）',animals:'动物（animal 的复数）',reads:'阅读（read 的第三人称单数形式）',takes:'拿；带走（take 的第三人称单数形式）',plans:'计划（plan 的第三人称单数形式）',has:'有（have 的第三人称单数形式）'},questions:[{prompt:'Ben 为什么去图书馆？',options:['找朋友','家里没有新书','买动物'],answer:1,evidence:'He has no new books at home.'},{prompt:'Ben 计划何时还书？',options:['今天','明年','下周'],answer:2,evidence:'He plans to return it next week.'}]},
 {id:'read-5',level:'进阶',title:'改变计划',text:'Mia and Tom planned to play tennis on Sunday. When they woke up, it was raining. Tom wanted to stay at home, but Mia had another idea. They could visit the museum. Tom agreed because he wanted to learn about old trains. They took a bus and enjoyed the afternoon together.',translation:'Mia 和 Tom 原计划周日打网球。醒来时，天正在下雨。Tom 想待在家里，但 Mia 有另一个主意：去博物馆。Tom 同意了，因为他想了解老式火车。他们乘公交车前往，一起度过了愉快的下午。',notes:{mia:'Mia，人名',tom:'Tom，人名',planned:'计划（plan 的过去式）',woke:'醒来（wake 的过去式）',raining:'正在下雨',wanted:'想要（want 的过去式）',had:'有（have 的过去式）',agreed:'同意（agree 的过去式）',trains:'火车（train 的复数）',took:'乘坐；拿（take 的过去式）',enjoyed:'享受（enjoy 的过去式）'},questions:[{prompt:'他们为什么改变计划？',options:['下雨了','博物馆关门','没有公交车'],answer:0,evidence:'When they woke up, it was raining.'},{prompt:'Tom 为什么同意去博物馆？',options:['想买网球','想了解老式火车','想见 Mia'],answer:1,evidence:'He wanted to learn about old trains.'}]},
 {id:'read-6',level:'进阶',title:'每天一点点',text:'Anna wanted to learn English, but she often tried to remember too many words at once. A week later, she forgot most of them. Now she studies a few new words each day and reviews older words first. She also reads short stories and uses new words in sentences. After a month, she feels more confident. She still makes mistakes, but she knows what to practise next.',translation:'Anna 想学英语，但经常试图一次记住太多单词。一周后，她忘了大多数。现在她每天学几个新词，先复习旧词。她也读短篇故事，在句子中使用新词。一个月后，她更自信了。她仍会犯错，但知道接下来要练什么。',notes:{anna:'Anna，人名',tried:'尝试（try 的过去式）',forgot:'忘记（forget 的过去式）',studies:'学习（study 的第三人称单数形式）',reviews:'复习（review 的第三人称单数形式）',older:'更早的；较旧的',stories:'故事（story 的复数）',uses:'使用（use 的第三人称单数形式）',sentences:'句子（sentence 的复数）',feels:'感到（feel 的第三人称单数形式）',makes:'做；这里指犯错',mistakes:'错误（mistake 的复数）',knows:'知道（know 的第三人称单数形式）'},questions:[{prompt:'Anna 现在先做什么？',options:['学习很多新词','复习旧词','只看答案'],answer:1,evidence:'She studies a few new words each day and reviews older words first.'},{prompt:'文章描述了什么变化？',options:['她从此不再犯错','她停止学习英语','她调整方法后更自信'],answer:2,evidence:'After a month, she feels more confident. She still makes mistakes.'}]}
];

// Four local study stages. These are curriculum labels, not official exam/CEFR ratings.
export const studyLevels=['入门','基础','中级','高级'];
grammar.forEach((course,index)=>course.level=index<4?'入门':'基础');
scenes.forEach((scene,index)=>scene.level=index<4?'入门':'基础');
readings.forEach(item=>{if(item.level==='进阶')item.level='中级';});
const advancedGrammar=[
 ['中级','被动语态','关注动作的接受者：be + 过去分词。时态体现在 be 上。','The bridge was built in 1990.','这座桥建于 1990 年。',[
 ['The room ___ every day.',['cleans','is cleaned','is cleaning'],'is cleaned','房间接受清扫，用一般现在时被动语态。'],['The letters ___ yesterday.',['were sent','are sending','sent'],'were sent','yesterday 对应过去时，letters 是动作接受者。'],['English ___ in many countries.',['speaks','is spoken','is speaking'],'is spoken','语言被使用，采用 is spoken。']]],
 ['中级','定语从句','who 指人，which 指物；关系词连接名词与修饰它的从句。','The woman who lives next door is a doctor.','住在隔壁的女士是一位医生。',[
 ['The man ___ called you is my teacher.',['which','who','where'],'who','先行词 man 指人，关系词在从句中作主语。'],['This is the book ___ I bought yesterday.',['which','who','where'],'which','book 指物，在从句中作 bought 的宾语。'],['This is the school ___ I studied.',['which','who','where'],'where','从句需要地点状语，相当于 at which。']]],
 ['中级','第一条件句','真实的将来条件：if 从句用一般现在时，主句常用 will。','If it rains, we will stay at home.','如果下雨，我们会待在家。',[
 ['If she ___ early, we will start at nine.',['arrives','will arrive','arrived'],'arrives','条件从句用一般现在时表示将来。'],['If I have time, I ___ you.',['called','will call','calling'],'will call','主句用 will 表示将来的行动。'],['We will miss the bus unless we ___.',['hurried','will hurry','hurry'],'hurry','unless 表示除非，条件从句用一般现在时。']]],
 ['中级','间接引语','转述过去的话时，常调整人称和时态；间接问句使用陈述语序。','She said that she was tired.','她说她累了。',[
 ['He said, "I am busy." → He said that he ___ busy.',['is being','was','be'],'was','过去转述中，am 通常后移为 was。'],['She asked where I ___.',['lived','did live','do live'],'lived','间接问句使用陈述语序。'],['He told me ___ the door.',['closing','close','to close'],'to close','tell somebody to do something。']]],
 ['中级','动名词与不定式','不同动词搭配不同形式：enjoy doing，decide to do；介词后常用动名词。','I enjoy reading, but I decided to go outside.','我喜欢阅读，但决定去外面。',[
 ['She enjoys ___ music.',['listen','listening to','to listen'],'listening to','enjoy 后接动名词，listen 搭配 to。'],['They decided ___ early.',['leaving','leave','to leave'],'to leave','decide 后接 to do。'],['He is interested in ___ English.',['learn','learning','to learn'],'learning','介词 in 后接动名词。']]],
 ['中级','现在完成进行时','have / has been doing 强调从过去持续到现在的活动。','I have been studying for two hours.','我已经连续学习两个小时了。',[
 ['She ___ working here since May.',['has been','was been','have been'],'has been','She 搭配 has been doing。'],['I have been waiting ___ an hour.',['since','for','during'],'for','for 后接持续的时间段。'],['We have been living here ___ 2020.',['for','during','since'],'since','since 后接开始的时间点。']]],
 ['高级','过去虚拟条件','if + had done，主句用 would have done，表示与过去事实不同的假设。','If I had left earlier, I would have caught the train.','如果我早些出发，就赶上火车了。',[
 ['If she had studied harder, she ___ the exam.',['would pass','would have passed','will pass'],'would have passed','过去反事实结果用 would have done。'],['If we ___ the map, we would not have got lost.',['had checked','check','would check'],'had checked','过去反事实条件用 had done。'],['Had I known, I ___ you.',['will help','helped','would have helped'],'would have helped','Had I known 等于 If I had known。']]],
 ['高级','混合条件句','过去的条件可以影响现在：if + had done，主句用 would + 动词原形。','If I had accepted that job, I would live abroad now.','如果当时接受那份工作，我现在就住在国外了。',[
 ['If she had taken the medicine, she ___ better now.',['would feel','would have felt','will feel'],'would feel','now 指现在的假设结果。'],['If I were more careful, I ___ that mistake yesterday.',['will not make','would not have made','do not make'],'would not have made','现在的一贯特点对应过去的假设结果。'],['If he had saved more, he ___ a house now.',['could buy','could have bought','buys'],'could buy','过去积蓄影响现在购房能力。']]],
 ['高级','否定副词倒装','否定或限制性副词置于句首时，主句常用助动词在主语前的倒装结构。','Never have I seen such a beautiful view.','我从未见过如此美丽的景色。',[
 ['Rarely ___ such a clear explanation.',['I have heard','have I heard','I heard have'],'have I heard','Rarely 置于句首触发部分倒装。'],['Not until noon ___ arrive.',['did he','he did','he'],'did he','Not until 置于句首，主句部分倒装。'],['No sooner had we arrived ___ it started raining.',['when','than','then'],'than','no sooner ... than 是固定搭配。']]],
 ['高级','推测过去的情态动词','must have done 表示对过去的强烈推测；might have done 表示可能；cannot have done 表示不可能。','She must have forgotten our meeting.','她一定忘了我们的会议。',[
 ['The lights are off. They ___ gone home, but I am not sure.',['might have','must','should'],'might have','不确定的过去推测用 might have done。'],['He was abroad, so he ___ attended the local meeting.',['must have','cannot have','should have'],'cannot have','根据过去事实排除可能性。'],['You ___ told me earlier; then I could have helped.',['should have','must','can'],'should have','should have done 表示过去本应做而未做。']]],
 ['高级','让步与论证衔接','although 后接从句；despite 后接名词或动名词；however 通常连接两个独立分句的意思。','Although the plan is expensive, it may save money later.','虽然计划成本高，但以后可能节省资金。',[
 ['___ the heavy rain, the event continued.',['Although','Despite','However'],'Despite','后面是名词短语，使用 despite。'],['The evidence is limited. ___, the result is worth investigating.',['However','Despite','Although'],'However','However 作连接副词，后接完整句子。'],['___ the sample was small, the study raised useful questions.',['Despite','Although','Nevertheless'],'Although','Although 引导含主谓结构的从句。']]],
 ['高级','分词结构与主语一致','分词短语的逻辑主语通常应与主句主语一致。Having done 强调动作先于主句发生。','Having finished the report, she sent it to her manager.','完成报告后，她把它发给了经理。',[
 ['___ the instructions carefully, he began the experiment.',['Having read','Having been read','Has read'],'Having read','he 主动阅读，动作发生在实验之前。'],['___ in simple language, the guide is easy to follow.',['Writing','Written','Having writing'],'Written','guide 是被编写的，使用过去分词。'],['Which sentence has a clear logical subject?',['Walking home, the rain started.','Walking home, I saw a fox.','Walking home, my bag was heavy.'],'Walking home, I saw a fox.','走路的人与主句主语 I 一致。']]]
];
advancedGrammar.forEach(([level,title,explanation,sentence,translation,rows])=>grammar.push({id:`grammar-${grammar.length+1}`,level,title,explanation,sentence,translation,questions:rows.map(([prompt,options,answer,explanation])=>({prompt,options,answer,explanation}))}));

const extraScenes=[
 ['中级','工作面试','用事例说明经验和能力。',[['Could you tell me about your experience?','能谈谈你的经验吗？'],['I worked in a small team and helped organise weekly projects.','我曾在小团队工作，协助组织每周的项目。'],['How did you deal with a difficult deadline?','你如何应对紧迫的截止日期？'],['I divided the work into smaller tasks and agreed on priorities with my team.','我拆分任务，并与团队商定优先次序。']]],
 ['中级','协调计划','表达限制并提出替代方案。',[['Can we finish the presentation by Thursday?','我们能在周四前完成演示吗？'],['Thursday may be difficult because we still need the final figures.','周四可能有困难，因为我们还需要最终数据。'],['What would you suggest instead?','你建议怎么办？'],['We could prepare the structure now and add the figures on Friday.','我们可以先准备结构，周五再补入数据。']]],
 ['中级','礼貌投诉','描述问题并请求合理解决。',[['What seems to be the problem with your order?','你的订单出了什么问题？'],['I ordered a small jacket, but a large one arrived.','我订了小号夹克，但收到的是大号。'],['Would you prefer a replacement or a refund?','你希望换货还是退款？'],['A replacement would be fine, provided it arrives before Saturday.','如果能在周六之前送到，换货就可以。']]],
 ['中级','比较选择','比较方案并给出理由。',[['Would you rather study online or in a classroom?','你更愿意在线学习还是在教室学习？'],['Online study is more flexible, but I find classroom discussions helpful.','在线学习更灵活，但课堂讨论对我有帮助。'],['How would you combine the two?','你会怎样结合两者？'],['I would learn the basics online and practise with others once a week.','我会在线学习基础内容，每周与别人练习一次。']]],
 ['高级','分析研究结论','区分关联、因果与证据局限。',[['Does this study prove that the policy caused the improvement?','这项研究能证明政策导致改善吗？'],['It shows an association, but other changes may have influenced the outcome.','它显示了关联，但其他变化也可能影响结果。'],['What additional evidence would strengthen the argument?','什么额外证据能加强论证？'],['A suitable comparison group and data from several years would make the conclusion more convincing.','合适的对照组和多年数据会让结论更有说服力。']]],
 ['高级','协商分歧','承认对方顾虑并提出折中。',[['I am concerned that the proposal places too much pressure on the staff.','我担心该提议给员工带来太大压力。'],['That is a reasonable concern, although delaying the project also carries risks.','这个顾虑合理，不过推迟项目也有风险。'],['Is there a compromise that addresses both issues?','有没有兼顾两方面的折中方案？'],['We could run a limited trial, review the workload, and expand only if the results justify it.','我们可以先做有限试行，评估工作量，再根据结果决定是否扩大。']]],
 ['高级','公共政策讨论','权衡效率、公平和执行成本。',[['Should public transport be free for everyone?','公共交通应该对所有人免费吗？'],['Free access could improve mobility, but the funding would have to come from somewhere.','免费乘坐可能改善出行，但资金仍需要来源。'],['Would targeted support be a better alternative?','有针对性的补助会更好吗？'],['Possibly, though a targeted scheme may exclude people who struggle to meet the administrative requirements.','有可能，但定向方案也可能遗漏难以满足行政要求的人。']]],
 ['高级','澄清复杂观点','准确复述并说明观点适用范围。',[['Are you suggesting that technology always improves education?','你是说技术总能改善教育吗？'],['Not necessarily. My point is that it can help when it serves a clear learning objective.','不一定。我的观点是，技术服务于明确学习目标时可能有帮助。'],['What would count as evidence of success?','什么能算作成功的证据？'],['I would look for sustained learning gains rather than relying solely on participation figures.','我会看持续的学习进步，而不只依赖参与人数。']]]
];
extraScenes.forEach(([level,title,description,lines])=>scenes.push({id:`scene-${scenes.length+1}`,level,title,description,roleplay:true,lines:lines.map(([en,zh])=>({en,zh}))}));
const extraReadings=[
 ['入门','家里的猫','I have a cat. My cat is small and white. It likes milk. In the morning, it sits by the door. At night, it sleeps on my bed. I like my cat.','我有一只小白猫。它喜欢牛奶。早上它坐在门边，晚上睡在我的床上。我喜欢它。',[
 ['猫是什么颜色？',['白色','黑色','蓝色'],0,'My cat is small and white.'],['猫晚上睡在哪里？',['门边','床上','桌上'],1,'At night, it sleeps on my bed.']]],
 ['入门','买苹果','I go to a shop with my mother. We want three apples. The apples are red. My mother buys the apples. I carry the bag. Then we go home.','我和妈妈去商店。我们想买三个苹果。苹果是红色的。妈妈买了苹果，我提袋子，然后我们回家。',[
 ['他们想买几个苹果？',['两个','三个','四个'],1,'We want three apples.'],['谁提袋子？',['妈妈','店员','文中的我'],2,'I carry the bag.']]],
 ['基础','新同学','A new student joins our class today. Her name is May. She comes from a small town. At lunch, she sits alone because she does not know anyone yet. I ask her to sit with my friends. We talk about music and find that we like the same singer.','今天班里来了一位叫 May 的新同学，她来自一个小镇。午餐时她因为还不认识别人而独自坐着。我邀请她和朋友们一起坐。我们聊音乐，发现喜欢同一个歌手。',[
 ['May 为什么独自坐着？',['她还不认识别人','她不喜欢音乐','她想回家'],0,'She sits alone because she does not know anyone yet.'],['他们发现了什么共同点？',['来自同一城镇','喜欢同一歌手','读同一本书'],1,'We like the same singer.']]],
 ['基础','找钥匙','On Tuesday morning, Jack cannot find his keys. He looks on the kitchen table and under the sofa, but they are not there. His sister asks what he wore yesterday. Jack checks his old coat and finds the keys in a pocket. He thanks his sister and leaves for work.','周二早上 Jack 找不到钥匙，餐桌上和沙发下都没有。姐姐问他昨天穿了什么。他检查旧外套，在口袋里找到了钥匙。他道谢后去上班。',[
 ['钥匙在哪里？',['沙发下','餐桌上','旧外套口袋里'],2,'Jack checks his old coat and finds the keys in a pocket.'],['姐姐如何帮助他？',['买新钥匙','让他回想昨天穿的衣服','送他上班'],1,'His sister asks what he wore yesterday.']]],
 ['中级','修理还是更换','When the school printer stopped working, most students expected the office to buy a new one. However, the caretaker suggested checking it first. A small plastic part had broken, and a replacement cost very little. After the repair, the printer worked normally. The school then started a repair club. Students learned that replacing an entire product is not always necessary, although repairs can be difficult when spare parts are unavailable.','学校打印机坏了，多数学生以为会买新的。管理员建议先检查，发现只是一个便宜的塑料零件坏了。修好后，学校成立了维修社团。学生认识到并非总要更换整个产品，但没有配件时维修也会困难。',[
 ['文章的主要观点是什么？',['所有东西都值得修','应先评估维修可能性','新产品总是更差'],1,'Replacing an entire product is not always necessary.'],['作者为什么提到配件？',['说明维修的限制','证明维修更贵','解释社团关门'],0,'Repairs can be difficult when spare parts are unavailable.'],['成立社团的直接背景是什么？',['一次成功的维修','学生购买新机器','没有管理员'],0,'After the repair, the printer worked normally. The school then started a repair club.']]],
 ['中级','远程工作的试验','A company allowed its staff to work from home two days a week for three months. Some employees said they could concentrate better without office noise. Others missed informal conversations and found it harder to ask quick questions. At the end of the trial, managers kept the arrangement but introduced a shared office day for each team. Rather than treating remote work as either a complete success or a failure, they adjusted the policy to address specific problems.','一家公司试行三个月每周两天居家办公。有人更专注，有人怀念非正式交流、觉得提问不便。最后公司保留安排，同时规定团队共同到办公室的一天，通过调整解决具体问题，而非简单判定成功或失败。',[
 ['员工的反应如何？',['全部支持','全部反对','有不同意见'],2,'Others missed informal conversations and found it harder to ask quick questions.'],['共同办公日主要解决什么？',['交流不足','电脑价格','交通拥堵'],0,'Others missed informal conversations.'],['管理者采取了什么态度？',['根据反馈调整','完全取消试验','忽略所有问题'],0,'They adjusted the policy to address specific problems.']]],
 ['高级','绿色标签的边界','A supermarket introduced a green label for products with lower packaging emissions. Sales of labelled products rose, and the company described the scheme as a success. Yet the label measured only packaging, not the environmental cost of production or transport. A locally packaged item could still contain ingredients shipped across the world. Critics did not argue that packaging was irrelevant; they questioned whether a narrow indicator was being presented as a complete assessment. The scheme may encourage useful improvements, but consumers need to understand what the label includes and what it leaves out. Transparency about those boundaries is essential if the label is to support informed choices.','超市给包装排放较低的商品贴绿色标签，销量上升后宣称成功。但标签没有衡量生产和运输成本。批评者并非说包装无关紧要，而是质疑狭窄指标是否被当作全面评价。明确说明标签涵盖和遗漏的范围，才有助于知情选择。',[
 ['批评者质疑的核心是什么？',['包装完全不重要','局部指标被当作全面评价','绿色商品一定更贵'],1,'They questioned whether a narrow indicator was being presented as a complete assessment.'],['作者对标签的态度是？',['有条件地认可','完全否定','无保留赞同'],0,'The scheme may encourage useful improvements, but consumers need to understand what the label includes and what it leaves out.'],['销量增加能直接证明什么？',['整个供应链排放降低','消费者买了更多带标签的商品','运输成本减少'],1,'Sales of labelled products rose.']]],
 ['高级','数字档案与沉默','Digitising historical records makes them easier to search, but it does not automatically make the surviving record representative. Institutions choose which collections to preserve, and earlier generations made their own decisions about what was worth recording. A researcher who relies only on searchable documents may therefore overlook people whose experiences were rarely written down. This does not make digital archives unreliable. It means that convenience should not be confused with completeness. Comparing official records with letters, oral histories and material objects can reveal gaps or competing accounts. The value of a search result depends partly on understanding the process that allowed that document, rather than another, to survive.','历史记录数字化便于检索，却不自动代表记录全面。保存和记录本身都经过选择，少有文字记录的群体可能被忽略。数字档案并非因此不可靠，但便利不等于完整。结合信件、口述史和实物，有助于发现空白和不同叙述。',[
 ['作者区分了哪两个概念？',['便利与完整','速度与价格','年代与语言'],0,'Convenience should not be confused with completeness.'],['为什么加入口述史？',['替代所有书面记录','补充可能被忽略的经历','保证所有说法一致'],1,'Comparing official records with letters, oral histories and material objects can reveal gaps or competing accounts.'],['作者是否否定数字档案？',['是，全部不可靠','否，强调理解其局限','是，只能研究实物'],1,'This does not make digital archives unreliable.']]],
 ['高级','试点政策的证据','After a city opened a new cycle lane, nearby shops reported higher sales. Supporters claimed that the lane had revived the area. However, the same period also saw a new railway station open and several empty buildings become offices. Without a suitable comparison, it is difficult to separate these influences. This uncertainty is not proof that the cycle lane had no effect. It is a reason to be cautious about assigning the entire improvement to a single intervention. Future evaluations could compare similar streets over time and examine who benefits, not merely whether total spending increases. A policy may be worthwhile even when its effects are more modest or uneven than its strongest supporters suggest.','自行车道开放后，附近商店销售增长，支持者归功于车道。但同期还有新车站和新办公室。没有合适比较，很难分离因素。这不证明车道无效，而是提醒别把所有改善归于一项措施。评估还应考察谁受益，而不只看总消费。',[
 ['销售增长为何不足以证明单一因果？',['还有同时发生的变化','商店从不公布收入','自行车道不可能有用'],0,'The same period also saw a new railway station open and several empty buildings become offices.'],['作者建议怎样改进评估？',['只采访支持者','比较类似街道并看受益群体','停止收集数据'],1,'Future evaluations could compare similar streets over time and examine who benefits.'],['“不确定”在文中意味着什么？',['政策一定失败','应谨慎归因','所有因素同等重要'],1,'It is a reason to be cautious about assigning the entire improvement to a single intervention.']]],
 ['高级','预测工具与人的判断','A hospital tested a prediction tool intended to identify patients at risk of missing appointments. Its overall accuracy appeared impressive, yet errors were concentrated among people whose transport and working hours were unpredictable. If staff used the score to restrict access, those patients could face further disadvantage. Alternatively, the same signal could prompt an offer of flexible appointments or transport assistance. The consequences therefore depended not only on the model but also on the decisions built around it. Evaluating such a system requires more than a single performance figure: it requires attention to how errors are distributed, how staff interpret the output, and whether affected people can challenge a decision.','医院试用预测失约风险的工具。整体准确率不错，但错误集中在交通和工时不稳定的人群。若据此限制就诊，会加重不利；若提供灵活预约和交通帮助，则用途不同。评估应看错误分布、员工如何解读结果，以及当事人能否申诉。',[
 ['同一个预测结果为何可能产生不同后果？',['取决于后续如何使用','准确率总在变化','患者都拒绝预约'],0,'The consequences therefore depended not only on the model but also on the decisions built around it.'],['作者认为总体准确率有什么不足？',['无法展示错误在人群中的分布','没有任何参考价值','能解释全部后果'],0,'Errors were concentrated among people whose transport and working hours were unpredictable.'],['哪种做法最符合文中建议？',['只公布总体分数','隐藏工具用途','检查群体差异并允许申诉'],2,'It requires attention to how errors are distributed ... and whether affected people can challenge a decision.']]]
];
extraReadings.forEach(([level,title,text,translation,questions])=>readings.push({id:`read-${readings.length+1}`,level,title,text,translation,questions:questions.map(([prompt,options,answer,evidence])=>({prompt,options,answer,evidence}))}));
export const listeningLessons=readings.map(item=>({id:`listen-${item.id.slice(5)}`,level:item.level,title:item.title,text:item.text,translation:item.translation,questions:item.questions}));

readings.find(item=>item.title==='新同学').notes={may:'May，人名；此处不是情态动词'};
readings.find(item=>item.title==='找钥匙').notes={jack:'Jack，人名'};

// Original practice using common reading skills, not reproduced official exam questions.
const readingPracticeExpansion=[
 ['入门','图书馆的小通知','通知与规则','The school library opens at nine in the morning. It closes at four in the afternoon. You can read books there. You can take two books home. Please bring them back in one week. Food and drinks are not allowed.','学校图书馆上午九点开门，下午四点关门。你可以在那里看书，也可以借两本回家，请在一周内归还。馆内禁止饮食。',[
 ['细节定位','图书馆几点关门？',['下午四点','上午九点','下午九点'],0,'It closes at four in the afternoon.','问题问关门时间，不能把 opens 后的开门时间当答案。'],
 ['细节定位','一次可以借几本书？',['一本','两本','七本'],1,'You can take two books home.','two 修饰 books；one week 指归还期限。'],
 ['规则理解','下面哪项不符合通知？',['在馆内读书','把书借回家','在馆内喝果汁'],2,'Food and drinks are not allowed.','drinks 包括果汁；not allowed 表示不允许。']]],
 ['入门','给朋友的一封邮件','邮件与目的','Hi, I have a new bike. It is green. I want to ride to the park on Saturday. Can you come with me? We can meet at my house at ten. Please bring some water. See you soon!','你好，我有一辆绿色的新自行车。我想周六骑车去公园。你能一起去吗？我们十点在我家见，请带一些水。到时见！',[
 ['写作目的','这封邮件主要想做什么？',['出售自行车','邀请朋友一起出行','介绍学校'],1,'Can you come with me?','重点是邀请；介绍新车只是出行背景。'],
 ['细节定位','在哪里见面？',['公园里','学校门口','写信人的家'],2,'We can meet at my house at ten.','my house 是见面地点，park 是目的地。'],
 ['细节定位','朋友需要带什么？',['水','一本书','绿色外套'],0,'Please bring some water.','bring 表示带来，后面的 water 是所需物品。']]],
 ['入门','公交车与步行','时间顺序','I usually walk to school. It takes twenty minutes. Today it is raining, so I take the bus. The bus comes at eight. I get to school at eight ten. My first class starts at eight thirty. I am not late.','我通常步行上学，要二十分钟。今天下雨，所以我坐公交车。车八点来，八点十分到学校，第一节课八点半开始。我没有迟到。',[
 ['原因判断','今天为什么坐公交车？',['起床晚了','下雨了','自行车坏了'],1,'Today it is raining, so I take the bus.','so 前说明原因；文章没有说起床晚。'],
 ['时间计算','从上车到到校用了多久？',['十分钟','二十分钟','三十分钟'],0,'The bus comes at eight. I get to school at eight ten.','八点到八点十分相差十分钟；二十分钟是平时步行时间。'],
 ['信息判断','文中的人今天迟到了。',['正确','错误','文中未提及'],1,'I am not late.','not late 明确否定迟到，所以是错误，而非未提及。']]],
 ['入门','找到主人','小故事与指代','A boy finds a red hat on a chair. He takes it to his teacher. The teacher asks the class about the hat. A girl puts up her hand. It is her hat. She thanks the boy and puts it in her bag.','男孩在椅子上发现一顶红帽子，把它交给老师。老师问全班谁丢了帽子。女孩举手，帽子是她的。她向男孩道谢，并把帽子放进包里。',[
 ['细节定位','帽子最初在哪里？',['包里','桌子上','椅子上'],2,'A boy finds a red hat on a chair.','问题问最初的位置，不能选故事结尾的包里。'],
 ['指代判断','最后一句的 it 指什么？',['帽子','手','椅子'],0,'She thanks the boy and puts it in her bag.','能被放进包里且前文一直讨论的是帽子。'],
 ['标题选择','哪个标题最合适？',['一堂体育课','帽子回到主人身边','购买新书包'],1,'It is her hat.','故事围绕发现帽子、寻找主人和归还展开。']]],
 ['基础','选择运动课','比较与条件','The sports centre offers two classes for beginners. Swimming is on Monday and Wednesday evenings. It costs twelve pounds a week, and equipment is provided. Tennis is on Saturday morning and costs eight pounds. Students must bring a racket. A student works every weekday evening and already owns a racket. She wants a class she can attend regularly. She chooses tennis, even though she would also like to learn to swim.','运动中心开设两门初学者课程。游泳在周一和周三晚上，每周十二英镑，提供装备。网球在周六早上，八英镑，需自带球拍。一名学生每个工作日晚上都上班，已有球拍。她选择可以固定参加的网球课，尽管也想学游泳。',[
 ['推断判断','选择网球最直接的原因是什么？',['她讨厌游泳','时间与工作不冲突','游泳只收成年人'],1,'A student works every weekday evening.','她想学游泳，但上课时间与工作冲突；不能推断讨厌游泳。'],
 ['比较信息','哪项正确比较了两门课？',['网球更便宜','两门课都提供装备','游泳在周末'],0,'Swimming ... costs twelve pounds ... Tennis ... costs eight pounds.','十二英镑高于八英镑；网球需自带球拍。'],
 ['信息判断','这名学生以前参加过网球比赛。',['正确','错误','文中未提及'],2,'She already owns a racket.','拥有球拍不等于参加过比赛，文本没有比赛经历信息。']]],
 ['基础','自带杯子','因果与词义','A small cafe gives a discount to customers who bring their own cups. At first, only a few people use the offer. The owner then puts a sign beside the till and asks staff to mention it when taking orders. Within a month, more customers bring cups. The owner says the price matters, but many customers simply did not know about the offer before. She keeps the sign in place.','一家小咖啡馆为自带杯子的顾客打折。起初响应的人少，店主在收银台旁放了告示，让员工点单时提醒。一个月内自带杯子的顾客增多。店主认为价格有影响，但很多人此前只是根本不知道优惠。她保留了告示。',[
 ['词义推断','文中 discount 最接近什么？',['额外费用','价格优惠','新饮料'],1,'A discount to customers who bring their own cups.','discount 是对符合条件顾客的价格减免。'],
 ['原因判断','告示可能解决了什么问题？',['人们不知道有优惠','杯子太重','咖啡馆没有座位'],0,'Many customers simply did not know about the offer before.','信息不足是明确提到的原因，其他两项无依据。'],
 ['主旨概括','短文重点是什么？',['咖啡制作过程','让更多顾客知道优惠','所有顾客都只关心价格'],1,'The owner then puts a sign beside the till.','文章围绕宣传优惠的变化及效果，且没有说价格是唯一因素。']]],
 ['基础','演出时间变了','通知与变更','The school concert was planned for Friday evening in the main hall. Because the hall needs repairs, the concert will now take place in the gym on Saturday afternoon. Tickets already bought are still valid. Anyone who cannot attend on Saturday can return a ticket to the school office by Thursday for a refund. The programme and the performers will remain the same. Families are asked to arrive fifteen minutes before the performance.','学校音乐会原定周五晚在大厅举行。由于大厅维修，改为周六下午在体育馆举行。已购票仍有效，周六不能来的可在周四前到办公室退票。节目和演出人员不变，请提前十五分钟到场。',[
 ['比较信息','什么发生了变化？',['只有演出人员','地点和时间','票全部失效'],1,'The concert will now take place in the gym on Saturday afternoon.','新旧安排对比可知时间和地点都变了。'],
 ['细节定位','不能参加的人应怎么办？',['周四前到办公室退票','演出后再退','必须另买新票'],0,'Return a ticket to the school office by Thursday for a refund.','by Thursday 是退款办理期限。'],
 ['信息判断','演出节目内容发生了变化。',['正确','错误','文中未提及'],1,'The programme and the performers will remain the same.','remain the same 表示保持不变，与题干相反。']]],
 ['基础','菜园中的分工','人物动机','A family starts a vegetable garden. At first, the father does most of the work while the children watch. The plants grow well, but the children lose interest. The family then gives each child a small area to look after. One grows beans and the other grows carrots. They check their plants every afternoon and ask for advice when leaves turn yellow. The father still helps, but he no longer makes every decision.','一家人开始种菜。起初父亲干了大部分活，孩子只看，渐渐没了兴趣。后来每个孩子有一小块地，一个种豆子，一个种胡萝卜。他们每天下午查看植物，叶子变黄时求助。父亲仍帮忙，但不再包办决定。',[
 ['推断判断','孩子兴趣增加可能与什么有关？',['有了自己的负责区域','父亲停止所有帮助','花园变成了商店'],0,'The family then gives each child a small area to look after.','分配责任后出现了主动查看植物的行为。'],
 ['细节定位','叶子变黄时孩子们怎么做？',['扔掉所有植物','寻求建议','完全不管'],1,'Ask for advice when leaves turn yellow.','ask for advice 是寻求建议。'],
 ['标题选择','哪个标题概括得最好？',['一种昂贵的胡萝卜','让孩子参与决定','怎样出售花园'],1,'He no longer makes every decision.','文章重点是分工带来的参与变化，而非买卖。']]],
 ['中级','看不见的维修工作','段落主旨','When a town installed bright new street lights, residents praised the improvement. Few noticed the maintenance team that inspected wiring, replaced damaged covers and checked timers each month. Those routine tasks attracted attention only when something went wrong. A local reporter followed the team for a week and found that preventing failures required more planning than simply responding to complaints. Some repairs were scheduled before residents could see any damage. The report did not suggest that visible improvements were unimportant. Instead, it argued that a reliable public service depends on continuing work that rarely produces a dramatic photograph.','小镇装上明亮的新路灯，居民称赞改善，却少有人注意维护团队每月检查线路、灯罩和定时器。记者跟访发现，预防故障需要规划，有些维修发生在居民看到损坏之前。文章不否认可见改善的重要性，而是强调可靠服务依赖不显眼的持续维护。',[
 ['主旨概括','最合适的段落标题是？',['新灯的颜色选择','持续维护的隐形价值','居民投诉总是无理'],1,'A reliable public service depends on continuing work.','开头的新灯是引子，核心是容易被忽视的维护。'],
 ['推断判断','为什么有些维修在居民看到损坏前进行？',['为了预防故障','为了隐藏投诉','因为居民不需要路灯'],0,'Preventing failures required more planning.','preventing 表明这是预防性维护，不是隐瞒。'],
 ['作者态度','作者对新设施和维护持何种态度？',['只需要新设施','两者都有价值','两者都不必要'],1,'The report did not suggest that visible improvements were unimportant.','作者没有否定新设施，而是补充持续维护的重要性。']]],
 ['中级','博物馆里的复制品','观点与指代','A museum placed a replica of an ancient bowl beside the original. Visitors were invited to touch the replica, while the original remained behind glass. Some critics feared that copies would reduce interest in authentic objects. Guides, however, reported that handling the replica led visitors to ask more detailed questions about how the bowl had been made. This did not prove that every exhibition needed copies, but it challenged the assumption that physical access and respect for originals were necessarily in conflict. The museum kept both objects and clearly labelled which one was modern.','博物馆把古碗复制品放在原件旁，允许触摸复制品。有人担心复制品削弱对真品的兴趣，导览员却发现触摸后游客问了更多制作细节。这不能证明所有展览都需要复制品，却挑战了接触体验与尊重原件必然冲突的假设。馆方保留两者并明确标注。',[
 ['词义推断','replica 在文中指什么？',['复制品','损坏的原件','说明标签'],0,'Clearly labelled which one was modern.','现代制作、可触摸而与原件并列的物体是复制品。'],
 ['指代判断','This did not prove 中 This 指向什么发现？',['玻璃已经破损','游客触摸后问了更多细节','原件刚刚制造'],1,'Handling the replica led visitors to ask more detailed questions.','This 回指前句观察到的游客提问变化。'],
 ['信息判断','文章明确指出所有展览都应使用复制品。',['正确','错误','文中未提及'],1,'This did not prove that every exhibition needed copies.','原文明确否定这一普遍推论，因此不是未提及。']]],
 ['中级','社区冰箱的规则','信息整合','Volunteers put a shared fridge outside a community centre so that neighbours could leave surplus food. The first week was busy, but some items had no dates and others were unsuitable for storage. Rather than closing the project, volunteers introduced labels and a short list of accepted foods. They also arranged daily checks. Donations fell slightly, yet less food had to be thrown away. The team judged success by how much usable food reached people, not simply by the number of items left in the fridge. They posted the rules in several languages to make participation easier.','志愿者设立社区冰箱，供邻居分享多余食物。初期有食物没日期或不适合保存。他们没有关停，而是引入标签、可收食品清单和每日检查。捐赠略降，但丢弃减少。团队看重真正可用并送到人手中的食物，而非捐赠件数，并公布多语规则。',[
 ['细节定位','最初出现了什么问题？',['所有食物都卖得太贵','部分食品缺乏日期或不适宜保存','居民拒绝使用标签'],1,'Some items had no dates and others were unsuitable for storage.','两个并列问题都与食品可用性和保存有关。'],
 ['推断判断','为什么捐赠减少不一定表示项目失败？',['可用食物的比例可能提高','团队不再检查','冰箱只供游客使用'],0,'Donations fell slightly, yet less food had to be thrown away.','需要结合两项变化，不能只看捐赠件数。'],
 ['信息判断','冰箱每天在晚上八点关闭。',['正确','错误','文中未提及'],2,'They also arranged daily checks.','每日检查并没有说明开放或关闭时间，不能据此推断八点关门。']]],
 ['中级','评价一门线上课程','证据判断','An online course received excellent reviews from people who completed it. The provider used these reviews to claim that almost everyone found the course useful. A teacher noticed that fewer than half of those who enrolled had finished. She asked whether the opinions of learners who left early had been collected. Some may have stopped because of unrelated commitments, while others may have found the lessons unsuitable. Without asking them, neither explanation could be assumed. The teacher recommended keeping the positive reviews but reporting completion rates and inviting feedback from former learners as well.','线上课结业者好评很多，机构声称几乎人人都觉得有用。但教师注意到结业人数不到报名者一半，询问退出者是否被调查。退出可能因外部事务，也可能因课程不适合；不调查就不能假定原因。她建议保留好评，同时报告完成率并收集退出者反馈。',[
 ['论证分析','机构结论的主要局限是什么？',['只考虑了结业者的评价','没有任何好评','没有录制视频'],0,'Whether the opinions of learners who left early had been collected.','从结业者推及几乎所有报名者，遗漏了另一群体。'],
 ['作者态度','教师如何看待已有好评？',['全部是假话','有价值但不完整','必须全部删除'],1,'Keeping the positive reviews but reporting completion rates.','保留但补充数据，是有条件认可。'],
 ['推断判断','关于退出者，哪项推断有依据？',['全部觉得课程太难','全部没有时间','需要进一步了解退出原因'],2,'Without asking them, neither explanation could be assumed.','两个原因都只是可能，需要调查才能判断。']]],
 ['高级','免费服务的隐藏成本','论证与权衡','A city offered a free application that helped residents find available parking spaces. Officials highlighted the time drivers could save, while the supplier expected to earn revenue from commercial partnerships. The service required users to share location data, but the announcement described this only as a technical requirement. A residents group asked how long the data would be retained and whether information collected for parking could later be used for unrelated purposes. Its members did not demand that the application be withdrawn. They argued that a service can be free at the point of use while still involving a significant exchange. Assessing that exchange requires clear terms and meaningful alternatives, especially when a digital service gradually becomes the normal route to a public facility.','城市推出免费停车位查询应用，强调节省时间，供应商则期待商业合作收入。使用者需分享定位数据，但公告只把它描述为技术要求。居民团体询问数据保留时间和用途，并非要求下架，而是指出免费使用也可能涉及重要交换，尤其当数字服务渐成公共设施常规入口时，应有清晰条款与真正可选的替代方案。',[
 ['主旨概括','作者希望读者重新考虑什么？',['免费是否意味着没有代价','停车场是否都应关闭','所有数据都必须出售'],0,'A service can be free at the point of use while still involving a significant exchange.','全文关注非金钱交换，而非全面否定服务。'],
 ['推断判断','为什么强调 meaningful alternatives？',['人们应能真正选择不接受交换','应用应有更多广告','城市不需要停车信息'],0,'Especially when a digital service gradually becomes the normal route to a public facility.','当服务成为常规入口，形式上的同意可能缺乏实际替代选择。'],
 ['作者态度','居民团体的立场最接近哪项？',['无条件赞成','要求透明并保留选择','反对所有数字公共服务'],1,'Its members did not demand that the application be withdrawn.','未要求下架，而是追问条款与替代方案。']]],
 ['高级','开放数据与可理解性','概念辨析','A public agency released thousands of spreadsheets and announced that it had become fully transparent. Journalists welcomed access to the figures but found inconsistent definitions, missing explanations and changes in the way categories were recorded. A rise in one column could reflect a change in classification rather than a change in the underlying activity. Publishing the files was therefore a valuable first step, not the end of the process. Useful openness also required documentation, stable identifiers and opportunities to ask questions. None of these measures could guarantee a single interpretation of the evidence. They could, however, make disagreements more productive by allowing readers to examine how a claim had been constructed instead of merely accepting or rejecting the authority of the institution.','公共机构发布大量表格，宣称全面透明。记者欢迎数据公开，却发现定义不一、解释缺失和分类方式变化。某列上升可能只是分类改变。发布是第一步，还需要文档、稳定标识和提问渠道。它们不保证唯一解释，却能让争论围绕论断如何构建，而非仅接受或拒绝机构权威。',[
 ['概念辨析','文章主要区分什么？',['公开数据与让数据可理解','数字与文字谁更便宜','记者与机构谁永远正确'],0,'Publishing the files was therefore a valuable first step, not the end of the process.','公开文件本身并未解决理解与比较问题。'],
 ['推断判断','一列数字上升时，首先还应检查什么？',['分类定义是否发生变化','文件名是否好看','记者是否喜欢表格'],0,'A rise in one column could reflect a change in classification.','作者提供了表面趋势之外的替代解释。'],
 ['信息判断','充分的文档能确保所有人得出同一结论。',['正确','错误','文中未提及'],1,'None of these measures could guarantee a single interpretation of the evidence.','guarantee a single interpretation 被明确否定。']]],
 ['高级','当排名变成目标','机制与后果','A university began rewarding departments according to the number of articles they published. Within two years, the total increased substantially. Administrators initially took this as evidence of stronger research. Some researchers, however, reported dividing projects into smaller papers and avoiding questions that required years of uncertain work. The measure had not necessarily become useless; counting publications still described one aspect of activity. The problem arose when the count was treated as a sufficient definition of quality and attached to powerful incentives. A later review combined quantitative information with expert assessment and explanations of the work behind the numbers. This approach was slower and involved judgement, but it reduced the temptation to confuse an easily measured output with the broader purpose of research.','大学按论文数量奖励院系，数量迅速上升。部分研究者却拆分项目，并回避需要多年不确定工作的课题。数量并非毫无价值，问题在于将它等同质量并施加强激励。后续评价结合数据、专家判断与研究解释，虽慢且需判断，却减少把易测产出当作研究全部目标的倾向。',[
 ['论证分析','作者认为主要问题出在哪里？',['所有数字都无效','把单一数量当作质量的充分定义','专家从不需要证据'],1,'The count was treated as a sufficient definition of quality.','作者保留计数的局部用途，反对的是过度代表性。'],
 ['机制推断','为什么一些人回避长期项目？',['长期项目不利于快速增加论文数量','长期研究被法律禁止','所有研究都已完成'],0,'Avoiding questions that required years of uncertain work.','需结合按数量奖励的机制推断，而非认为长期研究没有价值。'],
 ['作者态度','作者怎样评价调整后的方案？',['毫无成本且完全客观','更复杂，但更贴近研究目标','必然减少所有论文'],1,'This approach was slower and involved judgement.','作者承认代价，同时指出其减少单一指标扭曲的优点。']]],
 ['高级','城市绿化的受益者','综合与公平','A neighbourhood gained trees, walking paths and a restored riverbank after a major improvement project. Surveys of current residents showed high satisfaction, and photographs attracted attention from other cities. Yet a housing organisation warned that rising rents had forced some former residents to move away. Their views were absent from surveys conducted only among people who remained. This did not mean that cleaner surroundings were undesirable. It suggested that environmental improvements and the distribution of their benefits needed to be evaluated together. Measures such as affordable housing protections might help existing residents share in the gains, though their effectiveness would depend on implementation. A credible assessment would therefore ask both whether the area had improved and whether the people the project was intended to serve could still afford to live there.','社区整治带来树木、步道和修复河岸，现居民满意度高。但住房组织指出房租上涨让部分原住户搬离，只调查留下的人会遗漏他们。作者并非否定环境改善，而是强调同时评估收益分配，保障性措施效果也取决于执行。评估既要问地区是否变好，也要问目标居民是否仍住得起。',[
 ['证据判断','现有满意度调查遗漏了哪类人？',['已经因租金上涨搬离的人','拍摄照片的人','所有新居民'],0,'Their views were absent from surveys conducted only among people who remained.','代词 Their 指前句被迫搬离的原住户。'],
 ['主旨概括','哪项最完整概括本文？',['绿化必然有害','环境改善应结合受益分配评估','租金是唯一重要指标'],1,'Environmental improvements and the distribution of their benefits needed to be evaluated together.','文章同时考虑改善与公平，不能只取其中一面。'],
 ['信息判断','作者保证住房保障措施在任何情况下都有效。',['正确','错误','文中未提及'],1,'Their effectiveness would depend on implementation.','depends on implementation 是条件限制，与无条件保证相反。']]]
];
readingPracticeExpansion.forEach(([level,title,focus,text,translation,rows])=>readings.push({id:`read-${readings.length+1}`,level,title,focus,text,translation,source:'原创专项练习 · 参考常见考试题型，非官方真题',questions:rows.map(([skill,prompt,options,answer,evidence,explanation])=>({skill,prompt,options,answer,evidence,explanation}))}));

// Hand-curated teaching aids. Spelling chunks are visual guides, not standalone sounds.
export const wordStructures={
 government:{morphemes:['govern','ment'],note:'govern 表示治理；-ment 是构成名词的后缀。这里按构词分块，不表示只有两个音节。'},
 development:{morphemes:['develop','ment'],note:'develop（发展）＋ -ment（名词后缀）。'},
 agreement:{morphemes:['agree','ment'],note:'agree（同意）＋ -ment（名词后缀）。'},
 enjoyment:{morphemes:['enjoy','ment'],note:'enjoy（享受）＋ -ment（名词后缀）。'},
 helpful:{morphemes:['help','ful'],note:'help（帮助）＋ -ful（形容词后缀），表示有帮助的。'},
 careful:{morphemes:['care','ful'],note:'care（留心）＋ -ful（形容词后缀），表示小心的。'},
 careless:{morphemes:['care','less'],note:'care（留心）＋ -less（缺少），表示粗心的。'},
 hopeless:{morphemes:['hope','less'],note:'hope（希望）＋ -less（缺少），表示无望的。'},
 unhappy:{morphemes:['un','happy'],note:'un-（不）＋ happy（开心的）。'},
 friendship:{morphemes:['friend','ship'],note:'friend（朋友）＋ -ship（表示关系等的名词后缀）；这里的 ship 不是“船”。'},
 teacher:{morphemes:['teach','er'],note:'teach（教）＋ -er（做这件事的人）。',syllables:['teach','er'],stress:0},
 banana:{syllables:['ba','na','na'],stress:1},
 computer:{syllables:['com','pu','ter'],stress:1},
 beautiful:{syllables:['beau','ti','ful'],stress:0},
 remember:{syllables:['re','mem','ber'],stress:1},
 tomorrow:{syllables:['to','mor','row'],stress:1},
 information:{syllables:['in','for','ma','tion'],stress:2}
};
