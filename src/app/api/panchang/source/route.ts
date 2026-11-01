import { NextResponse } from 'next/server';
import { sourceConfiguration } from '@/lib/providers/service';
export function GET(){try{return NextResponse.json(sourceConfiguration(),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Panchang provider configuration is invalid.'},{status:503});}}
