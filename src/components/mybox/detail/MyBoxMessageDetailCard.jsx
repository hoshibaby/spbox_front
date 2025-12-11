// src/components/mybox/detail/MyBoxMessageDetailCard.jsx
import { useState } from 'react';
import MyBoxReplySection from './MyBoxReplySection';
import './MyBoxMessageDetailCard.css';

const OWNER_DEFAULT_AVATAR = '/default-box-avatar.jpg'; // 열시 기본 아바타
const ANON_DEFAULT_AVATAR = '/default-box-avatar-any.jpg'; // 상자(익명) 기본 아바타

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
  const [editContent, setEditContent] = useState('');
  const [showMsgActions, setShowMsgActions] = useState(false);

  if (!detail) return null;

  // =========================
  // 작성자 / 아바타 정보 계산
  // =========================
  const isFromOwner = detail.fromOwner; // 이 메시지를 박스 주인이 썼는지
  const hasAuthorUser = detail.authorUserId != null;

  // 🔹 "방문자 메시지" 기준을 hasAuthorUser 빼고 단순화
  //   -> 박스 주인이 아닌 사람이 쓴 모든 메시지
  const isVisitorMessage = !isFromOwner;

  // 로그인한 계정주 정보 (열시)
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const ownerNickname = auth?.nickname || detail.authorLabel || '계정주';
  const ownerAvatarUrl = auth?.profileImageUrl || OWNER_DEFAULT_AVATAR;

  // 이름 규칙
  // - 박스 주인이 쓴 글: "열시" 같은 닉네임
  // - 외부 회원/비회원: 항상 "상자"
  const senderLabel = isFromOwner ? ownerNickname : '상자';

  // 아바타 규칙
  const avatarUrl = isFromOwner ? ownerAvatarUrl : ANON_DEFAULT_AVATAR;

  // 박스 주인(열시)이 남이 쓴 메시지를 볼 때 → 숨김/블랙리스트
  const canOwnerHide = isBoxOwner && isVisitorMessage;

  // 박스 주인(열시)이 자기 글을 볼 때 → 수정/삭제
  const canAuthorEdit = isAuthorMember;

  const hasAnyMenu = canOwnerHide || canAuthorEdit;

  // =========================
  // 핸들러들
  // =========================
  const handleClickStartEdit = () => {
    setEditContent(detail.content || '');
    setIsEditingMessage(true);
    setShowMsgActions(false);
  };

  const handleClickSaveMessage = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      alert('메시지 내용을 비울 수는 없어요.');
      return;
    }
    await onUpdateMessage(trimmed);
    setIsEditingMessage(false);
  };

  const handleClickCancelEdit = () => {
    setIsEditingMessage(false);
    setEditContent(detail.content || '');
    setShowMsgActions(false);
  };

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

  // =========================
  // 렌더링
  // =========================
  return (
    <div className="mybox-detail-wrapper">
      {/* ==================== 상단: 원본 메시지 카드 ==================== */}
      <section className="mybox-detail-card">
        {/* 헤더 (아바타 + 이름 + 숨김 뱃지 + 점 3개 토글) */}
        <div className="mybox-detail-meta">
          <div className="mybox-detail-meta-left">
            {/* 동그라미 아바타 */}
            <div className="mybox-detail-avatar">
              <img src={avatarUrl} alt={`${senderLabel} 아바타`} />
            </div>

            {/* 이름 */}
            <span className="mybox-detail-sender">{senderLabel}</span>

            {detail.hidden && <span className="badge badge-hidden">숨김</span>}
          </div>

          {/* 점 3개 토글 */}
          {hasAnyMenu && (
            <button type="button" className="reply-menu-toggle" onClick={() => setShowMsgActions((prev) => !prev)}>
              ⋯
            </button>
          )}
        </div>

        {/* 토글 펼쳤을 때 액션들 */}
        {hasAnyMenu && showMsgActions && (
          <div className="reply-actions-column">
            {/* 내가 쓴 메시지일 때 : 수정 / 삭제 */}
            {canAuthorEdit && (
              <>
                {!isEditingMessage && (
                  <>
                    <button type="button" className="reply-link-btn" onClick={handleClickStartEdit}>
                      수정
                    </button>
                    <button type="button" className="reply-link-btn" onClick={handleClickDeleteMessage}>
                      삭제
                    </button>
                  </>
                )}

                {isEditingMessage && (
                  <>
                    <button type="button" className="reply-link-btn" onClick={handleClickSaveMessage}>
                      저장
                    </button>
                    <button type="button" className="reply-link-btn" onClick={handleClickCancelEdit}>
                      수정 취소
                    </button>
                  </>
                )}
              </>
            )}

            {/* 다른 사람이 쓴 메시지일 때 : 숨기기 / 블랙리스트 + 숨김 */}
            {canOwnerHide && (
              <>
                <button type="button" className="reply-link-btn" onClick={handleClickHide}>
                  숨기기
                </button>
                {/* 🔹 회원인 경우에만 블랙리스트 버튼 노출 */}
                {hasAuthorUser && (
                  <button type="button" className="reply-link-btn danger" onClick={handleClickBlacklist}>
                    블랙리스트 + 숨김
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* 본문 영역 */}
        {!isEditingMessage ? (
          <div className="mybox-detail-content">{detail.content || '(내용 없음)'}</div>
        ) : (
          <textarea
            className="mybox-detail-textarea"
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
        )}

        {/* 작성 시간 */}
        <div className="mybox-detail-footer">
          <span className="mybox-detail-time-bottom">작성: {formattedCreatedAt}</span>
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
