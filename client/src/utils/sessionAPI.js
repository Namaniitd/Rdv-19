/**
 * Created by Nikhil on 23/05/17.
 */
import axios from 'axios'

function login(email, password) {
  return axios.post('/api/admin/login', {
    email: email,
    password: password,
  })
  .then(function (response) {
    console.log(response.data);
    return response.data;
  })
  .catch(function (error) {
    console.log(error.response);
    return error.response.data;
  })
}

function getToken() {
  const token = localStorage.getItem('RDV_JWT');
  if (typeof(token) === "undefined" || !token || token === '')
    return null;
  return token;
}

function axiosConfig() {
  let token = getToken();
  return {
    headers: {
      Authorization: "Bearer " + token,
    }
  }
}

function validateToken(token) {
  return axios.get('/api/admin/validate-token?token=' + token)
    .then(function (response) {
      console.log(response.data);
      localStorage.setItem('RDV_JWT', response.data.token);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      localStorage.removeItem('RDV_JWT');
      return error.response.data;
    })
}

function checkLogin(cb) {
  const token = getToken();
  if(!token) {
    this.props.history.push('/login');
  }
  validateToken(token)
    .then(function (response) {
      if (response.error) {
        this.props.history.push('/login');
      } else {
        cb(response);
      }
    }.bind(this))
}

export { login, validateToken, getToken, checkLogin, axiosConfig };