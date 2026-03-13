import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './AddPayment.css';

export default function AddPayment() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'cash';

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [gatewayStep, setGatewayStep] = useState(mode === 'online' ? 'input' : null);

  const handleProceed = () => {
    if (!amount || Number(amount) <= 0) return;

    if (mode === 'online' && gatewayStep === 'input') {
      // Simulate payment gateway
      setGatewayStep('processing');
      setTimeout(() => {
        setGatewayStep('done');
      }, 2000);
      return;
    }

    // Navigate to split page
    navigate(`/group/${groupId}/split`, {
      state: { amount: Number(amount), description, mode },
    });
  };

  const handleGatewayDone = () => {
    navigate(`/group/${groupId}/split`, {
      state: { amount: Number(amount), description, mode },
    });
  };

  return (
    <div className="page">
      <Navbar showBack backTo={`/group/${groupId}`} />

      <div className="add-payment-page">
        <div className="payment-mode-badge">
          <span className={`badge ${mode === 'cash' ? 'badge-green' : 'badge-red'}`}>
            {mode === 'cash' ? '💵 Cash Payment' : '💳 Online Payment'}
          </span>
        </div>

        {/* Step 1: Gateway processing (online only) */}
        {mode === 'online' && gatewayStep === 'processing' && (
          <div className="glass-card gateway-card">
            <div className="gateway-card-title">Processing Payment</div>
            <div className="gateway-card-amount">₹{Number(amount).toLocaleString()}</div>
            <div className="gateway-progress">
              <div className="gateway-progress-bar" />
            </div>
            <div className="gateway-card-info">
              Simulating payment gateway... Please wait.
            </div>
          </div>
        )}

        {/* Step 2: Gateway done (online only) */}
        {mode === 'online' && gatewayStep === 'done' && (
          <div className="glass-card gateway-card">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <div className="gateway-card-title">Payment Successful!</div>
            <div className="gateway-card-amount">₹{Number(amount).toLocaleString()}</div>
            <div className="gateway-card-info">
              Your online payment has been processed.
            </div>
            <button className="btn btn-primary btn-block" onClick={handleGatewayDone}>
              Continue to Split →
            </button>
          </div>
        )}

        {/* Amount input (cash always, online in input step) */}
        {(mode === 'cash' || gatewayStep === 'input') && (
          <>
            <div className="payment-amount-display">
              ₹{amount ? Number(amount).toLocaleString() : '0'}
            </div>
            <div className="payment-amount-label">Enter the total amount</div>

            <div className="payment-input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                className="payment-amount-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            <input
              className="input-field payment-desc-input"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="payment-footer">
              <button
                className="btn btn-primary btn-block"
                disabled={!amount || Number(amount) <= 0}
                onClick={handleProceed}
                style={{ opacity: amount && Number(amount) > 0 ? 1 : 0.5 }}
              >
                {mode === 'online' ? 'Pay Now' : 'Continue to Split →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
