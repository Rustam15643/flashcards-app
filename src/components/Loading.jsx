import PageShell from "./PageShell";

export const LOADING_TEXT = "Yuklanmoqda...";

// Full-page centered loading indicator.
export default function Loading() {
  return (
    <PageShell>
      <div style={{ textAlign: "center", paddingTop: 80, color: "var(--muted)" }}>
        {LOADING_TEXT}
      </div>
    </PageShell>
  );
}
