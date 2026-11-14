<script setup>
import { nextTick, ref } from 'vue'
import { ArrowLeft, ArrowRight, ChevronDown, ExternalLink, FileText, FolderOpen, Play } from 'lucide-vue-next'
import { langchainLessons, langchainShareUrl, langchainUnits } from '../data/langchain-topic.js'
import { courseTitle } from '../data/langchain-course.js'
import LangChainAssessment from './LangChainAssessment.vue'
import LangChainMindMap from './LangChainMindMap.vue'
import LangChainPersonalized from './LangChainPersonalized.vue'
import LangChainTopic from './LangChainTopic.vue'

const emit = defineEmits(['back'])
const mode = ref('overview')
const selectedLessonId = ref(langchainLessons[0].id)
const chapterView = ref('chapters')
const expanded = ref(new Set([langchainUnits[0].id]))
const activeTab = ref('lc-intro')
const assessmentMode = ref('practice')
const assessmentUnitId = ref(langchainUnits[0].id)
const returnMode = ref('overview')
const assessmentKey = ref(0)
const sections = [
  { id: 'lc-intro', label: '课程概览' },
  { id: 'lc-path', label: '学习路径' },
  { id: 'lc-materials', label: '相关资料' },
  { id: 'lc-chapters', label: '章节目录' },
  { id: 'lc-mindmap', label: '思维导图' },
]
function goTo(id) {
  activeTab.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function openLesson(id) {
  selectedLessonId.value = id
  mode.value = 'video'
  window.scrollTo(0, 0)
}
function returnToOverview() {
  mode.value = 'overview'
  nextTick(() => document.getElementById('lc-chapters')?.scrollIntoView({ block: 'start' }))
}
function openPractice(unitId) {
  returnMode.value = mode.value
  assessmentMode.value = 'practice'
  assessmentUnitId.value = unitId
  assessmentKey.value++
  mode.value = 'assessment'
  window.scrollTo(0, 0)
}
function openExam() {
  returnMode.value = mode.value
  assessmentMode.value = 'exam'
  assessmentKey.value++
  mode.value = 'assessment'
  window.scrollTo(0, 0)
}
function returnFromAssessment() {
  if (returnMode.value === 'video') { mode.value = 'video'; window.scrollTo(0, 0) }
  else returnToOverview()
}
function toggleUnit(id) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}
</script>

