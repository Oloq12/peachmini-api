import ProgressBar from './ProgressBar';

export default function Step6({ data, onFinish }) {
  return (
    <div className="wizard">
      <ProgressBar step={6}/>
      <h2>Готово!</h2>
      <p>Имя: {data.name}</p>
      <p>Стиль: {data.style === 'real' ? 'Реальный' : 'Аниме'}</p>
      <p>Личность: {data.personality}</p>
      <p>Отношения: {data.relation}</p>
      <p>Размер груди: {data.bust}</p>

      <button onClick={onFinish}>Оживить персонажа</button>
    </div>
  );
}
