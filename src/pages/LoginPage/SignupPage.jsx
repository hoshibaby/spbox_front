// src/pages/auth/SignupPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth.service';
import logo from '../../assets/secretbox-log.png';
import './LoginPage.css';

function SignupPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!userId || !email || !nickname || !password || !passwordConfirm) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      await authService.signup({
        userId,
        email,
        nickname,
        password,
        passwordCheck: passwordConfirm,
        // 백엔드에서 passwordCheck를 요구하면 아래도 같이 보내기:
        // passwordCheck: passwordConfirm,
      });

      setSuccessMsg('회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError('회원가입에 실패했습니다. 입력 정보를 다시 확인해 주세요.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="SecretBox Logo" className="login-logo-img" />
          <h2 className="auth-page-title">회원가입</h2>
          <p className="login-subtitle">
            SecretBox 계정을 만들어 비밀 메시지를 관리해 보세요.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="로그인에 사용할 아이디"
            />
          </div>

          <div className="login-field">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
            />
          </div>

          <div className="login-field">
            <label>닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="상자에 표시될 이름"
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

          <div className="login-field">
            <label>비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
            />
          </div>

          <button type="submit" className="login-button">
            회원가입
          </button>

          {error && <p className="login-error">{error}</p>}
          {successMsg && <p className="login-success">{successMsg}</p>}
        </form>

        <button
          type="button"
          className="auth-back-link"
          onClick={() => navigate('/login')}
        >
          이미 계정이 있으신가요? 로그인 하기
        </button>
      </div>
    </div>
  );
}

export default SignupPage;
