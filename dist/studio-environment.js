import * as T from './assets/three.module.js';

// Reflection-only studio for the brushed-metal tabletop.
// Round 37 adds controlled bright strips + dark flags so the metal reads as metal:
// broad gradients, directional streaks, and darker intervals instead of a flat white wash.
export function createStudioEnvironment(){
 const scene=new T.Scene();
 const room=new T.Mesh(
  new T.BoxGeometry(32,20,32),
  new T.MeshBasicMaterial({color:0x30383d,side:T.BackSide})
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

 // Broad key gradient: gives the silver plane its overall lift.
 card(13.8,11.8,[-11.4,7.0,4.0],[0,.30,0],4.15,0xfffcf8);
 // Long overhead strip: produces the main brushed-metal specular sweep.
 card(18.5,2.0,[-.8,11.4,-1.2],[0,.18,-.5],5.35,0xf8fbfd);
 // Narrow rear strip creates a second, quieter highlight band across the table.
 card(16.2,1.05,[1.0,5.3,-10.8],[0,.1,0],2.65,0xeef5f8);
 // Soft frontal card keeps the white models from becoming silhouettes.
 card(7.0,4.6,[-2.6,5.0,8.8],[0,.36,0],1.34,0xf2f5f7);
 // Thin right kicker for acrylic/ceramic edges.
 card(2.25,8.8,[9.1,4.4,-3.6],[0,.38,0],1.06,0xe7eff3);
 // A small cool strip behind the camera adds a fine horizontal sheen.
 card(9.0,.72,[3.8,3.2,11.6],[0,.0,0],1.15,0xe9f0f4);

 // Flags are as important as lights on metal: they restore dark intervals and depth.
 flag(8.0,12.0,[10.7,1.3,3.8],[0,.1,0],0x0b1013);
 flag(5.4,10.2,[-8.4,1.0,-7.2],[0,.0,0],0x171d21);
 flag(14.0,2.4,[.8,9.0,7.5],[0,.1,0],0x252d32);
 return scene;
}
