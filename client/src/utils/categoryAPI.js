/**
 * Created by Nikhil on 27/05/17.
 */
import axios from 'axios'
import { axiosConfig } from './sessionAPI'

function getCategories() {
  return axios.get('/api/category')
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function addCategory(category) {
  return axios.post('/api/admin/category', {
    category: category,
  }, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function deleteCategory(key) {
  return axios.delete('/api/admin/category/' + key, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

export { getCategories, addCategory, deleteCategory }
