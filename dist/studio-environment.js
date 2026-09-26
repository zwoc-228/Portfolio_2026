import * as T from './assets/three.module.js';

// Large studio softboxes provide a continuous reflection gradient for ceramic and metal.
export function createStudioEnvironment(){
 const scene=new T.Scene();
 const room=new T.Mesh(
  new T.BoxGeometry(32,20,32),
  new T.MeshBasicMaterial({color:0xa7b0ae,side:T.BackSide})
 );
 scene.add(room);

 function card(w,h,pos,target,intensity,tint=0xffffff){
  const m=new T.Mesh(
   new T.PlaneGeometry(w,h),
   new T.MeshBasicMaterial({color:new T.Color(tint).multiplyScalar(intensity),side:T.DoubleSide})
  );
  m.position.set(...pos);m.lookAt(...target);scene.add(m);return m;
 }
 function flag(w,h,pos,target,color=0x11171b){
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));
  m.position.set(...pos);m.lookAt(...target);scene.add(m);return m;
 }

 // Broad panels create a satin gradient; restrained narrow strips articulate edges.
 card(13.8,11.8,[-11.4,7.0,4.0],[0,.30,0],1.74,0xfafdff);
 card(18.5,9.0,[-.8,11.4,-1.2],[0,.18,-.5],1.38,0xf8fcff);
 card(16.2,2.2,[1.0,5.3,-10.8],[0,.1,0],1.02,0xf0f6fa);
 card(9.0,6.4,[-2.6,5.0,8.8],[0,.36,0],1.24,0xf4f7f9);
 card(3.8,8.8,[9.1,4.4,-3.6],[0,.38,0],.88,0xecf2f5);
 card(9.0,1.1,[3.8,3.2,11.6],[0,.0,0],.62,0xebf1f4);

 // Flags are as important as lights on metal: they restore dark intervals and depth.
 flag(8.0,12.0,[10.7,1.3,3.8],[0,.1,0],0x72807f);
 flag(5.4,10.2,[-8.4,1.0,-7.2],[0,.0,0],0x87918f);
 flag(14.0,2.4,[.8,9.0,7.5],[0,.1,0],0x9aa3a0);
 return scene;
}
