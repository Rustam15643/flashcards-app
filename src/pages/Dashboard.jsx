import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getFolders, addFolder, renameFolder, deleteFolder } from "../lib/db";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await getFolders(user.uid);
    setFolders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addFolder(user.uid, newName.trim());
    setNewName("");
    setAdding(false);
    load();
  };

  const handleRename = async (id) => {
    if (!editName.trim()) return;
    await renameFolder(user.uid, id, editName.trim());
    setEditId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu papkani o'chirasizmi? Ichidagi barcha so'zlar ham o'chadi!")) return;
    await deleteFolder(user.uid, id);
    load();
  };

  return (
    <div className="dot-bg">
      <div className="page">
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>📚 Mening So'zlarim</h1>
            <p className={styles.greeting}>Salom, {user.displayName?.split(" ")[0]}!</p>
          </div>
          <button className="btn btn-ghost" onClick={logout} style={{fontSize:'0.8rem'}}>Chiqish</button>
        </header>

        {/* Add folder */}
        {adding ? (
          <div className={`card ${styles.addBox} fade-up`}>
            <input
              className={styles.input}
              placeholder="Papka nomi..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <div className={styles.row}>
              <button className="btn btn-primary" onClick={handleAdd}>Yaratish</button>
              <button className="btn btn-ghost" onClick={() => setAdding(false)}>Bekor</button>
            </div>
          </div>
        ) : (
          <button className={`btn btn-primary ${styles.addBtn}`} onClick={() => setAdding(true)}>
            + Yangi papka
          </button>
        )}

        {/* Folders list */}
        {loading ? (
          <div className={styles.empty}>Yuklanmoqda...</div>
        ) : folders.length === 0 ? (
          <div className={styles.empty}>
            <div style={{fontSize:'2.5rem', marginBottom:12}}>🗂️</div>
            <p>Hali papka yo'q.<br/>Birinchi papkangizni yarating!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {folders.map(f => (
              <div key={f.id} className={`card ${styles.folder}`}>
                {editId === f.id ? (
                  <div className={styles.editRow}>
                    <input
                      className={styles.input}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleRename(f.id)}
                      autoFocus
                    />
                    <button className="btn btn-primary" style={{padding:'8px 14px'}} onClick={() => handleRename(f.id)}>✓</button>
                    <button className="btn btn-ghost" style={{padding:'8px 14px'}} onClick={() => setEditId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <div className={styles.folderMain} onClick={() => navigate(`/folder/${f.id}`)}>
                      <span className={styles.folderIcon}>📁</span>
                      <span className={styles.folderName}>{f.name}</span>
                    </div>
                    <div className={styles.folderActions}>
                      <button className={styles.iconBtn} title="Tahrirlash" onClick={() => { setEditId(f.id); setEditName(f.name); }}>✏️</button>
                      <button className={styles.iconBtn} title="O'chirish" onClick={() => handleDelete(f.id)}>🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
