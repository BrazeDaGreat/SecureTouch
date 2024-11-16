export default function NoPage() {
  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          color: "#f4eeee",
          fontSize: "32px",
          fontWeight: "900",
          flexDirection: "column",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={() => {
          window.location.href = "./";
        }}
      >
        <span>This page doesn't exist.</span>
        <span>Head back home.</span>
      </div>
    </>
  );
}
