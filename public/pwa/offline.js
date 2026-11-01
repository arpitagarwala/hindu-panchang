/* Saved snapshots only: original dates, locations and settings are never substituted. */
(() => {
  'use strict';
  const KEY='panchang.offline-readings.v1', MONTH_KEY='panchang.offline-months.v1';
  const $=id=>document.getElementById(id);
  let hi=false,recent=[],packs=[],readings=[];
  const text=(en,hindi)=>hi?hindi:en;
  try{hi=JSON.parse(localStorage.getItem('panchang.preferences.v1')||'{}').language==='hi';}catch{/* English fallback. */}
  if(new URL(location.href).searchParams.get('lang')==='hi')hi=true;
  function read(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}}
  const valid=r=>r&&r.schema===1&&r.views?.en&&r.views?.hi&&typeof r.key==='string';
  function load(){recent=read(KEY).filter(valid).slice(0,20);packs=read(MONTH_KEY).filter(p=>p&&p.schema===1&&typeof p.key==='string'&&Array.isArray(p.readings)&&p.readings.length>0&&p.readings.every(valid)).slice(0,3);}
  function node(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
  function monthLabel(pack){return new Date(`${pack.month}-01T12:00:00Z`).toLocaleDateString(hi?'hi-IN':'en-IN',{timeZone:'UTC',month:'long',year:'numeric'})+' · '+(pack.city?.[hi?'hi':'en']||'');}
  function selectDay(key){$('readings').value=key;drawReading();$('reading').scrollIntoView?.({behavior:'smooth',block:'start'});}
  function drawReading(){
    const container=$('reading');container.replaceChildren();
    const reading=readings.find(r=>r.key===$('readings').value);
    if(!reading){container.append(node('p',text('No offline readings yet. Connect and choose Save month offline in the calendar, or open a daily Panchang.','अभी कोई पाठ सहेजा नहीं गया है। इंटरनेट से जुड़कर कैलेंडर में पूरा महीना सहेजें या किसी दिन का पंचांग खोलें।')));return;}
    const view=reading.views[hi?'hi':'en'];container.append(node('h2',view.heading),node('p',reading.city?.[hi?'hi':'en']||'','muted'));
    const saved=new Date(reading.savedAt);container.append(node('p',text('Saved on this device: ','इस उपकरण पर सहेजा गया: ')+(Number.isFinite(saved.getTime())?saved.toLocaleString(hi?'hi-IN':'en-IN'):''),'muted'));
    for(const warning of reading.warnings?.[hi?'hi':'en']||[])container.append(node('p',warning,'notice'));
    const settings=document.createElement('details');settings.append(node('summary',text('Saved calendar settings','सहेजी हुई कैलेंडर पद्धति')),node('p',reading.convention||''));container.append(settings);
    function table(rows){const list=document.createElement('dl');for(const row of rows||[]){const entry=document.createElement('div');entry.append(node('dt',row[0]),node('dd',row[1]));list.append(entry);}return list;}
    container.append(table(view.rows));
    if(view.schedule?.length){const schedule=document.createElement('details');schedule.append(node('summary',text('Day & night Choghadiya','दिन और रात का चौघड़िया')),table(view.schedule));container.append(schedule);}
    if(view.events?.length){container.append(node('h2',text('Festivals & fasting','पर्व और व्रत')));for(const event of view.events){const card=document.createElement('article');card.className='event';card.append(node('h3',event.name));for(const line of event.details||[])card.append(node('p',line));container.append(card);}}
  }
  function drawPack(){
    const pack=packs.find(p=>p.key===$('months').value), language=hi?'hi':'en';
    readings=pack?pack.readings:recent;
    $('remove-month').hidden=!pack;$('pack-info').textContent=pack?`${pack.readings.length} ${text('days saved','दिन सहेजे गए')} · ${pack.convention||''}`:'';
    const festivals=$('month-festivals');festivals.replaceChildren();
    if(pack){
      festivals.append(node('h2',text('Festivals this month','इस महीने के पर्व और व्रत')));
      let count=0;
      for(const day of pack.readings)if(day.views[language].events?.length){
        const card=document.createElement('article');card.className='event';const open=node('button',day.views[language].heading);open.type='button';open.addEventListener('click',()=>selectDay(day.key));card.append(open);
        for(const event of day.views[language].events){count++;card.append(node('h3',event.name));for(const detail of event.details||[])card.append(node('p',detail));}festivals.append(card);
      }
      if(!count)festivals.append(node('p',text('No listed festivals for these saved calendar settings.','इन सहेजी हुई पद्धतियों में कोई पर्व सूचीबद्ध नहीं है।')));
    }
    const selected=$('readings').value;
    const options=readings.map(day=>{const option=node('option',`${day.views[language].heading}${pack?'':' · '+(day.city?.[language]||'')}`);option.value=day.key;return option;});$('readings').replaceChildren(...options);
    if(readings.some(day=>day.key===selected))$('readings').value=selected;
    $('readings').hidden=!readings.length;$('choose').hidden=!readings.length;drawReading();
  }
  function render(){
    document.documentElement.lang=hi?'hi':'en';document.title=text('Saved Panchang · Offline','सहेजा हुआ पंचांग · ऑफलाइन');
    $('language').textContent=hi?'English':'हिन्दी';$('title').textContent=text('Saved Panchang','सहेजा हुआ पंचांग');
    $('notice').textContent=text('Saved readings only—not a fresh calculation. Every date keeps its original location and calendar settings. Connect to download or refresh a month.','केवल सहेजे हुए पाठ—नई गणना नहीं। हर तारीख अपने मूल स्थान और पद्धति की है। महीना डाउनलोड या अपडेट करने के लिए इंटरनेट चाहिए।');
    $('choose-month').textContent=text('Choose a saved month','सहेजा हुआ महीना चुनें');$('choose').textContent=text('Choose any day in this collection','इस संग्रह में कोई दिन चुनें');$('reconnect').textContent=text('Open app / retry connection','ऐप खोलें / फिर से जुड़ें');$('clear').textContent=text('Clear offline readings','सभी ऑफलाइन पाठ हटाएँ');$('owner').textContent=text('Created and owned by','निर्माता और स्वामी');$('remove-month').textContent=text('Remove this saved month','यह सहेजा हुआ महीना हटाएँ');
    const selected=$('months').value;const options=packs.map(pack=>{const option=node('option',monthLabel(pack));option.value=pack.key;return option;});const recentOption=node('option',text('Recently opened days','हाल में खोले गए दिन'));recentOption.value='recent';options.push(recentOption);$('months').replaceChildren(...options);if(selected==='recent'||packs.some(p=>p.key===selected))$('months').value=selected;
    $('months').hidden=!packs.length&&!recent.length;$('choose-month').hidden=$('months').hidden;$('clear').hidden=!packs.length&&!recent.length;drawPack();
  }
  $('months').addEventListener('change',drawPack);$('readings').addEventListener('change',drawReading);$('language').addEventListener('click',()=>{hi=!hi;render();});
  $('remove-month').addEventListener('click',()=>{const selected=$('months').value;if(!confirm(text('Remove this complete month from this device?','इस उपकरण से यह पूरा महीना हटा दें?')))return;try{localStorage.setItem(MONTH_KEY,JSON.stringify(packs.filter(p=>p.key!==selected)));load();render();}catch{$('notice').textContent=text('Could not change device storage.','उपकरण का संग्रह नहीं बदल सके।');}});
  $('clear').addEventListener('click',()=>{if(!confirm(text('Remove all offline months and recent readings? Preferences and bookmarks will stay.','सभी ऑफलाइन महीने और हाल के पाठ हटा दें? आपकी पसंद और बुकमार्क बने रहेंगे।')))return;try{localStorage.removeItem(KEY);localStorage.removeItem(MONTH_KEY);load();render();}catch{$('notice').textContent=text('Browser storage is unavailable.','ब्राउज़र का स्थानीय संग्रह उपलब्ध नहीं है।');}});
  load();render();
})();
