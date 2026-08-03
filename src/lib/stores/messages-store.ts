"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, Conversation } from "@/lib/types";

interface SendInput {
  conversation_id: string;
  text: string;
  image?: string;
  role?: "customer" | "store";
}

interface OpenInput {
  store_id: string;
  product_id?: string;
}

interface MessagesState {
  conversations: Conversation[];
  messages: ChatMessage[];
  /** Returns the existing conversation for this store (+ product) or creates one. */
  openConversation: (input: OpenInput) => Conversation;
  send: (input: SendInput) => ChatMessage;
  markRead: (conversationId: string, side?: "customer" | "store") => void;
  /** Test helper — clear everything (used by dev). */
  clear: () => void;
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const NOW = Date.now();

// Seed conversations + messages so /messages and /seller/messages have content.
const SEED_CONVOS: Conversation[] = [
  {
    id: "c-seed-1",
    store_id: "store-001",
    product_id: "p-003",
    created_at: new Date(NOW - HOUR * 4).toISOString(),
    updated_at: new Date(NOW - MINUTE * 12).toISOString(),
    unread_count: 1,
  },
  {
    id: "c-seed-2",
    store_id: "store-002",
    product_id: "p-032",
    created_at: new Date(NOW - HOUR * 22).toISOString(),
    updated_at: new Date(NOW - HOUR * 2).toISOString(),
    unread_count: 0,
  },
  {
    id: "c-seed-3",
    store_id: "store-009",
    created_at: new Date(NOW - HOUR * 30).toISOString(),
    updated_at: new Date(NOW - HOUR * 28).toISOString(),
    unread_count: 0,
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: makeId("m"),
    conversation_id: "c-seed-1",
    role: "customer",
    text: "Hi, is the Evening Abaya with stone detail still available in size M?",
    created_at: new Date(NOW - HOUR * 4).toISOString(),
    read: true,
  },
  {
    id: makeId("m"),
    conversation_id: "c-seed-1",
    role: "store",
    text: "Yes it is. Would you like to reserve it for pickup today?",
    created_at: new Date(NOW - HOUR * 4 + MINUTE * 6).toISOString(),
    read: true,
  },
  {
    id: makeId("m"),
    conversation_id: "c-seed-1",
    role: "store",
    text: "We can also hold it for 2 hours if you can pass by Qurum.",
    created_at: new Date(NOW - MINUTE * 12).toISOString(),
    read: false,
  },
  {
    id: makeId("m"),
    conversation_id: "c-seed-2",
    role: "customer",
    text: "Do you have a smaller pack of Oud Areen?",
    created_at: new Date(NOW - HOUR * 22).toISOString(),
    read: true,
  },
  {
    id: makeId("m"),
    conversation_id: "c-seed-2",
    role: "store",
    text: "We have a 30g pack at OMR 18. Want me to set it aside?",
    created_at: new Date(NOW - HOUR * 2).toISOString(),
    read: true,
  },
  {
    id: makeId("m"),
    conversation_id: "c-seed-3",
    role: "customer",
    text: "What time do you close on Friday?",
    created_at: new Date(NOW - HOUR * 30).toISOString(),
    read: true,
  },
  {
    id: makeId("m"),
    conversation_id: "c-seed-3",
    role: "store",
    text: "We close at 10pm. See you then!",
    created_at: new Date(NOW - HOUR * 28).toISOString(),
    read: true,
  },
];

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: SEED_CONVOS,
      messages: SEED_MESSAGES,

      openConversation: ({ store_id, product_id }) => {
        const existing = get().conversations.find(
          (c) => c.store_id === store_id && c.product_id === product_id,
        );
        if (existing) return existing;
        const convo: Conversation = {
          id: makeId("c"),
          store_id,
          product_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          unread_count: 0,
        };
        set((s) => ({ conversations: [convo, ...s.conversations] }));
        return convo;
      },

      send: ({ conversation_id, text, image, role = "customer" }) => {
        const msg: ChatMessage = {
          id: makeId("m"),
          conversation_id,
          role,
          text,
          image,
          created_at: new Date().toISOString(),
          read: role === "customer",
        };
        set((s) => ({
          messages: [...s.messages, msg],
          conversations: s.conversations.map((c) =>
            c.id === conversation_id
              ? {
                  ...c,
                  updated_at: msg.created_at,
                  unread_count:
                    role === "store"
                      ? (c.unread_count ?? 0) + 1
                      : c.unread_count,
                }
              : c,
          ),
        }));
        // Auto-reply: when a customer sends a message, the store replies after
        // a short delay so the prototype feels alive. This only fires for
        // customer messages and never for seller-mode messages.
        if (role === "customer") {
          setTimeout(() => {
            const reply: ChatMessage = {
              id: makeId("m"),
              conversation_id,
              role: "store",
              text: pickAutoReply(text),
              created_at: new Date().toISOString(),
              read: false,
            };
            set((s) => ({
              messages: [...s.messages, reply],
              conversations: s.conversations.map((c) =>
                c.id === conversation_id
                  ? {
                      ...c,
                      updated_at: reply.created_at,
                      unread_count: (c.unread_count ?? 0) + 1,
                    }
                  : c,
              ),
            }));
          }, 1400);
        }
        return msg;
      },

      markRead: (conversationId, side = "customer") =>
        set((s) => {
          // Only rebuild state if something actually changed — otherwise we
          // generate new array references on every call, which triggers
          // useEffect loops in the chat screen.
          const convoToUpdate = s.conversations.find(
            (c) =>
              c.id === conversationId &&
              side === "customer" &&
              (c.unread_count ?? 0) > 0,
          );
          const unreadMsgsExist = s.messages.some(
            (m) =>
              m.conversation_id === conversationId &&
              !m.read &&
              ((side === "customer" && m.role === "store") ||
                (side === "store" && m.role === "customer")),
          );
          if (!convoToUpdate && !unreadMsgsExist) return s;

          return {
            conversations: convoToUpdate
              ? s.conversations.map((c) =>
                  c.id === conversationId
                    ? { ...c, unread_count: 0 }
                    : c,
                )
              : s.conversations,
            messages: unreadMsgsExist
              ? s.messages.map((m) =>
                  m.conversation_id === conversationId &&
                  !m.read &&
                  ((side === "customer" && m.role === "store") ||
                    (side === "store" && m.role === "customer"))
                    ? { ...m, read: true }
                    : m,
                )
              : s.messages,
          };
        }),

      clear: () => set({ conversations: [], messages: [] }),
    }),
    {
      name: "nearby:messages",
      version: 1,
    },
  ),
);

const REPLIES = [
  "Thanks for reaching out! Let me check and confirm in a minute.",
  "Yes, still available — would you like us to reserve it for 2 hours?",
  "I'll check the stock and come back to you shortly.",
  "Of course! Feel free to pass by the store today.",
  "We can arrange delivery within Muscat for a small fee.",
];

function pickAutoReply(customerText: string) {
  const t = customerText.toLowerCase();
  if (t.includes("reserve") || t.includes("hold"))
    return "Sure, we can hold it for 2 hours under your name.";
  if (t.includes("size") || t.includes("color"))
    return "Yes we have it in stock. Which one would you like?";
  if (t.includes("locat") || t.includes("where"))
    return "We're inside City Centre Qurum on the ground floor. We have a green sign.";
  if (t.includes("available") || t.includes("still"))
    return "Yes, still available! Want me to reserve it for you?";
  return REPLIES[Math.floor(Math.random() * REPLIES.length)];
}
