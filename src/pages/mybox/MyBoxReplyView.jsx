// src/pages/mybox/MyBoxReplyView.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import messageService from "../../service/message.service";
import MyBoxMidTabs from "../../components/mybox/common/MyBoxMidTabs";

import MyBoxSideMenu from "../../components/mybox/common/MyBoxSideMenu";
import MyBoxOwnerHeader from "../../components/mybox/common/MyBoxOwnerHeader";

import "../../components/mybox/layout/MyBoxLayout.css";
import "../../components/mybox/detail/MyBoxReplyView.css"; // 나중에 만들거야

function MyBoxReplyView() {
  const { messageId } = useParams();
  const navigate = useNavigate();

  const [owner, setOwner] = useState(null);    // 프로필 카드 정보
  const [message, setMessage] = useState(null); // 상대가 보낸 원본 메시지
  const [reply, setReply] = useState(null);     // 내가 쓴 답장

  // 1) 데이터 불러오기
  useEffect(() => {
    // 예시 – 실제 API에 맞춰 수정해줘
    messageService
      .getMessageWithReply(messageId)
      .then((res) => {
        const { ownerInfo, message, reply } = res.data;
        setOwner(ownerInfo);
        setMessage(message);
        setReply(reply);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [messageId]);

  if (!message || !owner) {
    return null; // 로딩 스피너는 나중에
  }

  const handleWriteNewMessage = () => {
    // 예: 새 write 페이지로 이동 (라우트는 열시가 정한 걸로 바꿔줘)
    navigate(`/me/messages/write?to=${message.senderId}`);
  };

  return (
    <div className="mybox-layout">
      {/* 왼쪽 사이드 메뉴 */}
      <MyBoxSideMenu />


      {/* 오른쪽 메인 영역 */}
      <div className="mybox-main">
        {/* 상단 프로필 카드 */}
        <MyBoxOwnerHeader owner={owner} />

        {/* 🔽 이 한 줄로 탭 전체 교체 */}
        <MyBoxMidTabs />

        {/* 여기부터가 열시가 그린 06 PAGE 답장 view 부분 */}
        <div className="mybox-reply-view">
          {/* 위쪽: From. 상자 / From. pm 10:10 */}
          <section className="reply-thread">
            {/* 1. 원본 메시지 */}
            <article className="reply-item">
              <div className="reply-item-meta">
                <span className="reply-from">
                  From. {message.senderNickname || "상자"}
                </span>
                <span className="reply-elapsed">
                  {message.elapsedText /* "30분 전" 같은 문자열 */}
                </span>
              </div>
              <div className="reply-item-content">
                {message.content}
              </div>
            </article>

            {/* 2. 내 답장 */}
            {reply && (
              <article className="reply-item reply-item-owner">
                <div className="reply-item-meta">
                  <span className="reply-from">
                    From. {reply.senderNickname || owner.nickname}
                  </span>
                  <span className="reply-elapsed">
                    {reply.elapsedText /* "17분 전" */}
                  </span>
                </div>

                <div className="reply-item-content-row">
                  <div className="reply-item-content">{reply.content}</div>

                  {/* 우측 세로 토글 버튼 – 드롭다운은 나중에 */}
                  <div className="reply-kebab">
                    <button className="reply-kebab-button">⋯</button>
                    {/* 메뉴 열렸을 때
                    <div className="reply-kebab-menu">
                      <button>수정</button>
                      <button>삭제</button>
                      <button>숨기기</button>
                    </div>
                    */}
                  </div>
                </div>
              </article>
            )}
          </section>

          {/* 아래쪽: To. pm 10:10 / "님에게 메시지를 보내보세요" */}
          <section className="reply-bottom">
            <div className="reply-to-label">
              To. {message.senderNickname || "상자"}
            </div>

            <button
              type="button"
              className="reply-bottom-button"
              onClick={handleWriteNewMessage}
            >
              {message.senderNickname || "상자"}님에게 메시지를 보내보세요.
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MyBoxReplyView;
