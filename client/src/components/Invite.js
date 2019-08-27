/**
 * Created by Nikhil on 11/10/17.
 */

import React, { Component } from 'react';
import queryString from 'query-string'
import Loading from './Loading'
import Dialog from 'material-ui/Dialog';
import Error from './Error'
import $ from 'jquery'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

class Invite extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      pronite: "",
      email: "",
      token: "",
      error: null,
    }
  }
  componentWillMount() {
    const token = queryString.parse(this.props.location.search).token;
    this.setState({token: token});
    this.updateUserFromServer(token);
  }
  updateUserFromServer = (token) => {
    $.post("http://www.rdviitd.org/api/login?token=" + token, (data) => {
      if (data.error)
        this.setState({error: data.message});
      else
        this.setState({user: data.user});
    })
  };
  handleInputChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  };
  handleSelectChange = (id) => (event, index, value) => {
    this.setState({[id]: value});
  };
  invites = () => {
    const bookString = this.state.user[this.state.pronite];
    if (!bookString || !bookString.startsWith("Invitees"))
      return 0;
    const splitString = bookString.split(' ');
    return parseInt(splitString[1]) - parseInt(splitString[2]);
  };
  handleSubmit = (event) => {
    event.preventDefault();
    if (!this.state.pronite)
      this.setState({error: "Please select a Pronite"});
    if (!this.state.email)
      this.setState({error: "Please enter an Email"});
    $.post("http://www.rdviitd.org/api/pronite/invite?token=" + this.state.token + "&pronite=" + this.state.pronite + "&email=" + this.state.email, (data) => {
      if (data.error)
        this.setState({error: data.message});
      else {
        this.setState({error: data.message, email: ""});
        this.updateUserFromServer(this.state.token);
      }
    })
  };
  render() {
    const actions = [
      <FlatButton
        key="0"
        type="submit"
        label="Send Invite"
        primary={true}
      />,
    ];
    return (
      <div>
        {!this.state.user && <Loading/>}
        {this.state.user &&
          <div>
            <Dialog
              title={"Hi, " + this.state.user.first_name + " " + this.state.user.last_name}
              open={true}
              modal={true}
              contentStyle={{width:"80%", maxWidth:"500px"}}
              titleStyle={{backgroundColor:"white", color:"black"}}
              autoScrollBodyContent={true}
            >
              {this.state.pronite && <p>You have {this.invites()} invites left for {this.state.pronite}!</p>}
              <form onSubmit={this.handleSubmit}>
                <SelectField
                  floatingLabelText="Pronite"
                  value={this.state.pronite}
                  onChange={this.handleSelectChange("pronite")}
                  fullWidth={true}
                >
                  <MenuItem value="melange" primaryText="Melange"/>
                  <MenuItem value="spectrum" primaryText="Spectrum"/>
                  <MenuItem value="kaleidoscope" primaryText="Kaleidoscope"/>
                  <MenuItem value="dhoom" primaryText="Dhoom"/>
                </SelectField>
                <TextField
                  id="email"
                  type="text"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                  fullWidth={true}
                  floatingLabelText="Email of Invitee"
                  inputStyle={{textAlign:"center"}}
                />
                <div style={{textAlign: "right", padding: "10px 0 0 0"}}>
                  {actions}
                </div>
              </form>
            </Dialog>
          </div>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

export default Invite;