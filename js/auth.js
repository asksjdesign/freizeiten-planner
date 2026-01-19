// Authentication Module
const Auth = {
  isLoggedIn() {
    return !!localStorage.getItem('auth_token');
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  getUser() {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  async login(email, password) {
    const response = await Api.login(email, password);
    this.setAuth(response.token, response.user);
    return response;
  },

  async signup(name, email, password) {
    const response = await Api.signup(name, email, password);
    this.setAuth(response.token, response.user);
    return response;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = 'index.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};
