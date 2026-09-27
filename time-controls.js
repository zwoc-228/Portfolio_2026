const LOCATIONS=[
  ['local','Device location'],
  ['America/Los_Angeles','Seattle'],
  ['America/New_York','New York'],
  ['Europe/London','London'],
  ['Europe/Berlin','Berlin'],
  ['Asia/Dubai','Dubai'],
  ['Asia/Tokyo','Tokyo'],
  ['Australia/Sydney','Sydney']
];

function hourInZone(zone,date=new Date()){
  if(zone==='local') return date.getHours()+date.getMinutes()/60;
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return Number(values.hour)+Number(values.minute)/60;
}
function formatHour(hour){
  const h=Math.floor(hour)%24,m=Math.round((hour-h)*60)%60;
  const date=new Date(2020,0,1,h,m);
  return new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(date);
}

export function createTimeControls({onChange}){
  const button=document.querySelector('#time-toggle');
  const panel=document.querySelector('#time-panel');
  const select=document.querySelector('#time-zone');
  const slider=document.querySelector('#time-hour');
  const value=document.querySelector('#time-value');
  const nowButton=document.querySelector('#time-now');
  if(!button||!panel||!select||!slider||!value||!nowButton)return {dispose(){}};

  for(const [zone,label] of LOCATIONS){
    const option=document.createElement('option');
    option.value=zone;option.textContent=label;select.append(option);
  }
  const savedZone=localStorage.getItem('portfolio-time-zone')||'local';
  select.value=LOCATIONS.some(([zone])=>zone===savedZone)?savedZone:'local';
  let automatic=localStorage.getItem('portfolio-time-manual')!=='true';
  let manualHour=Number(localStorage.getItem('portfolio-time-hour')||12);
  let timer=0;

  function emit(){
    const hour=automatic?hourInZone(select.value):manualHour;
    const night=hour<6.5||hour>=18.5;
    slider.value=String(hour);
    value.textContent=`${formatHour(hour)} · ${night?'Moonlight':'Sunlight'}`;
    button.dataset.phase=night?'night':'day';
    button.setAttribute('aria-label',`Lighting time: ${formatHour(hour)}. Open time controls`);
    onChange?.({hour,night,zone:select.value,automatic});
  }
  function open(next){
    panel.hidden=!next;
    button.setAttribute('aria-expanded',String(next));
  }
  function refreshTimer(){
    clearInterval(timer);
    timer=automatic?setInterval(emit,60000):0;
  }
  button.addEventListener('click',e=>{e.stopPropagation();open(panel.hidden);});
  panel.addEventListener('pointerdown',e=>e.stopPropagation());
  document.addEventListener('pointerdown',()=>open(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')open(false);});
  select.addEventListener('change',()=>{
    automatic=true;
    localStorage.setItem('portfolio-time-zone',select.value);
    localStorage.removeItem('portfolio-time-manual');
    refreshTimer();emit();
  });
  slider.addEventListener('input',()=>{
    automatic=false;manualHour=Number(slider.value);
    localStorage.setItem('portfolio-time-manual','true');
    localStorage.setItem('portfolio-time-hour',String(manualHour));
    refreshTimer();emit();
  });
  nowButton.addEventListener('click',()=>{
    automatic=true;localStorage.removeItem('portfolio-time-manual');
    refreshTimer();emit();
  });
  refreshTimer();emit();
  return {refresh:emit,dispose(){clearInterval(timer);}};
}
