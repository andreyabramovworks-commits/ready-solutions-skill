import {execFileSync} from 'node:child_process';
import path from 'node:path';

const query=process.argv.slice(2).join(' ').trim();
if(!query)throw Error('Provide a task query, e.g. "диалог"');
const search=path.resolve(import.meta.dirname,'search.mjs');
const data=JSON.parse(execFileSync(process.execPath,[search,query,'--json','--limit','1000'],{encoding:'utf8',maxBuffer:16*1024*1024}));
const q=query.toLowerCase();
function fit(item){
  const n=item.name.toLowerCase();
  let score=item.score;
  if(/диалог|модал/.test(q))score+=/^(dialog|modal|alert-dialog)$/.test(n)?12:/dialog|modal/.test(n)?5:/tooltip|popover/.test(n)?-8:0;
  if(/таблиц/.test(q))score+=item.id==='tanstack-table/react-table-package'?30:item.id.startsWith('tanstack-table/')?8:n==='table'?12:/dnd|review|sort|contents/.test(n)?-5:0;
  if(/график/.test(q))score+=/chart$/.test(n)?8:/^chart$/.test(n)?6:/stats?/.test(n)?-3:0;
  if(/форм/.test(q))score+=/^(form|useform)$/.test(n)?10:/formstate/.test(n)?-4:0;
  if(/дерев/.test(q))score+=n==='tree'?12:/tree/.test(n)?5:0;
  if(/редактор/.test(q))score+=item.id==='tiptap/packages-react'?20:item.id.startsWith('primereact/')&&n==='editor'?12:item.id.startsWith('tiptap/')&&item.entry_role==='working-example'?-5:0;
  if(/схем|диаграм/.test(q))score+=item.id==='xyflow/react-flow-package'?30:0;
  if(/уведомлен/.test(q))score+=/^(notification|notifications|message|toast|sonner)$/.test(n)?18:/feedback|alert-dialog/.test(n)?-6:0;
  return score;
}
data.results.sort((a,b)=>fit(b)-fit(a)||a.id.localeCompare(b.id));
const chosen=[];const seen=new Set();
for(const item of data.results){
  const source=item.id.split('/')[0];
  if(seen.has(source))continue;
  seen.add(source);chosen.push(item);
  if(chosen.length===3)break;
}
if(!chosen.length){console.log(`No local solution for "${query}". Research and add a new complete source snapshot.`);process.exit(0)}
console.log(`Task: ${query}. ${data.total} local matches; ${chosen.length} distinct sources.`);
for(const item of chosen){
  console.log(`\n${item.id}`);
  console.log(`  Source role: ${item.entry_role}; ${item.purpose??`Source for ${item.name}`}`);
  console.log(`  Use: ${item.path}`);
  const runtime=item.id==='tanstack-table/react-table-package'?[...Object.keys(item.package?.dependencies??{}),...Object.keys(item.package?.peer_dependencies??{})]:item.external_imports;
  console.log(`  Dependencies: ${runtime.join(', ')||'inspect package manifest'}`);
  console.log(`  Check: ${item.check??'Inspect source, license, package API and target-project compatibility before adoption.'}`);
}
