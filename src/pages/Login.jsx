import "../scss/Login.scss";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DotProgress } from "../components/DotProgress";
import { LoadScreen, startLoad, stopLoad } from "../components/LoadScreen";
import { System } from "../JS/System";
import {
  ErrorMessage,
  showError,
  showSuccess,
} from "../components/ErrorMessage";
import { FingerApi } from "../JS/Uzimetric";

export default function Login() {
  let [pin, setPin] = useState("");
  let [pin_display, setPin_display] = useState("Enter PIN");
  let [account, setAccount] = useState(0);
  let [showID, setShowID] = useState(true);
  useEffect(() => {
    if (sessionStorage.getItem("logged_in") == "true") {
      window.location.href = "./dashboard";
    }
  }, []);

  // This code runs whenever the pin is updated
  useEffect(() => {
    if (pin == "") {
      setPin_display("Enter PIN");
      return;
    }
    let i;
    let out = "";
    for (i = 0; i < pin.length; i++) {
      out += "*";
    }
    setPin_display(out);

    // Calling function when the entire pincode has been entered.
    if (pin.length == 4) {
      let _temp = async () => {
        startLoad();
        let data = await System.login(account, pin);
        setTimeout(() => {
          stopLoad();
          if (data.status == true) {
            window.location.href = "./dashboard";
          } else {
            showError(data.error);
          }
        }, 1000);
      };
      _temp();
    }
  }, [pin]);

  // Fingerprint
  useEffect(() => {
    if (account > 0) {
      let finger;
      let fingerScanner = new FingerApi((s) => {
        startLoad();
        fingerScanner.stopCapture();
        finger = fingerScanner.process(s);
        async function _temp() {
          let data = await System.loginFinger(account, finger);
          stopLoad();
          if (data.status == true) {
            window.location.href = "./dashboard";
          } else {
            console.log(data);
            showError(data.error);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        }
        _temp();
      });
      fingerScanner.startCapture(() => {
        console.log("Started scanning.");
        return true;
      });
    }
  }, [account]);

  function pinHandler(i) {
    if (i === false) {
      if (pin.length == 0) return;
      let pinBack = JSON.parse(JSON.stringify({ x: pin }))["x"];
      pinBack = pinBack.slice(0, -1);
      setPin(pinBack);
      return;
    }
    if (pin.length == 4) {
      return;
    }
    setPin(pin + String(i));
  }

  function RegisterButton() {
    return (
      <Link
        to={"./register"}
        className="blueButton"
        style={{
          bottom: "8px",
          left: "calc(50% - 128px)",
          fontSize: "16px",
          zIndex: "15",
        }}
      >
        <i className="bi bi-person-plus"></i>
        Register Here
      </Link>
    );
  }

  function LeftSection() {
    return (
      <div className="section left">
        <i className="bi bi-fingerprint"></i>
        <span className="big">Use Fingerprint Scanner</span>
        <span className="small">
          To login with Biometrics <DotProgress />
        </span>
      </div>
    );
  }

  function PinButton(props) {
    return (
      <button
        className="btn"
        onClick={() => {
          pinHandler(props.value);
        }}
      >
        {props.text}
      </button>
    );
  }
  function PinBackButton() {
    return (
      <button
        className="btn"
        onClick={() => {
          pinHandler(false);
        }}
      >
        <i className="bi bi-backspace"></i>
      </button>
    );
  }

  function RightSection() {
    return (
      <div className="section right">
        <div className="pincode">{pin_display}</div>
        <div className="pins">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            return <PinButton key={i} value={i} text={`${i}`} />;
          })}
          <div className="empty"></div>
          <PinButton value={0} text={"0"} />
          <PinBackButton />
        </div>
      </div>
    );
  }

  function AccountId() {
    if (showID) {
      return (
        <div className="account_wrapper">
          <div className="account_box">
            <div className="account_field">
              <span>Account Number</span>
              <input type="text" id="account_no" />
            </div>
            <div
              className="accoutnConfirmBtn"
              onClick={() => {
                setAccount(System.util.get("account_no"));
                setShowID(false);
                document.querySelector(".account_wrapper").style.display =
                  "none";
              }}
            >
              Confirm
            </div>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
    // <div className="account_id">
    //   {/* <input type="text" placeholder="Enter Account ID" id="account" /> */}
    // </div>
  }

  return (
    <>
      <ErrorMessage />
      <RegisterButton />
      <AccountId />
      <div className="loginBox">
        <LoadScreen />
        <LeftSection />
        <RightSection />
      </div>
    </>
  );
}
