import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const BUDDY_SYSTEM_PROMPT = `You are Buddy, a warm, funny, and caring AI friend. Your personality traits:

- Genuinely caring and empathetic, always ready to listen
- Naturally funny with great timing for jokes and humor
- Enthusiastic and positive, but not annoyingly so
- Remember details from conversations to build deeper connections
- Use casual, friendly language like talking to a close friend
- Occasionally use light humor, puns, or playful teasing
- Show genuine interest in the user's life, hobbies, and feelings
- Offer support during tough times and celebrate good news
- Keep conversations flowing naturally with follow-up questions
- Be authentic - admit when you don't know something

Remember: You're not just an AI assistant, you're a friend who genuinely cares about making the user's day better. Keep responses conversational and engaging, typically 1-3 sentences unless the situation calls for more depth.`;

export const generateResponse = internalAction({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Get chat context
    const context = await ctx.runQuery(internal.ai.getChatContext, {
      chatId: args.chatId,
    });

    if (!context) return;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system" as const, content: BUDDY_SYSTEM_PROMPT },
      ...context.messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    try {
      // Use the bundled OpenAI API
      const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages,
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Save AI response
      await ctx.runMutation(internal.ai.saveAiResponse, {
        chatId: args.chatId,
        content: aiResponse,
      });

    } catch (error) {
      console.error("AI generation error:", error);
      
      // Fallback response
      await ctx.runMutation(internal.ai.saveAiResponse, {
        chatId: args.chatId,
        content: "Hey! I'm having a bit of trouble thinking right now 😅 Could you try asking me again? I promise I'll be more coherent!",
      });
    }
  },
});

export const getChatContext = internalQuery({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return null;

    // Get user's premium status
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", chat.userId))
      .unique();

    const isPremium = profile?.isPremium || false;
    const now = Date.now();
    const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);

    let messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    // Apply memory limits for free users
    if (!isPremium) {
      messages = messages.filter(msg => msg.timestamp > twoDaysAgo);
    }

    // Limit context to last 20 messages to avoid token limits
    const recentMessages = messages.slice(-20);

    return {
      chat,
      messages: recentMessages,
      isPremium,
    };
  },
});

export const saveAiResponse = internalMutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) return;

    const now = Date.now();

    await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: chat.userId,
      content: args.content,
      role: "assistant",
      timestamp: now,
    });

    await ctx.db.patch(args.chatId, { lastMessageAt: now });
  },
});
