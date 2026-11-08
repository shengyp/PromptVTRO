<script setup>
import { nextTick, ref } from 'vue'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clipboard, ExternalLink, FileText, FolderOpen, Play, X } from 'lucide-vue-next'
import { langchainLessons, langchainShareUrl, langchainUnits } from '../data/langchain-topic.js'

const emit = defineEmits(['back'])
const selectedLesson = ref(langchainLessons[0])
const lessonDialog = ref(null)
const expanded = ref(new Set([langchainUnits[0].id]))
const showAllFirst = ref(false)
const activeTab = ref('lc-intro')
const pathCopied = ref(false)
const sections = [
  { id: 'lc-intro', label: '课程概览' },
  { id: 'lc-path', label: '学习路径' },
  { id: 'lc-materials', label: '相关资料' },
  { id: 'lc-chapters', label: '章节目录' },
]
function goTo(id) {
  activeTab.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
async function openLesson(lesson) {
  selectedLesson.value = lesson
  pathCopied.value = false
  await nextTick()
  lessonDialog.value?.showModal()
}
function closeLesson() { lessonDialog.value?.close() }
function toggleUnit(id) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}
async function copyPath() {
  try {
    await navigator.clipboard.writeText(selectedLesson.value.netdiskPath)
    pathCopied.value = true
    setTimeout(() => { pathCopied.value = false }, 2000)
  } catch { pathCopied.value = false }
}
</script>

