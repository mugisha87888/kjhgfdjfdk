import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { SignOutButton } from "../SignOutButton";
import ChatInterface from "./ChatInterface";
import PremiumUpgrade from "./PremiumUpgrade";
import ProfileSettings from "./ProfileSettings";

export default function Dashboard() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const chats = useQuery(api.chats.getUserChats);
  const createChat = useMutation(api.chats.createChat);
  const createProfile = useMutation(api.profiles.createProfile);
  const navigate = useNavigate();

  // Create profile if it doesn't exist
  useEffect(() => {
    if (profile === null) {
      createProfile({});
    }
  }, [profile, createProfile]);

  const handleNewChat = async () => {
    try {
      const chatId = await createChat({});
      navigate(`/dashboard/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-white">
              Buddy<span className="text-purple-400">AI</span>
            </Link>
            <SignOutButton />
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {profile.displayName}
            {profile.isPremium && (
              <span className="ml-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                Premium
              </span>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            + New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent Chats</h3>
            <div className="space-y-1">
              {chats?.map((chat) => (
                <Link
                  key={chat._id}
                  to={`/dashboard/chat/${chat._id}`}
                  className="block p-2 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="truncate">{chat.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(chat.lastMessageAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            to="/dashboard/premium"
            className="block text-gray-300 hover:text-white transition-colors"
          >
            {profile.isPremium ? "Premium Status" : "Upgrade to Premium"}
          </Link>
          <Link
            to="/dashboard/settings"
            className="block text-gray-300 hover:text-white transition-colors"
          >
            Settings
          </Link>
          {profile.isAdmin && (
            <Link
              to="/admin"
              className="block text-purple-400 hover:text-purple-300 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/chat/:chatId" element={<ChatInterface />} />
          <Route path="/premium" element={<PremiumUpgrade />} />
          <Route path="/settings" element={<ProfileSettings />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardHome() {
  const profile = useQuery(api.profiles.getCurrentProfile);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Hey there, {profile?.displayName}!
        </h1>
        <p className="text-gray-400 mb-8">
          Ready to chat with Buddy? Start a new conversation or continue where you left off.
        </p>
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-white mb-2">💬 Unlimited Conversations</h3>
            <p className="text-gray-400 text-sm">
              Chat as much as you want with your AI buddy
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-white mb-2">
              🧠 {profile?.isPremium ? "Persistent Memory" : "2-Day Memory"}
            </h3>
            <p className="text-gray-400 text-sm">
              {profile?.isPremium 
                ? "Buddy remembers everything about your friendship"
                : "Buddy remembers your recent conversations"
              }
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-white mb-2">😊 Caring & Funny</h3>
            <p className="text-gray-400 text-sm">
              Your AI friend who genuinely cares and loves to laugh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
