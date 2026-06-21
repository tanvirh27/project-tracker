import { create } from 'zustand';

const useThemeStore = create((set) => {
    const dark = localStorage.getItem('theme') !== 'light';
    if (dark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    return {
        dark,
        toggle() {
            set((s) => {
                const newDark = !s.dark;
                localStorage.setItem('theme', newDark ? 'dark' : 'light');
                if (newDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                return { dark: newDark };
            });
        },
    };
});

export default useThemeStore;
