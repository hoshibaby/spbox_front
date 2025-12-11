// src/components/mybox/MyBoxSideMenu.jsx
import './MyBoxSideMenu.css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faGear } from '@fortawesome/free-solid-svg-icons';


function MyBoxSideMenu({ unreadNotificationCount = 0 }) {
  console.log('MyBoxSideMenu unreadNotificationCount >>>', unreadNotificationCount);
  return (
    <>
      <aside className="mybox-sidebar">

        {/* MyBox */}
        <NavLink
          to="/me/messages"
          className={({ isActive }) => 'mybox-menu-btn' + (isActive ? ' mybox-menu-active' : '')}
        >
          <FontAwesomeIcon icon={faEnvelope} className="mybox-menu-icon" />
          <span className="mybox-menu-label">My Box</span>
        </NavLink>

        {/* 알림 */}
        <NavLink
          to="/me/notifications"
          className={({ isActive }) => 'mybox-menu-btn' + (isActive ? ' mybox-menu-active' : '')}
        >
          <FontAwesomeIcon icon={faBell} className="mybox-menu-icon" />
          <span className="mybox-menu-label">Notice</span>

          {/* 미읽음 배지 표시 */}
          {unreadNotificationCount > 0 && (
            <span className="mybox-menu-badge">{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</span>
          )}
        </NavLink>

        {/* 설정 */}
        <NavLink
          to="/me/settings"    
          className={({ isActive }) =>
            "mybox-menu-btn" + (isActive ? " mybox-menu-active" : "")
          }
        >
          <FontAwesomeIcon icon={faGear} className="mybox-menu-icon" />
          <span className="mybox-menu-label">설정</span>
        </NavLink>
      </aside>
    </>
  );
}

export default MyBoxSideMenu;
