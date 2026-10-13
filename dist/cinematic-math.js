export const clamp=v=>Math.max(0,Math.min(1,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
export const mix=(a,b,p)=>a+(b-a)*p;
export function filmState(p){p=clamp(p);const entry=ease((p-.29)/.12),exit=ease((p-.68)/.1),gallery=ease((p-.47)/.08)*(1-ease((p-.68)/.09));return {intro:1-ease((p-.1)/.1),micro:ease((p-.12)/.08)*(1-ease((p-.3)/.08)),macro:entry*(1-ease((p-.47)/.08)),gallery,collection:ease((p-.72)/.06)*(1-ease((p-.965)/.035)),entry,exit,zoom:ease((p-.08)/.25),chapter:p<.16?0:p<.34?1:p<.73?2:3,product:p<.815?0:p<.905?1:2};}
