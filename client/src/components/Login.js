/**
 * Created by Nikhil on 22/05/17.
 */
import React, { Component } from 'react';
import Error from './Error'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import crypto from 'crypto';
import { login } from '../utils/sessionAPI';
import { getToken } from '../utils/sessionAPI'

class Login extends Component {
  constructor(props) {
    super();
    this.initState = {
      email: '',
      password: '',
      error: null,
    };
    this.state = this.initState;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onErrorCancel = this.onErrorCancel.bind(this);
  }
  componentWillMount() {
    const token = getToken();
    if(token) {
      this.props.history.push('/');
    }
  }
  handleInputChange(event) {
    const newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
  }
  handleSubmit(event) {
    event.preventDefault();
    const email = this.state.email;
    if (!email) {
      this.setState({error: "Please enter Email Address"});
      return
    }
    if (!this.state.password) {
      this.setState({error: "Please enter Password"});
      return
    }
    const password = crypto.createHash('md5').update(this.state.password).digest('hex');
    login(email, password)
    .then(function (response) {
      if (response.error) {
        this.setState({
          error: response.message,
        })
      } else {
        localStorage.setItem('RDV_JWT', response.token);
        if (!response.user.contact)
          this.props.history.push('/profile');
        else
          this.props.history.push('/');
      }
    }.bind(this));
  }
  onErrorCancel() {
    this.setState({
      error: null,
    })
  }
  render() {
    const actions = [
      <FlatButton
        key="0"
        type="submit"
        label="Submit"
        primary={true}
      />,
    ];
    return (
      <div>
        <Dialog
          title="Login"
          open={true}
          modal={true}
          contentStyle={{width:"80%", maxWidth:"500px"}}
          titleStyle={{backgroundColor:"white", color:"black"}}
          autoScrollBodyContent={true}
        >
          <form onSubmit={this.handleSubmit}>
            <TextField
              id="email"
              type="text"
              value={this.state.email}
              onChange={this.handleInputChange}
              fullWidth={true}
              floatingLabelText="Email Address"
              inputStyle={{textAlign:"center"}}
            />
            <TextField
              id="password"
              type="password"
              value={this.state.password}
              onChange={this.handleInputChange}
              fullWidth={true}
              floatingLabelText="Password"
              inputStyle={{textAlign:"center"}}
            />
            <div style={{textAlign: "right", padding: "10px 0 0 0"}}>
              {actions}
            </div>
          </form>
        </Dialog>
        {this.state.error && <Error message={this.state.error} onCancel={this.onErrorCancel}/>}
      </div>
    )
  }
}

export default Login;