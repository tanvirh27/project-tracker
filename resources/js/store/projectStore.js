import { create } from 'zustand';
import api from '../api/axios';

const useProjectStore = create((set, get) => ({
    projects: [],
    currentProject: null,
    currentGoal: null,
    categories: [],
    loading: false,
    error: null,

    // ── Projects ──────────────────────────────────────────────────────────────
    fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/projects');
            set({ projects: data.data, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message ?? 'Failed to load projects.' });
        }
    },

    fetchProject: async (id) => {
        set({ loading: true, error: null, currentProject: null });
        try {
            const { data } = await api.get(`/projects/${id}`);
            set({ currentProject: data.data, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message ?? 'Failed to load project.' });
        }
    },

    createProject: async (payload) => {
        const { data } = await api.post('/projects', payload);
        set((s) => ({ projects: [data.data, ...s.projects] }));
        return data.data;
    },

    updateProject: async (id, payload) => {
        const { data } = await api.put(`/projects/${id}`, payload);
        set((s) => ({
            projects: s.projects.map((p) => (p.id === id ? data.data : p)),
            currentProject: s.currentProject?.id === id ? data.data : s.currentProject,
        }));
        return data.data;
    },

    deleteProject: async (id) => {
        await api.delete(`/projects/${id}`);
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    },

    // ── Goals ─────────────────────────────────────────────────────────────────
    createGoal: async (projectId, payload) => {
        const { data } = await api.post(`/projects/${projectId}/goals`, payload);
        const newGoal = data.data;
        set((s) => {
            if (!s.currentProject) return {};
            return {
                currentProject: {
                    ...s.currentProject,
                    goals: [...(s.currentProject.goals ?? []), newGoal],
                },
            };
        });
        return newGoal;
    },

    updateGoal: async (goalId, payload) => {
        const { data } = await api.put(`/goals/${goalId}`, payload);
        const updated = data.data;
        set((s) => {
            const patch = {};
            if (s.currentProject) {
                patch.currentProject = {
                    ...s.currentProject,
                    goals: s.currentProject.goals.map((g) => (g.id === goalId ? updated : g)),
                };
            }
            if (s.currentGoal?.id === goalId) {
                patch.currentGoal = { ...s.currentGoal, ...updated };
            }
            return patch;
        });
        return updated;
    },

    deleteGoal: async (goalId) => {
        await api.delete(`/goals/${goalId}`);
        set((s) => {
            if (!s.currentProject) return {};
            return {
                currentProject: {
                    ...s.currentProject,
                    goals: s.currentProject.goals.filter((g) => g.id !== goalId),
                },
            };
        });
    },

    // ── Tasks ─────────────────────────────────────────────────────────────────
    fetchGoal: async (id) => {
        set({ loading: true, error: null, currentGoal: null });
        try {
            const { data } = await api.get(`/goals/${id}`);
            set({ currentGoal: data.data, loading: false });
        } catch (err) {
            set({ loading: false, error: err.response?.data?.message ?? 'Failed to load goal.' });
        }
    },

    createTask: async (goalId, payload) => {
        const { data } = await api.post(`/goals/${goalId}/tasks`, payload);
        const task = data.data;
        set((s) => {
            if (!s.currentGoal) return {};
            return {
                currentGoal: {
                    ...s.currentGoal,
                    tasks: [...(s.currentGoal.tasks ?? []), task].sort(
                        (a, b) => new Date(a.deadline) - new Date(b.deadline)
                    ),
                },
            };
        });
        return task;
    },

    toggleTask: async (taskId) => {
        const tasks = get().currentGoal?.tasks ?? [];
        const task  = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const newDone = !task.is_done;

        // Optimistic update
        set((s) => ({
            currentGoal: {
                ...s.currentGoal,
                tasks: s.currentGoal.tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, is_done: newDone, completed_at: newDone ? new Date().toISOString() : null }
                        : t
                ),
            },
        }));

        try {
            const { data } = await api.put(`/tasks/${taskId}`, { is_done: newDone });
            // Reconcile with server response
            set((s) => ({
                currentGoal: {
                    ...s.currentGoal,
                    tasks: s.currentGoal.tasks.map((t) => (t.id === taskId ? data.data : t)),
                },
            }));
        } catch {
            // Revert on error
            set((s) => ({
                currentGoal: {
                    ...s.currentGoal,
                    tasks: s.currentGoal.tasks.map((t) =>
                        t.id === taskId ? task : t
                    ),
                },
            }));
        }
    },

    updateTask: async (taskId, payload) => {
        const { data } = await api.put(`/tasks/${taskId}`, payload);
        const updated = data.data;
        set((s) => {
            if (!s.currentGoal) return {};
            return {
                currentGoal: {
                    ...s.currentGoal,
                    tasks: s.currentGoal.tasks
                        .map((t) => (t.id === taskId ? updated : t))
                        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
                },
            };
        });
        return updated;
    },

    deleteTask: async (taskId) => {
        await api.delete(`/tasks/${taskId}`);
        set((s) => {
            if (!s.currentGoal) return {};
            return {
                currentGoal: {
                    ...s.currentGoal,
                    tasks: s.currentGoal.tasks.filter((t) => t.id !== taskId),
                },
            };
        });
    },

    // ── Categories ────────────────────────────────────────────────────────────
    fetchCategories: async () => {
        try {
            const { data } = await api.get('/categories');
            set({ categories: data.data });
        } catch {
            // non-fatal
        }
    },

    createCategory: async (payload) => {
        const { data } = await api.post('/categories', payload);
        const cat = data.data;
        set((s) => ({ categories: [...s.categories, cat].sort((a, b) => a.name.localeCompare(b.name)) }));
        return cat;
    },
}));

export default useProjectStore;
