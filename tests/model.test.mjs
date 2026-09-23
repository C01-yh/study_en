import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshState,migrateV1,scheduleCard,dueWords,newWords,validateState,normalize,addDays,letterGap,phoneticLabel,letterStages,sentenceStages,collectionWords,wordStatus,gradeBlanks,blankLayout} from '../model.mjs';
import {topics,grammar,scenes,readings,studyLevels,listeningLessons} from '../curriculum.js';

test('old three-word progress migrates without inventing mastery',()=>{
 const state=migrateV1({completed:true,dates:['2026-09-20'],lastPractice:'2026-09-20',reviews:2});
 assert.deepEqual(Object.keys(state.cards),['i','want','water']);assert.equal(state.cards.water.stage,0);assert.equal(state.cards.water.due,'2026-09-21');assert.equal(state.reviews,2);
});
test('reviews advance across dates, never by repeating on the same day',()=>{
 let card=scheduleCard(null,false,'2026-09-20');assert.equal(card.due,'2026-09-21');
 card=scheduleCard(card,false,'2026-09-20');assert.equal(card.stage,0);
 card=scheduleCard(card,false,'2026-09-21');assert.equal(card.stage,1);assert.equal(card.due,'2026-09-24');
 card=scheduleCard(card,true,'2026-09-24');assert.equal(card.stage,0);assert.equal(card.due,'2026-09-25');assert.equal(card.mistakes,1);
});
test('daily plan excludes learned words and includes due cards',()=>{
 const state=freshState(),words=[{word:'I'},{word:'water'},{word:'tea'}];state.cards.i=scheduleCard(null,false,'2026-09-20');
 assert.deepEqual(newWords(state,words,1),[{word:'water'}]);assert.deepEqual(dueWords(state,words,'2026-09-21'),[{word:'I'}]);
});
test('backup validation strips active sessions and malformed fields',()=>{
 const state=freshState();state.cards.water=scheduleCard(null,false,'2026-09-20');state.settings.daily=999;state.settings.voice='unknown';state.session={steps:['invalid']};
 const result=validateState(state);assert.equal(result.settings.daily,5);assert.equal(result.settings.voice,'jenny');assert.equal(result.session,null);assert.equal(result.cards.water.due,'2026-09-21');assert.throws(()=>validateState({version:1}));
});
test('every course has usable content; dictionary core is complete and unique',()=>{
 assert.equal(topics.length,30);assert.equal(grammar.length,24);assert.equal(scenes.length,24);
 assert.equal(new Set(topics.flatMap(t=>t.words.map(w=>w.word.toLowerCase()))).size,150);
 for(const t of topics){assert.equal(t.words.length,5);assert(t.sentence&&t.translation);}
 for(const g of grammar)for(const q of g.questions){assert(q.options.includes(q.answer));assert.equal(q.options.length,new Set(q.options).size);}
 const core=JSON.parse(fs.readFileSync(new URL('../data/core.json',import.meta.url)));assert.equal(core.length,6000);assert.equal(new Set(core.map(w=>w.word)).size,6000);assert(core.every(w=>w.word&&w.meaning));
});
test('normalization and date rollover',()=>{assert.equal(normalize(' I  want water. '),'i want water');assert.equal(addDays('2026-12-31',1),'2027-01-01');});
test('letter gaps preserve context and reconstruct the original word',()=>{
 for(const word of ['am','tea','water','please','understand','international']){
  const gap=letterGap(word);let i=0;assert.equal(gap.masked.replace(/_/g,()=>gap.answer[i++]),word);
  assert.equal(gap.answer.length,word.length<7?1:2);assert(gap.masked.replace(/_/g,'').length>0);
 }
 assert.deepEqual(letterGap('water'),{masked:'wa_er',answer:'t'});
 for(const word of ['I','a','ice cream','well-known',"don't"])assert.equal(letterGap(word),null);
});
test('phonetic labels normalize source notation without inventing missing sounds',()=>{
 assert.equal(phoneticLabel('pli:z'),'/pliːz/');assert.equal(phoneticLabel("'wɒ:tә"),'/ˈwɒːtə/');
 assert.equal(phoneticLabel('/pliːz/'),'/pliːz/');assert.equal(phoneticLabel(''),'');
 assert.equal(topics[0].words.find(w=>w.word==='please').phonetic,'pliːz');
});
test('letter stages progressively hide more letters and never remove all context',()=>{
 for(const word of ['am','tea','four','water','please','understand']){
  const stages=letterStages(word);let previous=0;
  for(const stage of stages){let index=0;assert(stage.answer.length>previous);assert(stage.answer.length<word.length);assert.equal(stage.masked.replace(/_/g,()=>stage.answer[index++]),word);previous=stage.answer.length;}
  assert.equal(new Set(stages.map(s=>s.masked)).size,stages.length);
 }
 assert.deepEqual(letterStages('please').map(s=>s.answer.length),[1,2,3]);
 assert.deepEqual(letterStages('water').map(s=>s.masked),['wa_er','w__er','_a_e_']);
 assert.equal(letterStages('am').length,1);assert.equal(letterStages('I').length,0);
 assert.equal(letterStages('ice cream').length,0);
});
test('sentence stages preserve punctuation, contractions and visible context',()=>{
 for(const sentence of ['I want water.','Hello, Sam!','I don’t like coffee.','This is a well-known book.']){
  const stages=sentenceStages(sentence);let previous=0;
  for(const stage of stages){assert.equal(stage.parts.map(p=>p.text).join(''),sentence);assert(stage.missing.length>previous);assert(stage.parts.some(p=>!p.blank&&/[A-Za-z]/.test(p.text)));assert.equal(stage.answer,stage.missing.join(' '));previous=stage.missing.length;}
 }
 const stages=sentenceStages('I want water.');assert.deepEqual(stages.map(s=>s.answer),['water','want water']);assert.equal(sentenceStages('Hello!').length,0);assert.equal(sentenceStages('Thank you.').length,1);
});
test('exam collection counts match the complete source export',()=>{
 const exams=JSON.parse(fs.readFileSync(new URL('../data/exams.json',import.meta.url))),manifest=JSON.parse(fs.readFileSync(new URL('../data/manifest.json',import.meta.url)));
 assert.equal(exams.length,manifest.examUniqueCount);assert.equal(new Set(exams.map(w=>w.word.toLowerCase())).size,exams.length);
 for(const [tag,count] of Object.entries(manifest.examCounts))assert.equal(exams.filter(w=>w.tags.split(/\s+/).includes(tag)).length,count);
 assert.equal(manifest.examCounts.cet4,3849);assert.equal(manifest.examCounts.cet6,5407);
});
test('overlapping collections share card progress and source tags match exactly',()=>{
 const words=[{word:'water',collections:['cet4','cet6']},{word:'special',collections:['cet6']}];
 assert.equal(collectionWords(words,'cet4').length,1);assert.equal(collectionWords(words,'cet6').length,2);assert.equal(collectionWords(words,'all').length,2);
 const card=scheduleCard(null,false,'2026-09-20');assert.equal(wordStatus(card,'2026-09-20'),'learned');assert.equal(wordStatus(card,'2026-09-21'),'due');assert.equal(wordStatus({...card,mistakes:1},'2026-09-21'),'mistakes');assert.equal(wordStatus(null),'new');
 const state=freshState();state.settings.collection='cet6';state.cards['b.c.']=card;const restored=validateState(state);assert.equal(restored.settings.collection,'cet6');assert(restored.cards['b.c.']);state.settings.collection='nonexistent';assert.equal(validateState(state).settings.collection,'general');
});
test('inline blanks retain each correct answer while allowing partial and empty submissions',()=>{
 let result=gradeBlanks(['a','s'],['A','z']);assert.deepEqual(result.locked,[true,false]);assert.deepEqual(result.wrong,[false,true]);assert.equal(result.complete,false);
 result=gradeBlanks(['a','s'],['','s'],result.locked);assert.equal(result.complete,true);assert.equal(result.correct,2);
 result=gradeBlanks(['want','water'],['want','']);assert.deepEqual(result.locked,[true,false]);assert.deepEqual(result.wrong,[false,false]);
 assert.equal(gradeBlanks(['want','water'],['want','Water'],result.locked).complete,true);
 assert.equal(gradeBlanks(['don’t'],["don't"]).complete,true);
});
test('every writing blank is one letter; punctuation and spaces remain fixed',()=>{
 const full={type:'spell',answer:"I don't want water, please!"},layout=blankLayout(full);
 assert.equal(layout.map(p=>p.text).join(''),full.answer);assert.equal(layout.filter(p=>p.blank).length,full.answer.replace(/[^a-z]/gi,'').length);
 assert(layout.filter(p=>p.blank).every(p=>p.text.length===1&&/[a-z]/i.test(p.text)));
 assert.equal(layout.filter(p=>!p.blank).map(p=>p.text).join('')," '  , !");
 const partial=blankLayout({type:'sentence-gap',parts:[{text:'I ',blank:false},{text:'want',blank:true},{text:' water.',blank:false}]});assert.equal(partial.filter(p=>p.blank).map(p=>p.text).join(''),'want');
 assert.deepEqual(blankLayout({type:'gap',masked:'wa_er',answer:'t'}).map(p=>p.blank),[false,false,true,false,false]);
});

