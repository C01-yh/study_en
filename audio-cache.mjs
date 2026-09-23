// Share in-flight synthesis between preparation and playback; retain only a small lesson cache.
export function createAudioCache(fetcher=(...args)=>globalThis.fetch(...args),{limit=40,timeout=55000}={}){
 const entries=new Map();
 function get(text,voice,speed){
  const key=new URLSearchParams({text,voice,speed}).toString();
  if(entries.has(key))return entries.get(key).promise;
  const entry={pending:true};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  entry.promise=(async()=>{
   try{
    const response=await fetcher(`/api/audio?${key}`,{signal:controller.signal});
    if(!response.ok){const result=await response.json();throw Error(result.error||'声音暂时无法播放，请重试。');}
    const blob=await response.blob();entry.pending=false;
    for(const [oldKey,old] of entries){if(entries.size<=limit)break;if(!old.pending)entries.delete(oldKey);}
    return blob;
   }catch(error){entries.delete(key);throw error;}finally{clearTimeout(timer);}
  })();
  entries.set(key,entry);return entry.promise;
 }
 function prepare(text,voice,speed){
  if(voice==='device'||[...entries.values()].filter(entry=>entry.pending).length>=2)return;
  get(text,voice,speed).catch(()=>{}); // A failed warm-up must not interrupt the lesson; clicking can retry.
 }
 return {get,prepare};
}
