// src/pages/mybox/MessageView.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import boxService from '../../service/box.service';
import messageService from '../../service/message.service';
import MyBoxMessageCard from '../../components/mybox/list/MyBoxMessageCard';
import MyBoxOwnerHeader from '../../components/mybox/common/MyBoxOwnerHeader';
import MyBoxMidTabs from '../../components/mybox/common/MyBoxMidTabs';


import '../../components/mybox/layout/MyBoxLayout.css';
import './MyBoxMessages.css';
import './MyMessageWritePage.css';

function MessageView() {
  const { urlKey, userId } = useParams();
  console.log('params:', { urlKey, userId });

  const isUserIdMode = !!userId;

  const [header, setHeader] = useState(null);   // BoxHeaderDTO
  const [pageData, setPageData] = useState(null); // MessagePageDTO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 현재 방문자 정보
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const loginUserPk = auth?.id ?? null;      // DB PK
  const isLoggedIn = !!loginUserPk;

  // 작성 폼 상태
  const [content, setContent] = useState('');
  const [errorText, setErrorText] = useState('');
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        let headerRes, msgRes;

        if (isUserIdMode) {
          // /userId/:userId 로 들어온 경우
          headerRes = await boxService.getBoxHeaderByUserId(userId);
          msgRes = await boxService.getPublicMessagesByUserId(userId, 0, 10);
        } else {
          // /q/:urlKey 로 들어온 경우
          headerRes = await boxService.getBoxHeader(urlKey);
          msgRes = await boxService.getPublicMessages(urlKey, 0, 10);
        }

        setHeader(headerRes.data);
        setPageData(msgRes.data);

        console.log('BoxHeaderDTO:', headerRes.data);
        console.log('MessagePageDTO:', msgRes.data);
      } catch (err) {
        console.error(err);
        setError('데이터를 불러오는 중 오류가 발생했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlKey, userId, isUserIdMode]);

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

  if (!header || !pageData)
    return (
      <div className="mybox-layout">
        <p>데이터가 없어요.</p>
      </div>
    );

  const messages = pageData.content || [];

  // 작성 가능 여부: allowAnonymous + 로그인 여부
  const allowAnonymous = pageData.allowAnonymous ?? true;
  const canWrite = allowAnonymous || isLoggedIn;

  // boxUrlKey 확보 (header 안에 urlKey 내려온다고 가정)
  const boxUrlKeyForWrite = header.urlKey || urlKey;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    if (!content.trim()) {
      setErrorText('메시지 내용을 입력해 주세요.');
      return;
    }

    try {
      setSending(true);

      const dto = {
        boxUrlKey: boxUrlKeyForWrite,
        content: content.trim(),
      };

      await messageService.sendMessage(dto, loginUserPk);

      alert('메시지가 발송되었어요 :)');
      setContent('');

      // 옵션: 전송 후 목록 새로고침
      // const msgRes = isUserIdMode
      //   ? await boxService.getPublicMessagesByUserId(userId, 0, 10)
      //   : await boxService.getPublicMessages(urlKey, 0, 10);
      // setPageData(msgRes.data);
    } catch (err) {
      console.error(err);
      setErrorText('메시지 발송 중 오류가 발생했어요.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mybox-layout">
      <main className="mybox-main">
        <div className="mybox-main-inner">
          {/* 🔹 상단 헤더: 기존 MyBox 헤더 컴포넌트 재사용 */}
          <MyBoxOwnerHeader
            nickname={header.ownerName}
            userHandle={userId}                 // /userId/:userId 로 들어온 핸들
            pageData={pageData}
            allowAnonymous={allowAnonymous}
            showActions={false}                 
          />{/* showActions- 공개 뷰라 버튼 숨김 */}
          <MyBoxMidTabs />
          {/* 메시지 목록 */}
          <h3 className="mybox-title">
            메시지 목록{' '}
            <span className="mybox-page-info">
              (페이지 {pageData.page + 1} / {pageData.totalPages})
            </span>
          </h3>

          {messages.length === 0 && (
            <div className="mybox-empty">아직 등록된 메시지가 없어요.</div>
          )}

          <div className="mybox-message-list">
  {messages.map((msg) => (
    <MyBoxMessageCard
      key={msg.id}
      detail={msg}                                   // MessageSummaryDTO
      formattedCreatedAt={formatCreatedAt(msg.createdAt)}
      onClick={() => {}}                             // 공개 뷰라 클릭 동작 없음
    />
  ))}
</div>

          {/* 작성 카드 (MyBoxMessageWritePage 스타일 재사용) */}
          <section className="mybox-write-card">
            {canWrite ? (
              <>
                <h3 className="mybox-title">비밀 메시지 보내기</h3>
                {!allowAnonymous && (
                  <p className="mybox-write-desc">
                    이 박스는 <strong>로그인한 회원만</strong> 메시지를 남길 수 있어요.
                  </p>
                )}

                <form onSubmit={handleSubmit}>
                  <textarea
                    className="mybox-write-textarea"
                    rows={7}
                    maxLength={2000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="보내고 싶은 메시지를 입력해 주세요."
                  />

                  <div className="mybox-write-count-wrapper">
                    <span className="mybox-write-count">
                      {content.length} / 2000
                    </span>
                  </div>

                  {errorText && (
                    <p className="mybox-write-error">{errorText}</p>
                  )}

                  <div className="mybox-write-actions">
                    <button
                      type="submit"
                      className="mybox-write-btn primary"
                      disabled={sending}
                    >
                      {sending ? '발송 중...' : '메시지 보내기'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="login-required-box">
                <p className="mybox-write-desc">
                  이 비밀함은 <strong>로그인한 회원만</strong> 메시지를 남길 수 있어요.
                </p>
                <button
                  type="button"
                  className="mybox-write-btn secondary"
                  onClick={() => navigate('/login')}
                >
                  로그인하러 가기
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MessageView;
