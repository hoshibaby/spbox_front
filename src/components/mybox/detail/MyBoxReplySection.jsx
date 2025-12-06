// src/components/mybox/MyBoxReplySection.jsx
import { useState } from 'react';
import './MyBoxReplySection.css';

function MyBoxReplySection({
  detail,
  replyContent,
  setReplyContent,
  formattedReplyAt,
  onSave,
  onDelete,
  // onHide,
  // onBlacklist,
}) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasReply =
    detail.replyContent &&
    detail.replyContent.trim().length > 0;



  return (
    <section className="mybox-detail-card reply-card">
      {/* 상단 영역 */}
      <div className="mybox-detail-reply-header">
          <div className="reply-avatar">
          <div className="owner-avatar-small">열</div>
      </div>
        <h4>답장</h4>

        {hasReply && (
          <button
            type="button"
            className="reply-menu-toggle"
            onClick={() => setShowActions((prev) => !prev)}
          >
            ⋯
          </button>
        )}
      </div>

      {/* 펼쳐진 액션들 */}
      {showActions && (
        <div className="reply-actions-column">
          {!isEditing && (
            <>
              <button
                type="button"
                className="reply-link-btn"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                수정
              </button>
              <button
                type="button"
                className="reply-link-btn"
                onClick={onDelete}
              >
                삭제
              </button>
              {/* <button
                type="button"
                className="reply-link-btn"
                onClick={onHide}
              >
                숨기기
              </button>
              <button
                type="button"
                className="reply-link-btn danger"
                onClick={onBlacklist}
              >
                블랙리스트 + 숨김
              </button> */}
            </>
          )}

          {isEditing && (
            <button
              type="button"
              className="reply-link-btn"
              onClick={() => {
                setIsEditing(false);
                setReplyContent(detail.replyContent || '');
              }}
            >
              수정 취소
            </button>
          )}
        </div>
      )}

      {/* 저장된 답장(미수정 상황) */}
      {hasReply && !isEditing && (
        <div className="mybox-detail-reply-preview">
          {detail.replyContent}
        </div>
      )}

      {/* 입력 폼 */}
      {(!hasReply || isEditing) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
            setIsEditing(false);
            setShowActions(false);
          }}
          className="mybox-detail-reply-form"
        >
          <textarea
            className="mybox-detail-textarea"
            rows="4"
            placeholder="여기에 답장을 입력하세요"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />

          <div className="mybox-detail-actions">
            <button type="submit" className="btn-main">
              {hasReply ? '답장 수정' : '답장 저장'}
            </button>
          </div>
        </form>
      )}

      {/* 마지막 수정시간 */}
      <div className="mybox-detail-footer">
        {hasReply && (
          <span className="mybox-detail-time-bottom">
            마지막 수정: {formattedReplyAt}
          </span>
        )}
      </div>
    </section>
  );
}

export default MyBoxReplySection;
