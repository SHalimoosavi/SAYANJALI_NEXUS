import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
let chromium;
try{({chromium}=await import("playwright"));}catch{console.log("Not run: Playwright is not installed. Install with npm install --no-save playwright, then run node scripts/browser-check.mjs.");process.exit(0);}
const basePath="/SAYANJALI_NEXUS/";
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".json":"application/json"};
const server=http.createServer((req,res)=>{const u=new URL(req.url,"http://127.0.0.1");let p=u.pathname.startsWith(basePath)?u.pathname.slice(basePath.length):u.pathname.replace(/^\//,"");if(!p)p="index.html";if(p.endsWith("/"))p+="index.html";const file=path.resolve(root,p);if(!file.startsWith(root)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end("Not found");return;}res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream"}).end(data);});});
await new Promise(resolve=>server.listen(4173,"127.0.0.1",resolve));
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];\nfs.mkdirSync(path.join(root,"artifacts/screenshots"),{recursive:true});\nconst site=JSON.parse(fs.readFileSync(path.join(root,"data/site.json"),"utf8"));\nconst products=JSON.parse(fs.readFileSync(path.join(root,"data/products.json"),"utf8"));\nconst routes=[...Object.keys(site.pageMeta),...products.map(p=>"/products/"+p.slug+"/")];
for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});for(const route of routes){await page.goto("http://127.0.0.1:4173"+basePath+route.replace(/^\\//,""),{waitUntil:"networkidle",timeout:30000});const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));if(result.scrollWidth>result.width)errors.push("Horizontal overflow at "+width+"px on "+route+": "+result.scrollWidth);if(route==="/"&&width===375){const toggle=page.locator("[data-menu-toggle]");await toggle.click();if(await toggle.getAttribute("aria-expanded")!=="true")errors.push("Mobile menu did not open");await toggle.click();await page.screenshot({path:path.join(root,"artifacts/screenshots/home-375.png"),fullPage:true});}if(route==="/"&&width===1440)await page.screenshot({path:path.join(root,"artifacts/screenshots/home-1440.png"),fullPage:true});}}
await browser.close();server.close();console.log(JSON.stringify({widths:[320,375,768,1024,1440],routes:routes.length,errors},null,2));if(errors.length)process.exitCode=1;
