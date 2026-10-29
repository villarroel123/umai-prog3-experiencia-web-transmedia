import StoryExperience from "@/components/StoryExperience";

export const metadata = {
  title: "Índice de los recuerdos — La biblioteca de los recuerdos",
  description: "Elegí una historia para comenzar a recuperar sus recuerdos.",
};

export default function IndicePage() {
  return <StoryExperience screen="library" />;
}
