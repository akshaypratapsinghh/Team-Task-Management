const storageKey = 'team-task-manager-auth';

export const saveAuth = (data) => {
  localStorage.setItem(storageKey, JSON.stringify(data));
};

export const clearAuth = () => {
  localStorage.removeItem(storageKey);
};

export const getAuth = () => {
  const raw = localStorage.getItem(storageKey);
  return raw ? JSON.parse(raw) : null;
};

export const getUserFromStorage = () => getAuth()?.user || null;
export const getToken = () => getAuth()?.token || null;
