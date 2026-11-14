<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  ArrowRight, BookOpen, ChevronLeft, ChevronRight, Code2,
  FileText, FlaskConical, FolderGit2, GraduationCap, Layers3,
  Megaphone, Menu, Network, ShieldCheck, Sparkles, Trophy, UserRound, X,
} from 'lucide-vue-next'
import AuthPage from './AuthPage.vue'
import LangChainOverview from './LangChainOverview.vue'
import portalBooks from '../data/portal-books.json'

defineProps({ sessionReady: Boolean, sessionError: String })
const emit = defineEmits(['authenticated', 'retry'])
const menuOpen = ref(false)
const slideIndex = ref(0)
const loginAudience = ref('student')
const selectedCourse = ref(null)
const courseDialog = ref(null)
const langchainReferenceBook = portalBooks.find(course => course.id === 'C06')
const langchainCoverReady = ref(false)
const langchainCoverFailed = ref(false)
const showTopic = ref(['#langchain-course','#langchain-topic'].includes(window.location.hash))
function syncTopicFromUrl() { showTopic.value = ['#langchain-course','#langchain-topic'].includes(window.location.hash) }
onMounted(() => { window.addEventListener('hashchange', syncTopicFromUrl); window.addEventListener('popstate', syncTopicFromUrl) })
onUnmounted(() => { window.removeEventListener('hashchange', syncTopicFromUrl); window.removeEventListener('popstate', syncTopicFromUrl) })
function openTopic(event) {
  event?.preventDefault()
  showTopic.value = true
  window.location.hash = 'langchain-course'
  window.scrollTo(0, 0)
}
async function closeTopic(target = 'open-courses') {
  showTopic.value = false
  window.location.hash = target
  await nextTick()
  document.getElementById(target)?.scrollIntoView()
}
async function openCourse(course) {
  selectedCourse.value = course
  await nextTick()
  courseDialog.value?.showModal()
}
function followNavigation(item, event) {
  menuOpen.value = false
  if (item.href === '#langchain-course') { openTopic(event); return }
  if (item.href === '#portal-login') loginAudience.value = 'teacher'
}

const navigation = [
  { label: '课程学习', href: '#langchain-course', icon: BookOpen },
  { label: '开放课程', href: '#open-courses', icon: BookOpen },
  { label: '实训', href: '#training', icon: FlaskConical },
  { label: '比赛', href: '#competition', icon: Trophy },
  { label: 'OnlineJudge', href: '#online-judge', icon: Code2 },
  { label: '综合实践', href: '#practice', icon: Network },
  { label: '毕业设计', href: '#graduation', icon: GraduationCap },
  { label: 'GitLab', href: '#gitlab', icon: FolderGit2 },
  { label: '教师登录', href: '#portal-login', icon: UserRound },
]

const slides = [
  {
    kicker: 'COURSE GUIDE · 课程导览',
    title: '从基础到应用\n系统学习大语言模型',
    description: '围绕模型原理、工程实践与教育应用，构建清晰的课程学习路径。',
    href: '#open-courses',
    action: '浏览开放课程',
    metric: '在线用户',
    art: 'LLM',
  },
  {
    kicker: 'PRACTICE LAB · 实验实训',
    title: '在实验中理解模型\n在实践中形成能力',
    description: '以提示工程、检索增强与模型评估组织渐进式实践任务。',
    href: '#training',
    action: '查看实训规划',
    metric: '评测次数',
    art: 'LAB',
  },
  {
    kicker: 'CODE & CREATE · 创新实践',
    title: '让代码连接想法\n让作品回应问题',
    description: '从选题、开发到评测与展示，探索大模型在真实场景中的应用。',
    href: '#practice',
    action: '查看实践路径',
    metric: '代码行',
    art: '</>',
  },
  {
    kicker: 'EDUCATION AI · 教育应用',
    title: '面向教育场景\n建设大模型课程',
    description: '将模型能力与教学设计、学习支持和课程评价结合起来。',
    href: '#open-courses',
    action: '查看课程规划',
    metric: '在线课程',
    art: 'EDU',
  },
]
const activeSlide = computed(() => slides[slideIndex.value])
function changeSlide(offset) {
  slideIndex.value = (slideIndex.value + offset + slides.length) % slides.length
}

const overview = [
  { label: '在线用户', icon: UserRound, first: '今日活跃', second: '本周活跃' },
  { label: '评测总次数', icon: Code2, first: '近一周新增', second: '近一天新增' },
  { label: '代码总行数', icon: FileText, first: '近一年新增', second: '本学期新增' },
  { label: '云实验提交人次', icon: FlaskConical, first: '本学期提交', second: '本学期时长' },
]
const services = [
  { title: '大语言模型教学平台', detail: '面向 LLM 课程教学，规划课程内容、实验任务、学习评价与教学反馈。', status: '平台内容建设中', href: '#open-courses', icon: BookOpen },
  { title: '教师在线开课', detail: '教师可依据课程目标建设章节，组织课件、代码与实验任务。', status: '开课服务待接入', href: '#portal-login', icon: GraduationCap },
  { title: '学生 LLM 应用创新赛', detail: '围绕教育应用与知识服务等真实场景，预留赛事发布和成果展示入口。', status: '暂无已发布赛事', href: '#competition', icon: Trophy },
  { title: '大模型教学案例赛', detail: '面向教师预留教学案例征集，展示教学设计与实践成果。', status: '暂无已发布赛事', href: '#competition', icon: FileText },
]
const labs = [
  { number: '01', title: '提示词与任务设计', detail: '比较不同提示策略，观察输出质量与边界。', icon: Sparkles },
  { number: '02', title: '检索增强生成', detail: '构建课程知识检索流程，理解检索与生成如何配合。', icon: Layers3 },
  { number: '03', title: '模型评估与安全', detail: '设计评测样例，分析效果、可靠性与使用风险。', icon: ShieldCheck },
]
const practiceSteps = [
  { number: '01', title: '确定问题', detail: '选择真实需求与应用场景' },
  { number: '02', title: '构建原型', detail: '组织数据、提示与模型调用' },
  { number: '03', title: '测试评估', detail: '比较结果并记录改进依据' },
  { number: '04', title: '展示复盘', detail: '说明设计取舍与学习收获' },
]
const thesisTopics = ['课程知识库问答', '学习助教应用', '模型评估与安全']
</script>

