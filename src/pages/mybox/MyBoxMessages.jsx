// src/pages/mybox/MyBoxMessagesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import messageService from "../../service/message.service";

import MyBoxSideMenu from "../../components/mybox/common/MyBoxSideMenu";
import MyBoxOwnerHeader from "../../components/mybox/common/MyBoxOwnerHeader";
import MyBoxMessageCard from "../../components/mybox/list/MyBoxMessageCard";

import "../../components/mybox/layout/MyBoxLayout.css";
import "../../components/mybox/list/MyBoxMessageCard.css";

function MyBoxMessages() {
  const [pageData, setPageData] = useState(null); // MessagePageDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 로그인 정보 읽기
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  console.log("auth in MyBoxMessages:", auth);

  const userId = auth?.userId ?? null;
  const nickname = auth?.nickname || "익명 사용자";

  // 작성 시간 포맷 함수 추가
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "";
    return new Date(createdAt).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchMyMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await messageService.getMyMessages(userId, 0, 10);
        console.log("My MessagePageDTO:", res.data);
        setPageData(res.data);
      } catch (err) {
        console.error(err);
        setError("내 메시지 목록을 불러오는 중 오류가 발생했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyMessages();
  }, [userId, navigate]);

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

  return (
    <div className="mybox-layout">
      {/* 왼쪽 사이드 메뉴 */}
      <MyBoxSideMenu active="mybox" />

      {/* 오른쪽 메인 영역 */}
      <main className="mybox-main">
        <div className="mybox-main-inner">
          {/* 계정 주인 카드 */}
          <MyBoxOwnerHeader
            nickname={nickname}
            userId={userId}
            pageData={pageData}
          />

          {/* 제목 + 리스트 */}
          <h3 className="mybox-title">
            내 SecretBox 메시지들{" "}
            {pageData.page !== undefined &&
              pageData.totalPages !== undefined && (
                <span className="mybox-page-info">
                  (페이지 {pageData.page + 1} / {pageData.totalPages})
                </span>
              )}
          </h3>

          {messages.length === 0 && (
            <div className="mybox-empty">아직 받은 메시지가 없어요.</div>
          )}

          <div className="mybox-message-list">
            {messages.map((msg) => (
              <MyBoxMessageCard
                key={msg.id}
                detail={msg}
                // createdAt 을 포맷
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

export default MyBoxMessages;
