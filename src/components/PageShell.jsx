// Standard page wrapper: dotted background + centered content column.
export default function PageShell({ children }) {
  return (
    <div className="dot-bg">
      <div className="page">{children}</div>
    </div>
  );
}
