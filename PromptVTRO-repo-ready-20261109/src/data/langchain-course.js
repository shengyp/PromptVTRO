// Course outline from the supplied LangChain video filenames and lecture-note preview.
// Assessment states below are illustrative until a reviewed question bank and learner records exist.
export const courseTitle = 'LangChain 大模型应用开发'

export const knowledgePoints = [
  { id: 'k01', title: 'LangChain 概述与组件', level: '基本掌握', unitId: 'foundation', lessonIds: ['day01-01', 'day01-02'] },
  { id: 'k02', title: '模型 API 与 Ollama 调用', level: '应用达标', unitId: 'foundation', lessonIds: ['day01-04', 'day01-12'] },
  { id: 'k03', title: '提示词模板与结构化输出', level: '部分掌握', unitId: 'prompt', lessonIds: ['day01-13', 'day01-15'] },
  { id: 'k04', title: 'Chains 与 Runnable', level: '基本掌握', unitId: 'prompt', lessonIds: ['day01-16'] },
  { id: 'k05', title: '文档加载', level: '基本掌握', unitId: 'documents', lessonIds: ['day02-03', 'day02-05', 'day02-06'] },
  { id: 'k06', title: '递归分隔符切分', level: '基础薄弱', unitId: 'documents', lessonIds: ['day02-09'] },
  { id: 'k07', title: '文本嵌入与向量索引', level: '基本掌握', unitId: 'documents', lessonIds: ['day02-10', 'day02-12'] },
  { id: 'k08', title: 'Milvus 与向量检索', level: '部分掌握', unitId: 'retrieval', lessonIds: ['day03-02', 'day03-03'] },
  { id: 'k09', title: 'Agent 与工具调用', level: '部分掌握', unitId: 'agent', lessonIds: ['day03-07', 'day03-08'] },
  { id: 'k10', title: 'MCP 与应用集成', level: '应用达标', unitId: 'agent', lessonIds: ['day03-09', 'day03-11'] },
]

export const assessmentLevels = [
  { name: '基础薄弱', count: 1, className: 'weak' },
  { name: '部分掌握', count: 3, className: 'partial' },
  { name: '基本掌握', count: 4, className: 'basic' },
  { name: '应用达标', count: 2, className: 'applied' },
]

export const mindMap = [
  { title: 'Model I/O · 规范模型输入与输出', topics: [
    { title: '提示词输入', leaves: ['ChatPromptTemplate 组织 system / human 消息', '使用变量注入用户问题或业务数据', 'Format 将原始输入整理为模型提示'] },
    { title: '模型调用', leaves: ['通过 SDK 或 ChatModel API 调用在线模型', '统一入口可配置不同模型服务', '通过 ChatOllama 连接本地 Ollama'] },
    { title: '结构化输出', leaves: ['用 Schema 描述期望的数据结构', '在提示词中写明格式要求', '由输出解析器处理模型回复'] },
    { title: '调用形态', leaves: ['invoke：单条输入生成结果', 'batch：批量处理输入', 'stream：逐步返回生成内容'] },
  ] },
  { title: 'Chains · 组合可复用的执行流程', topics: [
    { title: 'Runnable 统一接口', leaves: ['提示词、模型和解析器使用相近的调用方式', '链组合后仍然是可调用对象', '统一接口支持批处理与流式执行'] },
    { title: 'LCEL 表达式', leaves: ['用 prompt | model | parser 串接组件', '前一组件的输出进入后一组件'] },
    { title: '顺序与并行', leaves: ['RunnableSequence 按顺序执行', 'RunnableParallel 为同一输入运行多个分支'] },
  ] },
  { title: 'RAG · 将外部知识用于回答', topics: [
    { title: '为什么需要 RAG', leaves: ['预训练知识可能滞后', '私有领域知识可能缺失', '检索结果为生成提供参考上下文'] },
    { title: '加载资料', leaves: ['Markdown 可按标题或段落处理', 'DOCX / PDF 加载为文档对象', '资料来源影响后续清洗与切分'] },
    { title: '文档切分', leaves: ['将文档切为适合检索的文本块', '比较固定长度、递归分隔符等切分方式', '设置块重叠减少上下文截断'] },
    { title: '向量嵌入', leaves: ['Embedding 将文本块表示为向量', '查询也需嵌入才能比较相似度', '稠密向量与稀疏向量适用场景不同'] },
    { title: 'Milvus 向量存储', leaves: ['Collection / Schema 定义数据结构', '为向量建立检索索引', '支持插入、删除和向量检索'] },
    { title: '检索并生成', leaves: ['Retriever 取回相关文本块', '把问题与检索片段组合成提示词', '生成结果仍需核查'] },
    { title: '实际取舍', leaves: ['外部知识便于更新', '检索增加响应时延', '引用片段占用模型上下文'] },
  ] },
  { title: 'Agents · 根据任务选择并调用工具', topics: [
    { title: '决策与反馈', leaves: ['模型判断下一步动作及参数', '工具结果返回后继续判断', '适用于多步骤开放任务'] },
    { title: '本地工具', leaves: ['定义函数及参数 Schema', '把 model 与 tools 交给 Agent', '模型按需提出工具调用'] },
    { title: 'MCP 外部工具', leaves: ['Host、Client、Server 分工', 'Stdio 与 Streamable HTTP 连接方式', '发现能力、调用服务并处理结果'] },
    { title: '记忆与状态', leaves: ['保存短期会话历史', '使用 thread_id 隔离会话', '后续调用可使用既有上下文'] },
    { title: '中间件', leaves: ['摘要中间件压缩长历史', 'Human-in-the-loop 在关键步骤加入人工审核', '可在调用前后插入控制逻辑'] },
  ] },
]
