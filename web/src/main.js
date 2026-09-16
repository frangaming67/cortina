import './style.css';
import { MOTORS, DEFAULTS, calculate, Simulation } from './model.js';
import { createScene } from './scene.js';

const icon=(name,size=18)=>{const p={up:'m6 14 6-6 6 6',down:'m6 10 6 6 6-6',stop:'M7 7h10v10H7z',reset:'M3 11a9 9 0 1 1 2 7M3 4v7h7',sun:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 1.4 1.4m10 10 1.4 1.4M5.6 18.4 1.4-1.4m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',cube:'m12 3 9 5v8l-9 5-9-5V8l9-5Zm0 10v8M3 8l9 5 9-5',arrow:'M5 12h14m-5-5 5 5-5 5',info:'M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',clock:'M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',check:'m5 12 4 4 10-10'};return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${p[name]||p.cube}"/></svg>`;};
const format=(v,d=1)=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:d,minimumFractionDigits:d}).format(v);
const sim=new Simulation();
document.querySelector('#app').innerHTML=`
<header class="topbar"><a class="brand" href="./" aria-label="Cortina Lab, inicio">${icon('cube',26)}<span>CORTINA<span class="brand-light"> / LAB</span></span></a><div class="top-right"><span class="version">PROTOTIPO 01</span><a href="https://github.com/frangaming67/cortina" target="_blank" rel="noopener noreferrer">Ver proyecto ${icon('arrow',16)}</a></div></header>
<main>
 <div class="page-heading"><div><div class="eyebrow">TU CORTINA, ANTES DE CONSTRUIRLA</div><h1>Laboratorio de movimiento<span>.</span></h1></div><div class="heading-note">Un modelo para explorar.<br>Una mañana para programar.</div></div>
 <div class="workspace">
  <section class="stage-panel" aria-label="Simulación de la cortina">
   <div class="stage-toolbar"><span class="stage-title">${icon('cube')} Vista 3D <span class="subtle">/ roller con cadena</span></span><div class="view-buttons" role="group" aria-label="Vistas de cámara"><button class="active" data-view="general">Perspectiva</button><button data-view="front">Frente</button><button data-view="mechanism">Mecanismo</button></div></div>
   <div class="viewport-wrap"><div id="viewport"></div><div class="scene-tag"><span class="tag-mark"></span> MODELO CONCEPTUAL <span>Medidas ilustrativas</span></div><div class="scene-time">${icon('sun',21)}<div><strong id="clock">07:59:50</strong><span>HORA SIMULADA</span></div></div><div class="scene-bottom"><span>Arrastrá para girar · Rueda para acercar</span><label class="explode"><input type="checkbox" id="explode"> Separar motor</label></div><div id="webgl-error" hidden>La vista 3D necesita WebGL. Los controles y cálculos siguen disponibles.</div></div>
   <div class="transport"><div class="status-row"><div><span class="status-led" id="status-led"></span><strong id="status" role="status">Lista para probar</strong></div><span class="opening"><b id="position-value">0</b><span>% abierta</span></span></div><div class="position-track"><div id="position-track"></div></div><div class="transport-buttons"><button id="open" class="primary">${icon('up')} Abrir cortina</button><button id="close">${icon('down')} Cerrar</button><button id="stop" class="stop">${icon('stop',15)} Parar</button><button id="reset" class="icon-button" aria-label="Reiniciar simulación" title="Reiniciar">${icon('reset')}</button><label class="speed-label">Ritmo <select id="time-scale" aria-label="Velocidad de simulación"><option value="1">1×</option><option value="4" selected>4×</option><option value="12">12×</option></select></label></div></div>
   <div class="readouts"><div><span>TORQUE NECESARIO</span><strong id="torque-value">3,0 <small>kgf·cm</small></strong></div><div><span>APERTURA ESTIMADA</span><strong id="time-value">12,6 <small>s</small></strong></div><div><span>CADENA RECORRIDA</span><strong id="travel-value">0 <small>cm</small></strong></div></div>
  </section>
  <aside class="settings" aria-label="Configuración del ensayo"><div class="panel-heading"><h2>Configurá el ensayo</h2><span>01 / 03</span></div>
   <label class="field-label" for="motor">Motor</label><select id="motor" class="motor-select">${MOTORS.map(m=>`<option value="${m.id}">${m.name} · ${m.tag}</option>`).join('')}</select><p class="motor-detail" id="motor-detail"></p>
   <div id="custom-fields" hidden><label class="field-label" for="custom-torque">Torque de trabajo <input id="custom-torque" type="number" min="0.1" max="30" step="0.1" value="10"> kgf·cm</label><label class="field-label" for="custom-rpm">Velocidad <input id="custom-rpm" type="number" min="1" max="150" step="1" value="30"> rpm</label></div>
   <div id="verdict-box" class="verdict good"><div><span id="verdict">Con margen</span><strong id="margin">2,7×</strong></div><div class="margin-track"><span id="margin-fill"></span></div><p id="verdict-description">Respecto al torque necesario para este ensayo.</p></div>
   <div class="setting-section"><div class="section-number">02 <span>La cortina y su rueda</span></div>
    <label class="range-label" for="force">Fuerza de la cadena <output id="force-output">2,0 kgf</output></label><input id="force" type="range" min="0.1" max="6" step="0.1" value="2"><div class="range-ends"><span>Suave · 0,1</span><span>Dura · 6 kgf</span></div>
    <label class="range-label" for="diameter">Diámetro de la rueda <output id="diameter-output">3,0 cm</output></label><input id="diameter" type="range" min="1" max="8" step="0.1" value="3"><div class="range-ends"><span>1 cm</span><span>8 cm</span></div>
    <label class="range-label" for="travel">Recorrido de la cadena <output id="travel-output">180 cm</output></label><input id="travel" type="range" min="50" max="400" step="10" value="180"><div class="range-ends"><span>50 cm</span><span>400 cm</span></div>
   </div>
   <div class="setting-section automation"><div class="section-number">03 <span>Una mañana automática</span></div><button id="morning" class="morning">${icon('clock',21)}<span>Probar las <strong>08:00</strong><small>Reinicia cerrada a las 07:59:50</small></span>${icon('arrow')}</button><label class="jam"><input type="checkbox" id="jam"><span>Simular un atasco</span></label></div>
  </aside>
 </div>
 <section class="comparison" aria-labelledby="compare-title"><div class="section-heading"><div><span class="eyebrow">LA MISMA CORTINA. DISTINTAS RESPUESTAS.</span><h2 id="compare-title">Compará los motores</h2></div><span class="comparison-note">Se actualizan con tus ajustes</span></div><div class="motor-grid" id="motor-grid"></div></section>
 <details class="method" id="method"><summary>${icon('info')} Cómo se calcula y qué falta medir <span>Ver supuestos + fuentes</span></summary><div class="method-content"><div><h3>Fuerza × radio = torque</h3><p>Tomamos tus 2 kg como 2 kgf de tirón en la cadena. Con una rueda de 3 cm de diámetro efectivo, hacen falta 3 kgf·cm. El margen compara ese esfuerzo con el presupuesto de trabajo de cada motor.</p><p>Para los motores DC usamos una aproximación lineal de velocidad frente al torque. El paso a paso y el motor a medida usan velocidad constante. La simulación se bloquea si supera el presupuesto de trabajo, aunque el motor real todavía pudiera girar.</p></div><div><h3>Es una exploración, no una certificación</h3><p>La geometría, el recorrido inicial y el motor del kit son ilustrativos. No se modelan temperatura, corriente, inercia, flexión ni autonomía de batería. La protección ante atasco es ideal; habrá que construirla y calibrarla.</p><p>El cierre usa el mismo esfuerzo por simplificación. Los sensores, soportes, rueda y liberación manual necesitan diseño y prueba reales. El modelo no envía órdenes a hardware.</p></div><div id="source-list"></div></div></details>
</main><footer><span>CORTINA / LAB <span class="footer-dim">· Proyecto DIY</span></span><span>Diseñado para tu roller. Simulado en tu navegador.</span></footer>`;

