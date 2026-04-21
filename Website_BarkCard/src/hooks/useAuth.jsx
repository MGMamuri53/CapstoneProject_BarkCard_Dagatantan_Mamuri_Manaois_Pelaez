import { createContext, useContext } from 'react';

export const AuthContext = createContext({
	user: null,
	setUser: () => {},
	login: () => {},
	logout: () => {}
});

export const useAuth = () => useContext(AuthContext);