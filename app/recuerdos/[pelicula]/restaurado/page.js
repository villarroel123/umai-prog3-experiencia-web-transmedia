import { notFound } from "next/navigation";
import StoryExperience from "@/components/StoryExperience";
import { chapterExperiences } from "@/data/chapterExperiences";

export async function generateMetadata({ params }) {
  const { pelicula } = await params;
  return { title: `${chapterExperiences[pelicula]?.title || "Recuerdo restaurado"} — La biblioteca de los recuerdos` };
}

export default async function RestoredPage({ params }) {
  const { pelicula } = await params;
  if (!chapterExperiences[pelicula]) notFound();
  return <StoryExperience screen="restored" />;
}
