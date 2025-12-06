// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth.service';
import './LoginPage.css';

function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await authService.login(userId, password);
      const data = res.data; // token, userId, email, nickname...

      // 브라우저에 로그인 정보 저장
      localStorage.setItem('auth', JSON.stringify(data));

      alert(`${data.nickname}님, 로그인 되었습니다 :)`);
      navigate('/me/messages'); // 일단 메인으로 돌려보내기
    } catch (err) {
      console.error(err);
      setError('아이디 또는 비밀번호를 확인해 주세요.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* 서비스 로고 / 제목 */}
        <div className="login-header">
          <div className="login-logo-mark" />
          <h1 className="login-title">SecretBox</h1>
          <p className="login-subtitle">익명으로 도착한 비밀 메시지를 한 곳에서 확인해요.</p>
        </div>

        {/* 로그인 폼 */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디 또는 이메일"
            />
          </div>

          <div className="login-field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
            />
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>

        {/* 아래 작은 링크들 (일단 모양만) */}
        <div className="login-footer-links">
          <button type="button">아이디 찾기</button>
          <span>|</span>
          <button type="button">비밀번호 찾기</button>
          <span>|</span>
          <button type="button">회원가입</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
