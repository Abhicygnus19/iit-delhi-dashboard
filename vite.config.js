import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // base: "/ird-dashboard",
  base: "/iitd/react-dashboard/",
  // base: "/react-dashboard/",
  // base: "/iitd-rnd-dashboard-demo/v2/",
});
