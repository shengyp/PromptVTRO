// File names were transcribed from the user's Baidu Netdisk share on 2026-11-06.
// They identify lessons; the share URL is not a direct video stream.
export const langchainShareUrl = 'https://pan.baidu.com/s/1SdE45jtroKHs03vhUHyy9g?pwd=qphx'

function makeLessons(day, entries) {
  return entries.map(([fileName, title], index) => ({
    id: day + '-' + String(index + 1).padStart(2, '0'),
    day,
    fileName,
    title,
    netdiskPath: '15_尚硅谷大模型技术之LangChain / 4.视频 / ' + day + ' / ' + fileName,
  }))
}

const day01 = makeLessons('day01', [
  ['01-langchain概述.mp4', 'LangChain 概述'],
  ['02-langchain核心包以及组件.mp4', '核心包与组件'],
  ['03-环境创建.mp4', '环境创建'],
  ['04-api_配置.mp4', 'API 配置'],
  ['05-ChatCompletion.mp4', 'ChatCompletion'],
  ['06-ResponseAPI.mp4', 'Response API'],
  ['07-langchain_api.mp4', 'LangChain API'],
  ['08-openai_package.mp4', 'OpenAI Package'],
  ['09-langchain构建对象传递消息.mp4', '构建对象与传递消息'],
  ['10-调用方法.mp4', '调用方法'],
  ['11-复习回顾.mp4', '复习回顾'],
  ['12调用ollama-api.mp4', '调用 Ollama API'],
  ['13-使用prompt结构化模型输出.mp4', '使用 Prompt 结构化模型输出'],
  ['14-大模型厂商能力解析输出结果.mp4', '解析模型输出结果'],
  ['15-提示词模板.mp4', '提示词模板'],
  ['16-chains-runnable.mp4', 'Chains 与 Runnable'],
  ['17-问题说明.mp4', '问题说明'],
])

const day02 = makeLessons('day02', [
  ['01-复习回顾.mp4', '复习回顾'],
  ['02-RAG回顾.mp4', 'RAG 回顾'],
  ['03-markdown加载.mp4', 'Markdown 加载'],
  ['04-markdown优化.mp4', 'Markdown 加载优化'],
  ['05-word加载.mp4', 'Word 加载'],
  ['06-pdf加载.mp4', 'PDF 加载'],
  ['07-问题说明.mp4', '问题说明'],
  ['08-上午内容回顾.mp4', '上午内容回顾'],
  ['09-递归分隔符切分.mp4', '递归分隔符切分'],
  ['10-嵌入模型做文本嵌入.mp4', '嵌入模型与文本嵌入'],
  ['11-稠密向量和稀疏向量.mp4', '稠密向量与稀疏向量'],
  ['12-索引-稠密稀疏（HNSW）.mp4', '向量索引与 HNSW'],
  ['13milvus部署(上).mp4', 'Milvus 部署（上）'],
  ['14-collection构建.mp4', '构建 Collection'],
  ['15-添加数据.mp4', '添加数据'],
])

const day03 = makeLessons('day03', [
  ['01-复习回顾和删除数据.mp4', '复习回顾与删除数据'],
  ['02-稠密向量检索.mp4', '稠密向量检索'],
  ['03-向量检索.mp4', '向量检索'],
  ['04-标量检索+生成.mp4', '标量检索与生成'],
  ['05-openai_function_call.mp4', 'OpenAI Function Call'],
  ['06-稀疏检索问题说明.mp4', '稀疏检索问题说明'],
  ['07-langchain工具调用.mp4', 'LangChain 工具调用'],
  ['08-复习回顾+agent工具调用.mp4', 'Agent 工具调用'],
  ['09-mcp原理以及stdio协议.mp4', 'MCP 原理与 stdio 协议'],
  ['10-streamable_http_mcp.mp4', 'Streamable HTTP MCP'],
  ['11-langchian-mcp.mp4', 'LangChain 与 MCP'],
  ['12-langchain-mcp问题解决.mp4', 'LangChain MCP 问题解决'],
  ['13-agent-memory.mp4', 'Agent Memory'],
  ['14-summarization-midleware.mp4', 'Summarization Middleware'],
  ['15-hunmanintheloop_midleware.mp4', 'Human-in-the-loop Middleware'],
  ['16-.mp4', '第 16 讲（原文件未注明标题）'],
])

export const langchainUnits = [
  { id: 'foundation', title: 'LangChain 基础与模型调用', lessons: day01.slice(0, 12) },
  { id: 'prompt', title: '提示词与 Chains', lessons: day01.slice(12) },
  { id: 'documents', title: '文档处理与向量化', lessons: day02.slice(0, 12) },
  { id: 'retrieval', title: 'Milvus 与检索', lessons: [...day02.slice(12), ...day03.slice(0, 4)] },
  { id: 'agent', title: 'Agent、工具与 MCP', lessons: day03.slice(4) },
]

export const langchainLessons = langchainUnits.flatMap(unit => unit.lessons)
