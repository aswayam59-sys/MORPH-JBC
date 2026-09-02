import React from 'react';
import { useEvent } from '../context/EventContext';
import { Bell, CheckCheck, Trash2, X, Shield, Shuffle, Zap, Gavel, AlertTriangle, CreditCard } from 'lucide-react';

interface AdminNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationsDrawer: React.FC<AdminNotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const { adminNotifications, markNotificationsRead, clearNotifications } = useEvent();

  if (!isOpen) return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'swap_blocked':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'swap_success':
        return <Shuffle className="w-4 h-4 text-blue-400" />;
      case 'boost_used':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'auction_win':
        return <Gavel className="w-4 h-4 text-amber-400" />;
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'purchase':
      default:
        return <CreditCard className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getNotifBorder = (type: string) => {
    switch (type) {
      case 'swap_blocked':
        return 'border-emerald-800/60 bg-emerald-950/30';
      case 'swap_success':
        return 'border-blue-800/60 bg-blue-950/30';
      case 'boost_used':
        return 'border-purple-800/60 bg-purple-950/30';
      case 'auction_win':
        return 'border-amber-800/60 bg-amber-950/30';
      case 'conflict':
        return 'border-red-800/60 bg-red-950/30';
      case 'purchase':
      default:
        return 'border-neutral-800 bg-neutral-950';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end">
      <div className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full flex flex-col font-mono shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-900 border border-neutral-800 text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest text-neutral-100 uppercase">
                ADMIN NOTIFICATIONS
              </h3>
              <span className="text-[10px] text-neutral-500">
                Live action feed ({adminNotifications.length} events)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 bg-neutral-900 border border-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={markNotificationsRead}
            className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 cursor-pointer text-[11px]"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearNotifications}
            className="text-neutral-500 hover:text-red-400 flex items-center gap-1.5 cursor-pointer text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear log
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {adminNotifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 text-xs space-y-2">
              <Bell className="w-8 h-8 text-neutral-700" />
              <p className="font-semibold text-neutral-400">No active notifications.</p>
              <p className="text-[11px] text-neutral-600">
                Purchases, SWAP events, SAFE protections, and Brand Conflicts will appear here in real-time.
              </p>
            </div>
          ) : (
            adminNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 border text-xs space-y-1.5 transition ${getNotifBorder(notif.type)} ${
                  !notif.read ? 'ring-1 ring-amber-500/40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getNotifIcon(notif.type)}
                    <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-200">
                      {notif.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{notif.timestamp}</span>
                </div>

                <p className="text-neutral-300 text-xs leading-relaxed font-sans font-medium">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
