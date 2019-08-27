/**
 * Created by Nikhil on 24/05/17.
 */
import React, { Component } from 'react';
import Error from './Error'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import crypto from 'crypto';
import { checkLogin } from '../utils/sessionAPI'
import { selfUpdate } from '../utils/teamAPI'
import Loading from './Loading'

class Profile extends Component {
  constructor() {
    super();

    this.initState = {
      user : {},
      email: "",
      designation: "",
      name: "",
      contact: "",
      password: "",
      cpassword: "",
      error: null,
    };
    this.state = this.initState;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onErrorCancel = this.onErrorCancel.bind(this);
    this.onClose = this.onClose.bind(this);
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      const user = response.user;
      this.setState({
        user: user,
        email: user.email,
        name: user.name,
        contact: user.contact,
        designation: user.designation,
      });
    })
  }
  handleInputChange(event) {
    const newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
  }
  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.email) {
      this.setState({error: "Please enter Email Address"});
      return
    }
    if (this.state.password !== this.state.cpassword) {
      this.setState({error: "Password Don't Match"});
      return
    }
    if (!this.state.name) {
      this.setState({error: "Please enter Name"});
      return
    }
    if (!this.state.contact) {
      this.setState({error: "Please enter Contact Number"});
      return
    }
    const member = {};
    member.email = this.state.email;
    member.name = this.state.name;
    member.contact = this.state.contact;
    if (this.state.password) {
      member.password = crypto.createHash('md5').update(this.state.password).digest('hex');
    }
    selfUpdate(member)
      .then(function (response) {
        this.setState({
          error: response.message,
        });
      }.bind(this));
  }
  onErrorCancel() {
    if (this.state.error.indexOf("success") !== -1)
      this.onClose();
    this.setState({
      error: null,
    })
  }
  onClose() {
    this.props.history.goBack();
  }
  render() {
    const actions = [
      <p style={{padding:"none", margin:"none", fontSize:"10px"}}>Leave password blank to keep it same</p>,
      <FlatButton
        key="0"
        label="Close"
        primary={true}
        onTouchTap={this.onClose}
        disabled={!this.state.user.contact}
      />,
      <RaisedButton
        key="1"
        label="Update"
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
          title={this.state.user.contact ? "Edit Profile" : "First Login?"}
          open={true}
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
            disabled={true}
          />
          <TextField
            id="designation"
            type="text"
            value={this.state.designation}
            fullWidth={true}
            floatingLabelText="Designation"
            inputStyle={{textAlign: "center"}}
            disabled={true}
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
          <TextField
            id="contact"
            type="number"
            value={this.state.contact}
            onChange={this.handleInputChange}
            fullWidth={true}
            floatingLabelText="Contact Number"
            inputStyle={{textAlign: "center"}}
          />
          <TextField
            id="password"
            type="password"
            value={this.state.password}
            onChange={this.handleInputChange}
            fullWidth={true}
            floatingLabelText="New Password"
            inputStyle={{textAlign: "center"}}
          />
          <TextField
            id="cpassword"
            type="password"
            value={this.state.cpassword}
            onChange={this.handleInputChange}
            fullWidth={true}
            floatingLabelText="Confirm Password"
            inputStyle={{textAlign: "center"}}
          />
        </Dialog>
        {this.state.error && <Error message={this.state.error} onCancel={this.onErrorCancel}/>}
      </div>}
      </div>
    )
  }
}

export default Profile;