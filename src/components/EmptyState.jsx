import styles from "./EmptyState.module.css";

// Centered empty/placeholder block. Renders an optional emoji above `children`.
export default function EmptyState({ emoji, children }) {
  return (
    <div className={styles.empty}>
      {emoji && <div className={styles.emoji}>{emoji}</div>}
      {children}
    </div>
  );
}
