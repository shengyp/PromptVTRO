<script setup>
const props=defineProps({question:Object,modelValue:[String,Array],disabled:Boolean,name:String})
const emit=defineEmits(['update:modelValue'])
function toggle(index,checked){const old=Array.isArray(props.modelValue)?props.modelValue:[];emit('update:modelValue',props.question.type==='single'?[index]:checked?[...old,index]:old.filter(i=>i!==index))}
</script>
<template><label v-if="question.type==='short'">你的回答<textarea :value="modelValue||''" :disabled="disabled" maxlength="6000" @input="emit('update:modelValue',$event.target.value)"/></label><div v-else class="work-options"><label v-for="(option,index) in question.options" :key="index"><input :type="question.type==='single'?'radio':'checkbox'" :name="name" :checked="Array.isArray(modelValue)&&modelValue.includes(index)" :disabled="disabled" @change="toggle(index,$event.target.checked)"/><span>{{String.fromCharCode(65+index)}}. {{option}}</span></label></div></template>
