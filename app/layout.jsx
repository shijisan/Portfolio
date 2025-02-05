import { Poppins, Roboto_Flex } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  weight: ["variable"],
});

export const metadata = {
  title: "Christian James Santos",
  description: "Full Stack Web Developer Specializing in Next JS, and System Automation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${robotoFlex.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
