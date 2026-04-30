import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { getAuth, clearAuth } from '../auth';
import ProjectTaskMenu from '../components/ProjectTaskMenu';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data.projects))
      .catch(() => setError('Unable to load projects'));
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    try {
      const payload = { name, description, memberEmails: memberEmails.split(',').map((email) => email.trim()).filter(Boolean) };
      const response = await api.post('/projects', payload);
      setProjects((prev) => [response.data.project, ...prev]);
      setName('');
      setDescription('');
      setMemberEmails('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create project');
    }
  };

  return (
    <div className="container">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-name">Team Task Manager</span>
          <span className="badge">{auth.user.role}</span>
        </div>
        <div className="topbar-right">
          <div className="profile-chip">
            <span className="avatar-circle">{auth.user.name?.charAt(0).toUpperCase()}</span>
            <div className="profile-info">
              <strong>{auth.user.name}</strong>
              <span>{auth.user.email}</span>
            </div>
          </div>
          <button className="button secondary" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="card hero">
        <h1>Collaborate with your team</h1>
        <p>Manage projects, assign tasks, and track progress in one place.</p>
        <div className="stats">
          <div className="stat">
            Projects
            <strong>{projects.length}</strong>
          </div>
          <div className="stat">
            Role
            <strong>{auth.user.role}</strong>
          </div>
        </div>
      </div>

      {auth.user.role === 'admin' && (
        <div className="form-card">
          <h3>Create Project</h3>
          <form onSubmit={handleCreateProject}>
            <div className="input-group"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="input-group"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" /></div>
            <div className="input-group"><label>Team member emails</label><input value={memberEmails} onChange={(e) => setMemberEmails(e.target.value)} placeholder="email1@example.com, email2@example.com" /></div>
            <button className="button" type="submit">Save project</button>
          </form>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2>Projects</h2>
        </div>

        {error && <p className="form-error">{error}</p>}

        {projects.length === 0 ? (
          <div className="card">
            <p>No projects yet. Create one or join a team.</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || 'No description'}</p>
                    <p><strong>Members:</strong> {project.memberIds?.length || 0}</p>
                  </div>
                  <ProjectTaskMenu projectId={project.id} />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Link to={`/projects/${project.id}`}>Open project</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
