// src/pages/auth/FindIdPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth.service';
import logo from '../../assets/secretbox-log.png';
import './LoginPage.css';

function FindIdPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFoundId('');

    if (!email) {
      setError('이메일을 입력해 주세요.');
      return;
    }

    try {
      const res = await authService.findIdByEmail(email);
      const data = res.data;
      if (data && data.userId) {
        setFoundId(data.userId);
      } else {
        setError('해당 이메일로 등록된 아이디를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('아이디를 찾는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="SecretBox Logo" className="login-logo-img" />
          <h2 className="auth-page-title">아이디 찾기</h2>
          <p className="auth-page-subtitle">가입 시 사용한 이메일 주소를 입력하면 아이디를 찾아드려요.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
            아이디 찾기
          </button>

          {error && <p className="login-error">{error}</p>}
          {foundId && (
            <p className="login-success">
              가입하신 아이디는 <strong>{foundId}</strong> 입니다.
            </p>
          )}
        </form>

        <div className="auth-bottom-links">
          <button type="button" onClick={() => navigate('/find-password')}>
            비밀번호 찾기
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

export default FindIdPage;
