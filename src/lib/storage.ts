import { Conversation, Message, SupportedLanguage } from "@/types";

const CONVERSATIONS_KEY_PREFIX = "luna_conversations_";

export function loadUserConversations(uid: string): Conversation[] {
  if (typeof window === "undefined" || !uid) return [];
  try {
    const raw = localStorage.getItem(`${CONVERSATIONS_KEY_PREFIX}${uid}`);
    if (!raw) return [];
    const parsed: Conversation[] = JSON.parse(raw);

    // Ensure completely fresh conversations without any legacy fabricated/mock messages
    const sanitized = parsed.map((c) => {
      const realMessages = (c.messages || []).filter((m) => {
        const text = m.content || "";
        const isLegacyMock =
          text.includes("Help me solve an asynchronous state race condition") ||
          text.includes("That's a thoughtful question to unpack") ||
          text.includes("Tavus Live Stream Preview Mode");
        return !isLegacyMock;
      });

      let title = c.title;
      if (
        title.includes("Help me solve an asynchronous") ||
        (realMessages.length === 0 && title !== "Web Research Exploration")
      ) {
        title = "New Conversation";
      }

      return {
        ...c,
        title,
        messages: realMessages,
      };
    });

    return sanitized;
  } catch (e) {
    console.error("Failed to load user conversations:", e);
    return [];
  }
}

export function saveUserConversations(uid: string, convs: Conversation[]) {
  if (typeof window === "undefined" || !uid) return;
  try {
    localStorage.setItem(`${CONVERSATIONS_KEY_PREFIX}${uid}`, JSON.stringify(convs));
  } catch (e) {
    console.error("Failed to save conversations:", e);
  }
}

export function createNewConversation(
  uid: string,
  language: SupportedLanguage = "en",
  isResearch: boolean = false
): Conversation {
  const newConv: Conversation = {
    id: "conv_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: isResearch ? "Web Research Exploration" : "New Conversation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isResearch,
    language,
    messages: [],
  };
  const list = loadUserConversations(uid);
  // Retain all previous conversations that have messages so history is never lost
  const withMessages = list.filter((c) => c.messages && c.messages.length > 0);
  saveUserConversations(uid, [newConv, ...withMessages]);
  return newConv;
}

export function updateConversationTitle(
  uid: string,
  convId: string,
  newTitle: string
): Conversation[] {
  const list = loadUserConversations(uid);
  const updated = list.map((c) =>
    c.id === convId ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c
  );
  saveUserConversations(uid, updated);
  return updated;
}

export function deleteConversation(uid: string, convId: string): Conversation[] {
  const list = loadUserConversations(uid);
  const updated = list.filter((c) => c.id !== convId);
  saveUserConversations(uid, updated);
  return updated;
}

export function appendMessageToConversation(
  uid: string,
  convId: string,
  msg: Message
): Conversation[] {
  const list = loadUserConversations(uid);
  let found = false;
  const updated = list.map((c) => {
    if (c.id === convId) {
      found = true;
      const messages = [...c.messages, msg];
      // Auto update title from first message if default
      let title = c.title;
      if (
        (title === "New Conversation" || title === "Web Research Exploration") &&
        msg.role === "user"
      ) {
        title = msg.content.slice(0, 32) + (msg.content.length > 32 ? "..." : "");
      }
      return {
        ...c,
        title,
        updatedAt: new Date().toISOString(),
        messages,
      };
    }
    return c;
  });

  // If conversation was not already in storage, prepend it with the message
  if (!found) {
    const newConv: Conversation = {
      id: convId,
      title:
        msg.role === "user"
          ? msg.content.slice(0, 32) + (msg.content.length > 32 ? "..." : "")
          : "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isResearch: msg.isResearch || false,
      language: msg.language || "en",
      messages: [msg],
    };
    updated.unshift(newConv);
  }

  saveUserConversations(uid, updated);
  return updated;
}
