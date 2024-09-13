import axios from 'axios';
import { toast } from 'svelte-sonner';

const api = axios.create({
	baseURL: 'http://localhost:3000'
});

export const login = async (username, password) => {
	try {
		const response = await api.post(
			'/api/login',
			{ username, password },
			{ withCredentials: true }
		);
		return response;
	} catch (error) {
		console.error('Error logging in:', error);
		toast.error(error.response.data.error);
	}
};

export const checkAdmin = async () => {
	try {
		const response = await api.get('/api/user/is-admin', { withCredentials: true });
		return response.data.isAdmin;
	} catch (error) {
		console.error('Error getting user:', error);
		toast.error(error.response.data.error);
	}
};

export const getUser = async () => {
	try {
		const response = await api.get('/api/user', { withCredentials: true });
		return response.data.user;
	} catch (error) {
		console.error('Error getting user:', error);
		toast.error(error.response.data.error);
	}
};

export const updateUser = async (user) => {
	try {
		const response = await api.post('/api/user', { user }, { withCredentials: true });
		return response;
	} catch (error) {
		console.error('Error updating user:', error);
		toast.error(error.response.data.error);
	}
};

export const getUsersWithGroups = async () => {
	const { data } = await api.get('/api/users/groups');
	return data.users;
};

export const getAllGroups = async () => {
	const { data } = await api.get('/api/groups');
	return data;
};

export const createUser = async (user) => {
	const response = await api.post('/api/users', user);
	if (response.status === 400) {
		console.error('error', response.data);
	}
};

export const createGroup = async (user_group) => {
	const response = await api.post('/api/groups', { user_group });
	if (response.status === 400) {
		console.error('error', response.data);
	}
};
