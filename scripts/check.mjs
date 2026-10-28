import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {profile,projects,experience,skillGroups,certificates,courses,languages} from '../content.js';
import {ui} from '../ui.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const locales=['pt-BR','en','es'];
function checkTranslations(value,path='content'){
 if(!value||typeof value!=='object')return;
 if(locales.some(locale=>locale in value)){for(const locale of locales)assert.equal(typeof value[locale],'string',`${path}: missing ${locale}`);for(const locale of locales)assert.ok(value[locale].trim(),`${path}: empty ${locale}`);}
 else for(const [key,item]of Object.entries(value))checkTranslations(item,`${path}.${key}`);
}
checkTranslations({ui,projects,experience,skillGroups,certificates,courses,languages});
const html=await readFile(resolve(root,'index.html'),'utf8');
for(const [,key]of html.matchAll(/data-t="([^"]+)"/g))assert.ok(ui[key],`Missing UI key: ${key}`);
assert.equal(projects.length,4);assert.equal(new Set(projects.map(p=>p.id)).size,4);
assert.equal(courses.length,13);assert.equal(certificates.length,4);assert.equal(languages.length,3);
assert.equal(projects.find(p=>p.id==='focuspet').status,'testing');assert.equal(projects.find(p=>p.id==='culinae').status,'personal');
assert.equal(experience[0].start,'2024-10');assert.equal(experience[1].end,'2024-10');assert.equal(experience[2].start,'2019-11');
const content=await readFile(resolve(root,'content.js'),'utf8');
for(const expected of ['Java 25','Vue.js 3','Sprint 26','Sprint 70','17 September 2026','541','June 2026'])assert.ok(content.includes(expected),`Missing professional fact: ${expected}`);
for(const project of projects){await stat(resolve(root,'assets',project.image));if(project.preview)await stat(resolve(root,'assets',project.preview));for(const link of project.links)assert.equal(new URL(link.url).protocol,'https:');}
for(const [,url]of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g))await stat(resolve(root,url));
assert.ok(!html.includes('src="/assets/'),'Assets must work under the GitHub Pages repository path');
assert.equal(profile.url,'https://eduardotks.github.io/portifolio/');
async function scan(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(item.name==='.git'||item.name==='qa'||item.name==='node_modules')continue;const path=resolve(dir,item.name);if(item.isDirectory())await scan(path);else if(/\.(?:html|js|mjs|json|css|svg|md|xml|txt)$/.test(item.name)){const source=await readFile(path,'utf8');assert.ok(!/(?<!\d)(?:55)?\d{2}9\d{8}(?!\d)/.test(source),`Possible private phone number in ${item.name}`);assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source),`Private key in ${item.name}`);}}}
await scan(root);
console.log('PASS: three complete languages; four projects with accurate release status; 13 courses; 4 certificates; 3 languages; employment dates; key contributions; assets; GitHub Pages paths; privacy checks.');
