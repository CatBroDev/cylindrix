/* Original pilot/settings files, not an emulator save state. Same-origin,
 * versioned local storage survives runtime directory updates. No network I/O. */
(() => {
  const storageKey = 'oldgames:cylindrix:profiles:v1';
  const paths = ['/gamedata/game.cfg', ...Array.from({length:8}, (_,i)=>`/gamedata/xxx${i}.xxx`)];
  let initialized = false, configShape, aiCount;
  Module.profileStorageState = 'loading';
  function status(value) {
    Module.profileStorageState=value;
    if(Module.onProfileStorage)Module.onProfileStorage(value);
    const el=document.querySelector('#storage-status');
    if(el)el.textContent=value==='available'?'Pilot records and settings are saved in this browser. Battles cannot be resumed.':value==='unavailable'?'Browser storage is unavailable. Pilot records will not survive closing this page.':value==='rejected'?'Saved data could not be restored. The original defaults are in use.':'';
  }
  function configValid(bytes) {
    if(bytes.length>16384)return false;
    const lines=new TextDecoder().decode(bytes).trim().split(/\r?\n/).map(x=>x.trim());
    if(lines.length!==configShape.length)return false;
    return lines.every((line,i)=>{
      const shape=configShape[i];
      if(shape.startsWith('<'))return /^<[^<>\x00-\x1f]{0,79}>$/.test(line);
      const parts=line.split(/\s+/), original=shape.split(/\s+/), label=original[1];
      if(parts.length!==2||parts[1]!==label)return false;
      if(label==='cylinder_filename')return /^gamedata\/level(?:[1-9]|10)?\.dat$/.test(parts[0]);
      if(!/^\d+$/.test(parts[0]))return false;
      const n=Number(parts[0]);
      if(/_vehicle$/.test(label))return n<=7;
      if(/_ai$/.test(label))return n<aiCount;
      if(/_Com_Port$/.test(label))return n>=1&&n<=4;
      if(/_Baud$/.test(label))return n>=1&&n<=2;
      if(/_vol$/.test(label))return n<=255;
      if(/^(Joystick|World_Detail_Level|Tube_Detail_Level)$/.test(label))return n<=2;
      if(/^(Mouse_Active|Hubs_On|Sound_On|Music_On|voices_on|Modem_Game|Serial_Game|animations_on|two_player|fullscreen)$/.test(label))return n<=1;
      return n<71;
    });
  }
  function valid(path,bytes) {
    if(path==='/gamedata/game.cfg')return configValid(bytes);
    return paths.includes(path)&&bytes.length===132&&bytes.subarray(0,80).includes(0);
  }
  function encode(bytes){return btoa(String.fromCharCode(...bytes));}
  function decode(data){return Uint8Array.from(atob(data),c=>c.charCodeAt(0));}
  Module.persistProfiles=()=>{
    if(!initialized)return;
    try{
      const files=[];
      for(const path of paths){
        if(!Module.FS.analyzePath(path).exists)continue;
        const bytes=Module.FS.readFile(path);if(!valid(path,bytes))throw Error('Invalid profile data');
        files.push({path,data:encode(bytes)});
      }
      localStorage.setItem(storageKey,JSON.stringify({version:1,files}));status('available');
    }catch{status('unavailable');}
  };
  const restore=()=>{
    Module.FS.mkdirTree('/stats');
    configShape=Module.FS.readFile('/gamedata/game.cfg',{encoding:'utf8'}).trim().split(/\r?\n/).map(x=>x.trim());
    aiCount=(Module.FS.readFile('/gamedata/people.yaml',{encoding:'utf8'}).match(/^\s+name:/gm)||[]).length;
    let raw;
    try {
      raw=localStorage.getItem(storageKey);
      localStorage.setItem(storageKey+':probe','1');localStorage.removeItem(storageKey+':probe');
    } catch { initialized=true;status('unavailable');return; }
    try{
      if(raw){
        if(raw.length>32768)throw Error('Oversized profile');
        const saved=JSON.parse(raw);
        if(saved.version!==1||!Array.isArray(saved.files)||saved.files.length>9)throw Error('Invalid profile');
        const seen=new Set();
        const files=saved.files.map(file=>{
          if(!file||!paths.includes(file.path)||seen.has(file.path)||typeof file.data!=='string')throw Error('Invalid profile path');
          seen.add(file.path);const bytes=decode(file.data);if(!valid(file.path,bytes))throw Error('Invalid profile file');return{path:file.path,bytes};
        });
        if(!seen.has('/gamedata/game.cfg'))throw Error('Missing config');
        for(const file of files)Module.FS.writeFile(file.path,file.bytes);
      }
      initialized=true;status('available');
    }catch{initialized=true;status('rejected');}
  };
  // Preloaded files are available here, and C main has not read game.cfg yet.
  // preRun is too early: the Emscripten preload task may still be pending.
  const runtimeInitialized=Module.onRuntimeInitialized;
  Module.onRuntimeInitialized=()=>{restore();runtimeInitialized?.();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)Module.persistProfiles();});
  addEventListener('pagehide',()=>Module.persistProfiles());
})();
