"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../layout-shell";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/ui/glass-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.api.chat.rooms.$get();
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
      const res = await (api.api.chat.messages[":roomId"].$get as any)({
        param: { roomId },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setMessages(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      setLoadingUsers(true);
      const res = await (api.api.admin as any).users.$get(); // Use any just in case types aren't fully generated yet
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

    const wsUrl = `ws://localhost:4000?roomId=${selectedRoom.roomId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WS room", selectedRoom.roomId);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "pong") return;
        if (data.error) {
          console.error("WS Error:", data.error);
          return;
        }
        
        // Append new message to state
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onclose = () => {
      console.log("WS connection closed");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [selectedRoom?.roomId]);

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    fetchMessages(room.roomId);
  };

  const handleStartNewChat = async (targetUserId: string) => {
    try {
      setIsNewChatOpen(false);
      const res = await (api.api.chat.admin.room.$post as any)({
        json: { userId: targetUserId }
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send via true WebSocket
      wsRef.current.send(JSON.stringify({ content: newMessage.trim(), senderId: user.id }));
      setNewMessage("");
    } else {
      try {
        setSending(true);
        const res = await (api.api.chat.message[":roomId"].$post as any)({
          param: { roomId: selectedRoom.roomId },
          json: { content: newMessage.trim() },
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
            <div className="flex-1 overflow-y-auto p-5 space-y-4 z-10">
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
                          {msg.content}
                        </div>
                        <p className={`text-[8px] text-slate-500 font-semibold mt-1 ${isMe ? "text-right" : ""}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Panel */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-150 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/20 backdrop-blur-md flex gap-3.5 items-center z-10"
            >
              <Input
                type="text"
                placeholder="Type a message to the user..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="flex-1 bg-white dark:bg-slate-955 border-slate-250 dark:border-slate-850 text-slate-900 dark:text-white rounded-xl h-11 text-xs focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
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