import { use, useEffect, useState } from 'react';
import Navbar from './components/navbar/Navbar';
import Profile from './components/profile/Profile';
import SubmitRun from './components/SubmitRun';
import AllSpeedruns from './AllSpeedRuns';
import UserManagement from './UserManagement';
import SystemAdmin from './SystemAdmin';

import CryptoJS from 'crypto-js';
// import './SpeedrunDashboard.css';

function SpeedrunDashboard({id, authFetch, onLogout, userRole: initialUserRole = 'user' }) {
  const [currentView, setCurrentView] = useState('profile');
  const [submittedRuns, setSubmittedRuns] = useState([]);
  const [systemKeys, setSystemKeys] = useState({
    encryptionKey: '',
    adminSigningKey: ''
  });
  const [userRole, setUserRole] = useState(initialUserRole);

  useEffect(() => {
    const getRole = async () => {
      try {
        const response = await authFetch('http://localhost:3001/user/get_role');
        if (response.ok) {
          const data = await response.json();
          if (data && data.role) {
            setUserRole(data.role);
          }
        } else {
          console.error('Failed to fetch user role');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchEncryptedSystemKeys = async () => {
      try {
        const response = await authFetch('http://localhost:3001/system/encrypted_key');
        if (response.ok) {
          const data = await response.json();
          const decryptedKey = decryptSymmetricKey(data.encryptedKey);
          setSystemKeys({ encryptionKey: decryptedKey });
        }
      } catch (error) {
        console.error('Error fetching encrypted system keys:', error);
        setSystemKeys({ encryptionKey: '' });
      }
    };

    getRole();
    fetchEncryptedSystemKeys();
    //get other info from db if needed
  }, [authFetch]);

  const decryptSymmetricKey = (encryptedKey) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedKey, "sym_key");
      // console.log(bytes.toString(CryptoJS.enc.Utf8));
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting symmetric key:', error);
      return '';
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { id: 'profile', label: 'Profile', icon: '👤' },
    ];

    if (userRole === 'user') {
      return [
        ...baseItems,
        { id: 'submit', label: 'Submit Run', icon: '🎮' }
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { id: 'all-runs', label: 'All Speedruns', icon: '📊' },
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'system', label: 'System Admin', icon: '⚙️' }
      ];
    }

    if (userRole === 'maintainer') {
      return [
        ...baseItems,
        { id: 'verify', label: 'Verify Runs', icon: '✓' },
      ];
    }

    return baseItems;
  };

  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return <Profile userRole={userRole} authFetch={authFetch} />;
      
      case 'submit':
        return (
          <SubmitRun 
            submittedRuns={submittedRuns}
            setSubmittedRuns={setSubmittedRuns}
            systemKeys={systemKeys}
            authFetch={authFetch}
          />
        );
      
      case 'verify':
        return (
          <AllSpeedruns
            verify = {true}
            submittedRuns={submittedRuns}
            authFetch={authFetch}
            encryptionKey = {systemKeys.encryptionKey}
          />
        );
      
      case 'all-runs':
        return (
          <AllSpeedruns
            verify = {false}
            submittedRuns={submittedRuns}
            authFetch={authFetch}
            encryptionKey = {systemKeys.encryptionKey}
          />
        );
      
      case 'users':
        return <UserManagement id={id} authFetch={authFetch} />;
      
      case 'system':
        return (
          <SystemAdmin 
            systemKeys={systemKeys}
            setSystemKeys={setSystemKeys}
            authFetch={authFetch}
          />
        );
      
      default:
        return <Profile userRole={userRole} authFetch={authFetch} />;
    }
  };

  return (
    <div className="speedrun-dashboard">
      <Navbar 
        navItems={getNavItems()}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={onLogout}
        userRole={userRole}
      />
      <div className="dashboard-content">
        {renderView()}
      </div>
    </div>
  );
}

export default SpeedrunDashboard;