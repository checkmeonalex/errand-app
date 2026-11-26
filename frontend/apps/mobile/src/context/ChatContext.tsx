import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Message } from '@errand/types';
import { LOCAL_USER_ID } from '../constants/localUser';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '../storage/storage';
import { nextDevRunnerReply } from '../utils/devRunnerReplies';
import { useNotifications } from './NotificationsContext';

// What's saved on the device: every message, plus when each task's chat was
// last opened (to count unread).
type SavedChats = {
  messages: Message[];
  lastReadAt: Record<string, string>;
};

type ChatContextValue = {
  isLoading: boolean;
  // Oldest first, for one task's chat.
  messagesFor: (taskId: string) => Message[];
  // Messages from the other person since this task's chat was last opened.
  unreadCount: (taskId: string) => number;
  // Across every chat, for the home badge.
  totalUnread: number;
  sendMessage: (taskId: string, content: string) => Promise<void>;
  markRead: (taskId: string) => Promise<void>;
  // DEV ONLY: the runner sends the next canned reply.
  simulateRunnerReply: (taskId: string, runnerId: string) => Promise<void>;
  // Wipes every chat saved on this device (used by Delete account).
  clearAll: () => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const EMPTY: SavedChats = { messages: [], lastReadAt: {} };

// LOCAL chat so the screens work before the backend exists. Messages stay on
// this device; nobody else receives them.
// TODO: replace with @errand/api chats.list / chats.messages / chats.send and
// Supabase Realtime (or polling) for new messages. Screens use useChat().
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<SavedChats>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotifications();
  // Always-current copy, so quick sends can't overwrite each other.
  const chatsRef = useRef<SavedChats>(EMPTY);
  const loaded = useRef<Promise<void> | null>(null);

  useEffect(() => {
    loaded.current = loadJSON<SavedChats>(STORAGE_KEYS.chats).then((saved) => {
      chatsRef.current = saved ?? EMPTY;
      setChats(chatsRef.current);
      setIsLoading(false);
    });
  }, []);

  async function commit(change: (current: SavedChats) => SavedChats) {
    await loaded.current;
    chatsRef.current = change(chatsRef.current);
    setChats(chatsRef.current);
    await saveJSON(STORAGE_KEYS.chats, chatsRef.current);
  }

  function addMessage(taskId: string, senderId: string, content: string) {
    const message: Message = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      task_id: taskId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString(),
    };
    return commit((current) => ({ ...current, messages: [...current.messages, message] }));
  }

  function messagesFor(taskId: string) {
    return chats.messages.filter((m) => m.task_id === taskId);
  }

  function unreadCount(taskId: string) {
    const lastRead = chats.lastReadAt[taskId] ?? '';
    return messagesFor(taskId).filter(
      (m) => m.sender_id !== LOCAL_USER_ID && m.created_at > lastRead,
    ).length;
  }

  const totalUnread = [...new Set(chats.messages.map((m) => m.task_id))].reduce(
    (sum, taskId) => sum + unreadCount(taskId),
    0,
  );

  async function sendMessage(taskId: string, content: string) {
    const trimmed = content.trim();
    if (trimmed) await addMessage(taskId, LOCAL_USER_ID, trimmed);
  }

  async function markRead(taskId: string) {
    await commit((current) => ({
      ...current,
      lastReadAt: { ...current.lastReadAt, [taskId]: new Date().toISOString() },
    }));
  }

  async function clearAll() {
    await loaded.current;
    chatsRef.current = EMPTY;
    setChats(EMPTY);
    await removeKey(STORAGE_KEYS.chats);
  }

  async function simulateRunnerReply(taskId: string, runnerId: string) {
    if (!__DEV__) return;
    const sentSoFar = chatsRef.current.messages.filter(
      (m) => m.task_id === taskId && m.sender_id === runnerId,
    ).length;
    await addMessage(taskId, runnerId, nextDevRunnerReply(sentSoFar));
    await notify('new-message', taskId);
  }

  return (
    <ChatContext.Provider
      value={{
        isLoading,
        messagesFor,
        unreadCount,
        totalUnread,
        sendMessage,
        markRead,
        simulateRunnerReply,
        clearAll,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
