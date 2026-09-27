import * as T from './assets/three.module.js';

// A restrained product-photography environment: large diffusers create broad ceramic
// highlights, while two neutral flags keep enough dark shape for the glaze to read.
export function createStudioEnvironment(){
 const scene=new T.Scene();
 scene.add(new T.Mesh(
  new T.BoxGeometry(36,22,36),
  new T.MeshBasicMaterial({color:0x8f9292,side:T.BackSide})
 ));
 const panel=(w,h,pos,target,value,tint=0xffffff)=>{
  const color=new T.Color(tint).multiplyScalar(value);
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));
  mesh.position.set(...pos);mesh.lookAt(...target);scene.add(mesh);
 };
 panel(14,12,[-11,7,5],[0,.5,0],1.55,0xfffdf8); // window/key
 panel(12,8,[8,8,3],[0,.4,0],.72,0xf4f6f7);     // fill
 panel(16,3,[0,10,-10],[0,.5,0],.90,0xf7f7f5);  // top rim
 panel(10,5,[0,3,10],[0,.3,0],.55,0xe8ebec);    // camera-side lift
 panel(5,11,[10,2,-5],[0,.3,0],.16,0x737778);   // dark flag
 panel(4,9,[-8,1,-8],[0,.2,0],.20,0x777a7b);    // dark flag
 return scene;
}
