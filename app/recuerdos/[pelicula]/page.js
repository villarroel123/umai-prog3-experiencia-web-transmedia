import { notFound } from "next/navigation";
import StoryExperience from "@/components/StoryExperience";
import { getMovie } from "@/data/memories";
import { getGhibliFilm } from "@/lib/ghibli";

export async function generateMetadata({ params }) {
  const { pelicula } = await params;
  const movie = getMovie(pelicula);
  return movie ? { title: movie.title + " — La biblioteca de los recuerdos", description: movie.opening } : {};
}

export default async function MoviePage({ params }) {
  const { pelicula } = await params;
  const movie = getMovie(pelicula);
  if (!movie) notFound();
  const film = await getGhibliFilm(movie.filmId);
  return <StoryExperience screen="chapter" movie={movie} film={film} />;
}
