(function(){
var config=window.ArtmugPortfolioConfig||{};
var scriptEl=document.currentScript||document.querySelector("script[src*='parent-script']");
var scriptOrigin="";
try{scriptOrigin=scriptEl&&scriptEl.src?new URL(scriptEl.src).origin:""}catch(e){}
var iframeId=config.iframeId||"portfolioFrame";
var iframeSelector=config.iframeSelector||"iframe[src*='kina-artmug.netlify.app'], iframe[src*='artmug_portfolio'], iframe[src*='iframe.html'], [name='am-root'] iframe, #portfolioFrame";
var allowedOrigin=config.allowedOrigin||scriptOrigin||"*";
var stickyOffset=Number(config.stickyOffset)||0;
var removeSelectors=config.removeSelectors||[".artmug_btn",".artmug-button",".portfolio_button",".btn_area",".button_area","a[href*='order']","a[href*='request']","a[href*='apply']"];
var iframe=null;
var binded=false;
var observer=null;
var retryTimer=null;
var retryCount=0;
function q(selector){try{return document.querySelector(selector)}catch(e){return null}}
function findIframe(){
var found=document.getElementById(iframeId);
if(found&&found.tagName&&found.tagName.toLowerCase()==="iframe")return found;
if(config.iframeSelector){found=q(config.iframeSelector);if(found&&found.tagName&&found.tagName.toLowerCase()==="iframe")return found}
found=q("[name='am-root'] iframe");
if(found&&found.tagName&&found.tagName.toLowerCase()==="iframe")return found;
found=q("iframe[src*='"+(scriptOrigin||"netlify.app")+"']");
if(found&&found.tagName&&found.tagName.toLowerCase()==="iframe")return found;
found=q(iframeSelector);
if(found&&found.tagName&&found.tagName.toLowerCase()==="iframe")return found;
return null;
}
function post(message){
if(!iframe||!iframe.contentWindow)return;
try{iframe.contentWindow.postMessage(message,"*")}catch(e){}
}
function sendViewport(){
if(!iframe||!iframe.getBoundingClientRect)return;
var rect=iframe.getBoundingClientRect();
post({type:"artmugPortfolio:viewport",frameTop:rect.top,frameLeft:rect.left,frameWidth:rect.width,frameHeight:rect.height,viewportHeight:window.innerHeight||document.documentElement.clientHeight,viewportWidth:window.innerWidth||document.documentElement.clientWidth,scrollY:window.pageYOffset||document.documentElement.scrollTop,stickyOffset:stickyOffset});
}
function setHeight(height){
if(!iframe)return;
var next=Math.max(300,Math.ceil(Number(height)||0));
iframe.style.height=next+"px";
iframe.setAttribute("height",String(next));
sendViewport();
}
var viewportTick=false;
function scheduleViewport(){
if(viewportTick)return;
viewportTick=true;
requestAnimationFrame(function(){viewportTick=false;sendViewport()});
}
function hideButtons(){
if(config.hideArtmugButtons===false)return;
removeSelectors.forEach(function(selector){
try{document.querySelectorAll(selector).forEach(function(el){if(!el.closest("[name='am-root']")&&!el.closest("#artmugPortfolioMount")){el.style.display="none"}})}catch(e){}
});
}
function bindIframe(found){
if(!found||binded)return;
iframe=found;
if(!iframe.id)iframe.id=iframeId;
iframe.scrolling="no";
iframe.setAttribute("scrolling","no");
iframe.style.overflow="hidden";
if(!iframe.style.display)iframe.style.display="block";
binded=true;
iframe.addEventListener("load",function(){post({type:"artmugPortfolio:requestHeight"});sendViewport()});
window.addEventListener("scroll",scheduleViewport,{passive:true});
window.addEventListener("resize",scheduleViewport);
window.addEventListener("orientationchange",scheduleViewport);
post({type:"artmugPortfolio:requestHeight"});
sendViewport();
setTimeout(function(){post({type:"artmugPortfolio:requestHeight"});sendViewport()},300);
setTimeout(function(){post({type:"artmugPortfolio:requestHeight"});sendViewport()},1000);
}
function tryBind(){
var found=findIframe();
if(found){bindIframe(found);return true}
return false;
}
window.addEventListener("message",function(event){
if(allowedOrigin!=="*"&&event.origin!==allowedOrigin)return;
var data=event.data||{};
if(data.type==="artmugPortfolio:height")setHeight(data.height);
if(data.type==="artmugPortfolio:scrollTop"&&iframe)window.scrollTo({top:iframe.getBoundingClientRect().top+window.pageYOffset,behavior:"smooth"});
if(data.type==="artmugPortfolio:scrollTo"&&iframe)window.scrollTo({top:iframe.getBoundingClientRect().top+window.pageYOffset+Math.max(0,Number(data.offset)||0),behavior:"smooth"});
if(data.type==="artmugPortfolio:requestViewport")sendViewport();
});
function start(){
hideButtons();
if(tryBind())return;
observer=new MutationObserver(function(){if(tryBind()&&observer){observer.disconnect();observer=null}});
try{observer.observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
retryTimer=setInterval(function(){
retryCount++;
hideButtons();
if(tryBind()||retryCount>30){clearInterval(retryTimer);retryTimer=null;if(observer){observer.disconnect();observer=null}}
},300);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
setInterval(hideButtons,1200);
setInterval(function(){if(binded)sendViewport()},700);
})();
