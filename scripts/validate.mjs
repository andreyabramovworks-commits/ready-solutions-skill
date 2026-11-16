import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const required=['task','domain','layer','kind','property','adoption','cost','license'];
const ids=new Set();
for(const file of fs.readdirSync(path.join(root,'catalog')).filter(x=>x.endsWith('.json'))){
  const source=JSON.parse(fs.readFileSync(path.join(root,'catalog',file),'utf8'));
  if(!source.commit||!fs.existsSync(path.join(root,source.local_path)))throw Error(`Missing source ${source.id}`);
  if(fs.existsSync(path.join(root,source.local_path,'.git')))throw Error(`Git history present: ${source.id}`);
  if(source.license_file&&!fs.existsSync(path.join(root,source.license_file)))throw Error(`Missing license ${source.id}`);
  for(const s of source.solutions){
    const id=`${source.id}/${s.id}`;
    if(ids.has(id))throw Error(`Duplicate ${id}`);ids.add(id);
    if(!fs.existsSync(path.join(root,s.path)))throw Error(`Missing path ${id}`);
    for(const facet of required)if(!Array.isArray(s.tags?.[facet])||!s.tags[facet].length)throw Error(`Missing ${facet} in ${id}`);
    if(!s.application_guide?.action||!s.application_guide?.caution)throw Error(`Missing application guide ${id}`);
    if(typeof s.selectable!=='boolean')throw Error(`Missing selectable classification ${id}`);
    if(s.selectable&&['library-internals','support-package','link-directory'].includes(s.entry_role))throw Error(`Invalid selectable role ${id}`);
    if(s.selectable&&s.evidence.code_files===0)throw Error(`Selectable entry has no code ${id}`);
    if(s.tags.task.includes('ui-component')||s.tags.task.includes('application-structure'))throw Error(`Generic task tag ${id}`);
    if(/tableofcontents/i.test(s.name)&&s.tags.task.includes('data-table'))throw Error(`False data-table tag ${id}`);
    if(/typography|asymmetrical/i.test(s.name)&&s.tags.task.includes('analytics'))throw Error(`False analytics tag ${id}`);
  }
}
console.log(`Validated ${ids.size} unique entries`);
