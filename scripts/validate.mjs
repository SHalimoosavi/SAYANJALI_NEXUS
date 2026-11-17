import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const site=read("data/site.json"),products=read("data/products.json"),verticals=read("data/verticals.json"),repoData=read("data/repos.json");
const routes=[...Object.keys(site.pageMeta),...products.map(p=>"/products/"+p.slug+"/")];
const abs=p=>site.siteUrl+p.replace(/^\//,"");
const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const fileFor=p=>path.join(root,p==="/"?"index.html":p.slice(1)+"index.html");
const errors=[],external=new Set(),inbound=new Map(routes.map(p=>[p,0]));
const banned=["TODO","lorem","REPO-NAME","example.com","Termux","mobile-first","L1 Blockchain Live","Platform Ready","production reliability","99.9%"];
const contrast=(a,b)=>{const lum=h=>{const v=h.replace("#","");const c=[0,2,4].map(i=>parseInt(v.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const pairs=[["#F7F8FA","#041e3f"],["#b9c4d3","#041e3f"],["#e8b84b","#041e3f"],["#ffe3a0","#08264a"],["#dce5f1","#03172f"],["#162235","#f5f7fb"],["#526175","#f5f7fb"],["#7a5200","#f5f7fb"],["#142033","#D4A12A"],["#203047","#e8eef6"]];
for(const [fg,bg] of pairs)if(contrast(fg,bg)<4.5)errors.push("Contrast below 4.5:1 for "+fg+" on "+bg);
for(const route of routes){
 const file=fileFor(route);if(!fs.existsSync(file)){errors.push("Missing page "+route);continue;}
 const html=fs.readFileSync(file,"utf8");const title=(html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]||"";const desc=(html.match(/<meta name="description" content="([^"]*)"/i)||[])[1]||"";
 if(title.length>60)errors.push(route+" title length "+title.length);
 if(desc.length<140||desc.length>160)errors.push(route+" description length "+desc.length);
 if((html.match(/<h1\b/gi)||[]).length!==1)errors.push(route+" must have exactly one H1");
 if(!html.includes('<link rel="canonical" href="'+abs(route)+'">'))errors.push(route+" canonical mismatch");
 if(!html.includes('name="robots" content="index, follow, max-image-preview:large"'))errors.push(route+" robots meta missing");
 for(const tag of ['property="og:type"','property="og:site_name"','property="og:title"','property="og:description"','property="og:url"','property="og:image"','property="og:image:width"','property="og:image:height"','property="og:image:alt"','property="og:locale"','name="twitter:card"','name="twitter:title"','name="twitter:description"','name="twitter:image"'])if(!html.includes(tag))errors.push(route+" missing "+tag);
 if(!html.includes('lang="en-IN"'))errors.push(route+" language mismatch");
 if(!html.includes("Facts at a glance"))errors.push(route+" facts block missing");
 if(!html.includes("Last updated: 17 November 2026"))errors.push(route+" visible update date missing");
 if(!html.includes("application/ld+json"))errors.push(route+" JSON-LD missing");
 for(const word of banned)if(html.toLowerCase().includes(word.toLowerCase()))errors.push(route+" contains forbidden phrase: "+word);
 const runtimeUrls=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(u=>u.startsWith("http"));if(runtimeUrls.some(u=>!u.startsWith(site.siteUrl))||/fonts\.googleapis\.com/i.test(html))errors.push(route+" has remote runtime resource");
 if(/<img\b(?![^>]*\balt=)[^>]*>/i.test(html))errors.push(route+" image without alt");
 for(const m of html.matchAll(/<(input|textarea|select)\b[^>]*>/gi)){const id=(m[0].match(/\bid=["']([^"']+)/i)||[])[1];if(!id||(!html.includes('for="'+id+'"')&&!html.includes("for='"+id+"'")))errors.push(route+" unlabelled control "+(id||m[1]));}
 const script=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);let graph=[];
 try{const parsed=JSON.parse(script?.[1]||"null");graph=parsed["@graph"]||[];}catch(e){errors.push(route+" invalid JSON-LD: "+e.message);}
 const defined=new Set(graph.filter(x=>x["@id"]&&Object.keys(x).length>1).map(x=>x["@id"]));
 for(const node of graph){for(const m of JSON.stringify(node).matchAll(/"@id":"([^"]+)"/g)){if(!defined.has(m[1]))errors.push(route+" unresolved schema @id "+m[1]);}}
 for(const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){const href=m[1];if(href.startsWith("mailto:")||href.startsWith("tel:"))continue;if(href.startsWith("#")){if(!html.includes('id="'+href.slice(1)+'"'))errors.push(route+" broken anchor "+href);continue;}if(href.startsWith(site.siteUrl)){const u=new URL(href);let target="/"+u.pathname.slice(new URL(site.siteUrl).pathname.length);if(!target.endsWith("/")&&!path.extname(target))target+="/";if(routes.includes(target))inbound.set(target,(inbound.get(target)||0)+1);else if(!["/favicon.svg","/favicon.ico","/apple-touch-icon.png","/site.webmanifest","/assets/site.css","/assets/site.js","/og/default.png"].includes(target))errors.push(route+" internal link not registered "+target);}else if(href.startsWith("http://")||href.startsWith("https://"))external.add(href);}
 if(fs.statSync(file).size>60*1024)errors.push(route+" HTML exceeds 60 KB");
}
for(const [route,count] of inbound)if(count===0)errors.push("Orphan page "+route);
const home=fs.readFileSync(path.join(root,"index.html"),"utf8"),about=fs.readFileSync(path.join(root,"about/index.html"),"utf8"),contact=fs.readFileSync(path.join(root,"contact/index.html"),"utf8"),eco=fs.readFileSync(path.join(root,"ecosystem/index.html"),"utf8");
for(const x of [site.company,site.tagline,site.heroLocation,site.heroLine,site.footer,site.copyright])if(!home.includes(x))errors.push("Locked home fact missing: "+x);
for(const x of [site.about,site.philosophy,site.vision,site.founderQuote,site.founderQuoteBy,site.ventures,...site.mission])if(!about.includes(esc(x)))errors.push("Locked About fact missing: "+x);
for(const p of site.leaders)for(const x of [p.name,p.title,p.bio])if(!about.includes(esc(x)))errors.push("Locked leader fact missing: "+x);
for(const x of [...site.phones,...site.emails,site.whatsapp])if(!contact.includes(x))errors.push("Locked contact fact missing: "+x);
for(const v of verticals)if(!eco.includes(esc(v.name))||!eco.includes(esc(v.description)))errors.push("Vertical fact missing: "+v.name);
if(!home.includes(site.googleVerification))errors.push("Google verification tag missing");
const ogFile=path.join(root,"og/default.png");if(!fs.existsSync(ogFile))errors.push("OG PNG missing");let og=null;if(fs.existsSync(ogFile)){const b=fs.readFileSync(ogFile);og={width:b.readUInt32BE(16),height:b.readUInt32BE(20),bytes:b.length};if(og.width!==1200||og.height!==630)errors.push("OG PNG dimensions incorrect");}
for(const f of ["favicon.svg","favicon.ico","apple-touch-icon.png","site.webmanifest"])if(!fs.existsSync(path.join(root,f)))errors.push("Missing asset "+f);
const urls=[...fs.readFileSync(path.join(root,"sitemap.xml"),"utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);for(const r of routes)if(!urls.includes(abs(r)))errors.push("Sitemap missing "+r);for(const u of urls)if(!routes.some(r=>abs(r)===u))errors.push("Sitemap contains unexpected URL "+u);
if(!fs.readFileSync(path.join(root,"robots.txt"),"utf8").includes("Sitemap: "+site.siteUrl+"sitemap.xml"))errors.push("robots.txt sitemap mismatch");
if(!fs.readFileSync(path.join(root,"404.html"),"utf8").includes('name="robots" content="noindex, follow"'))errors.push("404 noindex missing");
const css=fs.statSync(path.join(root,"assets/site.css")).size,js=fs.statSync(path.join(root,"assets/site.js")).size,homeSize=fs.statSync(path.join(root,"index.html")).size;if(css>60*1024)errors.push("CSS exceeds 60 KB");if(js>30*1024)errors.push("JS exceeds 30 KB");if(homeSize+css+js>250*1024)errors.push("Home first-load exceeds 250 KB");
if(process.argv.includes("--external"))for(const url of external){let ok=false,last="";for(let n=1;n<=3;n++){try{let res=await fetch(url,{method:"HEAD",redirect:"follow",signal:AbortSignal.timeout(12000)});if(res.status===403||res.status===405)res=await fetch(url,{method:"GET",redirect:"follow",signal:AbortSignal.timeout(12000)});last=res.status+" "+res.url;if(res.status===200){ok=true;break;}}catch(e){last=e.message;}}if(!ok)errors.push("External URL failed after 3 attempts: "+url+" ("+last+")");}
console.log(JSON.stringify({verifiedDate:site.verifiedDate,pages:routes.length,products:products.length,openSourceRows:repoData.items.length,og,bytes:{home:homeSize,css,js,homeFirstLoad:homeSize+css+js},externalUrls:external.size,contrast:pairs.map(([fg,bg])=>({fg,bg,ratio:Number(contrast(fg,bg).toFixed(2))})),errors},null,2));if(errors.length)process.exitCode=1;
