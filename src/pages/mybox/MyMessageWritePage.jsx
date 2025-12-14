// src/pages/mybox/MyBoxMessageWritePage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import messageService from '../../service/message.service';
import MyBoxMidTabs from '../../components/mybox/common/MyBoxMidTabs';
import MyBoxSideMenu from '../../components/mybox/common/MyBoxSideMenu';
import MyBoxOwnerHeader from '../../components/mybox/common/MyBoxOwnerHeader';

import api from '../../service/axios';

import '../../components/mybox/layout/MyBoxLayout.css';
import './MyMessageWritePage.css';

function MyBoxMessageWritePage() {
  const [content, setContent] = useState('');
  const [errorText, setErrorText] = useState('');
  const [sending, setSending] = useState(false);

  // ✅ 차단 UX
  const [blocked, setBlocked] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState('');

  // ✅ 토글
  const [askAi, setAskAi] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [privateMessage, setPrivateMessage] = useState(false);

  // ✅ 헤더 이미지/프로필 이미지
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [headerImageUrl, setHeaderImageUrl] = useState(null);

  const unreadCount = 0;
  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const loginUserPk = auth?.id;      // DB PK (Long)
  const boxUrlKey = auth?.boxUrlKey; // boxUrlKey
  const addressId = auth?.addressId;

  // 로그인 체크
  useEffect(() => {
    if (!auth) navigate('/login');
  }, [auth, navigate]);

  // ✅ (핵심) 글쓰기 화면 진입 시, 서버에서 박스 헤더(=BoxHeaderDTO) 다시 가져오기
  useEffect(() => {
    if (!auth || !loginUserPk) return;

    let cancelled = false;

    const loadBoxHeader = async () => {
      try {
        // MessageController: GET /api/me/messages?userId=...&page=0&size=1
        const res = await api.get('/api/me/messages', {
          params: { userId: loginUserPk, page: 0, size: 1 },
        });

        const box = res?.data?.box; // MessagePageDTO.box (BoxHeaderDTO)

        if (cancelled) return;

        if (box) {
          setProfileImageUrl(box.profileImageUrl ?? null);
          setHeaderImageUrl(box.headerImageUrl ?? null);

          // ✅ 여기서 aiMode를 정확히 반영해야 "AI 답변" 버튼이 뜸
          setAiMode(!!box.aiMode);
        } else {
          // box가 비어있으면 안전하게 초기화
          setProfileImageUrl(null);
          setHeaderImageUrl(null);
          setAiMode(false);
        }
      } catch (e) {
        console.warn('[write page] /api/me/messages 호출 실패', e);
        if (!cancelled) {
          setProfileImageUrl(null);
          setHeaderImageUrl(null);
          setAiMode(false);
        }
      }
    };

    loadBoxHeader();

    return () => {
      cancelled = true;
    };
  }, [auth, loginUserPk]);

  // ✅ aiMode가 꺼져있으면 askAi는 항상 false로 정리(토글 꼬임 방지)
  useEffect(() => {
    if (!aiMode) setAskAi(false);
  }, [aiMode]);

  if (!auth) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    if (blocked) return;

    if (!content.trim()) {
      setErrorText('메시지 내용을 입력해 주세요.');
      return;
    }

    try {
      setSending(true);

      const dto = {
        boxUrlKey,
        content: content.trim(),
        askAi: aiMode ? askAi : false, // ✅ AI 모드 OFF면 askAi 강제 false
        privateMessage,
      };

      await messageService.sendMessage(dto, loginUserPk);

      alert('메시지가 발송되었어요 :)');
      navigate('/me/messages');
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data;

      if (status === 403) {
        setBlocked(true);
        setBlockedMsg(
          typeof serverMsg === 'string' && serverMsg.trim()
            ? serverMsg
            : '차단된 사용자입니다. 메시지를 보낼 수 없습니다.'
        );
        setErrorText('');
        return;
      }

      setErrorText('메시지 발송 중 오류가 발생했어요.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mybox-layout">
      <MyBoxSideMenu unreadNotificationCount={unreadCount} />

      <main className="mybox-main">
        <div className="mybox-main-inner">
          <MyBoxOwnerHeader
            nickname={auth?.nickname}
            userHandle={addressId}
            pageData={{ totalElements: 0, page: 0, totalPages: 1 }}
            showActions={false}
            // ✅ 글쓰기 눌러도 이미지 따라오게 하는 포인트
            profileImageUrl={profileImageUrl}
            headerImageUrl={headerImageUrl}
          />

          <MyBoxMidTabs />

          <section className="mybox-write-card">
            <div className="mybox-write-title-row">
              <h3 className="mybox-title">메세지 발송</h3>

              <div className="mybox-write-top-toggles">
                {/* ✅ AI 버튼은 "설정에서 AI 상담모드 ON"일 때만 보이게 */}
                {/* {aiMode && (
                  <button
                    type="button"
                    className={`pill-toggle ${askAi ? 'on' : ''}`}
                    onClick={() => setAskAi((v) => !v)}
                    disabled={sending || blocked}
                    aria-pressed={askAi}
                    title="AI가 답변을 달아줘요"
                  >
                    AI 답변
                  </button>
                )} */}

                {/* ✅ 비공개는 항상 존재 */}
                {/* <button
                  type="button"
                  className={`pill-toggle ${privateMessage ? 'on' : ''}`}
                  onClick={() => setPrivateMessage((v) => !v)}
                  disabled={sending || blocked}
                  aria-pressed={privateMessage}
                  title="나만 볼 수 있어요"
                >
                  비공개
                </button> */}

                {blocked && (
                  <span className="mybox-write-badge-blocked">차단됨</span>
                )}
              </div>
            </div>

            <p className="mybox-write-desc">
              상자에 남기고 싶은 나만의 메시지를 작성해요.
            </p>

            {blocked && (
              <div className="mybox-write-blocked-box" role="alert">
                <div className="mybox-write-blocked-title">
                  메시지를 보낼 수 없어요
                </div>
                <div className="mybox-write-blocked-msg">{blockedMsg}</div>
                <div className="mybox-write-blocked-help">
                  이 상태에서는 입력/발송이 비활성화됩니다.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <textarea
                className="mybox-write-textarea"
                rows={7}
                maxLength={500}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  blocked
                    ? '차단 상태에서는 메시지를 작성할 수 없어요.'
                    : '보내고 싶은 메시지를 입력해 주세요.'
                }
                disabled={sending || blocked}
              />

              <div className="mybox-write-count-wrapper">
                <span className="mybox-write-count">
                  {content.length} / 500
                </span>
              </div>

              {errorText && <p className="mybox-write-error">{errorText}</p>}

              <div className="mybox-write-actions">
                <button
                  type="submit"
                  className="mybox-write-btn primary"
                  disabled={sending || blocked}
                  title={blocked ? '차단 상태에서는 발송할 수 없어요.' : undefined}
                >
                  {blocked ? '발송 불가' : sending ? '발송 중...' : '메세지 발송'}
                </button>

                <button
                  type="button"
                  className="mybox-write-btn secondary"
                  onClick={() => navigate('/me/messages')}
                >
                  목록으로
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default MyBoxMessageWritePage;
