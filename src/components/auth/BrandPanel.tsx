import { Car, Users, TrendingUp, Zap, Sparkles, Rocket, Crown } from "lucide-react";

interface BrandPanelProps {
  organizationInfo?: any;
  roleIcon?: React.ReactNode;
  roleColor?: string;
  roleName?: string;
  roleDescription?: string;
}

export default function BrandPanel({ 
  organizationInfo,
  roleIcon,
  roleColor = "from-purple-500 to-indigo-600",
  roleName = "Professional",
  roleDescription = "Access your dashboard and manage your business efficiently."
}: BrandPanelProps = {}) {
  return (
    <div style={{
      width: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2rem',
      color: 'white',
      height: '100vh'
    }} className="hidden lg:flex">
      
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
        `,
        animation: 'rotate 20s linear infinite',
        zIndex: 1
      }}></div>

      {/* Floating Geometric Shapes */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '60px',
        height: '60px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        transform: 'rotate(45deg)',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 2
      }}></div>

      <div style={{
        position: 'absolute',
        top: '70%',
        right: '15%',
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 2
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '30%',
        left: '20%',
        width: '30px',
        height: '30px',
        background: 'rgba(255, 255, 255, 0.12)',
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        animation: 'float 7s ease-in-out infinite',
        zIndex: 2
      }}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            marginRight: '0.75rem'
          }}>
            <Car style={{
              width: '2.5rem',
              height: '2.5rem',
              color: 'white',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
            }} />
            <Sparkles style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '1rem',
              height: '1rem',
              color: '#fbbf24',
              animation: 'pulse 2s infinite'
            }} />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: 'white',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.5px'
          }}>
            Ghost Auto CRM
          </h1>
        </div>
        
        <div>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            lineHeight: '1.2',
            color: 'white',
            marginBottom: '1.5rem',
            textShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            Transform Your Automotive Sales with
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #fb7185 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginTop: '0.5rem',
              position: 'relative'
            }} className="animate-gradient-x">
              Intelligent CRM
              <Crown style={{
                position: 'absolute',
                top: '-12px',
                right: '-40px',
                width: '1.5rem',
                height: '1.5rem',
                color: '#fbbf24',
                animation: 'bounce 2s infinite'
              }} />
            </span>
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.6',
            marginBottom: '2rem',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            fontWeight: '400'
          }}>
            Streamline your dealership operations, boost sales, and deliver exceptional customer experiences with our comprehensive automotive CRM platform.
          </p>

          <div style={{
            display: 'grid',
            gap: '1.25rem',
            marginTop: '2rem'
          }}>
            {[
              {
                icon: Users,
                title: "Lead Management",
                desc: "Capture, qualify, and convert leads with intelligent automation",
                color: "#3b82f6",
                delay: "0s"
              },
              {
                icon: TrendingUp,
                title: "Sales Analytics",
                desc: "Real-time insights and performance tracking",
                color: "#8b5cf6",
                delay: "0.2s"
              },
              {
                icon: Zap,
                title: "Workflow Automation",
                desc: "Automate follow-ups, tasks, and customer communications",
                color: "#ec4899",
                delay: "0.4s"
              }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                animation: `slideInLeft 0.8s ease-out ${feature.delay} both`,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  background: `linear-gradient(135deg, ${feature.color}, ${feature.color}95)`,
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: `0 8px 20px ${feature.color}40`
                }}>
                  <feature.icon style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.25rem',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role-Specific Section */}
        {roleIcon && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                background: `linear-gradient(135deg, ${roleColor?.split(' ')[1] || '#8b5cf6'}, ${roleColor?.split(' ')[3] || '#6366f1'})`,
                color: 'white',
                boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
              }}>
                {roleIcon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  {roleName}
                </h3>
                {organizationInfo && (
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    margin: '0.25rem 0 0 0'
                  }}>
                    {organizationInfo.name}
                  </p>
                )}
              </div>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.95rem',
              lineHeight: '1.4',
              margin: 0
            }}>
              {roleDescription}
            </p>
          </div>
        )}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          © 2025 Ghost Auto CRM. Empowering automotive excellence.
        </p>
        <Rocket style={{
          width: '1.5rem',
          height: '1.5rem',
          color: 'rgba(255, 255, 255, 0.6)',
          animation: 'pulse 2s infinite'
        }} />
      </div>
    </div>
  );
}