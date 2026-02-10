import { useState, useEffect } from 'react';
import './Profile.css';

function Profile({ userRole, authFetch }) {
  const [userData, setUserData] = useState({
    name: 'SpeedRunner_X',
    email: 'speedrunner@example.com',
    time: '2024-01-15',
    accessRole : "user",
    id : -1,
    totalRuns: 0,
    verifiedRuns: 0,
    bestTime: 'N/A'
  });
  const [speedruns, setSpeedruns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfileAndSpeedruns = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const profileResponse = await authFetch('http://localhost:3001/user/profile/');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserData(profileData);
        } else {
          console.log('Error fetching profile');
        }

        // Fetch user speedruns
        const speedrunsResponse = await authFetch('http://localhost:3001/speedrun/all_user/');
        if (speedrunsResponse.ok) {
          const speedrunsData = await speedrunsResponse.json();
          setSpeedruns(speedrunsData);

          // Calculate stats from speedruns
          const totalRuns = speedrunsData.length;
          const verifiedRuns = speedrunsData.filter(run => run.status === 'verified').length;
          
          // Find best time (assuming time is in milliseconds or a numeric value)
          let bestTime = 'N/A';
          if (speedrunsData.length > 0) {
            const times = speedrunsData
              .filter(run => run.time)
              .map(run => {
                // If time is a timestamp, convert to duration
                if (typeof run.time === 'string') {
                  return new Date(run.time).getTime();
                }
                return run.time;
              });
            
            if (times.length > 0) {
              const minTime = Math.min(...times);
              // Format as HH:MM:SS if it's milliseconds
              const seconds = Math.floor(minTime / 1000);
              const hours = Math.floor(seconds / 3600);
              const minutes = Math.floor((seconds % 3600) / 60);
              const secs = seconds % 60;
              bestTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
          }

          setUserData(prev => ({
            ...prev,
            totalRuns,
            verifiedRuns,
            bestTime
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSpeedruns();
  }, []);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {userData.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <div className="profile-name">
            <h1>{userData.name}</h1>
            <p className="email">{userData.email}</p>
            <p className="role-tag">Role: <strong>{userRole}</strong></p>
          </div>

          <div className="profile-qr">
              <span><strong>Share your profile</strong></span><br/>
              {/* <code className="hash">{securityData.encodedID}</code> */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${`http://localhost:5173/users/` + userData.id.toString()}`}
                alt="Profile QR"
                className="qr-code"
              />
          </div>
        </div>

      </div>
      {userRole === "user" && (
        <>
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-content">
              <h3>{userData.totalRuns}</h3>
              <p>Total Runs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <h3>{userData.verifiedRuns}</h3>
              <p>Verified Runs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{userData.bestTime}</h3>
              <p>Best Time</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{new Date(userData.time).toLocaleDateString()}</h3>
              <p>Member Since</p>
            </div>
          </div>
        </div>

        <div className="speedruns-section">
          <h2>Your Speed Runs</h2>
          {speedruns.length === 0 ? (
            <p className="no-speedruns">No speed runs yet. Submit your first run!</p>
          ) : (
            <div className="speedruns-table">
              <table>
                <thead>
                  <tr>
                    <th>Game Title</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {speedruns.map((run) => (
                    <tr key={run.id}>
                      <td>{run.gameTitle}</td>
                      <td>{run.time ? new Date(run.time).toLocaleTimeString() : 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${run.status}`}>
                          {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                        </span>
                      </td>
                      <td>{run.time ? (() => { const d = new Date(run.time); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`; })() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div></>)
      }
    </div>
  );
}

export default Profile;