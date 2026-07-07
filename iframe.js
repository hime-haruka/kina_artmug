(function(){
var SHEETS={
profile:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=27915865&single=true&output=csv",
slots:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=1250258258&single=true&output=csv",
guide:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=0&single=true&output=csv",
process:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=389624143&single=true&output=csv",
options:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=1739723563&single=true&output=csv",
details:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=1479684210&single=true&output=csv",
showcase:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=1786326989&single=true&output=csv",
partners:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6R4XZoiuwbjonIBsfhkActDREFCbyEKxBFH_6_-2MmXP9nOxYmmJDQIYsBaTXerK5tXUHzyDwE_f9/pub?gid=601430545&single=true&output=csv"
};
var state={profile:[],slots:[],guide:[],process:[],options:[],details:[],showcase:[],partners:[]};
var parentViewport={frameTop:0,viewportHeight:window.innerHeight||800,stickyOffset:0};
var animatedItems=[];
var animationTick=false;
var els={
profile:document.getElementById("profileContent"),
slots:document.getElementById("slotsContent"),
guide:document.getElementById("guideContent"),
process:document.getElementById("processContent"),
options:document.getElementById("optionsContent"),
details:document.getElementById("detailsContent"),
showcase:document.getElementById("showcaseContent"),
partners:document.getElementById("partnersContent"),
form:document.getElementById("requestForm"),
workTypeChoices:document.getElementById("workTypeChoices"),
formOptions:document.getElementById("formOptions"),
copyButton:document.getElementById("copyFormButton"),
copyOutput:document.getElementById("copyOutput"),
toast:document.getElementById("toast"),
hero:document.getElementById("topHero"),
modal:document.getElementById("videoModal"),
modalFrame:document.getElementById("videoModalFrame"),
modalTitle:document.getElementById("videoModalTitle")
};
function esc(value){return String(value==null?"":value).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]})}
function nl(value){return esc(value).replace(/\r\n|\r|\n/g,"<br>")}
function clean(value){return String(value==null?"":value).trim()}
function num(value){var n=Number(String(value==null?"":value).replace(/[^0-9.-]/g,""));return Number.isFinite(n)?n:0}
function sortRows(rows){return rows.slice().sort(function(a,b){return num(a.c_order)-num(b.c_order)||num(a.order)-num(b.order)||num(a.step)-num(b.step)})}
function withCache(url){var join=url.indexOf("?")>-1?"&":"?";return url+join+"cache="+Date.now()}
function parseCSV(text){
var rows=[];
var row=[];
var field="";
var quote=false;
for(var i=0;i<text.length;i++){
var ch=text[i];
var next=text[i+1];
if(ch==='"'){
if(quote&&next==='"'){field+='"';i++}else{quote=!quote}
}else if(ch===","&&!quote){row.push(field);field=""}
else if((ch==="\n"||ch==="\r")&&!quote){
if(ch==="\r"&&next==="\n")i++;
row.push(field);
if(row.some(function(v){return clean(v)!==""}))rows.push(row);
row=[];
field="";
}else{field+=ch}
}
row.push(field);
if(row.some(function(v){return clean(v)!==""}))rows.push(row);
if(!rows.length)return [];
var headers=rows.shift().map(function(v){return clean(v)});
return rows.map(function(cols){
var item={};
headers.forEach(function(key,index){if(key)item[key]=clean(cols[index])});
return item;
}).filter(function(item){return Object.keys(item).some(function(key){return clean(item[key])!==""})});
}
function fetchCSV(key){
return fetch(withCache(SHEETS[key]),{cache:"no-store"}).then(function(res){if(!res.ok)throw new Error(key);return res.text()}).then(parseCSV).catch(function(){return []})
}
function groupBy(rows,key){
return rows.reduce(function(map,row){var name=clean(row[key])||"기타";(map[name]=map[name]||[]).push(row);return map},{})
}
function driveImage(url,size){
var u=clean(url);
var s=size||3000;
if(!u)return "";
var match=u.match(/\/d\/([^/]+)/)||u.match(/[?&]id=([^&]+)/);
if(match)return "https://drive.google.com/thumbnail?id="+encodeURIComponent(match[1])+"&sz=w"+s;
return u;
}
function youtubeId(url){
var u=clean(url);
var patterns=[/youtu\.be\/([^?&/]+)/,/youtube\.com\/watch\?v=([^?&/]+)/,/youtube\.com\/embed\/([^?&/]+)/,/youtube\.com\/shorts\/([^?&/]+)/];
for(var i=0;i<patterns.length;i++){var m=u.match(patterns[i]);if(m)return m[1]}
return "";
}
function youtubeThumb(id){return "https://i.ytimg.com/vi/"+encodeURIComponent(id)+"/maxresdefault.jpg"}
function youtubeFallback(id){return "https://i.ytimg.com/vi/"+encodeURIComponent(id)+"/hqdefault.jpg"}
function imageTag(url,alt,cls,size){
var src=driveImage(url,size);
if(!src)return '<div class="image-fallback">'+esc((alt||"K").slice(0,1))+'</div>';
return '<img class="'+esc(cls||"")+'" src="'+esc(src)+'" alt="'+esc(alt||"")+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">';
}
function statusInfo(value){
var v=clean(value).toLowerCase();
if(["open","opened","가능","오픈","available"].indexOf(v)>-1)return {key:"open",label:"OPEN"};
if(["closed","close","clesed","마감","닫힘","full"].indexOf(v)>-1)return {key:"closed",label:"CLOSED"};
if(["reserve","reserved","예약","예약중"].indexOf(v)>-1)return {key:"reserve",label:"RESERVE"};
if(["ready","준비중","대기"].indexOf(v)>-1)return {key:"ready",label:"READY"};
return {key:"ready",label:value||"-"};
}
function empty(message){return '<div class="empty-state">'+esc(message)+'</div>'}
function detailRatio(category){
var c=clean(category);
if(c.indexOf("몸")>-1)return "detail-ratio-12";
return "detail-ratio-43";
}
function isLargeShowcaseCategory(category){
var c=clean(category).toLowerCase();
return c.indexOf("ld")>-1||c.indexOf("월페이퍼")>-1||c.indexOf("wallpaper")>-1;
}
function renderShowcaseCard(row,category,large,index){
var id=youtubeId(row.url);
var title=row.title||category||"쇼케이스";
var media=id?'<button type="button" class="video-open" data-video-id="'+esc(id)+'" data-video-title="'+esc(title)+'"><img src="'+esc(youtubeThumb(id))+'" data-fallback-src="'+esc(youtubeFallback(id))+'" alt="'+esc(title)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="video-play" aria-hidden="true"></span></button>':'<div class="video-open"><div class="image-fallback">▶</div></div>';
return '<article class="video-card'+(large?' video-card-large':'')+'" data-slide-index="'+index+'">'+media+'<div class="video-info"><strong>'+esc(title)+'</strong></div></article>';
}
function renderProfile(){
var row=state.profile[0];
if(!row){els.profile.innerHTML=empty("등록된 작가 소개가 없습니다.");return}
els.profile.innerHTML='<article class="profile-card"><div class="profile-image">'+imageTag(row.image,row.name,"profile-photo",1800)+'</div><div class="profile-info"><span class="badge">'+esc(row.badge||"Live2D Rigger")+'</span><h3>'+esc(row.name||"")+'</h3><div class="profile-sub">'+esc(row.sub||"")+'</div><p class="profile-desc">'+esc(row.desc||"")+'</p></div></article>';
}
function renderSlots(){
if(!state.slots.length){els.slots.innerHTML=empty("등록된 슬롯 정보가 없습니다.");return}
var html='<div class="slot-grid">'+sortRows(state.slots).map(function(row){
var keys=Object.keys(row).filter(function(key){return key!=="month"&&clean(row[key])!==""});
return '<article class="slot-card"><h3>'+esc(row.month||"")+'월 <span>'+keys.length+' slots</span></h3><div class="slot-list">'+keys.map(function(key,index){var info=statusInfo(row[key]);return '<div class="slot-pill" data-state="'+esc(info.key)+'"><strong>SLOT '+(index+1)+'</strong><span>'+esc(info.label)+'</span></div>'}).join("")+'</div></article>';
}).join("")+'</div>';
els.slots.innerHTML=html;
}
function renderGuide(){
if(!state.guide.length){els.guide.innerHTML=empty("등록된 안내사항이 없습니다.");return}
var groups=groupBy(sortRows(state.guide),"category");
var html='<div class="guide-grid">'+Object.keys(groups).map(function(category,index){
var panelId="guidePanel"+index;
return '<article class="guide-category"><button type="button" class="guide-toggle" aria-expanded="false" aria-controls="'+panelId+'"><span>'+esc(category)+'</span><i aria-hidden="true"></i></button><div class="guide-panel" id="'+panelId+'"><div class="guide-items">'+sortRows(groups[category]).map(function(row){return '<div class="guide-item"><div class="guide-icon">'+esc(row.icon||"•")+'</div><p>'+nl(row.desc||"")+'</p></div>'}).join("")+'</div></div></article>';
}).join("")+'</div>';
els.guide.innerHTML=html;
initGuideAccordions();
}
function renderProcess(){
if(!state.process.length){els.process.innerHTML=empty("등록된 작업 순서가 없습니다.");return}
var html='<div class="process-line">'+sortRows(state.process).map(function(row){return '<article class="process-step"><span class="process-number">'+esc(row.step||row.order||"")+'</span><span class="process-icon">'+esc(row.icon||"•")+'</span><strong>'+esc(row.desc||"")+'</strong></article>'}).join("")+'</div>';
els.process.innerHTML=html;
}
function renderOptions(){
if(!state.options.length){els.options.innerHTML=empty("등록된 리깅 옵션이 없습니다.");return}
var groups=groupBy(sortRows(state.options),"category");
var html=Object.keys(groups).map(function(category){
var rows=sortRows(groups[category]);
var main=rows.filter(function(row){return clean(row.type)==="main"});
var add=rows.filter(function(row){return clean(row.type)!=="main"});
return '<article class="option-category"><h3>'+esc(category)+'<span>'+main.length+' basic · '+add.length+' option</span></h3>'+(main.length?'<div class="option-main-grid">'+main.map(function(row){return '<div class="option-card"><h4>'+esc(row.title||"")+'</h4><p>'+nl(row.desc||"상세 내용은 문의 후 안내됩니다.")+'</p></div>'}).join("")+'</div>':'')+(add.length?'<div class="option-add-grid">'+add.map(function(row){return '<div class="option-add-card"><strong>'+esc(row.title||"")+'</strong>'+(clean(row.desc)?'<p>'+nl(row.desc)+'</p>':'')+'</div>'}).join("")+'</div>':'')+'</article>';
}).join("");
els.options.innerHTML=html;
}
function renderDetails(){
if(!state.details.length){els.details.innerHTML=empty("등록된 리깅 디테일이 없습니다.");return}
var groups=groupBy(sortRows(state.details),"category");
var html=Object.keys(groups).map(function(category){
return '<div class="detail-category '+detailRatio(category)+'"><h3>'+esc(category)+'</h3><div class="detail-grid">'+sortRows(groups[category]).map(function(row){var title=row.title||category;return '<article class="detail-card"><div class="detail-thumb">'+imageTag(row.image,title,"",3000)+'</div><div class="detail-title">'+esc(title)+'</div></article>'}).join("")+'</div></div>';
}).join("");
els.details.innerHTML=html;
}
function renderShowcase(){
if(!state.showcase.length){els.showcase.innerHTML=empty("등록된 쇼케이스가 없습니다.");return}
var groups=groupBy(sortRows(state.showcase),"category");
var html=Object.keys(groups).map(function(category,groupIndex){
var rows=sortRows(groups[category]);
var large=isLargeShowcaseCategory(category);
if(large){
var sliderId="showcaseSlider"+groupIndex;
var controls=rows.length>1?'<div class="showcase-slider-controls"><button type="button" data-showcase-prev="'+sliderId+'" aria-label="이전 쇼케이스">‹</button><div class="showcase-dots">'+rows.map(function(_,index){return '<button type="button" data-showcase-dot="'+sliderId+'" data-slide="'+index+'" aria-label="'+(index+1)+'번째 쇼케이스"></button>'}).join("")+'</div><button type="button" data-showcase-next="'+sliderId+'" aria-label="다음 쇼케이스">›</button></div>':'';
return '<div class="showcase-category showcase-large"><div class="showcase-title-row"><h3>'+esc(category)+'</h3>'+controls+'</div><div class="showcase-slider'+(rows.length>1?' has-multiple':' is-single')+'" id="'+sliderId+'" data-showcase-slider>'+rows.map(function(row,index){return renderShowcaseCard(row,category,true,index)}).join("")+'</div></div>';
}
return '<div class="showcase-category"><h3>'+esc(category)+'</h3><div class="showcase-grid">'+rows.map(function(row,index){return renderShowcaseCard(row,category,false,index)}).join("")+'</div></div>';
}).join("");
els.showcase.innerHTML=html;
}
function renderPartners(){
var rows=sortRows(state.partners).filter(function(row){return clean(row.name)||clean(row.state)==="ready"});
if(!rows.length){els.partners.innerHTML=empty("등록된 협업 작가가 없습니다.");return}
var html='<div class="partner-grid">'+rows.map(function(row){
var stateText=clean(row.state)==="open"?"협업 가능":clean(row.state)==="ready"?"준비중":row.state||"안내";
var name=row.name||"Coming soon";
var inner='<span class="partner-state">'+esc(stateText)+'</span><div class="partner-thumb">'+imageTag(row.thumb,name,"",2200)+'</div><h3>'+esc(name)+'</h3><p>'+nl(row.desc||"준비 중입니다.")+'</p>';
if(row.url)return '<a class="partner-card is-clickable" href="'+esc(row.url)+'" target="_blank" rel="noopener" aria-label="'+esc(name)+' 페이지 보기">'+inner+'</a>';
return '<article class="partner-card">'+inner+'</article>';
}).join("")+'</div>';
els.partners.innerHTML=html;
}
function updateFormChoices(){
var rows=sortRows(state.options);
var main=rows.filter(function(row){return clean(row.type)==="main"});
var add=rows.filter(function(row){return clean(row.type)!=="main"});
if(!main.length){main=[{category:"상담",title:"상담 후 결정",desc:""}]}
var current=getSelectedWorkTypeValue();
els.workTypeChoices.className="work-type-list";
els.workTypeChoices.innerHTML=main.map(function(row,index){
var value=row.title||"상담 후 결정";
var label=row.category?row.category+" · "+value:value;
var checked=current?value===current:index===0;
return '<label class="work-type-card"><input type="radio" name="workType" value="'+esc(value)+'" data-category="'+esc(row.category||"")+'" data-label="'+esc(label)+'"'+(checked?' checked':'')+'><span><strong>'+esc(label)+'</strong></span></label>';
}).join("");
if(!add.length){els.formOptions.className="form-options empty-state";els.formOptions.innerHTML="선택 가능한 추가 옵션이 없습니다.";buildCopyText();return}
els.formOptions.className="form-options";
var groups=groupBy(add,"category");
els.formOptions.innerHTML=Object.keys(groups).map(function(category){return '<div class="form-option-group" data-category="'+esc(category)+'"><strong>'+esc(category)+'</strong><div class="form-checks">'+sortRows(groups[category]).map(function(row){return '<label class="form-check"><input type="checkbox" name="options" value="'+esc(row.title)+'" data-category="'+esc(category)+'"><span><b>'+esc(row.title)+'</b></span></label>'}).join("")+'</div></div>'}).join("");
updateOptionVisibility();
buildCopyText();
}
function getSelectedWorkType(){return els.form.querySelector('input[name="workType"]:checked')}
function getSelectedWorkTypeValue(){var selected=getSelectedWorkType();return selected?clean(selected.value):""}
function updateOptionVisibility(){
var selected=getSelectedWorkType();
var category=selected?selected.dataset.category:"";
els.formOptions.querySelectorAll(".form-option-group").forEach(function(group){
var same=!category||group.dataset.category===category;
group.style.display=same?"grid":"none";
if(!same)group.querySelectorAll("input").forEach(function(input){input.checked=false});
});
}
function selectedOptions(){return Array.prototype.slice.call(els.form.querySelectorAll('input[name="options"]:checked'))}
function formValue(name){var field=els.form.elements[name];return field?clean(field.value):""}
function buildCopyText(){
var selected=getSelectedWorkType();
var workText=selected?clean(selected.dataset.label||selected.value):"";
var options=selectedOptions().map(function(input){return input.value}).join(", ")||"없음";
var text=[
"[Live2D 리깅 신청 양식]",
"방송 닉네임: "+(formValue("nickname")||""),
"방송 플랫폼: "+(formValue("platform")||""),
"작업 종류: "+workText,
"희망 마감일: "+(formValue("deadline")||""),
"예산: "+(formValue("budget")||""),
"포트폴리오 공개 여부: "+(formValue("portfolio")||""),
"일러스트 작가 정보: "+(formValue("artistInfo")||""),
"옵션 선택: "+options,
"추가 요청사항:",
formValue("memo")||""
].join("\n");
els.copyOutput.value=text;
return text;
}
function copyText(){
var text=buildCopyText();
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast("신청 양식을 복사했습니다.")}).catch(fallbackCopy)}else{fallbackCopy()}
function fallbackCopy(){els.copyOutput.style.position="fixed";els.copyOutput.style.left="0";els.copyOutput.style.top="0";els.copyOutput.style.width="1px";els.copyOutput.style.height="1px";els.copyOutput.focus();els.copyOutput.select();try{document.execCommand("copy");toast("신청 양식을 복사했습니다.")}catch(e){toast("복사에 실패했습니다. 내용을 직접 선택해 주세요.")}els.copyOutput.style.position="absolute";els.copyOutput.style.left="-9999px"}
}
function toast(message){
els.toast.textContent=message;
els.toast.classList.add("show");
clearTimeout(toast.timer);
toast.timer=setTimeout(function(){els.toast.classList.remove("show")},1800);
}
function getPageHeight(){
var page=document.querySelector(".page");
if(page){
var rect=page.getBoundingClientRect();
var style=window.getComputedStyle(page);
return Math.ceil(rect.height+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0));
}
var bottom=0;
Array.prototype.slice.call(document.body.children).forEach(function(child){
var rect=child.getBoundingClientRect();
bottom=Math.max(bottom,rect.bottom);
});
return Math.ceil(bottom);
}
function sendHeightDuring(duration){
var start=Date.now();
function tick(){sendHeight();if(Date.now()-start<duration)requestAnimationFrame(tick)}
tick();
}
function setPanelHeight(panel,open){
if(open){
panel.style.height="0px";
panel.offsetHeight;
panel.style.height=panel.scrollHeight+"px";
}else{
if(panel.style.height==="auto")panel.style.height=panel.scrollHeight+"px";
panel.offsetHeight;
panel.style.height="0px";
}
sendHeightDuring(520);
}
function refreshOpenGuidePanels(){
els.guide.querySelectorAll(".guide-category.is-open .guide-panel").forEach(function(panel){
if(panel.style.height!=="auto")panel.style.height=panel.scrollHeight+"px";
});
sendHeight();
}
function initGuideAccordions(){
var contentObserver="ResizeObserver" in window?new ResizeObserver(function(){refreshOpenGuidePanels()}):null;
els.guide.querySelectorAll(".guide-category").forEach(function(category){
var button=category.querySelector(".guide-toggle");
var panel=category.querySelector(".guide-panel");
var items=category.querySelector(".guide-items");
if(!button||!panel)return;
panel.style.height="0px";
if(contentObserver&&items)contentObserver.observe(items);
panel.addEventListener("transitionend",function(event){
if(event.propertyName!=="height")return;
if(category.classList.contains("is-open")){panel.style.height="auto"}else{panel.style.height="0px"}
sendHeight();
});
button.addEventListener("click",function(){
var open=!category.classList.contains("is-open");
if(category.classList.contains("is-open")&&panel.style.height==="auto")panel.style.height=panel.scrollHeight+"px";
category.classList.toggle("is-open",open);
button.setAttribute("aria-expanded",open?"true":"false");
requestAnimationFrame(function(){setPanelHeight(panel,open)});
});
});
}
function getSliderIndex(slider){
var width=slider.clientWidth||1;
return Math.round(slider.scrollLeft/width);
}
function updateShowcaseDots(slider){
var id=slider.id;
var index=getSliderIndex(slider);
document.querySelectorAll('[data-showcase-dot="'+id+'"]').forEach(function(dot,dotIndex){dot.classList.toggle("is-active",dotIndex===index)});
}
function goShowcaseSlide(slider,index){
var slides=slider.querySelectorAll(".video-card");
var next=Math.max(0,Math.min(index,slides.length-1));
slider.scrollTo({left:next*(slider.clientWidth||0),behavior:"smooth"});
setTimeout(function(){updateShowcaseDots(slider)},360);
}
function initShowcaseSliders(){
document.querySelectorAll("[data-showcase-slider]").forEach(function(slider){
updateShowcaseDots(slider);
slider.addEventListener("scroll",function(){clearTimeout(slider._dotTimer);slider._dotTimer=setTimeout(function(){updateShowcaseDots(slider)},80)},{passive:true});
});
document.addEventListener("click",function(event){
var prev=event.target.closest("[data-showcase-prev]");
var next=event.target.closest("[data-showcase-next]");
var dot=event.target.closest("[data-showcase-dot]");
if(prev){var prevSlider=document.getElementById(prev.dataset.showcasePrev);if(prevSlider)goShowcaseSlide(prevSlider,getSliderIndex(prevSlider)-1);return}
if(next){var nextSlider=document.getElementById(next.dataset.showcaseNext);if(nextSlider)goShowcaseSlide(nextSlider,getSliderIndex(nextSlider)+1);return}
if(dot){var dotSlider=document.getElementById(dot.dataset.showcaseDot);if(dotSlider)goShowcaseSlide(dotSlider,Number(dot.dataset.slide)||0)}
});
}
function markAnimatedItems(){
var selectors=[".section-block",".profile-card",".slot-card",".guide-category",".process-step",".progress-grid article",".option-category",".option-card",".option-add-card",".detail-card",".video-card",".partner-card",".request-form > *"];
animatedItems=Array.prototype.slice.call(document.querySelectorAll(selectors.join(",")));
animatedItems.forEach(function(item,index){item.classList.add("reveal-item");item.style.setProperty("--reveal-delay",(index%7*42)+"ms")});
updateScrollAnimations();
}
function updateScrollAnimations(){
if(animationTick)return;
animationTick=true;
requestAnimationFrame(function(){
animationTick=false;
var viewportTop=parentViewport.stickyOffset||0;
var viewportBottom=parentViewport.viewportHeight||window.innerHeight||800;
animatedItems.forEach(function(item){
var rect=item.getBoundingClientRect();
var itemTop=parentViewport.frameTop+rect.top;
var itemBottom=parentViewport.frameTop+rect.bottom;
var visible=itemBottom>viewportTop+40&&itemTop<viewportBottom-40;
item.classList.toggle("is-visible",visible);
});
});
}
function attachImageFallbacks(){
document.querySelectorAll("img").forEach(function(img){
img.addEventListener("error",function(){
if(img.dataset.fallbackSrc&&img.src!==img.dataset.fallbackSrc){img.src=img.dataset.fallbackSrc;return}
var wrap=img.parentNode;
if(!wrap)return;
var fallback=document.createElement("div");
fallback.className="image-fallback";
fallback.textContent=(img.alt||"?").slice(0,1)||"?";
wrap.replaceChild(fallback,img);
sendHeight();
},{once:false});
img.addEventListener("load",sendHeight,{once:true});
});
}
function openVideo(id,title){
if(!id)return;
var src="https://www.youtube.com/embed/"+encodeURIComponent(id)+"?autoplay=1&rel=0&modestbranding=1&playsinline=1&vq=hd1080";
els.modalFrame.innerHTML='<iframe src="'+esc(src)+'" title="'+esc(title||"쇼케이스 영상")+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
els.modalTitle.textContent=title||"쇼케이스";
els.modal.classList.add("is-open");
els.modal.setAttribute("aria-hidden","false");
document.body.classList.add("modal-open");
updateParentViewport(parentViewport);
}
function closeVideo(){
els.modal.classList.remove("is-open");
els.modal.setAttribute("aria-hidden","true");
document.body.classList.remove("modal-open");
els.modalFrame.innerHTML="";
}
function initVideoModal(){
document.addEventListener("click",function(event){
var opener=event.target.closest("[data-video-id]");
if(opener){event.preventDefault();openVideo(opener.dataset.videoId,opener.dataset.videoTitle||"");return}
if(event.target.closest("[data-modal-close]")){event.preventDefault();closeVideo()}
});
document.addEventListener("keydown",function(event){if(event.key==="Escape")closeVideo()});
}
function updateParentViewport(data){
parentViewport.frameTop=Number(data.frameTop)||0;
parentViewport.viewportHeight=Number(data.viewportHeight)||window.innerHeight||800;
parentViewport.stickyOffset=Number(data.stickyOffset)||0;
var root=document.documentElement;
var visibleTop=Math.max(0,-parentViewport.frameTop+parentViewport.stickyOffset);
var modalHeight=Math.max(320,parentViewport.viewportHeight-parentViewport.stickyOffset);
var maxModalTop=Math.max(0,document.body.scrollHeight-modalHeight);
var modalTop=Math.min(visibleTop,maxModalTop);
root.style.setProperty("--parent-visible-top",modalTop+"px");
root.style.setProperty("--parent-viewport-height",modalHeight+"px");
updateScrollAnimations();
}
function initAnchorScroll(){
document.querySelectorAll(".quick-nav a[href^='#']").forEach(function(link){
link.addEventListener("click",function(event){
event.preventDefault();
var target=document.querySelector(link.getAttribute("href"));
if(!target)return;
var offset=Math.max(0,target.offsetTop-16);
window.parent.postMessage({type:"artmugPortfolio:scrollTo",offset:offset},"*");
});
});
}
function sendHeight(){
requestAnimationFrame(function(){
var h=Math.max(300,getPageHeight());
window.parent.postMessage({type:"artmugPortfolio:height",height:h},"*");
});
}
function renderAll(){
renderProfile();
renderSlots();
renderGuide();
renderProcess();
renderOptions();
renderDetails();
renderShowcase();
renderPartners();
updateFormChoices();
attachImageFallbacks();
initShowcaseSliders();
initAnchorScroll();
markAnimatedItems();
sendHeight();
window.parent.postMessage({type:"artmugPortfolio:requestViewport"},"*");
}
function initForm(){
els.form.addEventListener("input",function(){buildCopyText()});
els.form.addEventListener("change",function(event){if(event.target&&event.target.name==="workType")updateOptionVisibility();buildCopyText();sendHeight()});
els.form.addEventListener("reset",function(){setTimeout(function(){updateOptionVisibility();buildCopyText();sendHeight()},0)});
els.copyButton.addEventListener("click",copyText);
}
function initResize(){
window.addEventListener("resize",function(){sendHeight();updateParentViewport(parentViewport)});
window.addEventListener("scroll",updateScrollAnimations,{passive:true});
window.addEventListener("load",function(){sendHeight();window.parent.postMessage({type:"artmugPortfolio:requestViewport"},"*")});
window.addEventListener("message",function(event){var data=event.data||{};if(data.type==="artmugPortfolio:requestHeight")sendHeight();if(data.type==="artmugPortfolio:viewport")updateParentViewport(data)});
if("ResizeObserver" in window){new ResizeObserver(function(){sendHeight();updateParentViewport(parentViewport)}).observe(document.body)}
new MutationObserver(sendHeight).observe(document.body,{childList:true,subtree:true,attributes:true,characterData:true});
setInterval(sendHeight,1500);
}
function init(){
initForm();
initResize();
initVideoModal();
Promise.all(Object.keys(SHEETS).map(function(key){return fetchCSV(key).then(function(rows){state[key]=rows})})).then(renderAll);
}
init();
})();
