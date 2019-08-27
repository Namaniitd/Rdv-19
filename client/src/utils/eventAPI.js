import axios from 'axios'
import { axiosConfig } from './sessionAPI'

function uploadPhoto(photo) {
        var headers = {
            'Content-Type': "multipart/form-data"
        }
  return axios.post('/api/admin/event/upload-photo', photo,headers)
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function getEvents() {
  return axios.get('/api/event')
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function getEvent(id) {
  return axios.get('/api/event/' + id)
    .then(function (response) {
      console.log(response.data);
      let event = response.data.event;
      event.dtv = event.dtv.map(d => ({type: d.type, date: d.date, start_time: new Date(d.start_time), end_time: new Date(d.end_time), venue: d.venue}));
      if (event.reg_deadline)
        event.reg_deadline = new Date(event.reg_deadline);
      return {event: event};
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

function addEvent(event) {
  return axios.post('/api/admin/event', {
    event: event,
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

function deleteEvent(id) {
  return axios.delete('/api/admin/event/' + id, axiosConfig())
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.log(error.response);
      return error.response.data;
    })
}

export { uploadPhoto, addEvent, getEvents, deleteEvent, getEvent }
