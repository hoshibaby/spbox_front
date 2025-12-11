// src/components/mybox/setting/SettingsPage.jsx
import './SettingsPage.css';
import userProfileService from '../../../service/userProfile.service';
import MyBoxOwnerHeader from '../common/MyBoxOwnerHeader';
import { useEffect, useState } from 'react';

import api from '../../../service/axios';
import { storage } from '../../../StorageConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function SettingsPage() {
  // ──────────────────────
  // 1. 기본 상태 & 훅들
  // ──────────────────────
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const loginUserId = auth?.userId; // 로그인 ID (userId)


  const [nickname, setNickname] = useState('김열시'); // 임시 기본값
  const [aiMode, setAiMode] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ──────────────────────
  // 2. 최초 마운트 시 내 프로필 불러오기
  // ──────────────────────
  useEffect(() => {
    if (!loginUserId) {
      setError('로그인 정보가 없습니다.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await userProfileService.getMyProfile(loginUserId);
        const data = res.data;

        setNickname(data.nickname || '');
        setAiMode(!!data.aiConsultingEnabled);
        setProfilePreview(data.profileImageUrl || null);
        setHeaderPreview(data.headerImageUrl || null);
      } catch (e) {
        console.error('프로필 조회 실패:', e);
        setError('프로필 정보를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [loginUserId]);

  // ──────────────────────
  // 3. 공통 유틸 함수들
  // ──────────────────────

  // Firebase Storage에 이미지 업로드하고 다운로드 URL 리턴
  const uploadImageToStorage = async (file, folder) => {
    if (!file) return null;
    if (!loginUserId) {
      alert('로그인 정보가 없습니다.');
      return null;
    }

    const ext = file.name.split('.').pop();
    const filename = `${folder}/${loginUserId}_${Date.now()}.${ext}`;
    const storageRef = ref(storage, filename);

    // 파일 업로드
    await uploadBytes(storageRef, file);

    // 다운로드 URL 가져오기
    const url = await getDownloadURL(storageRef);
    return url;
  };

  // 공통 프로필 업데이트 함수
  const updateProfile = async (partial) => {
    if (!loginUserId) return;

    try {
      const res = await userProfileService.updateMyProfile(loginUserId, partial);
      const data = res.data;

      // 서버에서 돌아온 최신 값을 다시 상태에 반영
      setNickname(data.nickname || '');
      setAiMode(!!data.aiConsultingEnabled);
      setProfilePreview(data.profileImageUrl || null);
      setHeaderPreview(data.headerImageUrl || null);

      // (선택) auth.nickname도 같이 업데이트하면 상단 네비도 바로 반영됨
      const stored = JSON.parse(localStorage.getItem('auth') || '{}');
      if (data.nickname) {
        stored.nickname = data.nickname;
        localStorage.setItem('auth', JSON.stringify(stored));
      }
    } catch (e) {
      console.error('프로필 업데이트 실패:', e);
      alert('프로필 저장 중 오류가 발생했어요.');
    }
  };

  // ──────────────────────
  // 4. 이벤트 핸들러들
  // ──────────────────────

  // 프로필 이미지 변경
  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    (async () => {
      try {
        const url = await uploadImageToStorage(file, 'profile');
        if (!url) return;

        setProfilePreview(url);
        await updateProfile({ profileImageUrl: url });
      } catch (err) {
        console.error('프로필 이미지 업로드 실패:', err);
        alert('프로필 이미지 업로드에 실패했어요.');
      }
    })();
  };

  // 헤더 이미지 변경
  const handleHeaderChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    (async () => {
      try {
        const url = await uploadImageToStorage(file, 'header');
        if (!url) return;

        setHeaderPreview(url);
        await updateProfile({ headerImageUrl: url });
      } catch (err) {
        console.error('헤더 이미지 업로드 실패:', err);
        alert('헤더 이미지 업로드에 실패했어요.');
      }
    })();
  };

  // 닉네임 저장
  const handleNicknameSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    await updateProfile({ nickname });
  };

  // AI 상담 모드 토글
  const handleAiToggle = async (e) => {
    const checked = e.target.checked;
    setAiMode(checked); // 화면 즉시 반영

    try {
      await api.put('/api/me/settings/ai', null, {
        params: { userId: loginUserId, enabled: checked },
      });
    } catch (e) {
      console.error(e);
      alert('AI 상담 모드 저장 실패');
    }
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    if (!loginUserId) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    const ok = window.confirm('정말 계정을 삭제할까요?\n삭제 후에는 되돌릴 수 없어요.');
    if (!ok) return;

    try {
      // 1) 프로필/헤더 이미지 먼저 지우기 (있을 때만)
      await Promise.all([deleteImageByUrl(profilePreview), deleteImageByUrl(headerPreview)]);

      // 2) 서버에 계정 삭제 요청
      await api.delete('/api/me', {
        params: { userId: loginUserId },
      });

      // 3) 로컬 로그인 정보 삭제 + 이동
      localStorage.removeItem('auth');
      alert('계정이 삭제됐어요🥲');
      window.location.replace('/');
    } catch (e) {
      console.error('계정 삭제 실패:', e);
      alert('계정 삭제 중 오류가 발생했어요.');
    }
  };

  // 다운로드 URL -> storage 경로로 바꿔서 삭제
  const deleteImageByUrl = async (url) => {
    if (!url) return;

    try {
      // URL 안에 들어있는 경로 부분 꺼내기
      // 예: https://firebasestorage.googleapis.com/v0/b/.../o/profile%2Fyeolsi10_123.png?alt=media...
      const decoded = decodeURIComponent(url);
      const match = decoded.match(/\/o\/(.*?)\?/); // o/ 와 ? 사이가 우리가 쓴 path
      if (!match || !match[1]) return;

      const path = match[1]; // ex) "profile/yeolsi10_123.png"
      const imgRef = ref(storage, path);

      await deleteObject(imgRef);
      console.log('삭제 완료:', path);
    } catch (e) {
      console.error('이미지 삭제 실패:', e);
      // 굳이 alert 안 띄우고, 실패하더라도 계정 삭제는 계속 진행해도 돼
    }
  };

  // ──────────────────────
  // 5. 렌더링
  // ──────────────────────
  if (loading) {
    return <div className="settings-page">불러오는 중...</div>;
  }

  if (error) {
    return <div className="settings-page">에러: {error}</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-page-inner">
        <MyBoxOwnerHeader
          nickname={nickname}
          userHandle={auth?.userId}
          showActions={false}
          profileImageUrl={profilePreview}
          headerImageUrl={headerPreview}
        />

        <main className="settings-main">
          {/* 1) 프로필 / 박스 설정 섹션 */}
          <section className="settings-card">
            <h2 className="settings-card-title">프로필 설정</h2>

            <div className="settings-row">
              {/* 프로필 이미지 */}
              <div className="settings-field">
                <label className="settings-label">프로필 사진</label>
                <div className="settings-image-row">
                  <div className="settings-image-preview">
                    {profilePreview ? (
                      <img src={profilePreview} alt="프로필 미리보기" />
                    ) : (
                      <span className="settings-image-placeholder">이미지 없음</span>
                    )}
                  </div>
                  <div>
                    <div className="file-upload-box">
                      <label className="file-upload-button">
                        이미지 업로드
                        <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                      </label>
                      <span className="file-upload-name">{profilePreview ? '이미지 선택됨' : '선택된 파일 없음'}</span>
                    </div>
                    <p className="settings-help">권장: 400×400px ~ 600×600px (정사각형)</p>
                  </div>
                </div>
              </div>

              {/* 헤더 이미지 */}
              <div className="settings-field">
                <label className="settings-label">헤더 배경 이미지</label>
                <div className="settings-image-row">
                  <div className="settings-header-preview">
                    {headerPreview ? (
                      <img src={headerPreview} alt="헤더 미리보기" />
                    ) : (
                      <span className="settings-image-placeholder">이미지 없음</span>
                    )}
                  </div>
                  <div>
                    <div className="file-upload-box">
                      <label className="file-upload-button">
                        이미지 업로드
                        <input type="file" accept="image/*" onChange={handleHeaderChange} hidden />
                      </label>
                      <span className="file-upload-name">{headerPreview ? '이미지 선택됨' : '선택된 파일 없음'}</span>
                    </div>
                    <p className="settings-help">권장: 1200×300px ~ 1600×400px (가로로 긴 이미지)</p>
                  </div>
                </div>
              </div>

              {/* 닉네임 */}
              <div className="settings-field">
                <label className="settings-label">닉네임</label>
                <form onSubmit={handleNicknameSubmit} className="settings-inline-form">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="settings-input"
                  />
                  <button type="submit" className="settings-button">
                    저장
                  </button>
                </form>
                <p className="settings-help">박스 주인 이름으로 표시돼요. (최대 10자)</p>
              </div>
            </div>
          </section>

          {/* 2) AI 상담 모드 섹션 */}
          <section className="settings-card">
            <h2 className="settings-card-title">AI 상담 모드</h2>
            <div className="settings-field settings-ai-toggle">
              <label className="settings-label">AI 상담 모드 사용</label>
              <label className="switch">
                <input type="checkbox" checked={aiMode} onChange={handleAiToggle} />
                <span className="slider" />
              </label>
            </div>
            <p className="settings-help">이 기능을 켜면 박스에서 AI 상담 버튼이 활성화돼요.</p>
          </section>

          {/* 3) 위험 영역 섹션 */}
          <section className="settings-card settings-danger-card">
            <h2 className="settings-card-title">계정 삭제</h2>
            <p className="settings-help">계정 및 박스를 영구 삭제합니다. 복구할 수 없어요.</p>
            <button className="settings-button-danger" onClick={handleDeleteAccount}>
              계정 삭제하기
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
