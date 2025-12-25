'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authCode = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError(authError);
    } else if (authCode) {
      setCode(authCode);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-purple-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Google Calendar OAuth
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-red-800 font-semibold mb-2">Authorization Error</h2>
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {code && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="text-green-800 font-semibold mb-2">✅ Authorization Successful!</h2>
              <p className="text-green-600">Copy the code below and paste it into your terminal.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authorization Code:
              </label>
              <div className="relative">
                <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm break-all">
                  {code}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    alert('Code copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-semibold mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                <li>Click the "Copy" button above (or manually copy the code)</li>
                <li>Go back to your terminal where <code className="bg-blue-100 px-1 rounded">get-refresh-token.js</code> is running</li>
                <li>Paste the code when prompted</li>
                <li>Copy the refresh token and add it to your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
              </ol>
            </div>
          </>
        )}

        {!code && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-yellow-800 font-semibold mb-2">⏳ Waiting for authorization...</h2>
            <p className="text-yellow-700">Complete the OAuth flow in the popup window.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
