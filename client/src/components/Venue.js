/**
 * Created by Nikhil on 26/05/17.
 */
import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  TableFooter,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton'
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Delete from 'material-ui/svg-icons/action/delete';
import Add from 'material-ui/svg-icons/content/add';
import { checkLogin } from '../utils/sessionAPI'
import { getVenues, addVenue, deleteVenue } from '../utils/venueAPI'
import Loading from './Loading'
import Error from './Error'
import Alert from './Alert'

class VenueDelete extends Component {
  constructor() {
    super();

    this.state = {
      alert: null,
      error: null,
    };

    this.onDelete = this.onDelete.bind(this);
  }
  message() {return "Are you sure you wish to delete " + this.props.venue + "?"}
  onDelete() {
    this.setState({alert: null});
    deleteVenue(this.props.venue)
      .then(function (response) {
          if (!response.error)
            this.props.onDelete();
          else
            this.setState({error: response.message});
      }.bind(this));
  }
  render() {
    return (
      <div>
        <IconButton onClick={() => this.setState({alert: this.message()})} tooltip="Delete Venue" style={{width:'30px'}}>
          <Delete hoverColor="firebrick"/>
        </IconButton>
        {this.state.alert && <Alert message={this.state.alert} onAccept={this.onDelete} onReject={() => this.setState({alert: null})}/>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

class VenueAdd extends Component {
  render() {
    return (
      <TableRow>
        <TableRowColumn colSpan="3">
          <TextField
            id="name"
            type="text"
            value={this.props.venue}
            onChange={this.props.handleInputChange}
            fullWidth={true}
            hintText="Venue Name"
            hintStyle={{top: "5px", width: "100%", textAlign:"center"}}
            style={{backgroundColor: "white", height: "40px", borderRadius: "7px"}}
            inputStyle={{textAlign:"center"}}
          />
        </TableRowColumn>
        <TableRowColumn colSpan="1" style={{overflow:"visible"}}>
          <FloatingActionButton mini={true} onTouchTap={this.props.onAdd}>
            <Add/>
          </FloatingActionButton>
        </TableRowColumn>
      </TableRow>
    )
  }
}

class VenueRow extends Component {
  render() {
    return (
      <TableRow key={this.props.venue}>
        <TableRowColumn colSpan="3">{this.props.venue}</TableRowColumn>
        <TableRowColumn colSpan="1" style={{overflow:"visible"}}>
          <VenueDelete venue={this.props.venue} onDelete={this.props.onDelete}/>
        </TableRowColumn>
      </TableRow>
    )
  }
}

class Venue extends Component {
  constructor() {
    super();

    this.state = {
      venues: null,
      newVenue: "",
      error: null,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.updateVenuesFromServer = this.updateVenuesFromServer.bind(this);
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateVenuesFromServer();
    })
  }
  updateVenuesFromServer() {
    getVenues()
      .then(function (response) {
        if (!response.error)
          this.setState({venues: response.venues});
        else
          this.setState({error: response.message});
      }.bind(this));
  }
  handleInputChange(event) {
    this.setState({newVenue: event.target.value});
  }
  handleAdd(event) {
    event.preventDefault();
    addVenue(this.state.newVenue)
      .then(function (response) {
        this.setState({error: response.message});
        if (!response.error) {
          this.setState({newVenue: ""});
          this.updateVenuesFromServer();
        }
      }.bind(this));
  }
  render() {
    return (
      <div>
        {!this.state.venues && <Loading/>}
        {this.state.venues &&
        <div>
          <Paper style={{width:"100%", maxWidth:"400px", margin: "50px auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan="4" style={{textAlign: 'center', backgroundColor:"firebrick", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    Rendezvous Venues
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan="3">Venue</TableHeaderColumn>
                  <TableHeaderColumn colSpan="1">Action</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {this.state.venues.map( (row, index) => (
                  <VenueRow key={index} venue={row.key} onDelete={this.updateVenuesFromServer}/>
                ))}
              </TableBody>
              <TableFooter style={{backgroundColor: "firebrick"}}>
                <VenueAdd
                  venue={this.state.newVenue}
                  handleInputChange={this.handleInputChange}
                  onAdd={this.handleAdd}
                />
              </TableFooter>
            </Table>
          </Paper>
        </div>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

export default Venue;