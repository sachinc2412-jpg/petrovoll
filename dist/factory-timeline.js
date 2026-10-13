export const stageStarts=[0,2,4,6];
export function stageAtTime(time){return time<2?0:time<4?1:time<6?2:3;}
