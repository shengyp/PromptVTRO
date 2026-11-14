// 本题集为依据公开技术文档自编的交互演示题，不是公开题库原题或正式考试。
export const assessmentSources = [
  { title: 'LangChain 官方学习资料', url: 'https://docs.langchain.com/oss/python/learn' },
  { title: 'LangChain Embedding 文档', url: 'https://docs.langchain.com/oss/python/integrations/embeddings' },
]

export const sampleQuestions = [
  { id: 'q01', unitId: 'foundation', type: 'single', stem: '准备把提示词、模型、检索器和工具接成一个问答流程，LangChain 在其中主要承担什么职责？', options: ['微调预训练权重的训练框架', '组织可组合的应用组件', '专门存储向量的数据库', '直接提供模型推理算力'], correct: [1], explanation: 'LangChain 主要帮助开发者组织模型、检索、工具等应用组件；训练、数据库存储和推理服务是其他环节。' },
  { id: 'q02', unitId: 'foundation', type: 'single', stem: '对已配置好的模型对象执行一次输入并取得结果，示例代码最适合使用哪种调用方式？', options: ['model.invoke(input)', 'model.stream(input)', 'model.batch(inputs)', 'model.bind_tools(tools)'], correct: [0], explanation: 'invoke 对单次输入返回结果；stream 用于逐步输出，batch 处理多条输入，bind_tools 用于绑定工具。具体 API 以项目采用的版本为准。' },
  { id: 'q03', unitId: 'foundation', type: 'judge', stem: '通过 Ollama 调用本机模型时，课程应用仍需知道可访问的 Ollama 服务地址和模型名称。', options: ['正确', '错误'], correct: [0], explanation: '即使模型运行在本机，应用也需要服务地址与模型标识才能发起请求。' },
  { id: 'q04', unitId: 'foundation', type: 'single', stem: '课程助手希望回答逐字出现，同时允许用户提前看到部分结果，最合适的接口形态是什么？', options: ['同步等待完整响应再渲染', '流式返回生成内容', '先对问题做批量离线处理', '只返回最终结构化结果'], correct: [1], explanation: '流式响应可在生成过程中逐步把结果交给前端展示。' },

  { id: 'q05', unitId: 'prompt', type: 'single', stem: '同一份课程答疑提示需要替换“课程名称”和“学生问题”，应如何组织？', options: ['为每个学生重新训练模型', '把课程名称与问题写成模板变量', '将所有问题写死在系统消息中', '每次都拼接整本教材作为提示'], correct: [1], explanation: '提示词模板用变量把稳定的指令和变化的任务输入分开。' },
  { id: 'q06', unitId: 'prompt', type: 'multiple', stem: '构建课程答疑的对话提示时，哪些信息适合分别保留并传给模型？', options: ['系统层的答题边界', '学生本次提问', '检索到且与问题相关的教材片段', '无关页面访问统计'], correct: [0,1,2], explanation: '系统约束、用户输入和相关上下文应有清晰角色；无关统计会增加噪声。' },
  { id: 'q07', unitId: 'prompt', type: 'single', stem: '需要模型返回包含 title 和 key_points 的结构化结果，哪个方案更稳妥？', options: ['仅靠自由文本提示，直接按固定字符位置切割', '定义目标结构，并对返回结果解析或校验', '只提高模型温度以增加表达多样性', '只对输出做长度截断，不检查字段'], correct: [1], explanation: '明确字段结构并进行解析或校验，才能把结果可靠地用于下游页面。' },
  { id: 'q08', unitId: 'prompt', type: 'single', stem: '在 prompt | model | parser 这条链中，parser 接收的通常是什么？', options: ['prompt 的原始模板文本', 'model 的输出', '并行分支的配置文件', '模型服务的端口号'], correct: [1], explanation: '管道连接前后组件，前一个组件的输出成为后一个组件的输入。' },

  { id: 'q09', unitId: 'documents', type: 'single', stem: '要从 PDF 讲义构建课程知识库，在文本切分前首先需要什么？', options: ['将 PDF 加载为可处理的文档', '先建立空向量索引并开始问答', '先把查询问题转换为向量', '先配置回答模板再忽略原始文档'], correct: [0], explanation: '文档加载是后续清洗、切分和嵌入的前提。' },
  { id: 'q10', unitId: 'documents', type: 'single', stem: '教材段落跨越两个文本块边界时，设置适度 overlap 主要为了解决什么？', options: ['让所有文本块内容完全相同', '尽量保留跨块语义连续性', '取消对文档的清洗', '保证每个块都有相同字数'], correct: [1], explanation: '重叠能保留边界附近的上下文，但过大也会增加重复内容和索引成本。' },
  { id: 'q11', unitId: 'documents', type: 'judge', stem: '选择文本块大小时，需要结合检索粒度与模型上下文长度，不能只追求块越大越好。', options: ['正确', '错误'], correct: [0], explanation: '块大小会影响检索精度、上下文占用与答案完整性，应结合任务验证。' },
  { id: 'q12', unitId: 'documents', type: 'single', stem: '用向量相似度搜索教材片段时，查询文本与教材文本应满足什么条件？', options: ['都能映射到可比较的向量空间', '两者文件名必须相同', '查询只能是 PDF 文件', '教材不能经过文本切分'], correct: [0], explanation: '文档和查询需由兼容的嵌入方式映射到可比较的向量空间。' },

  { id: 'q13', unitId: 'retrieval', type: 'single', stem: '设计 Milvus 课程知识库时，要存储向量及其来源字段，首先应规划什么？', options: ['Collection 的字段与向量结构', '只设定检索时的 top-k 数值', '只选择回答用的提示词模板', '只配置前端展示的引用样式'], correct: [0], explanation: 'Collection 的 Schema 定义向量及元数据字段，支撑后续插入和检索。' },
  { id: 'q14', unitId: 'retrieval', type: 'multiple', stem: '为了让课程资料问答能追溯来源，下列哪些做法合理？', options: ['保存文档标题或来源链接', '保留检索到的片段与其元数据', '回答时展示引用依据', '丢弃所有文档来源信息'], correct: [0,1,2], explanation: '来源元数据、检索片段和引用展示便于核查，丢弃来源会削弱可追溯性。' },
  { id: 'q15', unitId: 'retrieval', type: 'single', stem: 'RAG 检索器返回相关片段后，生成回答前通常还需做什么？', options: ['把问题与片段组织成模型可用的上下文', '无条件认定第一条片段正确', '删掉全部课程原文', '仅输出向量 ID'], correct: [0], explanation: '检索内容作为上下文进入生成流程，且仍需核查相关性与时效性。' },
  { id: 'q16', unitId: 'retrieval', type: 'judge', stem: '相似度排名第一的文本也可能不完整或过时，不能仅凭排名判定答案正确。', options: ['正确', '错误'], correct: [0], explanation: '相似度是检索信号，不等于事实正确性或充分性。' },

  { id: 'q17', unitId: 'agent', type: 'single', stem: 'Agent 需要查询外部课程资料时，怎样处理工具结果更合理？', options: ['选择适合的工具调用，并把结果用于后续判断', '无论任务是什么都调用全部工具', '忽略结果只保留工具名称', '仅按固定答案模板输出'], correct: [0], explanation: 'Agent 根据任务选择工具，并把工具结果纳入下一步决策或回答。' },
  { id: 'q18', unitId: 'agent', type: 'multiple', stem: '为 Agent 定义“查询课程资料”工具时，哪些内容应明确？', options: ['工具的用途和适用范围', '输入参数及类型', '结果字段及含义', '与功能无关的动画配色'], correct: [0,1,2], explanation: '用途、参数与返回结构使调用可理解、可校验。' },
  { id: 'q19', unitId: 'agent', type: 'single', stem: '通过 MCP 对外提供检索工具能力的程序，在协议角色中通常称为什么？', options: ['MCP Server', 'MCP Client', 'MCP Host', '工具调用请求'], correct: [0], explanation: 'MCP Server 对外提供工具等能力，Client 连接并调用这些能力。' },
  { id: 'q20', unitId: 'agent', type: 'judge', stem: '当 Agent 将执行具有外部影响的操作时，设置人工确认节点可以保留审核环节。', options: ['正确', '错误'], correct: [0], explanation: 'Human-in-the-loop 可让敏感操作在执行前经过人工审核。' },
]

export function questionsForUnit(unitId) { return sampleQuestions.filter(question => question.unitId === unitId) }
