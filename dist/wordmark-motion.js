const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
export function wordmarkState(p){const entry=ease((p-.48)/.07),resolve=ease((p-.55)/.35);return {entry,resolve,field:1-resolve,outline:(1-resolve)*.65,ink:resolve*.14,caption:ease((p-.85)/.12)};}
