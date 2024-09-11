import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:3000'
});

export const login = async (username, password) => {
	const response = await api.post('/api/login', { username, password });
	if (response) {
		return true;
	}
	return false;
};

export const getUsersWithGroups = async () => {
	const { data } = await api.get('/api/users/groups');
	return data.users;
};

export const updateUser = async (user) => {
	console.log(user.email);
	const response = await api.post('/api/users/update', { user });
	if (response) {
		return true;
	}
	return false;
};

export const getAllGroups = async () => {
	const { data } = await api.get('/api/groups');
	return data;
};
