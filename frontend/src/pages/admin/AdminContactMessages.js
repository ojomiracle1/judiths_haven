import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/contact', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        // Ensure data is always an array
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user, navigate]);

  const handleReply = async (id, email, name) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    setReplySuccess('');
    try {
      const res = await fetch(`/api/contact/${id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.ok) {
        setReplySuccess('Reply sent!');
        setReplyingId(null);
        setReplyText('');
        // Optionally refresh messages
      } else {
        setReplySuccess('Failed to send reply.');
      }
    } catch {
      setReplySuccess('Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight drop-shadow-lg text-center mb-8">Contact Messages</h1>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg._id} className="bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <span className="font-semibold text-primary-700">{msg.name}</span> <span className="text-gray-500">({msg.email})</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-gray-700 mt-2">{msg.message}</div>
                {/* Reply UI */}
                <div className="mt-2 flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Type a reply..."
                    value={replyingId === msg._id ? replyText : ''}
                    onChange={e => setReplyText(e.target.value)}
                    className="input-premium flex-1"
                    disabled={replyingId !== msg._id}
                  />
                  {replyingId === msg._id ? (
                    <button onClick={() => handleReply(msg._id, msg.email, msg.name)} className="btn-gradient px-4 py-2 rounded-xl font-semibold text-sm shadow hover:scale-105 transition-all" disabled={replyLoading}>
                      {replyLoading ? 'Sending...' : 'Send'}
                    </button>
                  ) : (
                    <button onClick={() => setReplyingId(msg._id)} className="btn-gradient px-4 py-2 rounded-xl font-semibold text-sm shadow hover:scale-105 transition-all">Reply</button>
                  )}
                  {replySuccess && replyingId === msg._id && (
                    <span className="text-green-600 text-xs ml-2">{replySuccess}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactMessages;
