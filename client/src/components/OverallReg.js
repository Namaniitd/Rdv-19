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
import $ from 'jquery'

class EventReg extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      registrations: null,
      error: null,
    };
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateRegFromServer();
    })
  }
  updateRegFromServer = () => {
    $.ajax({
      url: '/api/admin/registrations',
      type: 'GET',
      dataType: 'json',
      headers: {
        'Authorization': 'Bearer ' + getToken(),
      },
      contentType: 'application/json; charset=utf-8',
      success: (data) => {
        data.registrations.sort(function(a,b) {
          return ((typeof(b.reg_time) === 'string' && b.reg_time)? new Date(b.reg_time) : new Date('01/01/2017')) - ((typeof(a.reg_time) === 'string' && a.reg_time)? new Date(a.reg_time) : new Date('01/01/2017'));
        });
        this.setState({registrations: data.registrations});
      },
      error: (error) => {
        this.setState({error: error.responseJSON.message});
      }
    });
  };
  downloadAsCSV = () => {
    let date = new Date();
    let filename = "RDV_Reg_" + date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear() + ".csv";

    let data = [];

    let dataHeader = ["RDV Number", "Name", "Email", "Contact", "College", "Gender", "Timestamp"];
    data.push(dataHeader);

    this.state.registrations.forEach((reg, index) => {
      let college = reg.college.replace(",", "");
      let dataRow = [reg.rdv_number, reg.first_name + " " + reg.last_name, reg.email, reg.contact_number, college, reg.gender, reg.reg_time];
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
    let style = {height: "30px", padding: "0px"};
    return (
      <div>
        {!this.state.registrations && <Loading/>}
        {this.state.registrations &&
        <div>
          <Paper style={{width:"100%", maxWidth:"1000px", margin: "10px auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan={14} style={{textAlign: 'center', backgroundColor:"dodgerblue", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    Rendezvous Registrations
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan={14} style={{textAlign: 'center', backgroundColor:"white", fontSize:"20px", color:"black"}}>
                    <RaisedButton label='Download As CSV' onTouchTap={this.downloadAsCSV}/>
                  </TableHeaderColumn>
                </TableRow>
                <TableRow style={style}>
                  <TableHeaderColumn style={{height: "20px", textAlign: "center"}} colSpan="1">SNo</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="2">RDV Number</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="2">Name</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="3">Email Address</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="2">Contact Number</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="2">College</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="1">Gender</TableHeaderColumn>
                  <TableHeaderColumn style={style} colSpan="1">RDV Points</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {this.state.registrations.map( (row, index) => (
                  <TableRow key={index} style={style}>
                    <TableRowColumn style={{height: "20px"}} colSpan="1">{index+1}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="2">{row.rdv_number}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="2">{row.first_name + " " + row.last_name}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="3">{row.email}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="2">{row.contact_number}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="2">{row.college}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="1">{row.gender}</TableRowColumn>
                    <TableRowColumn style={style} colSpan="1">{row.rdv_points}</TableRowColumn>
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