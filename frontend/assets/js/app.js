/* =========================
   GLOBAL COMPONENTS
========================== */

import "./components/sidebar.js";
import "./components/navbarDate.js";
import { initAuthControls, requireAuth } from "./modules/auth.js";

requireAuth();
initAuthControls();

console.log("Global app connected");
