import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './AuthForm.css';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { registerUser, verifyAndLogin } = useApp();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await registerUser(username, name, password);
      // Registration info sent, backend emailed OTP
      setStep(2);
    } catch (err) {
      setError('Registration failed. Username may already be taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await verifyAndLogin(username, name, password, otp);
      navigate('/');
    } catch (err) {
      setError('Invalid OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <h2 className="auth-title">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h2>
        <p className="auth-subtitle">
          {step === 1 
            ? 'Sign up to start splitting expenses easily' 
            : `We sent a code to ${username}`
          }
        </p>
        
        {error && <div className="auth-error">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Rohan Gupta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Username (Email)</label>
              <input 
                type="text" 
                placeholder="rohan@ezsplit.app"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block auth-btn"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Sending Code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label>Verification Code (OTP)</label>
              <input 
                type="text" 
                placeholder="Enter the 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block auth-btn"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Log In'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block auth-btn"
              onClick={() => setStep(1)}
              style={{ marginTop: '8px' }}
              disabled={isSubmitting}
            >
              Back
            </button>
          </form>
        )}
        
        {step === 1 && (
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
