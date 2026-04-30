import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectTaskMenu({ projectId }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="task-menu">
      <button className="button" type="button" onClick={() => setOpen((prev) => !prev)}>
        Task menu
      </button>
      {open && (
        <div className="menu-dropdown">
          <button type="button" className="menu-item" onClick={() => handleNavigate(`/projects/${projectId}`)}>
            View task board
          </button>
          <button type="button" className="menu-item" onClick={() => handleNavigate(`/projects/${projectId}`)}>
            Manage tasks
          </button>
        </div>
      )}
    </div>
  );
}
