import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
let chromium;
try {
  ({chromium}=await import("playwright"));
} catch {
  console.log("Not run: Playwright is not installed. Install with npm install --no-save playwright, then run node scripts/browser-check.mjs.");
  process.exit(0);
}

const basePath="/SAYANJALI_NEXUS/";
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".json":"application/json"};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,"http://127.0.0.1");
  let relative=url.pathname.startsWith(basePath)?url.pathname.slice(basePath.length):url.pathname.replace(/^\//,"");
  if(!relative)relative="index.html";
  if(relative.endsWith("/"))relative+="index.html";
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{
    if(error){res.writeHead(404).end("Not found");return;}
    res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream"}).end(data);
  });
});
let browser;
const errors=[];
try {
  await new Promise(resolve=>server.listen(4173,"127.0.0.1",resolve));
  browser=await chromium.launch({headless:true,timeout:30000});
  const page=await browser.newPage();
  page.on("pageerror",error=>errors.push("Browser JavaScript error: "+error.message));
  fs.mkdirSync(path.join(root,"artifacts","screenshots"),{recursive:true});
  const site=JSON.parse(fs.readFileSync(path.join(root,"data/site.json"),"utf8"));
  const products=JSON.parse(fs.readFileSync(path.join(root,"data/products.json"),"utf8"));
  const routes=[...Object.keys(site.pageMeta),...products.map(product=>"/products/"+product.slug+"/")];
  for(const width of [320,375,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of routes){
      const target="http://127.0.0.1:4173"+basePath+route.replace(/^\//,"");
      let loaded=false,lastError="";
      for(let attempt=1;attempt<=3;attempt++){
        try{await page.goto(target,{waitUntil:"networkidle",timeout:30000});loaded=true;break;}
        catch(error){lastError=error.message;}
      }
      if(!loaded){errors.push("Navigation failed after 3 attempts at "+width+"px on "+route+": "+lastError);continue;}
      const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
      if(dimensions.scrollWidth>dimensions.width)errors.push("Horizontal overflow at "+width+"px on "+route+": "+dimensions.scrollWidth);
      if(route==="/"&&width===375){
        const toggle=page.locator("[data-menu-toggle]");
        await toggle.click();
        if(await toggle.getAttribute("aria-expanded")!=="true")errors.push("Mobile menu did not open");
        await toggle.click();
        await page.screenshot({path:path.join(root,"artifacts","screenshots","home-375.png"),fullPage:true});
      }
      if(route==="/"&&width===1440)await page.screenshot({path:path.join(root,"artifacts","screenshots","home-1440.png"),fullPage:true});
    }
  }
  await browser.close();
  browser=null;
  console.log(JSON.stringify({widths:[320,375,768,1024,1440],routes:routes.length,navigations:routes.length*5,errors},null,2));
  if(errors.length)process.exitCode=1;
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
