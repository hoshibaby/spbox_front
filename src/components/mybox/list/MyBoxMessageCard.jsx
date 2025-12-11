// src/components/mybox/MyBoxMessageCard.jsx
import "./MyBoxMessageCard.css";

function MyBoxMessageCard({ detail, formattedCreatedAt, onClick }) {
  if (!detail) {
    console.warn("MyBoxMessageCard: detail 이 없습니다.", detail);
    return null;
  }

  console.log("MyBoxMessageCard detail >>>", detail);

  // 🔹 내가 쓴 글인지 여부 (MessageSummaryDTO 에 있음)
  const isFromOwner = detail.fromOwner;

  // 🔹 이름 규칙
  //  - 박스 주인이 쓴 글 : authorLabel(닉네임, 예: "열시")
  //  - 외부 회원/비회원이 쓴 글 : 항상 "상자"
  const senderLabel = isFromOwner
    ? detail.authorLabel || "계정주"
    : "상자";

  // 🔹 내용: shortContent 우선 사용
  const rawContent =
    detail.shortContent ??
    detail.content ??
    detail.message ??
    detail.contentText ??
    detail.body;

  const content = rawContent || "(내용 없음)";
  const createdText = formattedCreatedAt || "";

  // 서버에서 이미 20자로 잘라준 shortContent 를 쓰니까 그대로 표시
  const preview = content;

  return (
    <section className="mybox-detail-card" onClick={onClick}>
      <div className="mybox-detail-meta">
      <div className="mybox-detail-meta-left">
        {/* 아바타 */}
        <div className="mybox-detail-avatar">
          <img src="/default-box-avatar-any.jpg" alt="상자 아바타" />
        </div>

        {/* 이름 */}
        <span className="mybox-detail-sender">{senderLabel}</span>

        {detail.hidden && (
          <span className="badge badge-hidden">숨김</span>
        )}
      </div>
      </div>

      <div className="mybox-detail-content">
        {preview}
      </div>

      <div className="mybox-detail-footer">
        <span className="mybox-detail-time-bottom">
          작성: {createdText}
        </span>
      </div>
    </section>
  );
}

export default MyBoxMessageCard;
