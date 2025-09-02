import React, { useState, useEffect } from 'react';
import { serviceWorkerManager, ServiceWorkerStatus } from '../services/serviceWorkerManager';

export const ServiceWorkerStatus: React.FC = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isActive: false,
    isControlling: false,
    hasUpdate: false
  });
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Update status every 2 seconds
    const interval = setInterval(() => {
      setStatus(serviceWorkerManager.getStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTestProxy = async () => {
    setIsTesting(true);
    setTestResult('Testing...');
    
    try {
      const result = await serviceWorkerManager.testProxy();
      setTestResult(result ? '✅ Proxy test successful!' : '❌ Proxy test failed');
    } catch (error) {
      setTestResult(`❌ Proxy test error: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdate = async () => {
    await serviceWorkerManager.update();
  };

  const handleSkipWaiting = async () => {
    await serviceWorkerManager.skipWaiting();
  };

  if (!serviceWorkerManager.isSupported()) {
    return (
      <div style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
        <strong>⚠️ Service Workers not supported</strong>
        <p>Your browser doesn't support Service Workers. The help system will fall back to direct GitHub access.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '6px',
      margin: '10px 0',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔧 Service Worker Status</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Registration:</strong> {status.isRegistered ? '✅ Yes' : '❌ No'}<br/>
        <strong>Active:</strong> {status.isActive ? '✅ Yes' : '❌ No'}<br/>
        <strong>Controlling:</strong> {status.isControlling ? '✅ Yes' : '❌ No'}<br/>
        <strong>Update Available:</strong> {status.hasUpdate ? '🔄 Yes' : '❌ No'}<br/>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleTestProxy}
          disabled={isTesting}
          style={{ 
            marginRight: '5px',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {isTesting ? 'Testing...' : 'Test Proxy'}
        </button>
        
        {status.hasUpdate && (
          <>
            <button 
              onClick={handleUpdate}
              style={{ 
                marginRight: '5px',
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Update
            </button>
            <button 
              onClick={handleSkipWaiting}
              style={{ 
                padding: '5px 10px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Skip Waiting
            </button>
          </>
        )}
      </div>

      {testResult && (
        <div style={{ 
          padding: '8px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '3px',
          color: testResult.includes('✅') ? '#155724' : '#721c24'
        }}>
          {testResult}
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#6c757d' }}>
        <strong>Current Mode:</strong> {window.location.hostname === 'peka01.github.io' ? '🌐 GitHub Pages (Service Worker Proxy)' : 
                                       window.location.hostname === 'localhost' ? '🔧 Development (Direct GitHub)' : 
                                       '🚀 Production (nginx Proxy)'}
      </div>
    </div>
  );
};
