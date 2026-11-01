import type { Region } from '../calendar-options';
export type Anchor = 'sunrise' | 'madhyahna' | 'pradosh' | 'nishita' | 'moonrise' | 'aparahna' | 'arunodaya';
export interface FestivalRule { id:string; name:string; month:number; tithi:number; anchor:Anchor; source:string; regions?:Region[]; review?:string }
const root='https://www.drikpanchang.com';
// Month numbers are zero-based AMANTA months. Region changes names and inclusion,
// never changes the astronomical instant or shifts Krishna month twice.
export const FESTIVAL_RULES:FestivalRule[]=[
  {id:'chaitra-navratri',name:'Chaitra Navratri begins',month:0,tithi:1,anchor:'sunrise',source:`${root}/navratri/chaitra-navratri-date-time.html`,review:'Ghatasthapana requires a separate lagna, nakshatra and prohibited-time check; this is the festival date.'},
  {id:'gudi-padwa',name:'Gudi Padwa',month:0,tithi:1,anchor:'sunrise',regions:['maharashtra'],source:`${root}/festivals/gudi-padwa/gudi-padwa-date-time.html`},
  {id:'ugadi',name:'Ugadi',month:0,tithi:1,anchor:'sunrise',regions:['telugu','kannada'],source:`${root}/festivals/ugadi/ugadi-date-time.html`},
  {id:'rama-navami',name:'Rama Navami',month:0,tithi:9,anchor:'madhyahna',source:`${root}/festivals/ramnavami/ram-navami-date-time.html`},
  {id:'hanuman-jayanti',name:'Hanuman Jayanti · Chaitra tradition',month:0,tithi:15,anchor:'sunrise',regions:['north','maharashtra','gujarat','bengal','odisha','nepal'],source:`${root}/festivals/hanuman-jayanti/hanuman-jayanti-date-time.html`},
  {id:'akshaya-tritiya',name:'Akshaya Tritiya',month:1,tithi:3,anchor:'sunrise',source:`${root}/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html`},
  {id:'buddha-purnima',name:'Buddha Purnima',month:1,tithi:15,anchor:'sunrise',source:`${root}/festivals/buddha-purnima/buddha-purnima-date-time.html`},
  {id:'ganga-dussehra',name:'Ganga Dussehra',month:2,tithi:10,anchor:'sunrise',source:`${root}/festivals/ganga-dussehra/ganga-dussehra-date-time.html`},
  {id:'ratha-yatra',name:'Jagannath Ratha Yatra',month:3,tithi:2,anchor:'sunrise',source:`${root}/festivals/rath-yatra/rath-yatra-date-time.html`},
  {id:'guru-purnima',name:'Guru Purnima',month:3,tithi:15,anchor:'sunrise',source:`${root}/festivals/guru-purnima/guru-purnima-date-time.html`},
  {id:'nag-panchami',name:'Nag Panchami',month:4,tithi:5,anchor:'sunrise',source:`${root}/festivals/nag-panchami/nag-panchami-date-time.html`},
  {id:'raksha-bandhan',name:'Raksha Bandhan',month:4,tithi:15,anchor:'aparahna',source:`${root}/festivals/raksha-bandhan/raksha-bandhan-date-time.html`,review:'Bhadra exclusions are applied to the displayed Aparahna window. Local Shravan Upakarma rules are separate.'},
  {id:'janmashtami',name:'Krishna Janmashtami',month:4,tithi:23,anchor:'nishita',source:`${root}/festivals/krishna-janmashtami/krishna-janmashtami-date-time.html`,review:'Nishita-based Smarta date. Rohini tie-breaks and sampradaya-specific Vaishnava dates/parana need confirmation.'},
  {id:'hartalika',name:'Hartalika Teej',month:5,tithi:3,anchor:'sunrise',regions:['north','maharashtra','nepal'],source:`${root}/festivals/hartalika-teej/hartalika-teej-date-time.html`},
  {id:'ganesh-chaturthi',name:'Ganesh Chaturthi',month:5,tithi:4,anchor:'madhyahna',source:`${root}/festivals/ganesh-chaturthi/ganesh-chaturthi-date-time.html`},
  {id:'radha-ashtami',name:'Radha Ashtami',month:5,tithi:8,anchor:'madhyahna',source:`${root}/festivals/radha-ashtami/radha-ashtami-date-time.html`},
  {id:'anant-chaturdashi',name:'Anant Chaturdashi',month:5,tithi:14,anchor:'sunrise',source:`${root}/festivals/anant-chaturdashi/anant-chaturdashi-date-time.html`},
  {id:'sharad-navratri',name:'Sharad Navratri begins',month:6,tithi:1,anchor:'sunrise',source:`${root}/navratri/shardiya-navratri-dates.html`,review:'Date only. Ghatasthapana muhurat and regional Durga Puja rites use additional rules.'},
  {id:'durga-ashtami',name:'Durga Ashtami',month:6,tithi:8,anchor:'sunrise',source:`${root}/navratri/durga-ashtami.html`,review:'Sandhi Puja is the final 24 minutes of Ashtami and first 24 minutes of Navami; separate from the daytime date.'},
  {id:'durga-shashthi',name:'Durga Shashthi · Bodhon',month:6,tithi:6,anchor:'pradosh',regions:['bengal','odisha'],source:`${root}/durga-puja/durga-puja-calendar.html`,review:'Evening Shashthi contact; Kalparambha and Bodhon ritual precedence require regional confirmation.'},
  {id:'durga-saptami',name:'Maha Saptami',month:6,tithi:7,anchor:'sunrise',regions:['bengal','odisha'],source:`${root}/durga-puja/durga-puja-calendar.html`},
  {id:'maha-navami',name:'Maha Navami',month:6,tithi:9,anchor:'sunrise',source:`${root}/navratri/maha-navami.html`},
  {id:'vijayadashami',name:'Vijayadashami · Dussehra',month:6,tithi:10,anchor:'aparahna',source:`${root}/festivals/vijayadashami/vijayadashami-date-time.html`,review:'Shravana nakshatra and two-day precedence can change the date; ambiguous cases need regional confirmation.'},
  {id:'sharad-purnima',name:'Sharad Purnima · Kojagari',month:6,tithi:15,anchor:'nishita',source:`${root}/festivals/kojagara/kojagara-puja-date-time.html`},
  {id:'karwa-chauth',name:'Karwa Chauth',month:6,tithi:19,anchor:'moonrise',regions:['north','nepal'],source:`${root}/festivals/karwa-chauth/karwa-chauth-date-time.html`},
  {id:'ahoi-ashtami',name:'Ahoi Ashtami',month:6,tithi:23,anchor:'pradosh',regions:['north'],source:`${root}/festivals/ahoi-ashtami/ahoi-ashtami-date-time.html`,review:'Evening Ashtami date. Star-sighting and moonrise fast-breaking customs differ.'},
  {id:'dhanteras',name:'Dhanteras',month:6,tithi:28,anchor:'pradosh',source:`${root}/festivals/dhanteras/dhanteras-date-time.html`,review:'Displayed window is the Trayodashi–Pradosh overlap, not a separately selected Dhanvantari or fixed-lagna muhurat.'},
  {id:'naraka-chaturdashi',name:'Naraka Chaturdashi',month:6,tithi:29,anchor:'arunodaya',source:`${root}/festivals/abhyang-snan/abhyang-snan-date-time.html`,review:'Date uses pre-sunrise Chaturdashi. The displayed arunodaya overlap is not an independently verified moonrise-based Abhyanga Snan muhurat.'},
  {id:'diwali',name:'Diwali · Lakshmi Puja',month:6,tithi:30,anchor:'pradosh',source:`${root}/festivals/lakshmipuja/festivals-lakshmipuja-timings.html`},
  {id:'kali-puja',name:'Kali Puja',month:6,tithi:30,anchor:'nishita',regions:['bengal'],source:`${root}/festivals/kali-puja/kali-puja-date-time.html`},
  {id:'govardhan',name:'Govardhan Puja',month:7,tithi:1,anchor:'sunrise',source:`${root}/festivals/govardhan-puja/govardhan-puja-date-time.html`,review:'Pratipada date; Amavasya contact and Bali Pratipada regional precedence require confirmation.'},
  {id:'gujarati-new-year',name:'Gujarati New Year · Bestu Varas',month:7,tithi:1,anchor:'sunrise',regions:['gujarat'],source:`${root}/gujarati/gujarati-new-year-date.html`},
  {id:'bhai-dooj',name:'Bhai Dooj',month:7,tithi:2,anchor:'aparahna',source:`${root}/festivals/bhai-dooj/bhai-dooj-date-time.html`},
  {id:'chhath',name:'Chhath Puja · Sandhya Arghya',month:7,tithi:6,anchor:'pradosh',regions:['north','nepal'],source:`${root}/festivals/chhath-puja/chhath-puja-date-time.html`},
  {id:'tulsi-vivah',name:'Tulsi Vivah · Dwadashi tradition',month:7,tithi:12,anchor:'pradosh',source:`${root}/festivals/tulasi-vivah/tulasi-vivah-date-time.html`,review:'Some communities celebrate on Ekadashi or later in Kartik. This is the Dwadashi tradition.'},
  {id:'dev-diwali',name:'Kartik Purnima · Dev Deepawali',month:7,tithi:15,anchor:'pradosh',source:`${root}/festivals/dev-diwali/dev-diwali-date-time.html`},
  {id:'vasant-panchami',name:'Vasant Panchami',month:10,tithi:5,anchor:'madhyahna',source:`${root}/festivals/vasant-panchami/vasant-panchami-date-time.html`},
  {id:'ratha-saptami',name:'Ratha Saptami',month:10,tithi:7,anchor:'sunrise',source:`${root}/festivals/ratha-saptami/ratha-saptami-date-time.html`},
];
export const EKADASHI_SHUKLA=['Kamada','Mohini','Nirjala','Devshayani','Shravana Putrada','Parivartini','Papankusha','Devutthana','Mokshada','Pausha Putrada','Jaya','Amalaki'];
export const EKADASHI_KRISHNA=['Varuthini','Apara','Yogini','Kamika','Aja','Indira','Rama','Utpanna','Saphala','Shattila','Vijaya','Papamochani'];
export const RULE_SOURCES={
  ekadashi:`${root}/faq/ekadashi/about-ekadashi-timings.html`,pradosh:`${root}/vrats/pradoshdates.html`,sankashti:`${root}/vrats/sankashti-chaturthi-dates.html`,purnima:`${root}/vrats/purnimasidates.html`,amavasya:`${root}/vrats/amavasyadates.html`,shivaratri:`${root}/festivals/maha-shivaratri/maha-shivaratri-date-time.html`,mahadwadashi:`${root}/dwadashi/mahadwadashi/vanjuli-mahadwadashi.html`,holika:`${root}/festivals/holi/festivals-holi-holika-dahan-timings.html`,solar:`${root}/sankranti/sankranti-calendar.html`,
};
