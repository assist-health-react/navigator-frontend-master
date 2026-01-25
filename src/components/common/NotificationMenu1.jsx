// import { useState } from 'react'
// import { FaBell, FaCircle } from 'react-icons/fa'

// export const NotificationMenu = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [notifications] = useState([
//     {
//       id: 1,
//       title: 'New Appointment',
//       message: 'Dr. Smith has confirmed your appointment',
//       time: '5 min ago',
//       isRead: false
//     },
//     {
//       id: 2,
//       title: 'Reminder',
//       message: 'Your appointment is scheduled for tomorrow',
//       time: '1 hour ago',
//       isRead: false
//     },
//     {
//       id: 3,
//       title: 'System Update',
//       message: 'The system will be under maintenance',
//       time: '2 hours ago',
//       isRead: true
//     }
//   ])

//   const unreadCount = notifications.filter(n => !n.isRead).length

//   return (
//     <>
//       <div className="relative">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//         >
//           <FaBell className="w-6 h-6" />
//           {unreadCount > 0 && (
//             <span className="absolute top-1 right-1 flex">
//               <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
//             </span>
//           )}
//         </button>

//         {isOpen && (
//           <>
//             <div className="fixed inset-0 bg-black bg-opacity-25 z-[998]" onClick={() => setIsOpen(false)}></div>
//             <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-1 z-[999]">
//               <div className="px-4 py-2 border-b border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
//                 {unreadCount > 0 && (
//                   <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
//                 )}
//               </div>
//               <div className="max-h-96 overflow-y-auto">
//                 {notifications.length > 0 ? (
//                   notifications.map(notification => (
//                     <div
//                       key={notification.id}
//                       className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
//                         !notification.isRead ? 'bg-blue-50' : ''
//                       }`}
//                     >
//                       <div className="flex items-start gap-3">
//                         {!notification.isRead && (
//                           <FaCircle className="w-2 h-2 mt-2 text-blue-500" />
//                         )}
//                         <div className="flex-1">
//                           <h4 className="text-sm font-medium text-gray-800">
//                             {notification.title}
//                           </h4>
//                           <p className="text-sm text-gray-600">{notification.message}</p>
//                           <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="px-4 py-6 text-center text-gray-500">
//                     No notifications
//                   </div>
//                 )}
//               </div>
//               {notifications.length > 0 && (
//                 <div className="px-4 py-2 border-t border-gray-200">
//                   <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
//                     Mark all as read
//                   </button>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   )
// } 
import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../../services/notification.api';
console.log('🔥 NotificationMenu RENDERED');

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  // LOAD notifications
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchNotifications();
        setNotifications(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error('Notification fetch failed', e);
      }
    };
    load();
  }, []);

  // UNREAD notifications (single source of truth)
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // CLICK notification
  const handleClick = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      setNotifications(prev =>
        prev.map(x => x._id === n._id ? { ...x, isRead: true } : x)
      );
    }
    setIsOpen(false);
    navigate(n.actionUrl);
  };

  // MARK ALL READ
  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <FaBell className="w-6 h-6" />
        {unreadNotifications.length > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-[998]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-[999]">
            <div className="px-4 py-2 border-b">
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className="px-4 py-3 cursor-pointer bg-blue-50 hover:bg-blue-100"
                  >
                    <h4 className="text-sm font-medium">{n.title}</h4>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  No new notifications
                </div>
              )}
            </div>

            {unreadNotifications.length > 0 && (
              <div className="px-4 py-2 border-t">
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-500"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationMenu;
