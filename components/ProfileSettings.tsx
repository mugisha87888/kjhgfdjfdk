import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function ProfileSettings() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when profile loads
  useState(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Account Type</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                profile.isPremium 
                  ? "bg-purple-600 text-white" 
                  : "bg-gray-600 text-gray-300"
              }`}>
                {profile.isPremium ? "Premium" : "Free"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Member Since</span>
              <span className="text-gray-400">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            {profile.isAdmin && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Admin Access</span>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Enabled
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Memory & Data</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>
                {profile.isPremium 
                  ? "Persistent memory - Buddy remembers all conversations"
                  : "2-day memory - Buddy remembers recent conversations"
                }
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>All chat data is encrypted and secure</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>You can delete your chats anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
