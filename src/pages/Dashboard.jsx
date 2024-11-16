import { popShop } from "../components/PopShop";
import "../scss/Dashboard.scss";
import { System } from "../JS/System";
import {
  ErrorMessage,
  showError,
  showSuccess,
} from "../components/ErrorMessage";
import { LoadScreen, startLoad, stopLoad } from "../components/LoadScreen";
import { useEffect, useState } from "react";

import { LogOutButton, DashButton } from "../components/LowPurposeButtons";

import { UserDashboard } from "./sections/UserDashboard";
import { AdminDashboard } from "./sections/AdminDashboard";

export default function Dashboard() {
  let [adminAccount, setAdminAccount] = useState(false);
  useEffect(() => {
    let id = sessionStorage.getItem("id");
    if (id == "admin") {
      setAdminAccount(true);
    }
  }, []);
  return <>{adminAccount ? <AdminDashboard /> : <UserDashboard />}</>;
}
