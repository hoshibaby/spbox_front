// src/pages/auth/SignupPage.jsx
import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);

  const [userIdCheck, setUserIdCheck] = useState({ available: null, message: '' });
  const [emailCheck, setEmailCheck] = useState({ available: null, message: '' });

  // ✅ 아이디 중복확인 (입력 멈추면 400ms 뒤 검사)
  useEffect(() => {
    const v = userId.trim();

    if (!v) {
      setUserIdCheck({ available: null, message: '' });
      return;
    }

    if (v.length < 4) {
      setUserIdCheck({ available: null, message: '아이디는 4자 이상 입력해주세요.' });
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await authService.checkUserId(v);
        setUserIdCheck(res.data); // { available, message }
      } catch (e) {
        setUserIdCheck({ available: null, message: '아이디 중복확인 실패(서버 오류)' });
      }
    }, 400);

    return () => clearTimeout(t);
  }, [userId]);

  // ✅ 이메일 중복확인
  useEffect(() => {
    const v = email.trim();

    if (!v) {
      setEmailCheck({ available: null, message: '' });
      return;
    }

    if (!v.includes('@')) {
      setEmailCheck({ available: null, message: '이메일 형식을 확인해주세요.' });
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await authService.checkEmail(v);
        setEmailCheck(res.data);
      } catch (e) {
        setEmailCheck({ available: null, message: '이메일 중복확인 실패(서버 오류)' });
      }
    }, 400);

    return () => clearTimeout(t);
  }, [email]);

  // ✅ 버튼 활성화 조건: 아이디/이메일 중복확인 통과 + 로딩 아닐 때
  const canSubmit =
    !loading &&
    userIdCheck.available === true &&
    emailCheck.available === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    setError('');
    setSuccessMsg('');

    try {
      // 1) 프론트 기본 검증
      if (!userId || !email || !nickname || !password || !passwordConfirm) {
        setError('모든 필드를 입력해 주세요.');
        return;
      }

      if (password !== passwordConfirm) {
        setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      // ✅ submit 때도 중복확인 통과 강제 (안전장치)
      if (userIdCheck.available !== true) {
        setError('아이디 중복확인을 통과해 주세요.');
        return;
      }
      if (emailCheck.available !== true) {
        setError('이메일 중복확인을 통과해 주세요.');
        return;
      }

      // 2) 회원가입
      await authService.signup({
        userId,
        email,
        nickname,
        password,
        passwordCheck: passwordConfirm,
      });

      // 3) 자동 로그인
      const loginRes = await authService.login({ userId, password });
      localStorage.setItem('auth', JSON.stringify(loginRes.data));

      // 4) 환영 게이트로 이동
      navigate('/welcome', { replace: true });

    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        '';

      if (typeof serverMsg === 'string' && serverMsg.includes('이메일')) {
        setError('이미 사용 중인 이메일입니다. 다른 이메일로 가입해 주세요.');
      } else if (
        typeof serverMsg === 'string' &&
        (serverMsg.includes('아이디') || serverMsg.includes('userId'))
      ) {
        setError('이미 사용 중인 아이디입니다. 다른 아이디로 가입해 주세요.');
      } else if (typeof serverMsg === 'string' && serverMsg.length > 0) {
        setError(serverMsg);
      } else {
        setError('회원가입에 실패했습니다. 입력 정보를 다시 확인해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="SecretBox Logo" className="login-logo-img" />
          <h2 className="auth-page-title">회원가입</h2>
          <p className="login-subtitle">
            SecretBox 계정을 만들어 비밀 메세지 상자를 만들어 보세요.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="로그인 아이디"
            />
            {userIdCheck.message && (
              <p className={userIdCheck.available ? "login-success" : "login-error"}>
                {userIdCheck.message}
              </p>
            )}
          </div>

          <div className="login-field">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
            />
            {emailCheck.message && (
              <p className={emailCheck.available ? "login-success" : "login-error"}>
                {emailCheck.message}
              </p>
            )}
          </div>

          <div className="login-field">
            <label>닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="상자의 이름"
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

          <button
            type="submit"
            className="login-button"
            disabled={!canSubmit}
          >
            {loading ? '처리 중...' : '회원가입'}
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
