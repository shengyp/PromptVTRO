<script setup>
import { nextTick, ref } from 'vue'
import { MessageSquare, Send } from 'lucide-vue-next'

const props = defineProps({api:Function,video:Object})
const emit = defineEmits(['conversation-created','answered'])
const draft = ref(''), messages = ref([]), busy = ref(false), error = ref(''), sessionId = ref(null), input = ref(null), log = ref(null)

async function prefill(value) {
 draft.value = value
 await nextTick()
 input.value?.focus()
 input.value?.scrollIntoView({behavior:'smooth',block:'center'})
}
defineExpose({prefill})

async function send() {
 const question = draft.value.trim()
 if (!question || busy.value) return
 busy.value = true; error.value = ''
 try {
  if (!sessionId.value) {
   const session = await props.api('/conversations',{method:'POST',body:JSON.stringify({title:`课程助教：${props.video.title}`.slice(0,100)})})
   sessionId.value = session.id
   emit('conversation-created')
  }
  draft.value = ''
  messages.value.push({role:'user',text:question})
  messages.value.push({role:'assistant',text:'',pending:true})
  const reply = messages.value.at(-1)
  const context = `我正在学习《教育网络技术》课程的“${props.video.title}”视频。请基于我提供的问题解释概念并给出思考提示；你没有观看视频，请不要编造视频中的具体讲述。我的问题：${question}`
  const response = await fetch(`/api/conversations/${sessionId.value}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:context,think:false}),signal:AbortSignal.timeout(600000)})
  if (!response.ok) { const data = await response.json(); throw new Error(data.error || '课程助教暂时无法回答') }
  const reader = response.body.getReader(), decoder = new TextDecoder()
  let buffer = '', completed = false
  function consume(line) {
   if (!line.trim()) return
   const frame = JSON.parse(line)
   if (frame.error) throw new Error(frame.error)
   reply.text += frame.message?.content || ''
   if (frame.done) completed = true
  }
  while (true) {
   const part = await reader.read()
   buffer += part.done ? decoder.decode() : decoder.decode(part.value,{stream:true})
   const lines = buffer.split('\n'); buffer = lines.pop()
   lines.forEach(consume)
   await nextTick()
   log.value?.scrollTo({top:log.value.scrollHeight})
   if (part.done) break
  }
  consume(buffer)
  if (!completed) throw new Error('回答中断，请重试')
  if (!reply.text) reply.text = '本次没有生成内容，请重试。'
  emit('answered')
 } catch (e) {
  error.value = e.name === 'TimeoutError' ? '回答超时，请重试。' : e.message
  const last = messages.value.at(-1)
  if (last?.role === 'assistant') last.text ||= '暂时无法回答，请稍后重试。'
  if (!draft.value) draft.value = question
 } finally {
  const last = messages.value.at(-1)
  if (last?.role === 'assistant') last.pending = false
  busy.value = false
 }
}
</script>

<template>
 <section class="course-chat" aria-label="课程大模型助教">
  <div class="course-chat-heading"><span class="card-icon green"><MessageSquare :size="22"/></span><div><h2>课程大模型助教</h2><p>看不懂视频或答错题时，在这里提问。我会解释概念并给出思考提示。</p></div></div>
  <div v-if="messages.length" ref="log" class="course-chat-log" aria-live="polite"><article v-for="(message,index) in messages" :key="index" :class="['course-chat-message',message.role]"><strong>{{message.role==='user'?'我':'课程助教'}}</strong><p>{{message.text || (message.pending?'正在思考…':'')}}</p></article></div>
  <p v-if="error" class="course-alert" role="alert">{{error}}</p>
  <form class="course-chat-form" @submit.prevent="send"><textarea ref="input" v-model="draft" rows="2" maxlength="5000" aria-label="向课程助教提问" placeholder="例如：这个知识点是什么意思？我为什么会选错？" @keydown.enter.exact.prevent="send"/><button type="submit" :disabled="busy || !draft.trim()"><Send :size="17"/> {{busy?'回答中…':'发送问题'}}</button></form>
  <small>大模型回答仅供学习参考，请结合视频与教师材料核对。</small>
 </section>
</template>
