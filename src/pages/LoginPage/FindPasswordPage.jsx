// src/pages/auth/FindPasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth.service';
import logo from '../../assets/secretbox-log.png';
import './LoginPage.css';

function FindPasswordPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!userId || !email) {
      setError('아이디와 이메일을 모두 입력해 주세요.');
      return;
    }

    try {
      await authService.requestPasswordReset(userId, email);
      setSuccessMsg('비밀번호 재설정 메일을 발송했습니다. 메일함을 확인해 주세요.');
    } catch (err) {
      console.error(err);
      setError('비밀번호 찾기 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="SecretBox Logo" className="login-logo-img" />
          <h2 className="auth-page-title">비밀번호 찾기</h2>
          <p className="auth-page-subtitle">아이디와 이메일을 입력하면 비밀번호 재설정 링크를 보내드려요.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="로그인에 사용하는 아이디"
            />
          </div>

          <div className="login-field">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입하신 이메일"
            />
          </div>

          <button type="submit" className="login-button">
            비밀번호 재설정 메일 보내기
          </button>

          {error && <p className="login-error">{error}</p>}
          {successMsg && <p className="login-success">{successMsg}</p>}
        </form>

        <div className="auth-bottom-links">
          <button type="button" onClick={() => navigate('/find-id')}>
            아이디 찾기
          </button>
          <span>|</span>
          <button type="button" onClick={() => navigate('/login')}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default FindPasswordPage;
