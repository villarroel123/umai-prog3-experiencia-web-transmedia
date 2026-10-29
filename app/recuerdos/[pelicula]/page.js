import { notFound } from "next/navigation";
import StoryExperience from "@/components/StoryExperience";
import { chapterExperiences } from "@/data/chapterExperiences";
import { getMovie } from "@/data/memories";

export async function generateMetadata({ params }) {
  const { pelicula } = await params;
  const movie = getMovie(pelicula);
  return movie ? { title: movie.title + " — La biblioteca de los recuerdos", description: chapterExperiences[movie.id].setting } : {};
}

export default async function MoviePage({ params }) {
  const { pelicula } = await params;
  const movie = getMovie(pelicula);
  if (!movie) notFound();
  return <StoryExperience screen="chapter" movie={movie} />;
}
