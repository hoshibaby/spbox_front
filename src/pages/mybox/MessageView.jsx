// src/pages/MessageView.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import boxService from '../../service/box.service';
import './MyBoxMessages.css';

function MessageView() {
  const { urlKey } = useParams();
  console.log('urlKey:', urlKey);

  const [header, setHeader] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const headerRes = await boxService.getBoxHeader(urlKey);
        setHeader(headerRes.data);

        const msgRes = await boxService.getPublicMessages(urlKey, 0, 10);
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
  }, [urlKey]);

  if (loading) return <div className="container mt-4">불러오는 중...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (!header || !pageData) return <div className="container mt-4">데이터가 없어요.</div>;

  const messages = pageData.content || [];

  return (
    <div className="container mt-4" style={{ maxWidth: '700px' }}>
      {/* 박스 헤더 */}
      <div className="card mb-4">
        <div className="card-body d-flex align-items-center">
          {header.profileImageUrl && (
            <img
              src={header.profileImageUrl}
              alt="profile"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '16px',
              }}
            />
          )}

          <div>
            <h4 className="mb-1">{header.boxTitle}</h4>

            <div className="text-muted">주인: {header.ownerName}</div>

            <div className="mt-2 small text-muted">
              총 {header.totalMessageCount}개 · 미답장 {header.unreadMessageCount}개 · 답장 {header.replyCount}개
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 리스트 */}
      <h5 className="mb-3">
        메시지 목록
        <span className="text-muted small">
          {' '}
          (페이지 {pageData.page + 1} / {pageData.totalPages})
        </span>
      </h5>

      <div className="list-group">
        {messages.length === 0 && <div className="text-muted">아직 등록된 메시지가 없어요.</div>}

        {messages.map((msg) => (
          <div key={msg.id} className="list-group-item">
            {/* 작성자 표시 (authorLabel) */}
            <div className="d-flex justify-content-between mb-1">
              <span className="text-primary fw-bold">{msg.authorLabel}</span>

              <small className="text-muted">{msg.createdAt?.replace('T', ' ').substring(0, 16)}</small>
            </div>

            {/* 내용 요약 */}
            <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
              {msg.shortContent}
            </p>

            {/* 상태 배지 */}
            <div className="mt-2">
              {msg.hasReply && <span className="badge bg-success me-1">답장 완료</span>}
              {msg.hidden && <span className="badge bg-secondary">숨김됨</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MessageView;
