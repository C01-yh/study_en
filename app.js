import {createAudioCache} from './audio-cache.mjs';
import {topics,grammar,scenes,readings,studyLevels,listeningLessons} from './curriculum.js';
import {STORAGE_KEY,dayKey,keyOf,normalize,freshState,validateState,migrateV1,scheduleCard,orderedLessons,lessonAccess,scheduleMemoryCard,memoryVerified,memoryLessonSteps,dueWords,newWords,learnedToday,letterStages,sentenceStages,phoneticLabel,collections,collectionWords,wordStatus,gradeBlanks,blankLayout} from './model.mjs';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=v=>Number(v).toLocaleString('zh-CN');
const meaning=w=>w.meaning.split('\n')[0].slice(0,130);
let state=freshState(),words=[],wordMap=new Map(),manifest={},loaded=false,storageAvailable=true;
let session=null,answered=false,attempted=false,toastTimer,wordPage=1,coursePage=1,dictPage=1,dictItems=[],dictRequest=0,libraryPage=1,recentlyLearned=new Set();
function validSession(s){return s&&['words','grammar','speaking','alphabet','listening'].includes(s.kind)&&typeof s.title==='string'&&Array.isArray(s.steps)&&s.steps.length>0&&s.steps.length<400&&Number.isInteger(s.index)&&s.index>=0&&s.index<s.steps.length&&Array.isArray(s.wordKeys)&&Array.isArray(s.wrong)&&Number.isInteger(s.firstTry)&&s.steps.every(x=>x&&['learn','choice','gap','sentence-gap','spell','listen','explain','speak','letter'].includes(x.type)&&(typeof x.answer==='string'||['learn','explain','speak','letter'].includes(x.type))&&(x.type!=='choice'||Array.isArray(x.options)));}
try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(raw){state=validateState(raw);if(validSession(raw.session))state.session=raw.session;}else state=migrateV1(JSON.parse(localStorage.getItem('a-little-english-v1')||'null'));}catch{storageAvailable=false;}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,6500);}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{storageAvailable=false;toast('浏览器未能保存进度，请在设置中导出备份。');}}

const speechCache=createAudioCache();
let speechId=0,audio=null,audioUrl=null,prepareTimer;
function prepareLessonAudio(){
 clearTimeout(prepareTimer);
 prepareTimer=setTimeout(()=>{if(!dialog.open||state.settings.voice==='device')return;const text=dialog.querySelector('[data-speak]')?.dataset.speak;if(text)for(const speed of ['normal','slow'])speechCache.prepare(text,state.settings.voice,speed);},200);
}
function stopSpeech(){speechId++;if(audio){audio.onplaying=null;audio.onended=null;audio.onerror=null;audio.pause();audio.src='';audio=null;}if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=null;}if('speechSynthesis'in window)speechSynthesis.cancel();document.querySelectorAll('[data-speak]').forEach(b=>{b.classList.remove('playing','audio-loading');b.removeAttribute('aria-busy');});}
async function speak(text,speed='slow',button=null){
 stopSpeech();const id=speechId;button?.classList.add('audio-loading');button?.setAttribute('aria-busy','true');const clear=()=>{if(id===speechId){button?.classList.remove('playing','audio-loading');button?.removeAttribute('aria-busy');}};
 const playing=()=>{if(id===speechId){button?.classList.remove('audio-loading');button?.classList.add('playing');button?.removeAttribute('aria-busy');}};
 if(state.settings.voice==='device'){
  if(!('speechSynthesis'in window)){clear();return toast('当前浏览器不支持设备朗读，请选择自然女声。');}
  let voices=speechSynthesis.getVoices();if(!voices.length){await new Promise(r=>setTimeout(r,400));voices=speechSynthesis.getVoices();}if(id!==speechId)return;
  const en=voices.filter(v=>/^en[-_]/i.test(v.lang)),voice=en.find(v=>/Samantha|Sonia|Jenny|Ava|Serena/i.test(v.name))||en[0];if(!voice){clear();return toast('设备没有可用英语声音，请选择 Jenny 或 Sonia。');}
  const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang;u.rate=speed==='slow'?0.7:0.9;u.onstart=playing;u.onend=clear;u.onerror=clear;speechSynthesis.speak(u);return;
 }
 try{const blob=await speechCache.get(text,state.settings.voice,speed);if(id!==speechId)return;audioUrl=URL.createObjectURL(blob);audio=new Audio(audioUrl);audio.onplaying=playing;audio.onended=clear;audio.onerror=()=>{clear();toast('音频播放失败，请重试。');};await audio.play();}catch(e){clear();if(id===speechId)toast(e.name==='AbortError'?'声音准备超时，请重试。':e.message);}
}
function listening(text){return `<div class="listening-controls"><button class="listen-button slow-listen" data-speak="${esc(text)}" data-speed="slow">♪ 慢慢听</button><button class="listen-button" data-speak="${esc(text)}" data-speed="normal">♪ 正常听</button></div>`;}
function setVoice(value){state.settings.voice=value;$('#voice-select').value=value;$('#settings-voice').value=value;save();speak('Hello. Take your time. I want water, please.');prepareLessonAudio();}
$('#voice-select').onchange=e=>setVoice(e.target.value);$('#settings-voice').onchange=e=>setVoice(e.target.value);
function buildWords(core,exams){
 wordMap=new Map();
 const add=(w,members)=>{const key=keyOf(w.word),existing=wordMap.get(key);if(!existing)wordMap.set(key,{...w,word:key==='i'?'I':w.word,collections:[...new Set(members)]});else{if(!existing.phonetic&&w.phonetic)existing.phonetic=w.phonetic;existing.collections=[...new Set([...existing.collections,...members])];existing.tags=[...new Set(`${existing.tags||''} ${w.tags||''}`.trim().split(/\s+/))].join(' ');}};
 topics.flatMap(t=>t.words).forEach(w=>add(w,['general','starter']));core.forEach(w=>add(w,['general','core',...(w.tags||'').split(/\s+/).filter(Boolean)]));exams.forEach(w=>add(w,(w.tags||'').split(/\s+/).filter(Boolean)));state.custom.forEach(w=>add(w,['general']));words=[...wordMap.values()];
}
function selectedLearningWords(){return collectionWords(words,state.settings.collection);}
function plan(){const pool=[...new Map([...state.readingWords.map(w=>wordMap.get(keyOf(w.word))).filter(Boolean),...selectedLearningWords()].map(w=>[keyOf(w.word),w])).values()];return{review:dueWords(state,pool).slice(0,10),fresh:newWords(state,pool,Math.max(0,state.settings.daily-learnedToday(state)))};}

