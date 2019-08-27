/**
 * Created by Nikhil on 27/05/17.
 */
import axios from 'axios'
import { axiosConfig } from './sessionAPI'

function getVenues() {
  return axios.get('/api/venue')
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function addVenue(venue) {
  return axios.post('/api/admin/venue', {
    venue: venue,
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

function deleteVenue(key) {
  return axios.delete('/api/admin/venue/' + key, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

export { getVenues, addVenue, deleteVenue }
