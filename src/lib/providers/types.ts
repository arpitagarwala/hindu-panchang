export type TrustStatus='local-only'|'not-configured'|'not-checked'|'matched'|'disagreement'|'convention-difference'|'unavailable'|'unsupported';
export type DataMode='cross-check'|'verified-only'|'local';
export interface ReferenceElement {name:string;start:string;end:string;paksha?:string}
export interface ProviderReference {
  provider:'Prokerala';date:string;timeZone:string;latitude:number;longitude:number;
  sunrise:string;sunset:string;vara:string;
  tithi:ReferenceElement;nakshatra:ReferenceElement;yoga:ReferenceElement;karana:ReferenceElement;
  fetchedAt:string;expiresAt:string;sourceUrl:string;
}
export interface Comparison {field:string;local:string;reference:string;matches:boolean;deltaSeconds?:number;toleranceSeconds?:number}
export interface DataTrust {
  status:TrustStatus;mode:DataMode;primarySource:'Swiss Ephemeris';provider:'Prokerala'|null;
  checkedAt?:string;fetchedAt?:string;expiresAt?:string;cached?:boolean;
  message:string;scope:string;comparisons?:Comparison[];reference?:ProviderReference;
  suggestedSunriseConvention?:'center';
}
export interface ComparablePanchang {
  tithi:{name:string;paksha:string;end?:string};nakshatra:{name:string;end?:string};
  yoga:{name:string;end?:string};karana:{name:string;end?:string};
  vara:{english:string};sunrise:string;sunset:string;solarTimesAvailable?:boolean;
}
