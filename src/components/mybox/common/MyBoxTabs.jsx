// src/components/mybox/common/MyBoxTabs.jsx
import { NavLink } from "react-router-dom";
import "../layout/MyBoxLayout.css"; // 탭 스타일을 여기서 같이 줄 거면

function MyBoxTabs({ active }) {
  return (
    <div className="mybox-tabs">
      {/* 메시지 탭 */}
      <NavLink
        to="/me/messages"
        className={
          active === "messages"
            ? "mybox-tab mybox-tab-active"
            : "mybox-tab"
        }
      >
        메시지
      </NavLink>

      {/* 답장 탭 */}
      <NavLink
        to="/me/replies"
        className={
          active === "replies"
            ? "mybox-tab mybox-tab-active"
            : "mybox-tab"
        }
      >
        답장
      </NavLink>

      {/* 상담모드 탭 – 나중에 구현해도 되고 일단 자리는 만들기 */}
      <NavLink
        to="/me/counseling"
        className={
          active === "counseling"
            ? "mybox-tab mybox-tab-active"
            : "mybox-tab"
        }
      >
        상담모드
      </NavLink>
    </div>
  );
}

export default MyBoxTabs;
