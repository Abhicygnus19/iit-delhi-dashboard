import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // base: "/",
  base: "/iitd/react-dashboard/",
  // base: "/iitd-rnd-dashboard-demo/v2/",
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// export default defineConfig({
//   plugins: [react()],
//   base: "/",
//   server: {
//     proxy: {
//       "/api": {
//         target: "https://cygnusweb.in/iitd",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });
