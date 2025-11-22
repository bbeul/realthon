import React from "react";

export default function HeaderBar() {
  return (
    <header
      style={{
        width: "100%",
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        borderBottom: "1px solid #e0d6c3",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <img
        src="/logo.png"
        alt="LatteChat Logo"
        style={{
          width: 30,
          height: 30,
          objectFit: "contain",
          marginRight: 6,
          background: "transparent",
          display: "block",
        }}
      />
      <span
        style={{
          fontFamily: '"DXFont", sans-serif',
          fontWeight: 900,
          fontSize: 28,
          color: "#322219",
          letterSpacing: 1,
        }}
      >
        LATTE CHAT.
      </span>
    </header>
  );
}
