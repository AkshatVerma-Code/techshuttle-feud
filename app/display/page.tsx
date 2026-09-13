"use client";

import { useState,useEffect,useRef } from "react";
import { useGame } from "@/components/useGame";

export default function DisplayPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousStrikes = useRef(0);
  const [showStrike, setShowStrike] = useState(false);
  const { activeQuestion, state, connected } = useGame();
  // useEffect(() => {
  //   document.documentElement.requestFullscreen?.().catch(() => {});
  // }, []);
  useEffect(() => {
    if (state.strikes > previousStrikes.current) {
      setShowStrike(true);

      const audio = new Audio("/sounds/buzzer.mp3");
      audio.volume = 0.8;
      audio.play().catch(() => {});

      const timer = setTimeout(() => {
        setShowStrike(false);
      }, 1500);

      previousStrikes.current = state.strikes;

      return () => clearTimeout(timer);
    }

    previousStrikes.current = state.strikes;
  }, [state.strikes]);

  return (
    <main className="display-shell">
      <header className="display-topbar">
        <div className="display-brand">TECH SHUTTLE <span>FEUD</span></div>
        <div className={`display-connection ${connected ? "online" : ""}`}>
          <span /> {connected ? "LIVE" : "CONNECTING"}
        </div>
      </header>

      <section className={`feud-stage ${state.hidden ? "hidden-stage" : ""}`}>
        <div className="question-area">
          <span className="display-eyebrow">QUESTION</span>
          <h1>{activeQuestion?.text ?? "Waiting for the controller…"}</h1>
        </div>

        <div className="board-grid">
          {(activeQuestion?.answers ?? []).map((answer, index) => {
            const isRevealed = state.revealed.includes(answer.id);
            return (
              <div key={answer.id} className={`flip-card ${isRevealed ? "flipped" : ""}`}>
                <div className="flip-inner">
                  <div className="flip-face flip-front">
                    <span>{index + 1}</span>
                  </div>
                  <div className="flip-face flip-back">
                    <strong>{answer.text}</strong>
                    <b>{answer.popularity}</b>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="display-footer">
          <span>TECH SHUTTLE • FAMILY FEUD STYLE</span>
          <span>{state.revealed.length} / {activeQuestion?.answers.length ?? 0} REVEALED</span>
        </div>

        {showStrike && (
          <div className="strike-layer">
            <div className="strike-stack">
              <div className="big-x">X</div>
            </div>
          </div>
        )}
        <div className="strike-counter">
          <span>STRIKES</span>

          <div className="strike-indicators">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`strike-indicator ${
                  index < state.strikes ? "used" : ""
                }`}
              >
                {index < state.strikes ? "X" : "•"}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
