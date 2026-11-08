<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowLeft, BookOpen, MessageSquare, Play, RotateCw } from 'lucide-vue-next'
import CourseChat from './CourseChat.vue'
import CourseCheckpointEditor from './CourseCheckpointEditor.vue'

const props = defineProps({ api:Function, courseId:String, teacher:Boolean, user:Object })
const emit = defineEmits(['back','open-course','conversation-created'])
const courses = ref([]), course = ref(null), selected = ref(null), busy = ref(false), error = ref('')
const video = ref(null), chat = ref(null), activeCheckpoint = ref(null), selectedAnswer = ref(null), quizResult = ref(null), quizBusy = ref(false), quizError = ref(''), videoError = ref(''), helpCompleted = ref(false)
const completedIds = ref([])
const videoUrl = computed(() => selected.value && course.value ? `/api/courses/${encodeURIComponent(course.value.id)}/videos/${encodeURIComponent(selected.value.id)}` : '')
const storageKey = computed(()=>`edu-course-checkpoints:${props.user?.id || 'guest'}:${props.courseId || 'all'}`)

function readCompletion() {
 try { const value=JSON.parse(localStorage.getItem(storageKey.value) || '[]'); completedIds.value=Array.isArray(value)?value:[] }
 catch { completedIds.value=[] }
}
watch(storageKey,readCompletion,{immediate:true})
watch(()=>selected.value?.id,()=>{activeCheckpoint.value=null;selectedAnswer.value=null;quizResult.value=null;quizError.value='';videoError.value='';helpCompleted.value=false})

async function load() {
 busy.value = true; error.value = ''
 try {
  if (props.courseId) await refreshCourse()
  else { courses.value = await props.api('/courses'); course.value=null; selected.value=null }
 } catch (e) { error.value = e.message }
 finally { busy.value = false }
}
async function refreshCourse() {
 try {
  const previousId = selected.value?.id
  course.value = await props.api(`/courses/${encodeURIComponent(props.courseId)}`)
  const videos = course.value.chapters.flatMap(chapter => chapter.videos)
  selected.value = videos.find(item=>item.id===previousId) || videos[0] || null
 } catch(e) { error.value=e.message }
}
watch(() => props.courseId, load)
onMounted(load)

function checkProgress() {
 if (props.teacher || !selected.value || !video.value || !Number.isFinite(video.value.duration) || video.value.duration<=0) return
 if (activeCheckpoint.value) {
  const trigger = video.value.duration * activeCheckpoint.value.fraction
  if (video.value.currentTime > trigger + 0.15) video.value.currentTime = trigger
  video.value.pause()
  return
 }
 const checkpoint = selected.value.checkpoints?.find(item => !completedIds.value.includes(item.id) && video.value.currentTime >= video.value.duration * item.fraction - 0.15)
 if (!checkpoint) return
 video.value.pause()
 const trigger = video.value.duration * checkpoint.fraction
 if (video.value.currentTime > trigger + 0.15) video.value.currentTime = trigger
 activeCheckpoint.value = checkpoint
 if (document.fullscreenElement === video.value) document.exitFullscreen().catch(()=>{})
 selectedAnswer.value = null
 quizResult.value = null
 quizError.value = ''
 helpCompleted.value = false
}
async function submitAnswer() {
 if (!activeCheckpoint.value || selectedAnswer.value===null || quizBusy.value) return
 quizBusy.value = true
 quizError.value = ''
 try {
  quizResult.value = await props.api(`/courses/${props.courseId}/checkpoints/${activeCheckpoint.value.id}/answer`,{method:'POST',body:JSON.stringify({answerIndex:selectedAnswer.value})})
  if (quizResult.value.correct) {
   completedIds.value = [...new Set([...completedIds.value,activeCheckpoint.value.id])]
   localStorage.setItem(storageKey.value,JSON.stringify(completedIds.value))
  }
 } catch(e) { quizError.value=e.message }
 finally { quizBusy.value=false }
}
function continueVideo() { activeCheckpoint.value=null;quizResult.value=null;quizError.value='';selectedAnswer.value=null;helpCompleted.value=false;video.value?.play().catch(()=>{}) }
function rewatch() { activeCheckpoint.value=null;quizResult.value=null;quizError.value='';selectedAnswer.value=null;helpCompleted.value=false;if(video.value){video.value.currentTime=0;video.value.play().catch(()=>{})} }
function askAboutQuestion() {
 if (!activeCheckpoint.value) return
 const option = activeCheckpoint.value.options[selectedAnswer.value] || ''
 chat.value?.prefill(`我在“${selected.value.title}”视频的互动题中遇到问题：${activeCheckpoint.value.question}${option?`我选了“${option}”。`:''}请解释相关概念并给我思考提示，先不要直接说正确选项。`)
}
</script>

