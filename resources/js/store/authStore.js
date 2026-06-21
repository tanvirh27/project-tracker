import { create } from 'zustand';
import api, { getCsrfCookie } from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    init: async () => {
        try {
            const { data } = await api.get('/user');
            set({ user: data, loading: false });
        } catch {
            set({ user: null, loading: false });
        }
    },

    register: async (name, email, password, passwordConfirmation) => {
        await getCsrfCookie();
        const { data } = await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });
        set({ user: data });
    },

    login: async (email, password) => {
        await getCsrfCookie();
        const { data } = await api.post('/login', { email, password });
        set({ user: data });
    },

    logout: async () => {
        await api.post('/logout');
        set({ user: null });
    },
}));

export default useAuthStore;
