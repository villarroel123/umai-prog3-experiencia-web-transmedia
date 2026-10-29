import { notFound } from "next/navigation";
import StoryExperience from "@/components/StoryExperience";
import { chapterExperiences } from "@/data/chapterExperiences";

export async function generateMetadata({ params }) {
  const { pelicula } = await params;
  return { title: `${chapterExperiences[pelicula]?.object || "Objeto recuperado"} — La biblioteca de los recuerdos` };
}

export default async function ObjectPage({ params }) {
  const { pelicula } = await params;
  if (!chapterExperiences[pelicula]) notFound();
  return <StoryExperience screen="object" />;
}
