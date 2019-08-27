/**
 * Created by Nikhil on 07/08/17.
 */
import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { checkLogin } from '../utils/sessionAPI'
import { getEvents } from '../utils/eventAPI'
import { getVenues } from '../utils/venueAPI'
import { getCategories } from '../utils/categoryAPI'
import Loading from './Loading'

class Schedule extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      events: null,
      filter_date: "All",
      filter_category: "All",
      filter_venue: "All",
    };
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateVenuesFromServer();
      this.updateCategoriesFromServer();
      this.updateEventsFromServer();
    })
  }
  updateEventsFromServer = () => {
    getEvents()
      .then(function (response) {
        if (!response.error) {
          let events = response.events;
          let eventSched = [];
          for (let key1 in events) {
            let event = events[key1];
            for (let key2 in event.dtv) {
              let chunk = event.dtv[key2];
              console.log(new Date("01/01/2017 " + this.convert(new Date(chunk.start_time))));
              eventSched.push({
                name: event.name + ((chunk.type)? " " + chunk.type : ""),
                type: event.type,
                category: event.category,
                date: chunk.date,
                category_name: event.category_name,
                start_time: new Date(chunk.start_time),
                end_time: new Date(chunk.end_time),
                venue: chunk.venue,
              })
            }
          }
          console.log(eventSched);
          eventSched.sort(function(a, b) {
            if (a.date === b.date)
              return (a.start_time.toLocaleTimeString() < b.start_time.toLocaleTimeString())? -1 : +1;
            else
              return (a.date < b.date)? -1 : +1;
          });
          this.setState({events: eventSched});
        }
        else
          this.setState({error: response.message});
      }.bind(this))
  };
  updateVenuesFromServer = () => {
    getVenues()
      .then(function (response) {
        if (!response.error)
          this.setState({venues: response.venues});
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  updateCategoriesFromServer = () => {
    getCategories()
      .then(function (response) {
        if (!response.error)
          this.setState({categories: response.categories});
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  handleSelectChange = (id) => (event, index, value) => {
    this.setState({[id]: value});
  };
  convert(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    minutes = (minutes < 10)? "0" + minutes : minutes;
    let ampm = (hours < 12) ? "am" : "pm";
    hours = (hours > 12)? hours - 12 : (hours === 0)? 12 : hours;
    return hours + ":" + minutes + ampm;
  }
  render() {
    let filteredEvents = this.state.events;
    if (this.state.filter_category !== 'All')
      filteredEvents = filteredEvents.filter(e => e.category === this.state.filter_category);
    if (this.state.filter_date !== 'All')
      filteredEvents = filteredEvents.filter(e => e.date === this.state.filter_date);
    if (this.state.filter_venue !== 'All')
      filteredEvents = filteredEvents.filter(e => e.venue === this.state.filter_venue);
    return (
      <div>
        {(!this.state.events || !this.state.venues || !this.state.categories) && <Loading/>}
        {this.state.events && this.state.venues && this.state.categories &&
        <div>
          <div style={{display: "flex", flexWrap: "wrap", width:"100%", maxWidth:"950px", margin: "auto"}}>
            <SelectField
              floatingLabelText="Category"
              value={this.state.filter_category}
              onChange={this.handleSelectChange("filter_category")}
              style={{width: "30%", margin: "auto"}}
              maxHeight={200}
            >
              <MenuItem value="All" primaryText="All"/>
              {this.state.categories.map((row, index) => (
                <MenuItem key={index} value={row.key} primaryText={row.name}/>
              ))}
            </SelectField>
            <SelectField
              floatingLabelText="Date"
              value={this.state.filter_date}
              onChange={this.handleSelectChange("filter_date")}
              style={{width: "30%", margin: "auto"}}
            >
              <MenuItem value="All" primaryText="All"/>
              <MenuItem value="Day 1 (13/10)" primaryText="Day 1 (13/10)"/>
              <MenuItem value="Day 2 (14/10)" primaryText="Day 2 (14/10)"/>
              <MenuItem value="Day 3 (15/10)" primaryText="Day 3 (15/10)"/>
              <MenuItem value="Day 4 (16/10)" primaryText="Day 4 (16/10)"/>
            </SelectField>
            <SelectField
              floatingLabelText="Venue"
              value={this.state.filter_venue}
              onChange={this.handleSelectChange("filter_venue")}
              style={{width: "30%", margin: "auto"}}
              maxHeight={200}
            >
              <MenuItem value="All" primaryText="All"/>
              {this.state.venues.map((row, index) => (
                <MenuItem key={index} value={row.key} primaryText={row.key}/>
              ))}
            </SelectField>
          </div>
          <Paper style={{width:"100%", maxWidth:"1000px", margin: "auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan="14" style={{textAlign: 'center', backgroundColor:"dodgerblue", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    Rendezvous Schedule
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
                  <TableHeaderColumn colSpan="3">Name</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Category</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Date</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Start Time</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">End Time</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Venue</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {filteredEvents.map( (row, index) => (
                  <TableRow key={index}>
                    <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
                    <TableRowColumn colSpan="3">{row.name}</TableRowColumn>
                    <TableRowColumn colSpan="2">{row.category_name}</TableRowColumn>
                    <TableRowColumn colSpan="2">{row.date}</TableRowColumn>
                    <TableRowColumn colSpan="2">{this.convert(row.start_time)}</TableRowColumn>
                    <TableRowColumn colSpan="2">{this.convert(row.end_time)}</TableRowColumn>
                    <TableRowColumn colSpan="2">{row.venue}</TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </div>}
      </div>
    )
  }
}

export default Schedule;