import { ref } from 'vue'

export function useTeaching(api) {
 const busy=ref(false),error=ref(''),notice=ref('')
 const request=(path,method='GET',body)=>api('/teaching'+path,{method,...(body!==undefined?{body:JSON.stringify(body)}:{})})
 async function all(path){const items=[];let page=1;while(true){const result=await request(`${path}${path.includes('?')?'&':'?'}page=${page}&pageSize=100`);items.push(...result.items);if(items.length>=result.total||!result.items.length)break;page++}return items}
 async function run(fn,message=''){if(busy.value)return;busy.value=true;error.value='';notice.value='';try{await fn();if(message)notice.value=message}catch(e){error.value=e.message||'操作失败，请稍后重试'}finally{busy.value=false}}
 return {busy,error,notice,request,all,run}
}
export const copy=value=>JSON.parse(JSON.stringify(value))
export const dateLabel=value=>value?new Date(value).toLocaleString('zh-CN',{hour12:false}):'—'
export const statusLabel=value=>({draft:'草稿',published:'进行中',closed:'已关闭',submitted:'已提交',graded:'已批改'}[value]||value)
