// src/components/mybox/setting/SettingsPage.jsx
import './SettingsPage.css';
import userProfileService from '../../../service/userProfile.service';
import blacklistService from '../../../service/blacklist.service';
import MyBoxOwnerHeader from '../common/MyBoxOwnerHeader';
import { useEffect, useState } from 'react';

import api from '../../../service/axios';
import { storage } from '../../../StorageConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// ✅ auth를 안전하게 읽는 헬퍼 (null 기준 통일)
function getAuth() {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('auth 파싱 실패:', e);
    return null;
  }
}

function SettingsPage() {
  // 1) auth
  const auth = getAuth();
  // const loginUserPk = auth?.id;   
  const loginUserId = auth?.userId; // 로그인 ID (userId)

  // 2) 상태
  const [nickname, setNickname] = useState('');
  const [todayMessage, setTodayMessage] = useState('');
  const [aiMode, setAiMode] = useState(false);

  // ✅ 박스 설정(익명 허용)
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const [profilePreview, setProfilePreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 비밀번호 변경용 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ✅ 블랙리스트 상태
  const [blacklist, setBlacklist] = useState([]);
  const [blLoading, setBlLoading] = useState(false);
  const [blError, setBlError] = useState('');
  const [blOpen, setBlOpen] = useState(false);

  // ✅ 블랙리스트 불러오기
  const fetchBlacklist = async () => {
    if (!loginUserId) return;
    try {
      setBlLoading(true);
      setBlError('');
      const res = await blacklistService.getMyBlacklist(loginUserId);
      setBlacklist(res.data || []);
    } catch (e) {
      console.error('블랙리스트 조회 실패:', e);
      setBlError('차단 목록을 불러오지 못했어요.');
    } finally {
      setBlLoading(false);
    }
  };

  // ✅ 차단 해제
  const handleUnblock = async (blockedUserId) => {
    if (!loginUserId) return alert('로그인 정보가 없습니다.');
    try {
      await blacklistService.unblockUser(loginUserId, blockedUserId);
      setBlacklist((prev) => prev.filter((x) => x.blockedUserId !== blockedUserId));
    } catch (e) {
      console.error('차단 해제 실패:', e);
      alert('차단 해제에 실패했어요.');
    }
  };

  // 3) 최초 마운트 - 내 프로필 + 내 박스 설정 + 블랙리스트 불러오기
  useEffect(() => {
    if (!loginUserId) {
      setError('로그인 정보가 없습니다.');
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');

        // ✅ 1) 프로필
        const profileRes = await userProfileService.getMyProfile();
        const p = profileRes.data;

        setNickname(p.nickname || '');
        setTodayMessage(p.todayMessage || '');
        // setAiMode(!!p.aiConsultingEnabled);
        setProfilePreview(p.profileImageUrl || null);
        setHeaderPreview(p.headerImageUrl || null);

        // ✅ 2) 박스 설정(익명 허용 여부)
        // BoxController: GET /api/me/box?userId=ororong1
        const boxRes = 
        await api.get('/api/me/box', { params: { userId: loginUserId } });
        // await api.get('/api/me/box', { params: { userId: loginUserPk } });

        const ai =
        boxRes?.data?.box?.aiMode ??
        boxRes?.data?.aiMode ??
        false;

setAiMode(!!ai);

        const allow =
          boxRes?.data?.box?.allowAnonymous ??
          boxRes?.data?.allowAnonymous ??
          true;

        setAllowAnonymous(!!allow);

        // ✅ 3) 블랙리스트
        await fetchBlacklist();
      } catch (e) {
        console.error('설정 조회 실패:', e);
        setError('프로필 정보를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUserId]);

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

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // ✅ 공통 프로필 업데이트 (payload만!)
  const updateProfile = async (partial) => {
    try {
      const res = await userProfileService.updateMyProfile(partial);
      const data = res.data;

      setNickname(data.nickname || '');
      // setAiMode(!!data.aiConsultingEnabled);
      setProfilePreview(data.profileImageUrl || null);
      setHeaderPreview(data.headerImageUrl || null);
      setTodayMessage(data.todayMessage || '');
      setAllowAnonymous(data.allowAnonymous ?? true);

      // ✅ auth(localStorage)도 같이 갱신 (헤더용)
      const stored = getAuth() || {};
      stored.nickname = data.nickname;
      stored.profileImageUrl = data.profileImageUrl;
      stored.headerImageUrl = data.headerImageUrl;
      stored.todayMessage = data.todayMessage;
      localStorage.setItem('auth', JSON.stringify(stored));
    } catch (e) {
      console.error('프로필 업데이트 실패:', e);
      alert('프로필 저장 중 오류가 발생했어요.');
    }
  };

  // 다운로드 URL -> storage 경로로 바꿔서 삭제
  const deleteImageByUrl = async (url) => {
    if (!url) return;
    try {
      const decoded = decodeURIComponent(url);
      const match = decoded.match(/\/o\/(.*?)\?/);
      if (!match || !match[1]) return;

      const path = match[1];
      const imgRef = ref(storage, path);
      await deleteObject(imgRef);
    } catch (e) {
      console.error('이미지 삭제 실패:', e);
    }
  };

  // 프로필 이미지 변경
  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    (async () => {
      const url = await uploadImageToStorage(file, 'profile');
      if (!url) return;

      setProfilePreview(url);
      await updateProfile({ profileImageUrl: url });
    })();
  };

  // 헤더 이미지 변경
  const handleHeaderChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    (async () => {
      const url = await uploadImageToStorage(file, 'header');
      if (!url) return;

      setHeaderPreview(url);
      await updateProfile({ headerImageUrl: url });
    })();
  };

  // 닉네임 저장
  const handleNicknameSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return alert('닉네임을 입력해 주세요.');
    await updateProfile({ nickname: nickname.trim() });
  };

  // 오늘 한마디 저장
  const handleTodayMessageSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ todayMessage: todayMessage.trim() });
  };

  // AI 상담 모드 토글
  const handleAiToggle = async (e) => {
    const checked = e.target.checked;
    setAiMode(checked);

    try {
      await api.put('/api/me/settings/ai', null, {
        // params: { userId: loginUserId, enabled: checked },
        params: { userId: loginUserPk, enabled: checked },
      });
    } catch (err) {
      console.error(err);
      alert('AI 상담 모드 저장 실패');
    }
  };

  // ✅ 회원/비회원(익명 허용) 토글
  const handleAnonymousToggle = async (e) => {
    const checked = e.target.checked;
    setAllowAnonymous(checked);

    try {
      await api.put('/api/me/box/anonymous', null, {
        params: { userId: loginUserId, allowAnonymous: checked },
        // params: { userId: loginUserPk, allowAnonymous: checked },
      });
    } catch (err) {
      console.error(err);
      alert('회원/비회원 설정 저장 실패');
      setAllowAnonymous((prev) => !prev); // 실패하면 UI 원복
    }
  };

  // 블랙리스트 토글
  const toggleBlacklist = async () => {
    // 닫혀있던 걸 여는 순간이면 목록 갱신
    if (!blOpen) {
      await fetchBlacklist();
    }
    setBlOpen(v => !v);
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return setPasswordError('모든 비밀번호 칸을 입력해 주세요.');
    }
    if (newPassword !== newPasswordConfirm) {
      return setPasswordError('새 비밀번호와 확인이 일치하지 않습니다.');
    }

    try {
      await api.put(
        '/api/me/password',
        { currentPassword, newPassword },
        { params: { userId: loginUserId } }
      );

      setPasswordSuccess('비밀번호가 안전하게 변경되었어요.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
      const msg = err?.response?.data?.message || '비밀번호 변경 중 오류가 발생했어요.';
      setPasswordError(msg);
    }
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    if (!loginUserId) return alert('로그인 정보가 없습니다.');
    const ok = window.confirm('정말 계정을 삭제할까요?\n삭제 후에는 되돌릴 수 없어요.');
    if (!ok) return;

    try {
      await Promise.all([deleteImageByUrl(profilePreview), deleteImageByUrl(headerPreview)]);
      await api.delete('/api/me', { params: { userId: loginUserId } });

      localStorage.removeItem('auth');
      alert('계정이 삭제됐어요🥲');
      window.location.replace('/');
    } catch (err) {
      console.error('계정 삭제 실패:', err);
      alert('계정 삭제 중 오류가 발생했어요.');
    }
  };

  if (loading) return <div className="settings-page">불러오는 중...</div>;
  if (error) return <div className="settings-page">에러: {error}</div>;

  return (
    <div className="settings-page">
      <div className="settings-page-inner">
        <MyBoxOwnerHeader
          nickname={nickname}
          userHandle={auth?.userId}
          showActions={false}
          profileImageUrl={profilePreview}
          headerImageUrl={headerPreview}
          todayMessage={todayMessage}
        />

        <main className="settings-main">
          {/* ================== 프로필 ================== */}
          <section className="settings-card settings-card-profile">
            <h2 className="settings-card-title">프로필 설정</h2>

            <div className="profile-grid">
              <div className="profile-left">
                <div className="settings-field">
                  <label className="settings-label">닉네임 변경</label>
                  <form onSubmit={handleNicknameSubmit} className="settings-inline-form">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="settings-input"
                      maxLength={10}
                    />
                    <button type="submit" className="settings-button">저장</button>
                  </form>
                  <p className="settings-help">최대 10자</p>
                </div>

                <div className="settings-field">
                  <label className="settings-label">오늘의 한마디</label>
                  <form onSubmit={handleTodayMessageSubmit} className="settings-inline-form">
                    <input
                      type="text"
                      value={todayMessage}
                      onChange={(e) => setTodayMessage(e.target.value)}
                      className="settings-input"
                      maxLength={40}
                      placeholder="예: 오늘도 화이팅!"
                    />
                    <button type="submit" className="settings-button">저장</button>
                  </form>
                  <p className="settings-help">프로필 상단에 표시돼요. (최대 40자)</p>
                </div>
              </div>

              <div className="profile-right">
                <div className="settings-field">
                  <label className="settings-label">프로필 이미지</label>
                  <div className="settings-image-row">
                    <div className="settings-image-preview">
                      {profilePreview ? (
                        <img src={profilePreview} alt="프로필 미리보기" />
                      ) : (
                        <span className="settings-image-placeholder">이미지 없음</span>
                      )}
                    </div>

                    <div className="upload-meta">
                      <div className="file-upload-box">
                        <label className="file-upload-button">
                          이미지 업로드
                          <input type="file" accept="image/*" onChange={handleProfileChange} hidden />
                        </label>
                        <span className="file-upload-name">
                          {profilePreview ? '이미지 선택됨' : '선택된 파일 없음'}
                        </span>
                      </div>
                      <p className="settings-help">권장: 400×400px ~ 600×600px</p>
                    </div>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">헤더 배경 이미지</label>

                  <div className="header-stack">
                    <div className="settings-header-preview">
                      {headerPreview ? (
                        <img src={headerPreview} alt="헤더 미리보기" />
                      ) : (
                        <span className="settings-image-placeholder">이미지 없음</span>
                      )}
                    </div>

                    <div className="header-meta">
                      <div className="file-upload-box">
                        <label className="file-upload-button">
                          이미지 업로드
                          <input type="file" accept="image/*" onChange={handleHeaderChange} hidden />
                        </label>
                        <span className="file-upload-name">
                          {headerPreview ? '이미지 선택됨' : '선택된 파일 없음'}
                        </span>
                      </div>
                      <p className="settings-help">권장: 1200×300px ~ 1600×400px</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ================== 하단: 좌(비번) / 우(카드 스택) ================== */}
          <section className="settings-bottom-grid">
            <div className="settings-card settings-card-password stretch-card">
              <h2 className="settings-card-title">비밀번호 변경</h2>

              <form className="settings-password-form" onSubmit={handlePasswordChange}>
                <div className="settings-field">
                  <label className="settings-label">현재 비밀번호</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">새 비밀번호</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">새 비밀번호 확인</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  />
                </div>

                <div className="settings-password-actions">
                  <button type="submit" className="settings-button">비밀번호 변경</button>
                </div>

                {passwordError && <p className="settings-password-msg settings-password-msg-error">{passwordError}</p>}
                {passwordSuccess && <p className="settings-password-msg settings-password-msg-success">{passwordSuccess}</p>}
              </form>
            </div>

            <div className="right-stack">
              <section className="settings-card settings-card-ai">
                <h1 className="settings-card-title">AI 상담 모드 사용</h1>
                <div className="settings-field settings-ai-toggle">
                  <label className="switch">
                    <input type="checkbox" checked={aiMode} onChange={handleAiToggle} />
                    <span className="slider" />
                  </label>
                </div>
              </section>

              <section className="settings-card settings-card-public">
                <h2 className="settings-card-title">비회원 메세지 허용</h2>

                <div className="settings-field settings-ai-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={allowAnonymous}
                      onChange={handleAnonymousToggle}
                    />
                    <span className="slider" />
                  </label>
                </div>
                <p className="settings-help">
                  {allowAnonymous
                    ? '로그인하지 않은 사용자도 메시지를 남길 수 있어요.'
                    : '로그인한 회원만 메시지를 남길 수 있어요.'}
                </p>
              </section>

              {/* ✅ 블랙리스트 카드 추가 */}
              <section className="settings-card settings-card-blacklist">
                <div className="settings-card-header">
                  <h2 className="settings-card-title">차단한 사용자</h2>
                  <button
                    type="button"
                    className="settings-button"
                    onClick={toggleBlacklist}
                    disabled={blLoading}
                  >
                    {blOpen ? '접기' : `보기 (${blacklist.length})`}
                  </button>
                </div>

                {blError && <p className="settings-help" style={{ color: 'crimson' }}>{blError}</p>}

                  {blOpen && (
                    blLoading ? (
                      <p className="settings-help">불러오는 중...</p>
                    ) : blacklist.length === 0 ? (
                      <p className="settings-help">차단한 사용자가 없어요.</p>
                    ) : (
                      <div className="blacklist-scroll">
                        <ul className="blacklist-list">
                          {blacklist.map((item) => (
                            <li key={item.id} className="blacklist-row">
                              <div className="blacklist-info">
                                <div className="blacklist-name">{item.blockedNickname}</div>
                                <div className="blacklist-sub">{item.blockedEmail}</div>
                              </div>

                              <button
                                type="button"
                                className="settings-button-danger"
                                onClick={() => handleUnblock(item.blockedUserId)}
                              >
                                해제
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
              </section>

              <section className="settings-card settings-card-danger">
                <h2 className="settings-card-title">계정 삭제</h2>
                <button className="settings-button-danger" onClick={handleDeleteAccount}>
                  계정 삭제하기
                </button>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default SettingsPage;
