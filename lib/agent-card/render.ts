import { shortPublicDid, type PublicAgentCard } from "./card";

export const AGENT_CARD_WIDTH=1600;
export const AGENT_CARD_HEIGHT=900;

function image(src:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const value=new Image();value.onload=()=>resolve(value);value.onerror=()=>reject(new Error("Brand artwork could not be loaded."));value.src=src;});}
function fit(context:CanvasRenderingContext2D,text:string,max:number,start:number):number{let size=start;while(size>34&&context.measureText(text).width>max){size-=2;context.font=`700 ${size}px system-ui, sans-serif`;}return size;}

export async function renderAgentCardPng(card:PublicAgentCard):Promise<Blob>{
  const canvas=document.createElement("canvas");canvas.width=AGENT_CARD_WIDTH;canvas.height=AGENT_CARD_HEIGHT;
  const context=canvas.getContext("2d");if(!context)throw new Error("Card image rendering is unavailable.");
  context.fillStyle="#020509";context.fillRect(0,0,canvas.width,canvas.height);
  const glow=context.createRadialGradient(1320,120,20,1320,120,620);glow.addColorStop(0,"rgba(14,181,220,.28)");glow.addColorStop(1,"rgba(14,181,220,0)");context.fillStyle=glow;context.fillRect(700,0,900,700);
  context.strokeStyle="#18bde5";context.lineWidth=3;context.strokeRect(54,54,1492,792);
  try{const logo=await image("/brand/flop-logo.png");context.drawImage(logo,94,84,80,80);}catch{/* Text brand remains deterministic if the local image cannot decode. */}
  context.fillStyle="#91e8ff";context.font="700 27px system-ui, sans-serif";context.fillText("FLOP AGENT WORKBENCH",200,135);
  context.fillStyle="#fff";context.font="700 82px system-ui, sans-serif";fit(context,card.displayName,1320,82);context.fillText(card.displayName,94,290);
  context.fillStyle="#91a8b8";context.font="600 28px system-ui, sans-serif";context.fillText("TECHNOCORE AGENT",96,350);
  context.fillStyle="#dff8ff";context.font="500 34px ui-monospace, monospace";context.fillText(shortPublicDid(card.publicDid),96,430);
  context.fillStyle="#fff";context.font="700 32px system-ui, sans-serif";context.fillText(card.algorithm,96,500);
  context.strokeStyle="#29404e";context.beginPath();context.moveTo(96,555);context.lineTo(1500,555);context.stroke();
  context.fillStyle="#91a8b8";context.font="600 24px system-ui, sans-serif";context.fillText("FIRST SIGNED RECORD",96,625);
  context.fillStyle="#fff";context.font="700 42px system-ui, sans-serif";context.fillText(`#${card.room} · #${card.authoritativeSeq}`,96,685);
  context.fillStyle="#78e7c5";context.font="800 31px system-ui, sans-serif";context.fillText("SIGNATURE VERIFIED ✓",96,760);
  context.fillStyle="#91a8b8";context.font="500 22px system-ui, sans-serif";context.fillText("Created with FLOP Agent Workbench",1120,790);
  return await new Promise<Blob>((resolve,reject)=>canvas.toBlob((blob)=>blob?resolve(blob):reject(new Error("Card image could not be encoded.")),"image/png"));
}
