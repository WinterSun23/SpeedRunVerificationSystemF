import { useState } from 'react';
// import './SystemAdmin.css';

function SystemAdmin({ systemKeys, setSystemKeys, authFetch }) {
  const [keyRotationLog, setKeyRotationLog] = useState([
    { timestamp: '2024-01-20 14:30', action: 'Key Rotation', oldKey: 'key-v123', newKey: 'key-v456' }
  ]);

  const handleRotateKeys = async () => {
    const oldKey = systemKeys.encryptionKey;

    try {
      const {newKey} = await authFetch('http://localhost:3001/system/rotate_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // setSystemKeys({ ...systemKeys, encryptionKey: newKey });
      window.location.reload();

      alert(`✅ System Keys Rotated Successfully!\n\nNew AES Key\n\n⚠️ Warning: Previous encrypted data will need re-encryption.`);
    } catch (error) {
      console.error('Error rotating keys:', error);
      alert('Failed to rotate keys. Please try again.');
    }
  };

  const handleBackupDatabase = () => {
    alert('🔄 Database backup initiated...\n\nThis would trigger a full system backup in production.');
  };

  const handleClearCache = () => {
    alert('🗑️ System cache cleared successfully!');
  };

  return (
    <div className="system-admin-container">
      <div className="role-panel maintainer-panel">
        <h2>⚙️ System Security Administration</h2>

        <div className="security-module acl-module">
          <h3>1. Access Control Matrix (ACL)</h3>
          <p className="module-description">
            Defines what actions each role can perform on system resources
          </p>
          <table className="acl-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Speedruns</th>
                <th>Users</th>
                <th>System Keys</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="role-cell">
                  <span className="role-badge user">User</span>
                </td>
                <td className="allow">✓ Create, Read (Own)</td>
                <td className="deny">✗ None</td>
                <td className="deny">✗ None</td>
              </tr>
              <tr>
                <td className="role-cell">
                  <span className="role-badge maintainer">Maintainer</span>
                </td>
                <td className="allow">✓ Read, Update, Verify</td>
                <td className="allow">✗ None</td>
                <td className="deny">✗ None</td>
              </tr>
              <tr>
                <td className="role-cell">
                  <span className="role-badge admin">Admin</span>
                </td>
                <td className="allow">✓ Read</td>
                <td className="allow">✓ Full Access</td>
                <td className="allow">✓ Rotate, Manage</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="security-module kms-module">
          <h3>2. Key Management System (KMS)</h3>
          <p className="module-description">
            Manage encryption keys for data confidentiality
          </p>
          
          <div className="key-display">
            <div className="key-item">
              <label>Current AES Encryption Key:</label>
              <code className="key-value">{systemKeys.encryptionKey.slice(0, 40)}...</code>
            </div>
            <div className="key-item">
              <label>Admin Signing Key:</label>
              <code className="key-value">{systemKeys.adminSigningKey}</code>
            </div>
          </div>

          <div className="key-actions">
            <button className="danger-btn" onClick={handleRotateKeys}>
              🔄 Rotate Encryption Keys
            </button>
            <p className="warning-text">
              ⚠️ Warning: Rotating keys will make previously encrypted data unreadable without re-encryption.
            </p>
          </div>

          {/* <div className="key-rotation-log">
            <h4>Key Rotation History</h4>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Old Key</th>
                  <th>New Key</th>
                </tr>
              </thead>
              <tbody>
                {keyRotationLog.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.timestamp}</td>
                    <td>{log.action}</td>
                    <td><code>{log.oldKey}</code></td>
                    <td><code>{log.newKey}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </div>

        <div className="security-module audit-module">
          <h3>4. Security Best Practices</h3>
          <div className="best-practices">
            <div className="practice-item">
              <span className="practice-icon">🔐</span>
              <div>
                <strong>Encryption:</strong> All sensitive data is encrypted using AES-256
              </div>
            </div>
            <div className="practice-item">
              <span className="practice-icon">🔑</span>
              <div>
                <strong>Hashing:</strong> SHA-256 for integrity verification
              </div>
            </div>
            <div className="practice-item">
              <span className="practice-icon">✍️</span>
              <div>
                <strong>Digital Signatures:</strong> Cryptographic signing for approval workflows
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemAdmin;