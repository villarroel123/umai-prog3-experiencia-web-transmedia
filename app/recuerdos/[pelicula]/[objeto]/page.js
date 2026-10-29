import { notFound, redirect } from "next/navigation";
import { getMovie } from "@/data/memories";

export default async function MemoryPage({ params }) {
  const { pelicula } = await params;
  const movie = getMovie(pelicula);
  if (!movie) notFound();
  redirect(`/recuerdos/${movie.id}`);
}
