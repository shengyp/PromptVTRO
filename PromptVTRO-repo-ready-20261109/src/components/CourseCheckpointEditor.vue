<script setup>
import { computed, ref, watch } from 'vue'
import { Plus, Sparkles } from 'lucide-vue-next'

const props = defineProps({api:Function,video:Object,courseId:String})
const emit = defineEmits(['refresh'])
const checkpoints = computed(()=>props.video?.checkpoints || [])
const empty = () => ({fraction:0.75,question:'',options:['','','',''],answerIndex:0,explanation:'',status:'draft'})
const form = ref(empty()), editingId = ref(null), editingSource = ref('manual'), editingBasis = ref('manual')
const material = ref(''), reviewed = ref(false), busy = ref(false), error = ref(''), notice = ref('')
watch(()=>props.video?.id,()=>{form.value=empty();editingId.value=null;editingSource.value='manual';editingBasis.value='manual';material.value='';error.value='';notice.value='';reviewed.value=false})
function fresh(){form.value=empty();editingId.value=null;editingSource.value='manual';editingBasis.value='manual';reviewed.value=false;error.value='';notice.value=''}
function edit(item){form.value={fraction:item.fraction,question:item.question,options:[...item.options],answerIndex:item.answerIndex,explanation:item.explanation,status:item.status};editingId.value=item.id;editingSource.value=item.source;editingBasis.value=item.basis;reviewed.value=false;error.value='';notice.value=''}
async function run(fn){busy.value=true;error.value='';notice.value='';try{await fn()}catch(e){error.value=e.message}finally{busy.value=false}}
function save(){run(async()=>{
 if(form.value.status==='published' && editingSource.value==='ai' && editingBasis.value==='title' && !reviewed.value) throw new Error('请先核对仅凭标题生成的题目，再勾选确认。')
 const path=`/courses/${props.courseId}/checkpoints${editingId.value?'/'+editingId.value:''}`
 const method=editingId.value?'PUT':'POST'
 const body={...form.value,videoId:props.video.id}
 const result=await props.api(path,{method,body:JSON.stringify(body)})
 if(!editingId.value) {
  editingId.value=result.id
  if(form.value.status==='published') await props.api(`/courses/${props.courseId}/checkpoints/${result.id}`,{method:'PUT',body:JSON.stringify(form.value)})
 }
 notice.value=form.value.status==='published'?'已发布，学生观看视频时会看到这道题。':'草稿已保存，学生暂时看不到。'
 emit('refresh')
})}
function generate(){run(async()=>{
 const result=await props.api(`/courses/${props.courseId}/checkpoints/ai-draft`,{method:'POST',body:JSON.stringify({videoId:props.video.id,material:material.value})})
 editingId.value=result.id;editingSource.value='ai';editingBasis.value=result.basis;reviewed.value=false
 form.value={fraction:result.fraction,question:result.question,options:[...result.options],answerIndex:result.answerIndex,explanation:result.explanation,status:'draft'}
 notice.value=result.basis==='title'?'仅根据视频标题生成了草稿，请先核对内容，再决定是否发布。':'模型已根据提供的文字生成草稿，请核对后发布。'
 emit('refresh')
})}
function remove(){if(!editingId.value)return;run(async()=>{await props.api(`/courses/${props.courseId}/checkpoints/${editingId.value}`,{method:'DELETE'});fresh();notice.value='已删除互动题。';emit('refresh')})}
</script>

<template>
 <section class="checkpoint-editor">
  <div class="course-chat-heading"><div><h2>视频互动题</h2><p>教师可预设题目，或让模型生成草稿。只有发布的题目会在播放途中弹出。</p></div></div>
  <div class="checkpoint-existing"><button v-for="item in checkpoints" :key="item.id" :class="{active:editingId===item.id}" @click="edit(item)"><strong>{{item.question}}</strong><small>{{item.status==='published'?'已发布':'草稿'}} · {{item.source==='ai'?'模型生成':'教师预设'}} · {{Math.round(item.fraction*100)}}%</small></button><p v-if="!checkpoints.length" class="course-muted">这段视频还没有互动题。</p></div>
  <button type="button" class="course-back" @click="fresh"><Plus :size="16"/> 新增教师预设题</button>
  <p v-if="error" class="course-alert" role="alert">{{error}}</p><p v-if="notice" class="work-notice" role="status">{{notice}}</p>
  <div class="checkpoint-editor-grid"><form @submit.prevent="save"><h3>{{editingId?'编辑互动题':'新建互动题'}}</h3><label>播放到多少进度时提问 <input v-model.number="form.fraction" type="number" min="0.1" max="0.95" step="0.05" required/> <small>输入 0.75 表示播放到 75% 时暂停提问</small></label><label>题目 <textarea v-model="form.question" maxlength="1000" required rows="3" placeholder="请输入与视频内容一致的单选题"/></label><label v-for="(_,index) in form.options" :key="index">选项 {{String.fromCharCode(65+index)}} <input v-model="form.options[index]" maxlength="250" required/></label><label>正确选项 <select v-model.number="form.answerIndex"><option v-for="(_,index) in form.options" :key="index" :value="index">{{String.fromCharCode(65+index)}}</option></select></label><label>答对后的解析 <textarea v-model="form.explanation" maxlength="2000" rows="2"/></label><label>状态 <select v-model="form.status"><option value="draft">保存草稿</option><option value="published">发布给学生</option></select></label><label v-if="form.status==='published' && editingSource==='ai' && editingBasis==='title'" class="checkpoint-review"><input v-model="reviewed" type="checkbox"/> 我已对照视频核对题目与答案</label><div class="checkpoint-actions"><button class="work-primary" type="submit" :disabled="busy">{{busy?'处理中…':form.status==='published'?'确认并发布':'保存草稿'}}</button><button v-if="editingId" class="work-danger" type="button" :disabled="busy" @click="remove">删除题目</button></div></form>
   <div class="checkpoint-ai"><h3><Sparkles :size="18"/> 模型辅助出题</h3><p>可填写这段视频的知识点、教学提纲或字幕文字。留空时模型只能根据标题生成通用草稿，需要教师重点核对。</p><label>视频内容摘要（选填）<textarea v-model="material" rows="8" maxlength="15000" placeholder="例如：本视频讲解了……重点比较……"/></label><button class="work-primary" type="button" :disabled="busy" @click="generate"><Sparkles :size="16"/> {{busy?'正在生成…':'生成一道草稿题'}}</button></div></div>
 </section>
</template>
