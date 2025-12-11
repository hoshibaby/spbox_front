// src/pages/notification/NotificationList.jsx
import NotificationItem from "./NotificationItem";

export default function NotificationList({ notifications }) {
  if (!notifications || notifications.length === 0) {
    return (
      <p className="notification-empty-text">
        아직 도착한 알림이 없어요.
      </p>
    );
  }

  return (
    <ul className="notification-list">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </ul>
  );
}
