<script setup>
import { mindMap } from '../data/langchain-course.js'
</script>

<template>
  <section class="lc-panel lc-mind-panel" aria-labelledby="lc-mind-title">
    <div class="lc-section-head"><h2 id="lc-mind-title">思维导图</h2><span>点击“＋ / －”展开或折叠节点</span></div>
    <p class="mind-caption">依据课程讲义与视频目录组织为 4 个核心模块、19 个学习主题；具体教学内容仍以正式课程资料为准。</p>
    <div class="mind-scroll">
      <div class="mind-layout">
        <div class="mind-root"><strong>LangChain</strong><span>大模型应用开发</span></div>
        <div class="mind-groups">
          <details v-for="group in mindMap" :key="group.title" class="mind-group" open>
            <summary><span>{{ group.title }}</span><b aria-hidden="true"></b></summary>
            <div class="mind-topics">
              <details v-for="topic in group.topics" :key="topic.title" class="mind-topic" open>
                <summary><span>{{ topic.title }}</span><b aria-hidden="true"></b></summary>
                <ul><li v-for="leaf in topic.leaves" :key="leaf">{{ leaf }}</li></ul>
              </details>
            </div>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lc-mind-panel{overflow:hidden}.mind-caption{font-size:12px;color:#718b78;line-height:1.7;margin:0 0 22px}.mind-scroll{overflow-x:auto;padding:8px 3px 15px}.mind-layout{min-width:770px;display:grid;grid-template-columns:190px minmax(0,1fr);gap:35px;align-items:center}.mind-root{position:relative;border:1px solid #75b48f;background:#e7f4ea;border-radius:11px;padding:20px 15px;color:#165d40;display:flex;flex-direction:column;gap:5px}.mind-root:after{content:"";position:absolute;left:100%;top:50%;width:35px;border-top:2px solid #84ba94}.mind-root strong{font-size:21px}.mind-root span{font-size:12px}.mind-groups{position:relative;border-left:2px solid #8abd99;padding-left:24px;display:grid;gap:15px}.mind-group{position:relative;display:grid;grid-template-columns:250px minmax(0,1fr);gap:22px;align-items:start}.mind-group:before{content:"";position:absolute;left:-24px;top:22px;width:24px;border-top:2px solid #8abd99}.mind-group>summary{list-style:none;cursor:pointer;min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #cee4d2;background:#f0f8f1;border-radius:7px;color:#195b3d;font-weight:700;font-size:13px}.mind-group>summary::-webkit-details-marker,.mind-topic>summary::-webkit-details-marker{display:none}.mind-group>summary b,.mind-topic>summary b{width:17px;height:17px;border:1px solid #6ab28a;border-radius:50%;display:grid;place-items:center;color:#21865c;flex:none;font-size:13px;line-height:1}.mind-group>summary b:before,.mind-topic>summary b:before{content:"+"}.mind-group[open]>summary b:before,.mind-topic[open]>summary b:before{content:"−"}.mind-group:not([open]){display:block}.mind-group:not([open])>summary{width:250px}.mind-topics{display:grid;gap:9px;border-left:1px solid #a7c9ae;padding-left:17px}.mind-topic{position:relative}.mind-topic:before{content:"";position:absolute;left:-17px;top:17px;width:17px;border-top:1px solid #a7c9ae}.mind-topic>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#175c3e;font-weight:700;padding:6px 0;border-bottom:1px solid #9ac5a6;font-size:12px}.mind-topic ul{margin:4px 0 0 18px;padding:0 0 0 12px;border-left:1px solid #bad8bf;list-style:none}.mind-topic li{position:relative;font-size:11px;color:#496c55;line-height:1.6;padding:4px 0;border-bottom:1px solid #d7e9d9}.mind-topic li:before{content:"";position:absolute;left:-12px;top:13px;width:12px;border-top:1px solid #bad8bf}
</style>
