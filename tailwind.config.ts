import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // lib holds the phase->class map; Tailwind must scan it so those
    // utility classes are generated.
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // App background (warm off-white)
        appbg: "#EFEDE8",
        // CARE phase palettes (exact values from the spec)
        heartware: {
          DEFAULT: "#D85A30",
          border: "#F0A090",
          light: "#FDF0EE",
        },
        mindware: {
          DEFAULT: "#3D7A00",
          border: "#A8D070",
          light: "#EAF3DE",
        },
        techware: {
          DEFAULT: "#0E4A82",
          border: "#85B7EB",
          light: "#E6F1FB",
        },
        impact: {
          DEFAULT: "#3A3A38",
          border: "#C8C7BE",
          light: "#F4F3EF",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
