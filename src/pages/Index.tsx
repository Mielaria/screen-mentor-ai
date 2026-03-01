import { ScreenMentor } from "@/components/screenmentor/ScreenMentor";

const Index = () => {
  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-xl">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
            SM
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          ScreenMentor AI
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Tu mentor digital en tiempo real para{" "}
          <span className="text-foreground font-medium">Photoshop</span>,{" "}
          <span className="text-foreground font-medium">Canva</span> y{" "}
          <span className="text-foreground font-medium">Shapr3D</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          Haz clic en el botón de la esquina inferior derecha para comenzar →
        </p>
      </div>
      <ScreenMentor />
    </div>
  );
};

export default Index;
