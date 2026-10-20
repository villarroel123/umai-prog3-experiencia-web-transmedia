import { notFound } from "next/navigation";
import Experience from "@/components/Experience";
import FilmDossier from "@/components/FilmDossier";
import { chapters } from "@/data/chapters";
import { getGhibliFilm } from "@/lib/ghibli";

export async function generateMetadata({ params }) {
  const { chapter: chapterId } = await params;
  const chapter = chapters.find((item) => item.id === chapterId);

  if (!chapter) return {};

  return {
    title: `${chapter.label} — La biblioteca de los recuerdos`,
    description: chapter.copy,
  };
}

export default async function ChapterPage({ params }) {
  const { chapter: chapterId } = await params;
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) notFound();

  const film = await getGhibliFilm(chapter.filmId);
  return <Experience initialChapterId={chapterId} filmDossier={<FilmDossier film={film} />} />;
}
