import React, { useEffect, useState } from 'react';
import { AdminActivityLog } from '../../types';
import { api } from '../../services/api';
import { ShieldCheck, History, Clock } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminAuditLogs()
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#8A8780]">Loading audit feed...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#FAF9F6] border border-[#D8D4CC] p-6 space-y-4">
        <div className="flex justify-between items-baseline border-b border-[#D8D4CC] pb-3">
          <div>
            <h3 className="font-serif text-xl text-[#171714]">Audit & Activity Log</h3>
            <p className="text-[11px] text-[#56554F]">
              Server-enforced record of price updates, stock movements, and dispatch actions
            </p>
          </div>
          <span className="text-xs uppercase tracking-wider text-[#56554F] font-semibold">
            {logs.length} events
          </span>
        </div>

        <div className="divide-y divide-[#D8D4CC]">
          {logs.map((log) => (
            <div key={log.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#171714] uppercase tracking-wider text-[11px]">
                    {log.action}
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#E6E1D7] text-[#171714] text-[10px] uppercase font-mono">
                    {log.entityType}
                  </span>
                </div>
                <p className="text-[#56554F]">{log.details}</p>
              </div>

              <div className="text-[11px] text-[#8A8780] sm:text-right flex-shrink-0">
                <p>{new Date(log.timestamp).toLocaleString()}</p>
                <p className="text-[10px] text-[#56554F]">{log.adminEmail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
