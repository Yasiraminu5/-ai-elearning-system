import API from './axios';

export const getDiscussions   = (courseId)       => API.get(`/courses/${courseId}/discussions`);
export const createDiscussion = (courseId, data) => API.post(`/courses/${courseId}/discussions`, data);
export const addReply         = (courseId, id, data) => API.post(`/courses/${courseId}/discussions/${id}/reply`, data);
export const deleteDiscussion = (courseId, id)   => API.delete(`/courses/${courseId}/discussions/${id}`);
