/* Old Games Archive, 2026-10-19. Optional host bridge for the original engine.
 * Protocol v1: messages are accepted only from the embedding window and its
 * validated origin. The game keeps its own key mapping, not the host UI.
 */
(() => {
  const query = new URLSearchParams(location.search);
  if (query.get('embedded') !== '1' || parent === window) return;
  let origin;
  try {
    origin = new URL(query.get('host')).origin;
    const u = new URL(origin);
    if (!(['https://oldgamesarchive.org', 'https://preview.oldgamesarchive.org'].includes(origin) ||
      (u.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(u.hostname)))) return;
  } catch { return; }
  document.documentElement.classList.add('embedded');
  const send = (type, extra = {}) => parent.postMessage({ source: 'oldgames-native', version: 1, type, ...extra }, origin);
  const glyphs = {265:26,264:27,263:28,262:29,32:30,341:31,345:31,342:32,346:32,
    257:45,335:45,256:70,258:67,259:69,340:68,344:68,45:56,61:57,91:58,93:59,92:60,59:61,39:62,44:63,46:64,47:65,96:66};
  for (let n=0;n<26;n++) glyphs[65+n]=n;
  for (let n=0;n<10;n++) glyphs[48+n]=46+n;
  for (let n=0;n<12;n++) glyphs[290+n]=33+n;
  let initialized=false, intendedMuted=true, suspended=false;
  const pause = value => {
    if (!initialized || stopped) return;
    releaseAll(); suspended=value;
    Module._oga_pause(value ? 1 : 0);
    Module._oga_mute(value || intendedMuted ? 1 : 0);
    send(value ? 'paused' : 'running');
  };
  const runtimeReady = Module.onRuntimeInitialized;
  Module.onRuntimeInitialized = () => {
    runtimeReady();
    requestAnimationFrame(() => {
      initialized=true; Module._oga_mute(intendedMuted ? 1 : 0);
      send('ready');send('storage',{state:Module.profileStorageState}); if(document.hidden)pause(true);
    });
  };
  const gameStopped=Module.onGameStopped;
  Module.onProfileStorage=state=>send('storage',{state});
  Module.onStatsSaved=path=>{
    const filename=path.split('/').pop();
    if(/^(OVER|TOUR|CUST)\d{3}\.TXT$/.test(filename))
      send('report',{filename,text:Module.FS.readFile(path,{encoding:'utf8'})});
  };
  Module.onGameStopped=()=>{ gameStopped();send('stopped'); };
  const abort=Module.onAbort;
  Module.onAbort=()=>{abort('runtime aborted');send('error');};
  addEventListener('message', event => {
    const m=event.data;
    if(event.source!==parent || event.origin!==origin || !m || m.source!=='oldgames-player' || m.version!==1) return;
    if(m.type==='sound' && typeof m.muted==='boolean') {
      intendedMuted=m.muted;
      if(initialized&&!stopped)Module._oga_mute(suspended||intendedMuted ? 1 : 0);
    }
    if(!initialized||stopped)return;
    if(m.type==='key' && Number.isInteger(m.key) && typeof m.down==='boolean' && glyphs[m.key]!==undefined && !suspended) {
      const key=glyphs[m.key], id='host:'+m.key;
      if(m.down)physical.set(id,key);else physical.delete(id);
      Module._oga_key(key,heldCount(key)>0?1:0);
    }
    if(m.type==='release')releaseAll();
    if(m.type==='pause')pause(true);
    if(m.type==='resume'&&!document.hidden){pause(false);canvas.focus();}
    if(m.type==='focus')canvas.focus();
    if(m.type==='dispose'){releaseAll();Module._oga_stop();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});
  start.click();
})();
