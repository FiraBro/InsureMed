import api from "../lib/axios";

class UserService {
  /**
   * Optimized: Handles Server-Side Pagination, Search, and Status Filtering
   * This replaces the old 'getUserAnalysis' to prevent browser lag.
   * @param {Object} params - { page, limit, search, status }
   */
  async listUsersAdmin(params) {
    try {
      const response = await api.get("/users/admin/list", { params });
      // Returns: { users, total, totalPages, currentPage }
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.patch(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  async toggleUserStatus(id, statusData) {
    try {
      const response = await api.patch(`/users/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }
  // services/userService.js
  async exportUsersCSV(filters) {
    try {
      // ❌ Change this:
      // const response = await this.api.get("/users", {

      // ✅ To this (matches your other methods):
      const response = await api.get("/users/admin/list", {
        params: { ...filters, limit: 10000, page: 1 },
      });
      return response.data.data.users;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Helper to standardize error reporting
   */
  _handleError(error) {
    throw error.response?.data || error.message || "Server Error";
  }
}

export const userService = new UserService();
