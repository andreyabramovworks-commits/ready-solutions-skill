import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const catalog=path.join(root,'catalog');
const cards=path.join(root,'cards');
const taskNames={
 'data-table':'таблицы данных и операции с ними',
 forms:'поля ввода и сбор пользовательских данных',
 overlays:'диалоговые и всплывающие элементы интерфейса',
 navigation:'навигация по разделам и действиям',
 analytics:'метрики, статистика и графики',
 'date-time':'даты, время и периоды',
 auth:'вход и управление доступом',
 editor:'редактирование текста или структурированного содержимого',
 feedback:'уведомления, ошибки и обратная связь',
 hierarchy:'деревья и вложенные структуры',
 diagramming:'интерактивные схемы и связи',
 'file-upload':'выбор и загрузка файлов',
 layout:'компоновка интерфейса',
 actions:'кнопки и элементы запуска действий',
 display:'представление текста и содержимого',
 search:'поиск и фильтрация',
 accessibility:'доступные интерактивные элементы',
 workflow:'последовательные шаги процесса',
 'drag-and-drop':'перетаскивание элементов',
 'state-management':'управление состоянием интерфейса',
 api:'организация API и запросов',
 migrations:'структура миграций базы данных',
 configuration:'настройки приложения',
 'component-structure':'организация компонентов'
};
let count=0;
for(const file of fs.readdirSync(catalog).filter(x=>x.endsWith('.json'))){
 const source=JSON.parse(fs.readFileSync(path.join(catalog,file),'utf8'));
 for(const s of source.solutions){
  if(!s.selectable)continue;
  const tasks=s.tags.task;
  const caveats=[];
  if(s.evidence.example_data)caveats.push('В исходнике найдены демонстрационные данные; замените их данными приложения.');
  if(s.evidence.workspace_alias_imports.length)caveats.push('Есть локальные импорты: '+s.evidence.workspace_alias_imports.join(', ')+'. При переносе разрешите их.');
  if(['working-example','copyable-example'].includes(s.entry_role))caveats.push('Это пример: адаптируйте обработчики, данные, стили и состояние.');
  if(!source.license_file)caveats.push(source.license_note??'Проверьте условия использования: корневой файл лицензии не найден.');
  if(s.evidence.external_imports.length)caveats.push('Проверьте необходимые зависимости и их версии в манифесте пакета.');
  const card={
   id:source.id+'/'+s.id,
   name:s.name,
   what:s.purpose??('Решение для задачи: '+tasks.map(t=>taskNames[t]??t).join('; ')+'.'),
   why:'Помогает быстро найти исходную реализацию для нужной задачи и оценить, подходит ли она проекту.',
   source:source.source,
   source_commit:source.commit,
   source_type:s.entry_role,
   local_path:s.path,
   package:s.package??null,
   tags:s.tags,
   dependencies:s.evidence.external_imports,
   local_imports:s.evidence.workspace_alias_imports,
   tests_present:s.evidence.has_tests,
   styles_present:s.evidence.has_styles,
   sample_data_present:s.evidence.example_data,
   use:s.advice??s.review?.advice??s.application_guide?.caution??'Изучите публичный API и примеры пакета; адаптируйте под целевой проект.',
   caveats,
   verification:{method:'проверка локального исходника и метаданных',behavior_tested:false}
  };
  const dir=path.join(cards,source.id);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,s.id+'.json'),JSON.stringify(card,null,2)+'\n','utf8');
  count++;
 }
}
console.log('Создано карточек:',count);
