// src/components/mybox/MyBoxOwnerHeader.jsx
import './MyBoxOwnerHeader.css';
const DEFAULT_AVATAR_URL = '/default-box-avatar.jpg';


function MyBoxOwnerHeader({ nickname, userId, pageData }) {
  // 🔹 pageData가 없을 수도 있으니 기본값 계산
  const totalElements = pageData?.totalElements ?? 0;
  const currentPage = (pageData?.page ?? 0) + 1;
  const totalPages = pageData?.totalPages ?? 1;

   // 로그인 정보에서 프로필 이미지가 있다면 사용, 없으면 기본 상자 아바타
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const profileImageUrl = auth?.profileImageUrl || DEFAULT_AVATAR_URL;

  return (
    <section className="mybox-owner-card">
      <div className="mybox-owner-cover" />
      <div className="mybox-owner-content">
        {/* 왼쪽: 프로필 동그라미 */}
        <div className="mybox-owner-avatar">
          <img
            src={profileImageUrl}
            alt={`${nickname || '사용자'} 프로필`}
          />
        </div>

        {/* 가운데: 이름, 설명, 통계 */}
        <div className="mybox-owner-info">
          <div className="mybox-owner-name-row">
            <h2 className="mybox-owner-name">{nickname || '익명 사용자'}</h2>
            {userId && <span className="mybox-owner-id">@{userId}</span>}
          </div>
          <p className="mybox-owner-subtitle">
            소근소근 나만 볼 수 있는 비밀 상담함이에요.
          </p>

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

        {/* 오른쪽: 액션 버튼들 */}
        <div className="mybox-owner-actions">
          <button className="owner-btn primary">비밀박스 링크 복사</button>
          <button className="owner-btn secondary">상담모드 설정</button>
        </div>
      </div>
    </section>
  );
}

export default MyBoxOwnerHeader;
