import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../components/AuthContext';

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [activePerson, setActivePerson] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/connections/matches').then(res => {
      setMatches(res.data);
      if (userId) {
        const person = res.data.find(m => m.id === userId);
        if (person) setActivePerson(person);
      }
    });
  }, []);

  useEffect(() => {
    if (!activePerson) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activePerson]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!activePerson) return;
    try {
      const res = await api.get(`/messages/${activePerson.id}`);
      setMessages(res.data);
    } catch {}
  };

  const selectPerson = (person) => {
    setActivePerson(person);
    navigate(`/messages/${person.id}`);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activePerson) return;
    setSending(true);
    try {
      await api.post(`/messages/${activePerson.id}`, { content: newMsg.trim() });
      setNewMsg('');
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page" style={{ padding: '0' }}>
      <div className="app-container" style={{ height: 'calc(100vh - 64px)', padding: 0 }}>
        <div className="chat-container">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--crimson)' }}>
              Messages
            </div>
            {matches.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No matches yet.<br />
                <Link to="/browse" style={{ color: 'var(--crimson)' }}>Discover people</Link>
              </div>
            ) : (
              matches.map(m => (
                <div
                  key={m.id}
                  onClick={() => selectPerson(m)}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px',
                    cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    background: activePerson?.id === m.id ? '#FFF0F3' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {m.profile_pic
                    ? <img src={m.profile_pic} alt={m.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #FDE8EC, #FAF0E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        {m.gender === 'female' ? '👩' : '👨'}
                      </div>
                  }
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{m.location}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Main chat */}
          <div className="chat-main">
            {!activePerson ? (
              <div className="empty-state" style={{ marginTop: 80 }}>
                <div className="empty-state-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose someone from your matches to start chatting</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'white' }}>
                  {activePerson.profile_pic
                    ? <img src={activePerson.profile_pic} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #FDE8EC, #FAF0E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                        {activePerson.gender === 'female' ? '👩' : '👨'}
                      </div>
                  }
                  <div>
                    <div style={{ fontWeight: 700 }}>{activePerson.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{activePerson.location}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="messages-list">
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: '0.88rem' }}>
                      🌸 You're connected! Say namaste to {activePerson.name}
                    </div>
                  )}
                  {messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
                      <div className={`message-bubble ${m.sender_id === user.id ? 'message-mine' : 'message-theirs'}`}>
                        {m.content}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="message-input-row">
                  <input
                    className="form-input message-input"
                    placeholder={`Message ${activePerson.name}…`}
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={handleKey}
                    autoFocus
                  />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
