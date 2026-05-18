import { redirect } from "react-router-dom";

  beforeLoad: () => {
    throw redirect({ to: "/notifications/log" });
  },
});