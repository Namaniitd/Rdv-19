/**
 * Created by Nikhil on 24/05/17.
 */
import React, { Component } from 'react';
import Error from './Error'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import { getToken, validateToken } from '../utils/sessionAPI'
import { addTeamMember, updateTeamMember } from '../utils/teamAPI'
import Loading from './Loading'

const roles = [
  'BRCA General Secretary',
  'Executive Team Member',
  'Overall Coordinator',
  'Coordinator',
  'Secretary',
  'Activity Head',
  'Faculty',
];

class AddMember extends Component {
  constructor() {
    super();

    this.initState = {
      user : {},
      closed: false,
      email: "",
      name: "",
      role: "",
      department: "",
      error: null,
    };
    this.state = this.initState;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectToServer = this.connectToServer.bind(this);
    this.onErrorCancel = this.onErrorCancel.bind(this);
    this.onClose = this.onClose.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.update) {
      this.setState({
        closed: nextProps.closed,
        email: nextProps.member.email,
        name: nextProps.member.name,
        role: nextProps.member.role,
        department: nextProps.member.department,
      });
    }
  }
  componentWillMount() {
    const token = getToken();
    if(!token) {
      this.props.history.push('/login');
    }
    validateToken(token)
      .then(function (response) {
        if (response.error) {
          this.props.history.push('/login');
        } else {
          const user = response.user;
          this.setState({
            user: user,
          });
        }
      }.bind(this));
    if (this.props.update) {
      this.setState({
        closed: this.props.closed,
        email: this.props.member.email,
        name: this.props.member.name,
        role: this.props.member.role,
        department: this.props.member.department,
      })
    }
  }
  connectToServer(action, member) {
    action(member)
      .then(function (response) {
        this.setState({
          error: response.message,
        });
        if (!this.props.update && !response.error)
          this.setState({email:"", name:"", role:"", department:""});
      }.bind(this));
  }
  disableDepartment(role) {
    return (
      role === '' ||
      role === 'BRCA General Secretary' ||
      role === 'Executive Team Member' ||
      role === 'Faculty'
    )
  }
  handleInputChange(event) {
    const newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
  }
  handleSelectChange(event, index, value) {
    this.setState({role: value});
    if (this.disableDepartment(value))
      this.setState({department: ""});
  }
  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.email) {
      this.setState({error: "Please enter Email Address"});
      return
    }
    if (!this.state.name) {
      this.setState({error: "Please enter Name"});
      return
    }
    if (!this.state.role) {
      this.setState({error: "Please select Role"});
      return
    }
    if (!this.disableDepartment(this.state.role) && !this.state.department) {
      this.setState({error: "Please enter Department/Club"});
      return
    }
    const member = {};
    member.email = this.state.email;
    member.name = this.state.name;
    member.role = this.state.role;
    member.department = this.state.department;
    member.designation = ((this.state.department)? this.state.department + ' ' : '') + this.state.role;
    (this.props.update)? this.connectToServer(updateTeamMember, member) : this.connectToServer(addTeamMember, member);
  }
  onErrorCancel() {
    this.setState({
      error: null,
    })
  }
  onClose() {
    if (this.props.update)
      this.props.onClose();
    else
      this.props.history.goBack();
  }
  render() {
    const actions = [
      <p style={{padding:"none", margin:"none", fontSize:"10px"}}>Login credentials will be mailed to the new user</p>,
      <FlatButton
        key="0"
        label="Close"
        primary={true}
        onTouchTap={this.onClose}
      />,
      <RaisedButton
        key="1"
        label={this.props.update? "Update" : "Add"}
        primary={true}
        onTouchTap={this.handleSubmit}
      />,
    ];
    return (
      <div>
      {!this.state.user.email && <Loading/>}
      {this.state.user.email &&
      <div>
        <Dialog
          title={this.props.update? "Update Team Member" : "Add Team Member"}
          open={!this.state.closed}
          actions={actions}
          modal={true}
          contentStyle={{width: "80%", maxWidth: "450px"}}
          titleStyle={{backgroundColor: "white", color: "black"}}
          autoScrollBodyContent={true}
        >
          <TextField
            id="email"
            type="text"
            value={this.state.email}
            fullWidth={true}
            floatingLabelText="Email Address"
            inputStyle={{textAlign: "center"}}
            onChange={this.handleInputChange}
            disabled={this.props.update}
          />
          <TextField
            id="name"
            type="text"
            value={this.state.name}
            onChange={this.handleInputChange}
            fullWidth={true}
            floatingLabelText="Full Name"
            inputStyle={{textAlign: "center"}}
          />
          <SelectField
            id="role"
            floatingLabelText="Role"
            fullWidth={true}
            value={this.state.role}
            labelStyle={{textAlign: "center"}}
            onChange={this.handleSelectChange}
          >
            {roles.map((option, index) => (
              <MenuItem key={index} value={option} primaryText={option}/>
            ))}
          </SelectField>
          {!this.disableDepartment(this.state.role) &&
          <div><TextField
            id="department"
            type="text"
            value={this.state.department}
            onChange={this.handleInputChange}
            fullWidth={true}
            floatingLabelText="Department/Club"
            disabled={this.disableDepartment(this.state.role)}
            inputStyle={{textAlign: "center"}}
          />
          <TextField
            type="text"
            value={this.state.department + " " + this.state.role}
            fullWidth={true}
            floatingLabelText=""
            disabled={true}
            inputStyle={{textAlign: "center"}}
            /></div>}
        </Dialog>
        {this.state.error && <Error message={this.state.error} onCancel={this.onErrorCancel}/>}
      </div>}
      </div>
    )
  }
}

export default AddMember;