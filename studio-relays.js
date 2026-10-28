import * as T from './assets/three.module.js';
// Wires in Information Relays (portfolio p. 7) connect the instruments into one field.
export function createStudioRelays(scene){
 const group=new T.Group();group.name='Portfolio information relays';scene.add(group);
 let mobile=null;
 function layout(width){const next=width<=760;if(next===mobile)return;mobile=next;
  for(const o of [...group.children]){o.geometry.dispose();o.material.dispose();group.remove(o);}
  const paths=mobile?[
   [[1.1,.5],[2.1,1.8],[1.7,3.4],[2.1,5.2],[1.2,7]],
   [[-1.2,7],[-2.2,8.6],[-1.9,10.6],[-2.3,12.5],[-1.1,13.5]]
  ]:[
   [[-4.6,-1.9],[-4.2,-2.5],[-2.8,-2.3],[-2.1,-2.6],[-.7,-1.9]],
   [[.6,-1.9],[1.5,-2.7],[2.2,-2.3],[3.1,-2.6],[4.7,-1.8]]
  ];
  paths.forEach((points,i)=>{const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,.012,z)));const mesh=new T.Mesh(new T.TubeGeometry(curve,96,.012,6,false),new T.MeshStandardMaterial({color:i?0xaf833d:0x476c85,metalness:.45,roughness:.4}));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);});
 }
 return {group,layout};
}
