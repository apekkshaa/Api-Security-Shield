import React from 'react';
import Sidebar from './Sidebar';

function SettingsPage() {
    return (
        <div className="settings-page-container">
            <Sidebar />
            <div className="settings-page">
                <h2>Settings</h2>
                <div className="settings-sections">

                    <div className="section-user user-profiles">
                        <h3>User Profiles</h3>
                        <button>Add New User</button>
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>admin</td>
                                    <td>Administrator</td>
                                    <td>
                                        <button>Edit</button>
                                        <button>Remove</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>john_doe</td>
                                    <td>User</td>
                                    <td>
                                        <button>Edit</button>
                                        <button>Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="section-api api-key-management">
                        <h3>API Key Management</h3>
                        <button>Add New API Key</button>
                        <table className="api-key-table">
                            <thead>
                                <tr>
                                    <th>Service Name</th>
                                    <th>API Key</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Service 1</td>
                                    <td>************</td>
                                    <td>
                                        <button>Edit</button>
                                        <button>Remove</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Service 2</td>
                                    <td>************</td>
                                    <td>
                                        <button>Edit</button>
                                        <button>Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="section-auth security-settings">
                        <h3>Security Settings</h3>
                        <form>
                            <div>
                                <label>Authentication Method:</label>
                                <select>
                                    <option value="basic-auth">Basic Authentication</option>
                                    <option value="oauth">OAuth</option>
                                    <option value="jwt">JWT</option>
                                </select>
                            </div>
                            <div>
                                <label>Two-Factor Authentication:</label>
                                <input type="checkbox" />
                            </div>
                            <button type="submit">Save Settings</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
