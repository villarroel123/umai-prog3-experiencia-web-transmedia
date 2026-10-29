import { notFound } from "next/navigation";
import StoryExperience from "@/components/StoryExperience";
import { getMovie } from "@/data/memories";
import { chapterExperiences } from "@/data/chapterExperiences";

export async function generateMetadata({ params }) {
  const { pelicula } = await params;
  return { title: `${chapterExperiences[pelicula]?.title || "Experiencia"} — La biblioteca de los recuerdos` };
}

export default async function ExperiencePage({ params }) {
  const { pelicula } = await params;
  if (!getMovie(pelicula)) notFound();
  return <StoryExperience screen="experience" movie={getMovie(pelicula)} />;
}
