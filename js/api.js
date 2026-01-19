// API Configuration
const API_BASE_URL = 'https://dev.asksj.com/api:4ygnIeFv';

// API Client
const Api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
  },

  // Auth endpoints
  async signup(name, email, password) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Camps endpoints
  async getCamps(minAge, maxAge) {
    let query = '';
    if (minAge || maxAge) {
      const params = new URLSearchParams();
      if (minAge) params.append('min_age', minAge);
      if (maxAge) params.append('max_age', maxAge);
      query = '?' + params.toString();
    }
    return this.request('/camps' + query);
  },

  async getCamp(id) {
    return this.request(`/camps/${id}`);
  },

  // People endpoints
  async getPeople() {
    return this.request('/people');
  },

  async addPerson(name, birthdate) {
    return this.request('/people', {
      method: 'POST',
      body: JSON.stringify({ name, birthdate })
    });
  },

  async updatePerson(id, data) {
    return this.request(`/people/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deletePerson(id) {
    return this.request(`/people/${id}`, {
      method: 'DELETE'
    });
  },

  // Selections endpoints
  async getSelections() {
    return this.request('/selections');
  },

  async saveSelection(name, selections, totalCost) {
    return this.request('/selections', {
      method: 'POST',
      body: JSON.stringify({ name, selections, total_cost: totalCost })
    });
  },

  async updateSelection(id, data) {
    return this.request(`/selections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteSelection(id) {
    return this.request(`/selections/${id}`, {
      method: 'DELETE'
    });
  }
};
