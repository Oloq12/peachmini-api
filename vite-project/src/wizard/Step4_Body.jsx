import ProgressBar from './ProgressBar';

export default function Step4({ onNext }) {
  const sizes = ['Плоский','Маленький','Средний','Большой','Огромный'];
  return (
    <div className="wizard">
      <ProgressBar step={4}/>
      <h2>Шаг 4 из 6 — Размер груди</h2>

      <div className="grid3">
        {sizes.map(s => <button key={s} onClick={() => onNext({ bust:s })}>{s}</button>)}
      </div>
    </div>
  );
}
