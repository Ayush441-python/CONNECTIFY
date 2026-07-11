import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSend, FiImage, FiMessageCircle, FiSmile } from 'react-icons/fi';
import { collaborationApi, uploadApi } from '../../api';
import { extractErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar, EmptyState, Loader } from '../../components/ui';
import type { Collaboration, Message } from '../../types';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '👏'];

export default function Messages() {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();
  const [params] = useSearchParams();
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeId, setActiveId] = useState<string | null>(params.get('collab'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    collaborationApi
      .mine()
      .then((res) => {
        setCollaborations(res.data.data);
        if (!activeId && res.data.data.length > 0) setActiveId(res.data.data[0].id);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    collaborationApi.getMessages(activeId).then((res) => setMessages(res.data.data));
    socket?.emit('collaboration:join', activeId);
    socket?.emit('message:read', { collaborationId: activeId });

    return () => {
      socket?.emit('collaboration:leave', activeId);
    };
  }, [activeId, socket]);

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg: Message) => {
      if (msg.collaborationId === activeId) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('message:read', { collaborationId: activeId });
      }
    };
    const onTypingStart = ({ collaborationId }: { collaborationId: string }) => {
      if (collaborationId === activeId) setTypingUser('typing...');
    };
    const onTypingStop = ({ collaborationId }: { collaborationId: string }) => {
      if (collaborationId === activeId) setTypingUser(null);
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeCollab = collaborations.find((c) => c.id === activeId);
  const counterpart = activeCollab && (activeCollab.brand.userId === user?.id ? activeCollab.influencer : activeCollab.brand);
  const counterpartName = counterpart && ('name' in counterpart ? counterpart.name : (counterpart as { brandName?: string }).brandName);
  const isOnline = counterpart ? onlineUserIds.has(counterpart.userId) : false;

  const handleSend = (imageUrl?: string) => {
    if (!activeId || (!text.trim() && !imageUrl)) return;
    socket?.emit('message:send', { collaborationId: activeId, content: text.trim() || undefined, imageUrl });
    setText('');
    setShowEmoji(false);
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (!activeId || !socket) return;
    socket.emit('typing:start', { collaborationId: activeId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', { collaborationId: activeId }), 1500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadApi.image(file, 'chat');
      handleSend(res.data.data.url);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      e.target.value = '';
    }
  };

  if (loading) return <Loader size={32} />;

  if (collaborations.length === 0) {
    return (
      <EmptyState
        icon={<FiMessageCircle />}
        title="No conversations yet"
        description="Messages unlock once a collaboration request or application is accepted."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden rounded-xl2 border border-ink/5 bg-white/60">
      <div className="w-full max-w-xs shrink-0 overflow-y-auto scrollbar-thin border-r border-ink/5">
        {collaborations.map((c) => {
          const cp = c.brand.userId === user?.id ? c.influencer : c.brand;
          const cpName = 'name' in cp ? cp.name : (cp as { brandName?: string }).brandName;
          const online = onlineUserIds.has(cp.userId);
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`flex w-full items-center gap-3 border-b border-ink/5 p-3.5 text-left transition-colors ${
                activeId === c.id ? 'bg-brand-gradient-soft' : 'hover:bg-ink/[0.02]'
              }`}
            >
              <div className="relative">
                <Avatar src={'profilePhotoUrl' in cp ? cp.profilePhotoUrl : (cp as { logoUrl?: string }).logoUrl} name={cpName || '?'} size={40} />
                {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{cpName}</p>
                <p className="truncate text-xs text-ink/40">{c.campaign?.title || 'Direct collaboration'}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {activeCollab ? (
          <>
            <div className="flex items-center gap-3 border-b border-ink/5 p-4">
              <div className="relative">
                <Avatar src={counterpart && ('profilePhotoUrl' in counterpart ? counterpart.profilePhotoUrl : (counterpart as { logoUrl?: string }).logoUrl)} name={counterpartName || '?'} size={38} />
                {isOnline && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{counterpartName}</p>
                <p className="text-xs text-ink/40">{typingUser || (isOnline ? 'Online' : 'Offline')}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin p-4">
              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        mine ? 'bg-brand-gradient text-white' : 'bg-mist text-ink'
                      }`}
                    >
                      {m.imageUrl && <img src={m.imageUrl} alt="" className="mb-1.5 max-w-full rounded-lg" />}
                      {m.content && <p>{m.content}</p>}
                      <p className={`mt-1 text-[10px] ${mine ? 'text-white/60' : 'text-ink/35'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {mine && m.isRead ? ' · Read' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="relative border-t border-ink/5 p-3">
              {showEmoji && (
                <div className="absolute bottom-full left-3 mb-2 flex gap-1.5 rounded-full border border-ink/10 bg-white p-2 shadow-glass">
                  {QUICK_EMOJIS.map((e) => (
                    <button key={e} onClick={() => setText((t) => t + e)} className="text-lg hover:scale-125 transition-transform">
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEmoji((s) => !s)} className="rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink">
                  <FiSmile size={18} />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink">
                  <FiImage size={18} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <input
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button onClick={() => handleSend()} className="btn-primary !rounded-full !p-3">
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-ink/40">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
