import ProgressBar from './ProgressBar';
const types = ['Незнакомец','Коллега','Девушка','Любовница','Жена','Друг для секса'];

export default function Step3({ onNext }) {
  return (
    <div className="wizard">
      <ProgressBar step={3}/>
      <h2>Шаг 3 из 6 — Отношения</h2>

      <div className="grid3">
        {types.map(t => <button key={t} onClick={() => onNext({ relation:t })}>{t}</button>)}
      </div>
    </div>
  );
}
