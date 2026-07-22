const wrapStyle = {
  background: "rgba(240, 96, 112, 0.12)",
  border: "1px solid var(--red)",
  color: "var(--red)",
  borderRadius: 12,
  padding: "12px 14px",
  margin: "12px 0",
  fontSize: "0.9rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const dismissStyle = {
  background: "none",
  border: "none",
  color: "var(--red)",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: 1,
  padding: 0,
};

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" style={wrapStyle}>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Yopish" style={dismissStyle}>
          ✕
        </button>
      )}
    </div>
  );
}
