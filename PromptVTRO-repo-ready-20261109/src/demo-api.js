// Local UI fixtures. Enabled only by `?demo` on the Vite development server.
export const isDemoMode = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo')
export const demoRole = isDemoMode ? new URLSearchParams(window.location.search).get('demo') : null
export const demoUser = role => ({
  id: `demo-${role}`, role, username: role,
  displayName: { student: '演示学生', teacher: '演示教师', admin: '演示管理员' }[role],
})

const question = {
  id: 'demo-question', title: '形成性评价示例题', visibility: 'public',
  data: {
    type: 'single', stem: '哪项活动更符合形成性评价？',
    options: ['学期末统一考试', '课堂中根据学生回答调整讲解', '只公布最终成绩'],
    answer: [1], analysis: '形成性评价在学习过程中收集证据，并据此调整教学。',
    difficulty: 'easy', knowledgePoints: ['形成性评价'],
  },
}
const graph = {
  id: 'demo-graph', title: '学习评价知识图谱', visibility: 'public',
  data: { nodes: [{ id: 'demo-node', label: '形成性评价', description: '在教学过程中收集反馈并改进教学。', questionIds: [question.id] }], edges: [] },
}

export function installDemoApi() {
  const originalFetch = window.fetch.bind(window)
  const records = {
    questions: [structuredClone(question)], graphs: [structuredClone(graph)],
    papers: [], 'lesson-plans': [], assignments: [], classes: [],
  }
  const conversations = []
  const messages = new Map()
  const json = (value, status = 200) => new Response(JSON.stringify(value), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
  const bodyOf = async options => {
    try { return JSON.parse(options?.body || '{}') } catch { return {} }
  }

  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href)
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return originalFetch(input, options)
    const path = url.pathname.slice(5)
    const method = (options.method || 'GET').toUpperCase()
    if (path === 'auth/logout' && method === 'POST') return new Response(null, { status: 204 })
    if (path === 'auth/login' || path === 'auth/register') {
      const data = await bodyOf(options)
      const role = ['student', 'teacher', 'admin'].includes(data.username) ? data.username : data.requestedRole || 'student'
      return json({ user: demoUser(role) })
    }
    if (path === 'conversations') {
      if (method === 'GET') return json(conversations)
      if (method === 'POST') {
        const data = await bodyOf(options)
        const saved = { id: crypto.randomUUID(), title: data.title || '演示对话' }
        conversations.unshift(saved)
        messages.set(saved.id, [])
        return json(saved, 201)
      }
    }
    const conversation = path.match(/^conversations\/([^/]+)\/(messages|chat)$/)
    if (conversation) {
      const history = messages.get(conversation[1])
      if (!history) return json({ error: '演示会话不存在。' }, 404)
      if (conversation[2] === 'messages' && method === 'GET') return json(history)
      if (conversation[2] === 'chat' && method === 'POST') {
        const data = await bodyOf(options)
        const reply = '这是前端演示回复，用于检查消息布局和交互。当前未连接后端或模型。'
        history.push({ role: 'user', text: data.text }, { role: 'assistant', text: reply })
        return new Response(`${JSON.stringify({ message: { content: reply } })}\n${JSON.stringify({ done: true })}\n`, {
          headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
        })
      }
    }
    if (path === 'courses' && method === 'GET') return json([])
    if (path === 'admin/users' || path === 'admin/classes') return json([])
    const teaching = path.match(/^teaching\/([^/]+)(?:\/([^/]+))?(?:\/(.+))?$/)
    if (teaching) {
      const [, collection, id, action] = teaching
      const items = records[collection]
      if (!items) return json({ error: '该功能尚无演示数据。' }, 501)
      if (!id) {
        if (method === 'GET') return json({ items, total: items.length })
        if (method === 'POST') {
          const saved = { ...await bodyOf(options), id: crypto.randomUUID() }
          items.unshift(saved)
          return json(saved, 201)
        }
      }
      const record = items.find(item => item.id === id)
      if (record && !action) {
        if (method === 'GET') return json(record)
        if (method === 'PUT') {
          Object.assign(record, await bodyOf(options))
          return json(record)
        }
        if (method === 'DELETE') {
          items.splice(items.indexOf(record), 1)
          return new Response(null, { status: 204 })
        }
      }
      if (record && collection === 'questions' && action === 'practice' && method === 'POST') {
        const { answer } = await bodyOf(options)
        return json({ correct: JSON.stringify(answer) === JSON.stringify(record.data.answer), answer: record.data.answer, analysis: record.data.analysis })
      }
      return json({ error: '此操作需要后端或模型，演示模式未提供。' }, 501)
    }
    return json({ error: '此接口需要后端，演示模式未提供。' }, 501)
  }
}
