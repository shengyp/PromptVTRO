<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { startFreshSession } from './auth-session.js'
import { isDemoMode, demoRole, demoUser } from './demo-api.js'
import PublicPortal from './components/PublicPortal.vue'
import AdminPanel from './components/AdminPanel.vue'
import TeachingWorkspace from './components/TeachingWorkspace.vue'
import StudentCourses from './components/StudentCourses.vue'
import { GraduationCap, Plus, PanelLeftClose, PanelLeftOpen, MessageSquare, BookOpen, Sparkles, ArrowUp, ArrowUpRight, ChevronDown, FlaskConical, Lightbulb, FileText, X, CircleHelp, Settings2, Check, Compass, House } from 'lucide-vue-next'
const collapsed = ref(false), input = ref(''), activeCategory = ref('全部'), dialog = ref(false), deep = ref(false), current = ref(null), textarea = ref(null)
const view=ref('home'), selectedCourse=ref(null)
const featureTab=ref('assignments')
const sessions = ref([])
const busy = ref(false)
const pageError = ref('')
const user=ref(null),authReady=ref(false),authError=ref('')
function clearIdentity() {view.value='home';selectedCourse.value=null;user.value=null;sessions.value=[];current.value=null;input.value='';dialog.value=false;pageError.value=''}
async function authenticated(value) {clearIdentity();user.value=value;await loadSessions()}
async function restoreAuth() {
 authReady.value=false
 clearIdentity()
 authError.value=''
 try {
  await startFreshSession()
  if (['student','teacher','admin'].includes(demoRole)) {
   user.value=demoUser(demoRole)
   await loadSessions()
  }
 }
 catch {authError.value='暂时无法连接服务，请稍后重试。'}finally{authReady.value=true}
}
async function logout() {if(busy.value)return;try{await api('/auth/logout',{method:'POST',body:'{}'});clearIdentity()}catch{pageError.value='退出失败，请稍后重试'}}
async function api(path,options={}) {
 const response=await fetch('/api'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}})
 const data=response.status===204?null:(response.headers.get('content-type')||'').includes('application/json')?await response.json().catch(()=>null):null
 if(response.status===401) clearIdentity()
 if(!response.ok) throw new Error(data?.error || `服务请求失败（HTTP ${response.status}）`)
 return data
}
async function loadSessions() {
 if(user.value?.role==='admin'){sessions.value=[];return}
 try { sessions.value=(await api('/conversations')).map(s=>({...s,messages:[],loaded:false})); pageError.value='' }
 catch { pageError.value='暂时无法读取历史会话，请检查后端和数据库。' }
}
async function openSession(session) {
 view.value='chat'
 current.value=session.id
 if(session.loaded) return
 try { session.messages=await api(`/conversations/${session.id}/messages`);session.loaded=true;pageError.value='' }
 catch(e) { pageError.value=e.message }
}
function hideIdentity() { clearIdentity();authReady.value=false }
function resumePage(event) { if(event.persisted) restoreAuth() }
onMounted(()=>{
 window.addEventListener('pagehide',hideIdentity)
 window.addEventListener('pageshow',resumePage)
 restoreAuth()
})
onUnmounted(()=>{
 window.removeEventListener('pagehide',hideIdentity)
 window.removeEventListener('pageshow',resumePage)
})
const roleLabel=computed(()=>({student:'学生工作台',teacher:'教师工作台',admin:'管理工作台'}[user.value?.role] || '学生工作台'))
const teacher=computed(()=>user.value?.role==='teacher')
const featureNav=computed(()=>teacher.value?[
 ['courses','课程互动题',BookOpen],['assignments','作业管理',FileText],['questions','题库管理',BookOpen],['papers','试卷管理',FileText],['lessons','教学设计',Lightbulb],['graphs','知识图谱',Compass],['classes','班级管理',GraduationCap]
]:[['courses','课程选择',BookOpen],['questions','自主练习',BookOpen],['exams','模拟考试',FileText],['portrait','学情画像',GraduationCap]])
function openFeature(tab){
 if(tab==='courses' || (!teacher.value && ['exams','portrait'].includes(tab))){view.value=tab;selectedCourse.value=null;current.value=null;return}
 featureTab.value=tab;view.value='teaching';current.value=null
}
function openCourse(id){selectedCourse.value=id;view.value='courses'}
function backFromCourse(){if(selectedCourse.value)selectedCourse.value=null;else openHome()}
function openHome(){view.value='home';current.value=null;input.value=''}
const homeCards=computed(()=>teacher.value?[
 {key:'courses',title:'课程互动题',desc:'为视频设置暂停提问点，或用模型生成草稿题。',icon:BookOpen,color:'blue'},
 {key:'lessons',title:'教学设计',desc:'从主题和学情出发，组织教学目标与课堂流程。',icon:Lightbulb,color:'orange'},
 {key:'questions',title:'题库管理',desc:'编写题目、答案和解析，沉淀教学资源。',icon:BookOpen,color:'green'},
 {key:'papers',title:'试卷管理',desc:'从题库选题，组合适合课堂的测评。',icon:FileText,color:'purple'},
 {key:'assignments',title:'作业管理',desc:'布置任务，查看提交并给出学习反馈。',icon:FileText,color:'blue'},
 {key:'graphs',title:'知识图谱',desc:'连接知识点，展示概念之间的关系。',icon:Compass,color:'green'},
 {key:'classes',title:'班级管理',desc:'组织班级成员与教学活动。',icon:GraduationCap,color:'orange'}
]:[
 {key:'courses',title:'课程选择',desc:'选择课程，按章节学习多模态课堂资源。',icon:BookOpen,color:'blue'},
 {key:'questions',title:'自主练习',desc:'选择知识点，在练习中逐步理解。',icon:BookOpen,color:'green'},
 {key:'exams',title:'模拟考试',desc:'集中训练，检验阶段性学习成果。',icon:FileText,color:'purple'},
 {key:'portrait',title:'学情画像',desc:'查看个人学习表现与成长轨迹。',icon:GraduationCap,color:'orange'}
])
const cards=computed(()=>teacher.value?[
 {title:'教学设计与教案',desc:'明确目标、重难点和教学流程',icon:BookOpen,color:'green',prompt:'请协助我编写一份教育数字化课程教案。先询问我的教学主题、授课对象和课时，再设计教学目标、重难点、教学流程和评价方法。'},
 {title:'教学活动设计',desc:'设计课堂互动与探究活动',icon:Lightbulb,color:'orange',prompt:'请协助我设计一项教育数字化课程的课堂活动。先询问教学目标、班级人数和可用时间，再给出活动步骤、分组方式与评价建议。'},
 {title:'题目与解析生成',desc:'围绕知识点编写练习及解析',icon:FileText,color:'purple',prompt:'请帮我生成教育数字化课程练习题。先确认知识点、题型、难度和数量，再提供题目、参考答案与解析。'},
 {title:'教育数字化问答',desc:'讨论教学方法与技术应用',icon:FlaskConical,color:'blue',prompt:'我想讨论教育数字化在课堂教学中的应用，请先了解我的教学情境，再帮我分析适合的技术与教学策略。'}
]:[
 {title:'教育数字化知识问答',desc:'从一个问题开始，理解专业知识',icon:BookOpen,color:'green',prompt:'请作为我的教育数字化学习助教，先询问我想了解的知识点和已有基础，再用易懂的语言解释。'},
 {title:'概念与案例学习',desc:'结合真实情境，理解抽象概念',icon:Lightbulb,color:'orange',prompt:'请通过一个课堂案例帮助我理解建构主义学习理论，并用几个问题检查我的理解。'},
 {title:'学习计划建议',desc:'围绕目标安排学习与复习',icon:Compass,color:'blue',prompt:'请帮我制定教育数字化学习计划。先询问我的目标、基础和每天可用时间，再给出分阶段建议与自测方法。'},
 {title:'练习与解题辅导',desc:'分步思考，在练习中巩固理解',icon:FileText,color:'purple',prompt:'请通过启发式提问辅导我完成教育数字化练习。先让我提供题目与自己的思路，再逐步提示，不要直接给出完整答案。'}
])
const filtered=cards
const activeSession = computed(() => sessions.value.find(s => s.id === current.value))
const suggestions=computed(()=>teacher.value?['如何设计一节翻转课堂？','怎样评价学生的协作学习？']:['什么是教学设计中的 ADDIE 模型？','形成性评价与总结性评价有什么区别？'])
function newChat() { view.value='chat'; current.value = null; input.value = ''; nextTick(() => textarea.value?.focus()) }
function choose(prompt) { view.value='chat'; input.value = prompt; nextTick(() => textarea.value?.focus()) }
function askFromFeature(prompt) { newChat(); input.value=prompt; nextTick(()=>send()) }
async function send(event) {
 if (event?.isComposing || !input.value.trim() || busy.value) return
 if(!user.value)return
 if(view.value==='home')view.value='chat'
 busy.value=true
 pageError.value=''
 try {
  if (!activeSession.value) { const saved=await api('/conversations',{method:'POST',body:JSON.stringify({title:input.value.trim().slice(0,100)})});sessions.value.unshift({...saved,messages:[],loaded:true});current.value=saved.id }
  if(!activeSession.value.loaded) { await openSession(activeSession.value); if(!activeSession.value.loaded) throw new Error('请先重新加载会话') }
 } catch(e) {pageError.value=e.message;busy.value=false;return}
 activeSession.value.messages.push({role:'user', text:input.value.trim()})
 const session = activeSession.value
 const prompt=input.value.trim()
 session.messages.push({role:'assistant', text:'', pending:true})
 const reply = session.messages[session.messages.length - 1]
 input.value = ''
 busy.value = true
 const controller = new AbortController()
 const timer = setTimeout(() => controller.abort(), 600000)
 try {
  const response = await fetch(`/api/conversations/${session.id}/chat`, {method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal, body:JSON.stringify({text:prompt,think:deep.value})})
  if (!response.ok) { input.value=prompt; session.messages.splice(-2); if(response.status===401)clearIdentity(); const data=await response.json(); throw new Error(data.error || '服务暂不可用') }
  const reader = response.body.getReader(), decoder = new TextDecoder()
  let buffer = '', completed = false
  const consume = line => {
   if (!line.trim()) return
   const chunk = JSON.parse(line)
   if (chunk.error) throw new Error(chunk.error)
   reply.text += chunk.message?.content || ''
   if(chunk.done) { completed = true; reply.truncated = chunk.done_reason === 'length' }
  }
  while (true) {
   const {value,done} = await reader.read()
   buffer += done ? decoder.decode() : decoder.decode(value,{stream:true})
   const lines = buffer.split('\n'); buffer = lines.pop()
   lines.forEach(consume)
   await nextTick()
   if(current.value === session.id) document.querySelector('.conversation')?.scrollTo({top:999999})
   if(done) break
  }
  consume(buffer)
  if(!completed) throw new Error('连接中断，请重新发送问题。')
  if(!reply.text) reply.text = '本次未生成正文，请关闭深度思考后重试。'
 } catch (error) {
  reply.error = true
  pageError.value=error.message
  reply.text += '\n' + (error.name === 'AbortError' ? '请求超时，请稍后重试。' : error.message === 'Failed to fetch' ? '无法连接本机模型服务，请先启动 Ollama。' : error.message)
 } finally { clearTimeout(timer); reply.pending = false; busy.value = false }
}
</script>

