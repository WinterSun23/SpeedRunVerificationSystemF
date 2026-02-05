import { useState, useEffect } from 'react';
import forge from 'node-forge';

function AllSpeedruns({ verify, authFetch, encryptionKey }) {
  const [runs, setRuns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [modalRun, setModalRun] = useState(null);

  useEffect(() => {
    const fetchAllSpeedruns = async () => {
      try {
        const response = await authFetch('http://localhost:3001/speedrun/all');
        if (response.ok) {
          const data = await response.json();
          setRuns(data);
        } else {
          setRuns([]);
        }
      } catch (error) {
        setRuns([]);
      }
    };

    fetchAllSpeedruns();
  }, [modalRun, authFetch]);

  const decryptStrategy = (encrypted, key) => {
    try {
      // console.log("Encrypted data:", encrypted, key);

      // Sanitize the PEM key
      const sanitizedKey = key
        .replace(/\n/g, '\n')
        .replace(/\r/g, '')
        .trim();

      // Convert PEM to private key
      const privateKey = forge.pki.privateKeyFromPem(sanitizedKey);

      // Decrypt the encrypted data
      const decrypted = privateKey.decrypt(
        forge.util.decode64(encrypted),
        'RSA-OAEP'
      );

      // console.log("Decrypted strategy:", decrypted);
      return decrypted;
    } catch (err) {
      console.error("Decryption error:", err);
      return '[Unable to decrypt]';
    }
  };

  useEffect(() => {
    const fetchAllSpeedruns = async () => {
      try {
        const response = await authFetch('http://localhost:3001/speedrun/all');
        if (response.ok) {
          const data = await response.json();
          setRuns(data);
        } else {
          setRuns([]);
        }
      } catch (error) {
        setRuns([]);
      }
    };

    fetchAllSpeedruns();
  }, [authFetch]);

  const filteredAndSortedRuns = runs
    .filter((run) => run.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.time) - new Date(a.time);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  const getStatusStats = () => {
    const stats = {
      total: runs.length,
      verified: runs.filter((r) => r.status === 'verified').length,
      pending: runs.filter((r) => r.status === 'pending').length,
      rejected: runs.filter((r) => r.status === 'rejected').length,
    };
    return stats;
  };

  const handleVerification = async (id, valid) => {
    try{
      const res = await authFetch(`http://localhost:3001/speedrun/${id}/${(valid ? "accept" : "deny")}`);
      if(!res.ok){
        console.log("nope");
      }
      setModalRun(null);
    }
    catch (error) {
      setModalRun(null);
    }
  }

  const stats = getStatusStats();

  return (
    <div className="all-speedruns-container">
      <div className="speedruns-header">
        <h2>📊 All Speedruns</h2>

        <div className="stats-overview">
          <div className="stat-box">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-box verified">
            <span className="stat-number">{stats.verified}</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-box pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-box rejected">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by game or runner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date (Newest First)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="speedruns-table-container">
        {filteredAndSortedRuns.length === 0 ? (
          <div className="empty-state">
            <p>No speedruns found matching your search.</p>
          </div>
        ) : (
          <table className="speedruns-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Runner</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRuns.map((run) => (
                <tr key={run.time} className={run.status.toLowerCase()}>
                  <td className="game-cell">
                    <strong>{run.gameTitle}</strong>
                  </td>
                  <td>{run.userId}</td>
                  <td>
                    <span className={`status-badge ${run.status.toLowerCase()}`}>
                      {run.status === 'Verified' && '✓ '}
                      {run.status === 'Pending' && '⏳ '}
                      {run.status === 'Rejected' && '❌ '}
                      {run.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(run.time).toLocaleDateString()}
                  </td>
                  {verify && run.status === 'pending' && (
                    <td>
                      <button onClick={() => setModalRun(run)} className="verify-btn">
                        Verify
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {modalRun && (
                <div className="modal-overlay" onClick={() => setModalRun(null)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Speedrun Details</h3>
                    <ul>
                      <li>
                        <strong>Game Title:</strong> {modalRun.gameTitle}
                      </li>
                      <li>
                        <strong>User ID:</strong> {modalRun.userId}
                      </li>
                      <li>
                        <strong>Status:</strong> {modalRun.status}
                      </li>
                      <li>
                        <strong>Time:</strong> {modalRun.time}
                      </li>
                      <li>
                        <strong>Integrity Hash:</strong> {modalRun.integrityHash}
                      </li>
                      <li>
                        <strong>Decrypted Strategy:</strong>{' '}
                        <code>
                          {decryptStrategy(modalRun.encryptedStrategy, encryptionKey)}
                        </code>
                      </li>
                    </ul>
                    <button onClick={() => handleVerification(modalRun.id, true)}>Accept</button>
                    <button onClick={() => handleVerification(modalRun.id, false)}>Deny</button>
                    <button onClick={() => setModalRun(null)}>Close</button>
                  </div>
                </div>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AllSpeedruns;