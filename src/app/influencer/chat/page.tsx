"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/layout-shell";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/ui/glass-button";

export default function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async (autoSelect = false) => {
    try {
      if (rooms.length === 0) setLoadingRooms(true);
      const res = await api.api.chat.rooms.$get();
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setRooms(result.data);
          // If we want to autoselect the first room
          if (autoSelect && result.data.length > 0 && !selectedRoom) {
            handleRoomSelect(result.data[0]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat rooms", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string, quiet = false) => {
    try {
      if (!quiet) setLoadingMessages(true);
      const res = await api.api.chat.messages[":roomId"].$get({
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

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    fetchMessages(room.roomId);
  };

  // Initial load
  useEffect(() => {
    fetchRooms(true);
  }, [user.role, user.id]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!selectedRoom) return;

    const wsUrl = `ws://localhost:4000/chat?roomId=${selectedRoom.roomId}`;
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send via true WebSocket
      wsRef.current.send(JSON.stringify({ content: newMessage.trim() }));
      setNewMessage("");
    } else {
      // Fallback to REST API if WS fails
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

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex gap-6 animate-fade-in relative">
      {/* Channels Sidebar List (Left pane) */}
      <div className={`w-full md:w-80 ${selectedRoom ? "hidden md:flex" : "flex"} bg-white/80 dark:bg-slate-900/35 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none backdrop-blur-md flex-col overflow-hidden shrink-0`}>
        <div className="p-5 border-b border-slate-150 dark:border-slate-800/60">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Inbox Channels</h2>
          <p className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Direct Brand-Creator Deals</p>
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
              No chat rooms open yet. Launch campaigns or view marketplace to invite creators to negotiate.
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = selectedRoom?.roomId === room.roomId;
              // Extract details based on active role
              const avatar = user.role === "influencer"
                ? (room.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${room.companyName}`)
                : (room.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${room.name}`);
              const title = user.role === "influencer" ? room.companyName : room.name;
              const subtitle = user.role === "influencer" ? "Brand Partner" : `@${room.instagramHandle}`;

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
                    src={avatar}
                    alt={title}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-primary dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>{title}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{subtitle}</p>
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
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">Negotiation Console</h3>
            <p className="text-xs text-slate-600 dark:text-slate-500 max-w-sm mt-1">
              Select a conversation channel from the inbox to agree on content format deliverables and escrow payments.
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
                src={
                  user.role === "influencer"
                    ? (selectedRoom.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedRoom.companyName}`)
                    : (selectedRoom.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedRoom.name}`)
                }
                alt="Selected Chat Avatar"
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 object-contain"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {user.role === "influencer" ? selectedRoom.companyName : selectedRoom.name}
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  {user.role === "influencer" ? "Corporate Partner" : `@${selectedRoom.instagramHandle}`}
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
                  No messages yet. Send a message to start negotiating your campaign terms!
                </div>
              ) : (
                messages.map((msg) => {
                  // Determine sender alignment. The mock auth check can match either real or mock tokens
                  const isMe = msg.senderId === user.id || msg.senderId.startsWith(`mock_${user.role}`);

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
                placeholder="Enter campaign details, contract links, or message..."
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
    </div>
  );
}