<template>
  <div class="lc-overview">
    <header class="lc-nav"><div class="lc-nav-inner">
      <div class="lc-brand"><span class="lc-brand-mark" aria-hidden="true">LLM</span><span><strong>LLM课程学习</strong><small>大语言模型课程一体化平台</small></span></div>
      <nav aria-label="课程导航">
        <button type="button" class="current" @click="goTo('lc-intro')">课程专题</button>
        <button type="button" @click="emit('back')">开放课程</button>
        <button type="button" @click="emit('back','training')">实训</button>
        <button type="button" @click="goTo('lc-materials')">课程资料</button>
        <button type="button" class="lc-return" @click="emit('back')"><ArrowLeft :size="15" />返回门户</button>
      </nav>
    </div></header>

    <div class="lc-shell">
      <div class="lc-breadcrumb"><button type="button" @click="emit('back')">门户首页</button><span>/</span><button type="button" @click="emit('back')">开放课程</button><span>/</span><strong>LangChain 大模型应用开发</strong></div>
      <section class="lc-hero" aria-labelledby="lc-title">
        <div class="lc-cover" role="img" aria-label="LangChain 大模型应用开发专题视觉封面"><span class="lc-cover-kicker">LLM COURSE SERIES</span><span class="lc-cover-symbol" aria-hidden="true">▱</span><strong>LangChain</strong><small>大模型应用开发专题</small></div>
        <div class="lc-hero-info"><span class="lc-hero-label">OPEN COURSE · 专题学习</span><h1 id="lc-title">LangChain 大模型应用开发</h1><p>依托已收集视频资源，建立从基础到 Agent 的系统学习路径</p><div class="lc-tags"><span>框架基础</span><span>RAG 检索</span><span>Agent 与 MCP</span></div><div class="lc-hero-actions"><button type="button" @click="goTo('lc-chapters')">查看课程章节 <ArrowRight :size="15" /></button><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer">百度网盘资源 <ExternalLink :size="15" /></a></div></div>
        <div class="lc-hero-facts" aria-label="专题资源统计"><div><strong>{{String(langchainUnits.length).padStart(2,'0')}}</strong><span>学习单元</span></div><div><strong>{{langchainLessons.length}}</strong><span>已核对视频</span></div><div><strong>03</strong><span>视频日程</span></div><div><strong>01</strong><span>课程笔记</span></div></div>
      </section>
      <nav class="lc-subnav" aria-label="课程详情导航"><button v-for="section in sections" :key="section.id" type="button" :class="{active:activeTab===section.id}" @click="goTo(section.id)">{{section.label}}</button></nav>
      <div class="lc-layout">
        <main class="lc-main">
          <section id="lc-intro" class="lc-panel lc-intro"><h2>课程介绍</h2><p>本专题依据《尚硅谷大模型技术之 LangChain》视频目录整理，围绕模型调用、提示词与链、文档处理、向量检索以及 Agent 与 MCP 展开。适合希望了解 LangChain 应用开发流程的学习者按顺序学习。</p><p>目前已核对网盘三天目录中的 {{langchainLessons.length}} 段 MP4。课程简介与单元顺序依据文件名拟定，讲解细节和学习时长将在核对视频后完善。</p><div class="lc-keyline"><span>资料来源清晰</span><span>视频路径可追溯</span><span>练习题待建设</span></div></section>
          <section id="lc-path" class="lc-panel lc-path"><h2>目标与学习路径</h2><p>先理解基本调用，再逐步进入检索与智能体。</p><ol class="lc-steps"><li v-for="(unit,index) in langchainUnits" :key="unit.id"><b>{{String(index+1).padStart(2,'0')}}</b><strong>{{index===0?'基础与模型调用':unit.title}}</strong><small>{{unit.lessons.length}} 节视频</small></li></ol></section>
          <section id="lc-chapters" class="lc-panel lc-chapters"><div class="lc-section-head"><h2>课程章节</h2><span>共 {{langchainUnits.length}} 单元 · {{langchainLessons.length}} 节</span></div><div v-for="(unit,index) in langchainUnits" :key="unit.id" class="lc-unit"><button type="button" class="lc-unit-toggle" :aria-expanded="expanded.has(unit.id)" @click="toggleUnit(unit.id)"><strong>{{String(index+1).padStart(2,'0')}}　{{unit.title}}</strong><small>{{unit.lessons.length}} 节视频</small><ChevronDown :size="16" :class="{up:expanded.has(unit.id)}" /></button><div v-if="expanded.has(unit.id)" class="lc-unit-lessons"><button v-for="(lesson,lessonIndex) in (index===0 && !showAllFirst ? unit.lessons.slice(0,4) : unit.lessons)" :key="lesson.id" type="button" @click="openLesson(lesson)"><span class="lc-lesson-icon"><Play :size="11" fill="currentColor" /></span><span class="lc-lesson-title">{{String(lessonIndex+1).padStart(2,'0')}}　{{lesson.title}}</span><small>{{lesson.day.toUpperCase().replace('DAY','DAY ')}}</small><span class="lc-lesson-action">查看网盘路径 <ExternalLink :size="12" /></span></button><button v-if="index===0 && !showAllFirst" type="button" class="lc-show-all" @click="showAllFirst=true">查看本单元全部 {{unit.lessons.length}} 节 <ChevronDown :size="14" /></button></div></div></section>
          <section id="lc-materials" class="lc-panel lc-materials"><h2>相关资料</h2><div class="lc-material-grid"><article><FileText :size="19" /><div><strong>课程笔记 V1.1.0</strong><p>网盘“1.笔记”目录</p></div></article><article><FolderOpen :size="19" /><div><strong>环境与示例资料</strong><p>网盘“2.资料”目录</p></div></article><article><FolderOpen :size="19" /><div><strong>Milvus 与嵌入模型</strong><p>配套环境材料</p></div></article></div><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer">查看网盘中的课程资料 <ExternalLink :size="15" /></a></section>
        </main>
        <aside class="lc-aside" aria-label="课程附加信息">
          <section class="lc-panel"><h2>专题信息</h2><span class="lc-status">资源整理中</span><dl><div><dt>学习方式</dt><dd>百度网盘观看</dd></div><div><dt>课程单元</dt><dd>{{langchainUnits.length}} 个</dd></div><div><dt>视频目录</dt><dd>{{langchainLessons.length}} 段已核对</dd></div><div><dt>开课时间</dt><dd>待公布</dd></div></dl><a class="lc-netdisk-button" :href="langchainShareUrl" target="_blank" rel="noopener noreferrer">打开百度网盘 <ExternalLink :size="14" /></a></section>
          <section class="lc-panel"><h2>相关资料</h2><div class="lc-resource"><FileText :size="18" /><div><strong>课程笔记 V1.1.0</strong><small>网盘“1.笔记”目录</small></div></div><div class="lc-resource"><FolderOpen :size="18" /><div><strong>环境与示例资料</strong><small>网盘“2.资料”目录</small></div></div><div class="lc-resource"><FolderOpen :size="18" /><div><strong>Milvus 与嵌入模型</strong><small>配套环境材料</small></div></div></section>
          <section class="lc-panel lc-note"><h2>建设说明</h2><p>授课团队与学习进度尚未核实。页面只展示已确认的视频和资料信息。</p></section>
        </aside>
      </div>
    </div>
  </div>

  <dialog ref="lessonDialog" class="lc-lesson-dialog" aria-label="网盘视频位置" @click.self="closeLesson"><button type="button" class="lc-dialog-close" aria-label="关闭" @click="closeLesson"><X :size="18" /></button><span class="lc-dialog-kicker">VIDEO RESOURCE · 视频资料</span><h2>{{selectedLesson.title}}</h2><p>该小节的视频保存在百度网盘。打开分享后，按以下路径找到文件并在网盘中观看。</p><div class="lc-dialog-path">{{selectedLesson.netdiskPath}}</div><div class="lc-dialog-actions"><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer"><ExternalLink :size="16" />前往百度网盘观看</a><button type="button" @click="copyPath"><Check v-if="pathCopied" :size="16" /><Clipboard v-else :size="16" />{{pathCopied?'路径已复制':'复制文件路径'}}</button></div><small>网盘分享会打开文件列表，暂不能自动定位到这一段视频。</small></dialog>
</template>

<style scoped>
@import './langchain-overview.css';
</style>
