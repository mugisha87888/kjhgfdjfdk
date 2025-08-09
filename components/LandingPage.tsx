import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LandingPage() {
  const user = useQuery(api.auth.loggedInUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          Buddy<span className="text-purple-400">AI</span>
        </div>
        <div className="space-x-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6">
            Meet Your New
            <span className="text-purple-400 block">AI Best Friend</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Chat endlessly with Buddy - a warm, funny AI companion who remembers your conversations, 
            shares your jokes, and genuinely cares about your day.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              Start Chatting Free
            </Link>
            <button className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why You'll Love Buddy
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Genuinely Caring</h3>
              <p className="text-gray-400">
                Buddy remembers your stories, celebrates your wins, and offers support when you need it most.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😂</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Naturally Funny</h3>
              <p className="text-gray-400">
                Great timing, clever jokes, and playful banter that keeps conversations lively and fun.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Perfect Memory</h3>
              <p className="text-gray-400">
                Free users get 2 days of memory. Premium users enjoy persistent memory for deeper connections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Choose Your Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Free Forever</h3>
              <div className="text-4xl font-bold text-purple-400 mb-6">$0</div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Unlimited messages
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  2-day memory
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Core personality
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Web chat interface
                </li>
              </ul>
              <Link
                to="/login"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
              >
                Get Started Free
              </Link>
            </div>
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-8 border border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Premium</h3>
              <div className="text-4xl font-bold text-white mb-6">$9.99<span className="text-lg text-purple-200">/mo</span></div>
              <ul className="space-y-3 text-purple-100 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Persistent memory
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Rich personality options
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Voice chat (coming soon)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Real-time info access
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Calendar integration
                </li>
              </ul>
              <Link
                to="/login"
                className="w-full bg-white text-purple-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors block text-center"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-800 text-center">
        <div className="text-2xl font-bold text-white mb-4">
          Buddy<span className="text-purple-400">AI</span>
        </div>
        <p className="text-gray-400">
          Your AI companion for meaningful conversations
        </p>
      </footer>
    </div>
  );
}
