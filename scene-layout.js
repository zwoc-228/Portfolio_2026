// Refit toward the brighter home reference composition.
// x, z, scaleX, scaleY, rotationY, scaleZ.
export const HOME_TRANSFORMS=[
 [-4.18,-.34,1.045,1.09,-.286,.885],
 [0,-.22,1.025,.675,-.012,1.025],
 [4.18,-.37,1.075,1.085,.242,.905]
];

// Same objects, different spatial composition; mobile order is top to bottom.
export function homePose(index,width){
 const f=HOME_TRANSFORMS[index];
 if(width<=760)return {x:0,z:[.5,7,13.5][index],r:[-.12,-.012,.12][index],s:.76};
 return {x:f[0],z:f[1]+[-.05,-.42,.20][index],r:f[4],s:[.94,1.04,.94][index]};
}
