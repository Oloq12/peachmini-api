import ProgressBar from './ProgressBar';

const presets = [
  'Опекун','Мудрец','Шут','Доминирующий',
  'Невинный','Романтик','Хулиганка','Соблазнитель'
];

export default function Step2({ onNext }) {
  return (
    <div className="wizard">
      <ProgressBar step={2}/>
      <h2>Шаг 2 из 6 — Личность</h2>

      <div className="grid3">
        {presets.map(p => (
          <button key={p} onClick={() => onNext({ personality:p })}>{p}</button>
        ))}
      </div>
    </div>
  );
}
