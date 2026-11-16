import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const offline=process.argv.includes('--offline');
const cardsRoot=path.join(root,'cards');
const gallery=path.join(root,'gallery');
const codeRoot=path.join(gallery,'code');
fs.mkdirSync(codeRoot,{recursive:true});
const sources=fs.readdirSync(cardsRoot,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
const cards=sources.flatMap(source=>fs.readdirSync(path.join(cardsRoot,source)).filter(x=>x.endsWith('.json')).map(file=>({source,file,card:JSON.parse(fs.readFileSync(path.join(cardsRoot,source,file),'utf8'))})));
const priorLives=new Map(cards.map(({card})=>[card.id,card.demo?.live_url]).filter(x=>x[1]));
const priorKinds=new Map(cards.map(({card})=>[card.id,card.demo?.preview_kind]).filter(x=>x[1]));

// Check the published page itself: a local demo filename alone does not prove
// that an example is accessible on the documentation website.
const antComponents=[...new Set(cards.filter(x=>x.source==='ant-design').map(x=>x.card.local_path.match(/^libraries\/ant-design\/components\/([^/]+)/)?.[1]).filter(Boolean))];
const antIds=new Map();
let cursor=0;
await Promise.all(Array.from({length:8},async()=>{
  if(offline)return;
  while(cursor<antComponents.length){
    const component=antComponents[cursor++];
    try{
      const response=await fetch('https://ant.design/components/'+component+'/',{signal:AbortSignal.timeout(15000)});
      if(!response.ok)continue;
      const html=await response.text();
      antIds.set(component,new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1])));
    }catch{}
  }
}));

