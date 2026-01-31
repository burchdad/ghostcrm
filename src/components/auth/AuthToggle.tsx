interface AuthToggleProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export default function AuthToggle({ isLogin, onToggle }: AuthToggleProps) {
  return (
    <div style={{
      display: 'flex',
      marginBottom: '2rem',
      background: 'rgba(243, 244, 246, 0.5)',
      borderRadius: '1rem',
      padding: '0.25rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sliding background indicator */}
      <div style={{
        position: 'absolute',
        top: '0.25rem',
        left: isLogin ? '0.25rem' : '50%',
        width: 'calc(50% - 0.25rem)',
        height: 'calc(100% - 0.5rem)',
        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        borderRadius: '0.75rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
      }}></div>

      <button
        type="button"
        onClick={() => onToggle(true)}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10,
          color: isLogin ? '#ffffff' : '#6b7280'
        }}
        onMouseEnter={(e) => {
          if (!isLogin) {
            e.currentTarget.style.color = '#374151'
          }
        }}
        onMouseLeave={(e) => {
          if (!isLogin) {
            e.currentTarget.style.color = '#6b7280'
          }
        }}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onToggle(false)}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10,
          color: !isLogin ? '#ffffff' : '#6b7280'
        }}
        onMouseEnter={(e) => {
          if (isLogin) {
            e.currentTarget.style.color = '#374151'
          }
        }}
        onMouseLeave={(e) => {
          if (isLogin) {
            e.currentTarget.style.color = '#6b7280'
          }
        }}
      >
        Sign Up
      </button>
    </div>
  );
}