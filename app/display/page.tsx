"use client";

import { useEffect } from "react";
import { useGame } from "@/components/useGame";

export default function DisplayPage() {
  const { activeQuestion, state, connected } = useGame();

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

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

        {state.strikes > 0 && (
          <div className="strike-layer">
            <div className="strike-stack">
              {Array.from({ length: state.strikes }).map((_, i) => (
                <div className="big-x" key={i}>X</div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}