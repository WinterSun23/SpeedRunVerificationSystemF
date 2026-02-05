import { useState } from 'react';
import CryptoJS from 'crypto-js';
import { KJUR } from 'jsrsasign';
import forge from 'node-forge';
// import './SubmitRun.css';

function SubmitRun({ submittedRuns, setSubmittedRuns, systemKeys, authFetch }) {
  const [formData, setFormData] = useState({ 
    game: 'Minecraft', 
    time: '', 
    strategy: '' 
  });
  const [securityData, setSecurityData] = useState(null);
  const user_id = 'usr_01'; // This should come from auth context

  const handleCalculateSecurity = () => {
    if (!formData.time || !formData.strategy) {
      alert('Please fill in all fields');
      return;
    }

    const rawData = formData.time;
    const timeHash = CryptoJS.SHA256(rawData).toString();

    // Public key in PEM format
    const publicKeyPem = systemKeys.encryptionKey;

    try {
      // Encrypt the strategy using the public key
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encryptedStrategy = forge.util.encode64(
        publicKey.encrypt(formData.strategy, 'RSA-OAEP')
      );
      // console.log(encryptedStrategy.length)

      setSecurityData({
        timeHash,
        encryptedStrategy,
      });
    } catch (error) {
      console.error('Encryption error:', error);
      alert('Failed to encrypt the strategy. Please try again.');
    }
  };

  const handleSubmitRun = async () => {
    if (!securityData) return;

    const newRun = {
      gameTitle: formData.game,
      integrityHash: securityData.timeHash,
      encryptedStrategy: securityData.encryptedStrategy,
      status: 'Pending'
    };

    try {
      // Post to backend
      const response = await authFetch('http://localhost:3001/speedrun/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRun)
      });

      if (response.ok) {
        setSubmittedRuns([...submittedRuns, newRun]);
        alert("Run Submitted securely!");
        setFormData({ game: 'Minecraft', time: '', strategy: '' });
        setSecurityData(null);
      }
    } catch (error) {
      console.error('Error submitting run:', error);
    }
  };

  return (
    <div className="submit-run-container">
      <div className="role-panel user-panel">
        <h2>🎮 Runner Submission Portal</h2>
        <div className="security-form">
          <div className="form-group">
            <label>Game Category</label>
            <select 
              value={formData.game} 
              onChange={e => setFormData({...formData, game: e.target.value})}
            >
              <option>Super Mario 64</option>
              <option>The Legend of Zelda: OoT</option>
              <option>Portal</option>
              <option>Minecraft</option>
            </select>
          </div>

          <div className="form-group">
            <label>Final Time (MM:SS)</label>
            <input
              type="text"
              placeholder="16:40"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Strategy Notes (Will be Encrypted)</label>
            <textarea
              placeholder="Explain your glitches and routing here..."
              value={formData.strategy}
              onChange={e => setFormData({...formData, strategy: e.target.value})}
              rows={5}
            />
          </div>

          <button className="action-btn" onClick={handleCalculateSecurity}>
            🔒 Generate Security Proofs
          </button>

          {securityData && (
            <div className="security-output">
              <h3>Security Proofs Generated</h3>
              
              <div className="proof-item">
                <span className="label">🔐 SHA-256 Integrity Hash:</span>
                <code className="hash">{securityData.timeHash.substring(0, 30)}...</code>
                <p className="help-text">Ensures your time cannot be tampered with</p>
              </div>

              <div className="proof-item">
                <span className="label">🔑 AES Encrypted Payload:</span>
                <code className="hash">{securityData.encryptedStrategy.substring(0, 30)}...</code>
                <p className="help-text">Only admins can decrypt your strategy</p>
              </div>

              <button className="submit-btn" onClick={handleSubmitRun}>
                Submit Securely
              </button>
            </div>
          )}
        </div>

        {/* <div className="my-submissions">
          <h3>My Recent Submissions</h3>
          {submittedRuns.length === 0 ? (
            <p className="empty-state">No submissions yet. Submit your first speedrun!</p>
          ) : (
            <div className="submissions-list">
              {submittedRuns.slice(-3).reverse().map(run => (
                <div key={run.id} className="submission-card">
                  <div className="submission-header">
                    <strong>{run.game}</strong>
                    <span className={`status-badge ${run.status.toLowerCase()}`}>
                      {run.status}
                    </span>
                  </div>
                  <div className="submission-details">
                    <span>Time: {run.time}</span>
                    <span>Submitted: {new Date(run.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default SubmitRun;