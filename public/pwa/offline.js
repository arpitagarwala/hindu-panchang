/* This reader uses only snapshots saved on this device. No calculations, network
 * requests, date substitutions, or location substitutions happen here. */
(() => {
  'use strict';
  const KEY='panchang.offline-readings.v1';
  const $=id=>document.getElementById(id);
  let hi=false, readings=[];
  try {hi=JSON.parse(localStorage.getItem('panchang.preferences.v1')||'{}').language==='hi';}catch{/* Use English. */}
  if(new URL(location.href).searchParams.get('lang')==='hi')hi=true;
  function load(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');readings=Array.isArray(value)?value.filter(r=>r&&r.schema===1&&r.views?.en&&r.views?.hi&&typeof r.key==='string').slice(0,20):[];}catch{readings=[];}}
  const text=(en,hindi)=>hi?hindi:en;
  function node(tag,value,className){const element=document.createElement(tag);element.textContent=value;if(className)element.className=className;return element;}
  function drawReading(){
    const container=$('reading');container.replaceChildren();
    const reading=readings.find(r=>r.key===$('readings').value);
    if(!reading){container.append(node('p',text('No offline readings yet. Open a daily Panchang while connected to save it on this device.','अभी कोई पाठ सहेजा नहीं गया है। इंटरनेट से जुड़कर किसी दिन का पंचांग खोलें; वह इस उपकरण पर सहेज लिया जाएगा।')));return;}
    const view=reading.views[hi?'hi':'en'];
    container.append(node('h2',view.heading),node('p',reading.city?.[hi?'hi':'en']||'', 'muted'));
    const saved=new Date(reading.savedAt);
    container.append(node('p',text('Saved on this device: ','इस उपकरण पर सहेजा गया: ')+(Number.isFinite(saved.getTime())?saved.toLocaleString(hi?'hi-IN':'en-IN'):''),'muted'));
    for(const warning of reading.warnings?.[hi?'hi':'en']||[])container.append(node('p',warning,'notice'));
    const settings=document.createElement('details');settings.append(node('summary',text('Saved calendar settings','सहेजी हुई कैलेंडर पद्धति')),node('p',reading.convention||''));container.append(settings);
    const list=document.createElement('dl');
    for(const row of view.rows||[]){const entry=document.createElement('div');entry.append(node('dt',row[0]),node('dd',row[1]));list.append(entry);}container.append(list);
    if(view.events?.length){container.append(node('h2',text('Festivals & fasting','पर्व और व्रत')));for(const event of view.events){const card=document.createElement('article');card.className='event';card.append(node('h3',event.name));for(const line of event.details||[])card.append(node('p',line));container.append(card);}}
  }
  function render(){
    document.documentElement.lang=hi?'hi':'en';document.title=text('Saved Panchang · Offline','सहेजा हुआ पंचांग · ऑफलाइन');
    $('language').textContent=hi?'English':'हिन्दी';$('title').textContent=text('Saved Panchang','सहेजा हुआ पंचांग');
    $('notice').textContent=text('Saved readings only—not a fresh online calculation. Each reading keeps its original date, location and calendar settings. Connect to calculate another day.','केवल सहेजे हुए पाठ—नई ऑनलाइन गणना नहीं। हर पाठ अपनी मूल तारीख, स्थान और पद्धति का है। दूसरे दिन की गणना के लिए इंटरनेट से जुड़ें।');
    $('choose').textContent=text('Choose a saved day','सहेजा हुआ दिन चुनें');$('reconnect').textContent=text('Open app / retry connection','ऐप खोलें / फिर से जुड़ें');$('clear').textContent=text('Clear offline readings','ऑफलाइन पाठ हटाएँ');$('owner').textContent=text('Created and owned by','निर्माता और स्वामी');
    const selected=$('readings').value;const options=readings.map(reading=>{const option=node('option',`${reading.views[hi?'hi':'en'].heading} · ${reading.city?.[hi?'hi':'en']||''}`);option.value=reading.key;return option;});$('readings').replaceChildren(...options);if(readings.some(r=>r.key===selected))$('readings').value=selected;
    $('readings').hidden=!readings.length;$('choose').hidden=!readings.length;$('clear').hidden=!readings.length;drawReading();
  }
  $('readings').addEventListener('change',drawReading);
  $('language').addEventListener('click',()=>{hi=!hi;render();});
  $('clear').addEventListener('click',()=>{if(!confirm(text('Remove the saved offline readings from this device? Your other preferences and bookmarks will stay.','इस उपकरण से ऑफलाइन पाठ हटा दें? आपकी बाकी पसंद और बुकमार्क बने रहेंगे।')))return;try{localStorage.removeItem(KEY);load();render();}catch{$('notice').textContent=text('Browser storage is unavailable.','ब्राउज़र का स्थानीय संग्रह उपलब्ध नहीं है।');}});
  load();render();
})();
