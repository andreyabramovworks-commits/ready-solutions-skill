import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const catalog = path.join(root, 'catalog');
const libraries = path.join(root, 'libraries');
const curated=JSON.parse(fs.readFileSync(path.join(root,'references','curated-solutions.json'),'utf8'));
const radixPublic=new Set('accessible-icon accordion alert-dialog announce aspect-ratio avatar checkbox collapsible context-menu dialog dropdown-menu form hover-card label menubar navigation-menu one-time-password-field password-toggle-field popover progress radio-group scroll-area select separator slider switch tabs toast toggle toggle-group toolbar tooltip visually-hidden'.split(' '));
const reactAriaExports=new Set([...fs.readFileSync(path.join(libraries,'react-aria/packages/react-aria-components/exports/index.ts'),'utf8').matchAll(/\.\.\/src\/([A-Za-z0-9]+)/g)].map(x=>x[1].toLowerCase()));
const mantineChartExports=new Set([...fs.readFileSync(path.join(libraries,'mantine/packages/@mantine/charts/src/index.ts'),'utf8').matchAll(/\.\/([A-Za-z0-9]+)\/index\.js/g)].map(x=>x[1].toLowerCase()));
const specs = [
  ['awesome-react-components','brillout/awesome-react-components','directory','cc0-1.0',['README.md']],
  ['mantine','mantinedev/mantine','source','mit',['packages/@mantine/core/src/components','packages/@mantine/form/src','packages/@mantine/hooks/src','packages/@mantine/dates/src/components','packages/@mantine/charts/src','packages/@mantine/modals/src','packages/@mantine/notifications/src','packages/@mantine/dropzone/src','packages/@mantine/spotlight/src']],
  ['mantine-ui','mantinedev/ui.mantine.dev','source','mit-readme',['lib']],
  ['full-stack-fastapi-template','fastapi/full-stack-fastapi-template','template','mit',['backend/app/api','backend/app/core','backend/app/alembic','frontend/src']],
  ['awesome-fastapi','mjhea0/awesome-fastapi','directory','cc0-1.0',['README.md']],
  ['shadcn-ui','shadcn-ui/ui','source','mit',['apps/v4/registry/new-york-v4/ui','apps/v4/registry/new-york-v4/blocks','apps/v4/registry/new-york-v4/charts']],
  ['tanstack-table','TanStack/table','source','mit',['packages/table-core/src','packages/react-table/src','examples/react']],
  ['react-aria','adobe/react-spectrum','source','apache-2.0',['packages/react-aria-components/src']],
  ['radix-primitives','radix-ui/primitives','source','mit',['packages/react']],
  ['react-hook-form','react-hook-form/react-hook-form','source','mit',['src']],
  ['material-ui','mui/material-ui','source','mit',['packages/mui-material/src']],
  ['ant-design','ant-design/ant-design','source','mit',['components']],
  ['primereact','primefaces/primereact','source','mit',['components/lib']],
  ['tiptap','ueberdosis/tiptap','source','mit',['packages']],
  ['xyflow','xyflow/xyflow','source','mit',[]],
  ['chakra-ui','chakra-ui/chakra-ui','source','mit',['packages/react/src/components']],
];
const recursiveRoots={
  'material-ui':['docs/data/material/components'],
  'ant-design':['components'],
  'shadcn-ui':['apps/v4/registry/new-york-v4/examples'],
  'xyflow':['examples/react/src/examples'],
  'tiptap':['demos/src/Examples'],
};
const tasks = [
  [/table|datagrid|dataview/i,'data-table'],[/form|field|input|checkbox|radio|select|combobox|autocomplete|auto-complete|switch|slider|otp|validation|transfer/i,'forms'],
  [/dialog|modal|popover|drawer|sheet|hovercard|tooltip|popconfirm|backdrop|confirmpopup/i,'overlays'],
  [/menu|navigation|tabs|breadcrumb|sidebar|navbar|header|footer|navlink|pagination|tableofcontents|appbar|back-top|dropdown|paginator|tabview|skip-nav/i,'navigation'],
  [/chart|graph|stats|statistic|metric|analytics|progress|^ring$|statsring|sparkline|^stat$/i,'analytics'],[/date|calendar|time|schedule|day|week|month|quarter|year|decade|picker/i,'date-time'],
  [/auth|login|password|forgot|security|role|permission/i,'auth'],
  [/editor|richtext|tiptap|markdown|codehighlight/i,'editor'],
  [/notification|toast|alert|error|success|empty|notfound|nothingfound|feedback|loader|loading|skeleton|snackbar|result|spin|blockui/i,'feedback'],
  [/api|route|endpoint|client|fetch/i,'api'],[/alembic|migration|versions/i,'migrations'],[/config|settings|env/i,'configuration'],
  [/accordion|disclosure|collapsible|collapse|faq/i,'disclosure'],
  [/avatar|card|badge|text|typography|label|list|comment|article|blockquote|kbd|code|descriptions|tag|quote|heading|strong|^em$|^span$|^mark$|^item/i,'display'],
  [/appshell|grid|flex|container|center|group|stack|layout|panel|split|separator|divider|aspectratio|scrollarea|resizable|masonry|^col$|^box$|^bleed$|^circle$|^square$|^wrap$|^float$|^sticky$/i,'layout'],
  [/button|action|toggle|copy|toolbar|^fab$|speeddial|download-trigger/i,'actions'],[/hero|banner|feature|lead/i,'marketing'],
  [/image|carousel|video|media/i,'media'],[/file|dropzone|upload|attachment|mime/i,'file-upload'],
  [/drag|dnd|sortable|reorder/i,'drag-and-drop'],[/search|filter|highlight/i,'search'],
  [/tree|hierarchy|nested/i,'hierarchy'],[/theme|color|gradient|palette/i,'theming'],
  [/database|db|sql|model/i,'data-access'],[/test|spec/i,'testing'],
  [/contact|getintouch|social/i,'contact'],[/language|locale|i18n/i,'localization'],
  [/user|profile|account/i,'user-management'],[/serveroverload|servererror/i,'error-state'],
  [/affix|anchor|burger|floating|overlay|portal|popper/i,'positioning'],
  [/chip|pill|segmented|rating|mentions|cascader/i,'selection'],
  [/focus|keyboard|roving|visuallyhidden|accessible|announce/i,'accessibility'],
  [/scroll|viewport|virtualiz|intersection|resize/i,'viewport'],
  [/transition|marquee|rollingnumber|animation/i,'motion'],
  [/store|state|status|reactivity|subscribe|watch|counter|queue|map|set/i,'state-management'],
  [/clipboard|copy/i,'clipboard'],[/hotkey|shortcut/i,'keyboard-shortcuts'],
  [/network|online|offline|reconnect/i,'network-state'],[/hover|mouse|pointer|move|press/i,'pointer-interaction'],
  [/storage|session|localstorage/i,'persistence'],[/debounc|throttl|interval/i,'timing'],
  [/orientation|browser|document|window|os|fullscreen|favicon|hash/i,'browser-api'],
  [/dashboard|kitchen-sink/i,'dashboard'],[/signup|register/i,'registration'],
  [/column|row|cell|aggregation|expanding|pinning|visibility|sizing/i,'data-table'],
  [/indicator|spinner|sonner/i,'feedback'],[/mark|title/i,'typography'],[/paper|space/i,'layout'],
  [/spoiler/i,'disclosure'],[/stepper/i,'workflow'],[/tour/i,'onboarding'],
  [/validator|schema-resolver/i,'validation'],[/^hooks$|^use-/i,'react-hooks'],
  [/^paths|^types$|^utils$|^lib$|^deps$|^main$/i,'developer-infrastructure'],
  [/bubble|message/i,'messaging'],[/command/i,'command-menu'],[/direction/i,'localization'],
  [/^item$|marker/i,'display'],
  [/^components$/i,'component-structure'],
  [/spotlight/i,'search'],[/events|reducer/i,'state-management'],
  [/icon|glyph/i,'icons'],[/border-beam|ripple|fade|^slide$|presence/i,'motion'],
  [/rate|rating|knob/i,'rating'],[/steps|stepper|^step$/i,'workflow'],
  [/^app$|^for$|^show$|^inplace$|^dock$|^galleria$/i,'interaction'],
  [/^style|^theme|css|classname|passthrough/i,'styling'],
  [/^internal$|^_util$|^version$|^overview$|^utils$|^componentbase$|^iconbase$|^icons$|^terminalservice$|^deferredcontent$/i,'developer-infrastructure'],
  [/^app:|defaultprops|overridable/i,'component-structure'],
  [/^link$|links|backtotop|^tab$/i,'navigation'],
  [/visually-hidden/i,'accessibility'],[/globalstyles|zero-styled/i,'styling'],
  [/stepconnector|stepcontent/i,'workflow'],[/zoom/i,'motion'],
  [/boxbasic|boxsx/i,'layout'],[/framedefer|no-ssr/i,'performance'],
  [/mention/i,'forms'],[/terminal/i,'developer-tools'],
];
function tagsFor(name, spec, location) {
  const task = tasks.filter(([re])=>re.test(name)).map(([,tag])=>tag);
  if(spec[0]==='tiptap')task.push('editor');
  if(spec[0]==='xyflow')task.push('diagramming');
  if (/tableofcontents/i.test(name)) { const i=task.indexOf('data-table'); if(i>=0)task.splice(i,1); }
  if (/^Header|^Footer|^Navbar|^Hero/.test(name)) { const i=task.indexOf('data-table'); if(i>=0)task.splice(i,1); }
  if (/typography|asymmetrical/i.test(name)) { const i=task.indexOf('analytics'); if(i>=0)task.splice(i,1); }
  if (!task.length) task.push(spec[2]==='directory'?'discovery':spec[2]==='template'?'application-structure':spec[0]==='tanstack-table'?'table-engine':spec[0]==='radix-primitives'?'primitive-infrastructure':spec[0]==='react-hook-form'?'form-engine':spec[0]==='react-aria'?'accessible-ui':spec[0]==='mantine'&&location.includes('/hooks/')?'react-hooks':'ui-component');
  const layer = spec[0]==='full-stack-fastapi-template'?['fastapi','react','postgresql']:
    spec[0]==='awesome-fastapi'?['python','fastapi']:
    spec[0]==='awesome-react-components'?['react']:
    spec[0]==='tiptap'?['javascript','react']:
    spec[0]==='xyflow'?['react','typescript']:['react'];
  const role=entryRole(spec[0],location,name);
  const kind=spec[2]==='directory'?'directory':spec[2]==='template'?'template':role.includes('example')?'example':role==='library-internals'?'pattern':['support-package','public-api','package-source'].includes(role)?'library':'component';
  const adoption=spec[2]==='directory'||spec[2]==='template'||role==='library-internals'?'reference-only':role==='working-example'||role==='copyable-example'||role==='copyable-component'?'copy-and-adapt':'dependency';
  const property=spec[0]==='tanstack-table'?['headless']:spec[0]==='radix-primitives'?['unstyled']:['reusable'];
  const domain=['general-purpose'];
  if(/user|role|admin|dashboard|stat|table/i.test(name))domain.push('internal-tools');
  if(/article|editor|comment|content|knowledge/i.test(name))domain.push('content-management');
  if(/auth|login|signup|password/i.test(name))domain.push('identity');
  return {task:[...new Set(task)],domain,layer,kind:[kind],property,adoption:[adoption],cost:['assess-per-project'],license:[spec[3]]};
}
function children(relative) {
  const p=path.join(libraries,relative);
  if (!fs.existsSync(p)) return [];
  if (fs.statSync(p).isFile()) return [relative];
  const entries=fs.readdirSync(p,{withFileTypes:true});
  const dirs=entries.filter(e=>e.isDirectory()&&!e.name.startsWith('.')&&!/^(tests?|__tests__|__typetest__|stories)$/.test(e.name));
  return [...dirs.map(e=>`${relative}/${e.name}`),...entries.filter(e=>e.isFile()&&!e.name.startsWith('_')&&!/^index\./i.test(e.name)&&/\.(tsx?|py)$/.test(e.name)&&!/(\.test\.|\.spec\.|\.story\.|\.d\.ts$|\.gen\.)/.test(e.name)).map(e=>`${relative}/${e.name}`)];
}
function recursiveExamples(id,relative){
  const start=path.join(libraries,id,relative);if(!fs.existsSync(start))return [];
  const found=[];
  function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('_')||['node_modules','dist','build','__tests__','test','tests'].includes(entry.name))continue;const absolute=path.join(dir,entry.name);if(entry.isDirectory())visit(absolute);else if(entry.isFile()&&/\.tsx$/.test(entry.name)&&!/(\.test\.|\.spec\.|\.story\.|\.d\.ts$)/.test(entry.name)){const rel=path.relative(libraries,absolute).replaceAll('\\','/');if(id==='ant-design'&&!rel.includes('/demo/'))continue;if(id==='material-ui'&&!rel.includes('/demos/'))continue;found.push(rel)}}}
  visit(start);
  if(id==='ant-design'){
    const grouped=new Map();for(const rel of found){const group=rel.split('/')[2];const arr=grouped.get(group)??[];arr.push(rel);grouped.set(group,arr)}
    return [...grouped.values()].flatMap(arr=>arr.sort().slice(0,8));
  }
  return found;
}
function displayName(id,location,name,example){
  if(!example)return name;
  const parts=location.split('/');
  if(id==='ant-design')return `${parts[2]}: ${name}`;
  if(id==='material-ui')return `${parts[parts.indexOf('components')+1]}: ${name}`;
  const marker=id==='tiptap'?'Examples':'examples';
  const index=parts.lastIndexOf(marker);
  return `${parts[index+1]??name}: ${name}`;
}
function evidence(relative) {
  const absolute=path.join(libraries,relative);
  function collect(dir,depth){if(fs.statSync(dir).isFile())return [dir];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);if(e.isFile())return [p];if(e.isDirectory()&&depth>0&&!['node_modules','.git','dist','build'].includes(e.name))return collect(p,depth-1);return []})}
  const files=collect(absolute,2);
  const code=files.filter(f=>/\.(tsx?|jsx?|py)$/.test(f)&&!/(\.test\.|\.story\.|\.spec\.)/.test(f));
  const imports=new Set(),aliases=new Set(),exports=new Set();let bytes=0,exampleData=false,hasEventHandlers=false;
  for(const file of code){const body=fs.readFileSync(file,'utf8');bytes+=Buffer.byteLength(body);if(/\b(mockdata|mockData|sampleData|fakeData)\b|\bconst\s+data\s*=\s*\[/.test(body))exampleData=true;if(/\bon(?:Click|Change|Submit|Drop|KeyDown)\s*=/.test(body))hasEventHandlers=true;for(const match of body.matchAll(/\b(?:from\s*|import\s*\(|require\s*\()\s*['"]([^.'"][^'"]*)['"]/g)){const value=match[1];if(value.startsWith('@/')||value==='cn'){aliases.add(value);continue}const pkg=value.startsWith('@')?value.split('/').slice(0,2).join('/'):value.split('/')[0];imports.add(pkg)}for(const match of body.matchAll(/export\s+(?:default\s+)?(?:function|class|const|interface|type)\s+([A-Za-z_$][\w$]*)/g))exports.add(match[1])}
  return {code_files:code.length,code_bytes:bytes,has_tests:files.some(f=>/\.(test|spec)\./.test(f)),has_styles:files.some(f=>/\.(css|scss)$/.test(f)),has_readme:files.some(f=>/readme\.md$/i.test(f)),example_data:exampleData,has_event_handlers:hasEventHandlers,external_imports:[...imports].sort(),workspace_alias_imports:[...aliases].sort(),named_exports:[...exports].sort().slice(0,30)};
}
function packageInfo(relative,id){
  let dir=path.join(libraries,relative);
  if(fs.statSync(dir).isFile())dir=path.dirname(dir);
  const boundary=path.join(libraries,id);
  while(dir.startsWith(boundary)){
    const manifest=path.join(dir,'package.json');
    if(fs.existsSync(manifest)){try{const p=JSON.parse(fs.readFileSync(manifest,'utf8'));return {name:p.name??null,version:p.version??null,dependencies:p.dependencies??{},peer_dependencies:p.peerDependencies??{}}}catch{return null}}
    if(dir===boundary)break;dir=path.dirname(dir);
  }
  return null;
}
function applicationGuide(role, evidence){
  const packages=evidence.external_imports.filter(x=>x!=='react'&&x!=='react-dom');
  if(role==='link-directory')return {action:'discover-linked-projects',caution:'The linked projects are not bundled; check each source and license independently.'};
  if(role==='library-internals'||role==='support-package')return {action:'inspect-only',caution:'This is an implementation or support package, not a standalone application component.'};
  if(role==='architecture-example')return {action:'adapt-pattern',caution:'Map the pattern to the target project; do not copy database history or deployment configuration blindly.'};
  if(role==='working-example')return {action:'adapt-example',caution:'Extract the relevant behavior and replace demonstration data and tooling.'};
  if(role==='copyable-example')return {action:'copy-and-adapt',caution:evidence.example_data?'Replace demonstration data and connect real application behavior.':'Inspect local helpers and connect real application behavior.'};
  if(role==='copyable-component')return {action:'copy-and-adapt',caution:evidence.workspace_alias_imports.length?'Resolve workspace aliases and include required companion components.':'Include required companion components and styles.'};
  return {action:'install-package',caution:packages.length?`Inspect package dependencies: ${packages.slice(0,5).join(', ')}.`:'Check the package manifest and public API before use.'};
}
function entryRole(id,location,name){
  if(id==='material-ui'&&location.includes('/docs/data/'))return 'working-example';
  if(id==='ant-design'&&location.includes('/demo/'))return 'working-example';
  if(id==='shadcn-ui'&&location.includes('/examples/'))return 'working-example';
  if(id==='xyflow'||id==='tiptap'&&location.includes('/demos/'))return 'working-example';
  if(id.startsWith('awesome-'))return 'link-directory';
  if(id==='mantine-ui')return 'copyable-example';
  if(id==='full-stack-fastapi-template')return 'architecture-example';
  if(id==='shadcn-ui')return location.includes('/ui/')?'copyable-component':'copyable-example';
  if(id==='tanstack-table')return location.includes('/examples/')?'working-example':'library-internals';
  if(id==='react-hook-form')return /^use|^Controller$|^Form$|^ErrorMessage$/.test(name)?'public-api':'library-internals';
  if(id==='radix-primitives')return radixPublic.has(name)?'public-primitive':'support-package';
  if(id==='react-aria')return reactAriaExports.has(name.toLowerCase())?'public-api':'library-internals';
  if(id==='ant-design')return ['_util','__tests__','style','theme','config-provider'].includes(name)?'support-package':'component-source';
  if(id==='tiptap')return name.startsWith('extension-')||['core','react','starter-kit','markdown','html','suggestion','pm','static-renderer'].includes(name)?'public-api':'support-package';
  if(id==='material-ui'||id==='primereact'||id==='chakra-ui')return 'component-source';
  if(id==='mantine'&&/\/hooks\/src\//.test(location))return /^use-/i.test(name)?'public-api':'library-internals';
  if(id==='mantine'&&/\/form\/src\//.test(location))return /^(use-form|use-field|FormProvider|schema-resolver|validators|actions)$/i.test(name)?'public-api':'library-internals';
  if(id==='mantine'&&/\/(modals|notifications|dropzone|spotlight)\/src\//.test(location))return 'package-source';
  if(id==='mantine'&&/\/charts\/src\//.test(location))return mantineChartExports.has(name.toLowerCase())?'component-source':'support-package';
  return 'component-source';
}
const selectableRoles=new Set(['architecture-example','component-source','copyable-component','copyable-example','package-source','public-api','public-primitive','working-example']);
for (const spec of specs) {
  const [id,repo,sourceType,license,locations]=spec;
  const local=path.join(libraries,id);
  if (!fs.existsSync(local)) throw new Error(`Missing source: ${id}`);
  const existingPath=path.join(catalog,`${id}.json`);
  const existing=fs.existsSync(existingPath)?JSON.parse(fs.readFileSync(existingPath,'utf8')):null;
  const gitPath=path.join(local,'.git');
  const commit=fs.existsSync(gitPath)?execFileSync('git',['-C',local,'rev-parse','HEAD'],{encoding:'utf8'}).trim():existing?.commit;
  if (!commit) throw new Error(`Missing snapshot commit: ${id}`);
  const licenseFile=fs.readdirSync(local).find(x=>/^license/i.test(x));
  const raw=[...locations.flatMap(location=>children(`${id}/${location}`)).map(location=>({location,example:false})),...(recursiveRoots[id]??[]).flatMap(location=>recursiveExamples(id,location)).map(location=>({location,example:true}))];
  const solutions=raw.map(({location,example})=>{
    const name=path.basename(location).replace(/\.(tsx?|py)$/,'');
    const solutionId=location.slice(id.length+1).toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const role=entryRole(id,location,name),inspection=evidence(location);
    const display=displayName(id,location,name,example);
    return {id:solutionId,name:display,path:`libraries/${location}`,entry_role:role,selectable:selectableRoles.has(role)&&inspection.code_files>0,tags:tagsFor(display,spec,location),package:packageInfo(location,id),evidence:inspection,application_guide:applicationGuide(role,inspection),...(curated[`${id}/${solutionId}`]??{})};
  });
  if(id==='tanstack-table'){
    const location='tanstack-table/packages/react-table';
    const inspection=evidence(location);
    const solutionId='react-table-package';
    const tags=tagsFor('Table',spec,location);
    tags.kind=['library'];tags.task=['data-table','sorting','filtering','pagination','selection'];
    solutions.push({id:solutionId,name:'React Table package',path:`libraries/${location}`,entry_role:'public-api',selectable:true,tags,package:packageInfo(location,id),evidence:inspection,application_guide:applicationGuide('public-api',inspection),...(curated[`${id}/${solutionId}`]??{})});
  }
  if(id==='xyflow'){
    const location='xyflow/packages/react';
    const inspection=evidence(location),solutionId='react-flow-package';
    const tags=tagsFor('React Flow',spec,location);
    tags.kind=['library'];tags.task=['diagramming','editor','flow-editor'];
    solutions.push({id:solutionId,name:'React Flow package',path:`libraries/${location}`,entry_role:'public-api',selectable:true,tags,package:packageInfo(location,id),evidence:inspection,application_guide:applicationGuide('public-api',inspection),...(curated[`${id}/${solutionId}`]??{})});
  }
  const card={id,name:id,source:`https://github.com/${repo}`,commit,local_path:`libraries/${id}`,source_type:sourceType,license_file:licenseFile?`libraries/${id}/${licenseFile}`:null,license_note:licenseFile?null:id==='mantine-ui'?'README.md states MIT, but the snapshot has no root LICENSE file; verify redistribution terms before publication.':'No root license file; inspect repository terms before reuse.',solutions};
  fs.writeFileSync(path.join(catalog,`${id}.json`),JSON.stringify(card,null,2)+'\n');
  console.log(`${id}: ${solutions.length} entries`);
}
