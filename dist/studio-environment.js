import * as T from './assets/three.module.js';
// Reflection-only studio. The screenshot camera/layout remain in scene-layout.js.
// Large luminous cards produce broad highlights; the dark right wall provides
// an edge cue in acrylic and steel. These are not visible scene decorations.
export function createStudioEnvironment(){
 const scene=new T.Scene();
 const room=new T.Mesh(new T.BoxGeometry(24,16,24),new T.MeshBasicMaterial({color:0x62676c,side:T.BackSide}));
 scene.add(room);
 function card(w,h,pos,target,intensity){
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color().setScalar(intensity),side:T.DoubleSide}));
  m.position.set(...pos);m.lookAt(...target);scene.add(m);
 }
 card(7,10,[-9,5,3],[0,0,0],5);
 card(8,5,[0,7,-2],[0,0,0],2);
 card(2,7,[8,3,-5],[0,0,0],1.2);
 const flag=new T.Mesh(new T.PlaneGeometry(7,10),new T.MeshBasicMaterial({color:0x171b20,side:T.DoubleSide}));
 flag.position.set(10,1,3);flag.lookAt(0,0,0);scene.add(flag);
 return scene;
}