function renderDashboard(){
 const p=plan(),total=Object.keys(state.cards).length,count=learnedToday(state);
 $('#today-date').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long'}).format(new Date());$('#word-badge').textContent=fmt(total);$('#active-collection').innerHTML=`当前学习词库：<strong>${esc(collections.find(c=>c.id===state.settings.collection)?.name||'零基础与常用词')}</strong> <button class="text-button" data-view="library">切换词库 →</button>`;$('#practice-count').textContent=count;$('#daily-progress-label').textContent=`/ ${state.settings.daily} 个今日新词`;
 $('#progress-ring').style.background=`conic-gradient(#7b9a62 ${Math.min(1,count/state.settings.daily)*360}deg,#edf0e5 0deg)`;$('#study-days').innerHTML=`${state.dates.length}<small> 天</small>`;$('#review-count').innerHTML=`${state.reviews}<small> 次</small>`;
 $('#progress-note').textContent=`累计练过 ${fmt(total)} 词 · ${dueWords(state,words).length} 词待复习 · ${Object.values(state.cards).filter(memoryVerified).length} 词跨天独立记住`;
 $('#hero-description').textContent=state.session?'上次的练习已保存，可以接着往下学。':`今天安排 ${p.review.length} 个复习词、${p.fresh.length} 个新词，再练一句自己的表达。`;
 $('#start-lesson').textContent=state.session?'继续上次练习 ↗':p.fresh.length||p.review.length?'开始今天的学习 ↗':'今日目标完成，练练口语 ↗';
 const preview=(p.fresh.length?p.fresh:p.review.length?p.review:words).slice(0,3);$('#preview-count').textContent=`本轮 ${p.fresh.length} 个新词`;
 $('#word-preview-list').innerHTML=preview.map(w=>`<button class="preview-word" data-speak="${esc(w.word)}"><span><strong>${esc(w.word)}</strong><small>${esc(meaning(w).slice(0,12))}</small></span><span class="sound-icon">♪</span></button>`).join('');
 const d=new Date(),monday=new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7));let week=0;
 $('#week-days').innerHTML=['一','二','三','四','五','六','日'].map((label,i)=>{const date=new Date(monday);date.setDate(date.getDate()+i);const key=dayKey(date),done=state.dates.includes(key);if(done)week++;return `<div class="day ${done?'done':''} ${key===dayKey()?'today':''}">${label}<i>${done?'✓':'·'}</i></div>`;}).join('');$('#week-total').textContent=`${week} / 7`;
 $('#library-summary').textContent=`完整词典 ${fmt(manifest.dictionaryCount||0)} 词条 · 常用词库 ${fmt(manifest.coreCount||0)} 词 · 30 个生活主题`;
 $('#voice-select').value=state.settings.voice;$('#settings-voice').value=state.settings.voice;$('#daily-target').value=state.settings.daily;
 $('#settings-stats').innerHTML=`<p>练过 <strong>${fmt(total)}</strong> 个词 · 到期 <strong>${dueWords(state,words).length}</strong> 个</p><p>语法 ${state.grammar.length} / ${grammar.length} 课 · 口语 ${state.scenes.length} / ${scenes.length} 场景</p><p>累计学习 ${state.dates.length} 天 · 字母 ${state.alphabet.length} / 26 个</p>`;
 $('#grammar-advice').textContent=total<20?'建议先认识一些生活用词，也可以现在开始第一节句子课。':`你已练过 ${total} 个词，可以配合语法课练习句子。课程不按词汇量强制锁定。`;
}
const names={home:'今日学习',words:'我的单词本',path:'全部课程',library:'分类词库',grammar:'语法练习',speaking:'开口说英语',reading:'阅读与生词',listening:'听力理解',dictionary:'完整词典',settings:'学习设置'};
function showView(view){if(!names[view])return;stopSpeech();for(const name of Object.keys(names))$(`#${name}-view`).hidden=name!==view;document.querySelectorAll('.nav-item').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false');});$('#page-name').textContent=names[view];if(view==='words')renderWordbook();if(view==='path')renderCourses();if(view==='library')renderLibrary();if(view==='reading')renderReading();if(['grammar','speaking','listening'].includes(view))renderActivities();if(view==='dictionary'&&!dictItems.length)searchDictionary();window.scrollTo({top:0,behavior:'smooth'});}
document.addEventListener('click',e=>{const nav=e.target.closest('[data-view]');if(nav)showView(nav.dataset.view);const sound=e.target.closest('[data-speak]');if(sound)speak(sound.dataset.speak,sound.dataset.speed||'slow',sound);const course=e.target.closest('[data-course]');if(course)openCourse(course.dataset.course);const card=e.target.closest('[data-practice-word]');if(card){const word=wordMap.get(card.dataset.practiceWord);if(word)guardSession(()=>startWords([word],[],`再练一次 · ${word.word}`));}const study=e.target.closest('[data-study-word]');if(study){const w=wordMap.get(study.dataset.studyWord);if(w)guardSession(()=>startWords(state.cards[keyOf(w.word)]?[w]:[],state.cards[keyOf(w.word)]?[]:[w],`学习 · ${w.word}`));}const shortcut=e.target.closest('[data-collection]');if(shortcut){$('#collection-select').value=shortcut.dataset.collection;libraryPage=1;renderLibrary();}const add=e.target.closest('[data-add-word]');if(add)addDictionaryWord(Number(add.dataset.addWord));});
$('.brand').onclick=e=>{e.preventDefault();showView('home');};
function pagination(target,page,total,size,change){const pages=Math.max(1,Math.ceil(total/size));$(target).innerHTML=`<button class="button secondary" ${page<=1?'disabled':''} data-page="${page-1}">上一页</button><span>第 ${page} / ${pages} 页 · ${fmt(total)} 项</span><button class="button secondary" ${page>=pages?'disabled':''} data-page="${page+1}">下一页</button>`;$(target).querySelectorAll('button').forEach(b=>b.onclick=()=>change(Number(b.dataset.page)));}
function filteredWords(){const query=$('#word-search').value.toLowerCase().trim(),filter=$('#word-filter').value;return words.filter(w=>{const c=state.cards[keyOf(w.word)];return c&&(!query||w.word.toLowerCase().includes(query)||w.meaning.includes(query))&&(filter==='learned'||filter==='due'&&c.due<=dayKey()||filter==='mistakes'&&c.mistakes>0||filter==='stable'&&memoryVerified(c));});}
function renderWordbook(){const items=filteredWords();wordPage=Math.min(wordPage,Math.max(1,Math.ceil(items.length/18)));$('#wordbook-content').innerHTML=items.length?`<div class="book-grid">${items.slice((wordPage-1)*18,wordPage*18).map(w=>{const c=state.cards[keyOf(w.word)];return `<article class="book-card is-learned status-${wordStatus(c)}"><span class="word-state">${statusIcons[wordStatus(c)]} ${statusLabels[wordStatus(c)]}</span><h2>${esc(w.word)}</h2><small>${esc(w.phonetic||'')}</small><p class="definition">${esc(w.meaning)}</p>${listening(w.word)}<span class="book-status">${c.mistakes?'需要加强':memoryVerified(c)?'跨天独立记住':'已练习'} · 跨天独立通过 ${Math.min(3,c.independentDays||0)}/3 天 · 提示 ${c.hintUses||0} 次 · 纠错 ${c.correctionUses||0} 次 · 看答案 ${c.answerUses||0} 次 · 下次复习 ${c.due}</span><button class="text-button" data-practice-word="${esc(keyOf(w.word))}">再练一次 →</button></article>`;}).join('')}</div>`:'<div class="empty-state"><span>▤</span><h2>暂时没有符合条件的单词</h2><p>完成一次学习，或者切换筛选条件。</p><button class="button primary" data-view="path">查看全部课程</button></div>';pagination('#word-pagination',wordPage,items.length,18,p=>{wordPage=p;renderWordbook();});}
$('#word-search').oninput=$('#word-filter').onchange=()=>{wordPage=1;renderWordbook();};$('#book-review').onclick=()=>{const items=filteredWords().slice(0,15);if(items.length)guardSession(()=>startWords(items,[],'单词复习'));else toast('当前筛选下没有可复习的词。');};
function allCourses(){const themed=new Set(topics.flatMap(t=>t.words.map(w=>keyOf(w.word)))),extension=collectionWords(words,'general').filter(w=>!themed.has(keyOf(w.word)));return [...topics.map(t=>({...t,words:t.words.map(w=>wordMap.get(keyOf(w.word))||w)})),...Array.from({length:Math.ceil(extension.length/10)},(_,i)=>({id:`core-${i}`,title:`常用词拓展 ${i+1}`,icon:'Aa',words:extension.slice(i*10,i*10+10)}))];}
function renderCourses(){const query=$('#course-search').value.toLowerCase().trim(),type=$('#course-filter').value,courses=allCourses().filter(c=>(type==='topics'?c.id.startsWith('topic'):c.id.startsWith('core'))&&(!query||c.title.includes(query)||c.words.some(w=>w.word.toLowerCase().includes(query)||w.meaning.includes(query))));coursePage=Math.min(coursePage,Math.max(1,Math.ceil(courses.length/12)));$('#course-description').textContent=`30 个生活主题 · ${fmt(collectionWords(words,'general').length)} 个基础学习词。常用词按词频扩展，每组 10 个，所有内容已经导入。`;$('#course-grid').innerHTML=courses.slice((coursePage-1)*12,coursePage*12).map(c=>{const done=c.words.filter(w=>state.cards[keyOf(w.word)]).length;return `<article class="course-card"><span class="course-icon">${c.icon}</span><span class="course-status">${done} / ${c.words.length} 已练</span><h2>${esc(c.title)}</h2><p>${esc(c.words.map(w=>w.word).join(' · '))}</p><button class="button ${done===c.words.length?'secondary':'primary'}" data-course="${c.id}">${done===c.words.length?'再次练习':'进入课程'} ↗</button></article>`;}).join('')||'<p class="quiet-note">没有找到课程，换个词试试。</p>';pagination('#course-pagination',coursePage,courses.length,12,p=>{coursePage=p;renderCourses();});}
$('#course-search').oninput=$('#course-filter').onchange=()=>{coursePage=1;renderCourses();};
function renderActivities(){renderListeningList();$('#grammar-count').textContent=`${orderedLessons(grammar).filter(c=>$('#grammar-level').value==='all'||c.level===$('#grammar-level').value).length} 节课`;$('#speaking-count').textContent=`${orderedLessons(scenes).filter(c=>$('#speaking-level').value==='all'||c.level===$('#speaking-level').value).length} 个场景`;$('#grammar-grid').innerHTML=orderedLessons(grammar).filter(c=>$('#grammar-level').value==='all'||c.level===$('#grammar-level').value).map((c,i)=>`<article class="course-card"><span class="course-status">${state.grammar.includes(c.id)?'已完成 ✓':`${c.level} · 第 ${grammar.indexOf(c)+1} 课`}</span><span class="course-icon">✎</span><h2>${esc(c.title)}</h2><p>${esc(c.sentence)}</p><button class="button primary" data-course="${c.id}">学习与练习 ↗</button></article>`).join('');$('#speaking-grid').innerHTML=orderedLessons(scenes).filter(c=>$('#speaking-level').value==='all'||c.level===$('#speaking-level').value).map(c=>`<article class="course-card"><span class="course-status">${state.scenes.includes(c.id)?'已练习 ✓':`${c.level} · ${c.lines.length} 句对话`}</span><span class="course-icon">♪</span><h2>${esc(c.title)}</h2><p>${esc(c.description)}</p><button class="button primary" data-course="${c.id}">开始跟读 ↗</button>${c.roleplay?`<button class="text-button role-start" data-role-scene="${c.id}">练习对话 →</button>`:''}</article>`).join('');refreshModuleLocks('grammar');refreshModuleLocks('speaking');}
async function searchDictionary(){const request=++dictRequest;$('#dictionary-status').textContent='正在查找…';try{const r=await fetch(`/api/dictionary?${new URLSearchParams({q:$('#dictionary-query').value.trim(),page:dictPage})}`),result=await r.json();if(!r.ok)throw Error(result.error);if(request!==dictRequest)return;dictItems=result.items;$('#dictionary-status').textContent=`找到 ${fmt(result.total)} 个词条`;$('#dictionary-results').innerHTML=result.items.map((w,i)=>`<article class="book-card"><h2>${esc(w.word)}</h2><small>${esc(w.phonetic)}</small><p class="definition">${esc(w.translation||'此词条暂缺中文释义。')}</p>${listening(w.word)}<button class="button secondary" data-add-word="${i}" ${!w.translation?'disabled':''}>${state.cards[keyOf(w.word)]?'已经学过 · 再练一次':'加入并学习'}</button></article>`).join('');pagination('#dictionary-pagination',dictPage,result.total,24,p=>{dictPage=p;searchDictionary();});}catch(e){if(request===dictRequest)$('#dictionary-status').textContent=e.message||'词典连接失败，请用启动脚本打开网站。';}}
$('#dictionary-form').onsubmit=e=>{e.preventDefault();dictPage=1;searchDictionary();};
function addDictionaryWord(index){const entry=dictItems[index];if(!entry)return;if(!/^[a-z][a-z '\-]{0,79}$/i.test(entry.word))return toast('此词条可查阅和试听，暂不支持加入拼写练习。');const key=keyOf(entry.word);let word=wordMap.get(key);if(!word){word={word:entry.word,meaning:entry.translation,phonetic:entry.phonetic,collections:['general']};state.custom.push(word);wordMap.set(key,word);words.push(word);save();}guardSession(()=>startWords(state.cards[key]?[word]:[],state.cards[key]?[]:[word],`学习 · ${word.word}`));}

const dialog=$('#lesson-dialog');
const statusLabels={new:'尚未学习',learned:'已练过',due:'到期复习',mistakes:'需要加强',stable:'跨天独立记住'};
const statusIcons={new:'○',learned:'✓',due:'◷',mistakes:'↻',stable:'✓'};
function initCollections(){
 $('#collection-select').innerHTML=collections.map(c=>`<option value="${c.id}">${esc(c.name)} · ${fmt(collectionWords(words,c.id).length)} 词</option>`).join('');
 $('#collection-select').value=state.settings.collection;
}
function libraryMatches(){
 const pool=collectionWords(words,$('#collection-select').value||'general'),query=$('#library-search').value.trim().toLowerCase(),filter=$('#library-filter').value;
 return pool.filter(w=>{const card=state.cards[keyOf(w.word)];return (!query||w.word.toLowerCase().includes(query)||w.meaning.includes(query))&&(filter==='all'||filter==='new'&&!card||filter==='learned'&&card||filter==='due'&&card?.due<=dayKey()||filter==='mistakes'&&card?.mistakes>0||filter==='stable'&&memoryVerified(card));});
}
function renderLibrary(){
 const selected=$('#collection-select').value||'general',pool=collectionWords(words,selected),learned=pool.filter(w=>state.cards[keyOf(w.word)]).length,due=dueWords(state,pool).length,percent=pool.length?Math.round(learned/pool.length*10000)/100:0;
 $('#collection-shortcuts').innerHTML=['general','cet4','cet6','ielts','all'].map(id=>`<button class="collection-chip ${id===selected?'selected':''}" data-collection="${id}" aria-pressed="${id===selected}">${esc(collections.find(c=>c.id===id).name)} <span>${fmt(collectionWords(words,id).length)}</span></button>`).join('');
 $('#collection-stats').innerHTML=[['词库总数',pool.length],['已练过单词',learned],['尚未学习',pool.length-learned],['到期复习',due]].map(([label,count],i)=>`<div class="collection-stat stat-${i}"><strong>${fmt(count)}</strong><span>${label}</span></div>`).join('');
 $('#collection-progress-bar').style.width=`${pool.length?learned/pool.length*100:0}%`;$('#collection-progress-label').textContent=`已练过 ${fmt(learned)} / ${fmt(pool.length)} 词 · ${percent}%（已学不等于长期掌握）`;
 $('#set-collection').textContent=selected===state.settings.collection?'✓ 当前每日学习词库':'设为每日学习词库';$('#set-collection').disabled=selected===state.settings.collection;
 const items=libraryMatches();libraryPage=Math.min(libraryPage,Math.max(1,Math.ceil(items.length/24)));$('#library-result-count').textContent=`筛选结果 ${fmt(items.length)} 词`;
 $('#library-grid').innerHTML=items.slice((libraryPage-1)*24,libraryPage*24).map(w=>{const key=keyOf(w.word),card=state.cards[key],status=wordStatus(card);return `<article class="book-card library-word status-${status} ${card?'is-learned':''} ${recentlyLearned.has(key)?'just-learned':''}"><span class="word-state"><span aria-hidden="true">${statusIcons[status]}</span> ${statusLabels[status]}</span><h2>${esc(w.word)}</h2><small class="library-phonetic">${esc(phoneticLabel(w.phonetic)||'音标暂缺')}</small><p class="definition">${esc(w.meaning)}</p><div class="library-word-actions"><button class="text-button" data-speak="${esc(w.word)}" aria-label="听 ${esc(w.word)} 的发音">♪ 听发音</button><button class="text-button" data-study-word="${esc(key)}">${card?'再练一次':'学习这个词'} ↗</button></div>${card?`<span class="book-status">跨天独立通过 ${Math.min(3,card.independentDays||0)}/3 天 · 提示 ${card.hintUses||0} 次<br>下次复习 ${card.due}</span>`:''}</article>`;}).join('')||'<div class="empty-state library-empty"><h2>没有找到符合条件的单词</h2><p>试试清空搜索，或切换学习状态。</p></div>';
 pagination('#library-pagination',libraryPage,items.length,24,p=>{libraryPage=p;renderLibrary();$('#library-result-count').scrollIntoView({block:'start',behavior:'smooth'});});
}
$('#collection-select').onchange=()=>{libraryPage=1;renderLibrary();};
$('#library-search').oninput=$('#library-filter').onchange=()=>{libraryPage=1;renderLibrary();};
$('#set-collection').onclick=()=>{state.settings.collection=$('#collection-select').value;save();renderDashboard();renderLibrary();toast('每日学习词库已切换，原有进度和未完成练习保留。');};
$('#learn-collection').onclick=()=>{const pool=collectionWords(words,$('#collection-select').value),fresh=newWords(state,pool,state.settings.daily),review=dueWords(state,pool).slice(0,10),name=collections.find(c=>c.id===$('#collection-select').value)?.name||'词库';if(!fresh.length&&!review.length)return toast('本词库已全部练过，暂时没有到期词。可点击任意单词再次练习。');guardSession(()=>startWords(review,fresh,name));};
function optionsFor(word){const answer=meaning(word),pool=[...new Set(words.filter(w=>keyOf(w.word)!==keyOf(word.word)).map(meaning))].filter(m=>m!==answer),offset=Math.floor(Math.random()*Math.max(1,pool.length-2));return [answer,...pool.slice(offset,offset+2)].sort(()=>Math.random()-.5);}
function gapSteps(word){return letterStages(word.word).map((gap,index,all)=>({type:'gap',title:gap.label,level:gap.level,progression:`字母练习 ${index+1} / ${all.length} · 接下来完整拼写`,word:word.word,meaning:meaning(word),masked:gap.masked,answer:gap.answer,explanation:`缺少的字母是 ${gap.answer.split('').join('、')}。完整单词：${word.word}。再试一次。`,key:keyOf(word.word)}));}
function sentenceExercises(sentence,translation){return [...sentenceStages(sentence).map((gap,index,all)=>({...gap,type:'sentence-gap',title:gap.label,progression:`句子练习 ${index+1} / ${all.length} · 接下来完整写句子`,sentence,translation,explanation:`缺少：${gap.answer}。完整句子：${sentence}`})),{type:'spell',title:translation,progression:'最后一步 · 独立写出完整句子',answer:sentence,explanation:`可以这样说：${sentence}`}];}
function wordSteps(word,fresh){const key=keyOf(word.word),steps=[];if(fresh)steps.push({type:'learn',word:word.word,meaning:word.meaning,phonetic:word.phonetic||'',key});steps.push({type:'choice',title:`${word.word} 是什么意思？`,options:optionsFor(word),answer:meaning(word),explanation:`${word.word}：${meaning(word)}`,key},...gapSteps(word),{type:'spell',title:`写出英语：${meaning(word)}`,progression:'完整拼写 · 这次不再显示字母提示',answer:word.word,explanation:`这个词是 ${word.word}。看一遍，再试一次。`,key},{type:'listen',title:'听声音，写出这个词。',answer:word.word,explanation:`刚才读的是 ${word.word}，意思是：${meaning(word)}`,key});return steps;}
function upgradePendingSession(){
 const saved=state.session;if(!saved||saved.progressionVersion===2||!['words','grammar'].includes(saved.kind))return;
 const completed=saved.steps.slice(0,saved.index),remaining=saved.steps.slice(saved.index),expanded=[];
 const completedGaps=new Map();for(const step of completed)if(step.type==='gap')completedGaps.set(step.key,Math.max(completedGaps.get(step.key)||0,step.answer.length));
 const expandedKeys=new Set();
 for(const step of remaining){
  if((step.type==='gap'||step.type==='spell')&&step.key){
   if(!expandedKeys.has(step.key)){const word=wordMap.get(step.key);if(word)expanded.push(...gapSteps(word).filter(g=>g.answer.length>(completedGaps.get(step.key)||0)));expandedKeys.add(step.key);}
   if(step.type==='gap')continue;
  }
  if(step.type==='spell'&&!step.key&&sentenceStages(step.answer).length){expanded.push(...sentenceExercises(step.answer,step.title));continue;}
  expanded.push(step);
 }
 saved.steps=[...completed,...expanded];saved.progressionVersion=2;
}

function startWords(review,fresh,title='今天的学习',course=null){
 if(!loaded)return toast('词库还在加载，请稍候。');
 const seen=new Set();review=review.filter(w=>{const k=keyOf(w.word);if(seen.has(k))return false;seen.add(k);return true;});fresh=fresh.filter(w=>!seen.has(keyOf(w.word)));
 const steps=memoryLessonSteps(review,fresh,w=>wordSteps(w,true));
 const example=course?.sentence?course:title==='今天的学习'?topics.find(t=>t.words.some(w=>[...fresh,...review].some(x=>keyOf(x.word)===keyOf(w.word)))):null;
 // Reuse authored translations and vary the scene across study days.
 const keys=new Set([...fresh,...review].map(w=>keyOf(w.word)));
 const candidates=[...topics,...grammar,...scenes.flatMap(scene=>scene.lines.map(line=>({sentence:line.en,translation:line.zh})))].filter(item=>item.sentence&&item.translation&&(item.sentence.match(/[A-Za-z]+/g)||[]).length<=8&&(item.sentence.toLowerCase().match(/[a-z]+/g)||[]).some(word=>keys.has(word)));
 const unique=[...new Map(candidates.map(item=>[item.sentence,item])).values()].filter(item=>item.sentence!==example?.sentence);
 const offset=[...keys].reduce((sum,key)=>sum+(state.cards[key]?.independentDays||0),0);
 const extra=unique.length?unique[offset%unique.length]:null;
 for(const [index,item] of [example,extra].filter(Boolean).entries())if(item.sentence){
  steps.push({type:'explain',title:index?'换个场景，再用一次':'把词用在句子里',text:item.translation,sentence:item.sentence},...sentenceExercises(item.sentence,item.translation),{type:'speak',title:'把这句话说出来',en:item.sentence,zh:item.translation});
 }
 if(!steps.length)return toast('今天没有新的练习，可以去口语页面练一段对话。');
 begin({kind:'words',memoryVersion:1,title,steps,wordKeys:[...review,...fresh].map(w=>keyOf(w.word)),isReview:review.length>0,id:course?.id||'daily'});
}
function begin(details){stopSpeech();stopRecording();session={...details,progressionVersion:2,index:0,firstTry:0,wrong:[]};state.session=structuredClone(session);save();renderStep();if(!dialog.open)dialog.showModal();}
function guardSession(proceed){
 if(!state.session)return proceed();
 dialog.style.removeProperty('width');
 $('#lesson-mode').textContent='有一段未完成的练习';$('#lesson-progress-bar').style.width='0%';
 $('#lesson-content').innerHTML=`<div class="lesson-body"><h2 id="lesson-title">接着上次，还是开始新的？</h2><p class="lesson-help">${esc(state.session.title)} · 已走到第 ${state.session.index+1} 步。开始新练习会替换这段未完成的进度，已完成记录不受影响。</p><div class="lesson-bottom"><button class="button secondary" id="replace-session">开始新练习</button><button class="button primary" id="resume-session">继续上次</button></div></div>`;
 if(!dialog.open)dialog.showModal();$('#replace-session').onclick=proceed;$('#resume-session').onclick=resumeSession;
}
function openCourse(id){if(!allowModuleCourse(id))return;guardSession(()=>launchCourse(id));}
function launchCourse(id){if(!allowModuleCourse(id))return;const course=allCourses().find(c=>c.id===id);if(course){const remaining=course.words.filter(w=>!state.cards[keyOf(w.word)]),list=remaining.length?remaining:course.words;return startWords(remaining.length?[]:list,remaining.length?list:[],course.title,course);}const g=grammar.find(c=>c.id===id);if(g)return begin({kind:'grammar',id,title:g.title,wordKeys:[],steps:[{type:'explain',title:g.title,text:g.explanation,sentence:g.sentence,translation:g.translation},...sentenceExercises(g.sentence,g.translation),...g.questions.map(q=>({type:'choice',title:q.prompt,...q}))]});const scene=scenes.find(c=>c.id===id);if(scene)return begin({kind:'speaking',id,title:scene.title,wordKeys:[],steps:scene.lines.map((line,i)=>({type:'speak',title:`${scene.title} · 第 ${i+1} 句`,...line}))});}
function resumeSession(){session=structuredClone(state.session);renderStep();if(!dialog.open)dialog.showModal();}
$('#start-lesson').onclick=()=>{if(state.session)return resumeSession();const p=plan();if(!p.review.length&&!p.fresh.length)return showView('speaking');startWords(p.review,p.fresh);};
$('#review-due').onclick=()=>{const due=dueWords(state,words).slice(0,15);if(!due.length)return toast('现在没有到期单词，可以在单词本选择主动复习。');guardSession(()=>startWords(due,[],'到期复习'));};
$('#alphabet-start').onclick=()=>guardSession(()=>begin({kind:'alphabet',id:'alphabet',title:'认识 26 个字母',wordKeys:[],steps:Array.from({length:26},(_,i)=>({type:'letter',word:String.fromCharCode(65+i),title:`字母 ${String.fromCharCode(65+i)}`}))}));
$('#close-lesson').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{if(dialog.open)return;stopSpeech();stopRecording();session=null;renderDashboard();});
// Measure fixed letter slots, so typing or checking answers never shifts the layout.
function fitLessonWriting(){
 const line=dialog.querySelector('.letter-sentence');
 dialog.style.removeProperty('width');
 if(!line||!dialog.open)return;
 line.style.setProperty('--writing-scale',1);
 const groups=[...line.querySelectorAll('.letter-word')];
 const letterGap=parseFloat(getComputedStyle(groups[0]).columnGap)||0;
 const wordGap=parseFloat(getComputedStyle(line).columnGap)||0;
 const widths=groups.map(group=>[...group.children].reduce((sum,child)=>sum+child.getBoundingClientRect().width,0)+Math.max(0,group.children.length-1)*letterGap);
 const natural=widths.reduce((sum,width)=>sum+width,0)+Math.max(0,widths.length-1)*wordGap;
 const frame=dialog.getBoundingClientRect().width-line.getBoundingClientRect().width;
 const limit=Math.min(960,document.documentElement.clientWidth-30);
 dialog.style.width=`${Math.min(limit,Math.max(600,Math.ceil(natural+frame+4)))}px`;
 const available=line.getBoundingClientRect().width-2;
 // Keep readable type: shrink a little to fit a row, otherwise wrap whole words.
 const minimum=matchMedia('(max-width:640px)').matches?0.88:0.8;
 const rowScale=available/natural;
 const longestScale=available/Math.max(...widths);
 const scale=Math.min(1,Math.max(minimum,rowScale>=minimum?rowScale:longestScale));
 line.style.setProperty('--writing-scale',scale);
}
window.addEventListener('resize',()=>requestAnimationFrame(fitLessonWriting));
function renderStep(){
 prepareLessonAudio();
 dialog.style.removeProperty('width');
 requestAnimationFrame(fitLessonWriting);
 stopRecording();answered=false;attempted=false;const step=session.steps[session.index];$('#lesson-mode').textContent=session.title;$('#lesson-progress-bar').style.width=`${session.index/session.steps.length*100}%`;
 const heading=step.type==='spell'?(step.key?'写出这个单词':'写出完整句子'):step.title;
 let content=`${step.progression?`<p class="exercise-stage">${esc(step.progression)}</p>`:''}<h2 id="lesson-title">${esc(heading||'认识一个新朋友')}</h2>`;
 if(step.type==='learn'||step.type==='letter'){
  const phonetic=step.type==='learn'?phoneticLabel(wordMap.get(step.key||keyOf(step.word))?.phonetic||step.phonetic):'';
  content+=`<p class="lesson-help">先听清楚，再跟着读。${step.type==='letter'?'左边是大写，右边是小写。':'不需要一次就记牢。'}</p><div class="learn-word"><h3>${esc(step.word)}${step.type==='letter'?` <span class="lowercase">${step.word.toLowerCase()}</span>`:''}</h3>${step.type==='learn'?`<p class="word-phonetic" lang="en">${esc(phonetic||'音标暂缺')}</p>`:''}<p class="definition word-meaning">${esc(step.meaning||'英语字母')}</p>${listening(step.word)}</div>`;
 }
 else if(step.type==='explain')content+=`<p class="grammar-explanation">${esc(step.text)}</p><div class="sentence-display">${esc(step.sentence)}</div>${step.translation?`<p>${esc(step.translation)}</p>`:''}${listening(step.sentence)}`;
 else if(step.type==='speak'&&step.partner)content+=`<p class="lesson-help">听对方说话，再根据中文意思自己回答。可以录音对照，不自动评分。</p><div class="sentence-display">${esc(step.partner)}</div>${listening(step.partner)}<p>轮到你：${esc(step.zh)}</p><details class="role-reference"><summary>查看参考表达</summary><div class="sentence-display">${esc(step.en)}</div>${listening(step.en)}</details><div class="recording-panel"><button class="button secondary" id="record-button">● 录下自己的回答</button><p id="record-status" role="status">说法可以不同，先试着表达。</p><audio id="record-playback" controls hidden></audio></div>`;
 else if(step.type==='speak')content+=`<p class="lesson-help">先听示范，然后自己说一次。录音只用于你自己对照。</p><div class="sentence-display">${esc(step.en)}</div><p>${esc(step.zh)}</p>${listening(step.en)}<div class="recording-panel"><button class="button secondary" id="record-button">● 录下自己说的</button><p id="record-status" role="status">需要麦克风权限；也可以不录音，直接跟读。</p><audio id="record-playback" controls hidden></audio><p class="quiet-note">不上传录音，不做自动发音评分。翻页后本段录音会清除。</p></div>`;
 else{
  content+=`<p class="lesson-help">${step.type==='listen'?(step.wholeAnswer?'先听声音，填完整个词后自动判断。答错会显示中文提示。':'先听声音，再逐个填写字母。标点已带上，无需输入。'):isFillStep(step)?'逐个填写字母，填对自动继续，橙色字母请重填。标点已带上。':'先试着回忆，答错会给你提示。'}</p>`;
  if(step.audioText)content+=`<div class="audio-passage">${step.audioText.match(/[^.!?]+[.!?]?/g).map((part,i)=>`<p>第 ${i+1} 句</p>${listening(part.trim())}`).join('')}<details><summary>需要帮助？查看原文和中文</summary><p>${esc(step.audioText)}</p><p>${esc(step.translation)}</p></details></div>`;
  if(step.type==='choice')content+=`<div class="options">${step.options.map((option,i)=>`<button class="option" data-option="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(option)}</button>`).join('')}</div>`;
  else if(isFillStep(step)){
   let blankIndex=0;const groups=[[]];
   for(const part of blankLayout(step)){if(/\s/.test(part.text)){if(groups.at(-1).length)groups.push([]);}else groups.at(-1).push(part);}
   const display=groups.filter(group=>group.length).map(group=>`<span class="letter-word">${group.map(part=>{if(!part.blank)return `<span class="${/[A-Za-z]/.test(part.text)?'visible-letter':'fixed-punctuation'}">${esc(part.text)}</span>`;const index=blankIndex++;return `<input class="inline-blank missing-letter" data-blank="${index}" aria-label="第 ${index+1} 个空缺字母" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="1">`;}).join('')}</span>`).join('');
   const chinese=step.type==='gap'?step.meaning:step.type==='sentence-gap'?step.translation:step.type==='listen'?(wordMap.get(step.key)?.meaning||''):step.title.replace(/^写出英语：/,'');
   content+=`${step.type==='listen'?listening(step.answer):''}<div id="answer-form"><div class="gap-card"><div class="letter-sentence">${display}</div><p class="word-meaning" ${step.type==='listen'&&!step.blankState?.attempted?'hidden':''}>${esc(chinese)}</p></div></div>`;
  }
  content+='<div id="feedback" class="feedback" role="status" hidden></div>';
  if(isFillStep(step))content+='<div id="answer-help" class="answer-help"></div>';
 }

 const question=['choice','gap','sentence-gap','spell','listen'].includes(step.type);content+=`<div class="lesson-bottom"><span>可以随时退出，下次继续。</span><button class="button primary" id="next-step" ${question?'hidden':''}>${step.type==='speak'?'我练过了，继续':step.type==='letter'?'认识了，继续':'继续'} →</button></div>`;
 $('#lesson-content').innerHTML=`<div class="lesson-body"><div class="lesson-kicker">${session.kind.toUpperCase()} · ${session.index+1} / ${session.steps.length}</div>${content}</div>`;$('#next-step').onclick=nextStep;
 document.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>checkAnswer(step.options[Number(b.dataset.option)],b));if(isFillStep(step))setupInlineBlanks(step);if($('#record-button'))$('#record-button').onclick=toggleRecording;dialog.scrollTop=0;if(dialog.open)($('.inline-blank:not([readonly])')||$('#answer-input')||$('.option')||$('#next-step'))?.focus();
}
function isFillStep(step){return ['gap','sentence-gap','spell','listen'].includes(step.type);}
function blankAnswers(step){return blankLayout(step).filter(part=>part.blank).map(part=>part.text);}
function persistBlankState(){state.session=structuredClone(session);save();}
function paintBlank(input,locked,wrong=false){
 input.readOnly=locked;input.tabIndex=locked?-1:0;input.classList.toggle('filled',locked);input.classList.toggle('blank-error',wrong);input.setAttribute('aria-invalid',String(wrong));
 input.setAttribute('aria-label',`第 ${Number(input.dataset.blank)+1} 个空缺${locked?'，已答对':''}`);
}
function setupInlineBlanks(step){
 const inputs=[...document.querySelectorAll('[data-blank]')],expected=blankAnswers(step);let old=step.blankState;
 // Convert saved whole-word sentence slots into individual letter slots once.
 if(old&&step.type==='sentence-gap'&&old.version!==2){const values=[],locked=[];step.missing.forEach((word,i)=>{const letters=[...(old.values?.[i]||'')].filter(c=>/[A-Za-z]/.test(c)),answer=[...word].filter(c=>/[A-Za-z]/.test(c));answer.forEach((_,j)=>{values.push(letters[j]||'');locked.push(Boolean(old.locked?.[i]));});});old={...old,values,locked,version:2};}
 const values=expected.map((_,i)=>typeof old?.values?.[i]==='string'?old.values[i]:''),locked=expected.map((answer,i)=>Boolean(old?.locked?.[i])&&normalize(values[i])===normalize(answer));
 step.blankState={version:2,values,locked,attempted:Boolean(old?.attempted),counted:Boolean(old?.counted),submitted:Boolean(old?.submitted),hintUsed:Boolean(old?.hintUsed),errors:expected.map((_,i)=>Math.max(0,Number(old?.errors?.[i])||0)),letterHint:old?.letterHint||'',answerViewed:Boolean(old?.answerViewed),answerVisible:Boolean(old?.answerVisible),retryQueued:Boolean(old?.retryQueued)};attempted=step.blankState.attempted;
 inputs.forEach((input,i)=>{
  input.value=locked[i]?expected[i]:values[i];paintBlank(input,locked[i],Boolean(old?.submitted&&!locked[i]&&values[i]));
  const acceptLetter=event=>{
   if(input.readOnly||event.isComposing||session?.steps[session.index]!==step)return;
   input.value=input.value.replace(/[^a-z]/gi,'').slice(0,1);
   checkInlineBlanks(i);
  };
  input.addEventListener('input',acceptLetter);
  input.addEventListener('compositionend',acceptLetter);
  input.addEventListener('keydown',event=>{if(event.key==='Backspace'&&!input.value){[...inputs.slice(0,i)].reverse().find(x=>!x.readOnly)?.focus();}if(event.key==='ArrowRight'||event.key==='ArrowLeft'){const next=event.key==='ArrowRight'?inputs.slice(i+1).find(x=>!x.readOnly):[...inputs.slice(0,i)].reverse().find(x=>!x.readOnly);if(next){event.preventDefault();next.focus();next.select();}}});
  input.addEventListener('paste',event=>{if(input.readOnly)return;const text=event.clipboardData.getData('text'),parts=text.replace(/[^a-z]/gi,'').split('');if(!parts.length)return;event.preventDefault();const targets=inputs.slice(i).filter(x=>!x.readOnly);targets.forEach((target,j)=>{if(parts[j]===undefined)return;target.value=parts[j].slice(0,1);step.blankState.values[Number(target.dataset.blank)]=target.value;paintBlank(target,false);});checkInlineBlanks(i);});
 });
 if(locked.every(Boolean)){answered=true;const active=session;queueMicrotask(()=>{if(session===active&&session.steps[session.index]===step)nextStep();});}
 else if(old?.submitted&&values.some((value,i)=>value&&!locked[i])){$('#feedback').hidden=false;$('#feedback').className='feedback retry';$('#feedback').textContent='橙色字母还不正确，请重新填写。';}
 renderAnswerHelp(step);
}
function checkInlineBlanks(activeIndex=0){
 if(answered)return;const step=session.steps[session.index];if(step.blankState.answerVisible)return;const expected=blankAnswers(step),inputs=[...document.querySelectorAll('[data-blank]')],draft=step.blankState;
 const values=inputs.map((input,i)=>draft.locked[i]?expected[i]:input.value.trim()),result=gradeBlanks(expected,values,draft.locked);
 if(step.wholeAnswer&&!draft.attempted&&values.some(value=>!value)){
  draft.values=values;persistBlankState();
  const next=inputs.slice(activeIndex+1).find(input=>!input.value)||inputs.find(input=>!input.value);
  if(inputs[activeIndex].value)next?.focus();return;
 }
 result.wrong.forEach((wrong,i)=>{if(wrong&&(i===activeIndex||values[i]!==draft.values[i]||!draft.submitted))draft.errors[i]++;});
 if(result.wrong.some(Boolean)){draft.attempted=true;attempted=true;if(step.key&&!session.wrong.includes(step.key))session.wrong.push(step.key);}
 draft.values=values;draft.locked=result.locked;draft.submitted=true;
 if(step.type==='listen'){$('.gap-card .word-meaning').hidden=!draft.attempted;if(draft.attempted)draft.hintUsed=true;}
 inputs.forEach((input,i)=>{if(result.locked[i])input.value=expected[i];paintBlank(input,result.locked[i],result.wrong[i]);});
 const feedback=$('#feedback');feedback.hidden=!result.wrong.some(Boolean);feedback.className='feedback retry';
 if(result.complete){
  answered=true;if(!draft.attempted&&!draft.counted)session.firstTry++;draft.counted=true;
  return nextStep();
 }else{
  const wrongIndex=result.wrong.findIndex(Boolean);feedback.textContent=wrongIndex>=0?`第 ${wrongIndex+1} 个空缺字母再想一下，橙色位置可以直接重填。`:'';
  const target=!result.locked[activeIndex]?inputs[activeIndex]:inputs.slice(activeIndex+1).find(input=>!input.readOnly)||inputs.find(input=>!input.readOnly);
  target?.focus();target?.select();
 }
 renderAnswerHelp(step);persistBlankState();
}
function renderAnswerHelp(step){
 const draft=step.blankState,host=$('#answer-help');if(!host)return;
 const full=step.key?(wordMap.get(step.key)?.word||step.word||step.answer):(step.sentence||step.answer);
 const word=wordMap.get(step.key),translation=word?.meaning||step.translation||step.meaning||step.title.replace(/^写出英语：/,'');
 if(draft.answerVisible){
  document.querySelectorAll('[data-blank]').forEach(input=>{input.readOnly=true;input.tabIndex=-1;});
  host.innerHTML=`<div class="answer-reveal"><strong>${esc(full)}</strong>${word?.phonetic?`<p>${esc(phoneticLabel(word.phonetic))}</p>`:''}<p>${esc(translation)}</p>${listening(full)}<button class="button secondary" id="hide-answer">收起答案，重新练习</button><p class="quiet-note">这次已记录使用答案，不计为独立记住。${!step.retry?'稍后还会再练一次。':''}</p></div>`;
  $('#hide-answer').onclick=()=>{draft.answerVisible=false;draft.values=blankAnswers(step).map(()=>'');draft.locked=blankAnswers(step).map(()=>false);draft.submitted=false;draft.letterHint='';persistBlankState();renderStep();};return;
 }
 host.innerHTML=`${draft.letterHint?`<p class="letter-hint" role="status">${esc(draft.letterHint)}</p>`:''}<div class="help-actions">${draft.attempted?`<button class="text-button" data-speak="${esc(full)}" data-speed="slow">♪ 再听一次</button>`:''}${draft.errors.some(count=>count>=2)?'<button class="text-button" id="letter-hint">看一点提示</button>':''}<button class="text-button" id="reveal-answer">${draft.attempted?'看答案':'想不起来？看答案'}</button></div>`;
 const assisted=()=>{draft.attempted=true;draft.hintUsed=true;attempted=true;if(step.key&&!session.wrong.includes(step.key))session.wrong.push(step.key);if(step.type==='listen')$('.gap-card .word-meaning').hidden=false;};
 if($('#letter-hint'))$('#letter-hint').onclick=()=>{assisted();const index=draft.locked.findIndex(locked=>!locked);draft.letterHint=`第 ${index+1} 个空缺字母是 ${blankAnswers(step)[index]}，试着补回去。`;persistBlankState();renderAnswerHelp(step);};
 $('#reveal-answer').onclick=()=>{
  assisted();draft.answerViewed=true;draft.answerVisible=true;
  if(!draft.retryQueued&&!step.retry){
   const retry=step.key?{type:'listen',title:'再听一次，试着回忆这个词。',key:step.key,answer:full,wholeAnswer:true}:{...step};
   delete retry.blankState;retry.retry=true;retry.progression='再回忆一次 · 看过答案后重新练习';
   session.steps.splice(Math.min(session.index+3,session.steps.length),0,retry);draft.retryQueued=true;
  }
  persistBlankState();renderAnswerHelp(step);
 };
}
function checkAnswer(value,button){
 if(answered||!value.trim())return;const step=session.steps[session.index],correct=normalize(value)===normalize(step.answer),feedback=$('#feedback');feedback.hidden=false;feedback.className=`feedback ${correct?'':'retry'}`;
 if(correct){answered=true;if(!attempted)session.firstTry++;return nextStep();}
 else{attempted=true;if(step.key&&!session.wrong.includes(step.key))session.wrong.push(step.key);feedback.textContent=step.explanation||`答案是 ${step.answer}。再试一次。`;button?.classList.add('wrong');if($('#answer-input')){$('#answer-input').setAttribute('aria-invalid','true');$('#answer-input').focus();$('#answer-input').select();}}
}
function nextStep(){stopSpeech();stopRecording();session.index++;if(session.index>=session.steps.length)return finishSession();state.session=structuredClone(session);save();renderStep();}
function finishSession(){
 dialog.style.removeProperty('width');
 const done=session,today=dayKey();recentlyLearned=new Set(done.wordKeys.filter(key=>!state.cards[key]));if(done.kind==='words'){for(const key of done.wordKeys){const checks=done.steps.filter(step=>step.key===key&&step.wholeAnswer),evidence={independent:checks.some(step=>step.blankState?.counted&&!step.blankState.attempted),hinted:done.steps.some(step=>step.key===key&&(step.blankState?.hintUsed||step.type==='listen'&&step.blankState?.attempted)),answerViewed:done.steps.some(step=>step.key===key&&step.blankState?.answerViewed)};state.cards[key]=scheduleMemoryCard(state.cards[key],done.wrong.includes(key),evidence);}if(done.isReview)state.reviews++;}
 if(done.kind==='listening'&&!state.listenings.includes(done.id))state.listenings.push(done.id);
 if(done.kind==='grammar'&&!state.grammar.includes(done.id))state.grammar.push(done.id);if(done.kind==='speaking'&&!state.scenes.includes(done.id))state.scenes.push(done.id);if(done.kind==='alphabet')state.alphabet=Array.from({length:26},(_,i)=>String.fromCharCode(65+i));
 if(!state.dates.includes(today))state.dates.push(today);state.session=null;save();renderDashboard();$('#lesson-progress-bar').style.width='100%';const questions=done.steps.filter(s=>['choice','gap','sentence-gap','spell','listen'].includes(s.type)).length;
 $('#lesson-content').innerHTML=`<div class="lesson-body"><div class="result-symbol">✳</div><h2 id="lesson-title">今天又前进了一点。</h2><p class="lesson-help">已完成：${esc(done.title)}</p><div class="result-summary"><div><strong>${done.kind==='words'?done.wordKeys.length:done.steps.length}</strong><span>${done.kind==='words'?'个单词已练习':'个步骤已完成'}</span></div>${questions?`<div><strong>${done.firstTry} / ${questions}</strong><span>题首次回答正确</span></div>`:''}</div><div class="feedback">${done.kind==='words'?'复习时间已经安排好了。答错的词会更早与你见面。':'可以回到课程列表继续，也可以明天再来。'}</div><p class="lesson-help">${storageAvailable?'记录已保存在当前浏览器。':'保存失败，请到设置导出备份。'}${done.kind==='speaking'?'<br>完成记录表示你练过了，不代表发音已经达标。':''}</p><button class="button primary full-width" id="finish-lesson">收好今天的进步 ✓</button></div>`;session=null;$('#finish-lesson').onclick=()=>{dialog.close();showView(done.kind==='words'?'words':done.kind==='grammar'?'grammar':done.kind==='speaking'?'speaking':done.kind==='listening'?'listening':'home');};$('#finish-lesson').focus();
}

let recorder=null,recordStream=null,recordUrl=null,recordTimer=null,recordToken=0;
function stopRecording(){recordToken++;clearTimeout(recordTimer);if(recorder?.state==='recording')recorder.stop();recordStream?.getTracks().forEach(t=>t.stop());recordStream=null;recorder=null;if(recordUrl){URL.revokeObjectURL(recordUrl);recordUrl=null;}}
async function toggleRecording(){
 if(recorder?.state==='recording'){recorder.stop();return;}if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return toast('当前浏览器不支持录音，可以直接跟读，或用较新的 Chrome 打开。');stopSpeech();stopRecording();const token=recordToken,button=$('#record-button');button.disabled=true;
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(token!==recordToken){stream.getTracks().forEach(t=>t.stop());return;}recordStream=stream;recorder=new MediaRecorder(stream);const chunks=[],activeRecorder=recorder;recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());clearTimeout(recordTimer);if(token!==recordToken)return;recordUrl=URL.createObjectURL(new Blob(chunks,{type:activeRecorder.mimeType}));$('#record-playback').src=recordUrl;$('#record-playback').hidden=false;button.textContent='● 重新录一次';$('#record-status').textContent='录好了，播放听听自己的声音。';};recorder.start();button.textContent='■ 停止录音';$('#record-status').textContent='正在录音…最多 30 秒。';recordTimer=setTimeout(()=>{if(recorder?.state==='recording')recorder.stop();},30000);}catch{if(token===recordToken)toast('没有获得麦克风权限。你仍然可以听示范并跟读。');}finally{button.disabled=false;}
}
$('#daily-target').onchange=e=>{state.settings.daily=Number(e.target.value);save();renderDashboard();toast('每日目标已更新，已学记录保持不变。');};
$('#export-progress').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`一点英语-学习备份-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import-progress').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 try{if(file.size>5*1024*1024)throw Error('备份文件过大，最多支持 5 MB。');const candidate=validateState(JSON.parse(await file.text()));$('#import-preview').hidden=false;$('#import-preview').innerHTML=`<p>备份包含 ${Object.keys(candidate.cards).length} 个已学词、${candidate.dates.length} 天记录。确认后替换当前进度。</p><button class="button primary" id="confirm-import">确认恢复此备份</button><button class="text-button" id="cancel-import">取消</button>`;$('#cancel-import').onclick=()=>$('#import-preview').hidden=true;$('#confirm-import').onclick=()=>{try{localStorage.setItem('a-little-english-before-restore',JSON.stringify(state));}catch{return toast('无法备份原记录，未执行恢复。');}state=candidate;save();location.reload();};}catch(error){toast(error.message||'无法读取这个备份文件。');}finally{e.target.value='';}
};
async function init(){try{if(location.protocol==='file:')throw Error('请双击「启动英语学习.command」或运行启动命令，用 localhost 地址访问。新版需要本地服务。');const [cr,mr,er]=await Promise.all([fetch('data/core.json'),fetch('data/manifest.json'),fetch('data/exams.json')]);if(!cr.ok||!mr.ok||!er.ok)throw Error('词库未加载，请运行启动脚本完成初始化。');const core=await cr.json();manifest=await mr.json();buildWords(core,await er.json());initCollections();upgradePendingSession();loaded=true;save();renderDashboard();renderActivities();$('#dictionary-description').textContent=`完整收录本次 ECDICT 数据的 ${fmt(manifest.dictionaryCount)} 个词条，包括词形、短语和专业词。英语按前缀、中文按释义查询。`;}catch(error){$('#load-error').hidden=false;$('#load-error').textContent=error.message;$('#start-lesson').disabled=true;}}
init();

let activeReading=null,readingLookup=0,readingEntry=null;
const readingDialog=$('#reading-word-dialog');
function readingText(text){return text.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map(part=>/^[A-Za-z]/.test(part)?`<button class="reading-token ${state.readingWords.some(w=>keyOf(w.word)===keyOf(part))?'is-saved':''}" data-reading-word="${esc(part)}">${esc(part)}</button>`:esc(part)).join('');}
function renderReading(){
 const level=$('#reading-level').value;$('#reading-summary').textContent=`共 ${readings.length} 篇 · ${readings.reduce((sum,item)=>sum+item.questions.length,0)} 道理解题 · 每阶段 ${readings.filter(item=>item.level==='入门').length} 篇`;
 $('#reading-list').innerHTML=orderedLessons(readings).filter(item=>level==='all'||item.level===level).map(item=>`<article class="course-card"><span class="course-status">${state.readingProgress[item.id]?.completed?'已完成 ✓':item.level}</span><h2>${esc(item.title)}</h2><p>${item.text.match(/[A-Za-z]+/g).length} 词 · ${item.questions.length} 道理解题${item.focus?`<br>${esc(item.focus)}`:''}</p><button class="button secondary" data-reading-open="${item.id}">开始阅读 →</button></article>`).join('');
 if(activeReading)renderReadingArticle();renderReadingNotebook();refreshModuleLocks('reading');
}
function renderReadingArticle(){
 const item=readings.find(r=>r.id===activeReading);if(!item)return;
 const progress=state.readingProgress[item.id]||{answers:[]};
 $('#reading-article').innerHTML=`<article class="reading-paper"><div class="eyebrow">${item.level} · 点击单词可查词</div><h2>${esc(item.title)}</h2><p class="quiet-note">${esc(item.source||'原创分级阅读')}</p><p class="reading-passage" lang="en">${readingText(item.text)}</p><details><summary>阅读后查看中文参考</summary><p class="reading-translation">${esc(item.translation)}</p></details><h3>读懂了吗？</h3>${item.questions.map((q,i)=>{const choice=progress.answers[i],done=choice===q.answer;return `<fieldset class="reading-question"><legend>${q.skill?`<span class="reading-skill">${esc(q.skill)}</span> `:''}${i+1}. ${esc(q.prompt)}</legend><div class="options">${q.options.map((option,j)=>`<button class="option ${choice===j?(done?'correct':'wrong'):''}" data-reading-question="${i}" data-reading-option="${j}" ${done?'disabled':''}>${esc(option)}</button>`).join('')}</div>${Number.isInteger(choice)?`<p class="reading-evidence" role="status">${done?'找到依据了：':'再读这句话，试一次：'}${esc(q.evidence)}</p>${done&&q.explanation?`<p class="reading-explanation">解题思路：${esc(q.explanation)}</p>`:''}`:''}</fieldset>`;}).join('')}<p class="reading-complete" role="status">${progress.completed?'本篇理解题已完成。收藏的生词可以继续学习。':'读完后完成理解题，再复习收藏的生词。'}</p></article>`;
}
function renderReadingNotebook(){
 $('#open-reading-notebook').textContent=`阅读生词本 · ${state.readingWords.length}`;
 $('#reading-notebook').innerHTML=`<div class="page-heading"><h2>阅读生词本 <small>${state.readingWords.length} 词</small></h2><p>收藏的词会优先进入每日新词安排；也可以现在开始学习。不会因为收藏就标记为已学。</p></div>${state.readingWords.length?'<button class="button primary" id="study-reading-words">学习这些生词（最多 10 个）</button>':'<p class="quiet-note">遇到不认识的词，点击它，再选择“记入阅读生词本”。</p>'}<div class="book-grid">${state.readingWords.map(w=>{const key=keyOf(w.word),card=state.cards[key];return `<article class="book-card"><h3>${esc(w.word)}</h3><p>${esc(phoneticLabel(w.phonetic))}</p><p class="definition">${esc(w.meaning)}</p>${listening(w.word)}<p class="quiet-note">${card?statusLabels[wordStatus(card)]:'已收藏 · 待学习'} · 来源：${w.sources.map(id=>`<button class="text-button" data-reading-open="${id}">${esc(readings.find(r=>r.id===id)?.title||id)}</button>`).join('、')}</p><button class="text-button" data-study-word="${esc(key)}">${card?'再练一次':'学习这个词'} →</button> <button class="text-button" data-reading-remove="${esc(key)}">取消收藏</button></article>`;}).join('')}</div>`;
}
function renderReadingWord(entry,message=''){
 readingEntry=entry;
 const saved=state.readingWords.find(w=>keyOf(w.word)===keyOf(entry.word));
 $('#reading-word-content').innerHTML=`<h2 id="reading-word-title">${esc(entry.word)}</h2><p>${esc(phoneticLabel(entry.phonetic)||'音标暂缺')}</p>${listening(entry.word)}<p class="definition">${esc(entry.meaning||message||'正在查找释义…')}</p><p class="quiet-note">${entry.context?'短文中的意思或词形提示':'词典释义，具体意思请结合原句'}</p><button class="button primary" id="save-reading-word" ${!entry.meaning?'disabled':''}>${saved?.sources.includes(activeReading)?'✓ 已记入本篇生词':'记入阅读生词本'}</button>${message?`<p role="status">${esc(message)}</p>`:''}`;
}
async function openReadingWord(text){
 const request=++readingLookup,item=readings.find(r=>r.id===activeReading);if(!item)return;
 const local=wordMap.get(keyOf(text)),note=item.notes?.[keyOf(text)];
 const entry={word:text,meaning:note||local?.meaning||'',phonetic:local?.phonetic||'',context:Boolean(note)};
 renderReadingWord(entry);if(!readingDialog.open)readingDialog.showModal();
 if(entry.meaning&&entry.phonetic)return;
 try{const response=await fetch(`/api/dictionary?${new URLSearchParams({q:text})}`);if(!response.ok)throw Error('查词暂时不可用');const data=await response.json();if(request!==readingLookup||!readingDialog.open)return;
  const exact=data.items.find(w=>keyOf(w.word)===keyOf(text));
  if(exact){entry.meaning=note||exact.translation||entry.meaning;entry.phonetic=exact.phonetic||entry.phonetic;}
  renderReadingWord(entry,entry.meaning?'':'暂未找到这个词的准确释义，可在完整词典继续查询。');
 }catch{if(request===readingLookup&&readingDialog.open)renderReadingWord(entry,entry.meaning?'完整词典暂时不可用，已显示现有释义。':'查词暂时不可用，请关闭后重试。');}
}
$('#close-reading-word').onclick=()=>readingDialog.close();readingDialog.addEventListener('close',()=>{readingLookup++;stopSpeech();});
$('#reading-level').onchange=renderReading;
$('#open-reading-notebook').onclick=()=>$('#reading-notebook').scrollIntoView({behavior:'smooth',block:'start'});
document.addEventListener('click',event=>{
 const open=event.target.closest('[data-reading-open]');if(open){if(!allowLesson('reading',open.dataset.readingOpen))return;activeReading=open.dataset.readingOpen;renderReadingArticle();$('#reading-article').scrollIntoView({behavior:'smooth',block:'start'});}
 const word=event.target.closest('[data-reading-word]');if(word)openReadingWord(word.dataset.readingWord);
 if(event.target.closest('#save-reading-word')&&readingEntry?.meaning){
  const entry=readingEntry,key=keyOf(entry.word);let saved=state.readingWords.find(w=>keyOf(w.word)===key);
  if(!saved){saved={word:entry.word,meaning:entry.meaning,phonetic:entry.phonetic,sources:[],added:dayKey()};state.readingWords.push(saved);}
  if(!saved.sources.includes(activeReading))saved.sources.push(activeReading);
  if(!wordMap.has(key)){const custom={word:entry.word,meaning:entry.meaning,phonetic:entry.phonetic,collections:['general']};state.custom.push(custom);wordMap.set(key,custom);words.push(custom);}
  save();renderReadingWord(entry);renderReading();renderDashboard();
 }
 const remove=event.target.closest('[data-reading-remove]');if(remove){state.readingWords=state.readingWords.filter(w=>keyOf(w.word)!==remove.dataset.readingRemove);save();renderReading();renderDashboard();}
 const option=event.target.closest('[data-reading-question]');if(option){const item=readings.find(r=>r.id===activeReading),i=Number(option.dataset.readingQuestion),answer=Number(option.dataset.readingOption);if(!item||!item.questions[i])return;const progress=state.readingProgress[item.id]||{answers:[],completed:null};progress.answers[i]=answer;if(item.questions.every((q,j)=>progress.answers[j]===q.answer))progress.completed=dayKey();state.readingProgress[item.id]=progress;save();renderReading();}
 if(event.target.closest('#study-reading-words')){const all=state.readingWords.map(w=>wordMap.get(keyOf(w.word))).filter(Boolean),pending=all.filter(w=>!state.cards[keyOf(w.word)]||state.cards[keyOf(w.word)].due<=dayKey()),list=(pending.length?pending:all).slice(0,10);guardSession(()=>startWords(list.filter(w=>state.cards[keyOf(w.word)]),list.filter(w=>!state.cards[keyOf(w.word)]),'阅读生词练习'));}
 const role=event.target.closest('[data-role-scene]');if(role){const scene=scenes.find(s=>s.id===role.dataset.roleScene);if(scene?.roleplay&&allowLesson('speaking',scene.id))guardSession(()=>begin({kind:'speaking',id:scene.id,title:`对话练习 · ${scene.title}`,wordKeys:[],steps:scene.lines.filter((_,i)=>i%2===1).map((line,i)=>({type:'speak',title:`轮到你回答 · ${i+1}`,partner:scene.lines[i*2].en,en:line.en,zh:line.zh}))}));}
});

function renderListeningList(){
 const list=orderedLessons(listeningLessons).filter(item=>$('#listening-level').value==='all'||item.level===$('#listening-level').value);
 $('#listening-count').textContent=`${list.length} 组听力`;
 $('#listening-grid').innerHTML=list.map(item=>`<article class="course-card"><span class="course-status">${state.listenings.includes(item.id)?'已练习 ✓':item.level}</span><h2>${esc(item.title)}</h2><p>${item.questions.length} 道理解题 · 原文默认隐藏</p><button class="button primary" data-listening-course="${item.id}">听音答题 →</button></article>`).join('');refreshModuleLocks('listening');
}
document.querySelectorAll('.stage-filter').forEach(select=>{select.innerHTML='<option value="all">全部阶段</option>'+studyLevels.map(level=>`<option>${level}</option>`).join('');select.onchange=renderActivities;});
document.addEventListener('click',event=>{const button=event.target.closest('[data-listening-course]');if(!button)return;const item=listeningLessons.find(item=>item.id===button.dataset.listeningCourse);if(item&&allowLesson('listening',item.id))guardSession(()=>begin({kind:'listening',id:item.id,title:`听力理解 · ${item.title}`,wordKeys:[],steps:item.questions.map(q=>({type:'choice',title:q.prompt,audioText:item.text,translation:item.translation,options:q.options,answer:q.options[q.answer],explanation:`回听原句：${q.evidence}`}))}));});

function moduleCurriculum(name){
 return name==='grammar'?{items:grammar,done:state.grammar}:name==='speaking'?{items:scenes,done:state.scenes}:name==='listening'?{items:listeningLessons,done:state.listenings}:{items:readings,done:Object.keys(state.readingProgress).filter(id=>state.readingProgress[id].completed)};
}
function allowLesson(name,id){const {items,done}=moduleCurriculum(name),access=lessonAccess(items,done,id);if(!access.allowed)toast(access.prerequisite?`请先完成「${access.prerequisite.title}」，再继续后面的课程。`:'课程暂不可用。');return access.allowed;}
function allowModuleCourse(id){return id.startsWith('grammar-')?allowLesson('grammar',id):id.startsWith('scene-')?allowLesson('speaking',id):true;}
function refreshModuleLocks(name){
 const {items,done}=moduleCurriculum(name),ordered=orderedLessons(items),root=$(`#${name==='reading'?'reading-list':name+'-grid'}`),select=$(`#${name}-level`);
 for(const option of select.options){if(option.value==='all')continue;option.setAttribute('value',option.value);const group=ordered.filter(item=>item.level===option.value),open=group.some(item=>lessonAccess(items,done,item.id).allowed);option.disabled=!open;option.textContent=`${option.value} · ${group.filter(item=>done.includes(item.id)).length}/${group.length}${open?'':' · 未解锁'}`;}
 for(const card of root.querySelectorAll('article')){
  const button=card.querySelector('[data-course],[data-reading-open],[data-listening-course]');if(!button)continue;
  const id=button.dataset.course||button.dataset.readingOpen||button.dataset.listeningCourse,access=lessonAccess(items,done,id);
  card.classList.toggle('course-locked',!access.allowed);
  if(!access.allowed){card.querySelectorAll('button').forEach(button=>button.disabled=true);const note=document.createElement('p');note.className='unlock-note';note.textContent=`未解锁 · 先完成「${access.prerequisite?.title||'前面的课程'}」`;card.append(note);}
 }
 let progress=$(`#${name}-unlock-progress`);if(!progress){progress=document.createElement('p');progress.id=`${name}-unlock-progress`;progress.className='unlock-progress';root.before(progress);}
 const next=ordered.find(item=>!done.includes(item.id));progress.textContent=next?`按阶段依次学习 · 已完成 ${ordered.filter(item=>done.includes(item.id)).length}/${items.length} · 下一课：${next.level}「${next.title}」`:'本模块已全部完成，可以自由复习。';
}