test('memory evidence requires distinct later days and survives backup; hints never count',async()=>{
 const {scheduleMemoryCard,memoryVerified}=await import('../model.mjs');
 let card=scheduleMemoryCard(null,false,{independent:true},'2026-09-20');assert.equal(card.independentDays,0);
 card=scheduleMemoryCard(card,false,{independent:true},'2026-09-20');assert.equal(card.independentDays,0);
 for(const [date,count] of [['2026-09-21',1],['2026-09-24',2],['2026-10-01',3]]){card=scheduleMemoryCard(card,false,{independent:true},date);assert.equal(card.independentDays,count);const again=scheduleMemoryCard(card,false,{independent:true},date);assert.equal(again.independentDays,count);assert.equal(again.due,card.due);}
 assert.equal(memoryVerified(card),true);
 const state=freshState();state.cards.water=card;assert.deepEqual(validateState(state).cards.water,card);
 card=scheduleMemoryCard(card,true,{hinted:true},'2026-10-15');assert.equal(memoryVerified(card),false);assert.equal(card.independentDays,0);assert.equal(card.hintUses,1);assert.equal(card.due,'2026-10-16');
 card=scheduleMemoryCard(card,false,{independent:true},'2026-10-15');assert.equal(card.independentDays,0);
 const legacy={stage:4,due:'2026-09-20',last:'2026-09-19',added:'2026-09-01',mistakes:0,lapses:0};
 assert.equal(memoryVerified(legacy),false);const assisted=scheduleMemoryCard(legacy,false,{},'2026-09-20');assert.equal(assisted.independentDays,0);assert.equal(assisted.due,'2026-09-21');
});
test('new words are practiced before separated recall; reviews start without answer exposure',async()=>{
 const {memoryLessonSteps}=await import('../model.mjs');const fresh=[{word:'water'},{word:'tea'},{word:'milk'}],review=[{word:'please'}];
 const steps=memoryLessonSteps(review,fresh,w=>[{type:'learn',key:w.word},{type:'gap',key:w.word},{type:'listen',key:w.word}]);
 assert.equal(steps[0].wholeAnswer,true);assert.equal(steps[0].key,'please');assert.equal(steps[0].assessment,'review');
 const recall=steps.filter(s=>s.assessment==='delayed');assert.deepEqual(recall.map(s=>s.key),['water','tea','milk']);
 for(const step of recall){const lastPractice=steps.findLastIndex(s=>s.key===step.key&&!s.assessment);assert(steps.slice(lastPractice+1,steps.indexOf(step)).some(s=>s.key!==step.key));}
 assert.equal(steps.filter(s=>s.type==='listen').length,4);
});

