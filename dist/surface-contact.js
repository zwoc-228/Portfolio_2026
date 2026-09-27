import * as T from './assets/three.module.js';
// Soft neutral contact patch on the same desk plane as model AO. Never mirrored.
export function createSurfaceContact(scene){
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{opacity:{value:.12}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec2 vUv;uniform float opacity;void main(){vec2 p=abs(vUv-.5);float x=1.-smoothstep(.33,.5,p.x);float y=exp(-p.y*p.y*28.)*(1.-smoothstep(.35,.5,p.y));gl_FragColor=vec4(vec3(.12),x*y*opacity);}'});
 const mesh=new T.Mesh(new T.PlaneGeometry(1,1),material);mesh.name='UI desk contact';mesh.rotation.x=-Math.PI/2;mesh.renderOrder=2;mesh.visible=false;scene.add(mesh);
 return {mesh,place(point,width,depth,opacity=.12){mesh.position.set(point.x,-.010,point.z);mesh.scale.set(width*1.22,Math.max(.12,depth),1);material.uniforms.opacity.value=opacity;mesh.visible=opacity>0;},hide(){mesh.visible=false;},dispose(){mesh.removeFromParent();mesh.geometry.dispose();material.dispose();}};
}
