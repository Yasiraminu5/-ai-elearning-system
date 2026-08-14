import API from './axios';

export const getAllCourses    = ()         => API.get('/courses');
export const getCourse        = (id)       => API.get(`/courses/${id}`);
export const createCourse     = (data)     => API.post('/courses', data);
export const updateCourse     = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse     = (id)       => API.delete(`/courses/${id}`);
export const enrollCourse     = (id)       => API.post(`/courses/${id}/enroll`);
export const getEnrolledCourses = ()       => API.get('/courses/enrolled');
export const getLessons       = (courseId) => API.get(`/courses/${courseId}/lessons`);
export const createLesson     = (courseId, data) => API.post(`/courses/${courseId}/lessons`, data);
export const updateLesson     = (id, data) => API.put(`/courses/lessons/${id}`, data);
export const deleteLesson     = (id)       => API.delete(`/courses/lessons/${id}`);
export const completeLesson   = (id)       => API.post(`/courses/lessons/${id}/complete`);
