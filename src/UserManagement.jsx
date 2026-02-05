import { useState, useEffect } from 'react';
// import './UserManagement.css';

function UserManagement({id, authFetch }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // console.log("id", id)
    const fetchUsers = async () => {
      try {
        const response = await authFetch('http://localhost:3001/user/all');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Uncomment when API is ready
    fetchUsers();
  }, [authFetch]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return (user.id != id) && matchesSearch && ((filterRole === 'all') || (user.accessRole === filterRole));
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authFetch(`http://localhost:3001/user/change_role/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await authFetch(`http://localhost:3001/user/${userId}`, {
        method: 'DELETE'
      });

      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h2>👥 User Management</h2>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <label>Filter by Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
            <option value="maintainer">Maintainers</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={user.status}>
                <td className="username-cell">
                  <strong>{user.name}</strong>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.accessRole}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`role-select ${user.accessRole}`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="maintainer">Maintainer</option>
                  </select>
                </td>
                <td>{new Date(user.time).toUTCString()}</td>
                <td className="actions-cell">
                  <button
                    className={`action-btn ${user.status === 'active' ? 'suspend' : 'activate'}`}
                    onClick={() => handleStatusToggle(user.id)}
                  >
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;