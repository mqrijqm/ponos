export type Product={id:string;code:string;name:string;manufacturer:'Krono Original'|'Kaindl'|'Tarkett';collection:string;type:'Laminat'|'Parket'|'Vinil';color:string;thickness:number;usageClass:string;waterResistance:string;rooms:string[];dimensions:string;packageCoverage:number;price:number;oldPrice?:number;available:boolean;texture:string;badge?:'Novo'|'Akcija';popular:number;created:number}

const names=['Nordijski hrast','Medni hrast','Dimljeni hrast','Orah Nocturne','Bijeli hrast','Hrast Greige'];
const textures=['nordic','honey','smoked','walnut','white','greige'];
const makers:Product['manufacturer'][]=['Krono Original','Kaindl','Tarkett'];
export const products:Product[]=Array.from({length:18},(_,i)=>({
  id:`floor-${i+1}`,code:`${makers[i%3].split(' ')[0].slice(0,2).toUpperCase()}-${2401+i}`,
  name:`${names[i%6]} ${['Pure','Line','Select'][i%3]}`,manufacturer:makers[i%3],collection:['Atlantic','Natural Touch','Woodstock'][i%3],
  type:(['Laminat','Parket','Vinil'] as const)[i%3],color:['Svijetla','Prirodna','Siva','Tamna','Bijela','Bež'][i%6],thickness:[8,10,12][i%3],
  usageClass:['32/AC4','33/AC5','31/AC3'][i%3],waterResistance:['Standardna','Aqua 24h','Aqua 72h'][i%3],rooms:['Dnevni boravak','Spavaća soba',...(i%3!==0?['Kuhinja']:[])],
  dimensions:['1285 × 192 mm','1383 × 159 mm','1292 × 194 mm'][i%3],packageCoverage:[2.22,1.76,2.01][i%3],price:Math.round((24.9+i*1.85)*100)/100,
  oldPrice:i%5===1?Math.round((31.9+i*1.9)*100)/100:undefined,available:i%7!==0,texture:`/images/textures/${textures[i%6]}.png`,badge:i%6===0?'Novo':i%5===1?'Akcija':undefined,popular:18-i,created:i
}));
