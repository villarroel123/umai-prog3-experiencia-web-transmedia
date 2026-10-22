import "./globals.css";
import "./story.css";
import "./story-redesign.css";
import "./minigames.css";
import "./book-journey.css";
import BookJourney from "@/components/BookJourney";

export const metadata = {
  title: "La biblioteca de los recuerdos",
  description: "Explorá una biblioteca mágica y reconstruí tres páginas de un libro de recuerdos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body><BookJourney>{children}</BookJourney></body>
    </html>
  );
}
