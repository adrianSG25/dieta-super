import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DietaSuper UK — Comparador y Lista en Pareja",
  description:
    "Compara precios y calorías entre Aldi, Lidl, Asda y Morrisons UK y optimiza la compra semanal en pareja.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DietaSuper UK",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
