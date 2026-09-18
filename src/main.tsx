import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { routeTree } from "@/routeTree.gen";

import "@/index.scss";

const router = createRouter({
  basepath: import.meta.env.BASE_URL.replace(/\/$/, ""),
  routeTree,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode><RouterProvider router={router} /></StrictMode>,
);
