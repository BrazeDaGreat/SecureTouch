import { useEffect, useState } from "react";

export function DotProgress() {
  let [p, set_p] = useState("");

  useEffect(() => {
    setTimeout(() => {
      set_p(`${p}.`);
      if (p == "...") {
        set_p(".");
      }
    }, 500);
  }, [p]);
  return <>{p}</>;
}
