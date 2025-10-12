import { useState } from 'react';
import ProgressBar from './ProgressBar';

export default function Step5({ onNext }) {
  const [name, setName] = useState('');
  return (
    <div className="wizard">
      <ProgressBar step={5}/>
      <h2>Шаг 5 из 6 — Имя</h2>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Введите имя…"
        style={{ padding:'10px 14px', fontSize:18, width:260 }}
      />

      <br/><br/>
      <button disabled={!name}
              onClick={() => onNext({ name })}>
        Далее
      </button>
    </div>
  );
}
