import ProgressBar from './ProgressBar';

export default function Step1({ onNext }) {
  return (
    <div className="wizard">
      <ProgressBar step={1}/>
      <h2>Шаг 1 из 6 — Стиль</h2>

      <div className="grid2">
        <button onClick={() => onNext({ style:'real'  })}>🤳 Реальный</button>
        <button onClick={() => onNext({ style:'anime' })}>🎨 Аниме</button>
      </div>
    </div>
  );
}
