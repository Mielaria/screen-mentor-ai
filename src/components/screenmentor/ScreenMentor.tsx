import { useState } from "react";
import { FloatingButton } from "./FloatingButton";
import { CopilotPanel } from "./CopilotPanel";

type ViewState = "closed" | "minimized" | "open";

export function ScreenMentor() {
  const [viewState, setViewState] = useState<ViewState>("closed");

  return (
    <>
      <CopilotPanel
        isOpen={viewState === "open"}
        onClose={() => setViewState("closed")}
        onMinimize={() => setViewState("minimized")}
      />
      {viewState !== "open" && (
        <FloatingButton onClick={() => setViewState("open")} />
      )}
    </>
  );
}
