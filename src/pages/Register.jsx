import "../scss/Register.scss";
import { Link } from "react-router-dom";
import { DotProgress } from "../components/DotProgress";

import { System } from "../JS/System";
import { useEffect, useState } from "react";

import { FingerApi } from "../JS/Uzimetric";

import {
  ErrorMessage,
  showError,
  showSuccess,
} from "../components/ErrorMessage";
import { LoadScreen, startLoad, stopLoad } from "../components/LoadScreen";

export default function Register() {
  let [scanned, setScanned] = useState(false);
  let [scannedData, setScannedData] = useState([]);

  async function handleRegister() {
    startLoad();

    let res = await System.register(scannedData);
    if (res.status == false) {
      stopLoad();
      showError(res.error);
      return;
    }
    if (res.status === 1) {
      stopLoad();
      showError(res.error);
      setTimeout(() => {
        let data = {
          name: System.util.get("name"),
          cnic: System.util.get("cnic"),
          pin: System.util.get("pin"),
          contact: System.util.get("contact"),
          account_no: System.util.get("account_no"),
          bank_type: System.util.get("bank_type"),
          expiry: System.util.get("expiry"),
        };

        setScanned(false);
        setScannedData([]);

        setTimeout(() => {
          Object.keys(data).forEach((i) => {
            if (data[i] == false) {
              console.log("Empty value");
              return;
            } else {
              System.util.set(i, data[i]);
            }
          });
        }, 800);

        // window.location.reload();
      }, 1000);
      return;
    }
    // Registration was successful.
    showSuccess("You have been registered.");
    sessionStorage.setItem("temp_id", res.id);
    setTimeout(() => {
      stopLoad();
      window.location.href = "/registered";
    }, 2000);
  }

  useEffect(() => {
    let finger;
    let fingerScanner = new FingerApi(async (s) => {
      console.log("Got a sample");
      startLoad();
      finger = fingerScanner.process(s);

      let data = {
        name: System.util.get("name"),
        cnic: System.util.get("cnic"),
        pin: System.util.get("pin"),
        contact: System.util.get("contact"),
        account_no: System.util.get("account_no"),
        bank_type: System.util.get("bank_type"),
        expiry: System.util.get("expiry"),
      };

      setTimeout(() => {
        Object.keys(data).forEach((i) => {
          if (data[i] == false) {
            console.log("Empty value");
            return;
          } else {
            System.util.set(i, data[i]);
          }
        });
        stopLoad();
      }, 800);

      fingerScanner.stopCapture();
      let x = JSON.parse(JSON.stringify(scannedData));
      x.push(finger);
      console.log(x);
      setScannedData(x);
    });
    if (scannedData.length < 4) {
      fingerScanner.startCapture(() => {
        console.log("Scanning");
        return true;
      });
    }
  }, [scannedData]);

  useEffect(() => {
    if (scannedData.length == 4) {
      setScanned(true);
    }
  }, [scannedData]);

  function BackButton() {
    return (
      <Link
        to="../"
        className="blueButton"
        style={{
          top: "8px",
          right: "8px",
        }}
      >
        <i className="bi bi-house"></i>
        <span>Back</span>
      </Link>
    );
  }

  function FingerField() {
    return (
      <div className="fingerfield">
        <span>Scan Your Fingerprint</span>
        <div className="finger">
          <i className="bi bi-fingerprint"></i>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {scanned === false ? (
              <>
                ({scannedData.length}/4) Awaiting Scan <DotProgress />
              </>
            ) : (
              <>
                <span style={{ color: "#1B9C85" }}>
                  ({scannedData.length}/4) Scanned your fingerprint.
                </span>
              </>
            )}
          </span>
        </div>
      </div>
    );
  }

  function Fields() {
    return (
      <>
        <h2 className="field_heading">Personal Information</h2>
        <div className="field">
          <span>Your Name</span>
          <input type="text" id="name" />
        </div>
        <div className="field">
          <span>PIN</span>
          <input type="text" id="pin" maxLength={4} />
        </div>
        <div className="field">
          <span>CNIC</span>
          <input
            type="text"
            id="cnic"
            onInput={(event) => {
              const value = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
              let formattedValue = "";

              for (let i = 0; i < value.length; i++) {
                if (i === 5 || i === 12) {
                  formattedValue += "-";
                }
                formattedValue += value[i];
              }

              event.target.value = formattedValue.substring(0, 15); // Limit to 15 characters (including dashes)
            }}
          />
        </div>
        <div className="field">
          <span>Contact Number</span>
          <input
            type="text"
            id="contact"
            onInput={(event) => {
              const value = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
              let formattedValue = "";

              for (let i = 0; i < value.length; i++) {
                if (i === 4) {
                  formattedValue += "-";
                }
                formattedValue += value[i];
              }

              event.target.value = formattedValue.substring(0, 12); // Limit to 12 characters (including the dash)
            }}
          />
        </div>
        <FingerField />
        <h2 className="field_heading">Card Details</h2>
        <div className="field">
          <span>Account Number</span>
          <input
            type="text"
            id="account_no"
            onInput={(event) => {
              let value = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
              event.target.value = value.substring(0, 14); // Limit to 15 characters (including dashes)
            }}
          />
        </div>
        <div className="field">
          <span>Bank</span>
          <select id="bank_type">
            <option value="HBL">Habib Bank Ltd.</option>
            <option value="Askari">Askari Bank Ltd.</option>
            <option value="ALB">Allied Bank Ltd.</option>
            <option value="UBL">United Bank Ltd.</option>
            <option value="NBL">National Bank Ltd.</option>
            <option value="UzBL">Uzair's Bank Ltd.</option>
          </select>
        </div>
        <div className="field">
          <span>Expiry Date</span>
          <input type="month" id="expiry" />
        </div>
      </>
    );
  }

  return (
    <div className="registerBody">
      <ErrorMessage />
      <LoadScreen />
      <div className="registerBox">
        <BackButton />
        <div className="left"></div>
        <div className="form">
          <div className="heading">Create Account</div>
          <Fields />
          <div className="createAccountBtn" onClick={handleRegister}>
            Register
          </div>
          <div className="note">
            By Signing Up, you agree to our Privacy Policy and Terms of Service.
          </div>
        </div>
      </div>
    </div>
  );
}
