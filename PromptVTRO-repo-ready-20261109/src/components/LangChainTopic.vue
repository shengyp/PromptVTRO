<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Clipboard, ExternalLink, FileText, FolderOpen, Play, Search, X } from 'lucide-vue-next'
import { langchainLessons, langchainShareUrl, langchainUnits } from '../data/langchain-topic.js'

const props = defineProps({ initialLessonId: String, backLabel: { type: String, default: '返回门户' } })
defineEmits(['back'])

const selected = ref(langchainLessons.find(lesson => lesson.id === props.initialLessonId) || langchainLessons[0])
const expanded = ref(langchainUnits[0].id)
const query = ref('')
const tab = ref('guide')
const folderInput = ref(null)
const localFiles = ref(new Map())
const localFolderName = ref('')
const videoUrl = ref('')
const videoError = ref('')
const copied = ref(false)

const selectedIndex = computed(() => langchainLessons.findIndex(lesson => lesson.id === selected.value.id))
const matchedCount = computed(() => langchainLessons.filter(findLocalFile).length)
const visibleUnits = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return langchainUnits
  return langchainUnits.map(unit => ({
    ...unit,
    lessons: unit.lessons.filter(lesson => (lesson.title + lesson.fileName).toLowerCase().includes(term)),
  })).filter(unit => unit.lessons.length)
})

function findLocalFile(lesson) {
  return localFiles.value.get(lesson.day + '/' + lesson.fileName) || null
}

function refreshVideo() {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  videoUrl.value = ''
  videoError.value = ''
  const file = findLocalFile(selected.value)
  if (file) videoUrl.value = URL.createObjectURL(file)
}

function chooseLesson(lesson) {
  selected.value = lesson
  const unit = langchainUnits.find(item => item.lessons.some(entry => entry.id === lesson.id))
  if (unit) expanded.value = unit.id
  refreshVideo()
}
watch(() => props.initialLessonId, id => {
  const lesson = langchainLessons.find(item => item.id === id)
  if (lesson) chooseLesson(lesson)
})

function chooseFolder(event) {
  const files = Array.from(event.target.files || [])
  const mapped = new Map()
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.mp4')) continue
    const parts = (file.webkitRelativePath || file.name).replaceAll('\\', '/').split('/')
    const day = parts.find(part => /^day0[123]$/i.test(part))
    if (day) mapped.set(day.toLowerCase() + '/' + file.name, file)
    else {
      const matching = langchainLessons.filter(lesson => lesson.fileName === file.name)
      if (matching.length === 1) mapped.set(matching[0].day + '/' + file.name, file)
    }
  }
  localFiles.value = mapped
  localFolderName.value = files[0]?.webkitRelativePath?.split('/')[0] || ''
  refreshVideo()
  // Let the user select the same folder again after updating its contents.
  event.target.value = ''
}

function moveLesson(offset) {
  const next = langchainLessons[selectedIndex.value + offset]
  if (next) chooseLesson(next)
}

