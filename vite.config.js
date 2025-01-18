import { defineConfig } from "vite";
import { mockWebxdc, buildXDC, eruda } from "@webxdc/vite-plugins";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    reportCompressedSize: false,
  },
  plugins: [buildXDC(), mockWebxdc(), eruda()],
});
