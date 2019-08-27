/**
 * Created by Nikhil on 17/09/17.
 */
import axios from 'axios'
import { axiosConfig } from './sessionAPI'

function getBudgetRequests() {
  return axios.get('/api/admin/budget', axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function getBudgetRequest(id) {
  return axios.get('/api/admin/budget/' + id, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      let request = response.data.request;
      return {request: request};
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function addBudgetRequest(request) {
  return axios.post('/api/admin/budget', {
    request: request,
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

function updateBudgetRequest(id, status, modifier) {
  return axios.post('/api/admin/budget/' + id, {
    status: status,
    modifier: modifier,
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

function deleteBudgetRequest(id) {
  return axios.delete('/api/admin/budget/' + id, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

export {deleteBudgetRequest, getBudgetRequests, addBudgetRequest, getBudgetRequest, updateBudgetRequest }