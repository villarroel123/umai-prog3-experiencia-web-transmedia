import StoryExperience from "@/components/StoryExperience";
import { redirect } from "next/navigation";

export const metadata = {
  title: "El libro de los recuerdos — La biblioteca de los recuerdos",
  description: "Elegí uno de los tres mundos y recuperá sus recuerdos.",
};

export default async function BibliotecaPage({ searchParams }) {
  const { pagina, animar } = await searchParams;
  if (pagina === "chihiro") redirect(`/recuerdos/chihiro/restaurado${animar === "1" ? "?animar=1" : ""}`);
  return <StoryExperience screen="library" />;
}
