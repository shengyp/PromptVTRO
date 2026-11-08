<script setup>
import { computed, ref } from 'vue'
import { ArrowUp, BookOpen, Compass, FileText, GraduationCap, Lightbulb, Sparkles } from 'lucide-vue-next'
const props=defineProps({activeTab:String,teacher:Boolean})
const emit=defineEmits(['ask','open-tool'])
const draft=ref('')
const scenes={
 assignments:{icon:FileText,teacher:['作业管理','从布置到批改，让每一次练习都有反馈。','请帮我设计一份关于“翻转课堂”的课后作业，适合教育数字化专业本科生。','作业目标、任务说明和评价建议'],student:['我的作业','查看课堂任务，完成作答，读懂教师反馈。','我正在完成翻转课堂主题的作业，应该怎样梳理自己的思路？','知识点梳理和分步思考提示']},
 questions:{icon:BookOpen,teacher:['题库管理','围绕知识点组织题目与解析。','请围绕 ADDIE 教学设计模型设计一道单选题，并给出答案和解析。','题干、选项、参考答案和解析'],student:['自主练习','从一道题出发，逐步掌握教育数字化知识。','请出一道关于形成性评价的练习题，先不要告诉我答案。','练习题与后续解析']},
 papers:{icon:FileText,teacher:['试卷管理','从已有题库选题，组合课堂测评。','我要设计一份教育数字化导论测验，应该如何安排题型和分值？','试卷结构和分值分配建议']},
 lessons:{icon:Lightbulb,teacher:['教学设计','把教学目标、活动与评价串成完整课堂。','请设计一节 45 分钟的“混合式学习”课程，面向教育数字化专业一年级学生。','教学目标、重难点、活动流程与评价建议']},
 graphs:{icon:Compass,teacher:['知识图谱','看见概念之间的联系，组织教学路径。','请解释建构主义、协作学习与项目式学习之间有什么联系。','概念关系说明和课堂应用例子'],student:['知识图谱','沿着知识之间的联系，建立自己的理解。','我已经学过行为主义，接下来理解建构主义时该注意什么？','概念对比和进一步学习的线索']},
 classes:{icon:GraduationCap,teacher:['班级管理','管理班级成员和教学活动。','如何给新建的教育数字化课程班级安排第一次学习任务？','班级活动与任务安排建议'],student:['我的班级','加入班级，查看老师发布的学习任务。','刚加入教育数字化课程班级，我应该如何安排第一周的学习？','入门学习建议']}
}
const scene=computed(()=>scenes[props.activeTab] || scenes.assignments)
const content=computed(()=>scene.value[props.teacher?'teacher':'student'] || scenes.assignments.student)
function ask(){if(draft.value.trim())emit('ask',draft.value.trim())}
</script>
<template><div class="feature-landing"><div class="feature-topline">{{content[0]}}</div><div class="feature-stage"><div class="feature-hero"><span class="feature-hero-icon"><component :is="scene.icon" :size="30"/></span><span class="feature-kicker">教育数字化领域大模型 · 智能助手</span><h1>你好，我是{{content[0]}}助手</h1><p>{{content[1]}}</p></div><div class="feature-demo"><div class="feature-demo-heading"><Sparkles :size="16"/> 试试这样提问</div><button class="feature-example" @click="draft=content[2]"><span>{{content[2]}}</span><small>点击填入输入框</small></button><p class="feature-output"><strong>你将获得</strong>{{content[3]}}</p></div><form class="feature-composer" @submit.prevent="ask"><textarea v-model="draft" :aria-label="`向${content[0]}助手提问`" :placeholder="`向${content[0]}助手提问，或点击上方示例…`" rows="2" maxlength="6000" @keydown.enter.exact.prevent="ask"/><div class="feature-composer-actions"><span>Enter 发送 · Shift + Enter 换行</span><button type="submit" :disabled="!draft.trim()" aria-label="发送到智能问答"><ArrowUp :size="20"/></button></div></form><button class="feature-open-tool" @click="emit('open-tool')">打开{{content[0]}}功能 <span>↓</span></button></div></div></template>
