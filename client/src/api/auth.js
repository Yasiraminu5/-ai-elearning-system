import API from './axios';

export const getMe         = ()     => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
