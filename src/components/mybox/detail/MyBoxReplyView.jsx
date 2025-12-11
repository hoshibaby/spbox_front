// src/components/mybox/detail/MyBoxReplyView.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import messageService from "../../../service/message.service";
import notificationService from "../../../service/notification.service";

import MyBoxMidTabs from "../common/MyBoxMidTabs";
import MyBoxSideMenu from "../common/MyBoxSideMenu";
import MyBoxOwnerHeader from "../common/MyBoxOwnerHeader";
import MyBoxMessageCard from "../list/MyBoxMessageCard";

import "../layout/MyBoxLayout.css";
import "../list/MyBoxMessageCard.css";
// 필요하면 여기에 전용 css도 추가
// import "./MyBoxReplyView.css";

function MyBoxReplyView() {
  const [pageData, setPageData] = useState(null); // MessagePageDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  // 🔐 로그인 정보 읽기
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const loginUserPk = auth?.id;
  const addressId = auth?.addressId;

  console.log("MyBoxMessages loginUserPk >>>", loginUserPk);
  console.log("MyBoxMessages addressId >>>", addressId);

  // 작성 시간 포맷 함수
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "";
    return new Date(createdAt).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    // 로그인 안 되어 있으면 로그인 페이지로
    if (!loginUserPk) {
      navigate("/login");
      return;
    }

    // 🔹 답변이 달린 메시지들만 불러오는 함수
    const fetchRepliedMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await messageService.getMyAnsweredMessages(
          loginUserPk,
          0,
          10
        );
        console.log("My Answered MessagePageDTO:", res.data);
        setPageData(res.data);
      } catch (err) {
        console.error(err);
        setError("답변한 메시지 목록을 불러오는 중 오류가 발생했어요.");
      } finally {
        setLoading(false);
      }
    };

    // 🔹 알림 개수 조회
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount(loginUserPk);
        console.log("서버 응답 unread-count:", res.data);

        const count =
          typeof res.data === "number"
            ? res.data
            : typeof res.data?.count === "number"
            ? res.data.count
            : 0;

        setUnreadCount(count);
        console.log("최종 unreadCount 상태:", count);
      } catch (err) {
        console.error("알림 개수 조회 실패", err);
      }
    };

    // 🔥 여기서 두 함수 호출
    fetchRepliedMessages();
    fetchUnreadCount();
  }, [loginUserPk, navigate]);

  // ---------------- 화면 렌더링 ----------------
  if (loading)
    return (
      <div className="mybox-layout">
        <p>불러오는 중...</p>
      </div>
    );

  if (error)
    return (
      <div className="mybox-layout">
        <p className="text-danger">{error}</p>
      </div>
    );

  if (!pageData)
    return (
      <div className="mybox-layout">
        <p>데이터가 없어요.</p>
      </div>
    );

  const messages = pageData.content || [];
  const allowAnonymous = pageData.allowAnonymous ?? true;

  return (
    <div className="mybox-layout">
      {/* 왼쪽 사이드 메뉴 */}
      <MyBoxSideMenu unreadNotificationCount={unreadCount} />

      {/* 오른쪽 메인 영역 */}
      <main className="mybox-main">
        <div className="mybox-main-inner">
          {/* 계정 주인 카드 */}
          <MyBoxOwnerHeader
            nickname={auth?.nickname}
            userHandle={addressId}
            pageData={pageData}
            allowAnonymous={allowAnonymous}
          />

          {/* 중단 탭 (메시지 / 답장) */}
          <MyBoxMidTabs />

          {/* 제목 + 리스트 */}
          <h3 className="mybox-title">
            답변한 메시지들{" "}
            {pageData.page !== undefined &&
              pageData.totalPages !== undefined && (
                <span className="mybox-page-info">
                  (페이지 {pageData.page + 1} / {pageData.totalPages})
                </span>
              )}
          </h3>

          {messages.length === 0 && (
            <div className="mybox-empty">아직 답변한 메시지가 없어요.</div>
          )}

          <div className="mybox-message-list">
            {messages.map((msg) => (
              <MyBoxMessageCard
                key={msg.id}
                detail={msg}
                formattedCreatedAt={formatCreatedAt(msg.createdAt)}
                onClick={() => navigate(`/me/messages/${msg.id}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyBoxReplyView;
