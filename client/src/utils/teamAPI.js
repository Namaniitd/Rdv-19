/**
 * Created by Nikhil on 24/05/17.
 */
import axios from 'axios'
import { axiosConfig } from './sessionAPI'

function getTeam() {
  return axios.get('/api/team')
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function getTeamMember(email) {
  return axios.get('/api/team/' + email)
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function addTeamMember(member) {
  return axios.post('/api/admin/team', {
    member: member,
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

function updateTeamMember(member) {
  return axios.post('/api/admin/team/' + member.email, {
    member: member,
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

function deleteTeamMember(email) {
  return axios.delete('/api/admin/team/' + email, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function selfUpdate(member) {
  return axios.post('/api/admin/self-update', {
    member: member,
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

function updatePermissions(email, permissions) {
  return axios.post('/api/admin/update-permissions/' + email, {
    permissions: permissions,
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

export { getTeam, getTeamMember, addTeamMember, updateTeamMember, deleteTeamMember, selfUpdate, updatePermissions }