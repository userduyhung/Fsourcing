import React, { useEffect, useState } from 'react';

interface AuditEntry {
  id: number;
  action: string;
  user: string;
  target: string;
  time: string;
  detail?: string;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    // Giả lập lấy log từ localStorage
    const saved = localStorage.getItem('auditLogs');
    if (saved) {
      setLogs(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Lịch sử duyệt / block user</h2>
        {logs.length === 0 ? (
          <div className="text-center text-gray-500">Chưa có lịch sử hoạt động.</div>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3">Thời gian</th>
                <th className="py-2 px-3">Hành động</th>
                <th className="py-2 px-3">Người thực hiện</th>
                <th className="py-2 px-3">Đối tượng</th>
                <th className="py-2 px-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b">
                  <td className="py-2 px-3 text-gray-500">{log.time}</td>
                  <td className="py-2 px-3 font-medium">{log.action}</td>
                  <td className="py-2 px-3">{log.user}</td>
                  <td className="py-2 px-3">{log.target}</td>
                  <td className="py-2 px-3">{log.detail || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
