// Modelo exploratorio. Las fuentes y los límites están en docs/simulator.md.
export const MOTORS = [
  {id:'pololu', name:'Pololu 37D', detail:'12 V · 100:1 · con encoder', voltage:12, rpm:100, torque:8, stall:34, color:'#c8f16c', tag:'Propuesto', evidence:'Presupuesto de trabajo estimado: 8 kgf·cm. Límite de reductora: 10 kgf·cm. No es torque nominal certificado.', source:'https://www.pololu.com/product/4755'},
  {id:'kit', name:'28BYJ-48', detail:'5 V · paso a paso · tu kit', voltage:5, rpm:10, torque:0.3, stall:null, color:'#75b4e8', tag:'Tu kit', evidence:'0,3 kgf·cm y 10 rpm son supuestos ilustrativos. Tu motor de 5 V está identificado, pero su curva no fue medida.', source:'https://docs.freenove.com/projects/fnk0025/en/latest/fnk0025/python-tutorial.html'},
  {id:'worm', name:'Sinfín DFRobot', detail:'12 V · FIT0489-D · 40 rpm', voltage:12, rpm:40, torque:2.2, stall:8, color:'#e5aa71', tag:'Alternativa', evidence:'Torque nominal publicado: 2,2 kgf·cm; 40 rpm sin carga y 8 kgf·cm de bloqueo.', source:'https://www.dfrobot.com/product-1484.html'},
  {id:'custom', name:'Motor a medida', detail:'Definí torque y velocidad', voltage:12, rpm:30, torque:10, stall:null, color:'#b9a1f3', tag:'Editable', evidence:'Valores ingresados por vos. Usá torque disponible en movimiento, no torque de bloqueo.', source:null},
];

export const DEFAULTS = Object.freeze({motorId:'pololu', force:2, diameter:3, travel:180, customTorque:10, customRpm:30, timeScale:4});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function normalizeConfig(input={}) {
  const cfg={...DEFAULTS,...input};
  if(!MOTORS.some(m=>m.id===cfg.motorId)) throw new Error('Motor desconocido');
  for(const [key,min,max] of [['force',0.1,6],['diameter',1,8],['travel',50,400],['customTorque',0.1,30],['customRpm',1,150],['timeScale',1,12]]) {
    if(typeof cfg[key]!=='number' || !Number.isFinite(cfg[key])) throw new Error(`Valor inválido: ${key}`);
    cfg[key]=clamp(cfg[key],min,max);
  }
  return cfg;
}
export function calculate(config,motorId=config.motorId) {
  const cfg=normalizeConfig({...config,motorId});
  const base=MOTORS.find(m=>m.id===motorId);
  const motor=base.id==='custom'?{...base,torque:cfg.customTorque,rpm:cfg.customRpm}:base;
  const required=cfg.force*cfg.diameter/2;
  const margin=motor.torque/required;
  const canMove=margin>=1;
  const rpm=canMove? motor.rpm*(motor.stall?Math.max(0,1-required/motor.stall):1):0;
  const speed=Math.PI*cfg.diameter*rpm/60;
  return {motor,required,margin,canMove,rpm,speed,seconds:speed>0?cfg.travel/speed:null,
    verdict:!canMove?'No alcanza':margin<2?'Margen justo':'Con margen',
    level:!canMove?'bad':margin<2?'warn':'good'};
}

export class Simulation {
  constructor(config=DEFAULTS) { this.config=normalizeConfig(config); this.reset(); }
  reset() {this.position=0;this.target=0;this.elapsed=0;this.chainDistance=0;this.status='Lista para probar';this.running=false;this.jammed=false;this.clock=7*3600+59*60+50;this.schedule=false;this.triggeredDay=null;}
  configure(patch) {this.stop('Configuración actualizada');this.config=normalizeConfig({...this.config,...patch});}
  start(target) {
    if(target!==0&&target!==1) throw new Error('Destino inválido');
    this.target=target;this.elapsed=0;
    if(Math.abs(this.position-target)<1e-6){this.running=false;this.status=target?'Ya está abierta':'Ya está cerrada';return;}
    if(this.jammed){this.stop('Atasco · protección activada');return;}
    if(!calculate(this.config).canMove){this.stop('Fuerza insuficiente · motor detenido');return;}
    this.running=true;this.status=target?'Abriendo cortina':'Cerrando cortina';
  }
  stop(reason='Movimiento detenido') {this.running=false;this.status=reason;}
  setJam(value) {this.jammed=!!value;if(this.jammed&&this.running)this.stop('Atasco · protección activada');}
  morning() {this.reset();this.schedule=true;this.status='Esperando las 08:00';}
  step(realSeconds) {
    if(!Number.isFinite(realSeconds)||realSeconds<0) throw new Error('Tiempo inválido');
    const dt=realSeconds*this.config.timeScale;
    const oldClock=this.clock;this.clock+=dt;
    let movementDt=dt;
    if(this.schedule) {
      const day=Math.floor(this.clock/86400);const opening=day*86400+8*3600;
      if(this.clock>=opening&&this.clock<opening+60&&this.triggeredDay!==day){
        this.triggeredDay=day;this.start(1);movementDt=Math.min(dt,Math.max(0,this.clock-Math.max(opening,oldClock)));
      }
    }
    if(!this.running)return;
    const result=calculate(this.config);
    if(this.jammed||!result.canMove){this.stop(this.jammed?'Atasco · protección activada':'Fuerza insuficiente · motor detenido');return;}
    const sign=this.target>this.position?1:-1;
    const distance=Math.min(result.speed*movementDt,Math.abs(this.target-this.position)*this.config.travel);
    this.position=clamp(this.position+sign*distance/this.config.travel,0,1);
    this.chainDistance+=sign*distance;this.elapsed+=distance/result.speed;
    if(Math.abs(this.target-this.position)<1e-6){this.position=this.target;this.stop(this.target?'Abierta · sensor de fin de recorrido':'Cerrada · fin de recorrido simulado');}
  }
}
