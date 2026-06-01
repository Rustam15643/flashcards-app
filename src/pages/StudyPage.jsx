import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getWordSets, updateWordSet } from "../lib/db";
import styles from "./StudyPage.module.css";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudyPage() {
  const { folderId, setId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wordSet, setWordSet] = useState(null);
  const [deck, setDeck] = useState([]);
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knowCount, setKnowCount] = useState(0);
  const [againIds, setAgainIds] = useState(new Set());
  const [isReverse, setIsReverse] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sets = await getWordSets(user.uid, folderId);
      const s = sets.find(x => x.id === setId);
      if (!s) return navigate(-1);
      setWordSet(s);
      initDeck(s, false, false);
      setLoading(false);
    })();
  }, [setId]);

  const initDeck = (s, rev, shuf) => {
    const lim = s.limit || s.words.length;
    let all = rev ? s.words.map(w => ({ front: w.back, back: w.front })) : [...s.words];
    if (shuf) all = shuffle(all);
    const active = all.slice(0, lim);
    const rest = all.slice(lim);
    setDeck(active);
    setPool(rest);
    setIndex(0);
    setFlipped(false);
    setKnowCount(0);
    setAgainIds(new Set());
    setDone(false);
  };

  const card = deck[index];

  const handleFlip = () => setFlipped(f => !f);

  const handleKnow = () => {
    const newKnow = knowCount + 1;
    setKnowCount(newKnow);
    const newDeck = [...deck];
    newDeck.splice(index, 1);
    let newPool = [...pool];
    if (newPool.length > 0) {
      const next = newPool.shift();
      newDeck.push(next);
    }
    setPool(newPool);
    if (newDeck.length === 0) {
      setDone(true);
      return;
    }
    const nextIndex = index >= newDeck.length ? newDeck.length - 1 : index;
    setDeck(newDeck);
    setIndex(nextIndex);
    setFlipped(false);
  };

  const handleAgain = () => {
    const c = deck[index];
    const key = c.front + "|" + c.back;
    setAgainIds(prev => new Set([...prev, key]));
    const next = index + 1 >= deck.length ? 0 : index + 1;
    setIndex(next);
    setFlipped(false);
  };

  const handleNext = () => {
    if (index + 1 < deck.length) { setIndex(i => i + 1); setFlipped(false); }
  };
  const handlePrev = () => {
    if (index > 0) { setIndex(i => i - 1); setFlipped(false); }
  };

  const handleRestart = () => wordSet && initDeck(wordSet, isReverse, isShuffle);

  const handleRestartAgain = () => {
    if (!wordSet) return;
    const againWords = wordSet.words.filter(w => {
      const k = (isReverse ? w.back : w.front) + "|" + (isReverse ? w.front : w.back);
      return againIds.has(k);
    });
    if (!againWords.length) return;
    const fakeSet = { ...wordSet, words: againWords, limit: againWords.length };
    initDeck(fakeSet, isReverse, isShuffle);
  };

  const toggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    if (wordSet) initDeck(wordSet, isReverse, next);
  };

  const toggleReverse = () => {
    const next = !isReverse;
    setIsReverse(next);
    if (wordSet) initDeck(wordSet, next, isShuffle);
  };

  if (loading) return <div className="dot-bg"><div className="page" style={{textAlign:'center',paddingTop:80,color:'var(--muted)'}}>Yuklanmoqda...</div></div>;

  const total = wordSet?.words.length || 0;
  const progress = total > 0 ? Math.round((knowCount / total) * 100) : 0;

  return (
    <div className="dot-bg">
      <div className="page">
        <header className={styles.header}>
          <button className={`btn btn-ghost ${styles.backBtn}`} onClick={() => navigate(-1)}>← Orqaga</button>
          <h2 className={styles.title}>{wordSet?.title}</h2>
        </header>

        <div className={`card ${styles.stats}`}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{total}</div>
            <div className="tag">Jami</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum} style={{color:'var(--green)'}}>{knowCount}</div>
            <div className="tag">Bildim</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum} style={{color:'var(--red)'}}>{againIds.size}</div>
            <div className="tag">Qayta</div>
          </div>
          <div className={styles.statBar}>
            <div className={styles.barFill} style={{width: progress + '%'}} />
          </div>
        </div>

        <div className={styles.options}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={isShuffle} onChange={toggleShuffle} />
            <span className={styles.track} />
            Tasodifiy
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={isReverse} onChange={toggleReverse} />
            <span className={styles.track} />
            Teskari
          </label>
        </div>

        {done ? (
          <div className={`${styles.doneBox} fade-up`}>
            <div className={styles.doneEmoji}>🎉</div>
            <div className={styles.doneTitle}>Tugadi!</div>
            <p className={styles.doneSub}>{total} ta so'zni ko'rib chiqdingiz.</p>
            <div className={styles.doneRow}>
              <button className="btn btn-primary" onClick={handleRestart}>🔄 Boshidan</button>
              {againIds.size > 0 && (
                <button className="btn btn-danger" onClick={handleRestartAgain}>
                  ↩ Qayta ({againIds.size})
                </button>
              )}
            </div>
          </div>
        ) : card ? (
          <>
            <div className={styles.counter}>{index + 1} / {deck.length} {pool.length > 0 ? `(+${pool.length} navbatda)` : ""}</div>

            <div className={`${styles.scene} ${flipped ? styles.flipped : ""}`} onClick={handleFlip}>
              <div className={styles.inner}>
                <div className={`${styles.face} ${styles.front}`}>
                  <div className="tag">{isReverse ? "Tarjima" : "Inglizcha"}</div>
                  <div className={styles.word}>{card.front}</div>
                  <div className={styles.tapHint}>bosib ko'ring →</div>
                </div>
                <div className={`${styles.face} ${styles.back}`}>
                  <div className="tag">{isReverse ? "Inglizcha" : "O'zbekcha"}</div>
                  <div className={`${styles.word} ${styles.wordBack}`}>{card.back}</div>
                </div>
              </div>
            </div>

            <div className={styles.nav}>
              <button className="btn btn-ghost" onClick={handlePrev} disabled={index === 0}>←</button>
              <button className={`btn ${styles.btnAgain}`} onClick={handleAgain}>↩ Qayta</button>
              <button className={`btn ${styles.btnKnow}`} onClick={handleKnow}>✓ Bildim</button>
              <button className="btn btn-ghost" onClick={handleNext} disabled={index >= deck.length - 1}>→</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
