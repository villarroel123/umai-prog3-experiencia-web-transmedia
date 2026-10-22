import { notFound } from "next/navigation";
import StoryExperience from "@/components/StoryExperience";
import { getMemory, getMovie } from "@/data/memories";

export async function generateMetadata({ params }) {
  const { pelicula, objeto } = await params;
  const memory = getMemory(pelicula, objeto);
  return memory ? { title: memory.title + " — La biblioteca de los recuerdos", description: memory.description } : {};
}

export default async function MemoryPage({ params }) {
  const { pelicula, objeto } = await params;
  const movie = getMovie(pelicula);
  const memory = getMemory(pelicula, objeto);
  if (!movie || !memory) notFound();
  return <StoryExperience screen="minigame" movie={movie} memory={memory} />;
}
