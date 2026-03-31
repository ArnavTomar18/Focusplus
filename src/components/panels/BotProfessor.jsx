import { useState, useRef } from 'react'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

async function callGemini(prompt, ctx = '') {
  if (!GEMINI_KEY) throw new Error('No API key')
  const full = ctx ? `${ctx}\n\nUser: ${prompt}` : prompt
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: full }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
  })
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

function localAnswer(q, content) {
  if (q.startsWith('#')) {
    const t = q.slice(1).trim()
    return `<h4>📖 ${t}</h4><p>To get AI-powered lessons on <strong>${t}</strong>, add your Gemini API key as <code>VITE_GEMINI_KEY</code> in your <code>.env</code> file.</p><p>Meanwhile, upload a .txt document about this topic and I can analyze it!</p>`
  }
  if (content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.length > 30)
    const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const matches = sentences.filter(s => words.some(w => s.toLowerCase().includes(w)))
    if (matches.length > 0) return `<h4>📄 From your document:</h4><p>${matches.slice(0,3).join('. ')}.</p>`
    return `<h4>🤔 Not found in document</h4><p>I couldn't find a direct match for "<strong>${q}</strong>" in your document. Try rephrasing, or add a Gemini API key for full AI answers!</p>`
  }
  const q2 = q.toLowerCase()
  if (q2.includes('hello')||q2.includes('hi')||q2.includes('hey'))
    return `<h4>👋 Hello!</h4><p>I'm your Bot Professor! Upload a <code>.txt</code> file and ask me about it, or use <code>#topic</code> to learn any subject.</p>`
  if (q2.includes('help')||q2.includes('what can'))
    return `<h4>🚀 How I Can Help</h4><ul><li>📄 Upload a text file → I'll analyse it</li><li>#topic → Learn any subject</li><li>💬 Ask questions → Context-aware answers</li><li>🤖 Add Gemini key → Full AI power</li></ul>`
  return `<h4>💡 ${q}</h4><p>I'd love to help! For the best experience:<br>• <strong>Upload a .txt file</strong> for document Q&A<br>• Use <strong>#topic</strong> to learn any subject<br>• Add <strong>VITE_GEMINI_KEY</strong> to your .env for full AI</p>`
}

