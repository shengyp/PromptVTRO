<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { assessmentSources, questionsForUnit, sampleQuestions } from '../data/langchain-assessment.js'
import { langchainUnits } from '../data/langchain-topic.js'
import { courseTitle } from '../data/langchain-course.js'

const props = defineProps({ mode: { type: String, default: 'practice' }, unitId: { type: String, default: 'foundation' } })
const emit = defineEmits(['back'])
const isExam = computed(() => props.mode === 'exam')
const unit = computed(() => langchainUnits.find(item => item.id === props.unitId) || langchainUnits[0])
const unitIndex = computed(() => langchainUnits.findIndex(item => item.id === unit.value.id))
const questions = computed(() => isExam.value ? sampleQuestions : questionsForUnit(unit.value.id))
const phase = ref(isExam.value ? 'intro' : 'taking')
const currentIndex = ref(0)
const answers = ref({})
const marked = ref(new Set())
const remaining = ref(60 * 60)
let clock = null

const answeredCount = computed(() => questions.value.filter(question => (answers.value[question.id] || []).length).length)
const currentQuestion = computed(() => questions.value[currentIndex.value])
const score = computed(() => questions.value.reduce((total, question) => total + (isCorrect(question) ? 5 : 0), 0))
const timeLabel = computed(() => `${String(Math.floor(remaining.value / 60)).padStart(2,'0')}:${String(remaining.value % 60).padStart(2,'0')}`)

function selectOption(question, optionIndex) {
  if (phase.value !== 'taking') return
  const existing = answers.value[question.id] || []
  answers.value = {
    ...answers.value,
    [question.id]: question.type === 'multiple'
      ? (existing.includes(optionIndex) ? existing.filter(index => index !== optionIndex) : [...existing, optionIndex].sort((a,b) => a-b))
      : [optionIndex],
  }
}
function isCorrect(question) {
  const selected = answers.value[question.id] || []
  return selected.length === question.correct.length && selected.every(index => question.correct.includes(index))
}
function toggleMark() {
  const next = new Set(marked.value)
  if (next.has(currentQuestion.value.id)) next.delete(currentQuestion.value.id)
  else next.add(currentQuestion.value.id)
  marked.value = next
}
function start() { phase.value = 'taking' }
function submit() { phase.value = 'result' }
function review() { phase.value = 'review' }
function jump(index) { currentIndex.value = index; if (phase.value === 'review' && remaining.value > 0) phase.value = 'taking' }
function restart() { answers.value = {}; marked.value = new Set(); currentIndex.value = 0; remaining.value = 60 * 60; phase.value = isExam.value ? 'intro' : 'taking' }
onMounted(() => {
  clock = setInterval(() => {
    if (isExam.value && phase.value === 'taking' && remaining.value > 0) {
      remaining.value -= 1
      if (remaining.value === 0) phase.value = 'result'
    }
  }, 1000)
})
onBeforeUnmount(() => { if (clock) clearInterval(clock) })
</script>

