import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

export const KineticCursorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: -100, y: -100 });
  const pointsRef = useRef<Point[]>([]);
  const [capsuleTilt, setCapsuleTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize points history for smooth spring trail
    const POINT_COUNT = 24;
    for (let i = 0; i < POINT_COUNT; i++) {
      pointsRef.current.push({ x: -100, y: -100 });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Calculate subtle 3D parallax tilt for capsule
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const rx = ((e.clientY - cy) / cy) * -12;
      const ry = ((e.clientX - cx) / cx) * 14;
      setCapsuleTilt({ rx, ry });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Ribbon draw animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;
      // First point chases mouse with spring damping
      points[0].x += (mouseRef.current.x - points[0].x) * 0.35;
      points[0].y += (mouseRef.current.y - points[0].y) * 0.35;

      // Rest of points chase previous point
      for (let i = 1; i < points.length; i++) {
        points[i].x += (points[i - 1].x - points[i].x) * 0.42;
        points[i].y += (points[i - 1].y - points[i].y) * 0.42;
      }

      // Draw tapered ribbon trail if mouse is on screen
      if (points[0].x > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        ctx.strokeStyle = '#FF3B00';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#FF3B00';
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.75;
        ctx.stroke();

        // Inner glowing core
        ctx.strokeStyle = '#F4F3EF';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Full-viewport Canvas Overlay (pointer-events-none) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none"
      />

      {/* Floating Interactive Orbital Telemetry Capsule (Fixed Bottom-Right) */}
      <div
        className="fixed bottom-6 right-6 z-40 hidden sm:block pointer-events-auto cursor-default transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(800px) rotateX(${capsuleTilt.rx}deg) rotateY(${capsuleTilt.ry}deg)`,
        }}
      >
        <div className="bg-[#0A0A0A]/90 text-[#F4F3EF] border border-white/20 backdrop-blur-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 font-mono text-[11px] tracking-wider uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B00]"></span>
          </span>
          <span className="font-bold text-[#FF3B00]">LIVE NASA LINK</span>
          <span className="text-white/40">•</span>
          <span className="text-white/80 font-mono">2005–2024 POINT DATA</span>
        </div>
      </div>
    </>
  );
};
