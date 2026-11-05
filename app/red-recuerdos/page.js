import StoryExperience from "@/components/StoryExperience";

export const metadata = {
  title: "Red de recuerdos — La biblioteca de los recuerdos",
  description: "Descubrí las historias que otros viajeros decidieron compartir.",
};

export default function RedRecuerdosPage() {
  return <StoryExperience screen="library" />;
}
