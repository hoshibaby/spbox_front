// src/pages/mybox/MyBoxMessagesPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import messageService from '../../service/message.service';
import notificationService from '../../service/notification.service';
import MyBoxMidTabs from '../../components/mybox/common/MyBoxMidTabs';
import MyBoxSideMenu from '../../components/mybox/common/MyBoxSideMenu';
import MyBoxOwnerHeader from '../../components/mybox/common/MyBoxOwnerHeader';
import MyBoxMessageCard from '../../components/mybox/list/MyBoxMessageCard';

import '../../components/mybox/layout/MyBoxLayout.css';
import '../../components/mybox/list/MyBoxMessageCard.css';

function MyBoxMessages() {
  const [pageData, setPageData] = useState(null); // MessagePageDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  // 🔐 로그인 정보 읽기
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const loginUserPk = auth?.id; // DB PK (메시지 조회 등에 사용)
  const addressId = auth?.addressId; // 화면에 @ 뒤에 붙일 값

  console.log('MyBoxMessages loginUserPk >>>', loginUserPk);
  console.log('MyBoxMessages addressId >>>', addressId);

  // 작성 시간 포맷 함수
  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return '';
    return new Date(createdAt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    // 로그인 안 되어 있으면 로그인 페이지로
    if (!loginUserPk) {
      navigate('/login');
      return;
    }

    // 환영 확인 게이트 체크
    const key = `welcomeAck:${loginUserPk}`;
    const ack = localStorage.getItem(key);
    if (!ack) {
      navigate('/welcome', { replace: true });
      return;
    }

    const fetchMyMessages = async () => {
      try {
        setLoading(true);
        setError('');

        // 🔥 여기서도 loginUserPk 사용
        const res = await messageService.getMyMessages(loginUserPk, 0, 10);
        console.log('My MessagePageDTO:', res.data);
        setPageData(res.data);
      } catch (err) {
        console.error(err);
        setError('내 메시지 목록을 불러오는 중 오류가 발생했어요.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount(loginUserPk);
        console.log('서버 응답 unread-count:', res.data);

        const count =
          typeof res.data === 'number' ? res.data : typeof res.data?.count === 'number' ? res.data.count : 0;

        setUnreadCount(count);
        console.log('최종 unreadCount 상태:', count);
      } catch (err) {
        console.error('알림 개수 조회 실패', err);
      }
    };

    fetchMyMessages();
    fetchUnreadCount();
  }, [loginUserPk, navigate]); // 🔥 의존성도 loginUserPk

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

  // 백엔드에서 온 allowAnonymous 값
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
            userHandle={addressId} //  @뒤에 붙는 값
            pageData={pageData}
            allowAnonymous={allowAnonymous}
          />
          <MyBoxMidTabs />
          {/* 제목 + 리스트 */}
          <h3 className="mybox-title">
            내 SecretBox 메시지들{' '}
            {pageData.page !== undefined && pageData.totalPages !== undefined && (
              <span className="mybox-page-info">
                (페이지 {pageData.page + 1} / {pageData.totalPages})
              </span>
            )}
          </h3>

          {messages.length === 0 && <div className="mybox-empty">아직 받은 메시지가 없어요.</div>}

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

export default MyBoxMessages;
