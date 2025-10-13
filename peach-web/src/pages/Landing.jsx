export default function Landing() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e3a8a 100%)',
      padding: '40px 20px',
      paddingBottom: '100px'
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        paddingTop: '40px'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          🍑 Peachmini
        </h1>
        <h2 style={{
          fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
          color: '#e2e8f0',
          fontWeight: '300',
          marginBottom: '16px'
        }}>
          твой личный AI-компаньон
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.125rem)',
          color: '#94a3b8',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Создай персонажа, общайся, выполняй квесты и прокачивай отношения
        </p>
      </div>

      {/* Features Cards */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 60px',
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
      }}>
        <div style={{
          background: 'rgba(30, 27, 75, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 30px 80px rgba(167, 139, 250, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💜</div>
          <h3 style={{ 
            color: '#e2e8f0', 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            Эмоции и память
          </h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            AI запоминает ваши разговоры и проявляет настоящие эмоции
          </p>
        </div>

        <div style={{
          background: 'rgba(30, 27, 75, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 30px 80px rgba(236, 72, 153, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⭐</div>
          <h3 style={{ 
            color: '#e2e8f0', 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            Stars-экономика
          </h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            Покупайте контент за Telegram Stars прямо в приложении
          </p>
        </div>

        <div style={{
          background: 'rgba(30, 27, 75, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 30px 80px rgba(245, 158, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.4)';
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎁</div>
          <h3 style={{ 
            color: '#e2e8f0', 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            Реферальная программа
          </h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            Приглашайте друзей и получайте бонусы
          </p>
        </div>
      </div>

      {/* How to Start */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto 60px',
        background: 'rgba(30, 27, 75, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
      }}>
        <h3 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          color: '#e2e8f0',
          fontWeight: 'bold',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Как начать
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              1
            </div>
            <div>
              <h4 style={{ color: '#e2e8f0', fontSize: '1.125rem', marginBottom: '8px' }}>
                Открой бота @PeachminiBot
              </h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Найди бота в Telegram и запусти его
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              2
            </div>
            <div>
              <h4 style={{ color: '#e2e8f0', fontSize: '1.125rem', marginBottom: '8px' }}>
                Нажми «Открыть приложение»
              </h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Запусти WebApp прямо в Telegram
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              3
            </div>
            <div>
              <h4 style={{ color: '#e2e8f0', fontSize: '1.125rem', marginBottom: '8px' }}>
                Выбери персонажа или создай своего
              </h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Начни общаться с уникальным AI-компаньоном
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Cool Section */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto 60px',
        background: 'rgba(30, 27, 75, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
      }}>
        <h3 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          color: '#e2e8f0',
          fontWeight: 'bold',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Почему это круто
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            padding: '20px',
            background: 'rgba(167, 139, 250, 0.1)',
            borderRadius: '16px',
            borderLeft: '4px solid #a78bfa'
          }}>
            <p style={{ color: '#e2e8f0', fontSize: '1.125rem', lineHeight: '1.6' }}>
              <strong>Тёплый интерфейс</strong> — уютный дизайн Telegram MiniApp
            </p>
          </div>

          <div style={{
            padding: '20px',
            background: 'rgba(236, 72, 153, 0.1)',
            borderRadius: '16px',
            borderLeft: '4px solid #ec4899'
          }}>
            <p style={{ color: '#e2e8f0', fontSize: '1.125rem', lineHeight: '1.6' }}>
              <strong>Живые персонажи</strong> — каждый с уникальной индивидуальностью
            </p>
          </div>

          <div style={{
            padding: '20px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '16px',
            borderLeft: '4px solid #f59e0b'
          }}>
            <p style={{ color: '#e2e8f0', fontSize: '1.125rem', lineHeight: '1.6' }}>
              <strong>Экономика Stars</strong> — задания и бонусы для удержания
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        paddingTop: '40px',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Контакты: <a 
            href="mailto:support@peachmini.ai" 
            style={{ color: '#a78bfa', textDecoration: 'none' }}
          >
            support@peachmini.ai
          </a>
        </p>
      </div>
    </div>
  );
}

