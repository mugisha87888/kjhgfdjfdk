import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function PremiumUpgrade() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const premiumRequest = useQuery(api.premium.getUserPremiumRequest);
  const requestPremium = useMutation(api.premium.requestPremium);
  
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "external">("stripe");
  const [paymentReference, setPaymentReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await requestPremium({
        paymentMethod,
        paymentReference: paymentReference || undefined,
      });
      toast.success("Premium request submitted! We'll review it shortly.");
      setPaymentReference("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (profile?.isPremium) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">You're Premium!</h1>
            <p className="text-purple-200 mb-6">
              Enjoy all the premium features including persistent memory, rich personality options, and more.
            </p>
            {profile.premiumExpiresAt && (
              <p className="text-purple-300">
                Your premium access expires on {new Date(profile.premiumExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Premium Features</h2>
            <div className="space-y-3">
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span>Persistent memory - Buddy remembers everything</span>
              </div>
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span>Rich personality options</span>
              </div>
              <div className="flex items-center text-gray-400">
                <span className="mr-2">⏳</span>
                <span>Voice chat (coming soon)</span>
              </div>
              <div className="flex items-center text-gray-400">
                <span className="mr-2">⏳</span>
                <span>Real-time information access (coming soon)</span>
              </div>
              <div className="flex items-center text-gray-400">
                <span className="mr-2">⏳</span>
                <span>Calendar integration (coming soon)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Upgrade to Premium</h1>
          <p className="text-gray-400">
            Unlock persistent memory and advanced features for deeper conversations with Buddy
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Premium Plan</h2>
            <div className="text-4xl font-bold text-white mb-6">
              $9.99<span className="text-lg text-purple-200">/month</span>
            </div>
            <ul className="space-y-3 text-purple-100 mb-8">
              <li className="flex items-center justify-center">
                <span className="text-green-400 mr-2">✓</span>
                Everything in Free
              </li>
              <li className="flex items-center justify-center">
                <span className="text-green-400 mr-2">✓</span>
                Persistent memory
              </li>
              <li className="flex items-center justify-center">
                <span className="text-green-400 mr-2">✓</span>
                Rich personality options
              </li>
              <li className="flex items-center justify-center">
                <span className="text-green-400 mr-2">✓</span>
                Priority support
              </li>
            </ul>
          </div>
        </div>

        {/* Request Form */}
        {premiumRequest?.status === "pending" ? (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-xl p-6 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Request Pending</h3>
            <p className="text-yellow-200">
              Your premium request is being reviewed. We'll update your account once approved!
            </p>
            {premiumRequest.paymentReference && (
              <p className="text-sm text-yellow-300 mt-2">
                Reference: {premiumRequest.paymentReference}
              </p>
            )}
          </div>
        ) : premiumRequest?.status === "rejected" ? (
          <div className="bg-red-900/50 border border-red-600 rounded-xl p-6 mb-6">
            <div className="text-2xl mb-2">❌</div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Request Rejected</h3>
            <p className="text-red-200">
              Your premium request was not approved. Please contact support for more information.
            </p>
            {premiumRequest.notes && (
              <p className="text-sm text-red-300 mt-2">
                Note: {premiumRequest.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Request Premium Access</h3>
            <p className="text-gray-400 mb-6">
              Complete your payment and submit a request for premium access. Our team will review and activate your premium features.
            </p>

            <form onSubmit={handleRequestPremium} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={(e) => setPaymentMethod(e.target.value as "stripe")}
                      className="mr-2"
                    />
                    <span className="text-gray-300">Stripe (Credit Card)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="external"
                      checked={paymentMethod === "external"}
                      onChange={(e) => setPaymentMethod(e.target.value as "external")}
                      className="mr-2"
                    />
                    <span className="text-gray-300">External Payment (PayPal, Bank Transfer, etc.)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, receipt number, etc."
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Include any payment confirmation details to help us verify your payment
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Request Premium Access"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