test('readings and speaking roles have complete original content',()=>{
 assert.equal(readings.length,32);assert.deepEqual([...new Set(readings.map(r=>r.level))],['入门','基础','中级','高级']);
 for(const item of readings){assert(item.text&&item.translation);assert(item.questions.length>=2);for(const q of item.questions){assert(q.options[q.answer]);assert(q.evidence);}}
 assert.equal(scenes.filter(s=>s.roleplay).length,16);for(const scene of scenes.filter(s=>s.roleplay)){assert.equal(scene.lines.length%2,0);assert(scene.lines.every(l=>l.en&&l.zh));}
});
test('reading notebook and answers survive validated backups without marking words learned',()=>{
 const state=freshState();state.readingWords=[{word:'cup',meaning:'杯子',phonetic:'kʌp',sources:['read-1','read-1'],added:'2026-09-23'}];state.readingProgress={'read-1':{answers:[0,1],completed:'2026-09-23'}};
 const restored=validateState(state);assert.equal(restored.readingWords.length,1);assert.deepEqual(restored.readingWords[0].sources,['read-1']);assert.deepEqual(restored.readingProgress,state.readingProgress);assert.equal(restored.cards.cup,undefined);
 assert.deepEqual(validateState({...state,readingWords:undefined,readingProgress:undefined}).readingWords,[]);
});

