// src/pages/mybox/MyBoxMessageWritePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import messageService from '../../service/message.service';
import MyBoxMidTabs from '../../components/mybox/common/MyBoxMidTabs';
import MyBoxSideMenu from '../../components/mybox/common/MyBoxSideMenu';
import MyBoxOwnerHeader from '../../components/mybox/common/MyBoxOwnerHeader';

import '../../components/mybox/layout/MyBoxLayout.css';
import './MyMessageWritePage.css';   // ← 실제 파일명에 맞게!

function MyBoxMessageWritePage() {
  const [content, setContent] = useState('');
  const [errorText, setErrorText] = useState('');
  const [sending, setSending] = useState(false);
  const unreadCount = 0;

  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  const loginUserPk = auth?.id;          // DB PK
  const boxUrlKey = auth?.boxUrlKey;     // boxUrlKey
  const addressId = auth?.addressId

  

  if (!auth) {
    navigate('/login');
    return null;
  }

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
        boxUrlKey: boxUrlKey,
        content: content.trim(),
      };

      await messageService.sendMessage(dto, loginUserPk);

      alert('메시지가 발송되었어요 :)');
      navigate('/me/messages');
    } catch (err) {
      console.error(err);
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
          />
          <MyBoxMidTabs />
          <section className="mybox-write-card">
            <h3 className="mybox-title">메세지 발송</h3>
            <p className="mybox-write-desc">
              익명으로 남겨진 고민에 답장을 보내거나, 새로운 비밀 상담 메시지를 작성해요.
            </p>

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
                  {sending ? '발송 중...' : '메세지 발송'}
                </button>
                <button
                  type="button"
                  className="mybox-write-btn secondary"
                  onClick={() => navigate('/me/messages')}
                >
                  취소
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
