import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      title: "🍑 Peachmini — твой AI-компаньон",
      description: "Создавай уникальных персонажей, общайся с ними и развивай отношения. Твой личный AI-мир ждёт тебя!",
      icon: "🍑",
      gradient: "linear-gradient(135deg, #9c27b0 0%, #673ab7 50%, #2196f3 100%)"
    },
    {
      title: "🧬 Создай своего персонажа",
      description: "Всего за 2-3 фразы создай уникального AI-персонажа с индивидуальностью, характером и историей.",
      icon: "🧬",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #ff9ff3 100%)"
    },
    {
      title: "💎 Зарабатывай Stars и выполняй квесты",
      description: "Выполняй задания, зарабатывай Telegram Stars и открывай новые возможности для общения.",
      icon: "💎",
      gradient: "linear-gradient(135deg, #feca57 0%, #ff9ff3 50%, #54a0ff 100%)"
    }
  ];

  useEffect(() => {
    // Проверяем, проходил ли пользователь onboarding
    const onboardingDone = localStorage.getItem('onboarding_done');
    
    if (onboardingDone) {
      // Если уже проходил, перенаправляем на главную
      navigate('/');
      return;
    }

    // Показываем onboarding с анимацией
    setTimeout(() => setIsVisible(true), 100);

    // Telegram WebApp expand
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Сохраняем флаг завершения onboarding
    localStorage.setItem('onboarding_done', 'true');
    
    // Analytics событие
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.MainButton.setText('Начать');
      window.Telegram.WebApp.MainButton.onClick(() => {
        window.Telegram.WebApp.MainButton.hide();
        navigate('/');
      });
    }

    // Отправляем analytics событие
    if (window.posthog) {
      window.posthog.capture('onboarding_complete', {
        steps_completed: steps.length,
        completion_time: Date.now()
      });
    }

    // Плавный переход
    setIsVisible(false);
    setTimeout(() => navigate('/'), 300);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_done', 'true');
    setIsVisible(false);
    setTimeout(() => navigate('/'), 300);
  };

  if (!isVisible) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: currentStepData.gradient,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      zIndex: 9999,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {/* Progress dots */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 10000
      }}>
        {steps.map((_, index) => (
          <div
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: index === currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '40px',
          right: '20px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          zIndex: 10000
        }}
      >
        Пропустить
      </button>

      {/* Main content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '320px',
        width: '100%'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'bounce 2s infinite'
        }}>
          {currentStepData.icon}
        </div>

        {/* Title */}
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(24px, 6vw, 32px)',
          fontWeight: 'bold',
          marginBottom: '16px',
          lineHeight: 1.2,
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          {currentStepData.title}
        </h1>

        {/* Description */}
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: 'clamp(16px, 4vw, 18px)',
          lineHeight: 1.5,
          marginBottom: '40px',
          textShadow: '0 1px 5px rgba(0,0,0,0.2)'
        }}>
          {currentStepData.description}
        </p>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '16px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              Назад
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              background: '#fff',
              border: 'none',
              color: currentStepData.gradient.includes('#9c27b0') ? '#9c27b0' : 
                     currentStepData.gradient.includes('#ff6b6b') ? '#ff6b6b' : '#feca57',
              padding: '12px 32px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
