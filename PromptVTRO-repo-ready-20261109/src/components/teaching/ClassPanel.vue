<script setup>
import { ref,onMounted } from 'vue'
import { useTeaching } from './useTeaching'
const props=defineProps({api:Function,teacher:Boolean})
const {busy,error,notice,request,all,run}=useTeaching(props.api)
const classes=ref([]),title=ref(''),inviteCode=ref(''),members=ref(null),selected=ref('')
const load=async()=>{classes.value=await all('/classes')}
function save(){run(async()=>{await request(props.teacher?'/classes':'/classes/join','POST',props.teacher?{title:title.value}:{inviteCode:inviteCode.value.trim()});title.value='';inviteCode.value='';await load()},props.teacher?'班级已创建，可将邀请码发给学生。':'已加入班级。')}
function showMembers(c){run(async()=>{members.value=await all(`/classes/${c.id}/members`);selected.value=c.title})}
onMounted(()=>run(load))
</script>
<template><section><div class="work-heading"><div><h2>{{teacher?'班级管理':'我的班级'}}</h2><p>{{teacher?'创建班级，将作业发布给你的学生。':'输入教师提供的邀请码，加入班级并接收作业。'}}</p></div><button class="work-button" :disabled="busy" @click="run(load)">刷新</button></div><p v-if="error" class="work-error" role="alert">{{error}}</p><p v-if="notice" class="work-notice" role="status">{{notice}}</p><p v-if="busy" role="status">正在处理…</p><form class="work-inline work-card" @submit.prevent="save"><label>{{teacher?'班级名称':'班级邀请码'}}<input v-if="teacher" v-model="title" required maxlength="150" placeholder="例如：教育技术 2026 级一班"/><input v-else v-model="inviteCode" required maxlength="24" placeholder="教师提供的 24 位邀请码"/></label><button class="work-primary" :disabled="busy">{{teacher?'创建班级':'加入班级'}}</button></form><div v-if="!classes.length&&!busy" class="work-empty">{{teacher?'还没有班级，从上方创建第一个班级。':'还没有加入班级。加入后，在“作业管理”中查看任务。'}}</div><div class="work-card-list"><article v-for="c in classes" :key="c.id" class="work-card"><h3>{{c.title}}</h3><template v-if="teacher"><p class="work-muted">班级邀请码</p><code class="invite-code">{{c.inviteCode}}</code><button class="work-button" :disabled="busy" @click="showMembers(c)">查看成员</button></template><p v-else class="work-muted">已加入</p></article></div><section v-if="members" class="work-card"><h3>{{selected}} · 班级成员（{{members.length}}）</h3><p v-if="!members.length">暂无学生加入。</p><ul v-else><li v-for="m in members" :key="m.id">{{m.displayName}}</li></ul></section></section></template>
