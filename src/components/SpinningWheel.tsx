import { useRef, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";

interface SpinningWheelProps {
  names: string[];
  targetName: string;
  isBoys: boolean;
  onSpinComplete: (name: string) => void;
  spinning: boolean;
  onSpinStart: () => void;
  hideSpinButton?: boolean;
}

const SpinningWheel = ({
  names,
  targetName,
  isBoys,
  onSpinComplete,
  spinning,
  onSpinStart,
  hideSpinButton,
}: SpinningWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  const segmentAngle = (2 * Math.PI) / names.length;

  const boyColors = [
    "hsl(217, 91%, 60%)", "hsl(213, 94%, 68%)", "hsl(221, 83%, 53%)",
    "hsl(210, 100%, 72%)", "hsl(224, 76%, 48%)", "hsl(206, 100%, 65%)",
  ];
  const girlColors = [
    "hsl(330, 81%, 60%)", "hsl(330, 90%, 71%)", "hsl(335, 78%, 52%)",
    "hsl(325, 95%, 74%)", "hsl(340, 75%, 55%)", "hsl(320, 85%, 68%)",
  ];
  const colors = isBoys ? boyColors : girlColors;

  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 12;

      ctx.clearRect(0, 0, size, size);

      // Shadow
      ctx.beginPath();
      ctx.arc(center, center + 4, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fill();

      // Segments
      names.forEach((name, i) => {
        const startAngle = rotation + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Name text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.max(10, Math.min(14, 400 / names.length))}px Montserrat, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 2;
        ctx.fillText(name, radius - 20, 4);
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 48, 0, 2 * Math.PI);
      ctx.fillStyle = "hsl(0, 0%, 100%)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer rim
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isBoys ? "hsl(217, 91%, 50%)" : "hsl(330, 81%, 50%)";
      ctx.lineWidth = 5;
      ctx.stroke();

      // Pointer triangle at top
      const pointerSize = 22;
      ctx.beginPath();
      ctx.moveTo(center, 2);
      ctx.lineTo(center - pointerSize / 2, pointerSize + 6);
      ctx.lineTo(center + pointerSize / 2, pointerSize + 6);
      ctx.closePath();
      ctx.fillStyle = "hsl(38, 92%, 50%)";
      ctx.fill();
      ctx.strokeStyle = "hsl(38, 92%, 40%)";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [names, segmentAngle, colors, isBoys]
  );

  useEffect(() => {
    drawWheel(currentRotation);
  }, [currentRotation, drawWheel]);

  // Start spin when spinning prop becomes true
  useEffect(() => {
    if (!spinning || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const targetIndex = names.indexOf(targetName);
    if (targetIndex === -1) return;

    // Pointer is at top of canvas = -PI/2 in canvas coords
    // Segment i spans: [rotation + i*segAngle, rotation + (i+1)*segAngle]
    // We need: rotation + targetIndex*segAngle + segAngle/2 = -PI/2
    // So: rotation = -PI/2 - targetIndex*segAngle - segAngle/2
    const desiredFinalAngle = -Math.PI / 2 - targetIndex * segmentAngle - segmentAngle / 2;
    const desiredFinalMod =
      ((desiredFinalAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const fullSpins = 5;
    const currentRot = rotationRef.current;
    const currentMod =
      ((currentRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let extra = desiredFinalMod - currentMod;
    if (extra < 0) extra += 2 * Math.PI;

    const finalRotation = currentRot + fullSpins * 2 * Math.PI + extra;
    const startTime = performance.now();
    const duration = 4000;
    const startRot = currentRot;
    const delta = finalRotation - startRot;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newRotation = startRot + delta * eased;
      rotationRef.current = newRotation;
      setCurrentRotation(newRotation);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.5 },
          colors: isBoys
            ? ["#3B82F6", "#60A5FA", "#F59E0B", "#ffffff"]
            : ["#EC4899", "#F472B6", "#F59E0B", "#ffffff"],
        });
        // CRITICAL: use the same targetName variable
        onSpinComplete(targetName);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [spinning, targetName, names, segmentAngle, isBoys, onSpinComplete]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const canvasSize = Math.min(
    480,
    typeof window !== "undefined" ? window.innerWidth - 40 : 480
  );

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="block"
      />
      {/* SPIN button */}
      {!spinning && !hideSpinButton && (
        <button
          onClick={onSpinStart}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-accent text-accent-foreground font-display font-extrabold text-lg shadow-lg hover:scale-110 transition-transform duration-200 z-10 border-4 border-accent/80"
          style={{ boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)" }}
        >
          SPIN
        </button>
      )}
      {spinning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-muted flex items-center justify-center z-10 border-4 border-muted">
          <div className="w-6 h-6 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default SpinningWheel;
