<script setup>
import { ref,computed,watch,nextTick } from 'vue'
import FeatureLanding from './FeatureLanding.vue'
import ClassPanel from './teaching/ClassPanel.vue'
import ContentPanel from './teaching/ContentPanel.vue'
import AssignmentPanel from './teaching/AssignmentPanel.vue'
import GraphPanel from './teaching/GraphPanel.vue'
import './teaching/workspace.css'
const props=defineProps({api:Function,user:Object,activeTab:{type:String,default:'assignments'}})
const teacher=computed(()=>props.user.role==='teacher')
const tab=computed(()=>props.activeTab),practiceId=ref('')
const showTool=ref(false),toolArea=ref(null)
watch(tab,value=>{
 if(practiceId.value && value==='questions') { showTool.value=true; return }
 showTool.value=false
 practiceId.value=''
})
const emit=defineEmits(['change-tab','ask'])
function practice(id){practiceId.value=id;emit('change-tab','questions')}
async function openTool(){showTool.value=true;await nextTick();toolArea.value?.scrollIntoView({behavior:'smooth',block:'start'})}
</script>
<template><section class="teaching-workspace feature-page"><FeatureLanding :key="tab" :active-tab="tab" :teacher="teacher" @ask="emit('ask',$event)" @open-tool="openTool"/><div v-if="showTool" ref="toolArea" class="feature-tool-area"><ClassPanel v-if="tab==='classes'" :api="api" :teacher="teacher"/><AssignmentPanel v-else-if="tab==='assignments'" :api="api" :teacher="teacher"/><GraphPanel v-else-if="tab==='graphs'" :api="api" :teacher="teacher" @practice="practice"/><ContentPanel v-else :key="tab" :api="api" :teacher="teacher" :kind="tab" :initial-id="practiceId"/></div></section></template>
