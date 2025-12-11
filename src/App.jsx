// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import MessageViewPage from './pages/mybox/MessageView';
import MyBoxMessagesPage from './pages/mybox/MyBoxMessages';
import MyMessageDetailPage from './pages/mybox/MyMessageDetail';
import MyMessageWritePage from './pages/mybox/MyMessageWritePage';

import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/LoginPage/SignupPage';
import FindIdPage from './pages/LoginPage/FindIdPage';
import FindPasswordPage from './pages/LoginPage/FindPasswordPage';

import NavigationBar from './components/NavigationBar/NavigationBar';
import NotificationPage from './pages/notification/NotificationPage';
import MyBoxReplyView from './components/mybox/detail/MyBoxReplyView';
import SettingsPage from './components/mybox/setting/SettingsPage';


function App() {
  return (
    <div className="app-root">
      <NavigationBar />

      <Routes>
        <Route path="/" element={<Navigate to="/me/messages" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/userId/:userId" element={<MessageViewPage />} />

        <Route path="/q/:urlKey" element={<MessageViewPage />} />
        <Route path="/me/messages" element={<MyBoxMessagesPage />} />
        <Route path="/me/replies" element={<MyBoxReplyView />} />
        {/* <Route path="/me/counseling" element={<MyBoxCounselingPage />} /> */}
        <Route path="/me/messages/:id" element={<MyMessageDetailPage />} />
        <Route path="/me/notifications" element={<NotificationPage />} />
        <Route path="/me/messages/new" element={<MyMessageWritePage />} />
        <Route path="/me/settings" element={<SettingsPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindIdPage />} />
        <Route path="/find-password" element={<FindPasswordPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
