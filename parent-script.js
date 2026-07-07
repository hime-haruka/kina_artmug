(function(){
var config=window.ArtmugPortfolioConfig||{};
var scriptEl=document.currentScript||document.querySelector("script[src*='parent-script']");
var scriptOrigin="";
try{scriptOrigin=scriptEl&&scriptEl.src?new URL(scriptEl.src).origin:""}catch(e){}
var iframeSrc=config.iframeSrc||((scriptOrigin?scriptOrigin:".")+"/");
var iframeId=config.iframeId||"portfolioFrame";
var containerSelector=config.containerSelector||"#artmugPortfolioMount";
var allowedOrigin=config.allowedOrigin||scriptOrigin||"*";
var stickyOffset=Number(config.stickyOffset)||0;
var removeSelectors=config.removeSelectors||[".artmug_btn",".artmug-button",".portfolio_button",".btn_area",".button_area","a[href*='order']","a[href*='request']","a[href*='apply']"];
function findMount(){
var target=null;
try{target=document.querySelector(containerSelector)}catch(e){}
if(target)return target;
target=document.querySelector("[name='am-root'] [name='stage']")||document.querySelector("[name='am-root']");
if(target)return target;
var wrap=document.createElement("div");
wrap.id="artmugPortfolioMount";
if(scriptEl&&scriptEl.parentNode){scriptEl.parentNode.insertBefore(wrap,scriptEl)}else{document.body.appendChild(wrap)}
return wrap;
}
function findExistingIframe(){
var found=document.getElementById(iframeId);
if(found&&found.tagName&&found.tagName.toLowerCase()==="iframe")return found;
var mount=findMount();
found=mount.querySelector("iframe");
if(found)return found;
found=document.querySelector("iframe[src*='kina-artmug.netlify.app']")||document.querySelector("iframe[src*='netlify.app']");
return found||null;
}
function buildIframe(){
var existing=findExistingIframe();
if(existing){
if(!existing.id)existing.id=iframeId;
return existing;
}
var frame=document.createElement("iframe");
frame.id=iframeId;
frame.title=config.title||"Live2D Portfolio";
frame.src=iframeSrc;
frame.loading="eager";
frame.scrolling="no";
frame.setAttribute("allowtransparency","true");
frame.setAttribute("allow","clipboard-write; fullscreen; autoplay; encrypted-media; picture-in-picture");
frame.style.width="100%";
frame.style.maxWidth="1180px";
frame.style.border="0";
frame.style.display="block";
frame.style.overflow="hidden";
frame.style.background="transparent";
frame.style.margin="0 auto";
frame.style.borderRadius="20px";
findMount().appendChild(frame);
return frame;
}
function hideButtons(){
if(config.hideArtmugButtons===false)return;
removeSelectors.forEach(function(selector){
try{document.querySelectorAll(selector).forEach(function(el){if(!el.closest("#artmugPortfolioMount")&&!el.closest("[name='am-root']")){el.style.display="none"}})}catch(e){}
});
}
var iframe=buildIframe();
function setHeight(height){
var next=Math.max(300,Math.ceil(Number(height)||0));
iframe.style.height=next+"px";
iframe.setAttribute("height",String(next));
sendViewport();
}
function post(message){
try{if(iframe.contentWindow)iframe.contentWindow.postMessage(message,"*")}catch(e){}
}
function sendViewport(){
if(!iframe||!iframe.getBoundingClientRect)return;
var rect=iframe.getBoundingClientRect();
post({type:"artmugPortfolio:viewport",frameTop:rect.top,frameLeft:rect.left,frameWidth:rect.width,frameHeight:rect.height,viewportHeight:window.innerHeight||document.documentElement.clientHeight,viewportWidth:window.innerWidth||document.documentElement.clientWidth,scrollY:window.pageYOffset||document.documentElement.scrollTop,stickyOffset:stickyOffset});
}
var viewportTick=false;
function scheduleViewport(){
if(viewportTick)return;
viewportTick=true;
requestAnimationFrame(function(){viewportTick=false;sendViewport()});
}
window.addEventListener("message",function(event){
if(allowedOrigin!=="*"&&event.origin!==allowedOrigin)return;
var data=event.data||{};
if(data.type==="artmugPortfolio:height")setHeight(data.height);
if(data.type==="artmugPortfolio:scrollTop")window.scrollTo({top:iframe.getBoundingClientRect().top+window.pageYOffset,behavior:"smooth"});
if(data.type==="artmugPortfolio:scrollTo")window.scrollTo({top:iframe.getBoundingClientRect().top+window.pageYOffset+Math.max(0,Number(data.offset)||0),behavior:"smooth"});
if(data.type==="artmugPortfolio:requestViewport")sendViewport();
});
iframe.addEventListener("load",function(){
post({type:"artmugPortfolio:requestHeight"});
sendViewport();
});
window.addEventListener("scroll",scheduleViewport,{passive:true});
window.addEventListener("resize",scheduleViewport);
window.addEventListener("orientationchange",scheduleViewport);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){hideButtons();sendViewport()});else{hideButtons();sendViewport()}
setInterval(hideButtons,1200);
setInterval(sendViewport,700);
})();
