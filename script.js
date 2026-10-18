// Portal demonstrativo — SISTID · Formação
// Dados fictícios para apresentação acadêmica; não há backend nem persistência.
const courses = [
  {id:1,name:"Agricultura Sustentável e Saberes do Território",area:"Agricultura",status:"andamento",statusText:"Em andamento",cover:"red",description:"Práticas sustentáveis, cultivo e valorização dos conhecimentos locais.",participants:18,capacity:25,location:"Comunidade do território",date:"12 ago. – 30 nov. 2026",label:"FORMAÇÃO · EDIÇÃO 01"},
  {id:2,name:"Inclusão Digital para a Comunidade",area:"Tecnologia",status:"andamento",statusText:"Em andamento",cover:"gold",description:"Noções de tecnologia e uso consciente de ferramentas digitais.",participants:24,capacity:30,location:"Polo de formação",date:"05 set. – 18 dez. 2026",label:"TECNOLOGIA · EDIÇÃO 02"},
  {id:3,name:"Introdução à Gestão Comunitária",area:"Organização comunitária",status:"analise",statusText:"Em análise",cover:"cream",description:"Proposta enviada à coordenação para análise e decisão.",participants:0,capacity:20,location:"A definir",date:"Aguardando aprovação",label:"NOVA PROPOSTA"}
];
const participants = [
  {id:1,name:"Ana Cláudia Ferreira",initials:"AF",course:1,status:"Ativo",attendance:92,concept:"E",delivered:4,color:"peach"},
  {id:2,name:"João Batista da Silva",initials:"JS",course:2,status:"Ativo",attendance:76,concept:"B",delivered:3,color:"yellow"},
  {id:3,name:"Maria de Nazaré Costa",initials:"MC",course:1,status:"Ativo",attendance:88,concept:"B",delivered:4,color:"blue"},
  {id:4,name:"Raimundo Pereira",initials:"RP",course:2,status:"Ativo",attendance:58,concept:"—",delivered:2,color:"green"},
  {id:5,name:"Francisca Gomes",initials:"FG",course:1,status:"Ativo",attendance:100,concept:"S",delivered:5,color:"peach"},
  {id:6,name:"Pedro Henrique Souza",initials:"PH",course:2,status:"Removido",attendance:42,concept:"R",delivered:1,color:"blue"}
];
const materials = [
  {course:1,folder:"Aula 01 · Preparação do solo",access:"Leitura e edição",deadline:"30 nov. 2026",files:["Guia de preparação do solo.pdf","Atividade de observação.docx"]},
  {course:1,folder:"Aula 02 · Cultivo sustentável",access:"Somente leitura",deadline:"Prazo encerrado",files:["Caderno de práticas.pdf"]},
  {course:2,folder:"Aula 01 · Primeiros passos digitais",access:"Leitura e edição",deadline:"18 dez. 2026",files:["Material introdutório.pdf","Atividade prática.docx"]},
  {course:2,folder:"Atividade · Segurança na internet",access:"Envio de atividade",deadline:"25 out. 2026",files:["Instruções da atividade.pdf"]}
];
const requests = [
  {id:1,title:"Solicitação de esclarecimento",course:1,from:"Coordenação",date:"15 out. 2026",status:"Pendente",body:"A coordenação solicita esclarecimentos sobre os registros de frequência da última aula."},
  {id:2,title:"Conferência de frequência",course:2,from:"Coordenação",date:"16 out. 2026",status:"Pendente",body:"Favor conferir os registros de frequência da edição e registrar justificativas quando houver."}
];
let activeView="dashboard", activeFilter="todos", courseSearchTerm="", participantFilter="todos", toastTimer;
const pageContent=document.getElementById("pageContent");
const initialDashboard=pageContent.innerHTML;

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3400);}
function courseName(id){return courses.find(c=>c.id===Number(id))?.name||"Curso não identificado";}
function shortCourse(id){const c=courses.find(c=>c.id===Number(id));return c?c.name.replace(" e Saberes do Território","").replace(" para a Comunidade",""):"—";}
function setNav(view){
  document.querySelectorAll(".nav-subitem[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const item=document.querySelector(`.nav-subitem[data-view="${view}"]`);
  document.getElementById("crumb").textContent=view==="course-detail"?"Detalhes do curso":(item?item.textContent.trim().replace(/\s+\d+$/,""):"Visão geral");
  if(window.innerWidth<=800)document.getElementById("sidebar").classList.remove("open");
}
function header(eyebrow,title,desc,action=""){
 return `<div class="welcome-row"><div><p class="eyebrow"><span class="eyebrow-line"></span>${eyebrow}</p><h1>${title}<span class="hello-dot">.</span></h1><p class="subheading">${desc}</p></div>${action}</div>`;
}
function panelHeading(eyebrow,title,extra=""){return `<div class="panel-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div>${extra}</div>`;}
function courseCard(c){
 const ratio=c.capacity?Math.min(100,c.participants/c.capacity*100):0;
 const sc=c.status==="andamento"?"live":c.status==="analise"?"review":"closed";
 return `<article class="course-card"><div class="course-cover ${c.cover}"><div class="cover-pattern"></div><span class="cover-label">${esc(c.label)}</span></div><div class="course-body"><div class="course-meta"><span class="course-area">${esc(c.area)}</span><span class="status ${sc}">${esc(c.statusText)}</span></div><h3>${esc(c.name)}</h3><p class="course-description">${esc(c.description)}</p><div class="course-details"><div><div class="detail-label">Participantes</div><div class="detail-value">${c.participants} <span style="font-weight:400;color:#a08e84">/ ${c.capacity}</span></div><div class="capacity-track"><span style="width:${ratio}%"></span></div></div><div><div class="detail-label">Local</div><div class="detail-value">${esc(c.location)}</div></div></div><div class="course-footer"><span class="course-date">${esc(c.date)}</span><button class="course-open" data-course="${c.id}">Acessar curso <span>→</span></button></div></div></article>`;
}
function renderDashboard(){
 pageContent.innerHTML=initialDashboard;
 bindDashboard();
}
function bindDashboard(){
 const grid=document.getElementById("coursesGrid"), recent=document.getElementById("recentParticipants"), search=document.getElementById("courseSearch");
 if(grid) grid.classList.add("dashboard-courses-grid");
 function render(){
  const term=search.value.trim().toLocaleLowerCase("pt-BR");
  const filtered=courses.filter(c=>(activeFilter==="todos"||c.status===activeFilter)&&`${c.name} ${c.area} ${c.description}`.toLocaleLowerCase("pt-BR").includes(term));
  grid.innerHTML=filtered.length?filtered.map(courseCard).join(""):'<div class="empty-state">Nenhum curso encontrado com esses filtros.</div>';
 }
 function renderRecent(){recent.innerHTML=participants.filter(p=>p.status==="Ativo").slice(0,4).map(p=>`<div class="participant-row"><div class="participant-avatar">${p.initials}</div><div class="participant-info"><strong>${esc(p.name)}</strong><small>${esc(shortCourse(p.course))}</small></div><span class="participant-state">${p.status}</span></div>`).join("");}
 document.querySelectorAll(".filter-tab").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;document.querySelectorAll(".filter-tab").forEach(x=>x.classList.toggle("selected",x===b));render();}));
 search.addEventListener("input",render);
 grid.addEventListener("click",e=>{const b=e.target.closest("[data-course]");if(b)openCourse(Number(b.dataset.course));});
 document.getElementById("newCourseBtn").addEventListener("click",openModal);
 document.getElementById("allCoursesBtn").addEventListener("click",()=>navigate("courses"));
 document.getElementById("viewParticipants").addEventListener("click",()=>navigate("participants"));
 document.getElementById("dismissNotice").addEventListener("click",()=>document.querySelector(".notice-bar")?.remove());
 render();renderRecent();
}
function renderCoursesPage(){
 return header("GESTÃO PEDAGÓGICA","Meus cursos","Gerencie suas propostas e acompanhe as edições sob sua responsabilidade.",'<button class="primary-button" id="newCourseBtn"><span>＋</span> Propor novo curso</button>')+
 `<div class="notice-bar"><div class="notice-symbol">i</div><div><strong>A aprovação vem antes da ativação</strong><p>Uma proposta em análise não pode ser ativada até a decisão da coordenação.</p></div></div>
 <div class="filter-row"><div class="search-wrap"><span>⌕</span><input type="search" id="courseSearch" placeholder="Buscar curso..." aria-label="Buscar curso" value="${esc(courseSearchTerm)}"></div><div class="filter-tabs"><button class="filter-tab ${activeFilter==="todos"?"selected":""}" data-filter="todos">Todos</button><button class="filter-tab ${activeFilter==="andamento"?"selected":""}" data-filter="andamento">Em andamento</button><button class="filter-tab ${activeFilter==="analise"?"selected":""}" data-filter="analise">Em análise</button></div></div>
 <div class="courses-grid" id="coursesGrid"></div>
 <div class="panel">${panelHeading("REGRAS DO MÓDULO","Sobre as edições")}<p class="section-description">Cada edição mantém seus próprios participantes, materiais, frequências, avaliações e resultados. O encerramento oficial é responsabilidade da coordenação.</p></div>`;
}
function renderParticipantsPage(){
 const filtered=participants.filter(p=>participantFilter==="todos"||p.status.toLowerCase()===participantFilter);
 return header("GESTÃO DA TURMA","Participantes","Consulte a situação de cada pessoa e preserve o histórico individual.")+
 `<div class="stats-grid"><article class="stat-card"><div class="stat-top">Participantes ativos</div><div class="stat-number">${participants.filter(p=>p.status==="Ativo").length}</div><div class="stat-foot">Nas edições demonstrativas</div></article><article class="stat-card"><div class="stat-top">Registros removidos</div><div class="stat-number">${participants.filter(p=>p.status==="Removido").length}</div><div class="stat-foot">Histórico preservado</div></article><article class="stat-card"><div class="stat-top">Cursos com turma</div><div class="stat-number">${courses.filter(c=>c.participants>0).length}</div><div class="stat-foot">Edições em andamento</div></article><article class="stat-card"><div class="stat-top">Capacidade total prevista</div><div class="stat-number">${courses.filter(c=>c.participants>0).reduce((n,c)=>n+c.capacity,0)}</div><div class="stat-foot">Somente cursos com participantes</div></article></div>
 <section class="panel">${panelHeading("REGISTRO DE PARTICIPANTES","Lista da turma",'<button class="primary-button" id="addParticipant"><span>＋</span> Registrar participante</button>')}
 <div class="filter-row"><div class="search-wrap"><span>⌕</span><input id="participantSearch" type="search" placeholder="Buscar por nome ou curso..."></div><div class="filter-tabs"><button class="filter-tab ${participantFilter==="todos"?"selected":""}" data-pfilter="todos">Todos</button><button class="filter-tab ${participantFilter==="ativo"?"selected":""}" data-pfilter="ativo">Ativos</button><button class="filter-tab ${participantFilter==="removido"?"selected":""}" data-pfilter="removido">Removidos</button></div></div>
 <div class="table-wrap"><table class="data-table" id="participantsTable"><thead><tr><th>Participante</th><th>Curso / edição</th><th>Situação</th><th>Frequência</th><th>Conceito</th><th>Ação</th></tr></thead><tbody>${filtered.map(p=>participantRow(p)).join("")}</tbody></table></div><p class="table-note">Dados fictícios. Remover uma pessoa da edição não apaga os registros históricos de frequência, atividades e resultados.</p></section>`;
}
function participantRow(p){return `<tr><td><div class="table-person"><span class="participant-avatar">${p.initials}</span><strong>${esc(p.name)}</strong></div></td><td>${esc(shortCourse(p.course))}</td><td><span class="status ${p.status==="Ativo"?"live":"closed"}">${p.status}</span></td><td>${p.attendance}%</td><td><span class="concept">${esc(p.concept)}</span></td><td><button class="table-action" data-person="${p.id}">Detalhes</button></td></tr>`;}
function renderMaterialsPage(){
 return header("ORGANIZAÇÃO PEDAGÓGICA","Materiais e atividades","Organize conteúdos em pastas, controle permissões e acompanhe os prazos.")+
 `<div class="notice-bar"><div class="notice-symbol">i</div><div><strong>Pastas e prazos</strong><p>O protótipo ilustra a organização prevista. Uploads reais, permissões e bloqueios automáticos exigem backend.</p></div></div>
 <div class="section-heading"><div><p class="eyebrow">REPOSITÓRIO DA FORMAÇÃO</p><h2>Pastas dos cursos</h2><p class="section-description">Materiais e atividades organizados por edição.</p></div><button class="primary-button" id="newFolder"><span>＋</span> Nova pasta</button></div>
 <div class="material-list">${materials.map((m,i)=>`<article class="material-card"><div class="folder-icon">${m.access==="Somente leitura"?"▣":"▤"}</div><div class="material-main"><h3>${esc(m.folder)}</h3><p>${esc(courseName(m.course))}</p><div class="file-list">${m.files.map(f=>`<span class="file-pill">▧ ${esc(f)}</span>`).join("")}</div></div><div class="material-meta"><span class="access-pill ${m.access==="Somente leitura"?"read-only":""}">${esc(m.access)}</span><small>Prazo: ${esc(m.deadline)}</small></div><button class="course-open material-action" data-folder="${i}">Abrir pasta →</button></article>`).join("")}</div>
 <section class="panel" style="margin-top:20px">${panelHeading("REGRAS DE ACESSO","Como funciona")}<div class="rule-grid"><div><strong>Somente leitura</strong><p>Participantes consultam os arquivos sem editar o conteúdo.</p></div><div><strong>Leitura e edição</strong><p>Permite colaboração conforme as regras definidas para a pasta.</p></div><div><strong>Prazo encerrado</strong><p>Novos envios e edições ficam bloqueados; os arquivos existentes são preservados.</p></div></div></section>`;
}
function renderAttendancePage(){
 return header("ACOMPANHAMENTO PEDAGÓGICO","Frequência e avaliação","Registre presenças, justificativas e conceitos finais dos participantes.")+
 `<div class="notice-bar"><div class="notice-symbol">i</div><div><strong>O sistema apoia; o professor avalia</strong><p>Indicadores ajudam no acompanhamento, mas o sistema não decide automaticamente aprovação ou reprovação.</p></div></div>
 <div class="stats-grid"><article class="stat-card"><div class="stat-top">Aulas registradas</div><div class="stat-number">12</div><div class="stat-foot">Dados demonstrativos</div></article><article class="stat-card"><div class="stat-top">Frequência média</div><div class="stat-number">83%</div><div class="stat-foot">Participantes ativos</div></article><article class="stat-card"><div class="stat-top">Justificativas a conferir</div><div class="stat-number">03</div><div class="stat-foot">Exigem análise do professor</div></article><article class="stat-card"><div class="stat-top">Conceitos pendentes</div><div class="stat-number">02</div><div class="stat-foot">Ainda não registrados</div></article></div>
 <section class="panel">${panelHeading("REGISTROS DA TURMA","Frequência e conceitos",'<button class="primary-button" id="recordClass"><span>＋</span> Registrar aula</button>')}<div class="table-wrap"><table class="data-table"><thead><tr><th>Participante</th><th>Curso</th><th>Frequência</th><th>Atividades entregues</th><th>Conceito final</th><th>Registro</th></tr></thead><tbody>${participants.map(p=>`<tr><td><div class="table-person"><span class="participant-avatar">${p.initials}</span><strong>${esc(p.name)}</strong></div></td><td>${esc(shortCourse(p.course))}</td><td><div class="frequency-cell"><strong>${p.attendance}%</strong><div class="capacity-track"><span style="width:${p.attendance}%;background:${p.attendance<60?"#123b2e":"#5c9a6f"}"></span></div></div></td><td>${p.delivered}</td><td><span class="concept">${esc(p.concept)}</span></td><td><button class="table-action" data-evaluate="${p.id}">Editar registro</button></td></tr>`).join("")}</tbody></table></div><div class="concept-legend"><strong>Conceitos:</strong> I — Insuficiente · R — Regular · B — Bom · E — Excelente · S — Sem presença, sem atividade e sem nota.</div></section>`;
}
function renderReportsPage(){
 return header("INDICADORES E RESULTADOS","Relatórios","Consulte uma visão consolidada e prepare o acompanhamento das formações.")+
 `<div class="stats-grid"><article class="stat-card"><div class="stat-top">Edições registradas</div><div class="stat-number">${courses.length}</div><div class="stat-foot">Inclui proposta em análise</div></article><article class="stat-card"><div class="stat-top">Participantes ativos</div><div class="stat-number">${participants.filter(p=>p.status==="Ativo").length}</div><div class="stat-foot">Registros demonstrativos</div></article><article class="stat-card"><div class="stat-top">Atividades registradas</div><div class="stat-number">${participants.reduce((n,p)=>n+p.delivered,0)}</div><div class="stat-foot">Entregas ilustrativas</div></article><article class="stat-card"><div class="stat-top">Atenção à frequência</div><div class="stat-number">${participants.filter(p=>p.status==="Ativo"&&p.attendance<60).length}</div><div class="stat-foot">Sinalização para análise humana</div></article></div>
 <div class="report-grid"><section class="panel">${panelHeading("VISÃO GERAL","Participantes por curso")}<div class="bar-chart">${courses.filter(c=>c.participants>0).map(c=>`<div class="bar-row"><div class="bar-label">${esc(shortCourse(c.id))}<strong>${c.participants}</strong></div><div class="bar-track"><span style="width:${Math.min(100,c.participants/30*100)}%"></span></div></div>`).join("")}</div><p class="table-note">Gráfico ilustrativo com os números fictícios cadastrados nesta simulação.</p></section><section class="panel">${panelHeading("ENCERRAMENTO","Relatório da edição")}<p class="section-description">O relatório de encerramento deve reunir indicadores quantitativos e informações individuais, preservando o histórico.</p><label class="form-label" for="reportCourse">Curso / edição</label><select id="reportCourse" class="field-select">${courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select><button class="primary-button full-button" id="generateReport">Gerar prévia do relatório <span>→</span></button><div id="reportPreview" class="report-preview">Selecione uma edição e gere uma prévia demonstrativa.</div></section></div>`;
}
function renderMessagesPage(){
 return header("COMUNICAÇÃO COM A COORDENAÇÃO","Solicitações","Acompanhe pedidos de esclarecimento e mantenha o histórico das respostas.")+
 `<div class="notice-bar"><div class="notice-symbol">i</div><div><strong>Comunicação rastreável</strong><p>Solicitações, respostas e pedidos de reunião devem permanecer associados ao curso correspondente.</p></div></div>
 <div class="message-list">${requests.map(r=>`<article class="message-card"><div class="message-symbol">✉</div><div class="message-content"><div class="message-meta"><span>${esc(r.from)} · ${esc(r.date)}</span><span class="status review">${esc(r.status)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p><div class="message-course">Curso: ${esc(courseName(r.course))}</div><div class="message-actions"><button class="secondary-button" data-reply="${r.id}">Responder</button><button class="subtle-link" data-meeting="${r.id}">Solicitar reunião presencial</button></div></div></article>`).join("")}</div>`;
}
function renderHistoryPage(){
 return header("MEMÓRIA INSTITUCIONAL","Histórico de cursos","Consulte edições anteriores sem substituir ou apagar seus registros.")+
 `<div class="notice-bar"><div class="notice-symbol">i</div><div><strong>Histórico preservado</strong><p>Após o encerramento definitivo, os materiais e registros ficam disponíveis para consulta. Alterações excepcionais exigem autorização.</p></div></div>
 <section class="panel">${panelHeading("EDIÇÕES E PROPOSTAS","Registro histórico")}<div class="table-wrap"><table class="data-table"><thead><tr><th>Curso / edição</th><th>Período</th><th>Participantes</th><th>Situação</th><th>Consulta</th></tr></thead><tbody>${courses.map(c=>`<tr><td><strong>${esc(c.name)}</strong><div class="table-sub">Edição demonstrativa ${String(c.id).padStart(2,"0")}</div></td><td>${esc(c.date)}</td><td>${c.participants}</td><td><span class="status ${c.status==="andamento"?"live":"review"}">${esc(c.statusText)}</span></td><td><button class="table-action" data-history="${c.id}">Ver registros</button></td></tr>`).join("")}<tr><td><strong>Oficina de práticas comunitárias</strong><div class="table-sub">Edição anterior fictícia</div></td><td>Mar. – abr. 2026</td><td>16</td><td><span class="status closed">Encerrado</span></td><td><button class="table-action" data-history="old">Consultar</button></td></tr></tbody></table></div></section>`;
}
function renderDetailPage(id){
 const c=courses.find(x=>x.id===id);if(!c){navigate("courses");return;}
 return header("GESTÃO DO CURSO",c.name,"Resumo da edição e atalhos para as atividades pedagógicas.",'<button class="secondary-button" id="backCourses">← Voltar aos cursos</button>')+
 `<div class="detail-hero ${c.cover}"><div class="cover-pattern"></div><div class="detail-hero-content"><span class="status ${c.status==="andamento"?"live":"review"}">${esc(c.statusText)}</span><p>${esc(c.area)} · Edição ${String(c.id).padStart(2,"0")}</p><h2>${esc(c.name)}</h2><span>${esc(c.description)}</span></div></div>
 <div class="stats-grid"><article class="stat-card"><div class="stat-top">Participantes</div><div class="stat-number">${c.participants}</div><div class="stat-foot">Capacidade: ${c.capacity}</div></article><article class="stat-card"><div class="stat-top">Materiais / pastas</div><div class="stat-number">${materials.filter(m=>m.course===c.id).length}</div><div class="stat-foot">Itens demonstrativos</div></article><article class="stat-card"><div class="stat-top">Local</div><div class="stat-number" style="font-size:18px;letter-spacing:0">${esc(c.location)}</div><div class="stat-foot">Local da formação</div></article><article class="stat-card"><div class="stat-top">Período</div><div class="stat-number" style="font-size:16px;letter-spacing:0">${esc(c.date)}</div><div class="stat-foot">Datas ilustrativas</div></article></div>
 <div class="quick-actions"><button class="quick-action" data-jump="participants"><span>♙</span><strong>Participantes</strong><small>Consultar a turma</small></button><button class="quick-action" data-jump="materials"><span>▧</span><strong>Materiais e atividades</strong><small>Pastas e prazos</small></button><button class="quick-action" data-jump="attendance"><span>✓</span><strong>Frequência e avaliação</strong><small>Presenças e conceitos</small></button><button class="quick-action" data-jump="reports"><span>▥</span><strong>Relatórios</strong><small>Indicadores da edição</small></button></div>
 <section class="panel" style="margin-top:20px">${panelHeading("REGRAS DA EDIÇÃO","Atenção às responsabilidades")}<p class="section-description">${c.status==="analise"?"Esta proposta ainda depende da aprovação da coordenação. Não pode ser ativada antes da aprovação.":"A coordenação é responsável pelo encerramento oficial. Após o fechamento, alterações comuns ficam bloqueadas; correções excepcionais precisam de autorização."}</p></section>`;
}
function navigate(view, extra={}){
 activeView=view;setNav(view);
 if(view==="dashboard"){renderDashboard();return;}
 if(view==="courses")pageContent.innerHTML=renderCoursesPage();
 else if(view==="participants")pageContent.innerHTML=renderParticipantsPage();
 else if(view==="materials")pageContent.innerHTML=renderMaterialsPage();
 else if(view==="attendance")pageContent.innerHTML=renderAttendancePage();
 else if(view==="reports")pageContent.innerHTML=renderReportsPage();
 else if(view==="messages")pageContent.innerHTML=renderMessagesPage();
 else if(view==="history")pageContent.innerHTML=renderHistoryPage();
 else if(view==="course-detail")pageContent.innerHTML=renderDetailPage(extra.id);
 pageContent.scrollIntoView({behavior:"smooth",block:"start"});
 bindView(view);
}
function bindView(view){
 if(view==="courses"){
  document.getElementById("newCourseBtn").addEventListener("click",openModal);
  const grid=document.getElementById("coursesGrid"),search=document.getElementById("courseSearch");
  function draw(){courseSearchTerm=search.value;const t=courseSearchTerm.toLocaleLowerCase("pt-BR");const list=courses.filter(c=>(activeFilter==="todos"||c.status===activeFilter)&&`${c.name} ${c.area}`.toLocaleLowerCase("pt-BR").includes(t));grid.innerHTML=list.length?list.map(courseCard).join(""):'<div class="empty-state">Nenhum curso encontrado.</div>';}
  document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));draw();}));
  search.addEventListener("input",draw);grid.addEventListener("click",e=>{const b=e.target.closest("[data-course]");if(b)openCourse(Number(b.dataset.course));});draw();
 }
 if(view==="participants"){
  const table=document.querySelector("#participantsTable tbody");
  document.getElementById("participantSearch").addEventListener("input",e=>{const term=e.target.value.toLocaleLowerCase("pt-BR");const list=participants.filter(p=>(participantFilter==="todos"||p.status.toLowerCase()===participantFilter)&&`${p.name} ${shortCourse(p.course)}`.toLocaleLowerCase("pt-BR").includes(term));table.innerHTML=list.map(participantRow).join("");});
  document.querySelectorAll("[data-pfilter]").forEach(b=>b.addEventListener("click",()=>{participantFilter=b.dataset.pfilter;document.querySelectorAll("[data-pfilter]").forEach(x=>x.classList.toggle("selected",x===b));const term=document.getElementById("participantSearch").value.toLocaleLowerCase("pt-BR");table.innerHTML=participants.filter(p=>(participantFilter==="todos"||p.status.toLowerCase()===participantFilter)&&`${p.name} ${shortCourse(p.course)}`.toLocaleLowerCase("pt-BR").includes(term)).map(participantRow).join("");}));
  document.getElementById("addParticipant").addEventListener("click",()=>toast("Simulação: o registro real deve validar a capacidade aprovada da edição."));
  table.addEventListener("click",e=>{const b=e.target.closest("[data-person]");if(b){const p=participants.find(x=>x.id===Number(b.dataset.person));toast(`${p.name} · ${shortCourse(p.course)} · ${p.status}. Histórico preservado na simulação.`);}});
 }
 if(view==="materials"){
  document.querySelectorAll("[data-folder]").forEach(b=>b.addEventListener("click",()=>{const m=materials[Number(b.dataset.folder)];toast(`${m.folder}: ${m.files.length} arquivo(s). A abertura e o upload de arquivos são ilustrativos.`);}));
  document.getElementById("newFolder").addEventListener("click",()=>toast("Simulação: a criação real de pastas precisa salvar permissões, autoria e histórico de alterações."));
 }
 if(view==="attendance"){
  document.getElementById("recordClass").addEventListener("click",()=>toast("Simulação: registro de aula. A implementação completa deve guardar presenças, ausências e histórico de correções."));
  document.querySelectorAll("[data-evaluate]").forEach(b=>b.addEventListener("click",()=>{const p=participants.find(x=>x.id===Number(b.dataset.evaluate));toast(`Registro de ${p.name}: conceito atual ${p.concept}. A edição real requer formulário e persistência.`);}));
 }
 if(view==="reports"){
  document.getElementById("generateReport").addEventListener("click",()=>{const id=Number(document.getElementById("reportCourse").value),c=courses.find(x=>x.id===id);document.getElementById("reportPreview").innerHTML=`<strong>Prévia demonstrativa</strong><br>Curso: ${esc(c.name)}<br>Situação: ${esc(c.statusText)}<br>Participantes cadastrados: ${c.participants}<br>Capacidade: ${c.capacity}<br><small>Este resumo não é um relatório oficial nem substitui os registros individuais.</small>`;});
 }
 if(view==="messages"){
  document.querySelectorAll("[data-reply]").forEach(b=>b.addEventListener("click",()=>{const r=requests.find(x=>x.id===Number(b.dataset.reply));toast(`Simulação de resposta para “${r.title}”. A conversa real deve manter o histórico de mensagens.`);}));
  document.querySelectorAll("[data-meeting]").forEach(b=>b.addEventListener("click",()=>toast("Simulação: solicitação de reunião presencial registrada apenas visualmente.")));
 }
 if(view==="history")document.querySelectorAll("[data-history]").forEach(b=>b.addEventListener("click",()=>toast("Consulta demonstrativa: os registros históricos devem permanecer disponíveis sem edição comum.")));
 if(view==="course-detail"){
  document.getElementById("backCourses").addEventListener("click",()=>navigate("courses"));
  document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.jump)));
 }
}
function openCourse(id){navigate("course-detail",{id});}
function openModal(){document.getElementById("modalBackdrop").classList.add("open");document.getElementById("courseName").focus();}
function closeModal(){document.getElementById("modalBackdrop").classList.remove("open");}
document.querySelectorAll(".nav-subitem[data-view]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.view)));
document.querySelectorAll(".nav-parent[data-submenu]").forEach(btn=>btn.addEventListener("click",()=>{
 const id=btn.dataset.submenu, menu=document.getElementById(`submenu-${id}`);
 if(!menu)return;
 const open=btn.getAttribute("aria-expanded")==="true";
 btn.setAttribute("aria-expanded",String(!open));btn.classList.toggle("is-open",!open);menu.hidden=open;menu.classList.toggle("is-open",!open);
}));
document.querySelectorAll(".nav-parent:not([data-submenu])").forEach(btn=>btn.addEventListener("click",()=>toast("Esta área do SISTID ainda não está habilitada nesta versão.")));
document.querySelectorAll(".nav-subitem:not([data-view])").forEach(btn=>btn.addEventListener("click",()=>toast("Esta página ainda não está habilitada nesta versão.")));
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("sidebar").classList.add("open"));
document.getElementById("closeSidebar").addEventListener("click",()=>document.getElementById("sidebar").classList.remove("open"));
document.getElementById("notificationBtn").addEventListener("click",()=>navigate("messages"));
document.getElementById("modalClose").addEventListener("click",closeModal);
document.getElementById("cancelModal").addEventListener("click",closeModal);
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
document.getElementById("courseForm").addEventListener("submit",e=>{
 e.preventDefault();const f=new FormData(e.currentTarget),name=String(f.get("courseName")).trim();if(!name)return;
 const cap=Math.max(1,Number(f.get("courseCapacity"))||20);
 courses.unshift({id:Math.max(...courses.map(c=>c.id))+1,name,area:String(f.get("courseArea")),status:"analise",statusText:"Em análise",cover:"cream",description:String(f.get("courseReason")).trim()||"Proposta cadastrada e aguardando análise da coordenação.",participants:0,capacity:cap,location:String(f.get("courseLocation")).trim()||"A definir",date:"Aguardando aprovação",label:"NOVA PROPOSTA"});
 closeModal();e.currentTarget.reset();activeFilter="todos";navigate("courses");toast("Proposta adicionada à simulação como “Em análise”. A ativação depende da aprovação da coordenação.");
});
function addGlobalStyle(){
 const style=document.createElement("style");
 style.textContent=`
 .table-wrap{width:100%;overflow-x:auto}.data-table{width:100%;border-collapse:collapse;min-width:720px;text-align:left}.data-table th{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:#9c887d;background:#fff8f1;padding:13px 12px;border-bottom:1px solid #e0e7e4}.data-table td{font-size:10px;color:#725e53;padding:13px 12px;border-bottom:1px solid #f1e8e0}.data-table tr:last-child td{border-bottom:0}.table-person{display:flex;align-items:center;gap:9px;min-width:190px}.table-person strong{font-size:10px;color:#57433a}.table-action{background:#fff8f1;border:1px solid #ead8cb;border-radius:4px;color:#123b2e;font-size:10px;font-weight:700;padding:7px 9px;white-space:nowrap}.table-sub{font-size:9px;color:#a18f84;margin-top:4px}.table-note{font-size:10px;line-height:1.6;color:#9b887c;margin:14px 0 0}.concept{display:inline-grid;place-items:center;min-width:25px;height:25px;border-radius:5px;background:#e2eee8;color:#123b2e;font-weight:800}.material-list,.message-list{display:flex;flex-direction:column;gap:12px}.material-card{display:flex;align-items:center;gap:15px;background:#ffffff;border:1px solid #e0e7e4;border-radius:7px;padding:16px;box-shadow:0 8px 28px rgba(89,47,34,.035)}.folder-icon{width:44px;height:44px;display:grid;place-items:center;background:#fff0c6;border-radius:7px;color:#a2751d;font-size:22px;flex-shrink:0}.material-main{flex:1;min-width:0}.material-main h3,.message-content h3{font:700 13px Manrope,sans-serif;margin:0 0 5px;color:#4c3830}.material-main p{font-size:10px;color:#a08c80;margin:0 0 10px}.file-list{display:flex;gap:6px;flex-wrap:wrap}.file-pill{font-size:9px;color:#826d61;background:#f8f0e8;border-radius:3px;padding:5px 7px}.material-meta{display:flex;flex-direction:column;gap:8px;align-items:flex-start;min-width:120px}.material-meta small{font-size:9px;color:#9e8a7e}.access-pill{font-size:9px;background:#e5f2e8;color:#36734c;padding:5px 7px;border-radius:3px}.access-pill.read-only{background:#eee8e4;color:#78675d}.material-action{white-space:nowrap}.rule-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.rule-grid>div{padding:13px;background:#fff8f1;border-radius:5px}.rule-grid strong{font-size:11px;color:#7c392e}.rule-grid p{font-size:10px;color:#978378;line-height:1.5;margin:7px 0 0}.frequency-cell{min-width:75px}.frequency-cell strong{font-size:10px}.frequency-cell .capacity-track{margin-top:6px}.concept-legend{font-size:10px;line-height:1.7;color:#8f7a6e;background:#fff8f1;padding:12px;border-radius:4px;margin-top:15px}.concept-legend strong{color:#6a493d}.report-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.bar-chart{display:flex;flex-direction:column;gap:18px;padding:15px 0}.bar-label{display:flex;justify-content:space-between;gap:10px;font-size:10px;color:#7f6a5f;margin-bottom:7px}.bar-label strong{color:#123b2e}.bar-track{height:9px;border-radius:8px;background:#f3e7dc;overflow:hidden}.bar-track span{height:100%;display:block;background:linear-gradient(90deg,#123b2e,#e4a32b);border-radius:8px}.form-label{display:block;font-size:10px;font-weight:700;color:#755b4e;margin:18px 0 7px}.field-select{width:100%;padding:10px;border:1px solid #ead8cb;background:#ffffff;border-radius:5px;color:#57433a;font-size:11px}.full-button{width:100%;margin-top:12px}.report-preview{font-size:10px;line-height:1.9;color:#826d61;padding:13px;margin-top:14px;background:#fff8f1;border-radius:5px;min-height:68px}.report-preview strong{color:#123b2e}.report-preview small{display:block;color:#a08c80;margin-top:8px}.message-card{display:flex;gap:14px;padding:19px;background:#ffffff;border:1px solid #e0e7e4;border-radius:7px;box-shadow:0 8px 28px rgba(89,47,34,.035)}.message-symbol{width:42px;height:42px;border-radius:7px;background:#e2eee8;color:#123b2e;display:grid;place-items:center;font-size:21px;flex-shrink:0}.message-content{flex:1;min-width:0}.message-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:9px;color:#9c887d;margin-bottom:10px}.message-content h3{font-size:14px}.message-content p{font-size:11px;color:#8e7b70;line-height:1.6;margin:8px 0}.message-course{font-size:10px;color:#123b2e;font-weight:700;margin-top:10px}.message-actions{display:flex;align-items:center;gap:15px;flex-wrap:wrap;margin-top:14px}.message-actions .secondary-button{padding:8px 11px}.detail-hero{position:relative;overflow:hidden;border-radius:8px;min-height:190px;padding:28px;margin-bottom:22px;background:#123b2e;color:white}.detail-hero.gold{background:#e8c34d;color:#6f2824}.detail-hero.cream{background:#dce8e2;color:#7e2927}.detail-hero .cover-pattern{opacity:.35}.detail-hero-content{position:relative;max-width:680px}.detail-hero-content p{font-size:10px;letter-spacing:1px;text-transform:uppercase;margin:12px 0 8px;opacity:.85}.detail-hero-content h2{font:800 25px Manrope,sans-serif;line-height:1.25;max-width:620px;margin:0 0 8px}.detail-hero-content>span:last-child{font-size:11px;opacity:.9}.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.quick-action{border:1px solid #e0e7e4;border-radius:7px;background:#ffffff;padding:17px;text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:8px;box-shadow:0 8px 28px rgba(89,47,34,.035)}.quick-action>span{color:#123b2e;font-size:22px}.quick-action strong{font-size:11px;color:#554139}.quick-action small{font-size:9px;color:#a08c80}.quick-action:hover{border-color:#d7a49a;transform:translateY(-1px)}@media(max-width:1000px){.report-grid{grid-template-columns:1fr}.material-card{flex-wrap:wrap}.material-action{margin-left:auto}.rule-grid{grid-template-columns:1fr}}@media(max-width:700px){.quick-actions{grid-template-columns:1fr 1fr}.material-meta{min-width:0}.material-card{align-items:flex-start}.material-action{margin-left:0}.detail-hero{padding:20px}.detail-hero-content h2{font-size:21px}.message-card{padding:14px}.message-actions{gap:8px}}`;
 document.head.appendChild(style);
}
addGlobalStyle();
renderDashboard();
