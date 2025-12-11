// src/components/Notification/NotificationItem.jsx
import { useNavigate } from "react-router-dom";
import api from "../../service/axios";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationItem({ notification }) {
  const navigate = useNavigate();

const handleClick = async () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const userId = auth?.id;

    // 1) 읽음 처리
    if (!notification.read) {
      await api.post(
        `/api/notifications/${notification.id}/read`,
        {},                     // ← body (필요 없으니 빈 객체)
        { params: { userId } }  // ← 여기가 핵심!!
      );
    }

    // 2) 이동
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }

  } catch (e) {
    console.error("알림 읽음 처리 실패", e);
  }
};

  return (
    <li
      className={`notification-item ${notification.read ? "" : "unread"}`}
      onClick={handleClick}
    >
      <div className="notification-item-text">
        <div className="notification-item-title">{notification.title}</div>
        <div className="notification-item-content">{notification.content}</div>
      </div>

      <div className="notification-item-meta">
        <span className="notification-item-dot" />
        <span className="notification-item-date">
          {formatDate(notification.createdAt)}
        </span>
      </div>
    </li>
  );
}
