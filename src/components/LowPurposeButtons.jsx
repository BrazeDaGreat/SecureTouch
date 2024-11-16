import { popShop } from "./PopShop";
import { startLoad, stopLoad } from "./LoadScreen";
import { showError, showSuccess } from "./ErrorMessage";
import { System } from "../JS/System";

/* The Logout Button */
export function LogOutButton() {
  function handleLogout() {
    sessionStorage.clear();
    window.location.href = "/";
  }
  return (
    <div
      to="../"
      className="blueButton"
      style={{
        top: "8px",
        right: "8px",
      }}
      onClick={handleLogout}
    >
      <i className="bi bi-box-arrow-left"></i>
      <span>Logout</span>
    </div>
  );
}

/* The dashboard button, works similar to Logout */
export function DashButton(props) {
  if (props.className == "auto") {
    return (
      <div
        className={`dashboard_btn`}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
        }}
        onClick={props.onClick}
      >
        <span className="icon">
          <i className={`bi bi-${props.icon}`}></i>
        </span>
        <span>{props.text}</span>
      </div>
    );
  }
  return (
    <div className={`dashboard_btn ${props.className}`} onClick={props.onClick}>
      <span className="icon">
        <i className={`bi bi-${props.icon}`}></i>
      </span>
      <span>{props.text}</span>
    </div>
  );
}

export /* The button for changing PIN */
function ChangePinButton() {
  // Pin Codes
  let [showPinCode, hidePinCode, PinCodeBox] = popShop(
    "pinchange",
    <Popup_PinCode />
  );

  /* The Changing Pincode Popup */
  function Popup_PinCode() {
    return (
      <div className="popup_body">
        <h1>Change PIN</h1>
        <div className="popup_container">
          <div className="field">
            <span>Enter Current PIN</span>
            <input type="number" id="curr_pin" />
          </div>
          <div className="field">
            <span>Enter New PIN</span>
            <input type="number" id="pin" />
          </div>
          <div
            className="createAccountBtn"
            onClick={async () => {
              hidePinCode();
              startLoad();
              let data = await System.req.changePin();
              stopLoad();
              if (data.status == false) {
                return showError(data.error);
              }
              showSuccess("PIN has been changed.");
            }}
          >
            Change PIN
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PinCodeBox />
      <div
        to="../"
        className="blueButton"
        style={{
          top: "8px",
          left: "8px",
        }}
        onClick={() => {
          showPinCode();
        }}
      >
        <i className="bi bi-pencil-square"></i>
        <span>Change Pin</span>
      </div>
    </>
  );
}
