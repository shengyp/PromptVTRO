<script setup>
import { computed } from 'vue'
import { assessmentLevels, knowledgePoints } from '../data/langchain-course.js'
import { langchainLessons, langchainUnits } from '../data/langchain-topic.js'

const emit = defineEmits(['lesson', 'practice'])
const recommendations = computed(() => knowledgePoints.filter(point => ['基础薄弱', '部分掌握'].includes(point.level)))
function unitFor(point) { return langchainUnits.find(unit => unit.id === point.unitId) }
function lessonsFor(point) { return point.lessonIds.map(id => langchainLessons.find(lesson => lesson.id === id)).filter(Boolean) }
</script>

<template>
  <div class="personalized">
    <div class="personalized-heading"><div><h3>我的补学路径</h3><p>根据本次诊断示例，优先学习“基础薄弱”和“部分掌握”的知识点。</p></div><span>测验结果示例 · 非真实学生数据</span></div>
    <section class="personalized-summary" aria-label="知识点诊断示例">
      <strong>本次诊断覆盖 10 个知识点</strong><p>等级反映本次测评表现；没有充分作答记录时应显示“未测评”。</p>
      <div class="personalized-bar" aria-hidden="true"><i v-for="level in assessmentLevels" :key="level.name" :class="level.className" :style="{flex:level.count}"></i></div>
      <div class="personalized-levels"><div v-for="level in assessmentLevels" :key="level.name" :class="level.className"><b>{{String(level.count).padStart(2,'0')}}</b><span>{{level.name}}</span></div></div>
    </section>
    <div class="personalized-list-head"><h3>建议优先学习</h3><span>按课程学习顺序排列</span></div>
    <div class="personalized-cards">
      <article v-for="(point,index) in recommendations" :key="point.id" class="personalized-card">
        <div class="personalized-card-top"><small>{{String(index+1).padStart(2,'0')}}</small><h4>{{point.title}}</h4><em :class="point.level==='基础薄弱'?'weak':'partial'">{{point.level}}</em></div>
        <p><b>对应单元：</b>{{unitFor(point)?.title}}</p>
        <p><b>建议小节：</b>{{lessonsFor(point).map(lesson=>lesson.title).join('、')}}</p>
        <p><b>推荐依据：</b>本次诊断将该知识点标为“{{point.level}}”。</p>
        <p><b>补学后：</b>完成本单元章节练习，再复测。</p>
        <div class="personalized-actions"><button type="button" @click="emit('lesson',point.lessonIds[0])">进入建议小节 →</button><button type="button" @click="emit('practice',point.unitId)">章节练习</button></div>
      </article>
    </div>
    <details class="personalized-all"><summary>查看全部 10 个知识点及示例等级</summary><ol><li v-for="point in knowledgePoints" :key="point.id"><span>{{point.title}}</span><b :class="point.level==='基础薄弱'?'weak':point.level==='部分掌握'?'partial':'strong'">{{point.level}}</b></li></ol></details>
    <p class="personalized-caveat">当前为前端示例，尚未读取真实测验和学习记录。正式分级规则需要题库、作答证据及复测流程确认后接入。</p>
  </div>
</template>

<style scoped>
.personalized-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin:20px 0}.personalized-heading h3{font-size:18px;margin:0 0 7px;color:#183e2f}.personalized-heading p{font-size:12px;color:#6f8876;line-height:1.7;margin:0}.personalized-heading>span{color:#a8682a;background:#fff5e8;border:1px solid #efd7ba;border-radius:5px;font-size:10px;padding:6px 8px;white-space:nowrap}.personalized-summary{border:1px solid #dbeadd;background:#f8fbf8;border-radius:9px;padding:17px 19px}.personalized-summary strong{font-size:14px}.personalized-summary p{font-size:11px;color:#7d9382;margin:5px 0 12px}.personalized-bar{display:flex;gap:5px}.personalized-bar i{height:8px;border-radius:8px}.personalized-bar .weak{background:#dc8a7d}.personalized-bar .partial{background:#e5b16d}.personalized-bar .basic{background:#a1d2aa}.personalized-bar .applied{background:#279263}.personalized-levels{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}.personalized-levels>div{border:1px solid #e1ebe3;background:white;border-radius:6px;padding:8px;display:flex;align-items:baseline;gap:7px}.personalized-levels b{font-size:20px}.personalized-levels .weak b{color:#b15b50}.personalized-levels .partial b{color:#ae762b}.personalized-levels .basic b{color:#61996a}.personalized-levels .applied b{color:#17815d}.personalized-levels span{font-size:10px;color:#738a78}.personalized-list-head{display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin:23px 0 12px}.personalized-list-head h3{font-size:16px;margin:0}.personalized-list-head span{font-size:11px;color:#809686}.personalized-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.personalized-card{border:1px solid #deebe1;border-radius:8px;padding:15px;min-width:0;display:flex;flex-direction:column}.personalized-card-top{display:flex;align-items:center;gap:7px;margin-bottom:8px}.personalized-card-top small{font-size:11px;font-weight:700;color:#16835b;background:#eaf5ec;border-radius:4px;padding:4px}.personalized-card h4{font-size:13px;line-height:1.4;margin:0;flex:1}.personalized-card em,.personalized-all b{font-size:10px;font-style:normal;font-weight:500;border-radius:4px;padding:3px 6px;white-space:nowrap}.personalized-card em.weak,.personalized-all b.weak{background:#fff0eb;color:#a95042}.personalized-card em.partial,.personalized-all b.partial{background:#fff4e6;color:#aa7129}.personalized-all b.strong{background:#ecf6ed;color:#31805a}.personalized-card p{font-size:11px;line-height:1.65;color:#68806e;margin:2px 0}.personalized-card p b{color:#365c42}.personalized-actions{display:flex;gap:12px;margin-top:auto;padding-top:14px}.personalized-actions button{border:0;background:none;padding:0;color:#16815c;font-size:11px;font-weight:700}.personalized-actions button:last-child{color:#708d77}.personalized-all{border-top:1px solid #e4eee6;margin-top:20px;padding-top:14px}.personalized-all summary{cursor:pointer;color:#1b7c57;font-size:12px;font-weight:700}.personalized-all ol{margin:14px 0 0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.personalized-all li{display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid #e8eee9;border-radius:5px;padding:8px 10px;font-size:11px}.personalized-caveat{color:#899d8e;font-size:10px;line-height:1.7;margin:17px 0 0}@media(max-width:650px){.personalized-heading{flex-direction:column}.personalized-levels,.personalized-cards,.personalized-all ol{grid-template-columns:1fr 1fr}}@media(max-width:480px){.personalized-cards,.personalized-all ol{grid-template-columns:1fr}}
</style>
