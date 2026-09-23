import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioCache} from '../audio-cache.mjs';
const ok=()=>({ok:true,blob:async()=>new Blob(['audio'])});
test('preparation and repeated playback share one request and cached audio',async()=>{
 let calls=0,release;
 const cache=createAudioCache(()=>{calls++;return new Promise(resolve=>release=resolve);});
 cache.prepare('water','jenny','normal');const first=cache.get('water','jenny','normal');
 assert.equal(calls,1);release(ok());const blob=await first;
 assert.equal(await cache.get('water','jenny','normal'),blob);assert.equal(calls,1);
});
test('background preparation is bounded and device speech skips online requests',async()=>{
 const releases=[];const cache=createAudioCache(()=>new Promise(resolve=>releases.push(resolve)));
 cache.prepare('water','device','normal');assert.equal(releases.length,0);
 cache.prepare('water','jenny','normal');cache.prepare('water','jenny','slow');cache.prepare('please','jenny','normal');assert.equal(releases.length,2);
 const requests=[cache.get('water','jenny','normal'),cache.get('water','jenny','slow')];releases.forEach(resolve=>resolve(ok()));await Promise.all(requests);
});
test('voice and speed have separate caches; failed requests can retry',async()=>{
 let calls=0;const cache=createAudioCache(async()=>{calls++;if(calls===1)throw Error('offline');return ok();});
 await assert.rejects(cache.get('water','jenny','normal'),/offline/);
 await cache.get('water','jenny','normal');await cache.get('water','jenny','slow');await cache.get('water','sonia','normal');assert.equal(calls,4);
});
test('old completed clips are evicted and timeouts allow retry',async()=>{
 let calls=0;const cache=createAudioCache(async()=>{calls++;return ok();},{limit:1});
 await cache.get('one','jenny','normal');await cache.get('two','jenny','normal');await cache.get('one','jenny','normal');assert.equal(calls,3);
 let attempts=0;const timed=createAudioCache((url,{signal})=>{attempts++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout'))));},{timeout:5});
 await assert.rejects(timed.get('one','jenny','normal'),/timeout/);await assert.rejects(timed.get('one','jenny','normal'),/timeout/);assert.equal(attempts,2);
});
