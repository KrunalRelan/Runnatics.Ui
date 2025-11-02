export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // ... existing actions

            // Add custom action
            updateProfile: async (data: Partial<User>) => {
                try {
                    const token = get().token;
                    if (!token) throw new Error('Not authenticated');

                    const updatedUser = await authService.updateProfile(token, data);
                    get().setUser(updatedUser);
                } catch (error) {
                    throw error;
                }
            },
        }),
        { name: 'auth-storage' }
    )
  );