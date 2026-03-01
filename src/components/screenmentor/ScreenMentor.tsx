import { useState } from "react";
import { FloatingButton } from "./FloatingButton";
import { CopilotPanel } from "./CopilotPanel";

export function ScreenMentor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CopilotPanel isOpen={isOpen} />
      <FloatingButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </>
  );
}
