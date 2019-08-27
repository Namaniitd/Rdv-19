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
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper'
import { checkLogin, getToken } from '../utils/sessionAPI'
import Loading from './Loading'
import Error from './Error'
import queryString from 'query-string'
import $ from 'jquery'

class EventReg extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      event: null,
      error: null,
    };
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      const id = queryString.parse(this.props.location.search).id;
      this.setState({user: response.user});
      this.updateEventFromServer(id);
    })
  }
  updateEventFromServer = (id) => {
    $.ajax({
      url: '/api/admin/event-reg/' + id,
      type: 'GET',
      dataType: 'json',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
      },
      contentType: 'application/json; charset=utf-8',
      success: (data) => {
        if (!data.event.registration) {
          this.setState({error: 'This event does not take registrations'});
          return;
        }
        if (data.event.reg_mode !== 'Website') {
          this.setState({error: 'This event does not take registrations through the website'});
          return;
        }
        if (!data.event.registrations)
          data.event.registrations = [];
        data.event.registrations.sort(function(a,b) {
          return (new Date(b.reg_time)) - (new Date(a.reg_time));
        });
        this.setState({event: data.event});
      },
      error: (error) => {
        this.setState({error: error.responseJSON.message});
      }
    });
  };
  colWidth = () => {
    let width = 13;
    if (this.state.event.reg_type === 'Team')
      width += 2;
    if (this.state.event.reg_link_upload)
      width += 3;
    return width;
  };
  downloadAsCSV = () => {
    let date = new Date();
    let filename = this.state.event.id + "_" + date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear() + ".csv";

    let data = [];

    let dataHeader = [];
    if (this.state.event.reg_type === 'Team')
      dataHeader.push("Team");
    dataHeader = dataHeader.concat(["RDV Number", "Name", "Email", "Contact", "College", "Gender"]);
    if (this.state.event.reg_link_upload)
      dataHeader.push("Submission");
    dataHeader.push("Timestamp");
    data.push(dataHeader);

    this.state.event.registrations.forEach((reg, index) => {
      let dataRow = [];
      let college = reg.college.replace(",", "");
      if (reg.team_name) {
        let teamName = reg.team_name.replace(",", "");
        if (this.state.event.reg_type === 'Team')
          dataRow.push(teamName);
      }
      dataRow = dataRow.concat([reg.rdv_number, reg.first_name + " " + reg.last_name, reg.email, reg.contact_number, college, reg.gender]);
      if (this.state.event.reg_link_upload)
        dataRow.push(reg.submission);
      dataRow.push(reg.reg_time);
      data.push(dataRow);
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    data.forEach((row, index) => {
      let dataString = row.join(",");
      csvContent += index < data.length ? dataString + "\n" : dataString;
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
  };
  render() {
    return (
      <div>
        {!this.state.event && <Loading/>}
        {this.state.event &&
        <div>
          <Paper style={{width:"100%", maxWidth:"1000px", margin: "50px auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan={this.colWidth()} style={{textAlign: 'center', backgroundColor:"dodgerblue", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    {this.state.event.name} Registrations
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan={this.colWidth()} style={{textAlign: 'center', backgroundColor:"white", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    <RaisedButton label='Download As CSV' onTouchTap={this.downloadAsCSV}/>
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn style={{textAlign: "center"}} colSpan="1">SNo</TableHeaderColumn>
                  {this.state.event.reg_type === 'Team' && <TableHeaderColumn style={{padding: "0px"}} colSpan="2">Team Name</TableHeaderColumn>}
                  <TableHeaderColumn style={{padding: "0px"}} colSpan="2">RDV Number</TableHeaderColumn>
                  <TableHeaderColumn style={{padding: "0px"}} colSpan="2">Name</TableHeaderColumn>
                  <TableHeaderColumn style={{padding: "0px"}} colSpan="3">Email Address</TableHeaderColumn>
                  <TableHeaderColumn style={{padding: "0px"}} colSpan="2">Contact Number</TableHeaderColumn>
                  <TableHeaderColumn style={{padding: "0px"}} colSpan="2">College</TableHeaderColumn>
                  <TableHeaderColumn style={{padding: "0px"}} colSpan="1">Gender</TableHeaderColumn>
                  {this.state.event.reg_link_upload && <TableHeaderColumn colSpan="3"> </TableHeaderColumn>}
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {this.state.event.registrations.map( (row, index) => (
                  <TableRow key={index}>
                    <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
                    {this.state.event.reg_type === 'Team' && <TableRowColumn style={{padding: "0px"}} colSpan="2">{row.team_name}</TableRowColumn>}
                    <TableRowColumn style={{padding: "0px"}} colSpan="2">{row.rdv_number}</TableRowColumn>
                    <TableRowColumn style={{padding: "0px"}} colSpan="2">{row.first_name + " " + row.last_name}</TableRowColumn>
                    <TableRowColumn style={{padding: "0px"}} colSpan="3">{row.email}</TableRowColumn>
                    <TableRowColumn style={{padding: "0px"}} colSpan="2">{row.contact_number}</TableRowColumn>
                    <TableRowColumn style={{padding: "0px"}} colSpan="2">{row.college}</TableRowColumn>
                    <TableRowColumn style={{padding: "0px"}} colSpan="1">{row.gender}</TableRowColumn>
                    {this.state.event.reg_link_upload && <TableRowColumn colSpan="3">
                      <a href={row.submission} target="_blank" rel="noopener noreferrer" style={{width: "80%"}}>
                        <RaisedButton
                          label='Submission'
                        />
                      </a>
                    </TableRowColumn>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </div>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.props.history.goBack()}/>}
      </div>
    )
  }
}

export default EventReg;