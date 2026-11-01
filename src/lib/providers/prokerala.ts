import { normalizeProkerala,zonedRequestDateTime } from './normalize';
import type { ProviderReference } from './types';
type Input={date:string;timeZone:string;latitude:number;longitude:number;instant:Date};
export class ProviderFailure extends Error {
  constructor(public reason:'credentials'|'authentication'|'quota'|'network'|'response',message:string){super(message);}
}
export class ProkeralaClient {
  private token?:{value:string;expires:number};
  private tokenPending?:Promise<string>;
  private cache=new Map<string,ProviderReference>();
  private pending=new Map<string,Promise<ProviderReference>>();
  private failures=new Map<string,number>();
  private quotaDay='';private used=0;
  constructor(private config:{clientId:string;clientSecret:string;maxRequestsPerDay?:number},private fetcher:typeof fetch=fetch,private now:()=>number=Date.now){}
  private async json(url:string,init:RequestInit):Promise<unknown>{
    let response:Response;
    try{response=await this.fetcher(url,{...init,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});}catch{throw new ProviderFailure('network','Independent provider could not be reached.');}
    if(response.status===401||response.status===403)throw new ProviderFailure('authentication','Independent provider rejected authentication.');
    if(response.status===429||response.status===402)throw new ProviderFailure('quota','Independent provider quota is unavailable.');
    if(!response.ok)throw new ProviderFailure('response','Independent provider returned an unsuccessful response.');
    try{const body=await response.text();if(body.length>1000000)throw new Error();return JSON.parse(body);}catch{throw new ProviderFailure('response','Independent provider returned invalid JSON.');}
  }
  private async accessToken():Promise<string>{
    if(this.token&&this.token.expires>this.now()+60000)return this.token.value;
    if(this.tokenPending)return this.tokenPending;
    this.tokenPending=(async()=>{
      if(!this.config.clientId||!this.config.clientSecret)throw new ProviderFailure('credentials','Independent provider credentials are not configured.');
      const body=new URLSearchParams({grant_type:'client_credentials',client_id:this.config.clientId,client_secret:this.config.clientSecret});
      const result=await this.json('https://api.prokerala.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body}) as Record<string,unknown>;
      if(typeof result.access_token!=='string'||!result.access_token||result.token_type?.toString().toLowerCase()!=='bearer'||typeof result.expires_in!=='number'||result.expires_in<=60)throw new ProviderFailure('response','Independent provider returned invalid authentication data.');
      this.token={value:result.access_token,expires:this.now()+Math.min(result.expires_in,86400)*1000};return this.token.value;
    })();
    try{return await this.tokenPending;}finally{this.tokenPending=undefined;}
  }
  private reserveRequest(){const day=new Date(this.now()).toISOString().slice(0,10);if(day!==this.quotaDay){this.used=0;this.quotaDay=day;}if(this.used>=(this.config.maxRequestsPerDay??100))throw new ProviderFailure('quota','The configured independent-check request budget has been reached.');this.used++;}
  async reference(input:Input):Promise<{reference:ProviderReference;cached:boolean}>{
    const key=JSON.stringify([input.date,input.timeZone,input.latitude,input.longitude,'lahiri']);
    const cached=this.cache.get(key);if(cached&&Date.parse(cached.expiresAt)>this.now())return{reference:cached,cached:true};
    if(this.pending.has(key))return{reference:await this.pending.get(key)!,cached:true};
    if((this.failures.get(key)||0)>this.now())throw new ProviderFailure('network','Independent check is temporarily unavailable; retry shortly.');
    const promise=(async()=>{
      const params=new URLSearchParams({ayanamsa:'1',coordinates:`${input.latitude},${input.longitude}`,datetime:zonedRequestDateTime(input.instant,input.timeZone),la:'en'});
      let payload:unknown;
      for(let attempt=0;attempt<2;attempt++){
        const token=await this.accessToken();this.reserveRequest();
        try{payload=await this.json(`https://api.prokerala.com/v2/astrology/panchang?${params}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});break;}
        catch(error){if(error instanceof ProviderFailure&&error.reason==='authentication'&&attempt===0){this.token=undefined;continue;}throw error;}
      }
      let reference:ProviderReference;
      try{reference=normalizeProkerala(payload,input,new Date(this.now()));}catch{throw new ProviderFailure('response','Independent provider data failed date, interval or schema checks.');}
      if(this.cache.size>=256)this.cache.delete(this.cache.keys().next().value!);this.cache.set(key,reference);return reference;
    })();
    this.pending.set(key,promise);
    try{return{reference:await promise,cached:false};}
    catch(error){if(this.failures.size>=256)this.failures.clear();this.failures.set(key,this.now()+30000);throw error;}
    finally{this.pending.delete(key);}
  }
}
