import StoryExperience from "@/components/StoryExperience";

export const metadata = {
  title: "El libro de los recuerdos — La biblioteca de los recuerdos",
  description: "Elegí uno de los tres mundos y recuperá sus recuerdos.",
};

export default function BibliotecaPage() {
  return <StoryExperience screen="library" />;
}
