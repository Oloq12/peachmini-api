import React from 'react';

export default function CharacterCard({ char, lang, onOpen }) {
  const name = lang === 'ru' ? char.name_ru : char.name_en;
  const tags = lang === 'ru' ? char.tags_ru : char.tags_en;

  return (
    <div onClick={() => onOpen(char.id)} style={{
      border: '1px solid #eee',
      borderRadius: 12,
      padding: 12,
      textAlign: 'center',
      cursor: 'pointer'
    }}>
      <img src={char.img} alt={name} style={{ width: '100%', borderRadius: 8 }} />
      <h4 style={{ margin: '8px 0' }}>{name}</h4>

      <div style={{ fontSize: 12, marginBottom: 8 }}>
        {tags.map(t => (
          <span key={t} style={{
            display: 'inline-block',
            padding: '2px 6px',
            margin: 2,
            background: '#eee',
            borderRadius: 6
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
