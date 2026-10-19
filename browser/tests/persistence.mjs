import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'web/persistence.js'),'utf8');
function boot(raw,blocked=false){
 const files=new Map(['gamedata/game.cfg','gamedata/people.yaml',...Array.from({length:6},(_,i)=>`gamedata/xxx${i}.xxx`)].map(p=>['/'+p,new Uint8Array(fs.readFileSync(path.join(root,'runtime',p)))]));
 const storage=new Map(raw?[['oldgames:cylindrix:profiles:v1',raw]]:[]);let writes=0;
 const ctx={TextDecoder,Uint8Array,atob,btoa,document:{querySelector:()=>null,addEventListener:()=>{}},addEventListener:()=>{},localStorage:{getItem:k=>{if(blocked)throw Error('Denied');return storage.get(k)||null;},setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},Module:{FS:{mkdirTree:()=>{},analyzePath:p=>({exists:files.has(p)}),readFile:(p,o)=>o?.encoding?new TextDecoder().decode(files.get(p)):files.get(p),writeFile:(p,b)=>{writes++;files.set(p,b);}}}};
 vm.runInNewContext(source,ctx);ctx.Module.onRuntimeInitialized();return{ctx,files,storage,writes};
}
const first=boot();assert.equal(first.ctx.Module.profileStorageState,'available');first.ctx.Module.persistProfiles();
const saved=first.storage.get('oldgames:cylindrix:profiles:v1');const restored=boot(saved);assert.equal(restored.ctx.Module.profileStorageState,'available');assert.equal(restored.writes,7);
const invalidBase64=JSON.parse(saved);invalidBase64.files[0].data='!!';
for(const bad of ['{',JSON.stringify({version:9,files:[]}),saved.replace('/gamedata/xxx0.xxx','/other'),JSON.stringify(invalidBase64),JSON.stringify({version:1,files:[{path:'/gamedata/game.cfg',data:btoa('<unterminated')}]}),'x'.repeat(40000)]){
 const s=boot(bad);assert.equal(s.ctx.Module.profileStorageState,'rejected');assert.equal(s.writes,0,'invalid input must not partially restore files');
}
assert.equal(boot(null,true).ctx.Module.profileStorageState,'unavailable');
console.log('Profile round-trip, malformed/oversized/path-invalid input and blocked-storage tests passed.');
