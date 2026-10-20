import { Archivo, Instrument_Sans, Martian_Mono } from "next/font/google";
import localFont from "next/font/local";

// Martian Mono carries display + data along its width axis (CoffeeOS).
export const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--nf-martian",
  display: "swap",
});

// Instrument Sans carries prose.
export const instrument = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--nf-instrument",
  display: "swap",
});

// Fallback for the logo face, only fetched for a character Energy lacks: not preloaded.
export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--nf-archivo",
  display: "swap",
  preload: false,
});

// BLENDED logo + header face, from the packaging artwork. Subset to Latin and
// compressed to WOFF2 (252 KB TTF → 30 KB); the original TTF is in git history.
export const energy = localFont({
  src: "./fonts/EnergyGrotesk-UltraBold.woff2",
  weight: "800",
  style: "normal",
  variable: "--nf-energy",
  display: "swap",
});

export const fontVars = [martian.variable, instrument.variable, archivo.variable, energy.variable].join(" ");
