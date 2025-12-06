// src/components/mybox/MyBoxSideMenu.jsx
import './MyBoxSideMenu.css';


function MyBoxSideMenu({ active = "mybox" }) {
  return (
    <aside className="mybox-sidebar">
      <button
        className={
          "mybox-menu-btn" + (active === "log" ? " mybox-menu-active" : "")
        }
      >
        로그
      </button>
      <button
        className={
          "mybox-menu-btn" + (active === "mybox" ? " mybox-menu-active" : "")
        }
      >
        MyBox
      </button>
      <button
        className={
          "mybox-menu-btn" + (active === "alert" ? " mybox-menu-active" : "")
        }
      >
        알림
      </button>
      <button
        className={
          "mybox-menu-btn" + (active === "settings" ? " mybox-menu-active" : "")
        }
      >
        설정
      </button>
    </aside>
  );
}

export default MyBoxSideMenu;
