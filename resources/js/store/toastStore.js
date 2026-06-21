import { create } from 'zustand';

const useToastStore = create((set) => ({
    toasts: [],
    add(message, type = 'error') {
        const id = Date.now() + Math.random();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 4500);
    },
    dismiss(id) {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
}));

export default useToastStore;
