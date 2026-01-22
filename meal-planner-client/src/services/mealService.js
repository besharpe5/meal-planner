import API from './api';

export const getMeals = () => API.get('/meals');
export const getMeal = (id) => API.get(`/meals/${id}`);
export const createMeal = (data) => API.post('/meals', data);
export const updateMeal = (id, data) => API.put(`/meals/${id}`, data);
export const deleteMeal = (id) => API.delete(`/meals/${id}`);
