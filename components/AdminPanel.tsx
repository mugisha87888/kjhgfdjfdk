import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Routes, Route, Link } from "react-router-dom";
import { toast } from "sonner";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/admin"
            className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded transition-colors"
          >
            Users
          </Link>
          <Link
            to="/admin/premium-requests"
            className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded transition-colors"
          >
            Premium Requests
          </Link>
          <Link
            to="/dashboard"
            className="block text-purple-400 hover:text-purple-300 px-3 py-2 rounded transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </nav>
      </div>

      {/* Admin Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/premium-requests" element={<PremiumRequests />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const analytics = useQuery(api.admin.getAnalytics);

  if (!analytics) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-purple-400">{analytics.totalUsers}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Premium Users</h3>
          <p className="text-3xl font-bold text-green-400">{analytics.premiumUsers}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Chats</h3>
          <p className="text-3xl font-bold text-blue-400">{analytics.totalChats}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Total Messages</h3>
          <p className="text-3xl font-bold text-yellow-400">{analytics.totalMessages}</p>
        </div>
      </div>

      {analytics.pendingRequests > 0 && (
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            Pending Premium Requests
          </h3>
          <p className="text-yellow-200 mb-4">
            You have {analytics.pendingRequests} premium request{analytics.pendingRequests !== 1 ? 's' : ''} waiting for review.
          </p>
          <Link
            to="/admin/premium-requests"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Review Requests
          </Link>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Free Users</span>
            <span className="text-gray-400">{analytics.freeUsers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Premium Conversion Rate</span>
            <span className="text-gray-400">
              {analytics.totalUsers > 0 
                ? Math.round((analytics.premiumUsers / analytics.totalUsers) * 100)
                : 0
              }%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Avg Messages per User</span>
            <span className="text-gray-400">
              {analytics.totalUsers > 0 
                ? Math.round(analytics.totalMessages / analytics.totalUsers)
                : 0
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const users = useQuery(api.admin.getAllUsers);
  const makeAdmin = useMutation(api.admin.makeUserAdmin);
  const removeAdmin = useMutation(api.admin.removeUserAdmin);
  const revokePremium = useMutation(api.premium.revokePremium);

  const handleMakeAdmin = async (userId: string) => {
    try {
      await makeAdmin({ userId: userId as any });
      toast.success("User granted admin access");
    } catch (error) {
      toast.error("Failed to grant admin access");
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      await removeAdmin({ userId: userId as any });
      toast.success("Admin access removed");
    } catch (error) {
      toast.error("Failed to remove admin access");
    }
  };

  const handleRevokePremium = async (userId: string) => {
    try {
      await revokePremium({ userId: userId as any });
      toast.success("Premium access revoked");
    } catch (error) {
      toast.error("Failed to revoke premium access");
    }
  };

  if (!users) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
      
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.user.name || user.displayName}
                      </div>
                      <div className="text-sm text-gray-400">{user.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {user.isPremium && (
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                          Premium
                        </span>
                      )}
                      {user.isAdmin && (
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                          Admin
                        </span>
                      )}
                      {!user.isPremium && !user.isAdmin && (
                        <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                          Free
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.messageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {!user.isAdmin ? (
                      <button
                        onClick={() => handleMakeAdmin(user.userId)}
                        className="text-green-400 hover:text-green-300"
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemoveAdmin(user.userId)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove Admin
                      </button>
                    )}
                    {user.isPremium && (
                      <button
                        onClick={() => handleRevokePremium(user.userId)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        Revoke Premium
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PremiumRequests() {
  const requests = useQuery(api.premium.getAllPremiumRequests);
  const approveRequest = useMutation(api.premium.approvePremiumRequest);
  const rejectRequest = useMutation(api.premium.rejectPremiumRequest);
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleApprove = async (requestId: string) => {
    try {
      const expiresAt = expirationDate ? new Date(expirationDate).getTime() : undefined;
      await approveRequest({
        requestId: requestId as any,
        expiresAt,
        notes: notes || undefined,
      });
      toast.success("Premium request approved!");
      setSelectedRequest(null);
      setExpirationDate("");
      setNotes("");
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest({
        requestId: requestId as any,
        notes: notes || undefined,
      });
      toast.success("Premium request rejected");
      setSelectedRequest(null);
      setNotes("");
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  if (!requests) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "pending");
  const processedRequests = requests.filter(r => r.status !== "pending");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Premium Requests</h1>
      
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Requests</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pendingRequests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {request.user.name}
                          </div>
                          <div className="text-sm text-gray-400">{request.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.paymentMethod === "stripe" 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-600 text-gray-300"
                        }`}>
                          {request.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {request.paymentReference || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request._id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Processed Requests</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {processedRequests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {request.user.name}
                          </div>
                          <div className="text-sm text-gray-400">{request.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === "approved" 
                            ? "bg-green-600 text-white" 
                            : "bg-red-600 text-white"
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {request.notes || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Review Premium Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Leave empty for permanent premium access
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setExpirationDate("");
                    setNotes("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
