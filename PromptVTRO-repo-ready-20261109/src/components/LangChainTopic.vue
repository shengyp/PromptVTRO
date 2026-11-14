<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, Bot, BookOpen, ChevronDown, FileVideo, FolderOpen, MessageCircle, Play, Search } from 'lucide-vue-next'
import { langchainLessons, langchainUnits } from '../data/langchain-topic.js'
import { courseTitle } from '../data/langchain-course.js'

const props = defineProps({ initialLessonId: String, backLabel: { type: String, default: '返回课程' } })
const emit = defineEmits(['back', 'practice', 'exam'])
const selected = ref(langchainLessons.find(item => item.id === props.initialLessonId) || langchainLessons[0])
const expanded = ref(langchainUnits.find(unit => unit.lessons.some(item => item.id === selected.value.id))?.id || langchainUnits[0].id)
const query = ref('')
const tab = ref('guide')
const assistantOpen = ref(false)
const sourcesOpen = ref(false)
const folderInput = ref(null)
const localFiles = ref(new Map())
const folderName = ref('')
const localUrl = ref('')
const playerError = ref('')
const note = ref('')
const comments = ref([])
const commentDraft = ref('')
const demoUrl = '/videos/langchain-overview-demo.mp4'

const currentIndex = computed(() => langchainLessons.findIndex(item => item.id === selected.value.id))
const currentUnit = computed(() => langchainUnits.find(unit => unit.lessons.some(item => item.id === selected.value.id)))
const matchedCount = computed(() => langchainLessons.filter(item => localFiles.value.has(item.day + '/' + item.fileName)).length)
const playerUrl = computed(() => localUrl.value || (selected.value.id === langchainLessons[0].id ? demoUrl : ''))
const isDemo = computed(() => !localUrl.value && selected.value.id === langchainLessons[0].id)
const visibleUnits = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return langchainUnits
  return langchainUnits.map(unit => ({ ...unit, lessons: unit.lessons.filter(item => (item.title + item.fileName).toLowerCase().includes(term)) })).filter(unit => unit.lessons.length)
})

function storageKey(kind) { return 'lc-course-' + kind + '-' + selected.value.id }
function loadLocal() {
  try {
    note.value = localStorage.getItem(storageKey('note')) || ''
    const value = JSON.parse(localStorage.getItem(storageKey('discussion')) || '[]')
    comments.value = Array.isArray(value) ? value : []
  } catch { note.value = ''; comments.value = [] }
  commentDraft.value = ''
}
function saveNote() {
  try { localStorage.setItem(storageKey('note'), note.value) } catch { /* Private browsing may block storage. */ }
}
function addComment() {
  const value = commentDraft.value.trim()
  if (!value) return
  comments.value = [...comments.value, { text: value, time: new Date().toLocaleString('zh-CN') }]
  try { localStorage.setItem(storageKey('discussion'), JSON.stringify(comments.value)) } catch { /* Display this-session content. */ }
  commentDraft.value = ''
}
function refreshVideo() {
  if (localUrl.value) URL.revokeObjectURL(localUrl.value)
  localUrl.value = ''
  playerError.value = ''
  const file = localFiles.value.get(selected.value.day + '/' + selected.value.fileName)
  if (file) localUrl.value = URL.createObjectURL(file)
}
function chooseLesson(lesson) {
  selected.value = lesson
  expanded.value = langchainUnits.find(unit => unit.lessons.some(item => item.id === lesson.id))?.id || expanded.value
  tab.value = 'guide'
  refreshVideo()
  loadLocal()
  window.scrollTo(0, 0)
}
function chooseFolder(event) {
  const files = Array.from(event.target.files || [])
  const mapped = new Map()
  for (const file of files) {
    if (!file.name.toLowerCase().endsWith('.mp4')) continue
    const parts = (file.webkitRelativePath || file.name).replaceAll('\\', '/').split('/')
    const day = parts.find(part => /^day0[123]$/i.test(part))
    if (day) mapped.set(day.toLowerCase() + '/' + file.name, file)
    else {
      const matches = langchainLessons.filter(item => item.fileName === file.name)
      if (matches.length === 1) mapped.set(matches[0].day + '/' + file.name, file)
    }
  }
  localFiles.value = mapped
  folderName.value = files[0]?.webkitRelativePath?.split('/')[0] || ''
  refreshVideo()
  event.target.value = ''
}
function move(offset) {
  const next = langchainLessons[currentIndex.value + offset]
  if (next) chooseLesson(next)
}
watch(() => props.initialLessonId, id => {
  const lesson = langchainLessons.find(item => item.id === id)
  if (lesson) chooseLesson(lesson)
})
loadLocal()
onBeforeUnmount(() => { if (localUrl.value) URL.revokeObjectURL(localUrl.value) })
</script>

