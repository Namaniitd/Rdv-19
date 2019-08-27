/**
 * Created by Nikhil on 24/05/17.
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
import IconButton from 'material-ui/IconButton'
import Permissions from 'material-ui/svg-icons/communication/vpn-key';
import Edit from 'material-ui/svg-icons/editor/mode-edit';
import Delete from 'material-ui/svg-icons/action/delete';
import { checkLogin } from '../utils/sessionAPI'
import { getTeam, deleteTeamMember } from '../utils/teamAPI'
import UpdateMember from './AddMember'
import Loading from './Loading'
import Error from './Error'
import Alert from './Alert'

class ManageTeam extends Component {
  constructor() {
    super();

    this.state = {
      user: {},
      team: null,
      updating: false,
      toBeUpdated: {},
      alert: null,
      error: null,
    };

    this.updateTeamFromServer = this.updateTeamFromServer.bind(this);
    this.deleteMemberFromServer = this.deleteMemberFromServer.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onDeleteReject = this.onDeleteReject.bind(this);
    this.onDeleteAccept = this.onDeleteAccept.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onUpdateClose = this.onUpdateClose.bind(this);
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateTeamFromServer();
    })
  }
  updateTeamFromServer() {
    getTeam()
      .then(function (response) {
        if (!response.error) {
          let team = response.team;
          team.sort(function (a, b) {
            if (a.role === b.role)
              return (a.department < b.department)? -1 : +1;
            else
              return (a.role < b.role)? -1 : +1;
          });
          this.setState({team: team});
        }
        else
          this.setState({error: response.message});
      }.bind(this))
  }
  deleteMemberFromServer(email) {
    deleteTeamMember(email)
      .then(function (response) {
        if (!response.error)
          this.updateTeamFromServer();
        this.setState({error: response.message});
      }.bind(this))
  }
  onDelete(member) {
    this.toBeDeleted = member.email;
    this.setState({alert: "Are you sure you want to delete " + member.name + " ?"});
  }
  onDeleteAccept() {
    this.deleteMemberFromServer(this.toBeDeleted);
    this.setState({alert: null});
  }
  onDeleteReject() {
    this.toBeDeleted = "";
    this.setState({alert: null});
  }
  onUpdate(member) {
    this.setState({updating: true, toBeUpdated: member});
  }
  onUpdateClose() {
    this.updateTeamFromServer();
    this.setState({updating: false, toBeUpdated: {}});
  }
  render() {
    return (
      <div className="home">
        {!this.state.team && <Loading/>}
        {this.state.team &&
        <div>
          <Paper style={{width:"100%", maxWidth:"1000px", margin: "50px auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan="18" style={{textAlign: 'center', backgroundColor:"firebrick", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    Rendezvous Team Members
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
                  <TableHeaderColumn colSpan="3">Name</TableHeaderColumn>
                  <TableHeaderColumn colSpan="4">Designation</TableHeaderColumn>
                  <TableHeaderColumn colSpan="4">Email</TableHeaderColumn>
                  <TableHeaderColumn colSpan="3">Contact</TableHeaderColumn>
                  <TableHeaderColumn colSpan="3">Actions</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {this.state.team.map( (row, index) => (
                  <TableRow key={index}>
                    <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
                    <TableRowColumn colSpan="3">{row.name}</TableRowColumn>
                    <TableRowColumn colSpan="4">{row.designation}</TableRowColumn>
                    <TableRowColumn colSpan="4">{row.email}</TableRowColumn>
                    <TableRowColumn colSpan="3">{row.contact}</TableRowColumn>
                    <TableRowColumn colSpan="3" style={{overflow:"visible"}}>
                      <IconButton onClick={this.onUpdate.bind(this, row)} tooltip="Edit Member" style={{width:'30px'}}>
                        <Edit hoverColor="firebrick"/>
                      </IconButton>
                      <Link to={"permission?member=" + row.email}><IconButton tooltip="Update Permissions" style={{width:'30px'}}>
                        <Permissions hoverColor="firebrick"/>
                      </IconButton></Link>
                      <IconButton onClick={this.onDelete.bind(this, row)} tooltip="Delete Member" style={{width:'30px'}}>
                        <Delete hoverColor="firebrick"/>
                      </IconButton>
                    </TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
          {this.state.alert && <Alert message={this.state.alert} onAccept={this.onDeleteAccept} onReject={this.onDeleteReject}/>}
          <UpdateMember update closed={!this.state.updating} member={this.state.toBeUpdated} onClose={this.onUpdateClose}/>
        </div>}
      </div>
    )
  }
}

export default ManageTeam;