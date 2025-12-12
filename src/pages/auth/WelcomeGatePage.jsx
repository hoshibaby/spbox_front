import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomeGatePage.css";

function WelcomeGatePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  // 로그인 안 되어있으면 (예: 새로고침/직접접속) 로그인으로
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (!auth?.id) navigate("/login", { replace: true });
  }, [navigate]);

  const handleConfirm = () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    const key = `welcomeAck:${auth?.id ?? "guest"}`;
    localStorage.setItem(key, "1");

    setOpen(false);
    navigate("/me/messages", { replace: true });
  };

  if (!open) return null;

  return (
    <div className="wg-backdrop">
      <div className="wg-modal">
        <div className="wg-title">
          이야기가 가득한 이곳에 온 것을 환영합니다.
          <span>나는 상자의 영원한 친구 사자왕자, 🦁👑</span></div>

        <div className="wg-body">
          <p>여기는 <b>익명</b>으로 운영되는 메시지함입니다.<br/>
          하지만 따뜻한 말까지 가릴 필요는 없겠죠. </p>
          <p className="wg-hint">
            따뜻한 말은 마음껏, <br />
            날카로운 말은 살짝 접어서 주머니에 쏙 넣어주시겠소?
          </p>
        </div>

        <button className="wg-btn" onClick={handleConfirm}>
          네! 주머니에 넣었어요! ✨📦✨
        </button>
      </div>
    </div>
  );
}

export default WelcomeGatePage;