<template>
 <section class="course-page">
  <button class="course-back" @click="emit('back')"><ArrowLeft :size="17"/> {{courseId?'返回课程选择':teacher?'返回教师首页':'返回学生首页'}}</button>
  <div class="course-heading"><div class="eyebrow"><span></span> {{teacher?'教师端 · 课程互动题':'学生端 · 课程资源'}}</div><h1>{{courseId?'教育网络技术':'课程选择'}}</h1><p>{{courseId?(teacher?'选择视频，预设弹题或用模型生成题目草稿。':'按章节观看教学视频，播放中会暂停并弹出已发布的互动题。'):'选择一门课程，进入对应的学习资源。'}}</p></div>
  <p v-if="error" class="course-alert" role="alert">{{error}} <button @click="load"><RotateCw :size="15"/> 重试</button></p>
  <p v-if="busy" class="course-muted" role="status">正在加载课程资源…</p>
  <template v-if="!courseId && !busy">
   <div class="course-list"><button v-for="item in courses" :key="item.id" class="course-tile" @click="emit('open-course',item.id)"><span class="card-icon green"><BookOpen :size="27"/></span><span><strong>{{item.title}}</strong><small>{{item.description}}</small><em>{{item.available?`${item.videoCount} 个视频 · 打开课程`:'视频待配置'}}</em></span><Play :size="20"/></button></div>
  </template>
  <div v-else-if="course && !busy" class="course-layout">
   <aside class="course-catalogue"><h2>课程目录</h2><p>{{course.chapters.reduce((sum,chapter)=>sum+chapter.videos.length,0)}} 个视频</p><div v-for="chapter in course.chapters" :key="chapter.name" class="course-chapter"><h3>{{chapter.name}}</h3><button v-for="item in chapter.videos" :key="item.id" :class="{active:selected?.id===item.id}" @click="selected=item"><Play :size="14"/><span>{{item.title}} <small v-if="item.checkpoints?.length">· {{item.checkpoints.length}} 道互动题</small></span></button></div><p v-if="!course.chapters.length" class="course-muted">视频尚未配置到服务器，请联系管理员。</p></aside>
   <div class="course-player">
    <template v-if="selected">
     <div class="course-video"><video ref="video" :key="selected.id" :src="videoUrl" controls preload="metadata" playsinline @timeupdate="checkProgress" @seeking="checkProgress" @play="checkProgress" @error="videoError='视频加载失败，请刷新页面或联系管理员。'">你的浏览器不支持视频播放。</video>
      <div v-if="activeCheckpoint" class="course-quiz" role="dialog" aria-modal="false" aria-label="视频互动题"><span>视频暂停 · {{Math.round(activeCheckpoint.fraction*100)}}% 进度</span><h3>{{activeCheckpoint.question}}</h3><div class="course-quiz-options"><label v-for="(option,index) in activeCheckpoint.options" :key="index"><input v-model.number="selectedAnswer" type="radio" name="course-answer" :value="index" :disabled="quizResult!==null"/> {{String.fromCharCode(65+index)}}. {{option}}</label></div><p v-if="quizError" class="course-alert" role="alert">{{quizError}}</p><button v-if="!quizResult" class="work-primary" :disabled="selectedAnswer===null || quizBusy" @click="submitAnswer">{{quizBusy?'正在判题…':'提交答案'}}</button><div v-else-if="quizResult.correct" class="course-quiz-feedback correct"><strong>回答正确</strong><p>{{quizResult.explanation || '很好，继续观看视频吧。'}}</p><button class="work-primary" @click="continueVideo">继续播放</button></div><div v-else class="course-quiz-feedback wrong"><strong>回答不正确</strong><p>{{quizResult.message}}请先回看，或完成一次助教对话后重新作答。</p><div class="checkpoint-actions"><button class="work-primary" @click="rewatch">从头回看</button><button class="work-button" @click="askAboutQuestion"><MessageSquare :size="16"/> 问课程助教</button><button v-if="helpCompleted" class="work-button" @click="quizResult=null;selectedAnswer=null;helpCompleted=false">重新作答</button></div></div></div>
     </div>
     <p v-if="videoError" class="course-alert" role="alert">{{videoError}}</p>
     <h2>{{selected.title}}</h2><p>{{teacher?'互动题由教师发布后才会在学生播放时弹出。':'遇到互动题时视频会暂停。答错后可以回看，或向下方课程助教提问。'}}</p>
     <CourseCheckpointEditor v-if="teacher" :api="api" :video="selected" :course-id="courseId" @refresh="refreshCourse"/>
     <CourseChat v-else ref="chat" :api="api" :video="selected" @conversation-created="emit('conversation-created')" @answered="helpCompleted=true"/>
    </template>
    <div v-else class="course-empty"><BookOpen :size="36"/><p>课程视频尚未就绪</p></div>
   </div>
  </div>
 </section>
</template>
