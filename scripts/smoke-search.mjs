import {execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const root=path.resolve(import.meta.dirname,'..');
const script=path.join(root,'scripts','search.mjs');
const shortlist=path.join(root,'scripts','shortlist.mjs');
const cases=[
  {query:'форма',expect:['react-hook-form/','mantine/'],shortlist:['react-hook-form/','shadcn-ui/']},
  {query:'таблица',expect:['tanstack-table/','shadcn-ui/'],shortlist:['tanstack-table/','mantine/']},
  {query:'дерево',expect:['mantine/','react-aria/'],shortlist:['mantine/','ant-design/']},
  {query:'график',expect:['mantine/','shadcn-ui/'],shortlist:['mantine/','shadcn-ui/']},
  {query:'диалог',expect:['radix-primitives/','mantine/'],shortlist:['radix-primitives/','mantine/']},
  {query:'редактор',expect:['tiptap/','primereact/'],shortlist:['tiptap/','primereact/']},
  {query:'схема',expect:['xyflow/'],shortlist:['xyflow/']},
  {query:'календарь',expect:['mantine/','ant-design/'],shortlist:[]},
  {query:'загрузка',expect:['mantine/','ant-design/'],shortlist:[]},
  {query:'уведомление',expect:['mantine/','ant-design/'],shortlist:[]},
];
const results=[];
for(const c of cases){
  const output=execFileSync(process.execPath,[script,c.query,'--json','--limit','1000'],{encoding:'utf8',maxBuffer:16*1024*1024});
  const data=JSON.parse(output);
  const ids=data.results.map(x=>x.id);
  const missing=c.expect.filter(x=>!ids.some(id=>id.startsWith(x)));
  const shortlistText=execFileSync(process.execPath,[shortlist,c.query],{encoding:'utf8',maxBuffer:16*1024*1024});
  const shortlistIds=[...shortlistText.matchAll(/^([a-z0-9-]+\/[a-z0-9-]+)$/gm)].map(x=>x[1]);
  const shortlistMissing=c.shortlist.filter(x=>!shortlistIds.some(id=>id.startsWith(x)));
  results.push({query:c.query,count:data.total,expected_sources:c.expect,missing_sources:missing,shortlist_ids:shortlistIds,shortlist_missing:shortlistMissing,examples:ids.slice(0,5)});
}
const out=path.join(root,'reports','search-smoke.json');
fs.writeFileSync(out,JSON.stringify(results,null,2)+'\n');
for(const r of results)console.log(`${r.query}: ${r.count} matches; missing expected sources: ${r.missing_sources.join(',')||'none'}; shortlist: ${r.shortlist_ids.join(',')||'gap'}`);
if(results.some(r=>r.missing_sources.length||r.shortlist_missing.length))process.exitCode=1;
