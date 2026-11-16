import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const sources=fs.readdirSync(path.join(root,'catalog')).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(root,'catalog',f),'utf8')));
const rows=[];
for(const source of sources)for(const s of source.solutions){
  const concerns=[];
  if(s.entry_role!=='link-directory'&&s.evidence.code_files===0)concerns.push('no-code-in-entry');
  if(!source.license_file)concerns.push('no-root-license-file');
  if(s.entry_role==='library-internals'||s.entry_role==='support-package')concerns.push('not-a-direct-ui-solution');
  if(s.entry_role==='architecture-example')concerns.push('adapt-to-project');
  if(s.entry_role==='link-directory')concerns.push('links-only');
  if(s.evidence.example_data)concerns.push('example-data-needs-replacement');
  if(s.evidence.workspace_alias_imports.length)concerns.push('workspace-aliases-need-adaptation');
  if(s.evidence.external_imports.length>8)concerns.push('many-external-imports');
  rows.push({id:`${source.id}/${s.id}`,role:s.entry_role,selectable:s.selectable,path:s.path,package:s.package?.name??null,code_files:s.evidence.code_files,external_imports:s.evidence.external_imports,manual_notes:Boolean(s.purpose),concerns});
}
const byRole=Object.fromEntries([...new Set(rows.map(r=>r.role))].sort().map(role=>[role,rows.filter(r=>r.role===role).length]));
const bySource=Object.fromEntries(sources.map(source=>[source.id,rows.filter(r=>r.id.startsWith(source.id+'/')).length]));
const audit={sources:sources.length,entries:rows.length,selectable:rows.filter(r=>r.selectable).length,non_selectable:rows.filter(r=>!r.selectable).length,manual_notes:rows.filter(r=>r.manual_notes).length,by_role:byRole,by_source:bySource,flagged:rows.filter(r=>r.concerns.length)};
const out=path.join(root,'reports');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'catalog-audit.json'),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({sources:audit.sources,entries:audit.entries,selectable:audit.selectable,non_selectable:audit.non_selectable,manual_notes:audit.manual_notes,by_role:audit.by_role,flagged:audit.flagged.length},null,2));
