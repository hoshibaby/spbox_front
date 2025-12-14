import { useEffect, useState } from "react";
import api from "../../service/axios";
import "./AdminUsersPage.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const raw = localStorage.getItem("auth");
  const auth = raw && raw !== "null" ? JSON.parse(raw) : null;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      alert("관리자 권한이 필요합니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const ban = async (id) => {
    await api.patch(`/api/admin/users/${id}/ban`, null, {
      headers: { Authorization: `Bearer ${auth?.token}` },
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "BANNED" } : u)));
  };

  const unban = async (id) => {
    await api.patch(`/api/admin/users/${id}/unban`, null, {
      headers: { Authorization: `Bearer ${auth?.token}` },
    });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "ACTIVE" } : u)));
  };

  const promote = async (id) => {
    if (!confirm("정말 관리자 권한을 부여할까요?")) return;

    await api.patch(`/api/admin/users/${id}/promote`, null, {
      headers: { Authorization: `Bearer ${auth?.token}` },
    });

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u)));
  };

  const demote = async (id) => {
    if (!confirm("정말 관리자 권한을 해제할까요?")) return;

    await api.patch(`/api/admin/users/${id}/demote`, null, {
      headers: { Authorization: `Bearer ${auth?.token}` },
    });

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: "USER" } : u)));
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="admin-header">
        <h2 className="admin-title">👑🦁 관리자 · 유저 관리</h2>

        <button className="btn-refresh" onClick={fetchUsers}>
          새로고침
        </button>
      </div>

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>userId</th>
                <th>닉네임</th>
                <th>권한</th>
                <th>상태</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.userId}</td>
                  <td>{u.nickname}</td>

                  {/* ✅ 권한 칸: 역할 표시 + 권한 토글 버튼 */}
          
                <td className="td-center">
                <div className="role-toggle">
                    <button
                    className={"role-btn " + (u.role === "USER" ? "active" : "")}
                    onClick={() => u.role !== "USER" && demote(u.id)}
                    disabled={u.role === "USER"}
                    >
                    USER
                    </button>

                    <button
                    className={"role-btn " + (u.role === "ADMIN" ? "active" : "")}
                    onClick={() => u.role !== "ADMIN" && promote(u.id)}
                    disabled={u.role === "ADMIN"}
                    >
                    ADMIN
                    </button>
                </div>
                </td>
                

                  {/* ✅ 상태 칸: 상태 표시 + 정지/해제 버튼 */}
     
                <td className="td-center">
                <div className="status-toggle">
                    <button
                    className={"status-btn " + (u.status === "ACTIVE" ? "active" : "")}
                    onClick={() => u.status !== "ACTIVE" && unban(u.id)}
                    disabled={u.status === "ACTIVE"}
                    >
                    ACTIVE
                    </button>

                    <button
                    className={"status-btn " + (u.status === "BANNED" ? "active" : "")}
                    onClick={() => u.status !== "BANNED" && ban(u.id)}
                    disabled={u.status === "BANNED"}
                    >
                    SUSPENDED
                    </button>
                </div>
                </td>
             

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