<template>
  <LangChainTopic v-if="mode==='video'" :initial-lesson-id="selectedLessonId" back-label="返回课程" @back="returnToOverview" @practice="openPractice" @exam="openExam" />
  <LangChainAssessment v-else-if="mode==='assessment'" :key="assessmentKey" :mode="assessmentMode" :unit-id="assessmentUnitId" @back="returnFromAssessment" />
  <div v-else class="lc-overview">
    <header class="lc-nav"><div class="lc-nav-inner">
      <div class="lc-brand"><span class="lc-brand-mark" aria-hidden="true">LLM</span><span><strong>LLM课程学习</strong><small>大语言模型课程一体化平台</small></span></div>
      <nav aria-label="课程导航">
        <button type="button" class="current" @click="goTo('lc-intro')">课程学习</button>
        <button type="button" @click="emit('back')">开放课程</button>
        <button type="button" @click="emit('back','training')">实训</button>
        <button type="button" @click="goTo('lc-materials')">课程资料</button>
        <button type="button" class="lc-return" @click="emit('back')"><ArrowLeft :size="15" />返回门户</button>
      </nav>
    </div></header>

    <div class="lc-shell">
      <div class="lc-breadcrumb"><button type="button" @click="emit('back')">门户首页</button><span>/</span><button type="button" @click="emit('back')">开放课程</button><span>/</span><strong>{{courseTitle}}</strong></div>
      <section class="lc-hero" aria-labelledby="lc-title">
        <div class="lc-cover" role="img" aria-label="LangChain 大模型应用开发课程封面"><span class="lc-cover-kicker">LLM COURSE SERIES</span><span class="lc-cover-symbol" aria-hidden="true">▱</span><strong>LangChain</strong><small>大模型应用开发课程</small></div>
        <div class="lc-hero-info"><span class="lc-hero-label">OPEN COURSE · 课程学习</span><h1 id="lc-title">{{courseTitle}}</h1><p>依托现有视频目录，按模型调用、提示词、检索与 Agent 的顺序组织学习。</p><div class="lc-tags"><span>模型基础</span><span>RAG 检索</span><span>Agent 与 MCP</span></div><div class="lc-hero-actions"><button type="button" @click="goTo('lc-chapters')">查看课程章节 <ArrowRight :size="15" /></button><button type="button" class="lc-hero-outline" @click="openLesson(langchainLessons[0].id)">进入视频学习 <Play :size="14" /></button></div></div>
        <div class="lc-hero-facts" aria-label="课程资源概况"><div><strong>{{String(langchainUnits.length).padStart(2,'0')}}</strong><span>学习单元</span></div><div><strong>{{langchainLessons.length}}</strong><span>视频目录</span></div><div><strong>01</strong><span>站内演示视频</span></div><div><strong>05</strong><span>章节练习入口</span></div></div>
      </section>
      <nav class="lc-subnav" aria-label="课程详情导航"><button v-for="section in sections" :key="section.id" type="button" :class="{active:activeTab===section.id}" @click="goTo(section.id)">{{section.label}}</button></nav>
      <div class="lc-layout">
        <main class="lc-main">
          <section id="lc-intro" class="lc-panel lc-intro"><h2>课程介绍</h2><p>本课程依据你提供的《尚硅谷大模型技术之 LangChain》视频目录整理，围绕模型调用、提示词与链、文档处理、向量检索、Agent 与 MCP 展开。课程内容适合按章节顺序学习，也可通过知识点诊断示例查看补学路径。</p><p>现有目录包含 {{langchainLessons.length}} 个视频文件名。站内目前接入 1 段自制播放演示；原视频尚需下载并完成逐节匹配。课程简介与单元顺序依据文件名拟定，讲解细节仍待核对。</p><div class="lc-keyline"><span>课程结构清晰</span><span>站内视频播放入口</span><span>练习与考试演示</span></div></section>
          <section id="lc-path" class="lc-panel lc-path"><h2>目标与学习路径</h2><p>先掌握模型调用，再学习提示词、文档处理、检索和智能体。</p><ol class="lc-steps"><li v-for="(unit,index) in langchainUnits" :key="unit.id"><b>{{String(index+1).padStart(2,'0')}}</b><strong>{{unit.title}}</strong><small>{{unit.lessons.length}} 节视频</small></li></ol></section>
          <section id="lc-materials" class="lc-panel lc-materials"><h2>相关资料</h2><div class="lc-material-grid"><article><FileText :size="19" /><div><strong>课程笔记 V1.1.0</strong><p>已提供讲义文件；内容待逐节校对</p></div></article><article><FolderOpen :size="19" /><div><strong>环境与示例资料</strong><p>视频分享目录中的配套资料</p></div></article><article><FolderOpen :size="19" /><div><strong>Milvus 与嵌入模型</strong><p>配套环境材料</p></div></article></div><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer">查看原资源分享 <ExternalLink :size="15" /></a></section>
          <section id="lc-chapters" class="lc-panel lc-chapters"><div class="lc-section-head lc-chapter-head"><div class="lc-chapter-switch"><button type="button" :class="{active:chapterView==='chapters'}" @click="chapterView='chapters'">课程章节</button><span aria-hidden="true"></span><button type="button" :class="{active:chapterView==='personalized'}" @click="chapterView='personalized'">个性化学习</button></div><span>共 {{langchainUnits.length}} 单元 · {{langchainLessons.length}} 节视频目录</span></div>
            <template v-if="chapterView==='chapters'"><div v-for="(unit,index) in langchainUnits" :key="unit.id" class="lc-unit"><button type="button" class="lc-unit-toggle" :aria-expanded="expanded.has(unit.id)" @click="toggleUnit(unit.id)"><strong>{{String(index+1).padStart(2,'0')}}　{{unit.title}}</strong><small>{{unit.lessons.length}} 节视频</small><ChevronDown :size="16" :class="{up:expanded.has(unit.id)}" /></button><div v-if="expanded.has(unit.id)" class="lc-unit-lessons"><button v-for="(lesson,lessonIndex) in unit.lessons" :key="lesson.id" type="button" @click="openLesson(lesson.id)"><span class="lc-lesson-icon"><Play :size="11" fill="currentColor" /></span><span class="lc-lesson-title">{{String(lessonIndex+1).padStart(2,'0')}}　{{lesson.title}}</span><small>{{lesson.day.toUpperCase().replace('DAY','DAY ')}}</small><span class="lc-lesson-action">进入视频学习 <ArrowRight :size="12" /></span></button><button type="button" class="lc-practice-row" @click="openPractice(unit.id)"><strong>第 {{String(index+1).padStart(2,'0')}} 单元 · 章节练习</strong><span>4 道前端演示题</span><ArrowRight :size="15" /></button></div></div><button type="button" class="lc-exam-entry" @click="openExam"><span><strong>{{courseTitle}}期末考试</strong><small>20 道前端演示题 · 答题卡与复查交卷</small></span><ArrowRight :size="18" /></button></template>
            <LangChainPersonalized v-else @lesson="openLesson" @practice="openPractice" />
          </section>
          <section id="lc-mindmap"><LangChainMindMap /></section>
        </main>
        <aside class="lc-aside" aria-label="课程附加信息">
          <section class="lc-panel"><h2>课程信息</h2><span class="lc-status">资料整理中</span><dl><div><dt>学习方式</dt><dd>本站课程页</dd></div><div><dt>课程单元</dt><dd>{{langchainUnits.length}} 个</dd></div><div><dt>视频目录</dt><dd>{{langchainLessons.length}} 段</dd></div><div><dt>站内演示视频</dt><dd>1 段</dd></div></dl><button type="button" class="lc-netdisk-button" @click="openLesson(langchainLessons[0].id)">进入视频学习 <ArrowRight :size="14" /></button></section>
          <section class="lc-panel"><h2>课程学习</h2><div class="lc-resource"><Play :size="18" /><div><strong>视频与章节练习</strong><small>每个单元末尾设练习入口</small></div></div><div class="lc-resource"><FileText :size="18" /><div><strong>个性化学习</strong><small>10 个知识点的诊断示例</small></div></div><div class="lc-resource"><FolderOpen :size="18" /><div><strong>思维导图</strong><small>点击节点可展开与折叠</small></div></div></section>
          <section class="lc-panel lc-note"><h2>建设说明</h2><p>练习题、考试卷和个性化分级目前为前端演示。正式使用需教师审核题库，接入账号、学习记录和后端服务。</p></section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './langchain-overview.css';
</style>
