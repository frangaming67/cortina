import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(container) {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e9edf0');
  const camera=new THREE.PerspectiveCamera(35,1,0.01,100);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.domElement.setAttribute('aria-label','Modelo 3D de la cortina, la cadena y el motor. Arrastrá para girar y usá la rueda para acercarte.');
  renderer.domElement.setAttribute('tabindex','0');container.append(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;
  controls.minDistance=.35;controls.maxDistance=9;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.12;
  const hemi=new THREE.HemisphereLight(0xffffff,0x758293,2.3);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff0d9,3.5);sun.position.set(-3,5,4);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-3,right:3,top:4,bottom:-3,near:.1,far:12});sun.shadow.normalBias=.015;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xd1eaff,1.8);fill.position.set(2,3,-1);scene.add(fill);
  const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const wallMat=mat('#d9dfe2'),white=mat('#f4f2ec'),metal=mat('#adb7be',.3,.65),dark=mat('#33424a',.42,.35),lime=mat('#bce679',.4);
  const box=(w,h,d,m,x,y,z,parent=scene)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  const cyl=(r,l,m,x,y,z,axis='y',parent=scene)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,40),m);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  box(4,.42,.18,wallMat,0,.21,-.21);box(4,.48,.18,wallMat,0,2.56,-.21);
  box(.78,1.9,.18,wallMat,-1.61,1.37,-.21);box(.78,1.9,.18,wallMat,1.61,1.37,-.21);
  box(4.6,.07,3.2,mat('#cbd2d7'),0,-.05,.8);
  box(2.43,.055,.25,white,0,.42,-.02);
  box(2.34,.055,.12,white,0,2.30,-.075);
  [-1.16,0,1.16].forEach(x=>box(.045,1.86,.10,white,x,1.37,-.075));
  box(2.30,.035,.09,white,0,1.40,-.065);
  const sky=new THREE.MeshBasicMaterial({color:0xb7d6e0});box(2.28,1.80,.018,sky,0,1.36,-.32);
  // Geometría exterior abstracta: proporciona profundidad sin fotos privadas.
  box(2.27,.50,.022,mat('#9cae9b'),0,.68,-.295);
  for(let i=0;i<10;i++){const shrub=new THREE.Mesh(new THREE.SphereGeometry(.17+(i%3)*.055,12,9),mat(i%2?'#809985':'#9bb09a'));shrub.scale.set(1,1.5,.2);shrub.position.set(-1.02+i*.225,.88+Math.sin(i)*.12,-.26);scene.add(shrub);}
  const fabricCanvas=document.createElement('canvas');fabricCanvas.width=128;fabricCanvas.height=128;
  const ctx=fabricCanvas.getContext('2d');ctx.fillStyle='#ece7da';ctx.fillRect(0,0,128,128);
  ctx.lineWidth=1;for(let i=0;i<128;i+=4){ctx.strokeStyle=i%8===0?'#d9d4c7':'#e2ded2';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
  const tex=new THREE.CanvasTexture(fabricCanvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(12,10);tex.colorSpace=THREE.SRGBColorSpace;
  const clothMat=new THREE.MeshStandardMaterial({map:tex,roughness:1,side:THREE.DoubleSide});
  const cloth=box(2.16,1,.013,clothMat,0,1.3,.065);
  const topY=2.26;const roller=cyl(.052,2.22,clothMat,0,topY,.06,'x');
  const bar=cyl(.015,2.19,white,0,.55,.072,'x');
  [-1.135,1.135].forEach(x=>{box(.037,.12,.13,white,x,topY,-.003);cyl(.018,.06,metal,x,topY,.06,'x');});
  const topWheel=cyl(.05,.027,white,1.19,topY,.06,'x');
  const drive=new THREE.Group();drive.position.set(1.19,.70,.06);scene.add(drive);
  const mount=box(.14,.20,.07,dark,.055,0,-.065,drive);
  const wheel=cyl(.046,.036,lime,0,0,0,'x',drive);
  const hub=cyl(.020,.065,metal,.026,0,0,'x',drive);
  const motorBody=cyl(.063,.23,metal,.18,0,0,'x',drive);
  const gear=cyl(.066,.06,dark,.09,0,0,'x',drive);
  const endCap=cyl(.062,.025,dark,.306,0,0,'x',drive);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const bolt=cyl(.007,.004,dark,.328,Math.cos(a)*.044,Math.sin(a)*.044,'x',drive);}
  const shaftMarker=box(.003,.006,.035,dark,-.021,.023,0,wheel);
  const controller=box(.18,.30,.065,dark,1.38,.34,-.05);
  box(.13,.21,.005,mat('#456b59'),1.38,.34,-.011);
  box(.06,.075,.008,metal,1.38,.39,-.004);box(.06,.032,.008,dark,1.38,.26,-.004);
  const cablePoints=[new THREE.Vector3(1.38,.5,-.005),new THREE.Vector3(1.44,.62,.04),new THREE.Vector3(1.47,.69,.06)];
  const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints),20,.006,6,false),dark);scene.add(cable);
  const sensor=box(.045,.052,.02,lime,1.06,2.13,.092);
  const beadMat=mat('#f5f2e9',.38);const beadGeo=new THREE.SphereGeometry(.010,10,8);
  const beadCount=138;const beads=new THREE.InstancedMesh(beadGeo,beadMat,beadCount);beads.castShadow=true;scene.add(beads);
  const lineMaterial=new THREE.LineBasicMaterial({color:'#a9a597'});
  const chainLine=new THREE.LineLoop(new THREE.BufferGeometry(),lineMaterial);scene.add(chainLine);
  const dummy=new THREE.Object3D();let previousDiameter=-1;let chainRadius=.05;let loopLength=0;
  function chainPoint(s){const span=topY-.70;const circumference=Math.PI*chainRadius;const t=((s%loopLength)+loopLength)%loopLength;
    if(t<span)return new THREE.Vector3(1.19,topY-t,.06+chainRadius);
    if(t<span+circumference){const a=(t-span)/chainRadius;return new THREE.Vector3(1.19,.70-Math.sin(a)*chainRadius,.06+Math.cos(a)*chainRadius);}
    if(t<2*span+circumference)return new THREE.Vector3(1.19,.70+t-span-circumference,.06-chainRadius);
    const a=(t-2*span-circumference)/chainRadius;return new THREE.Vector3(1.19,topY+Math.sin(a)*chainRadius,.06-Math.cos(a)*chainRadius);
  }
  const viewGoals={general:{p:[3.4,2.6,5.1],t:[.15,1.3,0]},front:{p:[.15,1.4,5.7],t:[.1,1.4,0]},mechanism:{p:[2.25,1.02,1.40],t:[1.22,.86,.06]}};
  let cameraGoal=null;
  function setView(name,instant=false){const goal=viewGoals[name];if(!goal)return;cameraGoal=goal;if(instant){camera.position.fromArray(goal.p);controls.target.fromArray(goal.t);cameraGoal=null;}controls.update();}
  controls.addEventListener('start',()=>{cameraGoal=null;});setView('general',true);
  let exploded=false;let motorType='pololu';
  function setMotor(id){motorType=id;const c=id==='kit'?'#73a8cf':id==='worm'?'#d4a16b':id==='custom'?'#aa94d1':'#aab8c0';motorBody.material.color.set(c);motorBody.scale.x=id==='kit'?.55:1;}
  const resize=()=>{const {width,height}=container.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);};
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function render(sim,result){
    const opening=sim.position;const length=Math.max(.03,1.75*(1-opening));cloth.scale.y=length;cloth.position.y=topY-length/2;bar.position.y=topY-length;
    roller.scale.y=1;const rollRadius=Math.sqrt(.042**2+1.75*opening*.001/Math.PI);roller.scale.x=rollRadius/.052;roller.scale.z=rollRadius/.052;
    const rotation=sim.chainDistance/(Math.PI*sim.config.diameter)*Math.PI*2;
    roller.rotation.x=rotation;wheel.rotation.x=rotation;topWheel.rotation.x=rotation;
    if(previousDiameter!==sim.config.diameter){previousDiameter=sim.config.diameter;chainRadius=.05;loopLength=2*(topY-.70)+2*Math.PI*chainRadius;
      const points=Array.from({length:160},(_,i)=>chainPoint(i/160*loopLength));chainLine.geometry.dispose();chainLine.geometry=new THREE.BufferGeometry().setFromPoints(points);
      wheel.scale.y=wheel.scale.z=.8+sim.config.diameter*.065;
    }
    for(let i=0;i<beadCount;i++){dummy.position.copy(chainPoint(i/beadCount*loopLength+sim.chainDistance/100));dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);}beads.instanceMatrix.needsUpdate=true;
    const expand=exploded?.15:0;motorBody.position.x=THREE.MathUtils.lerp(motorBody.position.x,.18+expand,.09);endCap.position.x=THREE.MathUtils.lerp(endCap.position.x,.306+expand,.09);gear.position.x=THREE.MathUtils.lerp(gear.position.x,.09+expand*.35,.09);
    sensor.material.emissive.setHex(opening>.99?0x759922:0x000000);sensor.material.emissiveIntensity=.5;
    if(cameraGoal){camera.position.lerp(new THREE.Vector3(...cameraGoal.p),.08);controls.target.lerp(new THREE.Vector3(...cameraGoal.t),.08);if(camera.position.distanceTo(new THREE.Vector3(...cameraGoal.p))<.005)cameraGoal=null;}
    controls.update();renderer.render(scene,camera);
  }
  renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Home'){setView('general');e.preventDefault();}if(e.key==='+'||e.key==='-'){const dir=camera.position.clone().sub(controls.target).multiplyScalar(e.key==='+'?.9:1.1);camera.position.copy(controls.target).add(dir);e.preventDefault();}});
  return {render,setView,setMotor,setExploded(value){exploded=value;},dispose(){observer.disconnect();renderer.dispose();controls.dispose();}};
}
