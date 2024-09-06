import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:3000'
});

export const getUser = async (username, password) => {
	const response = await api.post('/login', { username, password });
	if (response) {
		return true;
	}
	return false;
};
