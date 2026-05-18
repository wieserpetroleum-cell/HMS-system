import { renderToString } from "react-dom/server";
import { StartServer } from "@tanstack/react-start/server";
import { getRouter } from "./router";

export async function render(opts: { request: Request }) {
  const router = getRouter();

  return <StartServer router={router} />;
}