<template>
 <PublicPortal v-if="!user" :session-ready="authReady && !authError" :session-error="authError" @retry="restoreAuth" @authenticated="authenticated"/>
 <div v-else class="app-shell" :class="{collapsed}">
  <aside class="sidebar dual-sidebar">
   <nav v-if="user.role!=='admin'" class="icon-rail" aria-label="主要功能"><button class="rail-logo" title="首页" aria-label="首页" @click="openHome"><img src="/swu-logo.svg" alt=""/></button><button class="rail-button" :class="{selected:view==='home'}" title="首页" aria-label="首页" @click="openHome"><House :size="21"/><small>首页</small></button><button class="rail-button" :class="{selected:view==='chat'}" title="智能问答" aria-label="智能问答" @click="newChat"><MessageSquare :size="21"/><small>问答</small></button><button v-for="[key,label,icon] in featureNav" :key="key" class="rail-button" :class="{selected:(view==='teaching' && featureTab===key) || view===key}" :title="label" :aria-label="label" @click="openFeature(key)"><component :is="icon" :size="21"/><small>{{label}}</small></button><button class="rail-bottom" title="模型介绍" aria-label="模型介绍" @click="dialog=true"><CircleHelp :size="20"/><small>介绍</small></button></nav>
   <div class="sidebar-panel"><a class="brand" href="#" @click.prevent="openHome"><span class="brand-name">LLM课程学习<span>LLM COURSE LEARNING</span></span></a><button v-if="user.role!=='admin'" class="side-panel-close" type="button" aria-label="收起对话侧栏" title="收起对话侧栏" @click="collapsed=true"><PanelLeftClose :size="18"/></button><button v-if="user.role!=='admin'" class="new-chat" @click="newChat"><Plus :size="19"/><span>开启新对话</span></button><div v-if="user.role!=='admin'" class="side-content"><div class="section-label history-title">最近对话 <span>{{sessions.length.toString().padStart(2,'0')}}</span></div><div v-if="!sessions.length" class="empty-history"><MessageSquare :size="22"/><p>灵感，从一次对话开始</p><small>你的对话将显示在这里</small></div><button v-for="session in sessions" :key="session.id" class="history-item" :class="{active: current === session.id}" @click="openSession(session)"><MessageSquare :size="15"/><span>{{session.title}}</span></button></div><div v-if="user.role==='admin'" class="admin-side-label">班级与师生权限管理</div><div class="sidebar-bottom"><div class="intro-card"><span class="intro-symbol">✧</span><strong>专注教育，陪伴成长</strong><p>让技术回归育人的本质</p><button @click="dialog=true">模型介绍 <ArrowUpRight :size="15"/></button></div><div class="profile"><span class="avatar">{{user.displayName.slice(0,1)}}</span><span class="profile-name">{{user.displayName}}<small>{{roleLabel}} · {{user.username}}</small></span><button :disabled="busy" @click="logout" class="logout-button">退出</button></div></div></div>
  </aside>
  <main>
   <div v-if="isDemoMode" class="demo-banner" role="status">前端演示模式 · 数据仅在当前页面有效，未连接后端或模型</div>
   <header><div class="header-left"><button class="icon-button" :aria-label="collapsed?'展开对话侧栏':'收起对话侧栏'" :title="collapsed?'展开对话侧栏':'收起对话侧栏'" @click="collapsed=!collapsed"><PanelLeftOpen v-if="collapsed" :size="20"/><PanelLeftClose v-else :size="20"/></button><span class="header-divider"></span><button class="model-picker" @click="dialog=true">教育数字化领域大模型 <span class="version">1.0</span><ChevronDown :size="14"/></button></div><div class="header-right"><button class="mobile-logout" :disabled="busy" @click="logout">退出登录</button><button @click="dialog=true"><CircleHelp :size="16"/> 模型介绍</button></div></header>
   <nav v-if="user.role!=='admin'" class="mobile-workspace" aria-label="功能导航"><button @click="openHome">首页</button><button @click="newChat">智能问答</button><select aria-label="选择功能" :value="view==='teaching'?featureTab:['courses','exams','portrait'].includes(view)?view:''" @change="openFeature($event.target.value)"><option value="" disabled>选择功能</option><option v-for="[key,label] in featureNav" :key="key" :value="key">{{label}}</option></select><label>历史对话 <select :value="current || ''" @change="sessions.find(s=>s.id===$event.target.value) && openSession(sessions.find(s=>s.id===$event.target.value))"><option value="">选择会话</option><option v-for="session in sessions" :key="session.id" :value="session.id">{{session.title}}</option></select></label></nav>
   <div v-if="pageError" class="page-error" role="alert">{{pageError}} <button @click="loadSessions">重新加载会话</button></div>
   <TeachingWorkspace v-if="view==='teaching' && user.role!=='admin'" :key="user.id" :api="api" :user="user" :active-tab="featureTab" @change-tab="openFeature" @ask="askFromFeature"/>
   <AdminPanel v-else-if="user.role==='admin'" :api="api"/>
   <StudentCourses v-else-if="view==='courses'" :api="api" :course-id="selectedCourse" :teacher="teacher" :user="user" @back="backFromCourse" @open-course="openCourse" @conversation-created="loadSessions"/>
   <section v-else-if="view==='exams' || view==='portrait'" class="course-page student-future"><button class="course-back" @click="openHome">← 返回学生首页</button><div class="course-heading"><div class="eyebrow"><span></span> 学生端</div><h1>{{view==='exams'?'模拟考试':'学情画像'}}</h1><p>{{view==='exams'?'模拟考试功能正在建设中。后续会提供试卷选择、限时作答与成绩反馈。':'学情画像功能正在建设中。后续会汇总练习、考试与课程学习记录。'}}</p></div><button class="work-primary" @click="openFeature('questions')">先去自主练习</button></section>
   <section v-else-if="!activeSession" class="welcome">
    <div class="eyebrow"><span></span> LLM课程学习 · {{teacher?'教师功能':'学生功能'}}</div>
    <h1>你好，欢迎来到<br class="mobile-break"/><span>LLM课程学习</span><span class="title-spark">✧</span></h1>
    <p class="welcome-subtitle">{{teacher ? '从教学设计到课堂评价，选择一个功能开始。' : '选择课程学习资源，或从练习、考试与学情画像开始。'}}</p>
    <div class="application-heading"><h2>功能首页</h2><span class="workspace-hint">点击下方入口，查看功能示例与操作</span></div>
    <div class="application-grid home-grid"><button v-for="card in homeCards" :key="card.key" class="application-card" @click="openFeature(card.key)"><span class="card-icon" :class="card.color"><component :is="card.icon" :size="24"/></span><ArrowUpRight class="card-arrow" :size="17"/><h3>{{card.title}}</h3><p>{{card.desc}}</p><span class="card-label">打开功能</span></button></div>
    <div class="suggestions"><span><Sparkles :size="15"/> 试着问我</span><button v-for="suggestion in suggestions" :key="suggestion" @click="choose(suggestion)">{{suggestion}}<ArrowUpRight :size="13"/></button></div>
   </section>
   <section v-else class="conversation" aria-live="polite"><div class="conversation-heading">{{activeSession.title}}</div><article v-for="(message,index) in activeSession.messages" :key="index" class="message" :class="message.role"><span v-if="message.role==='assistant'" class="assistant-icon"><GraduationCap :size="21"/></span><div><strong v-if="message.role==='assistant'">教育数字化领域大模型</strong><p>{{message.text || (message.pending ? '正在思考，请稍候…' : '')}}</p><small v-if="message.truncated">本次回答已达到长度上限，可继续追问。</small></div></article></section>
   <div v-if="user.role!=='admin' && (view==='chat'||view==='home')" class="composer-area"><form class="composer" @submit.prevent="send"><textarea ref="textarea" v-model="input" aria-label="输入教育问题" placeholder="把你的教育问题交给教育数字化领域大模型，一起寻找答案…" rows="2" maxlength="6000" @keydown.enter.exact.prevent="send"/><div class="composer-toolbar"><button type="button" class="thinking" :class="{enabled:deep}" :aria-pressed="deep" @click="deep=!deep"><Check v-if="deep" :size="15"/><Sparkles v-else :size="15"/> 深度思考</button><div class="send-controls"><span>Enter 发送 / Shift + Enter 换行</span><button type="submit" class="send" :disabled="!input.trim() || busy" aria-label="发送消息"><ArrowUp :size="22"/></button></div></div></form></div>
  </main>
  <div v-if="dialog" class="modal-backdrop" @click.self="dialog=false" @keydown.esc="dialog=false"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="icon-button modal-close" autofocus aria-label="关闭介绍" @click="dialog=false"><X :size="20"/></button><img class="swu-logo" src="/swu-logo.svg" alt="西南大学 SWU 校徽"/><h2 id="dialog-title">关于教育数字化领域大模型</h2><p>面向教学设计、学习辅导和教育研究的教育数字化领域大模型平台。</p><div class="modal-note">聚焦教学设计、启发式辅导、教育研究与学习评价，支持教师探索教学方法，帮助学习者理解知识。</div><button class="new-chat" @click="dialog=false">开始体验</button></section></div>
 </div>
</template>
