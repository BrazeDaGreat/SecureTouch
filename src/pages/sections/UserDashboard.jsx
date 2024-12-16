import { useEffect, useState } from "react";

import { popShop } from "../../components/PopShop";
import { System } from "../../JS/System";
import {
  ErrorMessage,
  showError,
  showSuccess,
} from "../../components/ErrorMessage";
import { LoadScreen, startLoad, stopLoad } from "../../components/LoadScreen";
import {
  LogOutButton,
  DashButton,
  ChangePinButton,
} from "../../components/LowPurposeButtons";

import { DotProgress } from "../../components/DotProgress";
import { FingerApi } from "../../JS/Uzimetric";

/* The Top Bar */
function TopBar() {
  return (
    <>
      <div className="select_a_service">Please Select a Service.</div>
      <ChangePinButton />
      <LogOutButton />
    </>
  );
}
/* The First Row of Servces */
function ServicesRow1() {
  // Cash
  let [showCash, hideCash, Cash] = popShop("cash", <Popup_Cash />);
  // Transfer
  let [showTransfer, hideTransfer, Transfer] = popShop(
    "transfer",
    <Popup_Transfer />
  );

  /* Button for quickly withdrawing */
  function QuickButton(props) {
    return (
      <div
        className="createAccountBtn"
        style={{
          width: "80%",
        }}
        onClick={async () => {
          hideCash();
          startLoad();
          let data = await System.req.quickWithdraw(props.amount);
          stopLoad();
          if (data.status == false) {
            return showError(data.error);
          }
          showSuccess(`Withdrew PKR ${props.display}`);
        }}
      >
        {props.display}
      </div>
    );
  }

  /* Popup for Cash Withdrawal */
  function Popup_Cash() {
    return (
      <div className="popup_body">
        <h1>Cash Withdrawal</h1>
        <div className="popup_container">
          <div className="field">
            <span>Amount to Withdraw</span>
            <input type="number" id="withdraw_amount" min={1} />
          </div>
          <div
            className="createAccountBtn"
            onClick={async () => {
              hideCash();
              startLoad();
              let data = await System.req.withdraw();
              System.util.set("withdraw_amount", "");
              stopLoad();
              if (data.status == false) {
                return showError(data.error);
              }
              showSuccess(`Successfully withdrawn.`);
            }}
          >
            Withdraw
          </div>
          <div
            style={{
              height: "64px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                fontSize: "18px",
              }}
            >
              Quick Transfer
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-evenly",
              gap: "18px",
            }}
          >
            <QuickButton display="PKR 1,000" amount={1000} />
            <QuickButton display="PKR 5,000" amount={5000} />
            <QuickButton display="PKR 10,000" amount={10000} />
            <QuickButton display="PKR 50,000" amount={50000} />
          </div>
        </div>
      </div>
    );
  }

  /* Popup for Funds Transfer */
  function Popup_Transfer() {
    return (
      <div className="popup_body">
        <h1>Funds Transfer</h1>
        <div className="popup_container">
          <div className="field">
            <span>Amount to Transfer</span>
            <input type="number" id="transfer_amount" min={1} />
          </div>
          <div className="field">
            <span>ID of Recipient</span>
            <input type="number" id="recipient_id" min={1} max={999999} />
          </div>
          <div
            className="createAccountBtn"
            onClick={async () => {
              hideTransfer();
              startLoad();
              let data = await System.req.transfer();
              System.util.set("transfer_amount", "");
              System.util.set("recipient_id", "");
              stopLoad();
              if (data.status == false) {
                return showError(data.error);
              }
              showSuccess("Successfully transferred.");
            }}
          >
            Transfer
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Cash />
      <Transfer />
      <div className="row">
        <DashButton
          className="cw"
          icon="cash"
          text="Cash Withdrawal"
          onClick={() => {
            showCash();
            System.numerify("withdraw_amount");
          }}
        />
        <DashButton
          className="ft"
          icon="send"
          text="Funds Transfer"
          onClick={() => {
            showTransfer();
            System.numerify("transfer_amount");
            System.numerify("recipient_id");
          }}
        />
      </div>
    </>
  );
}
/* The Second Row of Servces */
function ServicesRow2() {
  // Balance
  let [showBalance, hideBalance, Balance] = popShop(
    "balance",
    <Popup_Balance />
  );
  // Transactions
  let [showTransactions, hideTransactions, Transaction] = popShop(
    "transactions",
    <Popup_Transactions />
  );
  // Balance
  let [balance, setBalance] = useState("0");

  /* Popup for displaying Balance */
  function Popup_Balance() {
    return (
      <div className="popup_body">
        <h1>Balance Inquiry</h1>
        <div className="popup_container">
          <span
            style={{
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            Your Balance
          </span>
          <span
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1aacac",
            }}
          >
            PKR {sessionStorage.getItem("balance")}
          </span>
        </div>
      </div>
    );
  }

  /* Popup for Mini Statement */
  function Popup_Transactions() {
    return (
      <div className="popup_body">
        <h1>Mini Statement</h1>
        <div className="popup_container">
          <div className="t_table"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Transaction />
      <Balance />
      <div className="row">
        <DashButton
          className="bi"
          icon="hourglass"
          text="Balance Inquiry"
          onClick={async () => {
            startLoad();
            let d = await System.req.getBalance();
            setBalance(d.balance);
            setTimeout(() => {
              stopLoad();
              showBalance();
            }, 500);
          }}
        />
        <DashButton
          className="ms"
          icon="clock-history"
          text="Mini Statement"
          onClick={async () => {
            startLoad();
            await System.req.getTransactions();
            stopLoad();
            showTransactions();
          }}
        />
      </div>
    </>
  );
}

/* The Third Row of Services */
function ServicesRow3() {
  const [data, setdata] = useState({
    card: {}, // DO NOT REMOVE
  });

  let [showFinger, hideFinger, Finger] = popShop(
    "finger_popup",
    <Popup_Finger />
  );

  let [showDetails, hideDetails, Details] = popShop(
    "details_popup",
    <Popup_Details />
  );

  function Popup_Details() {
    function Property(props) {
      return (
        <div className="data">
          <div className="data_property">{props.property}</div>
          <div className="data_value">{props.value}</div>
        </div>
      );
    }

    return (
      <div className="popup_body">
        <h1>User Details</h1>
        <div className="popup_container">
          <div className="user_details">
            {/* <h1>{data.name}</h1> */}
            <div>
              <Property property="Name" value={data.name} />
              <Property property="Account ID" value={data.id} />
              <Property property="Balance" value={data.balance} />
              <Property
                property="Phone No.#"
                value={
                  data.contact
                    ? data.contact.replace(/^(.{6})(.{5})(.*)$/, "$1*****$3")
                    : ""
                }
              />
              <Property
                property="CNIC No.#"
                value={
                  data.cnic
                    ? data.cnic.replace(/^(.{6})(.{7})(.*)$/, "$1*******$3")
                    : ""
                }
              />
            </div>
            <div>
              <Property property="Card ID" value={data.card.id} />
              <Property property="Bank Name" value={data.card.bank} />
              <Property property="Expiry Date" value={data.card.expiry} />

              <div
                className="createAccountBtn"
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => {
                  System.req.printDetailedReciept(data);
                }}
              >
                <i className="bi bi-printer"></i>
                Print
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Popup_Finger() {
    let [scanned, setScanned] = useState(false);
    let [scannedData, setScannedData] = useState([]);

    useEffect(() => {
      let finger;
      let fingerScanner = new FingerApi(async (s) => {
        console.log("Got a sample");
        startLoad();
        finger = fingerScanner.process(s);
        stopLoad();
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
        async function process() {
          startLoad();
          let data = await System.addFinger(scannedData);
          stopLoad();
          if (data.status == false) {
            showError(data.error);
            return;
          } else {
            showSuccess("New fingerprint has been added.");
          }
          hideFinger();
        }
        process();
      }
    }, [scannedData]);

    return (
      <div className="popup_body">
        <h1>Add another Fingerprint</h1>
        <div className="popup_container">
          <div className="new_finger">
            <i className="bi bi-fingerprint"></i>
            <div className="data">
              <span>Scan an alternative Finger</span>
              <span>
                For multi-finger authentication.
                <br />
                <span>
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
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Finger />
      <Details />
      <div className="row">
        <DashButton
          className="fi"
          icon="fingerprint"
          text="Add Fingerprint"
          onClick={async () => {
            showFinger();
          }}
        />
        <DashButton
          className="ud"
          icon="table"
          text="See Details"
          onClick={async () => {
            startLoad();
            let d = await System.req.getUserDetails();
            if (d.status == false) {
              showError(d.error);
              return;
            }
            setdata(d);
            setTimeout(() => {
              showDetails();
              stopLoad();
            }, 500);
          }}
        />
      </div>
    </>
  );
}

/* Group Containing all the services */
function ServicesGroup() {
  return (
    <>
      <ServicesRow1 />
      <ServicesRow2 />
      <ServicesRow3 />
    </>
  );
}

/* User Dashboard containing everything */
export function UserDashboard() {
  return (
    <>
      <LoadScreen />
      <ErrorMessage />
      <div className="dashboard">
        <TopBar />
        <ServicesGroup />
      </div>
    </>
  );
}

/* The User Dashboard */
// export function UserDashboard() {
//   // Cash
//   let [showCash, hideCash, Cash] = popShop("cash", <Popup_Cash />);
//   // Transfer
//   let [showTransfer, hideTransfer, Transfer] = popShop(
//     "transfer",
//     <Popup_Transfer />
//   );
//   // Balance
//   let [showBalance, hideBalance, Balance] = popShop(
//     "balance",
//     <Popup_Balance />
//   );
//   // Transactions
//   let [showTransactions, hideTransactions, Transaction] = popShop(
//     "transactions",
//     <Popup_Transactions />
//   );
//   // Pin Codes
//   let [showPinCode, hidePinCode, PinCodeBox] = popShop(
//     "pinchange",
//     <Popup_PinCode />
//   );

//   // Balance
//   let [balance, setBalance] = useState("0");

//   /* Button for quickly withdrawing */
//   function QuickButton(props) {
//     return (
//       <div
//         className="createAccountBtn"
//         style={{
//           width: "80%",
//         }}
//         onClick={async () => {
//           hideCash();
//           startLoad();
//           let data = await System.req.quickWithdraw(props.amount);
//           stopLoad();
//           if (data.status == false) {
//             return showError(data.error);
//           }
//           showSuccess(`Withdrew PKR ${props.display}`);
//         }}
//       >
//         {props.display}
//       </div>
//     );
//   }
//   /* The button for changing PIN */
//   function ChangePinButton() {
//     return (
//       <div
//         to="../"
//         className="blueButton"
//         style={{
//           top: "8px",
//           left: "8px",
//         }}
//         onClick={() => {
//           showPinCode();
//         }}
//       >
//         <i className="bi bi-pencil-square"></i>
//         <span>Change Pin</span>
//       </div>
//     );
//   }

//   /* The Changing Pincode Popup */
//   function Popup_PinCode() {
//     return (
//       <div className="popup_body">
//         <h1>Change PIN</h1>
//         <div className="popup_container">
//           <div className="field">
//             <span>Enter New PIN</span>
//             <input type="number" id="pin" />
//           </div>
//           <div
//             className="createAccountBtn"
//             onClick={async () => {
//               hidePinCode();
//               startLoad();
//               let data = await System.req.changePin();
//               stopLoad();
//               if (data.status == false) {
//                 return showError(data.error);
//               }
//               showSuccess("PIN has been changed.");
//             }}
//           >
//             Change PIN
//           </div>
//         </div>
//       </div>
//     );
//   }
//   /* Popup for Cash Withdrawal */
//   function Popup_Cash() {
//     return (
//       <div className="popup_body">
//         <h1>Cash Withdrawal</h1>
//         <div className="popup_container">
//           <div className="field">
//             <span>Amount to Withdraw</span>
//             <input type="number" id="withdraw_amount" min={1} />
//           </div>
//           <div
//             className="createAccountBtn"
//             onClick={async () => {
//               hideCash();
//               startLoad();
//               let data = await System.req.withdraw();
//               System.util.set("withdraw_amount", "");
//               stopLoad();
//               if (data.status == false) {
//                 return showError(data.error);
//               }
//               showSuccess(`Successfully withdrawn.`);
//             }}
//           >
//             Withdraw
//           </div>
//           <div
//             style={{
//               height: "64px",
//               width: "100%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <h1
//               style={{
//                 fontSize: "18px",
//               }}
//             >
//               Quick Transfer
//             </h1>
//           </div>
//           <div
//             style={{
//               display: "flex",
//               width: "100%",
//               justifyContent: "space-evenly",
//               gap: "18px",
//             }}
//           >
//             {/* quickWithdraw */}
//             <QuickButton display="PKR 1,000" amount={1000} />
//             <QuickButton display="PKR 5,000" amount={5000} />
//             <QuickButton display="PKR 10,000" amount={10000} />
//             <QuickButton display="PKR 50,000" amount={50000} />
//             {/* <div className="createAccountBtn">
//                 PKR 1,000
//               </div> */}
//           </div>
//         </div>
//       </div>
//     );
//   }
//   /* Popup for Funds Transfer */
//   function Popup_Transfer() {
//     return (
//       <div className="popup_body">
//         <h1>Funds Transfer</h1>
//         <div className="popup_container">
//           <div className="field">
//             <span>Amount to Transfer</span>
//             <input type="number" id="transfer_amount" min={1} />
//           </div>
//           <div className="field">
//             <span>ID of Recipient</span>
//             <input type="number" id="recipient_id" min={1} max={20000} />
//           </div>
//           <div
//             className="createAccountBtn"
//             onClick={async () => {
//               hideTransfer();
//               startLoad();
//               let data = await System.req.transfer();
//               System.util.set("transfer_amount", "");
//               System.util.set("recipient_id", "");
//               stopLoad();
//               if (data.status == false) {
//                 return showError(data.error);
//               }
//               showSuccess("Successfully transferred.");
//             }}
//           >
//             Transfer
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* Popup for displaying Balance */
//   function Popup_Balance() {
//     return (
//       <div className="popup_body">
//         <h1>Balance Inquiry</h1>
//         <div className="popup_container">
//           <span
//             style={{
//               fontSize: "18px",
//               fontWeight: "500",
//             }}
//           >
//             Your Balance
//           </span>
//           <span
//             style={{
//               fontSize: "32px",
//               fontWeight: "700",
//               color: "#1aacac",
//             }}
//           >
//             PKR {sessionStorage.getItem("balance")}
//           </span>
//         </div>
//       </div>
//     );
//   }

//   /* Popup for Mini Statement */
//   function Popup_Transactions() {
//     return (
//       <div className="popup_body">
//         <h1>Mini Statement</h1>
//         <div className="popup_container">
//           <div className="t_table"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <ErrorMessage />
//       <LoadScreen />
//       <Cash />
//       <Transfer />
//       <LogOutButton />
//       <Balance />
//       <Transaction />
//       <PinCodeBox />
//       <div className="dashboard">
//         <div className="select_a_service">Please Select a Service.</div>
//         <ChangePinButton />
//         <div className="row">
//           <DashButton
//             className="cw"
//             icon="cash"
//             text="Cash Withdrawal"
//             onClick={() => {
//               showCash();
//               System.numerify("withdraw_amount");
//             }}
//           />
//           <DashButton
//             className="ft"
//             icon="send"
//             text="Funds Transfer"
//             onClick={() => {
//               showTransfer();
//               System.numerify("transfer_amount");
//               System.numerify("recipient_id");
//             }}
//           />
//         </div>

//         <div className="row">
//           <DashButton
//             className="bi"
//             icon="hourglass"
//             text="Balance Inquiry"
//             onClick={async () => {
//               startLoad();
//               let d = await System.req.getBalance();
//               setBalance(d.balance);
//               setTimeout(() => {
//                 stopLoad();
//                 showBalance();
//               }, 500);
//             }}
//           />
//           <DashButton
//             className="ms"
//             icon="clock-history"
//             text="Mini Statement"
//             onClick={async () => {
//               startLoad();
//               await System.req.getTransactions();
//               stopLoad();
//               showTransactions();
//             }}
//           />
//         </div>
//       </div>
//     </>
//   );
// }
