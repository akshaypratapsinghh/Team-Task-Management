import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { getAuth, clearAuth } from '../auth';

export default function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await api.get(`/projects/${projectId}`);
        setProject(response.data.project);
        setTasks(response.data.tasks || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load project');
      }
    }
    loadProject();
  }, [projectId]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post(`/tasks/project/${projectId}`, { title, description, dueDate, assigneeEmail });
      setTasks((prev) => [response.data.task, ...prev]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create task');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? response.data.task : task)));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update task');
    }
  };

  if (!project) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <nav className="topbar">
        <div className="profile-chip">
          <span className="avatar-circle">{auth.user.name?.charAt(0).toUpperCase()}</span>
          <div className="profile-info">
            <strong>{auth.user.name}</strong>
            <span>{auth.user.email}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button secondary" type="button" onClick={() => navigate('/')}>Back</button>
          <button className="button secondary" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="project-card project-header">
        <div>
          <h2 className="page-title">{project.name}</h2>
          <p>{project.description || 'No description provided'}</p>
        </div>
        <div>
          <p><strong>Team members</strong></p>
          <p>{project.memberIds?.length || 0}</p>
          <p style={{ marginTop: 12 }}><strong>Owner</strong></p>
          <p>{auth.user.name}</p>
        </div>
      </div>

      {auth.user.role === 'admin' && (
        <div className="form-card">
          <h3>Create task</h3>
          <form onSubmit={handleCreateTask}>
            <div className="input-group"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="input-group"><label>Description</label><textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="input-group"><label>Due date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            <div className="input-group"><label>Assignee email</label><input value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)} /></div>
            <button className="button" type="submit">Create task</button>
          </form>
        </div>
      )}

      <section>
        <div className="section-header">
          <h2>Tasks</h2>
        </div>

        {error && <p className="form-error">{error}</p>}

        {tasks.length === 0 ? (
          <div className="card">
            <p>No tasks yet for this project.</p>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => {
              const due = task.dueDate ? new Date(task.dueDate) : null;
              const overdue = due && new Date() > due && task.status !== 'done';
              return (
                <div key={task.id} className="task-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
                    <div>
                      <h4>{task.title}</h4>
                      <p>{task.description || 'No details'}</p>
                      <p><strong>Assignee:</strong> {task.assignee?.name || 'Unassigned'}</p>
                      <p><strong>Status:</strong> {task.status}</p>
                      {due && <p><strong>Due:</strong> {due.toLocaleDateString()}</p>}
                      {overdue && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Overdue</span>}
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <button className="button secondary" type="button" onClick={() => updateTaskStatus(task.id, 'todo')}>Todo</button>
                      <button className="button secondary" type="button" onClick={() => updateTaskStatus(task.id, 'in-progress')}>In progress</button>
                      <button className="button secondary" type="button" onClick={() => updateTaskStatus(task.id, 'done')}>Done</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
