import { ContextProvider } from "./context/Context";
import "./globals.css";

export const metadata = {
  title: {
    default: "Forever | Thoughtful Everyday Fashion",
    template: "%s | Forever",
  },
  description: "Discover thoughtfully selected clothing and everyday style at Forever.",
  openGraph: {
    title: "Forever | Thoughtful Everyday Fashion",
    description: "Discover thoughtfully selected clothing and everyday style at Forever.",
    siteName: "Forever",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdn.boxicons.com/3.0.8/fonts/basic/boxicons.min.css" rel="stylesheet"></link>
      </head>
      <body
        className={`antialiased`}
      >
        <ContextProvider>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
