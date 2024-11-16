import { useState } from "react";
import "./LoadScreen.scss";

export function startLoad() {
  document.querySelector("._loadScreen").style.display = "flex";
}
export function stopLoad() {
  document.querySelector("._loadScreen").style.display = "none";
}

function Spinner() {
  return (
    <div className="_spinner">
      <div className="_spinner_inner"></div>
    </div>
  );
}

export function LoadScreen() {
  return (
    <div className="_loadScreen">
      <Spinner />
    </div>
  );
}