<template>
  <LangChainOverview v-if="showTopic" @back="closeTopic" />
  <div v-else id="top" class="portal-shell">
    <a class="portal-skip" href="#portal-content">跳转到主要内容</a>
    <header class="portal-header">
      <a class="portal-brand" href="#top" aria-label="返回门户首页" @click="menuOpen=false">
        <img src="/swu-logo.svg" alt="西南大学校徽" />
        <span>LLM课程学习<small>大语言模型课程一体化平台</small></span>
      </a>
      <button class="portal-menu-toggle" type="button" :aria-expanded="menuOpen" aria-controls="portal-navigation" aria-label="切换导航菜单" @click="menuOpen=!menuOpen">
        <X v-if="menuOpen" :size="24" /><Menu v-else :size="24" />
      </button>
      <nav id="portal-navigation" class="portal-navigation" :class="{open:menuOpen}" aria-label="门户栏目">
        <a v-for="item in navigation" :key="item.label" :href="item.href" @click="followNavigation(item,$event)">
          <component :is="item.icon" :size="17" aria-hidden="true" />{{item.label}}
        </a>
      </nav>
    </header>

    <main id="portal-content" class="portal-main">
      <div class="portal-notice" role="status">
        <span><Megaphone :size="17" /> 公告</span>
        <p>暂无已发布公告。课程安排与活动信息将在这里展示。</p>
      </div>

      <section class="portal-first" aria-label="课程门户介绍与登录">
        <div class="portal-overview" aria-label="平台数据">
          <div class="portal-overview-heading"><span class="portal-section-kicker">LIVE DATA</span><h2>实时数据面板</h2><p>正式数据接入后实时显示</p></div>
          <article v-for="item in overview" :key="item.label" class="portal-overview-card">
            <div class="portal-overview-main"><span class="portal-overview-icon"><component :is="item.icon" :size="22" /></span><strong>{{item.label}}</strong><b aria-label="暂无数据">—</b></div>
            <div class="portal-overview-breakdown"><span>{{item.first}}<b>—</b></span><span>{{item.second}}<b>—</b></span></div>
          </article>
        </div>

        <div class="portal-hero" :class="`portal-hero--${slideIndex+1}`" aria-roledescription="轮播" aria-label="课程介绍">
          <div class="portal-hero-copy" :key="slideIndex">
            <span class="portal-eyebrow"><Sparkles :size="16" />{{activeSlide.kicker}}</span>
            <h1>{{activeSlide.title}}</h1>
            <p>{{activeSlide.description}}</p>
            <div class="portal-hero-actions">
              <a class="portal-button portal-button-light" :href="activeSlide.href">{{activeSlide.action}}<ArrowRight :size="17" /></a>
              <a class="portal-button portal-button-outline" href="#training">查看实践路径</a>
            </div>
          </div>
          <div class="portal-hero-art" aria-hidden="true">
            <div class="portal-art-ring portal-art-ring-one"></div>
            <div class="portal-art-ring portal-art-ring-two"></div>
            <div class="portal-art-book">{{activeSlide.art}}</div>
            <span class="portal-art-chip chip-one">01</span>
            <span class="portal-art-chip chip-two">AI</span>
            <span class="portal-art-chip chip-three">{{String(slideIndex+1).padStart(2,'0')}}</span>
          </div>
          <div class="portal-hero-metric"><strong>—</strong><span>{{activeSlide.metric}}</span><small>数据接入后实时显示</small></div>
          <div class="portal-carousel-controls">
            <button type="button" aria-label="上一张" @click="changeSlide(-1)"><ChevronLeft :size="18" /></button>
            <button v-for="(_,index) in slides" :key="index" type="button" class="portal-carousel-dot" :class="{active:slideIndex===index}" :aria-label="`切换到第 ${index+1} 张`" :aria-current="slideIndex===index ? 'true' : undefined" @click="slideIndex=index"></button>
            <button type="button" aria-label="下一张" @click="changeSlide(1)"><ChevronRight :size="18" /></button>
          </div>
        </div>

        <aside id="portal-login" class="portal-login" aria-label="学生与教师登录">
          <button v-if="loginAudience==='teacher'" class="portal-student-entry" type="button" @click="loginAudience='student'">返回学生登录</button>
          <AuthPage :key="loginAudience" embedded :audience="loginAudience" :session-ready="sessionReady" :session-error="sessionError" @retry="emit('retry')" @authenticated="emit('authenticated',$event)" />
        </aside>
      </section>

      <section id="services" class="portal-section">
        <div class="portal-section-heading"><div><span class="portal-section-kicker">ONLINE SERVICES</span><h2>在线服务</h2><p>课程教学 · 教师开课 · 创新实践</p></div></div>
        <div class="portal-service-grid">
          <a v-for="item in services" :key="item.title" :href="item.href" class="portal-service-card" @click="followNavigation(item)">
            <span class="portal-service-icon"><component :is="item.icon" :size="25" /></span>
            <strong>{{item.title}}</strong><p>{{item.detail}}</p><span class="portal-card-action">{{item.status}}</span>
          </a>
        </div>
      </section>

      <section id="open-courses" class="portal-section portal-course-section">
        <div class="portal-section-heading"><div><span class="portal-section-kicker">OPEN COURSES</span><h2>开放课程</h2><p>1 门已建课程 · 16 门课程规划。规划课程的教材封面来自真实出版物，正式教材与资料待确定。</p></div><span class="portal-status">持续建设中</span></div>
        <div class="portal-course-grid">
          <article class="portal-book-card portal-langchain-card">
            <button type="button" class="portal-book-button" aria-label="进入 LangChain 大模型应用开发课程" @click="openTopic">
              <span class="portal-book-cover portal-langchain-cover"><BookOpen v-if="!langchainCoverReady" :size="76" /><span v-if="!langchainCoverReady">LANGCHAIN</span><img v-if="!langchainCoverFailed" :src="langchainReferenceBook.cover" alt="《LangChain与大语言模型应用开发实践》参考教材封面" referrerpolicy="no-referrer" @load="langchainCoverReady=true" @error="langchainCoverFailed=true" /></span>
              <span class="portal-book-info"><small>C00 · 课程学习</small><strong>LangChain 大模型应用开发</strong><span>参考教材：《{{langchainReferenceBook.book}}》</span><em>进入课程 <ArrowRight :size="14" /></em></span>
            </button>
          </article>
          <article v-for="course in portalBooks" :key="course.id" class="portal-book-card">
            <button type="button" class="portal-book-button" :aria-label="`查看${course.course}的规划信息`" @click="openCourse(course)">
              <span class="portal-book-cover"><img :src="course.cover" :alt="`《${course.book}》教材封面`" referrerpolicy="no-referrer" /></span>
              <span class="portal-book-info"><small>{{course.id}} · 课程规划</small><strong>{{course.course}}</strong><span>拟选教材：《{{course.book}}》</span><em>规划中 <ArrowRight :size="14" /></em></span>
            </button>
          </article>
        </div>
        <p class="portal-book-note">教材封面仅用于本地课程门户方案预览，书名和图片链接可在课程详情中查看出版社来源；正式使用前需确认选书及图片使用权限。</p>
      </section>

      <dialog ref="courseDialog" class="portal-course-dialog" aria-label="课程规划详情" @close="selectedCourse=null" @click.self="courseDialog?.close()">
        <div v-if="selectedCourse" class="portal-course-dialog-content">
          <button type="button" class="portal-dialog-close" aria-label="关闭课程详情" @click="courseDialog?.close()"><X :size="22" /></button>
          <img :src="selectedCourse.cover" :alt="`《${selectedCourse.book}》教材封面`" referrerpolicy="no-referrer" />
          <div><span class="portal-section-kicker">{{selectedCourse.id}} · 课程规划</span><h2>{{selectedCourse.course}}</h2><p>该课程目前处于规划阶段，课程大纲、师资、开课时间和选用教材以正式发布为准。</p><p>拟选教材：《{{selectedCourse.book}}》</p><p>教材与课程主题匹配程度：{{selectedCourse.fit}}</p><a :href="selectedCourse.source" target="_blank" rel="noopener noreferrer">查看出版社教材信息 <ArrowRight :size="16" /></a></div>
        </div>
      </dialog>

      <section id="training" class="portal-section">
        <div class="portal-section-heading"><div><span class="portal-section-kicker">TRAINING</span><h2>实训</h2><p>参考课程实验的组织方式，将关键概念转化为可操作的任务。</p></div><span class="portal-status">实训内容规划中</span></div>
        <div class="portal-lab-grid"><article v-for="lab in labs" :key="lab.number" class="portal-lab-card"><span class="portal-lab-number">{{lab.number}}</span><component :is="lab.icon" :size="27" /><h3>{{lab.title}}</h3><p>{{lab.detail}}</p></article></div>
      </section>

      <div class="portal-double-section">
        <section id="competition" class="portal-section portal-compact-section">
          <div class="portal-section-heading"><div><span class="portal-section-kicker">COMPETITION</span><h2>比赛</h2></div></div>
          <div class="portal-empty-card"><Trophy :size="34" /><strong>暂无已发布赛事</strong><p>后续可展示 LLM 相关赛事、报名时间、赛题与成果。赛事发布前不显示虚构信息。</p></div>
        </section>
        <section id="online-judge" class="portal-section portal-compact-section">
          <div class="portal-section-heading"><div><span class="portal-section-kicker">ONLINE JUDGE</span><h2>OnlineJudge</h2></div></div>
          <div class="portal-empty-card"><Code2 :size="34" /><strong>在线评测建设中</strong><p>规划接入编程练习、自动评测与反馈。当前前端尚未连接判题服务。</p></div>
        </section>
      </div>

      <section id="practice" class="portal-section portal-practice-section">
        <div class="portal-section-heading"><div><span class="portal-section-kicker">COMPREHENSIVE PRACTICE</span><h2>综合实践</h2><p>把知识学习、实验结果与实际问题连接成完整项目。</p></div><span class="portal-status">实践流程示意</span></div>
        <ol class="portal-practice-steps"><li v-for="step in practiceSteps" :key="step.number"><span>{{step.number}}</span><strong>{{step.title}}</strong><p>{{step.detail}}</p></li></ol>
      </section>

      <div class="portal-double-section portal-last-sections">
        <section id="graduation" class="portal-section portal-compact-section">
          <div class="portal-section-heading"><div><span class="portal-section-kicker">GRADUATION DESIGN</span><h2>毕业设计</h2><p>展示与 LLM 课程衔接的选题方向。</p></div></div>
          <div class="portal-topic-card"><span class="portal-status">选题示例 · 建设中</span><ul><li v-for="topic in thesisTopics" :key="topic"><GraduationCap :size="17" />{{topic}}</li></ul></div>
        </section>
        <section id="gitlab" class="portal-section portal-compact-section">
          <div class="portal-section-heading"><div><span class="portal-section-kicker">CODE COLLABORATION</span><h2>GitLab</h2><p>为课程实验与项目代码预留协作入口。</p></div></div>
          <div class="portal-empty-card"><FolderGit2 :size="34" /><strong>代码托管入口建设中</strong><p>待课程仓库和访问权限配置完成后开放；目前不跳转到不存在的仓库。</p></div>
        </section>
      </div>
    </main>

    <footer class="portal-footer">
      <div><img src="/swu-logo.svg" alt="" /><span><strong>LLM课程学习</strong><small>大语言模型课程一体化平台</small></span></div>
      <nav aria-label="页脚快速导航"><strong>快速导航</strong><a href="#open-courses">开放课程</a><a href="#training">实训</a><a href="#practice">综合实践</a><a href="#portal-login">师生登录</a></nav>
      <p>课程、实训与赛事内容以正式发布信息为准。</p>
    </footer>
  </div>
