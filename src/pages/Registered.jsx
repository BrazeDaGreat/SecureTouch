export default function Registered() {
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
          fontSize: "18px",
          fontWeight: "600",
          flexDirection: "column",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={() => {
          window.location.href = "./";
        }}
      >
        <span>You have been successfully registered.</span>
        <span style={{ fontSize: "32px" }}>
          Your Account Number:{" "}
          <b style={{ fontSize: "42px", fontWeight: "900", color: "#1aacac" }}>
            {sessionStorage.getItem("temp_id")}
          </b>
        </span>
        <span>Click anywhere to go to Login page.</span>
      </div>
    </>
  );
}
