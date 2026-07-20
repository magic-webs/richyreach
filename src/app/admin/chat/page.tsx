"use client";

import {
  useEffect,
  useState,
  useRef
} from "react";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Mic, Square, Trash2 } from "lucide-react";

async function uploadAudioMessage(blob: Blob): Promise<{ url: string; key: string }> {
  const ext = blob.type.split("/")[1]?.split(";")[0] || "webm";
  const formData = new FormData();
  formData.append("file", blob, `voice-note-${Date.now()}.${ext}`);
  const res = await api("/media/upload", { method: "POST", body: formData });
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.error || "Failed to upload voice note");
  return result.data;
}

function formatDuration(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const recorder = useAudioRecorder();
  const [sendingVoice, setSendingVoice] = useState(false);

  // Pagination states
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Typing states
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const localTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, []);

  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    // Check if it's a new message (append)
    const isNewMessage = lastMessageIdRef.current !== null && lastMessageIdRef.current !== lastMsg.id;
    lastMessageIdRef.current = lastMsg.id;

    if (!isNewMessage) {
      // First load or pagination prepends
      if (nextCursor === null) {
        scrollToBottom();
      }
      return;
    }

    // Scroll to bottom if user is already near the bottom or if it is sent by me
    const container = messagesContainerRef.current;
    if (container) {
      const isMe = lastMsg.senderId === user?.id || lastMsg.senderName === user?.name;
      const isNearBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 120;
      if (isMe || isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, user, nextCursor]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api("/chat/rooms");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setRooms(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin chat rooms", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string, quiet = false) => {
    try {
      if (!quiet) setLoadingMessages(true);
      // Reset pagination meta on channel swap
      setNextCursor(null);
      setHasMoreOlder(false);
      lastMessageIdRef.current = null;

      const res = await api(`/chat/messages/${roomId}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setMessages(result.data);
          if (result.meta?.pagination) {
            setHasMoreOlder(result.meta.pagination.hasMore);
            setNextCursor(result.meta.pagination.nextCursor);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedRoom || !hasMoreOlder || loadingOlder || !nextCursor) return;
    try {
      setLoadingOlder(true);
      const container = messagesContainerRef.current;
      const prevScrollHeight = container ? container.scrollHeight : 0;

      const res = await api(`/chat/messages/${selectedRoom.roomId}?cursor=${encodeURIComponent(nextCursor)}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setMessages((prev) => [...result.data, ...prev]);
          if (result.meta?.pagination) {
            setHasMoreOlder(result.meta.pagination.hasMore);
            setNextCursor(result.meta.pagination.nextCursor);
          } else {
            setHasMoreOlder(false);
            setNextCursor(null);
          }

          // Adjust scroll position to prevent jumping
          setTimeout(() => {
            if (container) {
              container.scrollTop = container.scrollHeight - prevScrollHeight;
            }
          }, 0);
        }
      }
    } catch (err) {
      console.error("Failed to load older messages", err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMoreOlder && !loadingOlder) {
      loadOlderMessages();
    }
  };

  const fetchUsersList = async () => {
    try {
      setLoadingUsers(true);
      const res = await api("/admin/users");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setUsersList(result.data.filter((u: any) => u.role !== "admin"));
        }
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchRooms();
    }
  }, [user]);

  useEffect(() => {
    if (isNewChatOpen && usersList.length === 0) {
      fetchUsersList();
    }
  }, [isNewChatOpen]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!selectedRoom) return;

    let isMounted = true;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let ws: WebSocket | null = null;

    const connect = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("richyreach_session_token") || "" : "";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-api.richyreach.com/api";
      const wsBase = apiUrl.replace(/^http/, "ws");
      const wsUrl = `${wsBase}/chat/ws/${selectedRoom.roomId}?token=${encodeURIComponent(token)}`;

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to WS room", selectedRoom.roomId);
        setPartnerIsTyping(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pong") return;
          if (data.error) {
            console.error("WS Error:", data.error);
            return;
          }

          if (data.type === "message" && data.message) {
            // Append new message to state
            setMessages((prev) => {
              // Prevent duplicates
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          } else if (data.type === "typing") {
            if (data.userId !== user?.id) {
              setPartnerIsTyping(data.isTyping);
              if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
              if (data.isTyping) {
                partnerTypingTimeoutRef.current = setTimeout(() => {
                  setPartnerIsTyping(false);
                }, 5000); // 5s safety timeout
              }
            }
          } else if (data.type === "read-receipt") {
            const idSet = new Set(data.messageIds);
            setMessages((prev) => prev.map((m) => idSet.has(m.id) ? { ...m, readAt: data.readAt } : m));
          }
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      ws.onclose = (e) => {
        console.log("WS connection closed");
        wsRef.current = null;
        if (isMounted && e.code !== 1000) {
          reconnectTimeout = setTimeout(() => {
            if (isMounted) connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (ws) ws.close();
      wsRef.current = null;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [selectedRoom?.roomId]);

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    fetchMessages(room.roomId);
  };

  const handleStartNewChat = async (targetUserId: string) => {
    try {
      setIsNewChatOpen(false);
      const res = await api("/chat/admin/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          await fetchRooms();
          // The returned room has the admin_ prefix included in ChatService.createAdminRoom response
          handleRoomSelect(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to start new chat", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!selectedRoom) return;

    if (!localIsTyping && e.target.value.trim().length > 0) {
      setLocalIsTyping(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "typing", isTyping: true }));
      }
    } else if (e.target.value.trim().length === 0) {
      setLocalIsTyping(false);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "typing", isTyping: false }));
      }
      if (localTypingTimeoutRef.current) clearTimeout(localTypingTimeoutRef.current);
      return;
    }

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }

    localTypingTimeoutRef.current = setTimeout(() => {
      setLocalIsTyping(false);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "typing", isTyping: false }));
      }
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    // Reset local typing indicator on send
    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }
    setLocalIsTyping(false);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send typing: false and then the message
      wsRef.current.send(JSON.stringify({ type: "typing", isTyping: false }));
      wsRef.current.send(JSON.stringify({ content: newMessage.trim(), senderId: user.id }));
      setNewMessage("");
    } else {
      try {
        setSending(true);
        const res = await api(`/chat/message/${selectedRoom.roomId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage.trim() }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setNewMessage("");
            await fetchMessages(selectedRoom.roomId, true);
          }
        }
      } catch (error) {
        console.error("Failed to send message", error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleSendVoiceNote = async () => {
    if (!recorder.audioBlob || !selectedRoom || sendingVoice) return;
    setSendingVoice(true);
    try {
      const { url } = await uploadAudioMessage(recorder.audioBlob);
      const attachmentDurationSec = Math.round(recorder.durationSec);
      const payload = { attachmentUrl: url, attachmentType: "audio" as const, attachmentDurationSec };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ ...payload, senderId: user.id }));
      } else {
        const res = await api(`/chat/message/${selectedRoom.roomId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success) await fetchMessages(selectedRoom.roomId, true);
        }
      }
      recorder.discardRecording();
    } catch (err) {
      console.error("Failed to send voice note", err);
    } finally {
      setSendingVoice(false);
    }
  };

  if (user?.role !== "admin") return null;

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex gap-6 animate-fade-in relative">
      {/* Channels Sidebar List (Left pane) */}
      <div className={`w-full md:w-80 ${selectedRoom ? "hidden md:flex" : "flex"} bg-white/80 dark:bg-slate-900/35 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-md flex-col overflow-hidden shrink-0`}>
        <div className="p-5 border-b border-slate-150 dark:border-slate-800/60 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Support Channels</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Direct User Messages</p>
          </div>
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors cursor-pointer"
            title="Start New Chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loadingRooms ? (
            <div className="flex items-center justify-center h-40">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No support chats yet. Click the + button to message a user.
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = selectedRoom?.roomId === room.roomId;

              return (
                <div
                  key={room.roomId}
                  onClick={() => handleRoomSelect(room)}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${isSelected
                    ? "bg-primary/10 border-primary/30 text-primary dark:text-white"
                    : "bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                >
                  <img
                    src={room.avatar}
                    alt={room.name}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-primary dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>{room.name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5 capitalize">{room.role}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat window pane (Right pane) */}
      <div className={`flex-1 ${!selectedRoom ? "hidden md:flex" : "flex"} bg-white/80 dark:bg-slate-900/35 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-md flex-col overflow-hidden relative`}>
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 z-0"></div>

        {!selectedRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">Support Console</h3>
            <p className="text-xs text-slate-600 dark:text-slate-500 max-w-sm mt-1">
              Select a conversation channel from the inbox to chat with users. They will see your messages as "RichyReach Team".
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center gap-3.5 z-10 bg-slate-50/80 dark:bg-slate-900/55 backdrop-blur-md">
              <button
                onClick={() => setSelectedRoom(null)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <img
                src={selectedRoom.avatar}
                alt="Selected Chat Avatar"
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 object-contain"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedRoom.name}
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  {selectedRoom.role}
                </p>
              </div>
            </div>

            {/* Bubble Thread */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 space-y-4 z-10"
            >
              {loadingOlder && (
                <div className="flex items-center justify-center py-2">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                  </span>
                </div>
              )}
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                  </span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-500">
                  No messages yet. Send a message to assist this user!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id || msg.senderId.startsWith(`mock_${user.role}`) || msg.senderName === user.name;
                  const lastMeMsgIndex = [...messages].reverse().findIndex(m => m.senderId === user?.id || m.senderName === user?.name);
                  const isLastMeMsg = lastMeMsgIndex !== -1 && messages[messages.length - 1 - lastMeMsgIndex].id === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderName}`}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 self-end mb-1"
                        />
                      )}
                      <div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isMe
                            ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/10"
                            : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-300 rounded-bl-none"
                            }`}
                        >
                          {msg.attachmentType === "audio" && msg.attachmentUrl ? (
                            <audio controls src={msg.attachmentUrl} className="h-9 max-w-[220px] align-middle" />
                          ) : (
                            msg.content
                          )}
                        </div>
                        <p className={`text-[8px] text-slate-500 font-semibold mt-1 ${isMe ? "text-right" : ""}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isMe && isLastMeMsg && msg.readAt && (
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1 text-right">
                            Seen {new Date(msg.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {partnerIsTyping && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-end">
                  <img
                    src={selectedRoom.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedRoom.name}`}
                    alt="Partner typing avatar"
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 shrink-0 self-end mb-1 object-contain"
                  />
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-2xl rounded-bl-none w-[60px]">
                    <span className="w-1.5 h-1.5 bg-slate-450 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-455 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-455 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Panel */}
            {recorder.phase === "recording" ? (
              <div className="p-4 border-t border-slate-150 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/20 backdrop-blur-md flex gap-3.5 items-center z-10">
                <div className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-850 flex items-center gap-2 px-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDuration(recorder.durationSec)}</span>
                </div>
                <GlassButton type="button" variant="outline" onClick={recorder.cancelRecording} className="h-11 w-11 p-0 rounded-xl shrink-0">
                  <Trash2 className="w-4 h-4" />
                </GlassButton>
                <GlassButton type="button" variant="primary" onClick={() => recorder.stopRecording()} className="h-11 w-11 p-0 rounded-xl shrink-0">
                  <Square className="w-4 h-4" />
                </GlassButton>
              </div>
            ) : recorder.phase === "stopped" && recorder.audioUrl ? (
              <div className="p-4 border-t border-slate-150 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/20 backdrop-blur-md flex gap-3.5 items-center z-10">
                <div className="flex-1 h-11 rounded-xl bg-white dark:bg-slate-955 border border-slate-250 dark:border-slate-850 flex items-center px-2">
                  <audio controls src={recorder.audioUrl} className="h-8 w-full" />
                </div>
                <GlassButton type="button" variant="outline" onClick={recorder.discardRecording} disabled={sendingVoice} className="h-11 w-11 p-0 rounded-xl shrink-0">
                  <Trash2 className="w-4 h-4" />
                </GlassButton>
                <GlassButton type="button" variant="primary" onClick={handleSendVoiceNote} disabled={sendingVoice} className="h-11 w-11 p-0 rounded-xl shrink-0">
                  <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </GlassButton>
              </div>
            ) : (
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-150 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/20 backdrop-blur-md flex gap-3.5 items-center z-10"
            >
              {recorder.permissionDenied && (
                <p className="text-[10px] text-slate-500 absolute -top-6 left-4">Microphone access is needed to record voice notes.</p>
              )}
              <Input
                type="text"
                placeholder="Type a message to the user..."
                value={newMessage}
                onChange={handleInputChange}
                disabled={sending}
                className="flex-1 bg-white dark:bg-slate-955 border-slate-250 dark:border-slate-850 text-slate-900 dark:text-white rounded-xl h-11 text-xs focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <GlassButton
                type="button"
                variant="outline"
                onClick={recorder.startRecording}
                className="h-11 w-11 p-0 rounded-xl shrink-0"
                title="Record a voice note"
              >
                <Mic className="w-4 h-4" />
              </GlassButton>
              <GlassButton
                type="submit"
                disabled={sending || !newMessage.trim()}
                variant="primary"
                className="h-11 w-11 p-0 rounded-xl shrink-0"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </GlassButton>
            </form>
            )}
          </>
        )}
      </div>

      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Support Chat</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <Input
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/20">
              {loadingUsers ? (
                <p className="text-xs text-center text-slate-500 py-4">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-xs text-center text-slate-500 py-4">No users found.</p>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                    onClick={() => handleStartNewChat(u.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={u.image || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt={u.name} className="w-8 h-8 rounded-lg bg-white" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded">{u.role}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}