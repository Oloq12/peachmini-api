import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { track } from '../utils/analytics';

const PACKAGES = [
  {
    id: 'p300',
    points: 300,
    price: 99,
    icon: '🌟',
    badge: null,
    description: 'Стартовый пакет'
  },
  {
    id: 'p600',
    points: 600,
    price: 199,
    icon: '⭐',
    badge: '+20%',
    description: 'Популярный выбор'
  },
  {
    id: 'p850',
    points: 850,
    price: 299,
    icon: '💎',
    badge: 'ВЫГОДНО',
    description: 'Лучшее предложение'
  },
  {
    id: 'p999',
    points: 999,
    price: 399,
    icon: '👑',
    badge: 'ТОП',
    description: 'Максимум возможностей'
  }
];

export default function Store() {
  const [userBalance] = useState(150); // Заглушка для баланса
  const [purchasing, setPurchasing] = useState(null);

  const handlePurchase = async (pkg) => {
    setPurchasing(pkg.id);

    // Track purchase attempt
    track('purchase_attempt', { 
      packId: pkg.id,
      points: pkg.points,
      price: pkg.price
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://peach-mini-clean-jg98cn7sm-trsoyoleg-4006s-projects.vercel.app';
      const tgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'demo_user';
      
      const response = await fetch(`${API_URL}/api/payments/createInvoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
          tgId,
          packId: pkg.id
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания инвойса');
      }

      const result = await response.json();
      
      if (result.ok && result.data) {
        const { invoiceLink, paymentId, pack } = result.data;
        
        toast.success('🎉 Инвойс создан', {
          duration: 3000,
          style: {
            background: '#1a1a1f',
            color: '#fff',
            borderRadius: '12px'
          }
        });
        
        // В production: window.Telegram.WebApp.openInvoice(invoiceLink)
        // После успешной оплаты webhook обновит баланс
        
        // Simulate payment check (for demo)
        if (paymentId) {
          setTimeout(async () => {
            try {
              const checkResponse = await fetch(`${API_URL}/api/payments/check`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ paymentId, dev: true })
              });
              
              const checkResult = await checkResponse.json();
              
              if (checkResult.ok && checkResult.data?.credited) {
                // Track successful payment
                track('purchase_success', {
                  packId: pack.id,
                  amount: pack.amount,
                  stars: pack.stars,
                  balance: checkResult.data.balance
                });
                
                toast.success(`✅ Оплата успешна! +${pack.amount}💎`, { duration: 4000 });
                
                // Reload balance
                setTimeout(() => window.location.reload(), 2000);
              }
            } catch (e) {
              console.error('Payment check error:', e);
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Ошибка покупки:', error);
      toast.error('Не удалось создать инвойс');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '100vh',
      paddingBottom: '100px',
      background: '#0b0b10'
    }}>
      <Toaster position="top-center" />
      
      {/* Header с балансом */}
      <div style={{
        marginBottom: '24px',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#fff',
            margin: 0
          }}>
            Магазин
          </h1>
          
          {/* Баланс */}
          <div style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🍑</span>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#fff'
            }}>
              {userBalance}
            </span>
          </div>
        </div>
        
        <p style={{
          fontSize: '1rem',
          color: '#9ca3af',
          margin: 0
        }}>
          Пополните баланс PeachPoints для общения с персонажами
        </p>
      </div>

      {/* Карточки пакетов */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        maxWidth: '1200px'
      }}>
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            style={{
              background: '#1a1a1f',
              borderRadius: '20px',
              padding: '24px',
              border: '2px solid #2a2a2f',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#8b5cf6';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2f';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Badge */}
            {pkg.badge && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '4px 12px',
                background: '#ef4444',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#fff'
              }}>
                {pkg.badge}
              </div>
            )}

            {/* Icon */}
            <div style={{
              fontSize: '3rem',
              marginBottom: '16px'
            }}>
              {pkg.icon}
            </div>

            {/* Points */}
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '4px'
            }}>
              {pkg.points} <span style={{ fontSize: '1.2rem', color: '#9ca3af' }}>🍑</span>
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '0.9rem',
              color: '#9ca3af',
              marginBottom: '16px'
            }}>
              {pkg.description}
            </p>

            {/* Price */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#8b5cf6'
              }}>
                {pkg.price}
              </span>
              <span style={{
                fontSize: '1.2rem'
              }}>
                ⭐
              </span>
              <span style={{
                fontSize: '0.85rem',
                color: '#6b7280'
              }}>
                Telegram Stars
              </span>
            </div>

            {/* Button */}
            <button
              onClick={() => handlePurchase(pkg)}
              disabled={purchasing === pkg.id}
              style={{
                width: '100%',
                padding: '14px',
                background: purchasing === pkg.id 
                  ? '#6b7280'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: purchasing === pkg.id ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: purchasing === pkg.id 
                  ? 'none'
                  : '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}
            >
              {purchasing === pkg.id ? '⏳ Обработка...' : '⭐ Купить через Stars'}
            </button>
          </div>
        ))}
      </div>

      {/* Info блок */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: '#1a1a1f',
        borderRadius: '16px',
        border: '1px solid #2a2a2f'
      }}>
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          color: '#fff',
          marginBottom: '12px'
        }}>
          💡 Что такое PeachPoints?
        </h3>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          color: '#9ca3af',
          fontSize: '0.95rem',
          lineHeight: '1.8'
        }}>
          <li>🍑 Используйте для общения с персонажами</li>
          <li>💬 1 сообщение = 10 PeachPoints</li>
          <li>🎁 Получайте бонусы за активность</li>
          <li>⭐ Оплата через Telegram Stars</li>
        </ul>
      </div>

      {/* Premium блок */}
      <div style={{
        marginTop: '24px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.1) 100%)',
        borderRadius: '16px',
        border: '2px solid rgba(139, 92, 246, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💎</div>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '8px'
        }}>
          Premium подписка
        </h3>
        <p style={{
          fontSize: '1rem',
          color: '#9ca3af',
          marginBottom: '16px'
        }}>
          Безлимитное общение + эксклюзивные персонажи
        </p>
        <button
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
          }}
          onClick={() => toast('Premium подписка скоро будет доступна!', {
            icon: '💎',
            style: {
              background: '#1a1a1f',
              color: '#fff',
              borderRadius: '12px'
            }
          })}
        >
          Узнать больше
        </button>
      </div>
    </div>
  );
}