</template>

<style scoped>
.portal-shell{--portal-green:#123e35;--portal-accent:#147d65;--portal-text:#243f35;--portal-muted:#71877b;--portal-border:#dce9df;min-height:100dvh;background:#f7faf7;color:var(--portal-text);scroll-behavior:smooth}
.portal-shell :where(h1,h2,h3,p){margin-top:0}.portal-shell :where(button,a){-webkit-tap-highlight-color:transparent}.portal-shell :where(a):focus-visible,.portal-shell :where(button):focus-visible{outline:3px solid #80d6ab;outline-offset:3px}.portal-skip{position:absolute;left:12px;top:-60px;z-index:30;background:#fff;color:var(--portal-green);padding:10px 14px}.portal-skip:focus{top:10px}
.portal-header{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:24px;height:auto;min-height:84px;padding:14px max(30px,calc((100vw - 1480px)/2));background:var(--portal-green);color:white;box-shadow:0 8px 22px #173d3020}
.portal-brand{display:flex;align-items:center;gap:12px;flex:0 0 auto;min-width:0}.portal-brand img{width:48px;height:48px;border-radius:50%;background:#fff;object-fit:cover}.portal-brand span{font-size:18px;font-weight:700;letter-spacing:.3px;white-space:nowrap}.portal-brand small{display:block;color:#a6c8b7;font-size:10px;font-weight:400;letter-spacing:1.1px;margin-top:5px}.portal-navigation{display:flex;align-items:center;justify-content:flex-end;gap:3px;flex-wrap:wrap}.portal-navigation a{display:inline-flex;align-items:center;gap:6px;padding:9px 8px;border-radius:7px;color:#e5f3e9;font-size:13px;white-space:nowrap}.portal-navigation a:hover{background:#ffffff16;color:#fff}.portal-navigation a:last-child{margin-left:5px;border:1px solid #a9cbb6}.portal-menu-toggle{display:none;color:white}
.portal-main{display:block;margin:0;min-height:0;padding:0 max(30px,calc((100vw - 1480px)/2)) 70px;background:radial-gradient(ellipse at 50% 7%,#e8f4eb 0,#f7faf7 42%,#fbfdfb 100%)}.portal-notice{display:flex;align-items:center;gap:16px;min-height:48px;color:#667f70;font-size:12px}.portal-notice span{display:inline-flex;align-items:center;gap:7px;color:var(--portal-accent);font-weight:700;white-space:nowrap}.portal-notice p{margin:0}
.portal-first{display:grid;grid-template-columns:minmax(190px,.82fr) minmax(420px,2.1fr) minmax(285px,1fr);gap:14px;align-items:stretch}.portal-overview{display:grid;grid-template-rows:repeat(3,1fr);gap:12px}.portal-overview-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--portal-border);border-radius:13px;padding:19px 16px;box-shadow:0 9px 27px #163d2410}.portal-overview-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:11px;background:#e9f5ec;color:var(--portal-accent)}.portal-overview-card div{min-width:0}.portal-overview-card strong{display:block;font-size:15px}.portal-overview-card small{display:block;margin-top:6px;color:var(--portal-muted);font-size:11px}.portal-overview-card b{margin-left:auto;color:#8eac9c;font-size:24px;font-weight:400}
.portal-hero{position:relative;overflow:hidden;min-height:436px;border-radius:14px;background:linear-gradient(121deg,#0e4238 0%,#11604d 63%,#2b8f6b 100%);color:white;box-shadow:0 14px 35px #0f543c25}.portal-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 76% 63%,#a8e9b440 0,transparent 37%),linear-gradient(135deg,transparent 46%,#ffffff0a 46%,#ffffff04 52%,transparent 52%)}.portal-hero-copy{position:relative;z-index:2;width:min(66%,470px);padding:52px 0 64px 42px;animation:portal-fade .3s ease}.portal-eyebrow{display:inline-flex;align-items:center;gap:8px;color:#b8e7c8;font-size:12px;letter-spacing:1.3px}.portal-hero h1{white-space:pre-line;color:#fff;font-size:clamp(29px,2.8vw,40px);line-height:1.4;letter-spacing:.4px;margin:22px 0 14px}.portal-hero p{max-width:450px;color:#d5eadd;line-height:1.85;font-size:14px}.portal-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.portal-button{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:42px;padding:0 17px;border-radius:7px;font-size:13px;font-weight:600}.portal-button-light{background:#fff;color:#15513d}.portal-button-outline{border:1px solid #ffffffaa;color:#fff}.portal-button:hover{transform:translateY(-2px)}.portal-hero-art{position:absolute;right:20px;bottom:35px;width:38%;height:280px;display:grid;place-items:center}.portal-art-ring{position:absolute;border:1px solid #ffffff40;border-radius:50%;transform:rotate(-20deg)}.portal-art-ring-one{width:95%;height:55%}.portal-art-ring-two{width:76%;height:86%;transform:rotate(26deg)}.portal-art-book{display:grid;place-items:center;width:164px;height:164px;border-radius:34px;background:linear-gradient(145deg,#98e5b475,#ffffff12);border:1px solid #ddffec87;color:#e7fff1;box-shadow:0 10px 70px #b6f5cc66,0 14px 40px #063a3280;transform:rotate(-8deg)}.portal-art-chip{position:absolute;display:grid;place-items:center;width:50px;height:50px;border-radius:13px;background:#ffffff22;border:1px solid #e0fff285;color:#ecfff3;font-size:13px;font-weight:700;backdrop-filter:blur(8px)}.chip-one{top:8px;right:30%}.chip-two{left:3%;bottom:40px}.chip-three{right:2%;bottom:32px}.portal-carousel-controls{position:absolute;z-index:3;left:42px;bottom:16px;display:flex;align-items:center;gap:10px}.portal-carousel-controls button:not(.portal-carousel-dot){display:grid;place-items:center;color:#d7f0dd;width:22px;height:22px}.portal-carousel-dot{width:8px;height:8px;border-radius:50%;background:#ffffff70;padding:0}.portal-carousel-dot.active{width:20px;border-radius:9px;background:#fff}@keyframes portal-fade{from{opacity:.35;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.portal-login{min-width:0;background:#fff;border:1px solid var(--portal-border);border-radius:14px;padding:26px 23px;box-shadow:0 9px 27px #163d2410;scroll-margin-top:20px}
.portal-student-entry{float:right;color:var(--portal-accent);font-size:11px;text-decoration:underline}
.portal-section{padding-top:68px;scroll-margin-top:20px}.portal-section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:22px}.portal-section-kicker{display:block;margin-bottom:7px;color:var(--portal-accent);font-size:11px;font-weight:700;letter-spacing:2px}.portal-section-heading h2{font-size:27px;line-height:1.35;color:#183e30;margin-bottom:7px}.portal-section-heading p{margin:0;color:var(--portal-muted);font-size:13px;line-height:1.7}.portal-status{display:inline-flex;align-items:center;white-space:nowrap;border:1px solid #cbe3d2;border-radius:99px;background:#edf7ef;color:#47775c;padding:6px 11px;font-size:11px}
.portal-service-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.portal-service-card{display:flex;flex-direction:column;align-items:flex-start;min-height:205px;padding:22px;background:#fff;border:1px solid var(--portal-border);border-radius:13px;box-shadow:0 7px 24px #153e2810;transition:transform .2s,box-shadow .2s,border-color .2s}.portal-service-card:hover{transform:translateY(-4px);border-color:#9fcdb0;box-shadow:0 14px 30px #153e281b}.portal-service-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:#e9f5ec;color:var(--portal-accent);margin-bottom:16px}.portal-service-card strong{font-size:17px}.portal-service-card p{margin:8px 0 18px;color:var(--portal-muted);font-size:12px;line-height:1.8}.portal-card-action{display:inline-flex;align-items:center;gap:5px;margin-top:auto;color:var(--portal-accent);font-size:12px;font-weight:600}
.portal-course-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:16px}.portal-course-feature{min-height:300px;padding:33px;border-radius:14px;background:linear-gradient(125deg,#e9f4e8,#f8fcf8 70%);border:1px solid #d5e9d8;position:relative;overflow:hidden}.portal-course-feature::after{content:"";position:absolute;right:-70px;bottom:-120px;width:350px;height:350px;border-radius:50%;border:45px solid #b8dec829}.portal-course-tag{display:inline-flex;align-items:center;gap:6px;border-radius:99px;background:#fff;color:var(--portal-accent);font-size:11px;font-weight:700;padding:7px 11px}.portal-course-feature h3{position:relative;font-size:26px;margin:25px 0 13px;color:#174735}.portal-course-feature p{position:relative;max-width:480px;color:#5e7969;font-size:13px;line-height:1.9}.portal-course-feature a{position:relative;display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:var(--portal-accent);font-size:13px;font-weight:700}.portal-course-route{padding:27px 29px;border:1px solid var(--portal-border);border-radius:14px;background:#fff}.portal-route-heading{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.portal-route-heading strong{font-size:17px}.portal-route-heading small{font-size:11px;color:var(--portal-muted)}.portal-course-route ol{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin:20px 0 0;padding:0}.portal-course-route li{display:flex;align-items:center;gap:10px;padding:12px 10px;border:1px solid #e7eee8;border-radius:8px;font-size:12px}.portal-course-route li span{color:var(--portal-accent);font-size:11px;font-weight:700}
.portal-lab-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.portal-lab-card{min-height:210px;padding:25px;background:#fff;border:1px solid var(--portal-border);border-radius:13px}.portal-lab-number{float:right;color:#b6d3bf;font-size:25px;font-weight:700}.portal-lab-card svg{color:var(--portal-accent)}.portal-lab-card h3{font-size:17px;margin:22px 0 8px}.portal-lab-card p{color:var(--portal-muted);font-size:12px;line-height:1.85}
.portal-double-section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}.portal-compact-section{min-width:0}.portal-empty-card{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-height:180px;padding:26px;border:1px solid var(--portal-border);border-radius:13px;background:#fff}.portal-empty-card svg{color:var(--portal-accent);margin-bottom:14px}.portal-empty-card strong{font-size:17px}.portal-empty-card p{max-width:520px;margin:8px 0 0;color:var(--portal-muted);font-size:12px;line-height:1.8}
.portal-practice-section{margin-top:60px;padding:32px;border-radius:15px;background:#123e35;color:white}.portal-practice-section .portal-section-kicker{color:#9ed9b1}.portal-practice-section .portal-section-heading h2{color:white}.portal-practice-section .portal-section-heading p{color:#c8dfd1}.portal-practice-section .portal-status{background:#ffffff19;color:#e6f5e9;border-color:#ffffff55}.portal-practice-steps{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;padding:0;margin:25px 0 0}.portal-practice-steps li{padding:20px;border-radius:10px;background:#ffffff12;border:1px solid #ffffff29}.portal-practice-steps span{display:block;color:#a9dfbb;font-size:12px;font-weight:700;margin-bottom:15px}.portal-practice-steps strong{font-size:16px}.portal-practice-steps p{color:#c5dcd0;font-size:11px;line-height:1.7;margin:8px 0 0}
.portal-last-sections{margin-bottom:10px}.portal-topic-card{min-height:180px;padding:25px;background:#fff;border:1px solid var(--portal-border);border-radius:13px}.portal-topic-card ul{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0;margin:24px 0 0}.portal-topic-card li{display:inline-flex;align-items:center;gap:6px;padding:10px 12px;background:#eff7f0;border-radius:8px;color:#316c52;font-size:12px}
.portal-footer{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:35px;align-items:start;padding:42px max(30px,calc((100vw - 1480px)/2));background:#10382f;color:#e2f0e5}.portal-footer>div{display:flex;align-items:center;gap:12px}.portal-footer img{width:42px;height:42px;border-radius:50%;background:white}.portal-footer strong{display:block;font-size:14px}.portal-footer small{display:block;margin-top:5px;color:#a8c5b0;font-size:11px}.portal-footer nav{display:flex;flex-wrap:wrap;gap:8px 18px}.portal-footer nav strong{width:100%;margin-bottom:7px}.portal-footer a,.portal-footer p{color:#b9d3c1;font-size:11px;line-height:1.8}.portal-footer a:hover{color:white}.portal-footer p{margin:0}
@media(max-width:1280px){.portal-header{padding-inline:22px}.portal-brand span{font-size:15px}.portal-navigation a{font-size:12px;padding:8px 5px}.portal-main,.portal-footer{padding-left:22px;padding-right:22px}.portal-first{grid-template-columns:minmax(165px,.8fr) minmax(340px,1.8fr) minmax(265px,1fr)}.portal-hero-copy{padding-left:30px;width:68%}.portal-hero-art{right:0;width:37%}}
@media(max-width:1050px){.portal-menu-toggle{display:grid;place-items:center;width:40px;height:40px}.portal-navigation{display:none;position:absolute;top:100%;left:0;right:0;padding:12px 22px 18px;background:var(--portal-green);box-shadow:0 12px 19px #102f2580;grid-template-columns:repeat(2,minmax(0,1fr))}.portal-navigation.open{display:grid}.portal-navigation a{padding:11px;font-size:13px}.portal-navigation a:last-child{margin-left:0}.portal-first{grid-template-columns:1fr minmax(280px,.76fr)}.portal-overview{grid-column:1/-1;grid-row:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto}.portal-overview-card{min-height:90px}.portal-hero{min-height:430px}.portal-service-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.portal-header{min-height:72px;padding:12px 16px}.portal-brand img{width:40px;height:40px}.portal-brand span{font-size:14px;white-space:normal}.portal-brand small{font-size:9px}.portal-main{padding:0 16px 46px}.portal-notice{align-items:flex-start;padding:12px 0}.portal-first{display:flex;flex-direction:column}.portal-hero{min-height:350px;order:0}.portal-hero-copy{width:75%;padding:34px 0 55px 24px}.portal-hero h1{font-size:29px}.portal-hero p{font-size:12px}.portal-hero-art{right:-30px;bottom:20px;width:42%;height:210px;opacity:.55}.portal-art-book{width:110px;height:110px}.portal-art-book svg{width:70px}.portal-art-chip{width:36px;height:36px;font-size:10px}.portal-carousel-controls{left:24px}.portal-overview{order:1;display:grid;grid-template-columns:1fr 1fr;gap:9px}.portal-overview-card{padding:12px;min-height:76px}.portal-overview-card:last-child{grid-column:1/-1}.portal-overview-card b{font-size:20px}.portal-overview-icon{width:36px;height:36px;flex-basis:36px}.portal-login{order:2;padding:22px}.portal-section{padding-top:53px}.portal-section-heading{align-items:flex-start;flex-direction:column;gap:10px}.portal-section-heading h2{font-size:23px}.portal-service-grid,.portal-course-layout,.portal-lab-grid,.portal-double-section{grid-template-columns:1fr}.portal-service-card{min-height:160px}.portal-course-feature{min-height:250px}.portal-practice-section{margin-top:48px;padding:24px}.portal-practice-steps{grid-template-columns:1fr 1fr}.portal-footer{grid-template-columns:1fr;gap:24px;padding:32px 20px}}
@media(max-width:430px){.portal-overview{grid-template-columns:1fr}.portal-overview-card:last-child{grid-column:auto}.portal-hero-copy{width:90%}.portal-hero-art{opacity:.25}.portal-course-route ol,.portal-practice-steps{grid-template-columns:1fr}.portal-navigation{grid-template-columns:1fr}}
.portal-book-cover.portal-langchain-cover{flex-direction:column;gap:15px;background:radial-gradient(circle at 40% 20%,#418e6a,#1d6048 60%,#103e31);color:#d7f1df}
.portal-langchain-cover span{font-size:12px;font-weight:800;letter-spacing:3px}
.portal-langchain-card .portal-book-button:hover .portal-langchain-cover svg{transform:translateY(-4px)}
.portal-langchain-cover svg{transition:transform .2s}
</style>


<style scoped>
/* Public portal proposal: keep the original green palette and the three-column entry. */
.portal-first{grid-template-columns:minmax(215px,.78fr) minmax(440px,2fr) minmax(280px,.96fr);gap:16px}
.portal-overview{display:grid;grid-template-rows:auto repeat(4,1fr);gap:9px}
.portal-overview-heading{padding:4px 4px 5px}
.portal-overview-heading h2{font-size:18px;margin:0 0 4px;color:#183e30}
.portal-overview-heading p{font-size:11px;color:var(--portal-muted);margin:0}
.portal-overview-card{min-height:82px;padding:12px 13px;gap:8px}
.portal-overview-card strong{font-size:13px}
.portal-overview-card small{font-size:10px;margin-top:3px}
.portal-overview-icon{width:35px;height:35px;flex-basis:35px;border-radius:8px}
.portal-overview-icon svg{width:19px;height:19px}
.portal-overview-card b{font-size:25px}
.portal-hero{min-height:510px;background:#eaf3e9;color:#194839;box-shadow:0 9px 27px #163d2415}
.portal-hero::before{background:radial-gradient(circle at 94% 6%,#cfe6d6 0,#cfe6d6 22%,transparent 22%),radial-gradient(circle at 65% 76%,#dae9da 0,transparent 36%)}
.portal-hero--2{background:#e7f3ed}.portal-hero--2::before{background:linear-gradient(155deg,transparent 54%,#cde6d9 54%,#cde6d9 64%,transparent 64%),radial-gradient(circle at 85% 14%,#c6e4d4,transparent 40%)}
.portal-hero--3{background:#154c3d;color:#fff}.portal-hero--3::before{background:linear-gradient(135deg,transparent 59%,#ffffff10 59%,#ffffff10 65%,transparent 65%),radial-gradient(circle at 82% 54%,#3b896746,transparent 46%)}
.portal-hero--4{background:#e8f2ec}.portal-hero--4::before{background:radial-gradient(ellipse at 85% 55%,#cde0d2 0,transparent 52%),linear-gradient(120deg,transparent 60%,#c1ddcd 60%,#c1ddcd 60.5%,transparent 60.5%)}
.portal-hero-copy{padding:66px 0 120px 40px;width:min(72%,510px)}
.portal-eyebrow{color:#287b61;font-weight:700}.portal-hero h1{color:inherit;font-size:clamp(30px,2.8vw,42px);line-height:1.34;margin:24px 0 16px}.portal-hero p{color:#58796b;line-height:1.8}
.portal-hero--3 .portal-eyebrow,.portal-hero--3 p{color:#c5dfce}
.portal-hero--3 .portal-button-light{color:#18503c}.portal-hero--3 .portal-button-outline{color:#fff;border-color:#ffffffa0}
.portal-button-light{background:#177d65;color:#fff}.portal-button-outline{border-color:#9dc5ae;color:#246a52}
.portal-hero-art{right:12px;bottom:98px;width:39%;height:280px;opacity:.9}.portal-art-ring{border-color:#7aaf8b80}.portal-art-book{width:158px;height:158px;background:#fff;border:1px solid #b4d3bd;color:#137457;font-size:49px;font-weight:800;box-shadow:10px 14px 0 #b4d6be80,0 24px 40px #3c695029;transform:rotate(-8deg)}
.portal-hero--2 .portal-art-book{border-radius:50%;font-size:45px;transform:rotate(8deg);background:#c5e5d6}.portal-hero--3 .portal-art-book{border-radius:12px;background:#215f4a;color:#e7fff0;transform:rotate(2deg);border-color:#78ab88}.portal-hero--4 .portal-art-book{border-radius:26px 6px 26px 6px;font-size:42px;background:#e1f2e5}
.portal-art-chip{background:#fff;border-color:#c6dfcb;color:#26705a}.portal-hero--3 .portal-art-chip{background:#2b7456;color:#fff;border-color:#77ae8b}
.portal-hero-metric{position:absolute;z-index:3;bottom:0;left:0;right:0;height:102px;display:flex;align-items:center;justify-content:center;gap:12px;background:#194f40;color:#fff}
.portal-hero-metric strong{font-size:32px;line-height:1}.portal-hero-metric span{font-size:17px}.portal-hero-metric small{color:#b6d9c5;font-size:11px}
.portal-carousel-controls{left:50%;bottom:12px;transform:translateX(-50%);gap:10px}.portal-carousel-controls button:not(.portal-carousel-dot){color:#d7f0dd}.portal-carousel-dot{background:#ffffff7a}.portal-carousel-dot.active{background:#fff}
.portal-service-card{min-height:225px;padding:23px}.portal-service-icon{width:38px;height:38px;background:transparent;margin:0 0 15px}.portal-service-card strong{font-size:18px;color:#137b61}.portal-service-card p{font-size:13px;color:#4b6555;line-height:1.8}.portal-card-action{border-top:1px solid #e5ede7;padding-top:12px;color:#7c9b83;font-size:11px;width:100%}
.portal-course-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:17px}.portal-book-card{background:#fff;border:1px solid var(--portal-border);border-radius:14px;overflow:hidden;box-shadow:0 7px 22px #153e2810}.portal-book-button{display:block;width:100%;height:100%;text-align:left;color:inherit}.portal-book-button:hover .portal-book-cover img{transform:translateY(-4px)}.portal-book-cover{height:215px;display:flex;align-items:center;justify-content:center;padding:18px;background:#eef4ef}.portal-book-cover img{display:block;max-height:178px;max-width:80%;object-fit:contain;box-shadow:4px 8px 16px #315c3c33;transition:transform .2s}.portal-book-info{display:flex;flex-direction:column;align-items:flex-start;min-height:160px;padding:16px 17px}.portal-book-info small{font-size:11px;color:#2b8967}.portal-book-info strong{min-height:43px;font-size:15px;line-height:1.45;margin:8px 0 6px}.portal-book-info>span{font-size:11px;color:#718879;line-height:1.5}.portal-book-info em{display:inline-flex;align-items:center;gap:5px;margin-top:auto;padding-top:8px;color:#2f8b6a;font-size:11px;font-style:normal}.portal-book-note{font-size:11px;color:#829687;line-height:1.7;margin:14px 0 0}
.portal-course-dialog{width:min(740px,calc(100vw - 28px));border:1px solid #d5e7da;border-radius:16px;padding:0;color:#234a37;box-shadow:0 20px 65px #163a2e55}.portal-course-dialog::backdrop{background:#0d2d22a8}.portal-course-dialog-content{display:grid;grid-template-columns:190px 1fr;gap:28px;padding:36px;position:relative}.portal-course-dialog-content>img{max-width:180px;max-height:255px;object-fit:contain;align-self:start;box-shadow:5px 9px 18px #28493633}.portal-course-dialog-content h2{font-size:24px;line-height:1.35;margin:12px 0 18px}.portal-course-dialog-content p{font-size:13px;line-height:1.8;color:#607969}.portal-course-dialog-content a{display:inline-flex;align-items:center;gap:7px;color:#117d61;font-size:13px;font-weight:700;margin-top:10px}.portal-dialog-close{position:absolute;top:13px;right:13px;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;color:#426e56}.portal-dialog-close:hover{background:#edf5ee}
.portal-overview-card{display:block;padding:10px 12px}
.portal-overview-main{display:flex;align-items:center;gap:8px}
.portal-overview-main strong{font-size:12px;line-height:1.3}
.portal-overview-main>b{margin-left:auto;font-size:25px;color:#284f3e}
.portal-overview-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:7px;border-top:1px solid #e9efe9;margin-top:8px;padding-top:6px}
.portal-overview-breakdown span{font-size:9px;color:#809487;white-space:nowrap}
.portal-overview-breakdown b{display:block;margin:1px 0 0;color:#527a62;font-size:16px;font-weight:600}
@media(max-width:1280px){.portal-first{grid-template-columns:minmax(180px,.75fr) minmax(340px,1.8fr) minmax(265px,1fr)}.portal-hero-copy{padding-left:28px}.portal-hero-art{width:34%}}
@media(max-width:1050px){.portal-first{grid-template-columns:1fr minmax(280px,.76fr)}.portal-overview{grid-column:1/-1;grid-row:2;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:auto}.portal-overview-heading{grid-column:1/-1}.portal-overview-card{min-height:80px}.portal-course-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:720px){.portal-first{display:flex}.portal-hero{min-height:410px}.portal-hero-copy{width:77%;padding:32px 0 118px 24px}.portal-hero-art{right:-27px;bottom:93px;width:39%;height:205px;opacity:.48}.portal-art-book{width:110px;height:110px;font-size:33px}.portal-hero-metric{height:84px}.portal-hero-metric strong{font-size:27px}.portal-hero-metric small{font-size:9px}.portal-carousel-controls{bottom:7px}.portal-overview{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.portal-overview-heading{grid-column:1/-1}.portal-overview-card:last-child{grid-column:auto}.portal-course-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.portal-book-cover{height:180px}.portal-book-cover img{max-height:150px}.portal-book-info{min-height:165px;padding:12px}.portal-book-info strong{font-size:13px}.portal-service-card{min-height:190px}.portal-course-dialog-content{grid-template-columns:110px 1fr;gap:15px;padding:27px 19px}.portal-course-dialog-content>img{max-width:108px}.portal-course-dialog-content h2{font-size:20px}}
@media(max-width:430px){.portal-hero-copy{width:90%}.portal-hero-art{opacity:.16}.portal-overview{grid-template-columns:1fr 1fr}.portal-overview-card{min-height:84px}.portal-overview-card b{display:none}.portal-course-grid{grid-template-columns:1fr 1fr}.portal-book-cover{height:150px}.portal-book-cover img{max-height:128px}.portal-book-info{min-height:170px}.portal-book-info strong{min-height:55px}.portal-course-dialog-content{display:block}.portal-course-dialog-content>img{max-height:165px;display:block;margin:0 0 18px}}
@media(max-width:430px){.portal-overview-card b{display:block}.portal-overview-main>b{font-size:20px}.portal-overview-breakdown span{font-size:9px}}
</style>
