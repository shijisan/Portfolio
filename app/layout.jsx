import {Inter} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});


export const metadata = {
  title: "Christian James Santos",
  description: "Full Stack Web Developer Specializing in Next JS and React.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.class}`}
      >
        {children}
      </body>
    </html>
  );
}
