import React, { useState, useEffect } from 'react';
import { X, Terminal } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  type: 'request' | 'response' | 'error';
  title: string;
  data: any;
}

const DebugLogger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Intercept console.log for specific patterns
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      originalLog(...args);

      const message = args[0];
      if (typeof message === 'string') {
        if (message.includes('Request:')) {
          setLogs((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString(),
              type: 'request',
              title: message,
              data: args[1],
            },
          ]);
        } else if (message.includes('Response:')) {
          setLogs((prev) => [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString(),
              type: 'response',
              title: message,
              data: args[1],
            },
          ]);
        }
      }
    };

    console.error = (...args: any[]) => {
      originalError(...args);

      const message = args[0];
      if (typeof message === 'string' && message.includes('Error:')) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            type: 'error',
            title: message,
            data: args[1] || args[0],
          },
        ]);
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 z-50"
      >
        <Terminal className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden z-50 font-mono text-xs">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-semibold">Debug Logger</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-80 p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            Waiting for API calls...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded border-l-4 ${
                log.type === 'request'
                  ? 'bg-blue-900/30 border-blue-500'
                  : log.type === 'response'
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-red-900/30 border-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs">{log.timestamp}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    log.type === 'request'
                      ? 'bg-blue-500/30 text-blue-300'
                      : log.type === 'response'
                      ? 'bg-green-500/30 text-green-300'
                      : 'bg-red-500/30 text-red-300'
                  }`}
                >
                  {log.type.toUpperCase()}
                </span>
              </div>
              <div className="font-semibold mb-1">{log.title}</div>
              <pre className="text-xs overflow-x-auto bg-black/30 p-2 rounded">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex justify-between">
        <span>{logs.length} log(s)</span>
        <button
          onClick={() => setLogs([])}
          className="text-blue-400 hover:text-blue-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DebugLogger;
