import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from '../components/Toast';
import CharacterCard, { CharacterCardSkeleton } from '../components/CharacterCard';
import { getCharacters } from '../services/pb';

export default function Home() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    try {
      console.log('🔵 Home: Начинаем загрузку персонажей...');
      setLoading(true);
      const data = await getCharacters();
      console.log('🟢 Home: Получено персонажей:', data.length);
      console.log('📊 Home: Данные:', data);
      setCharacters(data);
    } catch (error) {
      console.error('🔴 Home: Ошибка загрузки персонажей:', error);
      toast.error('Не удалось загрузить персонажей');
    } finally {
      setLoading(false);
      console.log('✅ Home: Загрузка завершена');
    }
  }

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      paddingBottom: '100px'
    }}>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1f',
            color: '#fff',
            borderRadius: '12px'
          }
        }}
      />
      
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#fff',
        marginBottom: '24px',
        marginTop: '20px'
      }}>
        Галерея
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
        maxWidth: '1200px'
      }}>
        {/* CTA карточка */}
        {!loading && <CharacterCard isCTA />}

        {/* Skeleton loader */}
        {loading && (
          <>
            {[...Array(6)].map((_, i) => (
              <CharacterCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* Карточки персонажей */}
        {!loading && characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>

      {!loading && characters.length === 0 && (
        <p style={{ 
          textAlign: 'center', 
          color: '#9ca3af', 
          marginTop: '40px',
          fontSize: '1.1rem'
        }}>
          Персонажи не найдены
        </p>
      )}
    </div>
  );
}
