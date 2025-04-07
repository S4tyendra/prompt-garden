import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "Prompt Garden",
  description: "Your AI Prompt Management Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