const muiDocs=new Map();
const muiRoot=path.join(root,'libraries','material-ui','docs','data','material','components');
const muiSlugs=[...new Set(cards.filter(x=>x.source==='material-ui').map(x=>x.card.local_path.match(/^libraries\/material-ui\/docs\/data\/material\/components\/([^/]+)/)?.[1]).filter(Boolean))];
const muiRoutes=new Map();
const muiPages=path.join(root,'libraries','material-ui','docs','pages','material-ui');
for(const file of fs.readdirSync(muiPages).filter(x=>/^react-.*\.js$/.test(x))){
  const content=fs.readFileSync(path.join(muiPages,file),'utf8');
  const match=content.match(/docs\/data\/material\/components\/([^/]+)\/[^'"]+\.md/);
  if(match)muiRoutes.set(match[1],file.replace(/\.js$/,''));
}
cursor=0;
await Promise.all(Array.from({length:8},async()=>{
  if(offline)return;
  while(cursor<muiSlugs.length){
    const slug=muiSlugs[cursor++];
    const route=muiRoutes.get(slug);
    if(!route)continue;
    const url='https://mui.com/material-ui/'+route+'/';
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
      if(!response.ok)continue;
      const html=await response.text();
      const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
      const docDir=path.join(muiRoot,slug);
      const md=fs.existsSync(docDir)?fs.readdirSync(docDir).find(x=>x.endsWith('.md')):null;
      const demos=new Map();
      if(md){
        let heading='';
        for(const line of fs.readFileSync(path.join(docDir,md),'utf8').split(/\r?\n/)){
          const h=line.match(/^#{2,6}\s+(.+)/);
          if(h)heading=h[1].replace(/<[^>]+>/g,'').trim();
          const d=line.match(/file:\/\/\.\/demos\/([^/]+)\//);
          if(d&&heading){
            const anchor=heading.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
            if(ids.has(anchor))demos.set(d[1],url+'#'+anchor);
          }
        }
      }
      muiDocs.set(slug,{url,ids,demos});
    }catch{}
  }
}));

const kebab=value=>value.replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/([A-Z])([A-Z][a-z])/g,'$1-$2').toLowerCase();
const candidate=({source,card})=>{
  const p=card.local_path;
  let m;
  if(source==='chakra-ui'&&(m=p.match(/\/components\/([^/]+)$/)))return 'https://chakra-ui.com/docs/components/'+m[1];
  if(source==='primereact'&&(m=p.match(/\/components\/lib\/([^/]+)$/)))return 'https://v10.primereact.org/'+m[1]+'/';
  if(source==='radix-primitives'&&(m=p.match(/\/packages\/react\/([^/]+)$/)))return 'https://www.radix-ui.com/primitives/docs/components/'+m[1];
  if(source==='mantine'&&(m=p.match(/\/packages\/@mantine\/([^/]+)\/src\/([^/]+)$/))){
    const section=({core:'core',charts:'charts',dates:'dates',hooks:'hooks'})[m[1]];
    if(section)return 'https://mantine.dev/'+section+'/'+kebab(m[2])+'/';
  }
  if(source==='mantine'&&(m=p.match(/\/packages\/@mantine\/core\/src\/components\/([^/]+)$/)))return 'https://mantine.dev/core/'+kebab(m[1])+'/';
  if(source==='mantine-ui'&&(m=p.match(/\/lib\/([^/]+)$/)))return 'https://ui.mantine.dev/component/'+kebab(m[1])+'/';
  if(source==='tanstack-table'&&(m=p.match(/\/examples\/react\/([^/]+)$/)))return 'https://tanstack.com/table/latest/docs/framework/react/examples/'+m[1];
  if(source==='shadcn-ui'){
    m=p.match(/\/registry\/new-york-v4\/(blocks|charts|examples)\/([^/]+?)(?:\.tsx)?$/);
    if(m)return 'https://ui.shadcn.com/view/new-york-v4/'+m[2];
    m=p.match(/\/registry\/new-york-v4\/ui\/([^/]+)\.tsx$/);
    if(m)return 'https://ui.shadcn.com/docs/components/radix/'+m[1];
  }
  if(source==='react-aria'&&(m=p.match(/\/src\/([^/]+)\.tsx$/)))return 'https://react-aria.adobe.com/'+m[1];
  if(source==='tiptap'&&(m=p.match(/\/demos\/src\/Examples\/([^/]+)\/React\//)))return 'https://embed.tiptap.dev/preview/Examples/'+m[1]+'/React';
  return null;
};
const candidates=[...new Set(cards.map(candidate).filter(Boolean))];
const checked=new Set();
cursor=0;
await Promise.all(Array.from({length:16},async()=>{
  if(offline)return;
  while(cursor<candidates.length){
    const url=candidates[cursor++];
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
      if(response.ok&&response.url.startsWith(new URL(url).origin))checked.add(url);
    }catch{}
  }
}));
const flowExamples=new Map();
try{
  if(offline)throw Error('offline');
  const response=await fetch('https://reactflow.dev/examples',{signal:AbortSignal.timeout(12000)});
  if(response.ok){
    const html=await response.text();
    for(const [,href] of html.matchAll(/href="([^"]*\/examples\/[^"]+)"/g)){
      const url=new URL(href,'https://reactflow.dev').href;
      if(url.startsWith('https://reactflow.dev/examples/')){
        const slug=url.split('/').at(-1).split('?')[0];
        flowExamples.set(slug,url);
      }
    }
  }
}catch{}

const index=[];
const totals={exact_example:0,component_page:0,source_doc_route:0,no_preview:0};
for(const {source,file,card} of cards){
  const local=path.join(root,card.local_path);
  let code='Исходник не найден.';
  if(fs.existsSync(local)){
    const stat=fs.statSync(local);
    if(stat.isFile())code=fs.readFileSync(local,'utf8');
    else if(stat.isDirectory())code='Содержимое папки:\n'+fs.readdirSync(local).slice(0,300).join('\n');
  }
  const codeDir=path.join(codeRoot,source);
  fs.mkdirSync(codeDir,{recursive:true});
  const codePath='code/'+source+'/'+file.replace(/\.json$/,'.js');
  fs.writeFileSync(path.join(gallery,codePath),'window.CARD_CODE='+JSON.stringify(code)+';\n');
  let live=null;
  if(source==='ant-design'){
    const match=card.local_path.match(/^libraries\/ant-design\/components\/([^/]+)\/demo\/([^/]+)\.tsx$/);
    if(match){
      const [,component,demo]=match;
      const id=component+'-demo-'+demo;
      if(antIds.get(component)?.has(id))live='https://ant.design/components/'+component+'/#'+id;
    }
  }
  if(source==='material-ui'){
    const match=card.local_path.match(/^libraries\/material-ui\/docs\/data\/material\/components\/([^/]+)\/demos\/([^/]+)\//);
    if(match)live=muiDocs.get(match[1])?.demos.get(match[2])||null;
  }
  if(!live){const url=candidate({source,card});if(url&&checked.has(url))live=url;}
  if(!live&&source==='ant-design'){
    const m=card.local_path.match(/^libraries\/ant-design\/components\/([^/]+)/);
    if(m&&antIds.has(m[1]))live='https://ant.design/components/'+m[1]+'/';
  }
  if(!live&&source==='material-ui'){
    const m=card.local_path.match(/^libraries\/material-ui\/docs\/data\/material\/components\/([^/]+)/);
    if(m&&muiDocs.has(m[1]))live=muiDocs.get(m[1]).url;
  }
  if(!live&&source==='xyflow'){
    const m=card.local_path.match(/\/examples\/react\/src\/examples\/([^/]+)/);
    if(m){const slug=kebab(m[1]);live=flowExamples.get(slug)||null;}
  }
  if(!live)live=priorLives.get(card.id)||null;
  let liveKind=live?(live.includes('#')||live.includes('/view/')||['tanstack-table','mantine-ui','tiptap'].includes(source)?'exact-example':'component-page'):null;
  if(live===priorLives.get(card.id)&&priorKinds.has(card.id))liveKind=priorKinds.get(card.id);
  if(!live&&source==='material-ui'){
    const m=card.local_path.match(/^libraries\/material-ui\/docs\/data\/material\/components\/([^/]+)/);
    const route=m&&muiRoutes.get(m[1]);
    if(route){live='https://mui.com/material-ui/'+route+'/';liveKind='source-doc-route';}
  }
  const sourcePath='../'+card.local_path;
  let description=card.purpose||card.what;
  if(source==='ant-design'){
    const m=card.local_path.match(/^libraries\/ant-design\/components\/([^/]+)(?:\/demo\/([^/]+)\.tsx)?/);
    if(m){
      const doc=path.join(root,'libraries','ant-design','components',m[1],'index.en-US.md');
      const caption=fs.existsSync(doc)?fs.readFileSync(doc,'utf8').match(/^description:\s*(.+)$/m)?.[1]:null;
      const demoDoc=m[2]&&path.join(root,'libraries','ant-design','components',m[1],'demo',m[2]+'.md');
      const demoText=demoDoc&&fs.existsSync(demoDoc)?fs.readFileSync(demoDoc,'utf8').split('## en-US')[1]?.split(/^## /m)[0]?.trim():null;
      description=[caption,demoText].filter(Boolean).join(' ');
      if(!description)description=card.purpose||card.what;
    }
  }
  card.demo={
    ...(card.demo||{}),
    preview_path:null,
    preview_kind:liveKind||'none',
    live_url:live,
    source_component_executed:false,
    interactive_mockup:false
  };
  fs.writeFileSync(path.join(cardsRoot,source,file),JSON.stringify(card,null,2)+'\n');
  index.push({id:card.id,name:card.name,source,tags:card.tags.task||[],what:description,local_path:card.local_path,source_path:sourcePath,repo:card.source,code_path:codePath,code_kind:fs.existsSync(local)&&fs.statSync(local).isDirectory()?'directory':'file',live,liveKind});
  if(liveKind==='exact-example')totals.exact_example++;
  else if(liveKind==='component-page')totals.component_page++;
  else if(liveKind==='source-doc-route')totals.source_doc_route++;
  else totals.no_preview++;
}
fs.writeFileSync(path.join(gallery,'catalog-data.js'),'window.CATALOG='+JSON.stringify(index)+';\n');
fs.writeFileSync(path.join(gallery,'manifest.json'),JSON.stringify({total:index.length,...totals,illustrative_mockups:0},null,2)+'\n');
console.log(JSON.stringify({total:index.length,...totals,antPagesChecked:antIds.size,muiPagesChecked:muiDocs.size,otherPagesChecked:checked.size,flowExamplesFound:flowExamples.size},null,2));
