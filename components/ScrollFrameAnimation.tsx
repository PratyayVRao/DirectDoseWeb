import React, { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 103;

function padFrameNumber(num: number): string {
  return num.toString().padStart(3, "0");
}

export default function ScrollFrameAnimation() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/DiabetesTitleVid1.0/ezgif-frame-${padFrameNumber(i)}.jpg`;
    }
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      let scrollFraction =
        (windowHeight - rect.top) / (rect.height + windowHeight);

      scrollFraction = Math.min(Math.max(scrollFraction, 0), 1);

      const frame = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(scrollFraction * TOTAL_FRAMES)
      );

      setFrameIndex(frame);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentFrameSrc = `/DiabetesTitleVid1.0/ezgif-frame-${padFrameNumber(
    frameIndex + 1
  )}.jpg`;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[700px] sm:h-[800px] md:h-[900px] lg:h-[1000px] flex justify-center items-center bg-black"
      aria-label="Scroll frame by frame animation of Diabetes Title Video"
    >
      <img
        src={currentFrameSrc}
        alt={`Animation frame ${frameIndex + 1}`}
        className="w-auto max-w-full max-h-full object-contain"
        draggable={false}
        loading="eager"
        style={{ userSelect: "none", pointerEvents: "none" }}
      />
    </section>
  );
}
