import * as T from './assets/three.module.js';
// Reflection-only studio tuned toward a bright silver tabletop shot.
// Keep the room itself dark so the luminous cards, not the room shell,
// define the specular language. This preserves material separation.
export function createStudioEnvironment(){
 const scene=new T.Scene();
 const room=new T.Mesh(new T.BoxGeometry(30,18,30),new T.MeshBasicMaterial({color:0x3f474c,side:T.BackSide}));
 scene.add(room);
 function card(w,h,pos,target,intensity,tint=0xffffff){
  const m=new T.Mesh(
   new T.PlaneGeometry(w,h),
   new T.MeshBasicMaterial({color:new T.Color(tint).multiplyScalar(intensity),side:T.DoubleSide})
  );
  m.position.set(...pos);m.lookAt(...target);scene.add(m);
 }
 // Large left key panel: broad silver highlight across the table.
 card(14.4,13.8,[-11.8,6.8,4.1],[0,0.42,0],5.15,0xfffcf7);
 // Overhead/front lift so the scene stays bright without flattening the shadows.
 card(11.8,6.4,[-0.8,10.0,1.1],[0,0.32,0],3.35,0xf6f8fb);
 // Soft frontal lift centered slightly to the left.
 card(7.4,5.1,[-1.7,4.8,9.0],[0,0.34,0],1.48,0xf2f5f7);
 // Narrow right kicker so acrylic edges read but don't wash out.
 card(2.8,8.0,[8.8,3.8,-4.1],[0,0.42,0],1.10,0xeaf1f4);
 // Dark flag on the right to reintroduce contrast into transparent and metallic forms.
 const flag=new T.Mesh(new T.PlaneGeometry(8.5,11.5),new T.MeshBasicMaterial({color:0x0c1014,side:T.DoubleSide}));
 flag.position.set(10.8,1.1,3.5);flag.lookAt(0,0,0);scene.add(flag);
 return scene;
}
