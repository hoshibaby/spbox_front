// src/components/mybox/common/MyBoxMidTabs.jsx
import { NavLink } from "react-router-dom";
import "./MyBoxMidTabs.css";

function MyBoxMidTabs() {
  return (
    <div className="mybox-tabs">
      {/* 받은 메시지 목록 */}
      <NavLink
        to="/me/messages"
        end
        className={({ isActive }) =>
          "mybox-tab" + (isActive ? " mybox-tab-active" : "")
        }
      >
        메시지
      </NavLink>

      {/* 답장 모아보기 */}
      <NavLink
        to="/me/replies"
        className={({ isActive }) =>
          "mybox-tab" + (isActive ? " mybox-tab-active" : "")
        }
      >
        답장
      </NavLink>

      {/* 상담모드는 탭에서 제거! 나중에 버튼으로 따로 구현 예정 */}
    </div>
  );
}

export default MyBoxMidTabs;
