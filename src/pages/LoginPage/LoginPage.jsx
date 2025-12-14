// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth.service';
import logo from '../../assets/secretbox-log.png';
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
      const res = await authService.login({ userId, password });
      const data = res.data; // token, userId, email, nickname...

      const auth = {
        id: data.id,                 // DB PK
        userId: data.userId,         // 로그인 아이디
        email: data.email,
        nickname: data.nickname,
        role: data.role,
        addressId: data.addressId,
        token: data.token,           // JWT
        boxUrlKey: data.boxUrlKey,
      };

      localStorage.setItem('auth', JSON.stringify(auth));
      console.log('login success auth >>>', auth);

      alert(`${data.nickname}님, 로그인 되었습니다 :)`);
      navigate('/me/messages'); // 로그인 후 이동
    } catch (err) {
      console.error(err);

      // ✅ 백엔드에서 내려준 에러 메시지 우선 사용
      const message =
        err?.response?.data?.message ||
        '아이디 또는 비밀번호를 확인해 주세요.';

      setError(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* 상단 로고 영역 */}
        <div className="login-header">
          <img src={logo} alt="SecretBox Logo" className="login-logo-img" />
          <p className="login-subtitle">
            익명으로 도착한 비밀 메시지를 한 곳에서 확인해요.
          </p>
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

        {/* 하단 링크들 - 여기서 라우팅 연결 ✅ */}
        <div className="login-footer-links">
          <button type="button" onClick={() => navigate('/find-id')}>
            아이디 찾기
          </button>
          <span>|</span>
          <button type="button" onClick={() => navigate('/find-password')}>
            비밀번호 찾기
          </button>
          <span>|</span>
          <button type="button" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
