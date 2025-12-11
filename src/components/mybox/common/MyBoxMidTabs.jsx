// src/components/mybox/common/MyBoxTabs.jsx
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

      {/* 상담 모드 */}
      <NavLink
        to="/me/counseling"
        className={({ isActive }) =>
          "mybox-tab" + (isActive ? " mybox-tab-active" : "")
        }
      >
        상담모드
      </NavLink>
    </div>
  );
}

export default MyBoxMidTabs;
