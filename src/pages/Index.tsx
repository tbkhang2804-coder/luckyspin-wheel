import { useState, useRef, useCallback } from "react";
import SpinningWheel from "@/components/SpinningWheel";
import { BOYS, GIRLS, SPIN_SEQUENCE } from "@/lib/gameData";

const Index = () => {
  const [spinIndex, setSpinIndex] = useState(0);
  const [selectedName, setSelectedName] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const wheelKeyRef = useRef(0);

  const isBoys = spinIndex % 2 === 0;
  const names = isBoys ? BOYS : GIRLS;

  // Determine the target name for the current spin
  const getTargetName = useCallback(() => {
    if (spinIndex < SPIN_SEQUENCE.length) {
      return SPIN_SEQUENCE[spinIndex];
    }
    const list = isBoys ? BOYS : GIRLS;
    return list[Math.floor(Math.random() * list.length)];
  }, [spinIndex, isBoys]);

  const handleSpinComplete = (name: string) => {
    setSelectedName(name);
    setShowResult(true);
    setSpinning(false);

    // Auto-advance after 3 seconds
    setTimeout(() => {
      setShowResult(false);
      setSelectedName("");
      setSpinIndex((i) => i + 1);
      wheelKeyRef.current += 1;
    }, 3000);
  };

  const handleSpin = () => {
    if (spinning || showResult) return;
    setSpinning(true);
    setShowResult(false);
    setSelectedName("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background overflow-hidden px-4 py-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
          Lucky Wheel
        </h1>
        <span
          className={`inline-block px-5 py-1.5 rounded-full font-display font-bold text-sm tracking-wide ${
            isBoys
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isBoys ? "Boys Wheel" : "Girls Wheel"}
        </span>
      </div>

      {/* Selected name */}
      {showResult && selectedName && (
        <div className="animate-fade-in-up mb-4">
          <div
            className={`font-display font-extrabold text-2xl sm:text-3xl animate-pulse-winner ${
              isBoys ? "text-primary" : "text-secondary"
            }`}
          >
            🎉 {selectedName} 🎉
          </div>
        </div>
      )}

      {/* Wheel */}
      <div className="flex-1 flex items-center justify-center">
        <SpinningWheel
          key={wheelKeyRef.current}
          names={names}
          targetName={getTargetName()}
          isBoys={isBoys}
          onSpinComplete={handleSpinComplete}
          spinning={spinning}
          onSpinStart={handleSpin}
          hideSpinButton={showResult}
        />
      </div>
    </div>
  );
};

export default Index;
