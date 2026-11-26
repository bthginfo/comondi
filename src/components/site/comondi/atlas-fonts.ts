import localFont from "next/font/local";

// Atlas sets headings in Syne and text in Archivo. The files only load when the Atlas design is shown.
export const atlasDisplay = localFont({
  src: "../../../../node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2",
  weight: "400 800", style: "normal", display: "swap", preload: false, variable: "--cm-atlas-display",
});
export const atlasText = localFont({
  src: "../../../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2",
  weight: "100 900", style: "normal", display: "swap", preload: false, variable: "--cm-atlas-text",
});
