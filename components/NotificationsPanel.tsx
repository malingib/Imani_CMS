
import React from 'react';
import { 
  Bell, 
  X, 
  Smartphone, 
  UserPlus, 
  Calendar, 
  Info, 
  CheckCircle2, 
  Trash2, 
  Clock 
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDelete 
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'MPESA': return <Smartphone className="text-emerald-500" size={18} />;
      case 'MEMBER': return <UserPlus className="text-indigo-500" size={18} />;
      case 'EVENT': return <Calendar className="text-amber-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 lg:w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[100] animate-in slide-in-from-top-2 duration-200 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Bell size={18} />
          </div>
          <h3 className="font-black text-slate-800 tracking-tight">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <button 
              onClick={onMarkAllAsRead}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-50 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Bell className="text-slate-200" size={32} />
            </div>
            <p className="text-slate-400 font-bold">All caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors relative group ${!notification.read ? 'bg-indigo-50/10' : ''}`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className={`mt-1 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-black text-slate-800 leading-tight ${!notification.read ? 'pr-3' : ''}`}>
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 animate-pulse mt-1" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {notification.message}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black uppercase text-slate-300 flex items-center gap-1 tracking-tighter">
                    <Clock size={10} /> {notification.time}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all rounded-lg"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
