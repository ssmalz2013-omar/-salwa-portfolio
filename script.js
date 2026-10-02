
const portfolio = window.PORTFOLIO_DATA || {};
const settings = portfolio.settings || {};

function fontStack(name){
  const map = {
    "Tajawal": '"Tajawal","Tahoma","Arial",sans-serif',
    "Cairo": '"Cairo","Tahoma","Arial",sans-serif',
    "Noto Kufi Arabic": '"Noto Kufi Arabic","Tahoma","Arial",sans-serif',
    "Tahoma": '"Tahoma","Arial",sans-serif',
    "Arial": '"Arial",sans-serif',
    "Georgia": '"Georgia","Tahoma",serif'
  };
  return map[name] || map["Tajawal"];
}
document.documentElement.style.setProperty("--user-font", fontStack(settings.font));
if(settings.accent) document.documentElement.style.setProperty("--rose", settings.accent);
if(settings.dark) document.documentElement.style.setProperty("--mauve", settings.dark);
document.body.style.fontFamily = fontStack(settings.font);
const sizeVars = {
  heroTitleSize:["--hero-title-size",54],
  sectionTitleSize:["--section-title-size",30],
  bodyTextSize:["--body-text-size",15],
  cardTitleSize:["--card-title-size",19],
  cardDescriptionSize:["--card-description-size",12]
};
Object.entries(sizeVars).forEach(([key,[cssVar,def]])=>{
  const n=Number(settings[key]);
  document.documentElement.style.setProperty(cssVar,(Number.isFinite(n)&&n>0?n:def)+"px");
});

const titleEl = document.querySelector(".hero h1");
const teacherEl = document.querySelector(".hero h2");
const specialtyEl = document.querySelector(".specialty");
const taglineEl = document.querySelector(".tagline");
if(titleEl && settings.siteTitle) titleEl.textContent=settings.siteTitle;
if(teacherEl && settings.teacherName) teacherEl.textContent=settings.teacherName;
if(specialtyEl && settings.specialty) specialtyEl.textContent=settings.specialty;
if(taglineEl && settings.tagline) taglineEl.textContent=settings.tagline;
document.title = (settings.siteTitle||"ملف الإنجاز")+" | "+(settings.teacherName||"");

// Rebuild home cards from data
const homeGrid = document.querySelector(".home-grid");
if(homeGrid && Array.isArray(portfolio.homeCards)){
  homeGrid.innerHTML="";
  portfolio.homeCards.filter(x=>x.visible!==false).forEach((card,idx)=>{
    const a=document.createElement("article");
    a.className="visual-card"+(card.id==="professional"?" featured":"");
    a.id=card.id||"";
    a.setAttribute("data-image-label", card.title||"");
    a.innerHTML=`<img alt=""><div class="card-copy"><span class="round-icon">${["◌","▤","✧","◈","✦"][idx%5]}</span><h3></h3><p></p><a>←</a></div>`;
    a.querySelector("img").src=card.image||"";
    a.querySelector("h3").textContent=card.title||"";
    a.querySelector("p").textContent=card.description||"";
    a.querySelector("a").href=card.target||"#";
    homeGrid.appendChild(a);
  });
}

// Criteria
const criteriaBox=document.getElementById("criteria");
if(criteriaBox && Array.isArray(portfolio.criteria)){
  criteriaBox.innerHTML="";
  const icons=["✓","⌂","☏","✧","↗","▤","⌁","◫","◉","▥","◇"];
  portfolio.criteria.filter(x=>x.visible!==false).forEach((item,i)=>{
    const article=document.createElement("article");
    article.className="criterion";
    const attachments = Array.isArray(item.attachments)?item.attachments:[];
    const attHtml = attachments.length
      ? `<div class="attachment-list">${attachments.map((a,j)=>`<a href="${a.url||'#'}" target="_blank" rel="noopener">${a.label||('مرفق '+(j+1))}</a>`).join("")}</div>`
      : `<div class="evidence-placeholder"><b>شواهد هذا البند</b><br>المساحة جاهزة لإضافة الشواهد لاحقًا.</div>`;
    article.innerHTML=`<div class="cicon">${icons[i%icons.length]}</div><h3></h3><p></p>${attHtml}`;
    article.querySelector("h3").textContent=item.title||"";
    article.querySelector("p").textContent=item.description||"";
    criteriaBox.appendChild(article);
  });
}

// Years
const yearGrid=document.querySelector(".year-grid");
if(yearGrid && Array.isArray(portfolio.years)){
  yearGrid.innerHTML="";
  portfolio.years.forEach(y=>{
    const a=document.createElement("article");
    a.innerHTML=`<small>عام دراسي</small><h3></h3><p></p>`;
    a.querySelector("h3").textContent=y.label||"";
    a.querySelector("p").textContent=y.description||"";
    yearGrid.appendChild(a);
  });
  const add=document.createElement("article");
  add.className="add-year";
  add.innerHTML="<small>＋</small><h3>إضافة عام جديد</h3><p>يُضاف من لوحة إدارة الملف.</p>";
  yearGrid.appendChild(add);
}

// Evidence
const data = Array.isArray(window.EVIDENCE_DATA)?window.EVIDENCE_DATA:[];
const grid=document.getElementById('evidenceGrid'), search=document.getElementById('evidenceSearch'),
 yF=document.getElementById('evidenceYearFilter'), cF=document.getElementById('evidenceCategoryFilter');
if(grid){
 [...new Set(data.map(x=>x.academicYear).filter(Boolean))].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;yF.appendChild(o)});
 [...new Set(data.map(x=>x.category).filter(Boolean))].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;cF.appendChild(o)});
 function draw(){
  const q=(search.value||'').toLowerCase(),y=yF.value,c=cF.value;
  const f=data.filter(x=>(!q||`${x.title||''} ${x.description||''}`.toLowerCase().includes(q))&&(!y||x.academicYear===y)&&(!c||x.category===c));
  grid.innerHTML='';
  if(!f.length){grid.innerHTML='<div class="empty-evidence">لم تتم إضافة شواهد بعد.</div>';return}
  f.forEach(x=>{
    const a=document.createElement('article');a.className='evidence-card';
    const files=Array.isArray(x.attachments)?x.attachments:[];
    a.innerHTML=`${x.image?`<img src="${x.image}" alt="">`:''}<div class="evidence-body"><div class="evidence-meta"></div><h3></h3><p></p><div class="attachment-list"></div></div>`;
    a.querySelector('.evidence-meta').textContent=[x.academicYear,x.category,x.date].filter(Boolean).join(' • ');
    a.querySelector('h3').textContent=x.title||'شاهد';
    a.querySelector('p').textContent=x.description||'';
    const box=a.querySelector('.attachment-list');
    if(x.link){files.unshift({label:"فتح الشاهد",url:x.link})}
    files.forEach((file,j)=>{
      const l=document.createElement('a');l.href=file.url||'#';l.target='_blank';l.rel='noopener';l.textContent=file.label||('مرفق '+(j+1));box.appendChild(l)
    });
    grid.appendChild(a)
  });
 }
 [search,yF,cF].forEach(el=>el&&el.addEventListener(el===search?'input':'change',draw));draw();
}

const menu=document.getElementById('menuBtn'), nav=document.getElementById('nav');
if(menu&&nav){menu.addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));}
