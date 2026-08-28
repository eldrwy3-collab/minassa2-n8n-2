'use strict';
const PLATFORM_ORDER=['n8n','Make.com','Zapier','Pipedream','Node-RED','Power Automate'];
const STOP=new Set('the a an and or to of in on for with from into by is are be this that your you i we it as at via how what when where can could should automation workflow automate create build send receive get make use data ai api app email google microsoft shopify telegram slack discord pdf crm lead customer support sales marketing finance hr education healthcare real estate ecommerce content it ops'.split(' '));
function arr(x){return Array.isArray(x)?x:(x==null?[]:[x]);}
function norm(x){return String(x??'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function tokens(s){return [...new Set(norm(s).split(/\s+/).filter(x=>x.length>2&&!STOP.has(x)))];}
function flattenRecord(r){return [r.title,r.description,r.domain,r.sub_domain,...arr(r.tags)].join(' ');}
function score(r,q,platform,tags=[]){const qt=tokens(q);const hay=norm(flattenRecord(r));let s=0;for(const t of qt){if(hay.includes(t))s+=hay===t?5:2;}for(const t of tags){if(hay.includes(norm(t)))s+=2;}if(platform&&r.blueprints?.[platform])s+=2;if(r.title&&r.title!=='No Title')s+=2;if(r.description)s+=1;return s;}
function choose(records,q,platform,tags,limit=12){return records.map((r,i)=>({r,i,s:score(r,q,platform,tags)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,limit).map(x=>x.r);}
function unique(a){return [...new Set(a.filter(Boolean))];}
function compose({query,platform,results}){
 const apps=unique(results.flatMap(r=>arr(r.tags)).filter(t=>/gmail|email|telegram|slack|shopify|salesforce|hubspot|google|notion|discord|pdf|http|api|crm|calendar/i.test(t)).slice(0,10));
 const domain=results[0]?.domain||'General_Automation';
 const nodes=[
  {id:'trigger',type:'trigger',name:'Trigger / Input',detail:`Start from the user's requested event or input`},
  {id:'retrieve',type:'knowledge',name:'Find best automation path',detail:`Rank matching patterns from the Netregent catalog`},
  {id:'logic',type:'logic',name:'Validate & route',detail:`Apply conditions, required data and platform constraints`},
  {id:'transform',type:'transform',name:'Prepare data',detail:`Normalize, map and enrich fields before execution`},
  {id:'action',type:'action',name:'Execute action',detail:`Perform the selected platform/app action`},
  {id:'verify',type:'verify',name:'Verify result',detail:`Check success, failure and recovery path`}
 ];
 if(/ai|agent|assistant|summar|classif|generate/i.test(query)) nodes.splice(4,0,{id:'ai',type:'intelligence',name:'AI / Rule-based decision',detail:'Use local retrieval and deterministic composition first; external AI is optional'});
 return {title:`${platform||'Automation'} workflow for ${query.slice(0,70)}`,domain,platform,nodes,edges:nodes.slice(1).map((n,i)=>({from:nodes[i].id,to:n.id})),apps,sourceCount:results.length,method:'retrieval-plus-rule-composition'};
}
function searchCatalog(records,query,platform,tags,limit){return choose(records,query,platform,tags,limit);}
module.exports={PLATFORM_ORDER,arr,norm,tokens,searchCatalog,compose};
