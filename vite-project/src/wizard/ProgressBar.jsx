export default function ProgressBar({ step }) {
    const total = 6;
    return (
      <div style={{ display:'flex', gap:4, justifyContent:'center', margin:'24px 0' }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i}
               style={{
                 flex:1, maxWidth:40, height:6,
                 borderRadius:3,
                 background: i < step ? '#ff2dc6' : '#e2e2e2',
                 transition:'background .3s'
               }}/>
        ))}
      </div>
    );
  }
  