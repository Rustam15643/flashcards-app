import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getFolders, getWordSets, addWordSet, deleteWordSet } from "../lib/db";
import styles from "./FolderPage.module.css";

function parseWords(text) {
  const lines = text.split("\n");
  const result = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const sep = t.includes(" - ") ? " - " : t.includes(":") ? ":" : null;
    if (!sep) continue;
    const idx = t.indexOf(sep);
    const front = t.slice(0, idx).trim();
    const back = t.slice(idx + sep.length).trim();
    if (front && back) result.push({ front, back });
  }
  return result;
}

export default function FolderPage() {
  const { folderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [folderName, setFolderName] = useState("...");
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("");
  const [preview, setPreview] = useState([]);

  const load = async () => {
    setLoading(true);
    const folders = await getFolders(user.uid);
    const f = folders.find(x => x.id === folderId);
    if (f) setFolderName(f.name);
    const data = await getWordSets(user.uid, folderId);
    setSets(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [folderId]);

  useEffect(() => {
    setPreview(parseWords(text));
  }, [text]);

  const handleAdd = async () => {
    const words = parseWords(text);
    if (!title.trim() || words.length === 0) return;
    const lim = parseInt(limit) || words.length;
    await addWordSet(user.uid, folderId, { title: title.trim(), words, limit: lim });
    setTitle(""); setText(""); setLimit(""); setShowAdd(false);
    load();
  };

  const handleDelete = async (setId) => {
    if (!confirm("Bu so'z to'plamini o'chirasizmi?")) return;
    await deleteWordSet(user.uid, folderId, setId);
    load();
  };

  return (
    <div className="dot-bg">
      <div className="page">
        {/* Header */}
        <header className={styles.header}>
          <button className={`btn btn-ghost ${styles.back}`} onClick={() => navigate("/")}>← Orqaga</button>
          <h1 className={styles.title}>📁 {folderName}</h1>
        </header>

        {/* Add set button */}
        {!showAdd && (
          <button className={`btn btn-primary ${styles.addBtn}`} onClick={() => setShowAdd(true)}>
            + Yangi so'z to'plami
          </button>
        )}

        {/* Add form */}
        {showAdd && (
          <div className={`card ${styles.addForm} fade-up`}>
            <p className={`tag`} style={{marginBottom:16}}>Yangi to'plam</p>

            <label className={styles.label}>To'plam nomi</label>
            <input
              className={styles.input}
              placeholder="Masalan: 5-dars so'zlari"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />

            <label className={styles.label}>So'zlarni kiriting (Worddan nusxalang)</label>
            <textarea
              className={styles.textarea}
              placeholder={"run - yugirmoq\napple - olma\nrice - guruch"}
              value={text}
              onChange={e => setText(e.target.value)}
            />

            {preview.length > 0 && (
              <p className={styles.previewCount}>✅ {preview.length} ta so'z topildi</p>
            )}

            <label className={styles.label}>
              Bir sessiyada nechta so'z? <span className={styles.optional}>(ixtiyoriy)</span>
            </label>
            <input
              className={styles.input}
              type="number"
              placeholder={`Hammasi (${preview.length || "?"})`}
              value={limit}
              onChange={e => setLimit(e.target.value)}
              min={1}
              max={preview.length || 999}
            />
            <p className={styles.hint}>
              Masalan 10 kiritsangiz, birinchi 10 ta so'z ko'rsatiladi. "Bildim" bosgan sari keyingi so'zlar to'ldirib boradi.
            </p>

            <div className={styles.row}>
              <button className="btn btn-primary" onClick={handleAdd}
                disabled={!title.trim() || preview.length === 0}>
                Saqlash
              </button>
              <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setTitle(""); setText(""); setLimit(""); }}>
                Bekor
              </button>
            </div>
          </div>
        )}

        {/* Sets list */}
        {loading ? (
          <div className={styles.empty}>Yuklanmoqda...</div>
        ) : sets.length === 0 && !showAdd ? (
          <div className={styles.empty}>
            <div style={{fontSize:'2.5rem', marginBottom:12}}>📝</div>
            <p>Bu papkada hali so'z yo'q.<br/>Yangi to'plam qo'shing!</p>
          </div>
        ) : (
          <div className={styles.list}>
            {sets.map(s => (
              <div key={s.id} className={`card ${styles.setCard}`}>
                <div className={styles.setInfo} onClick={() => navigate(`/study/${folderId}/${s.id}`)}>
                  <div className={styles.setTitle}>{s.title}</div>
                  <div className={styles.setMeta}>
                    {s.words.length} ta so'z
                    {s.limit && s.limit < s.words.length ? ` · Sessiya: ${s.limit} ta` : ""}
                  </div>
                </div>
                <div className={styles.setActions}>
                  <button className={`btn btn-primary`} style={{padding:'8px 16px', fontSize:'0.82rem'}}
                    onClick={() => navigate(`/study/${folderId}/${s.id}`)}>
                    Boshlash
                  </button>
                  <button className={styles.iconBtn} onClick={() => handleDelete(s.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
