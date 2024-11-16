import { useState } from "react";

import { popShop } from "../../components/PopShop";
import { System } from "../../JS/System";
import {
  ErrorMessage,
  showError,
  showSuccess,
} from "../../components/ErrorMessage";
import { LoadScreen, startLoad, stopLoad } from "../../components/LoadScreen";
import { LogOutButton, DashButton } from "../../components/LowPurposeButtons";
import { useEffect } from "react";

/* The Top Bar */
function TopBar() {
  return (
    <>
      <div className="select_a_service">Welcome to Admin Dashboard.</div>
      <LogOutButton />
    </>
  );
}

function PopupIFrames(props) {
  return (
    <div
      id={props.id}
      style={{
        maxHeight: "75vh",
        overflowY: "scroll",
        width: "100%",
      }}
    ></div>
  );
}

function AdminRow1() {
  let [showUserTables, hideUserTables, UserTables] = popShop(
    "user_tables",
    <Popup_UserTables />
  );
  let [showTransactionTables, hideTransactionTables, TransactionTables] =
    popShop("transaction_tables", <Popup_TransactionTables />);

  let [showDelete, hideDelete, Delete] = popShop("delete_box", <Delete_Box />);
  let [showMoney, hideMoney, Money] = popShop("money_box", <Money_Box />);

  function Money_Box() {
    return (
      <div className="popup_body">
        <h1 className="popup_header">Add in Amount</h1>
        <div className="popup_container">
          <div className="field">
            <span>Enter Amount to Add</span>
            <input type="number" id="add_amount" />
          </div>
          <button
            onClick={async () => {
              let amount = document.querySelector("#add_amount");
              let success = await System.admin.kit.money(amount.value);
              if (success.status == false) {
                showError("Enter a valid number.");
                return;
              }
              hideMoney();
              hideUserTables();
            }}
            className="boxBtn danger"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  function Delete_Box() {
    return (
      <div className="popup_body">
        <h1 className="popup_header">Delete User?</h1>
        <div
          className="popup_container"
          style={{
            flexDirection: "row",
          }}
        >
          <button onClick={hideDelete} className="boxBtn safe">
            No
          </button>
          <button
            onClick={async () => {
              await System.admin.kit.delete();
              hideDelete();
              hideUserTables();
            }}
            className="boxBtn danger"
          >
            Yes
          </button>
        </div>
      </div>
    );
  }

  function Popup_UserTables() {
    return (
      <div className="popup_body">
        <h1>User Tables</h1>
        <div className="popup_container">
          <PopupIFrames id="user_table_data" />
        </div>
      </div>
    );
  }

  function Popup_TransactionTables() {
    return (
      <div className="popup_body">
        <h1>Transaction Tables</h1>
        <div className="popup_contanier">
          <PopupIFrames id="transaction_table_data" />
        </div>
      </div>
    );
  }

  return (
    <>
      <UserTables />
      <TransactionTables />
      <Delete />
      <Money />
      <div className="row">
        <DashButton
          className="auto"
          icon="table"
          text="View User Tables"
          onClick={async () => {
            startLoad();
            await System.admin.userTables();
            let trash = document.querySelectorAll(".trash");
            let add = document.querySelectorAll(".add");

            trash.forEach((i) => {
              i.onclick = () => {
                let id = i.getAttribute("target");
                sessionStorage.setItem("target_id", id);
                showDelete();
              };
            });
            add.forEach((i) => {
              i.onclick = () => {
                let id = i.getAttribute("target");
                sessionStorage.setItem("target_id", id);
                showMoney();
                // setId(id);
              };
            });
            stopLoad();
            showUserTables();
          }}
        />

        <DashButton
          className="auto"
          icon="bag"
          text="View Transactions"
          onClick={async () => {
            // showUserTables();
            startLoad();
            await System.admin.transactionTable();
            stopLoad();
            showTransactionTables();
          }}
        />
      </div>
    </>
  );
}
function AdminRow2() {
  let [showCard, hideCard, Card] = popShop("card_box", <Popup_Cards />);

  function Popup_Cards() {
    return (
      <div className="popup">
        <h1>Cards Table</h1>
        <div className="popup_container">
          <PopupIFrames id="card_table_data" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Card />

      <div className="row">
        <DashButton
          className="auto"
          icon="robot"
          text="View Cards"
          onClick={async () => {
            // showUserTables();
            startLoad();
            await System.admin.cardTables();
            stopLoad();
            showCard();
          }}
        />

        {/* <DashButton
          className="auto"
          icon="bank"
          text="Give Balance"
          onClick={() => {
            // showUserTables();
          }}
        /> */}
      </div>
    </>
  );
}

function AdminTools() {
  return (
    <>
      <LoadScreen />
      <ErrorMessage />
      <AdminRow1 />
      <AdminRow2 />
    </>
  );
}

export function AdminDashboard() {
  return (
    <>
      <ErrorMessage />
      <LoadScreen />
      <div className="dashboard">
        <TopBar />
        <AdminTools />
      </div>
    </>
  );
}
