/**
 * This contains majority of the front-end functions.
 */

import axios from "axios";

const System = {};

/* For Communciating with server */
System.server = {
  // Config
  url: "http://localhost:5000",
};

function formatNumber(number) {
  const num = parseFloat(number);
  if (!isNaN(num)) {
    return num.toLocaleString();
  } else {
    return "Invalid Number";
  }
}

//////////////////////////////////////////////////////////////////////
//                       Server Communication                       //
//////////////////////////////////////////////////////////////////////

/**
 * Sends a GET request to the python server.
 * @param {String} path
 * @returns {Object}
 */
System.server.get = async (path) => {
  let data = await axios.get(`${System.server.url}${path}`);
  return data.data;
};

/**
 * Sends a POST request to the python server.
 * @param {String} path
 * @param {Object} postdata
 * @returns {Object}
 */
System.server.post = async (path, postdata) => {
  let data = await axios.post(`${System.server.url}${path}`, postdata);
  return data.data;
};

//////////////////////////////////////////////////////////////////////
//                        Frontend Utilities                        //
//////////////////////////////////////////////////////////////////////
System.util = {};

/**
 *
 * @param {String} code HTML Code
 */
System.util.window = (code, width_height = "width=380, height=480") => {
  // Specify the width and height for the new window
  // var windowFeatures = "width=380,height=480";
  var windowFeatures = width_height;

  // Create a new window with specified features
  var newWindow = window.open("", "_blank", windowFeatures);

  // Check if the new window is opened successfully
  if (newWindow) {
    // Write the HTML code to the new window document
    newWindow.document.write(code);
    newWindow.document.write(`
      <style>
        * {
          cursor: pointer;
        }
      </style>
    `);
    newWindow.document.write(`
    <script>
    document.addEventListener("click", () => {
      window.print();
    })
    </script>
    `);

    // Close the document to signal the end of writing
    newWindow.document.close();
  } else {
    // Handle the case where the new window couldn't be opened
    console.error("Failed to open new window.");
  }
};

