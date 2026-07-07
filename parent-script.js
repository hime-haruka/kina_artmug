(function(){
var config=window.ArtmugPortfolioConfig||{};
var iframeSrc=config.iframeSrc||"./iframe.html";
var iframeId=config.iframeId||"portfolioFrame";
var containerSelector=config.containerSelector||"#artmugPortfolioMount";
var allowedOrigin=config.allowedOrigin||"*";
var stickyOffset=Number(config.stickyOffset)||0;
var removeSelectors=config.removeSelectors||[".artmug_btn",".artmug-button",".portfolio_button",".btn_area",".button_area","a[href*='order']","a[href*='request']","a[href*='apply']"];
function findMount(){
var target=document.querySelector(containerSelector);
if(target)return target;
var script=document.currentScript||document.querySelector("script[src*='parent-script']");
var wrap=document.createElement("div");
wrap.id="artmugPortfolioMount";
if(script&&script.parentNode){script.parentNode.insertBefore(wrap,script)}else{document.body.appendChild(wrap)}
return wrap;
}
function buildIframe(){
var existing=document.getElementById(iframeId);
if(existing)return existing;
var frame=document.createElement("iframe");
frame.id=iframeId;
frame.title=config.title||"Live2D Portfolio";
frame.src=iframeSrc;
frame.loading="lazy";
frame.scrolling="no";
frame.setAttribute("allowtransparency","true");
frame.style.width="100%";
frame.style.border="0";
frame.style.display="block";
frame.style.overflow="hidden";
frame.style.background="transparent";
findMount().appendChild(frame);
return frame;
}
function hideButtons(){
if(config.hideArtmugButtons===false)return;
removeSelectors.forEach(function(selector){
try{document.querySelectorAll(selector).forEach(function(el){if(!el.closest("#artmugPortfolioMount")){el.style.display="none"}})}catch(e){}
});
}
var iframe=buildIframe();
function setHeight(height){
var next=Math.max(300,Math.ceil(Number(height)||0));
iframe.style.height=next+"px";
sendViewport();
}
function post(message){
try{if(iframe.contentWindow)iframe.contentWindow.postMessage(message,"*")}catch(e){}
}
function sendViewport(){
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
hideButtons();
setInterval(hideButtons,1200);
setInterval(sendViewport,700);
})();
