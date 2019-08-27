/**
 * Created by Nikhil on 06/08/17.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'
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
import IconButton from 'material-ui/IconButton'
import Edit from 'material-ui/svg-icons/editor/mode-edit';
import Delete from 'material-ui/svg-icons/action/delete';
import People from 'material-ui/svg-icons/social/people';
import { checkLogin } from '../utils/sessionAPI'
import { getEvents, deleteEvent } from '../utils/eventAPI'
import Loading from './Loading'
import Error from './Error'
import Alert from './Alert'
import $ from 'jquery'

class ManageEvents extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      events: null,
      updating: false,
      toBeUpdated: {},
      filter_type: "All",
      filter_category: "All",
      alert: null,
      error: null,
    };
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateEventsFromServer();
      $.get('/api/category', (data) => this.setState({categories: data.categories}));
    })
  }
  handleSelectChange = (id) => (event, index, value) => {
    this.setState({[id]: value});
  };
  updateEventsFromServer = () => {
    getEvents()
      .then(function (response) {
        if (!response.error) {
          let events = response.events;
          events.sort(function (a, b) {
            return (a.category_name < b.category_name)? -1 : +1;
          });
          this.setState({events: events});
        }
        else
          this.setState({error: response.message});
      }.bind(this))
  };
  deleteEventFromServer = (id) => {
    deleteEvent(id)
      .then(function (response) {
        if (!response.error)
          this.updateEventsFromServer();
        this.setState({error: response.message});
      }.bind(this))
  };
  onDelete = (event) => {
    this.toBeDeleted = event.id + ":" + event.category;
    this.setState({alert: "Are you sure you want to delete " + event.name + " ?"});
  };
  onDeleteAccept = () => {
    this.deleteEventFromServer(this.toBeDeleted);
    this.setState({alert: null});
  };
  onDeleteReject = () => {
    this.toBeDeleted = "";
    this.setState({alert: null});
  };
  regCount = (event) => {
    if (!event.registration || event.reg_mode !== 'Website')
      return "N/A";
    if (!event.reg_count)
      return 0;
    return event.reg_count;
  };
  render() {
    let filteredEvents = this.state.events;
    if (this.state.filter_category !== 'All')
      filteredEvents = filteredEvents.filter(e => e.category === this.state.filter_category);
    if (this.state.filter_type !== 'All')
      filteredEvents = filteredEvents.filter(e => e.type === this.state.filter_type);
    return (
      <div className="manage-events">
        {(!this.state.events || !this.state.categories) && <Loading/>}
        {this.state.events && this.state.categories &&
        <div>
          <div style={{display: "flex", flexWrap: "wrap", width:"100%", maxWidth:"700px", margin: "auto"}}>
            <SelectField
              floatingLabelText="Type"
              value={this.state.filter_type}
              onChange={this.handleSelectChange("filter_type")}
              style={{width: "40%", margin: "auto"}}
            >
              <MenuItem value="All" primaryText="All"/>
              <MenuItem value="Competitive" primaryText="Competitive Event"/>
              <MenuItem value="Professional" primaryText="Professional Performance"/>
              <MenuItem value="Informal" primaryText="Informal Event"/>
              <MenuItem value="Workshop" primaryText="Workshop"/>
              <MenuItem value="Activity" primaryText="Activity"/>
            </SelectField>
            <SelectField
              floatingLabelText="Category"
              value={this.state.filter_category}
              onChange={this.handleSelectChange("filter_category")}
              style={{width: "40%", margin: "auto"}}
              maxHeight={200}
            >
              <MenuItem value="All" primaryText="All"/>
              {this.state.categories.map((row, index) => (
                <MenuItem key={index} value={row.key} primaryText={row.name}/>
              ))}
            </SelectField>
          </div>
          <Paper style={{width:"100%", maxWidth:"1000px", margin: "auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan="14" style={{textAlign: 'center', backgroundColor:"dodgerblue", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    Rendezvous Events
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
                  <TableHeaderColumn colSpan="3">Name</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Type</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Category</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Registrations</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Point of Contact</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2"> </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {filteredEvents.map( (row, index) => (
                  <TableRow key={index}>
                    <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
                    <TableRowColumn colSpan="3">{row.name}</TableRowColumn>
                    <TableRowColumn colSpan="2">{row.type}</TableRowColumn>
                    <TableRowColumn colSpan="2">{row.category_name}</TableRowColumn>
                    <TableRowColumn colSpan="2" >{this.regCount(row)}</TableRowColumn>
                    <TableRowColumn colSpan="2">{row.poc && row.poc.map((member, index) => (<div>{member.name}<br/></div>))}</TableRowColumn>
                    <TableRowColumn colSpan="2" style={{overflow:"visible"}}>
                      <Link to={"update-event?id=" + row.id}><IconButton tooltip="Edit Event" style={{width:'30px'}}>
                        <Edit hoverColor="dodgerblue"/>
                      </IconButton></Link>
                      <Link to={"event-reg?id=" + row.id + ":" + row.category}><IconButton tooltip="View Registrations" style={{width:'30px'}}>
                        <People hoverColor="dodgerblue"/>
                      </IconButton></Link>
                      <IconButton onClick={this.onDelete.bind(this, row)} tooltip="Delete Event" style={{width:'30px'}}>
                        <Delete hoverColor="dodgerblue"/>
                      </IconButton>
                    </TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
          {this.state.alert && <Alert message={this.state.alert} onAccept={this.onDeleteAccept} onReject={this.onDeleteReject}/>}
        </div>}
      </div>
    )
  }
}

export default ManageEvents;