System.util.time = () => {
  var now = new Date();

  // Get the current date components
  var day = String(now.getDate()).padStart(2, "0");
  var month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  var year = now.getFullYear();

  // Get the current time components
  var hours = String(now.getHours()).padStart(2, "0");
  var minutes = String(now.getMinutes()).padStart(2, "0");
  var seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Returns value attribute of the provided ID's element.
 * @param {String} id
 * @returns {String}
 * @returns {false} if no element exists with provided ID.
 * @returns {false} if the value is empty.
 */
System.util.get = (id) => {
  let elmnt = document.querySelector(`#${id}`);
  if (!elmnt) {
    console.warn(`No such element with id "${id}"`);
    return false;
  }
  if (elmnt.value.length > 0) {
    return elmnt.value;
  } else {
    console.warn(`id "${id}" has empty value "${elmnt.value}"`);
    return false;
  }
};

/**
 * Sets the value of provided ID's element.
 * @param {String} id
 * @param {String} value
 * @returns {false} if no element exists with provided ID.
 */
System.util.set = (id, value) => {
  let elmnt = document.querySelector(`#${id}`);
  if (!elmnt) {
    console.warn(`No such element with id "${id}"`);
    return false;
  }
  elmnt.value = value;
};

System.util.tablify = (array, order, action) => {
  if (!Array.isArray(array) || array.length === 0) {
    return ""; // Return an empty string if the input is not a non-empty array
  }

  // Create the table header row based on the specified order
  const headerRow = `<tr>${order
    .map((header) => `<th>${header}</th>`)
    .join("")}<th>Action</th></tr>`;

  // Create the table body rows
  const bodyRows = array.map((item) => {
    const rowData = order.map((header) => `<td>${item[header]}</td>`).join("");
    const actionButton = `<td>${action(item["ID"])}</td>`;
    return `<tr>${rowData}${actionButton}</tr>`;
  });

  // Concatenate the header row and body rows to form the complete table
  const table = `<table class="tablify">${headerRow}${bodyRows.join(
    ""
  )}</table>`;

  return table;
};

//////////////////////////////////////////////////////////////////////
//                  Authentication & Registration                   //
//////////////////////////////////////////////////////////////////////

/**
 * Handler for logging in using PIN.
 * @param {String} pin
 * @param {String} account
 * @returns {Object} with status either true or false.
 */
System.login = async (account, pin) => {
  let id = account;
  if (id == "admin" && pin == "0000") {
    console.log("admin");
  }
  let data = await System.server.post("/login", { id, pin });
  if (data.status == true) {
    sessionStorage.setItem("logged_in", true);
    sessionStorage.setItem("id", id);
    return { status: true };
  } else {
    return data;
  }
};

/**
 * Handler for logging in using Fingerprint.
 * @param {String} id
 * @param {String} finger
 * @returns {Object} with status either true or false.
 */
System.loginFinger = async (id, finger) => {
  console.log({ id, finger });
  let data = await System.server.post("/loginBio", { id, finger });
  if (data.status == true) {
    sessionStorage.setItem("logged_in", true);
    sessionStorage.setItem("id", id);
    return { status: true };
  } else {
    return data;
  }
};

System.addFinger = async (finger) => {
  let id = sessionStorage.getItem("id");

  let data = await System.server.post("/addFinger", {
    id,
    finger,
  });

  return data;
};

/**
 *
 * @param {Array<String>} finger
 * @returns {Object} with status either true or false.
 */
System.register = async (finger) => {
  let data = {
    name: System.util.get("name"),
    cnic: System.util.get("cnic"),
    pin: System.util.get("pin"),
    contact: System.util.get("contact"),
    account_no: System.util.get("account_no"),
    bank_type: System.util.get("bank_type"),
    expiry: System.util.get("expiry"),
  };
  if (finger.length < 4) {
    return { status: false, error: "Please scan your fingerprint." };
  }

  let quality_check = await System.server.post("/qualitycheck", {
    fingerprints: finger,
  });
  if (quality_check.status == false) {
    return { status: 1, error: quality_check.error };
  }

  let safe = true;
  Object.values(data).forEach((i) => {
    if (i === false) {
      safe = false;
    }
  });
  if (safe == false) {
    return { status: false, error: "Please fill all fields." };
  }
  if (data.pin.length < 4) {
    return { status: false, error: "PIN must be 4-digit." };
  }
  if (data.cnic.length < 15) {
    return { status: false, error: "Please enter a valid CNIC Number." };
  }
  if (data.contact.length < 12) {
    return { status: false, error: "Please enter a valid Contact Number." };
  }

  data.fingerprint = finger;

  // At this point, all the data is valid
  console.log("Sending request...");
  let dat = await System.server.post("/register", data);
  if (dat.status == false) {
    return { status: false, error: dat.error };
  }
  return dat;
};

System.util.receipt = (id, balance, field = []) => {
  let field_data = [];
  field.forEach((i) => {
    field_data.push(
      `<p class="flex-between">
        <span>${i[0]}</span>
        <span>${i[1]}</span>
      </p>`
    );
  });
  return `
  <style>

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Montserrat", sans-serif;
    }

    div {
      text-align: center;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    .border {
      width: 300px;
      height: 2px;
      margin: 18px 40px;
      background-color: #ddd;
    }

    .flex-between {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0px 12px;
      height: 32px;
    }

    h2 {
      height: 108px;
      width: 100%;
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

    }

    h3 {
      height: 48px;
    }

    box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 64px
    }

    .flex-between span:nth-child(1), .bold {
      font-weight: 600;
    }
  </style>
  <div>
  <h2>Secure Touch 400 ATM</h2>

  <box>
    <p>
      <span class="bold">Address:</span> DHA Phase 8, New York
    </p>
    <p>
    <span class="bold">Tel:</span> (+92) 666-888-9
    </p>
  </box>
  <div class="border"></div>
  <p class="flex-between">
    <span>
      Date
    </span>
    <span>
    ${System.util.time()}
    </span>
  </p>
  <div class="border"></div>
  <p class="flex-between">
    <span>
      Account ID
    </span>
    <span>
      ${id}
    </span>
  </p>
  ${field_data.join("")}
  <p class="flex-between">
    <span>
      Account Balance
    </span>
    <span>
      PKR ${formatNumber(balance)}
    </span>
  </p>
  <div class="border"></div>
  <h3>THANK YOU</h3>
</div>
  `;
};

//////////////////////////////////////////////////////////////////////
//                        Dashboard Functions                       //
//////////////////////////////////////////////////////////////////////
System.req = {};
System.req.withdraw = async () => {
  let amount = System.util.get(`withdraw_amount`);
  let id = sessionStorage.getItem("id");
  if (amount == false) {
    return { status: false, error: "Please enter desired amount." };
  }
  if (amount % 500 !== 0) {
    return {
      status: false,
      error: "Withdraw amount should be multiple of PKR 500.",
    };
  }
  if (amount >= 100000) {
    return {
      status: false,
      error: "Withdraw amount should be less than PKR 100,000.",
    };
  }
  let data = await System.server.post("/withdraw", {
    id: id,
    amount: amount,
  });
  if (data.status == false) {
    return { status: false, error: data.error };
  }

  // The transaction was successful.

  // 380 x 580

  System.util.window(
    System.util.receipt(id, data.balance, [
      ["Amount Withdrawn", `PKR ${formatNumber(amount)}`],
    ])
  );

  return data;
};

System.req.transfer = async () => {
  let amount = System.util.get(`transfer_amount`);
  let sender = sessionStorage.getItem("id");
  let recipient = System.util.get(`recipient_id`);
  if (amount == false || recipient == false) {
    return { status: false, error: "Please fill all fields." };
  }

  /* Enable this if you want the transfer amount to be multiple of 500 */
  // if (amount % 500 !== 0) {
  //   return {
  //     status: false,
  //     error: "Transfer amount should be multiple of PKR 500.",
  //   };
  // }
  if (amount >= 100000) {
    return {
      status: false,
      error: "Transfer amount should be less than PKR 100,000.",
    };
  }
  let data = await System.server.post("/transfer", {
    amount: amount,
    sender: sender,
    recipient: recipient,
  });

  System.util.window(
    System.util.receipt(sender, data.balance, [
      ["Amount Transferred", `PKR ${formatNumber(amount)}`],
      ["Recipient ID", `${recipient}`],
    ])
  );

  return data;
};

System.req.quickWithdraw = async (amount) => {
  let id = sessionStorage.getItem("id");
  if (amount == false) {
    return { status: false, error: "Please enter desired amount." };
  }
  if (amount % 500 !== 0) {
    return {
      status: false,
      error: "Withdraw amount should be multiple of PKR 500.",
    };
  }
  if (amount >= 100000) {
    return {
      status: false,
      error: "Withdraw amount should be less than PKR 100,000.",
    };
  }
  let data = await System.server.post("/withdraw", {
    id: id,
    amount: amount,
  });
  if (data.status == false) {
    return { status: false, error: data.error };
  }
  System.util.window(
    System.util.receipt(id, data.balance, [
      ["Amount Withdrawn", `PKR ${formatNumber(amount)}`],
    ])
  );
  return data;
};

System.req.getBalance = async () => {
  let id = sessionStorage.getItem("id");
  console.log(id);
  let data = await System.server.post("/balance", {
    id: id,
  });
  if (data.status == false) {
    sessionStorage.setItem("balance", "-");
    return;
  }
  console.log(data);
  sessionStorage.setItem("balance", formatNumber(parseInt(data.balance)));
  return data;
};

System.req.getTransactions = async () => {
  let id = sessionStorage.getItem("id");
  let data = await System.server.post("/transaction", {
    id: id,
  });
  if (data.status == false) return;
  let t = data.data;
  t = [...t].reverse();
  if (t.length < 1) {
    document.querySelector(".t_table").innerHTML =
      "<h3>You have not made any transactions.</h3>";
    return;
  }
  t.splice(5, t.length - 4);
  let render = [];
  t.forEach((i) => {
    render.push(`
    <div class="transaction">
      <div class="d">
      <h1 class="h w"> ${i.status} Request</h1>
        <div class="d w">
          <span>From: ${i.account}</span>
          ${i.status == "Transfer" ? `<span>To: ${i.account2}</span>` : ``}
        </div>
      </div>
      <div class="d a">
        <div>
        Amount: <span>PKR ${formatNumber(i.amount)}</span>
        </div>
        <div>
        Date: <span>${i.date}</span>
        </div>
      </div>
    </div>
    `);
  });
  document.querySelector(".t_table").innerHTML = render.join("");

  return;
};

System.req.changePin = async () => {
  let id = sessionStorage.getItem("id");
  let oldPin = System.util.get("curr_pin");
  let pin = System.util.get("pin");
  if (
    pin === false ||
    pin.length !== 4 ||
    oldPin === false ||
    oldPin.length !== 4
  ) {
    return { status: false, error: "Please enter a valid PIN." };
  }
  let data = await System.server.post("/changepin", {
    id: id,
    pin: pin,
    old: oldPin,
  });
  return data;
};

System.req.getUserDetails = async () => {
  let id = sessionStorage.getItem("id");

  let data = await System.server.post("/getUserDetails", {
    id,
  });

  // data.card.id =
  data.card.id = String(data.card.id)
    .split("")
    .map((e, i) => {
      if (i >= 5 && i <= 10) {
        return "*";
      }
      return e;
    })
    .join("");

  return data;
};

System.req.printDetailedReciept = (data) => {
  console.log(data);
  System.util.window(
    System.util.receipt(
      data.id,
      parseInt(data.balance.split(" ")[1].replaceAll(",", "")),
      [
        ["User Name", data.name],
        ["Phone No.#", data.contact],
        ["CNIC", data.cnic],
        ["Card Number", data.card.id],
        ["Card Bank", data.card.bank],
        ["Card Expiry", data.card.expiry],
        // ["Amount Withdrawn", `PKR ${formatNumber(amount)}`],
      ]
    ),
    "width=380px, height=620px"
  );
};

//////////////////////////////////////////////////////////////////////
//                        Front-end Functions                       //
//////////////////////////////////////////////////////////////////////
System.numerify = (id) => {
  let e = document.querySelector(`#${id}`);
  let min = parseInt(e.getAttribute("min"));
  let max = parseInt(e.getAttribute("max"));
  e.addEventListener("input", () => {
    if (e.value > max) {
      e.value = max;
    }
    if (e.value < min) {
      e.value = min;
    }
  });
};

//////////////////////////////////////////////////////////////////////
//                          Admin Functions                         //
//////////////////////////////////////////////////////////////////////
System.admin = {};
System.admin.kit = {};

// System.admin.deleteUser = async (id) => {
//   console.log(id);
// };

System.admin.kit.delete = async () => {
  let id = sessionStorage.getItem("target_id");

  let data = await System.server.post("/admin/_delete", {
    id: id,
  });

  await System.admin.userTables();
};
System.admin.kit.money = async (amount) => {
  console.log(amount);
  let id = sessionStorage.getItem("target_id");
  if (amount < 1) {
    return { status: false };
  }

  document.querySelector("#add_amount").value = "";

  let data = await System.server.post("/admin/_money", {
    id: id,
    amount: amount,
  });

  if (data.status == false) {
    return { status: false };
  }

  return { status: true };
};

System.admin.userTables = async () => {
  let data = await System.server.get("/admin/usertables");
  data = data.data;

  let action = (id) => {
    return `
    <div class="tablifyBtnWrapper">
    <button class="tablifyBtn trash" target="${id}"><i class="bi bi-trash-fill"></i></button>

    <button class="tablifyBtn add" target="${id}"><i class="bi bi-cash-coin"></i></button>
    </div>
    `;
    // (id) => `<button onclick="alert(${id})">Your Button</button>`
  };

  let html = System.util.tablify(
    data,
    ["ID", "Name", "Balance", "CNIC", "Contact"],
    action
  );
  document.querySelector("#user_table_data").innerHTML = html;

  console.log(data);
};

System.admin.cardTables = async () => {
  let data = await System.server.get("/admin/cardtables");
  data = data.data;

  let action = (id) => {
    return `
    N/A
    `;
  };

  let html = System.util.tablify(
    data,
    ["Card Number", "Bank", "Expiry Date", "Owner ID", "Owner Name"],
    action
  );
  document.querySelector("#card_table_data").innerHTML = html;

  console.log(data);
};

System.admin.transactionTable = async () => {
  let data = await System.server.get("/admin/transactiontable");
  data = data.data;

  let action = (id) => {
    return `
    N/A
    `;
  };

  let html = System.util.tablify(
    data,
    // ["Card Number", "Bank", "Expiry Date", "Owner ID", "Owner Name"],
    [
      "Sender ID",
      "Recipient ID",
      "Transaction Amount",
      "Transaction Type",
      "Transaction Date",
    ],
    action
  );
  document.querySelector("#transaction_table_data").innerHTML = html;

  console.log(data);
};

export { System };
