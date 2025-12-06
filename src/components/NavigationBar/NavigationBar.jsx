// src/components/NavigationBar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./NavigationBar.css";

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState(null);

  // 새로고침해도 localStorage 값 읽어오기
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        setAuth(JSON.parse(stored));
      } catch {
        setAuth(null);
      }
    } else {
      setAuth(null);
    }
  }, [location]);

  const isLoggedIn = !!auth;
  const nickname = auth?.nickname || "";

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    navigate("/login");
  };

  return (
    <header className="nav-root">
      <div className="nav-inner">
        {/* 왼쪽 로고 / 홈 */}
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            SecretBox
          </Link>
        </div>

        {/* 가운데 메뉴는 비워두기 */}
        <div className="nav-center" />

        {/* 오른쪽 로그인 / 로그아웃 */}
        <div className="nav-right">
          {isLoggedIn ? (
            <>
              <span className="nav-nickname">{nickname}님</span>
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavigationBar;