<template>
  <div class="assessment-page">
    <header class="assessment-header"><div class="assessment-brand"><span>LLM</span><strong>LLM课程学习</strong></div><nav><button type="button" @click="emit('back')">← 返回课程</button></nav></header>
    <div class="assessment-shell">
      <p class="assessment-crumb">开放课程　/　{{courseTitle}}　/　{{isExam?'期末考试':'章节练习'}}</p>
      <section v-if="phase==='intro'" class="assessment-intro"><span class="assessment-demo">前端示例卷 · 非正式考试</span><h1>{{courseTitle}}期末考试</h1><div class="assessment-intro-stats"><div><strong>20 题</strong><small>题量</small></div><div><strong>100 分</strong><small>满分</small></div><div><strong>60 分钟</strong><small>演示时长</small></div></div><h2>作答说明</h2><ol><li>答题卡位于右侧，点击题号可跳到对应题目。</li><li>可标记题目，交卷前进入复查页检查未答题。</li><li>当前为前端自编示例题；答案位于浏览器端，不用于正式考试。</li></ol><button type="button" class="assessment-primary" @click="start">开始示例考试 →</button></section>
      <template v-else-if="phase==='taking'"><div class="assessment-title"><div><span class="assessment-demo">{{isExam?'期末考试示例':'章节练习示例'}}</span><h1>{{isExam ? courseTitle+'期末考试' : '第 '+String(unitIndex+1).padStart(2,'0')+' 单元 · '+unit.title+' · 章节练习'}}</h1><p>{{isExam?'20 道演示题 · 满分 100 分':'本单元 4 道演示题 · 可重复练习'}}</p></div><strong v-if="isExam" class="assessment-clock">剩余时间 {{timeLabel}}</strong></div>
        <div class="assessment-grid"><main class="assessment-card assessment-question"><div class="assessment-question-meta"><strong>第 {{String(currentIndex+1).padStart(2,'0')}} 题</strong><span>{{currentQuestion.type==='multiple'?'多选题':currentQuestion.type==='judge'?'判断题':'单选题'}} · 5 分</span><button type="button" @click="toggleMark">{{marked.has(currentQuestion.id)?'★ 已标记':'☆ 标记题目'}}</button></div><h2>{{currentQuestion.stem}}</h2><div class="assessment-options"><label v-for="(option,index) in currentQuestion.options" :key="index" :class="{chosen:(answers[currentQuestion.id]||[]).includes(index)}"><input :type="currentQuestion.type==='multiple'?'checkbox':'radio'" :name="currentQuestion.id" :checked="(answers[currentQuestion.id]||[]).includes(index)" @change="selectOption(currentQuestion,index)" /><span>{{String.fromCharCode(65+index)}}.　{{option}}</span></label></div><p class="assessment-help">{{currentQuestion.type==='multiple'?'本题可选择多个选项。':'请选择一个选项。'}}提交后可查看答案和解析。</p><div class="assessment-question-foot"><button type="button" :disabled="currentIndex===0" @click="currentIndex--">← 上一题</button><span>第 {{currentIndex+1}} / {{questions.length}} 题</span><button v-if="currentIndex<questions.length-1" type="button" class="assessment-primary" @click="currentIndex++">下一题 →</button><button v-else type="button" class="assessment-primary" @click="review">复查答题 →</button></div></main><aside class="assessment-card assessment-nav"><h2>答题卡</h2><p>点击题号跳转到具体题目</p><div class="assessment-counts"><b>已答 {{answeredCount}}</b><b>未答 {{questions.length-answeredCount}}</b></div><div class="assessment-numbers"><button v-for="(question,index) in questions" :key="question.id" type="button" :class="{answered:(answers[question.id]||[]).length,current:currentIndex===index,marked:marked.has(question.id)}" :aria-label="`跳转到第 ${index+1} 题`" @click="jump(index)">{{index+1}}</button></div><p class="assessment-legend">绿色已答 · 空白未答 · 角标已标记</p><button type="button" class="assessment-primary assessment-wide" @click="review">复查{{isExam?'交卷':'并提交'}} →</button></aside></div>
      </template>
      <section v-else-if="phase==='review'" class="assessment-review assessment-card"><span class="assessment-demo">交卷前复查</span><h1>{{isExam?courseTitle+'期末考试':'第 '+String(unitIndex+1).padStart(2,'0')+' 单元章节练习'}}</h1><p>已答 {{answeredCount}} / {{questions.length}} 题，未答 {{questions.length-answeredCount}} 题。点击题号可返回作答。</p><div class="assessment-review-grid"><button v-for="(question,index) in questions" :key="question.id" type="button" :class="{answered:(answers[question.id]||[]).length}" @click="jump(index)"><b>{{String(index+1).padStart(2,'0')}}</b><span>{{question.stem}}</span><small>{{(answers[question.id]||[]).length?'已答':'未答'}}</small></button></div><div class="assessment-review-actions"><button type="button" @click="phase='taking'">返回作答</button><button type="button" class="assessment-primary" @click="submit">确认提交示例答卷</button></div></section>
      <section v-else class="assessment-result assessment-card"><span class="assessment-demo">本地演示结果 · 不保存为正式成绩</span><h1>{{isExam?'期末考试':'章节练习'}}示例结果</h1><div class="assessment-score"><strong>{{score}} / {{questions.length*5}}</strong><span>答对 {{questions.filter(isCorrect).length}} 题 · 已答 {{answeredCount}} 题</span></div><h2>答案与解析</h2><details v-for="(question,index) in questions" :key="question.id" :open="!isCorrect(question)"><summary><span>第 {{index+1}} 题　{{question.stem}}</span><b :class="isCorrect(question)?'correct':'incorrect'">{{isCorrect(question)?'正确':'待复习'}}</b></summary><p>你的选择：{{(answers[question.id]||[]).map(i=>String.fromCharCode(65+i)).join('、')||'未答'}}　　参考答案：{{question.correct.map(i=>String.fromCharCode(65+i)).join('、')}}</p><p>{{question.explanation}}</p></details><div class="assessment-review-actions"><button type="button" @click="emit('back')">返回课程</button><button type="button" class="assessment-primary" @click="restart">重新练习</button></div></section>
      <p class="assessment-source">题目为依据课程目录和公开技术资料编写的前端演示题，尚未经授课教师审核。参考：<a v-for="source in assessmentSources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{source.title}} ↗</a></p>
    </div>
  </div>
