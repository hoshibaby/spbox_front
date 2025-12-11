// src/pages/mybox/MyMessageDetailPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import messageService from '../../service/message.service';
import notificationService from '../../service/notification.service';
import MyBoxSideMenu from '../../components/mybox/common/MyBoxSideMenu';
import MyBoxOwnerHeader from '../../components/mybox/common/MyBoxOwnerHeader';
import MyBoxMessageDetailCard from '../../components/mybox/detail/MyBoxMessageDetailCard';
import MyBoxMidTabs from '../../components/mybox/common/MyBoxMidTabs';

import '../../components/mybox/layout/MyBoxLayout.css';
import '../../components/mybox/detail/MyBoxMessageDetailCard.css';
import '../../components/mybox/detail/MyBoxReplySection.css';
import './MyMessageDetail.css';

function MyMessageDetail() {
  const { id } = useParams(); // /me/messages/:id
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null); // MessageDetailDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');

  // 로그인 정보
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const loginUserPk = auth?.id ?? null;         // PK (Long) - 모든 API 호출에 사용
  const addressId = auth?.addressId ?? null;    // 화면에 @뒤에 보여줄 핸들
  const nickname = auth?.nickname || '익명 사용자';

  // 미읽음 알림 개수 상태
  const [unreadCount, setUnreadCount] = useState(0);

  // 상세 재조회 함수 (여러 핸들러에서 재사용)
  const reloadDetail = async () => {
    const res = await messageService.getMessageDetail(id, loginUserPk);
    setDetail(res.data);
    setReplyContent(res.data.replyContent || '');
  };

  // 최초 로딩
  useEffect(() => {
    if (!loginUserPk) {
      navigate('/login');
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        await reloadDetail();
      } catch (err) {
        console.error(err);
        setError('메시지 상세를 불러오는 중 오류가 발생했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, loginUserPk, navigate]);

  // 미읽음 알림 개수 조회
  useEffect(() => {
    if (!loginUserPk) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount(loginUserPk); //  PK 사용
        console.log(' unread-count res.data:', res.data);

        const count =
          typeof res.data === 'number'
            ? res.data
            : typeof res.data?.count === 'number'
            ? res.data.count
            : typeof res.data?.unreadCount === 'number'
            ? res.data.unreadCount
            : 0;

        console.log(' 계산된 unread count:', count);
        setUnreadCount(count);
      } catch (err) {
        console.error('알림 개수 조회 실패', err);
      }
    };

    fetchUnreadCount();
  }, [loginUserPk]);

  // =========================
  // 답장 관련 핸들러
  // =========================

  const handleSaveReply = async () => {
    if (!replyContent.trim()) {
      alert('답장 내용을 입력해주세요.');
      return;
    }

    try {
      await messageService.replyMessage(id, loginUserPk, replyContent.trim()); // 
      alert('답장이 저장되었어요!');
      await reloadDetail();
    } catch (err) {
      console.error(err);
      alert('답장 중 오류가 발생했어요.');
    }
  };

  const handleDeleteReply = async () => {
    if (!window.confirm('이미 남긴 답장을 삭제할까요?')) return;

    try {
      await messageService.replyMessage(id, loginUserPk, ''); // 
      await reloadDetail();
      setReplyContent('');
      alert('답장이 삭제되었어요.');
    } catch (err) {
      console.error(err);
      alert('답장 삭제 중 오류가 발생했어요.');
    }
  };

  // 메시지 숨김
  const handleHide = async () => {
    if (!window.confirm('이 메시지를 숨기는 것이 맞나요?')) return;

    try {
      await messageService.hideMessage(id, loginUserPk); // 
      alert('메시지가 숨김 처리되었어요.');
      navigate('/me/messages');
    } catch (err) {
      console.error(err);
      alert('숨김 처리 중 오류가 발생했어요.');
    }
  };

  // 블랙리스트 + 숨김
  const handleBlacklist = async () => {
    if (!window.confirm('이 발신자를 블랙리스트에 추가하고 메시지를 숨길까요?')) return;

    try {
      await messageService.blacklistByMessage(id, loginUserPk); // 
      alert('블랙리스트 + 숨김 완료!');
      navigate('/me/messages');
    } catch (err) {
      console.error(err);
      alert('블랙리스트 처리 중 오류가 발생했어요.');
    }
  };

  // =========================
  // 원본 메시지 수정 / 삭제 핸들러
  // =========================

  const handleUpdateMessage = async (newContent) => {
    if (!newContent.trim()) {
      alert('메시지 내용을 비울 수는 없어요.');
      return;
    }

    try {
      await messageService.updateMessage(id, loginUserPk, newContent.trim()); // 
      await reloadDetail();
      alert('메시지가 수정되었어요.');
    } catch (err) {
      console.error(err);
      alert('메시지 수정 중 오류가 발생했어요.');
    }
  };

  const handleDeleteMessage = async () => {
    if (!window.confirm('이 메시지를 정말 삭제할까요? 되돌릴 수 없어요.')) return;

    try {
      await messageService.deleteMessage(id, loginUserPk); // 
      alert('메시지가 삭제되었어요.');
      navigate('/me/messages');
    } catch (err) {
      console.error(err);
      alert('메시지 삭제 중 오류가 발생했어요.');
    }
  };

  // =========================
  // 로딩 / 에러 처리
  // =========================
  if (loading) {
    return (
      <div className="mybox-layout">
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mybox-layout">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="mybox-layout">
        <p>데이터가 없어요.</p>
      </div>
    );
  }

  // =========================
  // 날짜 포맷
  // =========================
  const formattedCreatedAt = detail.createdAt
    ? detail.createdAt.replace('T', ' ').substring(0, 16)
    : '';

  const formattedReplyAt = detail.replyCreatedAt
    ? detail.replyCreatedAt.replace('T', ' ').substring(0, 16)
    : '';

  // =========================
  // 역할(Role) 판별
  // =========================
  const isBoxOwner = true; // 내 박스에서 보는 상세
  const isAuthorMember =
    detail.authorUserId != null && detail.authorUserId === loginUserPk; //  PK끼리 비교

  // =========================
  // 실제 화면 렌더링
  // =========================
  return (
    <div className="mybox-layout">
      {/* 왼쪽 사이드 메뉴 */}
      <MyBoxSideMenu unreadNotificationCount={unreadCount} />

      {/* 오른쪽 메인 */}
      <main className="mybox-main">
        <div className="mybox-main-inner mybox-detail">
          {/* 상단 박스 주인 카드 */}
          <MyBoxOwnerHeader
            nickname={nickname}
            userHandle={addressId}                     //  @ 뒤에 나올 값
            pageData={{ totalElements: 1, page: 0, totalPages: 1 }}
            showActions={false}
          />
          <MyBoxMidTabs />
          {/* 상단: 제목 + 목록으로 */}
          <div className="mybox-detail-header">
            <span className="mybox-detail-subtitle">받은 메시지 상세</span>

            <NavLink to="/me/messages" className="mybox-back-button">
              ← 목록으로
            </NavLink>
          </div>

          {/* 상세 카드 */}
          <MyBoxMessageDetailCard
            detail={detail}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            formattedCreatedAt={formattedCreatedAt}
            formattedReplyAt={formattedReplyAt}
            onSaveReply={handleSaveReply}
            onDeleteReply={handleDeleteReply}
            onHide={handleHide}
            onBlacklist={handleBlacklist}
            isBoxOwner={isBoxOwner}
            isAuthorMember={isAuthorMember}
            onUpdateMessage={handleUpdateMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        </div>
      </main>
    </div>
  );
}

export default MyMessageDetail;