async function copyPath() {
  try {
    await navigator.clipboard.writeText(selected.value.netdiskPath)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { copied.value = false }
}

onBeforeUnmount(() => { if (videoUrl.value) URL.revokeObjectURL(videoUrl.value) })
</script>

<template>
  <div class="topic-page">
    <header class="topic-header">
      <div class="topic-brand"><img src="/swu-logo.svg" alt="西南大学校徽" /><span><strong>LLM课程学习</strong><small>大语言模型课程一体化平台</small></span></div>
      <nav aria-label="专题导航"><a href="#topic-top" class="current">专题学习</a><button type="button" @click="tab='materials'">学习资料</button><button type="button" @click="tab='exercise'">章节练习</button><button type="button" class="topic-back" @click="$emit('back')"><ArrowLeft :size="16" />{{backLabel}}</button></nav>
    </header>

    <div id="topic-top" class="topic-content">
      <aside class="topic-sidebar" aria-label="专题视频目录">
        <div class="topic-side-head"><span class="topic-kicker">LEARNING PATH</span><h2>专题目录</h2><p>尚硅谷大模型技术之 LangChain<br />按分享中的视频文件整理</p></div>
        <div class="topic-side-count"><span>已核对视频</span><strong>{{langchainLessons.length}} 节</strong></div>
        <label class="topic-search"><Search :size="15" /><input v-model="query" aria-label="搜索专题视频" placeholder="搜索本专题视频" /><button v-if="query" type="button" aria-label="清除搜索" @click="query=''"><X :size="14" /></button></label>
        <div v-if="!visibleUnits.length" class="topic-no-results">没有找到匹配的视频</div>
        <section v-for="(unit,index) in visibleUnits" :key="unit.id" class="topic-unit">
          <button type="button" class="topic-unit-head" :aria-expanded="expanded===unit.id || !!query" @click="expanded=expanded===unit.id?'':unit.id"><span>{{String(langchainUnits.findIndex(item=>item.id===unit.id)+1).padStart(2,'0')}}</span><strong>{{unit.title}}</strong><small>{{unit.lessons.length}} 节</small><ChevronDown :size="15" /></button>
          <div v-if="expanded===unit.id || query" class="topic-lesson-list"><button v-for="lesson in unit.lessons" :key="lesson.id" type="button" :class="{active:selected.id===lesson.id}" @click="chooseLesson(lesson)"><Play :size="13" /><span>{{lesson.title}}</span><small v-if="findLocalFile(lesson)" title="已匹配本地视频"><Check :size="12" /></small></button></div>
        </section>
      </aside>

      <main class="topic-main">
        <div class="topic-breadcrumb">门户首页　/　专题学习　/　<strong>LangChain 大模型应用开发</strong></div>
        <section class="topic-hero"><div><span class="topic-kicker">FEATURED TOPIC · 专题学习</span><h1>LangChain 大模型应用开发</h1><p>基于你提供的尚硅谷视频资源整理 · 三天目录中已核对 {{langchainLessons.length}} 段视频</p></div><span class="topic-status">网盘资源已收集</span></section>
        <p class="topic-notice">视频目前保存在百度网盘。点击“前往网盘观看”可在网盘页面查看；如已下载整套视频，也可在此选择本地文件夹直接播放。</p>
        <div class="topic-workspace">
          <div>
            <section class="topic-player-card">
              <div class="topic-player">
                <video v-if="videoUrl" :key="videoUrl" :src="videoUrl" controls preload="metadata" playsinline @error="videoError='本地视频加载失败，请检查文件是否完整及浏览器是否支持该编码。'">你的浏览器不支持视频播放。</video>
                <div v-else class="topic-player-placeholder"><div class="topic-play-icon"><Play :size="30" fill="currentColor" /></div><small>{{selected.day.toUpperCase()}} · 第 {{String(selectedIndex+1).padStart(2,'0')}} 节</small><h2>{{selected.title}}</h2><p>视频在百度网盘中；选择下载后的文件夹可在此播放</p><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer"><ExternalLink :size="17" />前往网盘观看</a></div>
              </div>
              <p v-if="videoError" class="topic-video-error" role="alert">{{videoError}}</p>
              <div class="topic-player-info"><div><span class="topic-lesson-index">第 {{selectedIndex+1}} / {{langchainLessons.length}} 节</span><h2>{{selected.title}}</h2><p>原文件：{{selected.fileName}}</p></div><div class="topic-move"><button type="button" :disabled="selectedIndex===0" @click="moveLesson(-1)"><ChevronLeft :size="15" />上一节</button><button type="button" :disabled="selectedIndex===langchainLessons.length-1" @click="moveLesson(1)">下一节<ChevronRight :size="15" /></button></div></div>
            </section>
            <section class="topic-lower"><div class="topic-tabs"><button type="button" :class="{active:tab==='guide'}" @click="tab='guide'">本节导学</button><button type="button" :class="{active:tab==='materials'}" @click="tab='materials'">课程资料</button><button type="button" :class="{active:tab==='exercise'}" @click="tab='exercise'">章节练习</button></div><div v-if="tab==='guide'"><h3>本节学习提示</h3><p>当前选中“{{selected.title}}”。章节标题依据视频文件名整理；具体知识点和讲义将在核对视频内容后补充。</p></div><div v-else-if="tab==='materials'"><h3>分享中的配套资料</h3><p>网盘“1.笔记”中有《尚硅谷大模型技术之LangChainV1.1.0》；“2.资料”中有环境依赖、嵌入模型及 Milvus 相关文件。<a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer">打开资料所在的网盘分享 <ExternalLink :size="14" /></a></p></div><div v-else><h3>练习待整理</h3><p>分享目录中尚未确认成套习题。后续可依据视频和笔记编写章节题，发布前先核对题目与答案。</p></div></section>
          </div>
          <aside class="topic-resources"><section><span class="topic-chip">观看方式</span><h3>在百度网盘观看</h3><p>打开分享后，按下方路径找到当前视频。网盘可能要求登录。</p><div class="topic-path">{{selected.netdiskPath}}</div><div class="topic-resource-actions"><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer"><ExternalLink :size="14" />打开网盘</a><button type="button" @click="copyPath"><Check v-if="copied" :size="14" /><Clipboard v-else :size="14" />{{copied?'已复制':'复制路径'}}</button></div></section><section><span class="topic-chip">本机播放</span><h3>选择已下载的视频</h3><p>请选择包含 day01、day02、day03 的“4.视频”文件夹。文件只在当前浏览器中读取，不会上传到本站。</p><input ref="folderInput" class="topic-file-input" type="file" accept=".mp4,video/mp4" webkitdirectory directory multiple @change="chooseFolder" /><button type="button" class="topic-choose-folder" @click="folderInput?.click()"><FolderOpen :size="16" />选择视频文件夹</button><small v-if="localFolderName">{{localFolderName}}：已匹配 {{matchedCount}} / {{langchainLessons.length}} 段视频</small><small v-else>尚未选择本地文件夹</small></section><section><span class="topic-chip">配套资料</span><h3>课程笔记与环境</h3><p><FileText :size="15" />笔记 V1.1.0 · DOCX</p><p><BookOpen :size="15" />依赖、模型与 Milvus 资料</p><a :href="langchainShareUrl" target="_blank" rel="noopener noreferrer">到网盘查看资料 <ArrowRight :size="14" /></a></section></aside>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import './langchain-topic.css';
</style>