</template>

<style scoped>
.assessment-page{min-height:100dvh;background:#f5f8f6;color:#183d2e;font-family:"Microsoft YaHei",sans-serif;font-size:14px}.assessment-page *{box-sizing:border-box}.assessment-page button{cursor:pointer;font:inherit}.assessment-page button:disabled{opacity:.45;cursor:not-allowed}.assessment-header{height:68px;background:#123d2e;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 max(24px,calc((100vw - 1450px)/2))}.assessment-brand{display:flex;align-items:center;gap:12px}.assessment-brand span{border:1px solid #b4d5be;border-radius:7px;padding:9px 5px;font-size:12px;font-weight:800}.assessment-brand strong{font-size:18px}.assessment-header button{background:none;border:0;color:#d8eddf}.assessment-shell{max-width:1450px;margin:auto;padding:20px 24px 55px}.assessment-crumb{color:#809487;font-size:12px;margin:0 0 23px}.assessment-demo{display:inline-block;color:#237453;background:#edf5ed;border:1px solid #cce2d1;padding:6px 10px;border-radius:5px;font-size:11px;font-weight:700}.assessment-page h1{font-size:31px;color:#163c2d;margin:12px 0}.assessment-page h2{font-size:18px}.assessment-intro,.assessment-card{background:#fff;border:1px solid #dce8de;border-radius:10px}.assessment-intro{max-width:1000px;padding:32px}.assessment-intro-stats{display:flex;gap:60px;border-top:1px solid #e1eae2;border-bottom:1px solid #e1eae2;padding:19px 0;margin:20px 0}.assessment-intro-stats strong{display:block;font-size:22px}.assessment-intro-stats small{font-size:11px;color:#879a8d}.assessment-intro ol{line-height:2;color:#627968;padding-left:20px}.assessment-primary{border:1px solid #167e5c;background:#167e5c;color:#fff;border-radius:6px;padding:10px 18px;font-weight:700}.assessment-title{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:20px}.assessment-title p{color:#829586;margin:0}.assessment-clock{background:#fff4d9;color:#9e6321;border:1px solid #eddaab;padding:14px 20px;border-radius:6px;white-space:nowrap}.assessment-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px}.assessment-question{padding:25px;min-height:620px;display:flex;flex-direction:column}.assessment-question-meta{display:flex;align-items:center;gap:22px;border-bottom:1px solid #e1ebe2;padding-bottom:16px}.assessment-question-meta strong{font-size:22px}.assessment-question-meta span{color:#7b9080}.assessment-question-meta button{border:0;background:none;color:#79927e;margin-left:auto}.assessment-question h2{font-size:19px;line-height:1.7;margin:30px 0}.assessment-options{display:grid;gap:11px}.assessment-options label{display:flex;gap:12px;align-items:center;border:1px solid #dfe9e1;border-radius:6px;padding:15px;cursor:pointer;line-height:1.6}.assessment-options label.chosen{border-color:#76bb91;background:#eef7f0}.assessment-options input{accent-color:#147e5c;width:17px;height:17px;flex:none}.assessment-help{color:#829587;margin:20px 0}.assessment-question-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;border-top:1px solid #e4eee6;padding-top:18px}.assessment-question-foot button:not(.assessment-primary),.assessment-review-actions button:not(.assessment-primary){border:1px solid #cfdfd2;border-radius:6px;background:#fff;color:#336d4d;padding:9px 13px}.assessment-question-foot span{color:#829486;font-size:12px}.assessment-nav{padding:23px;position:sticky;top:15px}.assessment-nav h2{margin:0 0 5px}.assessment-nav>p{font-size:12px;color:#809385}.assessment-counts{display:flex;justify-content:space-between;background:#f0f7f1;padding:12px;border-radius:5px;color:#1b7b58;font-size:12px;margin:20px 0}.assessment-counts b:last-child{color:#b36b50}.assessment-numbers{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.assessment-numbers button{height:38px;border:1px solid #cadbce;border-radius:5px;background:#fff;color:#4e6e58;position:relative}.assessment-numbers button.answered{background:#16805d;border-color:#16805d;color:#fff}.assessment-numbers button.current{outline:2px solid #cc8e3a;outline-offset:2px}.assessment-numbers button.marked:after{content:"";position:absolute;right:0;top:0;border-top:10px solid #dba052;border-left:10px solid transparent}.assessment-legend{border-top:1px solid #e4eee6;padding-top:18px}.assessment-wide{width:100%;margin-top:10px}.assessment-review,.assessment-result{padding:30px}.assessment-review>p{color:#708777}.assessment-review-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:22px 0}.assessment-review-grid button{display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #e1e9e2;border-radius:6px;background:#fff;padding:11px}.assessment-review-grid button.answered{background:#f2f9f4}.assessment-review-grid b{color:#157e58}.assessment-review-grid span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.assessment-review-grid small{color:#8f9f91;white-space:nowrap}.assessment-review-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:22px}.assessment-score{background:#eff7f0;padding:22px;border-radius:7px;margin:20px 0}.assessment-score strong{display:block;font-size:29px;color:#147e58}.assessment-score span{color:#68806e}.assessment-result details{border-top:1px solid #e4ece5;padding:12px 0}.assessment-result summary{display:flex;justify-content:space-between;gap:16px;cursor:pointer}.assessment-result summary span{line-height:1.5}.assessment-result summary b{font-size:11px;white-space:nowrap}.assessment-result summary b.correct{color:#16805d}.assessment-result summary b.incorrect{color:#b36a35}.assessment-result details p{color:#617c67;line-height:1.7;font-size:12px}.assessment-source{font-size:11px;color:#8b9d8e;line-height:1.7}.assessment-source a{display:inline-block;color:#257a57;margin-left:8px}@media(max-width:800px){.assessment-grid{grid-template-columns:1fr}.assessment-nav{position:static}.assessment-title{align-items:flex-start;flex-direction:column}.assessment-review-grid{grid-template-columns:1fr}}@media(max-width:550px){.assessment-shell{padding:15px}.assessment-page h1{font-size:23px}.assessment-question{padding:18px;min-height:0}.assessment-question-meta{gap:8px;flex-wrap:wrap}.assessment-question h2{font-size:16px}.assessment-intro{padding:20px}.assessment-intro-stats{gap:15px}.assessment-brand strong{font-size:13px}}
.assessment-grid>.assessment-question{margin:0;min-width:0;flex:initial}
</style>
