// src/pages/notification/NotificationPage.jsx
import { useState, useEffect } from "react";
import api from "../../service/axios";

import NotificationFilterTabs from "../../components/Notification/NotificationFilterTabs";
import NotificationList from "./NotificationList";
import "./notification.css";

const FILTERS = [
  { key: "ALL",         label: "전체" },
  { key: "NEW_MESSAGE", label: "새 메시지" },
  { key: "NEW_REPLY",   label: "답글" },
  { key: "SYSTEM",      label: "처리 알림" },
];

function mapServerNotification(n) {
  console.log("서버 알림 DTO 한 건 >>>", n);

  return {
    id: n.id,
    type: n.type,         // COMMENT, OWNER_REPLY, ...

    // 서버 필드 이름이 message 이니까 그대로 사용
    title: n.message,
    content: n.message,

    createdAt: n.createdAt,
    linkUrl: n.linkUrl,
    read: n.read ?? false,
  };
}

function NotificationPage() {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔐 MyBoxMessages와 완전히 동일하게!
        const auth = JSON.parse(localStorage.getItem("auth") || "null");
        const loginUserPk = auth?.id;

        console.log("NotificationPage loginUserPk >>>", loginUserPk);

        if (!loginUserPk) {
          console.error("로그인 유저 ID 를 찾을 수 없어요.");
          setError("로그인 정보가 없어서 알림을 불러올 수 없어요.");
          setNotifications([]);
          return;
        }

        // ⭐ 백엔드: /api/notifications?userId=...
        const res = await api.get("/api/notifications", {
          params: { userId: loginUserPk },
        });

        console.log("알림 API raw 응답 >>>", res.data);

        if (!Array.isArray(res.data)) {
          console.error("예상과 다른 응답 구조입니다.", res.data);
          setNotifications([]);
          return;
        }

        const mapped = res.data.map(mapServerNotification);
        setNotifications(mapped);
      } catch (err) {
        console.error("알림 조회 실패:", err);
        setError("알림을 불러오는 중 문제가 발생했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === "ALL") return true;

    if (selectedFilter === "NEW_MESSAGE") {
      return n.type === "COMMENT";
    }

    if (selectedFilter === "NEW_REPLY") {
      return n.type === "OWNER_REPLY" || n.type === "AI_REPLY";
    }

    if (selectedFilter === "SYSTEM") {
      return (
        n.type === "SYSTEM_NOTICE" ||
        n.type === "SYSTEM_ALERT" ||
        n.type === "MESSAGE_HIDDEN" ||
        n.type === "USER_BLACKLISTED"
      );
    }

    return true;
  });

  const handleMarkAllRead = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      const userId = auth?.id;

      if (!userId) {
        console.error("로그인 정보가 없어서 모두 읽음 처리를 할 수 없어요.");
        return;
      }

      // 🔥 아직 안 읽은 알림들만 골라서 /read 호출
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) =>
            api.post(
              `/api/notifications/${n.id}/read`,
              {},                    // body 는 없음 → 빈 객체
              { params: { userId } } // ⭐ 여기! 쿼리스트링으로 userId 보내기
            )
          )
      );

      // 프론트 상태도 모두 읽음으로 갱신
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        }))
      );

      console.log("모두 읽음 처리 완료");
    } catch (e) {
      console.error("모두 읽음 처리 실패", e);
    }
  };



  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <h2>내 알림</h2>
        <button
          className="notification-mark-all-btn"
          onClick={handleMarkAllRead}
        >
          모두 읽음 처리
        </button>
      </div>

      <NotificationFilterTabs
        filters={FILTERS}
        selectedFilter={selectedFilter}
        onChange={setSelectedFilter}
      />

      {loading && (
        <p className="notification-info-text">알림을 불러오는 중...</p>
      )}
      {error && <p className="notification-error-text">{error}</p>}

      {!loading && !error && (
        <NotificationList notifications={filteredNotifications} />
      )}
    </div>
  );
}

export default NotificationPage;
