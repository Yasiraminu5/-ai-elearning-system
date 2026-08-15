import API from './axios';

export const getRecommendations   = () => API.get('/recommendations');
export const refreshRecommendations = () => API.post('/recommendations/refresh');
