export type AppLanguage = 'en' | 'hi';
export const isHindi = (locale: string) => locale.startsWith('hi');
const words: Record<string, string> = {};
function pairs(english: string, hindi: string) {
  const en = english.split('|'), hi = hindi.split('|');
  if (en.length !== hi.length) throw new Error('Translation table is incomplete.');
  en.forEach((key, i) => { words[key] = hi[i]; });
}
pairs('Pratipada|Dvitiya|Tritiya|Chaturthi|Panchami|Shashthi|Saptami|Ashtami|Navami|Dashami|Ekadashi|Dwadashi|Trayodashi|Chaturdashi|Purnima|Amavasya', 'प्रतिपदा|द्वितीया|तृतीया|चतुर्थी|पंचमी|षष्ठी|सप्तमी|अष्टमी|नवमी|दशमी|एकादशी|द्वादशी|त्रयोदशी|चतुर्दशी|पूर्णिमा|अमावस्या');
pairs('Ashwini|Bharani|Krittika|Rohini|Mrigashirsha|Ardra|Punarvasu|Pushya|Ashlesha|Magha|Purva Phalguni|Uttara Phalguni|Hasta|Chitra|Swati|Vishakha|Anuradha|Jyeshtha|Mula|Purva Ashadha|Uttara Ashadha|Shravana|Dhanishtha|Shatabhisha|Purva Bhadrapada|Uttara Bhadrapada|Revati', 'अश्विनी|भरणी|कृत्तिका|रोहिणी|मृगशिरा|आर्द्रा|पुनर्वसु|पुष्य|आश्लेषा|मघा|पूर्वा फाल्गुनी|उत्तरा फाल्गुनी|हस्त|चित्रा|स्वाती|विशाखा|अनुराधा|ज्येष्ठा|मूल|पूर्वाषाढ़ा|उत्तराषाढ़ा|श्रवण|धनिष्ठा|शतभिषा|पूर्वाभाद्रपदा|उत्तराभाद्रपदा|रेवती');
pairs('Vishkambha|Priti|Ayushman|Saubhagya|Shobhana|Atiganda|Sukarma|Dhriti|Shula|Ganda|Vriddhi|Dhruva|Vyaghata|Harshana|Vajra|Siddhi|Vyatipata|Variyana|Parigha|Shiva|Siddha|Sadhya|Shubha|Shukla|Brahma|Indra|Vaidhriti', 'विष्कम्भ|प्रीति|आयुष्मान|सौभाग्य|शोभन|अतिगण्ड|सुकर्मा|धृति|शूल|गण्ड|वृद्धि|ध्रुव|व्याघात|हर्षण|वज्र|सिद्धि|व्यतीपात|वरीयान|परिघ|शिव|सिद्ध|साध्य|शुभ|शुक्ल|ब्रह्म|इन्द्र|वैधृति');
pairs('Bava|Balava|Kaulava|Taitila|Garija|Vanija|Vishti|Shakuni|Chatushpada|Naga|Kimstughna', 'बव|बालव|कौलव|तैतिल|गर|वणिज|विष्टि|शकुनि|चतुष्पद|नाग|किंस्तुघ्न');
pairs('Chaitra|Vaishakha|Ashadha|Bhadrapada|Ashwin|Kartik|Margashirsha|Paush|Magh|Phalguna|Shukla Paksha|Krishna Paksha|Amanta|Purnimanta|Adhika', 'चैत्र|वैशाख|आषाढ़|भाद्रपद|आश्विन|कार्तिक|मार्गशीर्ष|पौष|माघ|फाल्गुन|शुक्ल पक्ष|कृष्ण पक्ष|अमान्त|पूर्णिमान्त|अधिक');
pairs('Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Ravivāra|Somavāra|Maṅgalavāra|Budhavāra|Guruvāra|Śukravāra|Śanivāra', 'रविवार|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार|रविवार|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार');
pairs('Brahma Muhurta|Abhijit Muhurta|Rahu Kalam|Yamaganda|Gulika Kalam|Tithi|Nakshatra|Yoga|Karana|Vara|Udveg|Char|Labh|Amrit|Kaal|Shubh|Rog', 'ब्रह्म मुहूर्त|अभिजित मुहूर्त|राहुकाल|यमगण्ड|गुलिक काल|तिथि|नक्षत्र|योग|करण|वार|उद्वेग|चर|लाभ|अमृत|काल|शुभ|रोग');
pairs('North Indian|Maharashtra|Gujarat|Telugu · Andhra & Telangana|Karnataka|Tamil Nadu|Bengal|Kerala|Odisha|Nepal|Smarta|Vaishnava · common rules', 'उत्तर भारतीय|महाराष्ट्र|गुजरात|तेलुगु · आंध्र और तेलंगाना|कर्नाटक|तमिलनाडु|बंगाल|केरल|ओडिशा|नेपाल|स्मार्त|वैष्णव · सामान्य नियम');
pairs('New Delhi|Delhi|Mumbai|Bengaluru|Kolkata|Chennai|Hyderabad|Pune|Ahmedabad|Jaipur|Lucknow|Varanasi|Ujjain|India|Current location|Shared location|My location|Custom location', 'नई दिल्ली|दिल्ली|मुंबई|बेंगलुरु|कोलकाता|चेन्नई|हैदराबाद|पुणे|अहमदाबाद|जयपुर|लखनऊ|वाराणसी|उज्जैन|भारत|वर्तमान स्थान|साझा किया गया स्थान|मेरा स्थान|चुना हुआ स्थान');
pairs('Kamada|Mohini|Nirjala|Devshayani|Shravana Putrada|Parivartini|Papankusha|Devutthana|Mokshada|Pausha Putrada|Jaya|Amalaki|Varuthini|Apara|Yogini|Kamika|Aja|Indira|Rama|Utpanna|Saphala|Shattila|Vijaya|Papamochani|Padmini|Parama', 'कामदा|मोहिनी|निर्जला|देवशयनी|श्रावण पुत्रदा|परिवर्तिनी|पापांकुशा|देवउठनी|मोक्षदा|पौष पुत्रदा|जया|आमलकी|वरूथिनी|अपरा|योगिनी|कामिका|अजा|इन्दिरा|रमा|उत्पन्ना|सफला|षट्तिला|विजया|पापमोचनी|पद्मिनी|परमा');
pairs('Chaitra Navratri begins|Gudi Padwa|Ugadi|Rama Navami|Hanuman Jayanti · Chaitra tradition|Akshaya Tritiya|Buddha Purnima|Ganga Dussehra|Jagannath Ratha Yatra|Guru Purnima|Nag Panchami|Raksha Bandhan|Krishna Janmashtami|Hartalika Teej|Ganesh Chaturthi|Radha Ashtami|Anant Chaturdashi|Sharad Navratri begins|Durga Ashtami|Durga Shashthi · Bodhon|Maha Saptami|Maha Navami|Vijayadashami · Dussehra|Sharad Purnima · Kojagari|Karwa Chauth|Ahoi Ashtami|Dhanteras|Naraka Chaturdashi|Diwali · Lakshmi Puja|Kali Puja|Govardhan Puja|Gujarati New Year · Bestu Varas|Bhai Dooj|Chhath Puja · Sandhya Arghya|Tulsi Vivah · Dwadashi tradition|Kartik Purnima · Dev Deepawali|Vasant Panchami|Ratha Saptami', 'चैत्र नवरात्रि आरम्भ|गुड़ी पड़वा|उगादी|राम नवमी|हनुमान जयंती · चैत्र परंपरा|अक्षय तृतीया|बुद्ध पूर्णिमा|गंगा दशहरा|जगन्नाथ रथ यात्रा|गुरु पूर्णिमा|नाग पंचमी|रक्षाबंधन|कृष्ण जन्माष्टमी|हरतालिका तीज|गणेश चतुर्थी|राधा अष्टमी|अनन्त चतुर्दशी|शारदीय नवरात्रि आरम्भ|दुर्गा अष्टमी|दुर्गा षष्ठी · बोधन|महा सप्तमी|महा नवमी|विजयादशमी · दशहरा|शरद पूर्णिमा · कोजागरी|करवा चौथ|अहोई अष्टमी|धनतेरस|नरक चतुर्दशी|दीपावली · लक्ष्मी पूजा|काली पूजा|गोवर्धन पूजा|गुजराती नववर्ष · बेस्टु वरस|भाई दूज|छठ पूजा · संध्या अर्घ्य|तुलसी विवाह · द्वादशी परंपरा|कार्तिक पूर्णिमा · देव दीपावली|वसन्त पंचमी|रथ सप्तमी');
pairs('Pradosh Vrat|Angarki Sankashti Chaturthi|Sankashti Chaturthi|Purnima Vrat|Maha Shivaratri|Masik Shivaratri|Sandhi Puja|Dahi Handi · Gopalkala|Holika Dahan|Holi · Rangwali|Onam · Thiruvonam|Thai Pongal|Puthandu · Tamil New Year|Bhogi Pandigai|Mattu Pongal|Kaanum Pongal|Sankranti|Mesha|Vrishabha|Mithuna|Karka|Simha|Kanya|Tula|Vrishchika|Dhanu|Makara|Kumbha|Meena', 'प्रदोष व्रत|अंगारकी संकष्टी चतुर्थी|संकष्टी चतुर्थी|पूर्णिमा व्रत|महा शिवरात्रि|मासिक शिवरात्रि|संधि पूजा|दही हांडी · गोपालकाला|होलिका दहन|होली · रंगवाली|ओणम · तिरुवोणम|थाई पोंगल|पुथांडु · तमिल नववर्ष|भोगी पण्डिगै|मट्टु पोंगल|कानुम पोंगल|संक्रान्ति|मेष|वृषभ|मिथुन|कर्क|सिंह|कन्या|तुला|वृश्चिक|धनु|मकर|कुम्भ|मीन');
const sortedNames = Object.keys(words).sort((a,b) => b.length-a.length);
const namePattern = new RegExp(sortedNames.map(v => v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'), 'g');
export function nameLabel(value: string | undefined, locale: string): string {
  if (!value) return '';
  if (!isHindi(locale)) return value;
  if (words[value]) return words[value];
  // Longest complete phrases first; never translate technical IDs or API payloads.

  return value.replace(namePattern, key => words[key]);
}
export const uiHindi: Record<string,string> = {
  'Panchang':'पंचांग','Today’s Hindu Panchang':'आज का हिन्दू पंचांग','Your sacred everyday':'आपका दैनिक पंचांग',
  'Skip to Panchang':'पंचांग पर जाएँ','Open navigation':'मेनू खोलें','Close navigation':'मेनू बंद करें','Preferences':'सेटिंग्स','Settings':'सेटिंग्स','Close dialog':'बंद करें',
  'Change location':'स्थान बदलें','Change Panchang location':'पंचांग का स्थान बदलें','Detect my location':'मेरा स्थान खोजें','Detecting location…':'स्थान खोज रहे हैं…','Where are you?':'आप कहाँ हैं?',
  'Today':'आज','Previous day':'पिछला दिन','Next day':'अगला दिन','Select date':'तारीख चुनें','Previous month':'पिछला महीना','Next month':'अगला महीना','Share Panchang':'पंचांग साझा करें','Download calendar event':'कैलेंडर डाउनलोड करें','Print daily Panchang':'पंचांग प्रिंट करें',
  'DAILY PANCHANG':'दैनिक पंचांग','TODAY':'आज','SELECTED DAY':'चुना हुआ दिन','Vikram Samvat':'विक्रम संवत','Tithi begins':'तिथि आरम्भ','Tithi ends':'तिथि समाप्त','Until':'तक','From':'से','to':'तक','Starts':'आरम्भ','Ends':'समाप्त',
  'SUNRISE':'सूर्योदय','SUNSET':'सूर्यास्त','MOON PHASE':'चंद्र अवस्था','ABHIJIT MUHURTA':'अभिजित मुहूर्त','Waxing Moon':'बढ़ता चंद्रमा','Waning Moon':'घटता चंद्रमा','illuminated':'प्रकाशित',
  'A fresh beginning':'नए दिन की शुरुआत','Time to slow down':'विश्राम का समय','A traditional midday window':'दोपहर का शुभ समय','The five elements of today':'पंचांग के पाँच अंग','What do these mean?':'इनका अर्थ जानें',
  'Make time for what matters':'शुभ कार्यों का समय','AUSPICIOUS WINDOWS':'शुभ समय','TIMES TO BE MINDFUL':'सावधानी का समय','For prayer & reflection':'पूजा और ध्यान के लिए','For new beginnings':'शुभ कार्यों के लिए',
  'Choghadiya':'चौघड़िया','Day':'दिन','Night':'रात','I’m planning':'कार्य चुनें','My day':'मेरा दिन','Puja':'पूजा','Travel':'यात्रा','Work':'काम','NOW':'अभी','Favorable for movement':'यात्रा के लिए शुभ','Traditionally favorable':'परंपरागत शुभ समय','Avoid new beginnings':'नए कार्य टालें',
  'Your lunar calendar':'हिन्दू कैलेंडर','Festival or fast':'पर्व या व्रत','Select a date for details':'विवरण के लिए तारीख चुनें','View daily Panchang':'इस दिन का पंचांग देखें','Festivals this month':'इस महीने के पर्व और व्रत',
  'On this day':'इस दिन के पर्व और व्रत','On the horizon':'आने वाले पर्व','View all':'सभी देखें','Festivals & Rituals':'पर्व और अनुष्ठान','Festivals, fasting & parana':'पर्व, व्रत और पारण','Upcoming festivals':'आने वाले पर्व',
  'Search festivals and fasting days':'पर्व और व्रत खोजें','Search Ekadashi, Diwali, Pradosh…':'एकादशी, दीपावली, प्रदोष खोजें…','Show':'दिखाएँ','All observances':'सभी पर्व और व्रत','Festivals':'पर्व','Fasting days':'व्रत','Lunar dates':'चंद्र तिथियाँ','Solar ingresses':'संक्रान्ति','Add to calendar':'कैलेंडर में जोड़ें',
  'More details':'अधिक जानकारी','Tithi window':'तिथि का समय','Ritual window':'पूजा का समय','Puja window':'पूजा का समय','Ingress':'संक्रान्ति का समय','PARANA · BREAKING THE FAST':'पारण · व्रत खोलने का समय','After':'के बाद','Open this day':'इस दिन का पंचांग','Rule reference':'मूल संदर्भ','Regional review needed':'स्थानीय परंपरा की पुष्टि करें','No automatic window · needs confirmation':'समय के लिए स्थानीय पुष्टि आवश्यक',
  'Hari Vasara ends':'हरिवासर समाप्त','Dwadashi ends':'द्वादशी समाप्त','No listed observances in this period. Browse another month.':'इस अवधि में कोई पर्व सूचीबद्ध नहीं है। दूसरा महीना देखें।','Calculating observances…':'पर्वों की जानकारी आ रही है…','No matches. Try another search or choose All observances.':'कोई परिणाम नहीं मिला। दूसरी खोज करें या सभी पर्व चुनें।',
  'Your day at a glance':'एक नज़र में आपका दिन','Moonrise':'चंद्रोदय','Moonset':'चंद्रास्त','Daylight':'दिन की अवधि','Night length':'रात की अवधि','Unavailable':'उपलब्ध नहीं','No event on this date':'इस तारीख पर नहीं',
  'A time to be mindful':'सावधानी का समय','A traditional favorable window is active':'अभी शुभ समय चल रहा है','Move through your day with awareness':'सजगता से अपना दिन बिताएँ','No listed Muhurta or caution window is active right now.':'अभी कोई विशेष मुहूर्त या सावधानी का समय नहीं है।','Next:':'अगला:','Next transition:':'अगला परिवर्तन:','No more listed daily windows today.':'आज के लिए कोई और समय सूचीबद्ध नहीं है।','Daily timing schedule':'दिन की समय-सारणी','Show all windows':'सभी समय देखें','Active now':'अभी चल रहा है','Traditional caution period':'सावधानी का समय','Traditional favorable period':'शुभ समय',
  'A MOMENT OF WISDOM':'आज का गीता श्लोक','Bhagavad Gita':'श्रीमद्भगवद्गीता','Chapter':'अध्याय','Verse':'श्लोक','Simple meaning':'सरल भावार्थ',
  'Location':'स्थान','Change':'बदलें','Regional tradition':'क्षेत्रीय परंपरा','Lunar month convention':'महीने की पद्धति','Ekadashi tradition':'एकादशी की परंपरा','Sunrise convention':'सूर्योदय की पद्धति','Language':'भाषा','English':'अंग्रेज़ी','Simple reading':'सरल दृश्य','24-hour clock':'२४ घंटे का समय','Larger text':'बड़े अक्षर','Evening theme':'गहरा रंग','All set':'हो गया','Refresh device location on visits':'अगली बार वर्तमान स्थान खोजें','Turn off to keep your current coordinates pinned':'बंद करने पर चुना हुआ स्थान याद रहेगा','Saved on this device. No account needed.':'आपकी पसंद इस उपकरण पर सहेजी जाती है।',
  'Upper edge · Drik default':'सूर्य का ऊपरी किनारा','Geometric center':'सूर्य का केंद्र','Smarta':'स्मार्त','Vaishnava · common rules':'वैष्णव · सामान्य नियम','Hide extra details and the Choghadiya grid':'केवल मुख्य जानकारी दिखाएँ','Display 18:30 instead of 06:30 pm':'समय १८:३० की तरह दिखाएँ','A little extra breathing room for reading':'पढ़ने के लिए बड़े और स्पष्ट अक्षर','A softer, darker view for quiet moments':'कम रोशनी में आरामदायक रंग',
  'My Saved Days':'मेरे सहेजे हुए दिन','Open Panchang':'पंचांग खोलें','Explore your day':'आज का पंचांग देखें','Save this day':'यह दिन सहेजें','Unsave this day':'यह दिन हटाएँ','A little space for meaningful days.':'अपने विशेष दिन यहाँ सहेजें।','Use the bookmark in the daily Panchang to save a day here.':'दिन सहेजने के लिए पंचांग में बुकमार्क चुनें।',
  'Learn Panchang':'पंचांग सीखें','The lunar day':'चंद्र तिथि','The Moon’s constellation':'चंद्रमा का नक्षत्र','The Sun–Moon combination':'सूर्य और चंद्रमा का योग','Half of a lunar day':'तिथि का आधा भाग','The weekday':'सप्ताह का दिन',
  'How this Panchang is calculated':'पंचांग की गणना कैसे होती है','Calculation details':'गणना की जानकारी','Today’s Panchang by city':'शहर के अनुसार आज का पंचांग','Source code · AGPL':'स्रोत कोड · AGPL','Location & privacy':'स्थान और गोपनीयता','Created and owned by':'निर्माता और स्वामी','Arpit Agarwala':'अर्पित अग्रवाला','Kundali & Jyotish':'कुंडली और ज्योतिष',
  'Reading the sky for your city…':'पंचांग की जानकारी आ रही है…','We couldn’t calculate this day.':'इस दिन की गणना नहीं हो सकी।','Try again':'फिर प्रयास करें','The lunar calendar could not load. Please try again.':'कैलेंडर नहीं खुल सका। फिर प्रयास करें।','Calculating lunar dates…':'तिथियाँ आ रही हैं…',
  'Search city':'शहर खोजें','Search cities, towns, villages or postal codes worldwide. Add a state or country after a comma to narrow your search.':'अपना शहर, गाँव या पिनकोड खोजें। ज़रूरत हो तो राज्य या देश भी लिखें।','Try Ayodhya, Udupi, Paris, Texas…':'अयोध्या, उज्जैन, वाराणसी खोजें…','Use my current location':'मेरा वर्तमान स्थान लें','Locating…':'स्थान खोज रहे हैं…','Enter coordinates':'अक्षांश और देशांतर भरें','Location name':'स्थान का नाम','Latitude':'अक्षांश','Longitude':'देशांतर','Time zone':'समय क्षेत्र','Use these coordinates':'यह स्थान चुनें','RECENT LOCATIONS':'हाल में चुने गए स्थान','Popular cities':'प्रमुख शहर','Offline directory':'सहेजे हुए शहर','No matching place yet.':'कोई स्थान नहीं मिला। दूसरा नाम खोजें।',
};
export function translator(locale: string) { return (text: string) => isHindi(locale) ? uiHindi[text] || words[text] || text : text; }
export function formatTime(instant: string | undefined, timeZone: string, hour24: boolean, locale: string) {
  if (!instant) return '—';
  const value = new Date(instant).toLocaleTimeString(locale,{timeZone,hour:'2-digit',minute:'2-digit',hour12:!hour24});
  return isHindi(locale) ? value.replace(/\bam\b/gi,'पूर्वाह्न').replace(/\bpm\b/gi,'अपराह्न') : value;
}

export function monthNameLabel(value: string, locale: string) {
  if (!isHindi(locale)) return value;
  return nameLabel(value.replace('Shravana','श्रावण').replace('Jyeshtha','ज्येष्ठ'),locale);
}
Object.assign(uiHindi, {
  'Your browser could not save these preferences.':'ब्राउज़र आपकी पसंद सहेज नहीं सका।',
  'Day removed from saved days':'सहेजा हुआ दिन हटा दिया गया।',
  'Day saved on this device':'यह दिन सहेज लिया गया।',
  'Saved for this session. Browser storage is unavailable.':'अभी के लिए सहेज लिया गया। ब्राउज़र में स्थायी रूप से नहीं सहेज सके।',
  'Panchang summary copied to clipboard':'पंचांग कॉपी हो गया।',
  'Panchang summary downloaded':'पंचांग डाउनलोड हो गया।',
  'Calendar file downloaded':'कैलेंडर डाउनलोड हो गया।',
  'Time zone unavailable. Please enter coordinates and a time zone.':'समय क्षेत्र नहीं मिल सका। अक्षांश, देशांतर और समय क्षेत्र भरें।'
});
