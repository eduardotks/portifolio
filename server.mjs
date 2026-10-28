import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,extname,sep} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORTFOLIO_PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
createServer(async(request,response)=>{
 try{
  let pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(pathname==='/'){response.writeHead(302,{Location:'/portifolio/'});response.end();return;}
  if(pathname.startsWith('/portifolio/'))pathname=pathname.slice('/portifolio'.length);
  if(pathname.split('/').some(part=>part.startsWith('.'))){response.writeHead(404);response.end();return;}
  const file=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(root+sep)){response.writeHead(403);response.end();return;}
  if(!(await stat(file)).isFile())throw new Error('Not a file');
  const body=await readFile(file);response.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});response.end(body);
 }catch{response.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});response.end(await readFile(resolve(root,'404.html')));}
}).listen(port,'127.0.0.1',()=>process.stdout.write(`Local: http://127.0.0.1:${port}/portifolio/\n`));
