// src/App.jsx
import { Routes, Route } from "react-router-dom";

import MessageViewPage from "./pages/mybox/MessageView";
import MyBoxMessagesPage from "./pages/mybox/MyBoxMessages";
import MyMessageDetailPage from "./pages/mybox/MyMessageDetail";

import LoginPage from "./pages/LoginPage/LoginPage";
import Home from "./pages/home/Home";
import NavigationBar from "./components/NavigationBar/NavigationBar";

function App() {
  return (
    <div className="app-root">
      <NavigationBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/q/:urlKey" element={<MessageViewPage />} />
        <Route path="/me/messages" element={<MyBoxMessagesPage />} />
        <Route path="/me/messages/:id" element={<MyMessageDetailPage />} />

        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
