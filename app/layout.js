import "@fontsource/cormorant-upright/400.css";
import "@fontsource/redaction-10/400.css";
import "./globals.css";
import "./story.css";
import "./story-redesign.css";
import "./minigames.css";
import "./book-journey.css";
import "./chapter-experience.css";
import "./chihiro-experience.css";
import "./book-navigation.css";
import "./chihiro-book.css";
import "./book-contents.css";
import "./stage-c.css";
import "./experience-themes.css";
import "./memory-restoration.css";
import "./memory-journal.css";
import "./typography.css";
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
