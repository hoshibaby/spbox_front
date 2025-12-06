// src/components/mybox/detail/MyBoxMessageDetailCard.jsx
import { useState } from "react";
import MyBoxReplySection from "./MyBoxReplySection";
import "./MyBoxMessageDetailCard.css";

function MyBoxMessageDetailCard({
  detail,
  replyContent,
  setReplyContent,
  formattedCreatedAt,
  formattedReplyAt,
  onSaveReply,
  onDeleteReply,
  onHide,
  onBlacklist,
  isBoxOwner,
  isAuthorMember,
  onUpdateMessage,
  onDeleteMessage,
}) {
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showMsgActions, setShowMsgActions] = useState(false);

  if (!detail) return null;

  // 작성자 구분
  const isFromOwner = detail.fromOwner;
  const hasAuthorUser = detail.authorUserId != null;
  const isVisitorMessage = !isFromOwner && hasAuthorUser;

  // 👉 앞으로는 계정주가 아닌 모든 작성자는 "상자"로 표기
  const senderLabel = "상자";

  // 메시지 수정 시작
  const handleClickStartEdit = () => {
    setEditContent(detail.content || "");
    setIsEditingMessage(true);
    setShowMsgActions(false);
  };

  // 메시지 수정 저장
  const handleClickSaveMessage = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      alert("메시지 내용을 비울 수는 없어요.");
      return;
    }
    await onUpdateMessage(trimmed);
    setIsEditingMessage(false);
  };

  // 수정 취소
  const handleClickCancelEdit = () => {
    setIsEditingMessage(false);
    setEditContent(detail.content || "");
    setShowMsgActions(false);
  };

  // 숨기기 / 블랙리스트 버튼
  const handleClickHide = async () => {
    await onHide();
    setShowMsgActions(false);
  };

  const handleClickBlacklist = async () => {
    await onBlacklist();
    setShowMsgActions(false);
  };

  const handleClickDeleteMessage = async () => {
    await onDeleteMessage();
    setShowMsgActions(false);
  };

  // 박스 주인인 내가, 남이 쓴 메시지를 볼 때 → 숨김/블랙리스트
  const canOwnerHide = isBoxOwner && isVisitorMessage;
  // 박스 주인인 내가, 내가 쓴 메시지일 때 → 수정/삭제
  const canAuthorEdit = isAuthorMember;

  const hasAnyMenu = canOwnerHide || canAuthorEdit;

  return (
    <div className="mybox-detail-wrapper">
      {/* ==================== 상단: 원본 메시지 카드 ==================== */}
      <section className="mybox-detail-card">
        {/* 헤더 (이름 + 숨김 뱃지 + 점 3개 토글) */}
        <div className="mybox-detail-meta">
          <div className="mybox-detail-meta-left">
            {/* 동그라미 아바타 */}
            <div className="mybox-detail-avatar" />
            <span className="mybox-detail-sender">{senderLabel}</span>
            {detail.hidden && (
              <span className="badge badge-hidden">숨김</span>
            )}
          </div>

          {/* 🔹 여기 토글 버튼을 '답장'과 같은 구조/클래스로 사용 */}
          {hasAnyMenu && (
            <button
              type="button"
              className="reply-menu-toggle"
              onClick={() => setShowMsgActions((prev) => !prev)}
            >
              ⋯
            </button>
          )}
        </div>

        {/* 토글 펼쳤을 때 액션들 (답장과 똑같은 세로 배열 모양) */}
        {hasAnyMenu && showMsgActions && (
          <div className="reply-actions-column">
            {/* 내가 쓴 메시지일 때 : 수정 / 삭제 */}
            {canAuthorEdit && (
              <>
              
                {!isEditingMessage && (
                  <>
                    <button
                      type="button"
                      className="reply-link-btn"
                      onClick={handleClickStartEdit}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="reply-link-btn"
                      onClick={handleClickDeleteMessage}
                    >
                      삭제
                    </button>
                  </>
                )}
                {/* 수정 중: 저장 / 수정 취소 */}
                {isEditingMessage && (
                  <>
                    <button
                      type="button"
                      className="reply-link-btn"
                      onClick={handleClickSaveMessage}
                    >
                      저장
                    </button>

                    <button
                      type="button"
                      className="reply-link-btn"
                      onClick={handleClickCancelEdit}
                    >
                      수정 취소
                    </button>
                  </>
                )}
              </>
            )}

            {/* 다른 사람이 쓴 메시지일 때 : 숨기기 / 블랙리스트 + 숨김 */}
            {canOwnerHide && (
              <>
                <button
                  type="button"
                  className="reply-link-btn"
                  onClick={handleClickHide}
                >
                  숨기기
                </button>
                <button
                  type="button"
                  className="reply-link-btn danger"
                  onClick={handleClickBlacklist}
                >
                  블랙리스트 + 숨김
                </button>
              </>
            )}
          </div>
        )}

        {/* 본문 영역 */}
        {!isEditingMessage ? (
          <div className="mybox-detail-content">
            {detail.content || "(내용 없음)"}
          </div>
        ) : (
          <textarea
            className="mybox-detail-textarea"
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        )}

        {/* 작성 시간은 아래에 배치 */}
        <div className="mybox-detail-footer">
          <span className="mybox-detail-time-bottom">
            작성: {formattedCreatedAt}
          </span>
        </div>
      </section>

      {/* ==================== 하단: 답장 카드 ==================== */}
      <MyBoxReplySection
        detail={detail}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        formattedReplyAt={formattedReplyAt}
        onSave={onSaveReply}
        onDelete={onDeleteReply}
        onHide={onHide}
        onBlacklist={onBlacklist}
      />
    </div>
  );
}

export default MyBoxMessageDetailCard;