test('all four stages have reading, grammar, speaking and playable listening content',()=>{
 for(const level of studyLevels){for(const pool of [readings,grammar,scenes,listeningLessons])assert(pool.filter(item=>item.level===level).length>=4,level);}
 assert.equal(listeningLessons.length,16);assert.equal(new Set(grammar.map(c=>c.id)).size,grammar.length);
 for(const item of listeningLessons){assert(item.questions.length>=2);for(const part of item.text.match(/[^.!?]+[.!?]?/g))assert(part.trim().length<=250,part);}
 for(const scene of scenes)for(const line of scene.lines)assert(line.en.length<=250);
 for(const course of grammar)for(const q of course.questions){assert.equal(q.options.filter(o=>o===q.answer).length,1);assert(q.explanation);}
 assert(readings.filter(r=>r.level==='高级').every(r=>r.text.split(/\s+/).length>=90&&r.questions.length>=3));
});

test('lesson gates follow stage order, preserve completed review, and do not skip gaps',async()=>{
 const {orderedLessons,lessonAccess}=await import('../model.mjs');
 const ordered=orderedLessons(readings);assert.deepEqual(ordered.slice(0,4).map(r=>r.id),['read-1','read-2','read-7','read-8']);
 assert(lessonAccess(readings,[],'read-1').allowed);assert(!lessonAccess(readings,[],'read-2').allowed);
 assert.equal(lessonAccess(readings,['read-1'],'read-3').prerequisite.id,'read-2');
 assert(lessonAccess(readings,ordered.slice(0,8).map(r=>r.id),'read-3').allowed);
 assert(lessonAccess(readings,['read-13'],'read-13').allowed);assert(!lessonAccess(readings,['read-13'],'read-14').allowed);
 assert(!lessonAccess(readings,[],'not-a-course').allowed);
});

test('expanded readings add balanced original skill practice with explanations',()=>{
 for(const level of studyLevels)assert.equal(readings.filter(item=>item.level===level).length,8);
 assert.equal(new Set(readings.map(item=>item.id)).size,readings.length);
 const added=readings.filter(item=>item.source);assert.equal(added.length,16);assert.equal(added.reduce((n,item)=>n+item.questions.length,0),48);
 assert.equal(readings.reduce((n,item)=>n+item.questions.length,0),86);
 assert(new Set(added.flatMap(item=>item.questions.map(q=>q.skill))).size>=10);
 for(const item of added)for(const q of item.questions){assert(q.skill&&q.evidence&&q.explanation);assert(q.options[q.answer]);assert.equal(new Set(q.options).size,q.options.length);}
});
