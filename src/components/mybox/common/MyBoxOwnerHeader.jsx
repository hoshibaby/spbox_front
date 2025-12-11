// src/components/mybox/MyBoxOwnerHeader.jsx
import "./MyBoxOwnerHeader.css";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR_URL = "/default-box-avatar.jpg";

// 전역에서 auth 파싱 (에러 방지용 try/catch)
let auth = null;
try {
  const raw = localStorage.getItem("auth");
  if (raw && raw !== "undefined" && raw !== "null") {
    auth = JSON.parse(raw);
  }
} catch (e) {
  console.warn("auth 파싱 실패, null로 처리합니다.", e);
  auth = null;
}

function MyBoxOwnerHeader({
  nickname,        // ✅ 1순위 닉네임
  userHandle,      //  명시적으로 넘겨주면 사용
  pageData,
  allowAnonymous,  //  선택적으로 override
  showActions = true,

  // ✅ 새로 추가: 설정 페이지에서 넘겨줄 수 있는 이미지들
  profileImageUrl: profileImageProp,
  headerImageUrl: headerImageProp,
}) {
  const navigate = useNavigate();

  const totalElements = pageData?.totalElements ?? 0;
  const currentPage = (pageData?.page ?? 0) + 1;
  const totalPages = pageData?.totalPages ?? 1;

  // ✅ 프로필 이미지 우선순위: props → box → auth → 기본
  const resolvedProfileImageUrl =
    profileImageProp ||
    pageData?.box?.profileImageUrl ||
    auth?.profileImageUrl ||
    DEFAULT_AVATAR_URL;

  // ✅ 헤더 이미지 우선순위: props → box → (없으면 CSS 그라디언트)
  const resolvedHeaderImageUrl =
    headerImageProp || pageData?.box?.headerImageUrl || auth?.headerImageUrl || null;

  // ✅ 닉네임 우선순위: props.nickname → box.ownerName → "익명 사용자"
  const displayNickname =
    nickname || pageData?.box?.ownerName || "익명 사용자";

  // ✅ @핸들은 props.userHandle → auth.userId
  const displayHandle = userHandle || auth?.userId;

  // ✅ allowAnonymous는 props > pageData.box > 기본 true
  const resolvedAllowAnonymous =
    allowAnonymous ?? pageData?.box?.allowAnonymous ?? true;

  const policyLabel = resolvedAllowAnonymous
    ? "익명 메시지 허용 중인 비밀 상담함이에요."
    : "로그인한 회원만 메시지를 남길 수 있는 비밀 상담함이에요.";

  const handleCopyLink = async () => {
    try {
      const loginId = auth?.userId;
      if (!loginId) {
        alert("로그인 정보를 찾을 수 없어 링크를 만들 수 없어요.");
        return;
      }

      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/userId/${loginId}`;

      await navigator.clipboard.writeText(shareUrl);
      alert("비밀박스 링크를 클립보드에 복사했어요!");
    } catch (e) {
      console.error(e);
      alert("링크 복사에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <section className="mybox-owner-card">
      {/* ✅ 헤더 배경 이미지 적용 부분 */}
      <div
        className="mybox-owner-cover"
        style={
          resolvedHeaderImageUrl
            ? {
                backgroundImage: `url(${resolvedHeaderImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined // 없으면 CSS의 그라디언트 유지
        }
      />

      <div className="mybox-owner-content">
        <div className="mybox-owner-avatar">
          <img
            src={resolvedProfileImageUrl}
            alt={`${displayNickname} 프로필`}
          />
        </div>

        <div className="mybox-owner-info">
          <div className="mybox-owner-name-row">
            <h2 className="mybox-owner-name">{displayNickname}</h2>
            {displayHandle && (
              <span className="mybox-owner-id">@{displayHandle}</span>
            )}
          </div>

          <p className="mybox-owner-subtitle">{policyLabel}</p>

          <div className="mybox-owner-stats">
            <div>
              <span className="stat-label">받은 메시지</span>
              <span className="stat-value">{totalElements}</span>
            </div>
            <div>
              <span className="stat-label">페이지</span>
              <span className="stat-value">
                {currentPage} / {totalPages}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="mybox-owner-actions">
            <button className="owner-btn secondary" onClick={handleCopyLink}>
              비밀박스 링크 복사
            </button>

            <button
              className="owner-btn primary write-btn"
              onClick={() => navigate("/me/messages/new")}
            >
              메세지 발송
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyBoxOwnerHeader;
