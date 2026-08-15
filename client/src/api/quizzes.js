import API from './axios';

export const getQuizzes       = ()         => API.get('/quizzes');
export const getQuiz          = (id)       => API.get(`/quizzes/${id}`);
export const getCourseQuizzes = (courseId) => API.get(`/quizzes/course/${courseId}`);
export const createQuiz       = (data)     => API.post('/quizzes', data);
export const updateQuiz       = (id, data) => API.put(`/quizzes/${id}`, data);
export const deleteQuiz       = (id)       => API.delete(`/quizzes/${id}`);
export const submitQuiz       = (id, data) => API.post(`/quizzes/${id}/submit`, data);
export const getMyResults     = ()         => API.get('/quizzes/results/me');
export const getAllResults     = ()         => API.get('/quizzes/results/all');
