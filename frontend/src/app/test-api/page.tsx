'use client';

import { useEffect, useState } from 'react';

export default function TestApi() {
  const [status, setStatus] = useState<string>('Testing...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        // Generate unique email for testing
        const uniqueEmail = `test-${Date.now()}@example.com`;

        // Use Next.js API route
        const res = await fetch('/api/partnership/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: 'Test',
            lastName: 'User',
            email: uniqueEmail,
            phone: '1234567890',
          }),
        });

        const data = await res.json();
        setDetails(data);

        if (res.ok) {
          setStatus('✅ API is working! Request submitted successfully.');
        } else {
          setStatus(`❌ API error: ${res.status}`);
        }
      } catch (error: any) {
        setStatus(`❌ Network error: ${error.message}`);
        setDetails(error.message);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <p className="mb-4">{status}</p>
      {details && (
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}