export default function BotProfessor() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [uploaded, setUploaded] = useState('')
  const [fileName, setFileName] = useState('')
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState('Ready! Upload a file or ask me anything.')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const fileRef = useRef()
  const chatEndRef = useRef()

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return
    if (!file.name.endsWith('.txt')) return setStatus('⚠️ Please upload a .txt file')
    if (file.size > 5*1024*1024) return setStatus('⚠️ File too large (max 5 MB)')
    const reader = new FileReader()
    reader.onload = ev => { setUploaded(ev.target.result); setFileName(file.name); setStatus(`✅ Loaded: ${file.name}`) }
    reader.readAsText(file)
  }

  const ask = async () => {
    if (!question.trim()) return
    const q = question.trim(); setQuestion('')
    const userMsg = { role: 'user', text: q }
    setHistory(h => [...h, userMsg])
    setLoading(true); setStatus('🧠 Thinking…')
    try {
      let ans
      if (GEMINI_KEY) {
        const ctx = uploaded ? `Document:\n${uploaded.substring(0,3000)}\n\nConversation:\n${history.slice(-4).map(m=>`${m.role}: ${m.text}`).join('\n')}` : ''
        ans = await callGemini(q, ctx)
      } else {
        await new Promise(r => setTimeout(r, 600))
        ans = localAnswer(q, uploaded)
      }
      setHistory(h => [...h, { role: 'professor', text: ans }])
      setStatus('✨ Ask me anything else!')
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      const fb = localAnswer(q, uploaded)
      setHistory(h => [...h, { role: 'professor', text: fb }])
      setStatus('⚠️ Using local mode — add VITE_GEMINI_KEY for full AI')
    } finally { setLoading(false) }
  }

  const reset = () => {
    setUploaded(''); setFileName(''); setQuestion(''); setHistory([])
    setStatus('Reset! Ready for a new session.'); if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <div className="panel professor-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-title-icon">🤖</span>
            Bot Professor
          </div>
          <button className="btn-sm danger" onClick={reset}>↺ Reset</button>
        </div>

        {/* Robot */}
        <div className="robot-scene">
          <div className="robot-body-wrap">
            <div className="robot-body">
              <div className="robot-antenna">📡</div>
              <div className="robot-head">
                <div className="robot-eyes">
                  <span className={`eye ${loading ? 'blink' : ''}`}>💡</span>
                  <span className={`eye ${loading ? 'blink' : ''}`}>💡</span>
                </div>
                <div className="robot-mouth">{loading ? '⏳' : '🔵'}</div>
              </div>
              <div className="robot-chest">⚙️</div>
            </div>
            <div className="robot-base">▬▬▬</div>
          </div>
          <div className="prof-status">{status}</div>
        </div>

        {/* Controls */}
        <div className="prof-controls">
          <input ref={fileRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFile} />
          {fileName
            ? <div className="prof-file-uploaded">📄 {fileName}</div>
            : (
              <div className="prof-file-zone" onClick={() => fileRef.current.click()} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Click to upload .txt file</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Max 5 MB</div>
              </div>
            )
          }
          <button className="btn-prof btn-prof-open" onClick={() => { setOpen(true); setMinimized(false) }}>
            📚 Open Professor Chat
          </button>
        </div>
      </div>

      {/* FULL SCREEN CHAT MODAL */}
      {open && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget && !maximized) setOpen(false) }}>
          <div className={`modal ${maximized ? 'modal-maximized' : minimized ? 'modal-minimized' : ''}`}
            style={!maximized && !minimized ? { maxWidth: 900, alignSelf: 'center', borderRadius: 'var(--radius-xl)', maxHeight: '88vh' } : {}}>
            <div className="modal-chrome">
              <div className="modal-chrome-left">
                <span className="panel-title-icon">🤖</span>
                <span className="modal-title">Bot Professor</span>
                {fileName && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 8 }}>📄 {fileName}</span>}
              </div>
              <div className="modal-chrome-btns">
                <button className="win-btn" onClick={() => { fileRef.current.click() }} title="Upload file" style={{ fontSize: 13 }}>📁</button>
                <button className="win-btn" onClick={reset} title="Reset" style={{ fontSize: 13 }}>↺</button>
                <button className="win-btn minimize" onClick={() => setMinimized(m => !m)} title={minimized ? 'Restore' : 'Minimize'}>
                  {minimized ? '▲' : '−'}
                </button>
                <button className="win-btn maximize" onClick={() => setMaximized(m => !m)} title={maximized ? 'Restore' : 'Maximize'}>
                  {maximized ? '⤡' : '⤢'}
                </button>
                <button className="win-btn close" onClick={() => { setOpen(false); setMaximized(false); setMinimized(false) }}>✕</button>
              </div>
            </div>

            {!minimized && (
              <div className="modal-body" style={{ gap: 0, padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: maximized ? '280px 1fr' : '1fr', height: '100%', overflow: 'hidden' }}>
                  {/* Sidebar — only in maximized */}
                  {maximized && (
                    <div style={{ borderRight: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Document</div>
                        <input ref={fileRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFile} />
                        {fileName
                          ? <div className="prof-file-uploaded">📄 {fileName}</div>
                          : <button className="btn-prof btn-prof-upload" style={{ width: '100%' }} onClick={() => fileRef.current.click()}>📁 Upload .txt File</button>
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Tips</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                          • <code style={{color:'var(--accent)'}}>Upload a file</code> → Ask questions about it<br/>
                          • <code style={{color:'var(--accent)'}}>#topic</code> → Learn any subject<br/>
                          • Add <code style={{color:'var(--accent)'}}>VITE_GEMINI_KEY</code> for full AI power<br/>
                          • Press <code style={{color:'var(--accent)'}}>Enter</code> to send
                        </div>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <button className="btn-danger" style={{ width: '100%' }} onClick={reset}>↺ Clear Chat</button>
                      </div>
                    </div>
                  )}

                  {/* Chat area */}
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {history.length === 0 && (
                        <div className="response-placeholder">
                          <div className="response-placeholder-icon">🤖</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)' }}>Start a conversation</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.7 }}>
                            Ask me anything! Upload a .txt file for document analysis, or use #topic to learn any subject.
                          </div>
                        </div>
                      )}
                      {history.map((m, i) => (
                        <div key={i} style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4
                        }}>
                          <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--text-muted)', marginBottom: 2,
                            paddingLeft: m.role !== 'user' ? 4 : 0,
                            paddingRight: m.role === 'user' ? 4 : 0,
                          }}>
                            {m.role === 'user' ? 'You' : '🤖 Professor'}
                          </div>
                          {m.role === 'user' ? (
                            <div style={{
                              background: 'var(--accent-dim)', border: '1px solid var(--border-lit)',
                              borderRadius: '16px 16px 4px 16px', padding: '12px 18px',
                              maxWidth: '80%', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6
                            }}>
                              {m.text}
                            </div>
                          ) : (
                            <div style={{
                              background: 'var(--bg-raised)', border: '1px solid var(--border)',
                              borderRadius: '4px 16px 16px 16px', padding: '16px 20px',
                              maxWidth: '90%', fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)'
                            }}
                              className="response-body"
                              dangerouslySetInnerHTML={{ __html: m.text }}
                            />
                          )}
                        </div>
                      ))}
                      {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                          <span style={{ animation: 'pulse-glow 1s infinite', fontSize: 18 }}>🤖</span>
                          <span>Professor is thinking…</span>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input bar */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
                      <textarea
                        className="qa-input"
                        style={{ flex: 1, minHeight: 52, maxHeight: 120, resize: 'none' }}
                        placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }}
                      />
                      <button className="btn-ask" style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }} onClick={ask} disabled={loading || !question.trim()}>
                        {loading ? '⏳' : '▶ Ask'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