const $=id=>document.getElementById(id);
let scene;
try{scene=createScene($('viewport'));}catch(error){$('webgl-error').hidden=false;console.error('No se pudo iniciar WebGL',error);}
let result=calculate(sim.config);
function refreshCalculations(){
  result=calculate(sim.config);const m=result.motor;
  $('motor').value=m.id;$('motor-detail').textContent=m.detail;$('custom-fields').hidden=m.id!=='custom';
  $('verdict-box').className=`verdict ${result.level}`;$('verdict').textContent=result.verdict;$('margin').textContent=`${format(result.margin)}×`;$('margin-fill').style.width=`${Math.min(100,result.margin/4*100)}%`;
  $('verdict-description').textContent=result.canMove?'Margen de torque del modelo; no es una garantía de funcionamiento.':'El ensayo supera el torque de trabajo: se bloquea el movimiento.';
  $('torque-value').innerHTML=`${format(result.required)} <small>kgf·cm</small>`;$('time-value').innerHTML=result.seconds?`${format(result.seconds)} <small>s</small>`:'— <small>sin movimiento</small>';
  for(const [key,unit,d] of [['force','kgf',1],['diameter','cm',1],['travel','cm',0]]){$(`${key}-output`).textContent=`${format(sim.config[key],d)} ${unit}`;$(key).value=sim.config[key];}
  $('motor-grid').innerHTML=MOTORS.map(m=>{const r=calculate(sim.config,m.id);return `<article class="motor-card ${m.id===sim.config.motorId?'selected':''}" style="--motor-color:${m.color}"><div class="motor-card-top"><span>${m.tag}</span><span class="motor-symbol">${icon('cube',24)}</span></div><h3>${m.name}</h3><p>${m.detail}</p><div class="card-specs"><div><strong>${format(r.motor.torque)}</strong><span>kgf·cm de trabajo${m.id==='pololu'||m.id==='kit'?'*':''}</span></div><div><strong>${r.seconds?format(r.seconds)+' s':'—'}</strong><span>apertura estimada</span></div></div><div class="card-bottom"><span class="assessment ${r.level}">${r.verdict} · ${format(r.margin)}×</span><button data-motor="${m.id}" aria-label="Probar ${m.name}">${m.id===sim.config.motorId?'Repetir prueba':'Probar'} ${icon('arrow',15)}</button></div></article>`;}).join('');
  scene?.setMotor(m.id);
}
function refreshState(){
  $('status').textContent=sim.status;$('status-led').className=`status-led ${sim.running?'moving':sim.jammed||sim.status.includes('insuficiente')?'error':''}`;
  $('position-value').textContent=Math.round(sim.position*100);$('position-track').style.width=`${sim.position*100}%`;
  $('travel-value').innerHTML=`${format(sim.position*sim.config.travel,0)} <small>cm</small>`;
  const t=Math.floor(sim.clock%86400);$('clock').textContent=[Math.floor(t/3600),Math.floor(t/60)%60,t%60].map(v=>String(v).padStart(2,'0')).join(':');
  $('jam').checked=sim.jammed;$('stop').disabled=!sim.running&&!sim.schedule;$('morning').classList.toggle('armed',sim.schedule);
}
function configure(patch){sim.configure(patch);refreshCalculations();refreshState();}
function action(name){
  if(name==='open'||name==='close'){sim.schedule=false;sim.start(name==='open'?1:0);}
  if(name==='stop'){sim.schedule=false;sim.stop();}
  if(name==='reset')sim.reset();if(name==='morning')sim.morning();refreshState();
}
for(const name of ['open','close','stop','reset','morning'])$(name).addEventListener('click',()=>action(name));
$('motor').addEventListener('change',e=>configure({motorId:e.target.value}));
for(const key of ['force','diameter','travel'])$(key).addEventListener('input',e=>configure({[key]:Number(e.target.value)}));
for(const [id,key] of [['custom-torque','customTorque'],['custom-rpm','customRpm']])$(id).addEventListener('change',e=>{const n=Number(e.target.value);if(!e.target.value||!Number.isFinite(n)){e.target.value=sim.config[key];return;}configure({[key]:n});e.target.value=sim.config[key];});
$('time-scale').addEventListener('change',e=>{sim.config.timeScale=Number(e.target.value);});
$('explode').addEventListener('change',e=>scene?.setExploded(e.target.checked));
$('jam').addEventListener('change',e=>{sim.setJam(e.target.checked);refreshState();});
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===btn));scene?.setView(btn.dataset.view);}));
$('motor-grid').addEventListener('click',e=>{const btn=e.target.closest('[data-motor]');if(!btn)return;configure({motorId:btn.dataset.motor});sim.reset();sim.start(1);refreshState();});
$('source-list').innerHTML='<h3>Datos de los motores</h3>'+MOTORS.map(m=>`<p><strong>${m.name}.</strong> ${m.evidence} ${m.source?`<a href="${m.source}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>`:''}</p>`).join('');
refreshCalculations();refreshState();
let previous=performance.now();let uiTimer=0;
function frame(now){const dt=Math.min((now-previous)/1000,.1);previous=now;sim.step(dt);scene?.render(sim,result);uiTimer+=dt;if(uiTimer>.08){refreshState();uiTimer=0;}requestAnimationFrame(frame);}
requestAnimationFrame(frame);

// WebMCP is optional: the visible buttons remain the source of truth when unsupported.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    document.modelContext.registerTool({
      name: 'simulate_curtain',
      title: 'Simular cortina',
      description: 'Cambia el motor y la fuerza del ensayo y ejecuta una apertura o cierre en el modelo visible.',
      inputSchema: {type:'object',properties:{action:{type:'string',enum:['open','close','stop','morning']},motorId:{type:'string',enum:MOTORS.map(m=>m.id)},force:{type:'number',minimum:.1,maximum:6},diameter:{type:'number',minimum:1,maximum:8}},required:['action'],additionalProperties:false},
      annotations: {readOnlyHint:false,untrustedContentHint:false},
      execute(input={}) {
        if (input.motorId) configure({motorId:input.motorId});
        if (input.force !== undefined) configure({force:Number(input.force)});
        if (input.diameter !== undefined) configure({diameter:Number(input.diameter)});
        action(input.action);
        refreshState();
        return {status:sim.status,position:Math.round(sim.position*100),motor:sim.config.motorId,force:sim.config.force};
      },
    }, {signal:lifecycle.signal});
  } catch (error) { console.warn('WebMCP no disponible',error); }
}
