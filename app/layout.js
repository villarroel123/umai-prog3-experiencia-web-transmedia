import "./globals.css";

export const metadata = {
  title: "La biblioteca de los recuerdos",
  description: "Explorá una biblioteca mágica y reconstruí tres páginas de un libro de recuerdos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
