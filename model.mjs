export const STORAGE_KEY = 'a-little-english-v2';
export const intervals = [1, 3, 7, 14, 30];
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function addDays(day, count) { const d = new Date(`${day}T12:00:00`);d.setDate(d.getDate()+count);return dayKey(d); }
export const keyOf = word => word.trim().toLowerCase();
export const normalize = value => value.trim().replace(/[.!?。！？]+$/, '').replace(/[’‘]/g,"'").replace(/\s+/g,' ').toLowerCase();
export function gradeBlanks(expected,values,previous=[]) {
  const locked=expected.map((answer,i)=>Boolean(previous[i])||normalize(String(values[i]||''))===normalize(answer));
  const wrong=expected.map((_,i)=>!locked[i]&&Boolean(String(values[i]||'').trim()));
  return {locked,wrong,correct:locked.filter(Boolean).length,complete:locked.every(Boolean)};
}
export function blankLayout(step) {
  if(step.type==='gap'){
    let index=0;
    return [...step.masked].map(char=>char==='_'?{text:step.answer[index++],blank:true}:{text:char,blank:false});
  }
  const parts=step.type==='sentence-gap'?step.parts:[{text:step.answer,blank:true}];
  return parts.flatMap(part=>[...part.text].map(char=>({text:char,blank:part.blank&&/[A-Za-z]/.test(char)})));
}
export function letterGap(word) {
  // Preserve context: leave at least one visible letter, and skip phrases / punctuation.
  if (!/^[a-z]{2,}$/i.test(word)) return null;
  const positions = word.length < 7 ? [Math.floor(word.length / 2)] : [Math.floor(word.length / 3), Math.floor(word.length * 2 / 3)];
  return {masked: [...word].map((letter,index)=>positions.includes(index)?'_':letter).join(''), answer:positions.map(index=>word[index]).join('')};
}
export function letterStages(word,random=Math.random) {
  if (!/^[a-z]{2,}$/i.test(word)) return [];
  // Sample within length-scaled bands, then choose positions without replacement.
  // Generate once when creating the lesson; saved masks survive retries and reloads.
  const stages=[],bands=[[.15,.25],[.35,.45],[.6,.75]];
  for(const [low,high] of bands){
    const previous=stages.at(-1)?.answer.length||0;
    const min=Math.max(previous+1,Math.floor(word.length*low),1);
    const max=Math.min(word.length-1,Math.max(min,Math.floor(word.length*high)));
    if(min>max)break;
    const count=min+Math.floor(random()*(max-min+1));
    const positions=Array.from({length:word.length},(_,i)=>i);
    for(let i=positions.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
    const hidden=positions.slice(0,count).sort((a,b)=>a-b);
    stages.push({level:`random-${stages.length+1}`,label:`补 ${count} 个字母`,masked:[...word].map((c,i)=>hidden.includes(i)?'_':c).join(''),answer:hidden.map(i=>word[i]).join('')});
  }
  return stages;
}
export function sentenceStages(sentence) {
  const matches=[...sentence.matchAll(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g)];
  if(matches.length<2)return [];
  // Keep punctuation and at least one visible word as context.
  const count=matches.length,more=Math.min(count-1,Math.max(2,Math.ceil(count/2)));
  const groups=[[count-1],Array.from({length:more},(_,i)=>count-more+i)];
  const stages=[];
  for(const hidden of groups){
    if(hidden.length<=(stages.at(-1)?.missing.length||0))continue;
    const parts=[];let cursor=0;
    matches.forEach((m,i)=>{if(m.index>cursor)parts.push({text:sentence.slice(cursor,m.index),blank:false});parts.push({text:m[0],blank:hidden.includes(i)});cursor=m.index+m[0].length;});
    if(cursor<sentence.length)parts.push({text:sentence.slice(cursor),blank:false});
    const missing=hidden.map(i=>matches[i][0]);
    stages.push({level:hidden.length===1?'one':'more',label:hidden.length===1?'补 1 个单词':`补 ${hidden.length} 个单词`,parts,missing,answer:missing.join(' ')});
  }
  return stages;
}
export function phoneticLabel(value) {
  if (!value?.trim()) return '';
  const cleaned=value.trim().replace(/^[/\[]|[/\]]$/g,'').replace(/:/g,'ː').replace(/'/g,'ˈ').replace(/ә/g,'ə');
  return `/${cleaned}/`;
}
export const collections = [{id:'general',name:'零基础与常用词'},{id:'starter',name:'零基础 150 词'},{id:'core',name:'常用 6000 词'},{id:'cet4',name:'大学英语四级'},{id:'cet6',name:'大学英语六级'},{id:'zk',name:'中考英语'},{id:'gk',name:'高考英语'},{id:'ky',name:'考研英语'},{id:'ielts',name:'雅思 IELTS'},{id:'toefl',name:'托福 TOEFL'},{id:'gre',name:'GRE'},{id:'all',name:'全部学习词库'}];
export function collectionWords(words,id) {return id==='all'?words:words.filter(w=>w.collections?.includes(id));}
export function wordStatus(card,today=dayKey()) {return !card?'new':card.mistakes>0?'mistakes':card.due<=today?'due':memoryVerified(card)?'stable':'learned';}
export function freshState() { return {version:2,cards:Object.create(null),dates:[],reviews:0,grammar:[],scenes:[],listenings:[],alphabet:[],custom:[],readingWords:[],readingProgress:{},settings:{daily:5,dictationDelay:2,voice:'jenny',collection:'general'},session:null}; }
const isDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
export function validateState(raw) {
  if (!raw || raw.version !== 2 || typeof raw.cards !== 'object' || Array.isArray(raw.cards) || !raw.cards) throw Error('不是有效的一点英语备份。');
  const result = freshState();
  for (const [key, value] of Object.entries(raw.cards)) {
    if (!/^[a-z][a-z .'\-]{0,79}$/i.test(key) || !value || !isDay(value.due) || !isDay(value.last) || !isDay(value.added)) continue;
    result.cards[key] = {stage:Math.max(0,Math.min(4,Number(value.stage)||0)),due:value.due,last:value.last,added:value.added,mistakes:Math.max(0,Number(value.mistakes)||0),lapses:Math.max(0,Number(value.lapses)||0),independentDays:Math.max(0,Math.floor(Number(value.independentDays)||0)),lastIndependent:isDay(value.lastIndependent)?value.lastIndependent:null,hintUses:Math.max(0,Math.floor(Number(value.hintUses)||0)),lastHinted:Boolean(value.lastHinted),answerUses:Math.max(0,Math.floor(Number(value.answerUses)||0)),correctionUses:Math.max(0,Math.floor(Number(value.correctionUses)||0))};
  }
  result.dates = [...new Set((Array.isArray(raw.dates)?raw.dates:[]).filter(isDay))];
  result.reviews = Math.max(0,Math.floor(Number(raw.reviews)||0));
  for (const type of ['grammar','scenes','listenings','alphabet']) result[type] = [...new Set((Array.isArray(raw[type])?raw[type]:[]).filter(x=>typeof x==='string' && x.length<50))];
  result.custom = (Array.isArray(raw.custom)?raw.custom:[]).filter(x=>x && /^[a-z][a-z '\-]{0,79}$/i.test(x.word) && typeof x.meaning==='string' && x.meaning.length<10000).slice(0,10000).map(x=>({word:x.word,meaning:x.meaning,phonetic:typeof x.phonetic==='string'?x.phonetic:''}));
  result.readingWords=(Array.isArray(raw.readingWords)?raw.readingWords:[]).filter(w=>w&&/^[a-z][a-z '\-]{0,79}$/i.test(w.word)&&typeof w.meaning==='string').slice(0,10000).map(w=>({word:w.word,meaning:w.meaning.slice(0,10000),phonetic:typeof w.phonetic==='string'?w.phonetic:'',sources:[...new Set((Array.isArray(w.sources)?w.sources:[]).filter(id=>/^read-\d+$/.test(id)))],added:isDay(w.added)?w.added:dayKey()}));
  for(const [id,progress] of Object.entries(raw.readingProgress||{}))if(/^read-\d+$/.test(id)&&progress&&Array.isArray(progress.answers))result.readingProgress[id]={answers:progress.answers.slice(0,20).map(value=>Number.isInteger(value)&&value>=0&&value<10?value:null),completed:isDay(progress.completed)?progress.completed:null};
  result.settings.daily = [5,10,15].includes(raw.settings?.daily)?raw.settings.daily:5;
  result.settings.dictationDelay = [0,2,4].includes(raw.settings?.dictationDelay)?raw.settings.dictationDelay:2;
  result.settings.voice = ['jenny','sonia','device'].includes(raw.settings?.voice)?raw.settings.voice:'jenny';
  result.settings.collection = collections.some(c=>c.id===raw.settings?.collection)?raw.settings.collection:'general';
  // Active sessions contain generated steps; only local reads can opt into resuming them.
  return result;
}
export function migrateV1(old) {
  const result=freshState();
  if(!old || typeof old!=='object')return result;
  result.dates=(Array.isArray(old.dates)?old.dates:[]).filter(isDay);
  result.reviews=Number.isInteger(old.reviews)&&old.reviews>=0?old.reviews:0;
  if(old.completed){const last=isDay(old.lastPractice)?old.lastPractice:dayKey();for(const key of ['i','want','water'])result.cards[key]={stage:0,due:addDays(last,1),last,added:last,mistakes:0,lapses:0};}
  return result;
}
export function scheduleCard(previous, missed, today=dayKey()) {
  if(!previous)return {stage:0,due:addDays(today,1),last:today,added:today,mistakes:missed?1:0,lapses:missed?1:0};
  const stage=missed?0:previous.last===today?previous.stage:Math.min(4,previous.stage+1);
  return {...previous,stage,due:!missed&&previous.last===today?previous.due:addDays(today,intervals[stage]),last:today,mistakes:missed?previous.mistakes+1:0,lapses:previous.lapses+(missed?1:0)};
}
export function dueWords(state, words, today=dayKey()) { return words.filter(w=>state.cards[keyOf(w.word)]?.due<=today).sort((a,b)=>state.cards[keyOf(a.word)].due.localeCompare(state.cards[keyOf(b.word)].due)); }
export function newWords(state, words, count) { return words.filter(w=>!state.cards[keyOf(w.word)]).slice(0,count); }
export function learnedToday(state,today=dayKey()) { return Object.values(state.cards).filter(c=>c.added===today).length; }

// These counters describe independent recall across days, not permanent mastery.
export function memoryVerified(card) { return Boolean(card && card.independentDays>=3 && !card.mistakes); }
export function scheduleMemoryCard(previous, missed, evidence={}, today=dayKey()) {
 const card=scheduleCard(previous,missed,today);
 const independent=Boolean(evidence.independent&&!evidence.hinted&&!missed);
 const crossDay=independent&&previous&&today>previous.added&&today>previous.last&&previous.lastIndependent!==today;
 card.independentDays=missed?0:(previous?.independentDays||0)+(crossDay?1:0);
 card.lastIndependent=crossDay?today:previous?.lastIndependent||null;
 card.hintUses=(previous?.hintUses||0)+(evidence.hinted?1:0);
 card.lastHinted=Boolean(evidence.hinted);
 card.answerUses=(previous?.answerUses||0)+(evidence.answerViewed?1:0);
 card.correctionUses=(previous?.correctionUses||0)+(missed&&!evidence.answerViewed?1:0);
 if(crossDay){card.stage=Math.min(4,card.independentDays);card.due=addDays(today,intervals[card.stage]);}
 // Assisted practice cannot lengthen the review interval. Legacy progress is retained.
 if(previous&&!crossDay&&!missed){card.stage=previous.stage;card.due=previous.due<=today?addDays(today,1):previous.due;}
 return card;
}
export function independentListening(word,assessment='review') {
 return {type:'listen',title:'听声音，独立写出这个词。',answer:word.word,key:keyOf(word.word),wholeAnswer:true,assessment,progression:assessment==='review'?'独立复习 · 填完整个词后自动判断':'再回忆一次 · 填完整个词后自动判断'};
}
export function memoryLessonSteps(review,fresh,practice) {
 return [...review.map(w=>independentListening(w)),...fresh.flatMap(w=>practice(w).filter(s=>s.type!=='listen')),...fresh.map(w=>independentListening(w,'delayed'))];
}

export function orderedLessons(items,levels=['入门','基础','中级','高级']) {
 return [...items].sort((a,b)=>levels.indexOf(a.level)-levels.indexOf(b.level));
}
export function lessonAccess(items,completed,id){
 const ordered=orderedLessons(items),index=ordered.findIndex(item=>item.id===id),done=new Set(completed);
 if(index<0)return {allowed:false,prerequisite:null};
 const prerequisite=ordered.slice(0,index).find(item=>!done.has(item.id));
 return {allowed:done.has(id)||!prerequisite,prerequisite:prerequisite||null};
}

export function structureExercises(word,entry){
 if(!entry)return [];
 const key=keyOf(word.word),steps=[];
 if(entry.syllables){const count=entry.syllables.length;steps.push({type:'choice',key,soundWord:word.word,structurePractice:true,title:'听完整单词，有几个音节？',options:['1 个音节','2 个音节','3 个音节','4 个音节'],answer:`${count} 个音节`,explanation:`${word.word} 的常见完整读法有 ${count} 个音节。分块用于对应拼写，请连起来跟读。`},{type:'choice',key,soundWord:word.word,structurePractice:true,title:'再听一次，哪个音节读得最重？',options:entry.syllables.map((_,i)=>`第 ${i+1} 个音节`),answer:`第 ${entry.stress+1} 个音节`,explanation:`${word.word} 的主重音在第 ${entry.stress+1} 个音节，注意听完整单词中的轻重变化。`});}
 const parts=entry.morphemes||entry.syllables;
 if(parts?.join('').toLowerCase()===key){const index=parts.length-1;steps.push({type:'gap',key,structurePractice:true,title:entry.morphemes?'把构词部分补完整':'把最后一段拼写补完整',progression:'按块练习 · 下一步逐渐撤掉提示',word:word.word,meaning:word.meaning,masked:parts.map((p,i)=>i===index?'_'.repeat(p.length):p).join(''),answer:parts[index]});}
 return steps;
}