<template>
  <div class="lc-video-page">
    <header class="lc-video-header"><div class="lc-video-brand"><span>LLM</span><div><strong>LLM课程学习</strong><small>大语言模型课程一体化平台</small></div></div><button type="button" @click="emit('back')"><ArrowLeft :size="16" />{{backLabel}}</button></header>
    <div class="lc-video-shell">
      <p class="lc-video-crumb">{{courseTitle}}　/　{{currentUnit?.title}}　/　{{selected.title}}</p>
      <div class="lc-video-topline"><div><span class="lc-video-kicker">课程视频 · {{selected.day.toUpperCase()}}</span><h1>{{selected.title}}</h1></div><button type="button" class="lc-video-assistant-button" :aria-pressed="assistantOpen" @click="assistantOpen=!assistantOpen"><Bot :size="18" />{{assistantOpen?'关闭智能助手':'智能助手'}} <small>待接入</small></button></div>
      <div class="lc-video-layout">
        <aside v-if="!assistantOpen" class="lc-video-sidebar" aria-label="课程章节">
          <div class="lc-video-side-title"><h2>课程章节</h2><span>{{langchainUnits.length}} 单元 · {{langchainLessons.length}} 节</span></div>
          <label class="lc-video-search"><Search :size="15" /><input v-model="query" type="search" placeholder="搜索章节与视频" aria-label="搜索章节与视频" /></label>
          <div class="lc-video-unit-list">
            <section v-for="(unit,index) in visibleUnits" :key="unit.id" class="lc-video-unit">
              <button type="button" class="lc-video-unit-toggle" :aria-expanded="expanded===unit.id || !!query" @click="expanded=expanded===unit.id?'':unit.id"><b>{{String(index+1).padStart(2,'0')}}　{{unit.title}}</b><ChevronDown :size="15" :class="{up:expanded===unit.id || !!query}" /></button>
              <div v-if="expanded===unit.id || query" class="lc-video-lessons">
                <button v-for="(lesson,lessonIndex) in unit.lessons" :key="lesson.id" type="button" :class="{active:selected.id===lesson.id}" @click="chooseLesson(lesson)"><Play :size="12" /><span>{{String(lessonIndex+1).padStart(2,'0')}}　{{lesson.title}}</span><small v-if="localFiles.has(lesson.day+'/'+lesson.fileName)">本地</small><small v-else-if="lesson.id===langchainLessons[0].id">演示</small></button>
                <button type="button" class="lc-video-practice" @click="emit('practice',unit.id)">本单元章节练习 <ArrowRight :size="13" /></button>
              </div>
            </section>
          </div>
          <button type="button" class="lc-video-exam-link" @click="emit('exam')">期末考试 <ArrowRight :size="14" /></button>
        </aside>
        <main class="lc-video-main">
          <section class="lc-player-card">
            <div class="lc-player-head"><span><FileVideo :size="16" />{{selected.title}}</span><small>{{isDemo?'站内自制演示':localUrl?'浏览器本地文件':'原视频待接入'}}</small></div>
            <video v-if="playerUrl" :key="playerUrl" controls playsinline preload="auto" :src="playerUrl" @error="playerError='视频无法播放，请检查格式或重新选择文件。'">您的浏览器不支持视频播放。</video>
            <div v-else class="lc-player-empty"><FileVideo :size="43" /><strong>这节原视频尚未接入本站</strong><p>下载课程视频后，选择包含 day01、day02、day03 的文件夹，即可在本站播放匹配的视频。</p><button type="button" @click="folderInput?.click()"><FolderOpen :size="15" />选择本地视频文件夹</button></div>
            <p v-if="playerError" class="lc-player-error" role="alert">{{playerError}}</p>
            <div class="lc-player-foot"><p>{{isDemo?'当前播放的是自制界面演示，不是尚硅谷原课程视频。':localUrl?'视频只在本次浏览器会话中读取，不会上传。':'课程文件名已建目录，视频文件仍需接入。'}}</p><div><button type="button" :disabled="currentIndex===0" @click="move(-1)">上一节</button><button type="button" :disabled="currentIndex===langchainLessons.length-1" @click="move(1)">下一节 →</button></div></div>
          </section>
          <div class="lc-video-tabs" role="tablist" aria-label="本节内容"><button v-for="item in [{id:'guide',name:'本节导学'},{id:'materials',name:'资料来源'},{id:'notes',name:'学习笔记'},{id:'discussion',name:'本节讨论'}]" :key="item.id" type="button" role="tab" :aria-selected="tab===item.id" :class="{active:tab===item.id}" @click="tab=item.id">{{item.name}}</button></div>
          <section class="lc-video-panel">
            <template v-if="tab==='guide'"><h2>本节导学</h2><p>本节主题：{{selected.title}}。建议先观看视频，再对照课程思维导图梳理相关概念，完成所属单元的章节练习。</p><p class="lc-video-muted">本节导学依据视频文件名编排，讲解内容仍待教师核对。</p></template>
            <template v-else-if="tab==='materials'"><h2>资料来源</h2><p>课程目录来自你提供的“尚硅谷大模型技术之 LangChain”网盘分享。该分享链接不是可直接嵌入的 MP4 地址。</p><button type="button" class="lc-video-source-toggle" :aria-expanded="sourcesOpen" @click="sourcesOpen=!sourcesOpen">查看文件匹配信息 <ChevronDown :size="15" :class="{up:sourcesOpen}" /></button><div v-if="sourcesOpen" class="lc-video-source-details"><p>预期文件：{{selected.day}} / {{selected.fileName}}</p><p>本地匹配：{{matchedCount}} / {{langchainLessons.length}} 节{{folderName?' · 已选文件夹：'+folderName:''}}</p><button type="button" @click="folderInput?.click()">重新选择文件夹</button></div></template>
            <template v-else-if="tab==='notes'"><h2>学习笔记</h2><p class="lc-video-muted">笔记保存在当前浏览器。清理浏览器数据后可能丢失。</p><textarea v-model="note" rows="6" placeholder="记录本节概念、问题或代码要点……"></textarea><button type="button" class="lc-video-primary" @click="saveNote">保存本节笔记</button></template>
            <template v-else><h2>本节讨论</h2><p class="lc-video-muted">当前是浏览器本地讨论演示，其他用户看不到，正式讨论需接入账号与后端。</p><div v-if="comments.length" class="lc-video-comments"><article v-for="(comment,index) in comments" :key="index"><b>本机学习者</b><small>{{comment.time}}</small><p>{{comment.text}}</p></article></div><p v-else class="lc-video-muted">暂无本机讨论记录。</p><textarea v-model="commentDraft" rows="3" maxlength="1000" placeholder="写下本节的问题或想法……"></textarea><button type="button" class="lc-video-primary" :disabled="!commentDraft.trim()" @click="addComment">发布到本机演示区</button></template>
          </section>
        </main>
        <aside v-if="assistantOpen" class="lc-assistant" aria-label="智能助手"><div class="lc-assistant-head"><Bot :size="20" /><strong>课程智能助手</strong><span>待接入</span></div><p>这里将结合当前视频、课程讲义和章节练习回答问题。</p><div class="lc-assistant-placeholder"><BookOpen :size="22" /><strong>当前未连接模型</strong><span>接入课程知识库和后端后，才可进行真实问答。</span></div><div class="lc-assistant-suggestions"><strong>可准备的问题</strong><span>这节课的关键概念是什么？</span><span>有哪些常见错误？</span><span>给我一个入门练习。</span></div><div class="lc-assistant-input"><input type="text" placeholder="模型接入后可提问" disabled /><button type="button" disabled>发送</button></div></aside>
      </div>
    </div>
    <input ref="folderInput" class="lc-video-hidden" type="file" accept="video/mp4,.mp4" webkitdirectory directory multiple @change="chooseFolder" />
  </div>
</template>

<style scoped>
@import './langchain-topic.css';
</style>
