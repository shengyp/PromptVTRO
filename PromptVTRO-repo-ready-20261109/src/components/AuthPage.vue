<script setup>
import { ref } from 'vue'
import { ArrowUpRight, Eye, EyeOff, BookOpen, LockKeyhole } from 'lucide-vue-next'
import { isDemoMode } from '../demo-api.js'
const props=defineProps({embedded:{type:Boolean,default:false},audience:{type:String,default:'student'},sessionReady:{type:Boolean,default:true},sessionError:{type:String,default:''}})
const emit=defineEmits(['authenticated','retry'])
const requestedRole=ref('student')
const mode=ref('login'),username=ref(''),password=ref(''),confirm=ref(''),displayName=ref(''),show=ref(false),busy=ref(false),error=ref('')
function switchMode(value) { mode.value=value;password.value='';confirm.value='';error.value='' }
function enterDemo(role) { mode.value='login'; username.value=role; password.value='demo'; submit() }
async function submit() {
 if(busy.value || !props.sessionReady)return
 error.value=''
 if(mode.value==='register' && password.value!==confirm.value) {error.value='两次输入的密码不一致';return}
 busy.value=true
 try {
  const response=await fetch(`/api/auth/${mode.value}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value,password:password.value,...(mode.value==='register'?{displayName:displayName.value,requestedRole:requestedRole.value}:{})})})
  const data=(response.headers.get('content-type')||'').includes('application/json')?await response.json().catch(()=>({})):{}
  if(!response.ok) throw new Error(data.error || `服务请求失败（HTTP ${response.status}）`)
  password.value='';confirm.value='';emit('authenticated',data.user)
 } catch(e) {error.value=e instanceof TypeError?'暂时无法连接服务，请稍后再试':e.message} finally {busy.value=false}
}
</script>

<template>
 <div class="auth-page" :class="{'auth-page--embedded':embedded}">
  <section v-if="!embedded" class="auth-story">
   <div class="auth-brand"><img src="/swu-logo.svg" alt="西南大学校徽"/><span>教育数字化领域大模型<small>DIGITAL EDUCATION</small></span></div>
   <div class="auth-story-body"><span class="auth-kicker">教 · 学 · 研</span><h1>让每一次探索，<br/>成为成长的起点。</h1><p>从一个问题出发，连接教学灵感、学习思考与教育研究。</p><div class="auth-story-topics"><span>教学设计</span><span>启发辅导</span><span>教育研究</span></div></div>
   <div class="auth-story-footer"><BookOpen :size="18"/> 为教育而生，与智慧同行</div>
  </section>
  <section class="auth-form-area">
   <div class="auth-form-wrap">
    <div v-if="isDemoMode" class="demo-login"><strong>前端演示模式</strong><p>无需后端或模型。选择身份查看界面，演示操作不会保存到服务器。</p><div><button type="button" @click="enterDemo('student')">学生端</button><button type="button" @click="enterDemo('teacher')">教师端</button><button type="button" @click="enterDemo('admin')">管理端</button></div></div>
    <template v-if="embedded"><span class="auth-step">师生统一登录</span><h2>{{mode==='login'?(audience==='teacher'?'教师登录':'学生登录'):'创建你的账号'}}</h2><p class="auth-description">学生与教师使用现有账号登录，进入对应工作台。</p></template>
    <template v-else><span class="auth-step">欢迎来到教育数字化领域大模型</span><h2>{{mode==='login'?'欢迎回来':'创建你的账号'}}</h2><p class="auth-description">{{mode==='login'?'师生统一登录，自动进入对应工作台。':'选择你的身份，开启教学与学习探索。'}}</p></template>
    <div class="auth-tabs" aria-label="账号操作"><button :disabled="busy" :aria-pressed="mode==='login'" :class="{active:mode==='login'}" @click="switchMode('login')">登录</button><button :disabled="busy" :aria-pressed="mode==='register'" :class="{active:mode==='register'}" @click="switchMode('register')">注册</button></div>
    <div v-if="!sessionReady" class="auth-session-warning" role="status">{{sessionError || '正在检查登录服务…'}}<button v-if="sessionError" type="button" @click="emit('retry')">重试</button></div>
    <form @submit.prevent="submit">
     <fieldset class="auth-form-fields" :disabled="!sessionReady">
     <fieldset v-if="mode==='register'" class="role-choice"><legend>使用身份</legend><label><input v-model="requestedRole" type="radio" value="student" :disabled="busy"/> 学生</label><label><input v-model="requestedRole" type="radio" value="teacher" :disabled="busy"/> 教师</label><p>请按实际身份选择，注册后即进入对应功能。</p></fieldset>
     <label v-if="mode==='register'" class="auth-field">昵称<input v-model="displayName" autocomplete="nickname" maxlength="30" required placeholder="怎么称呼你？" :disabled="busy"/></label>
     <label class="auth-field">账号<input v-model="username" autocomplete="username" required minlength="3" maxlength="32" pattern="[a-zA-Z0-9_]{3,32}" placeholder="3–32位英文字母、数字或下划线" :disabled="busy" autocapitalize="none" :spellcheck="false"/></label>
     <label class="auth-field">密码<div class="auth-password"><input v-model="password" :type="show?'text':'password'" :autocomplete="mode==='login'?'current-password':'new-password'" :minlength="mode==='register'?12:1" maxlength="128" required :placeholder="mode==='register'?'至少12个字符，可使用一段容易记住的短语':'请输入密码'" :disabled="busy"/><button type="button" :aria-label="show?'隐藏密码':'显示密码'" :aria-pressed="show" @click="show=!show"><EyeOff v-if="show" :size="18"/><Eye v-else :size="18"/></button></div></label>
     <label v-if="mode==='register'" class="auth-field">确认密码<input v-model="confirm" :type="show?'text':'password'" autocomplete="new-password" required minlength="12" maxlength="128" placeholder="再次输入密码" :disabled="busy"/></label>
     <p v-if="error" class="auth-error" role="alert">{{error}}</p>
     <button class="auth-submit" type="submit" :disabled="busy">{{busy?'正在处理…':mode==='login'?'登录并开始探索':'注册并开始使用'}}<ArrowUpRight v-if="!busy" :size="18"/></button>
     </fieldset>
    </form>
    <p class="auth-privacy"><LockKeyhole :size="14"/> 对话保存在你的账号下，登录后即可继续。</p>
   </div>
   <footer v-if="!embedded">教育数字化领域大模型 · 让知识连接，让学习发生</footer>
  </section>
 </div>
</template>

<style scoped>
.demo-login{padding:14px 16px;margin-bottom:20px;border:1px solid #bcdcca;border-radius:9px;background:#f1f8f3;color:#315d48;font-size:14px}.demo-login p{margin:7px 0 12px;line-height:1.6}.demo-login>div{display:flex;gap:8px;flex-wrap:wrap}.demo-login button{padding:8px 11px;border:1px solid #8bbda1;border-radius:7px;background:#fff;color:#126f56}.demo-login button:hover{background:#e3f1e8}
.role-choice{border:1px solid #dce6df;border-radius:8px;padding:14px;font-size:14px}.role-choice label{display:inline-flex;gap:5px;margin-right:20px}.role-choice p{line-height:1.7;color:#72847b;margin-bottom:0}
.auth-page{margin:0;display:grid;grid-template-columns:minmax(360px, .95fr) minmax(440px,1.05fr);min-height:100dvh;background:#fff}.auth-story{background:#123e35;color:#e8f2eb;padding:48px clamp(32px,5vw,80px);display:flex;flex-direction:column}.auth-brand{display:flex;align-items:center;gap:14px;font-size:20px;font-weight:600}.auth-brand img{width:54px;height:54px;border-radius:50%;background:white}.auth-brand small{display:block;font-size:10px;letter-spacing:2px;font-weight:400;color:#92b8a8;margin-top:7px}.auth-story-body{margin:auto 0;padding:80px 0}.auth-kicker{font-size:14px;letter-spacing:8px;color:#91bba6}.auth-story h1{font-size:clamp(30px,3.4vw,48px);font-weight:500;color:#f4faf5;line-height:1.6;letter-spacing:1px;margin:22px 0}.auth-story p{max-width:350px;color:#b2cdbd;line-height:2;font-size:16px}.auth-story-topics{display:flex;gap:20px;margin-top:38px;font-size:14px;color:#bed7c6}.auth-story-topics span+span{border-left:1px solid #537667;padding-left:20px}.auth-story-footer{display:flex;align-items:center;gap:10px;color:#9dbdad;font-size:13px}.auth-form-area{display:flex;flex-direction:column;align-items:center;padding:40px 36px 20px}.auth-form-wrap{width:100%;max-width:410px;margin:auto 0;padding:35px 0}.auth-step{font-size:12px;letter-spacing:1px;color:#849b8c}.auth-form-wrap h2{font-size:30px;margin:18px 0 12px;color:#27483a}.auth-description{font-size:14px;color:#819085;line-height:1.8;margin-bottom:25px}.auth-tabs{display:flex;border-bottom:1px solid #e0e9e2;margin-bottom:26px;gap:30px}.auth-tabs button{padding:12px 4px;font-size:15px;color:#809487;border-bottom:2px solid transparent}.auth-tabs .active{color:#147c61;border-color:#147c61;font-weight:600}.auth-field{display:block;font-size:14px;color:#4b6555;margin:18px 0}.auth-field input{font:inherit;width:100%;height:48px;padding:0 14px;border:1px solid #dce6df;border-radius:8px;background:#fbfcfb;color:#2e4b3a;outline:none;display:block;margin-top:9px}.auth-field input:focus{border-color:#278d6d;box-shadow:0 0 0 3px #26856510}.auth-field input::placeholder{color:#a0ada5;font-size:13px}.auth-password{position:relative}.auth-password input{padding-right:44px}.auth-password button{position:absolute;right:8px;top:12px;color:#819789;display:flex;padding:4px}.auth-submit{width:100%;background:#147d65;color:white;border-radius:8px;display:flex;justify-content:center;align-items:center;gap:12px;height:49px;margin-top:28px;font-size:15px;font-weight:500}.auth-submit:hover{background:#106c56}.auth-submit:disabled{opacity:.6;cursor:wait}.auth-error{color:#ab4435;background:#fff2ef;padding:12px;border-radius:7px;font-size:14px;line-height:1.7}.auth-privacy{display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;color:#90a194;margin-top:22px}.auth-form-area footer{margin-top:30px;line-height:1.8;text-align:center}@media(max-width:800px){.auth-page{grid-template-columns:1fr}.auth-story{padding:24px}.auth-brand{font-size:18px}.auth-brand img{width:42px;height:42px}.auth-story-body,.auth-story-footer{display:none}.auth-form-area{padding:25px 24px;min-height:calc(100dvh - 92px)}.auth-form-wrap{padding:8px 0}.auth-form-wrap h2{font-size:27px}}
.auth-form-fields{border:0;padding:0;margin:0;min-width:0}.auth-form-fields:disabled{opacity:.55}.auth-session-warning{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #ead9ad;border-radius:8px;background:#fffaf0;color:#805e22;font-size:12px;line-height:1.5}.auth-session-warning button{white-space:nowrap;color:#147d65;text-decoration:underline}.auth-page--embedded{display:block;min-height:0;width:100%;background:transparent}.auth-page--embedded .auth-form-area{display:block;padding:0}.auth-page--embedded .auth-form-wrap{max-width:none;margin:0;padding:0}.auth-page--embedded .auth-form-wrap h2{font-size:26px;margin:10px 0 8px}.auth-page--embedded .auth-description{margin-bottom:14px}.auth-page--embedded .auth-tabs{margin-bottom:16px}.auth-page--embedded .auth-field{margin:12px 0}.auth-page--embedded .auth-submit{margin-top:18px}
</style>
