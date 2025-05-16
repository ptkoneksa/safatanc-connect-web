import { defineStore } from "pinia";
import type { ApiResponse, Badge, PaginatedResponse, User } from "~/types/api";

interface BadgeState {
  badges: Badge[];
  userBadges: Record<string, Badge[]>;
  selectedBadge: Badge | null;
  loading: boolean;
  error: string | null;
}

export const useBadgeStore = defineStore("badge", {
  state: (): BadgeState => ({
    badges: [],
    userBadges: {},
    selectedBadge: null,
    loading: false,
    error: null,
  }),

  getters: {
    getBadges: (state) => state.badges,
    getUserBadges: (state) => (userId: string) =>
      state.userBadges[userId] || [],
    getSelectedBadge: (state) => state.selectedBadge,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  actions: {
    // Fetch all badges with pagination
    async fetchBadges(page: number = 1, limit: number = 10): Promise<void> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<
          ApiResponse<PaginatedResponse<Badge>>
        >(`${config.public.apiBaseUrl}/badges?page=${page}&limit=${limit}`, {
          method: "GET",
        });

        if (error.value) {
          throw new Error(error.value.message || "Failed to fetch badges");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to fetch badges");
        }

        this.badges = data.value.data?.data || [];
      } catch (err: any) {
        this.error = err.message || "Failed to fetch badges";
        console.error("Error fetching badges:", err);
      } finally {
        this.loading = false;
      }
    },

    // Fetch a specific badge by ID
    async fetchBadge(badgeId: string): Promise<void> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<ApiResponse<Badge>>(
          `${config.public.apiBaseUrl}/badges/${badgeId}`,
          {
            method: "GET",
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to fetch badge");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to fetch badge");
        }

        this.selectedBadge = data.value.data || null;
      } catch (err: any) {
        this.error = err.message || "Failed to fetch badge";
        console.error("Error fetching badge:", err);
      } finally {
        this.loading = false;
      }
    },

    // Fetch badges for a specific user
    async fetchUserBadges(userId: string): Promise<void> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<
          ApiResponse<{ user: User; badges: Badge[] }>
        >(`${config.public.apiBaseUrl}/badges/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${useAuthStore().token}`,
          },
        });

        if (error.value) {
          throw new Error(error.value.message || "Failed to fetch user badges");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to fetch user badges");
        }

        this.userBadges[userId] = data.value.data?.badges || [];
      } catch (err: any) {
        this.error = err.message || "Failed to fetch user badges";
        console.error("Error fetching user badges:", err);
      } finally {
        this.loading = false;
      }
    },

    // Check if a user has a specific badge
    async checkUserHasBadge(userId: string, badgeId: string): Promise<boolean> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<ApiResponse<boolean>>(
          `${config.public.apiBaseUrl}/badges/users/${userId}/badges/${badgeId}/check`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
            },
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to check badge");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to check badge");
        }

        return Boolean(data.value.data);
      } catch (err: any) {
        this.error = err.message || "Failed to check badge";
        console.error("Error checking badge:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Admin functions
    // Create a new badge (admin only)
    async createBadge(
      badgeData: Omit<Badge, "id" | "created_at">
    ): Promise<Badge | null> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<ApiResponse<Badge>>(
          `${config.public.apiBaseUrl}/badges`,
          {
            method: "POST",
            body: badgeData,
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to create badge");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to create badge");
        }

        // Add the new badge to our badges list
        const newBadge = data.value.data;
        if (newBadge) {
          this.badges.push(newBadge);
        }

        return newBadge || null;
      } catch (err: any) {
        this.error = err.message || "Failed to create badge";
        console.error("Error creating badge:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Update an existing badge (admin only)
    async updateBadge(
      badgeId: string,
      badgeData: Partial<Omit<Badge, "id" | "created_at">>
    ): Promise<Badge | null> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<ApiResponse<Badge>>(
          `${config.public.apiBaseUrl}/badges/${badgeId}`,
          {
            method: "PUT",
            body: badgeData,
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to update badge");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to update badge");
        }

        // Update the badge in our badges list
        const updatedBadge = data.value.data;
        if (updatedBadge) {
          const index = this.badges.findIndex((b) => b.id === badgeId);
          if (index !== -1) {
            this.badges[index] = updatedBadge;
          }
          if (this.selectedBadge?.id === badgeId) {
            this.selectedBadge = updatedBadge;
          }
        }

        return updatedBadge || null;
      } catch (err: any) {
        this.error = err.message || "Failed to update badge";
        console.error("Error updating badge:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Delete a badge (admin only)
    async deleteBadge(badgeId: string): Promise<boolean> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { error } = await useFetch(
          `${config.public.apiBaseUrl}/badges/${badgeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
            },
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to delete badge");
        }

        // Remove the badge from our badges list
        this.badges = this.badges.filter((b) => b.id !== badgeId);
        if (this.selectedBadge?.id === badgeId) {
          this.selectedBadge = null;
        }

        // Also remove it from any user badges cache
        for (const userId in this.userBadges) {
          this.userBadges[userId] = this.userBadges[userId].filter(
            (b) => b.id !== badgeId
          );
        }

        return true;
      } catch (err: any) {
        this.error = err.message || "Failed to delete badge";
        console.error("Error deleting badge:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Award a badge to a user (admin only)
    async awardBadge(userId: string, badgeId: string): Promise<boolean> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await useFetch<ApiResponse<string>>(
          `${config.public.apiBaseUrl}/badges/award`,
          {
            method: "POST",
            body: {
              user_id: userId,
              badge_id: badgeId,
            },
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to award badge");
        }

        if (!data.value?.success) {
          throw new Error(data.value?.message || "Failed to award badge");
        }

        // If we've already fetched this user's badges, update the cache
        if (this.userBadges[userId]) {
          // Find the badge in our badges list
          const badge = this.badges.find((b) => b.id === badgeId);
          if (badge && !this.userBadges[userId].some((b) => b.id === badgeId)) {
            this.userBadges[userId].push(badge);
          }
        }

        return true;
      } catch (err: any) {
        this.error = err.message || "Failed to award badge";
        console.error("Error awarding badge:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Remove a badge from a user (admin only)
    async removeBadge(userId: string, badgeId: string): Promise<boolean> {
      const config = useRuntimeConfig();
      this.loading = true;
      this.error = null;

      try {
        const { error } = await useFetch(
          `${config.public.apiBaseUrl}/badges/users/${userId}/badges/${badgeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${useAuthStore().token}`,
            },
          }
        );

        if (error.value) {
          throw new Error(error.value.message || "Failed to remove badge");
        }

        // If we've already fetched this user's badges, update the cache
        if (this.userBadges[userId]) {
          this.userBadges[userId] = this.userBadges[userId].filter(
            (b) => b.id !== badgeId
          );
        }

        return true;
      } catch (err: any) {
        this.error = err.message || "Failed to remove badge";
        console.error("Error removing badge:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Clear error
    clearError(): void {
      this.error = null;
    },
  },
});
