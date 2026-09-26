import * as T from './assets/three.module.js';
// Real geometry AO footprints. Move/rotate/scale with the model, but stay on the desk.
export function createContactShadows(scene, roots, layouts, textures, reflection) {
 const meshes=roots.map((root,i)=>{
  const l=layouts[i], texture=textures[i];
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
   polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,
   uniforms:{map:{value:texture},lift:{value:0},opacity:{value:.53}},
   vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`uniform sampler2D map;uniform float lift;uniform float opacity;varying vec2 vUv;
   void main(){float r=(.7+lift*7.)/512.;float a=texture2D(map,vUv).r*.28;
   a+=(texture2D(map,vUv+vec2(r,0.)).r+texture2D(map,vUv-vec2(r,0.)).r+texture2D(map,vUv+vec2(0.,r)).r+texture2D(map,vUv-vec2(0.,r)).r)*.12;
   a+=(texture2D(map,vUv+vec2(r,r)).r+texture2D(map,vUv+vec2(-r,r)).r+texture2D(map,vUv+vec2(r,-r)).r+texture2D(map,vUv-vec2(r,r)).r)*.06;
   gl_FragColor=vec4(.10,.12,.13,(1.-a)*opacity*(1.-lift*.6));}`});
  const mesh=new T.Mesh(new T.PlaneGeometry(l.width,l.depth),material);
  mesh.name=l.name+' baked contact';mesh.rotation.x=-Math.PI/2;mesh.position.set(l.x,-.013,l.z);mesh.renderOrder=2;
  root.add(mesh);return mesh;
 });
 const center=new T.Vector3();
 return {meshes,update(){
  roots.forEach((root,i)=>{
   const mesh=meshes[i],l=layouts[i],lift=Math.max(0,root.position.y);
   mesh.position.y=(-.013-root.position.y)/root.scale.y;
   mesh.material.uniforms.lift.value=Math.min(1,lift/.24);
   root.updateMatrixWorld(true);center.set(l.x,0,l.z).applyMatrix4(root.matrixWorld);
   reflection?.setObjectFootprint(i,center.x,center.z,l.width*root.scale.x*.50,l.depth*root.scale.z*.50,Math.max(0,1-lift*1.75));
  });
 },dispose(){meshes.forEach(m=>{m.removeFromParent();m.geometry.dispose();m.material.dispose();});textures.forEach(t=>t.dispose());}};
}
