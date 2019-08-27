/**
 * Created by Nikhil on 22/05/17.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import DirectionsRun from 'material-ui/svg-icons/maps/directions-run';
import Person from 'material-ui/svg-icons/social/person';
import Home from 'material-ui/svg-icons/action/home'
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import logo from '../images/logo.png'
import {white, blue500} from 'material-ui/styles/colors';
import $ from 'jquery'

class Navbar extends Component {
  constructor() {
    super();

    this.state = {
      count: 0,
    };

    this.updateCount();
  }
  updateCount = () => {
    $.get('/api/reg-count', (data) => this.setState({count: data.count}));
  };
  componentDidMount() {
    this.interval = setInterval(this.updateCount, 60000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return (
      <Toolbar style={{backgroundColor:"black", padding:"5px 20px 5px 20px"}}>
        <ToolbarGroup className="reg-data" firstChild={true} style={{marginLeft:"10px", width:"30%"}}>
          <ToolbarTitle text={this.state.count + " Registrations"} style={{color:"white"}}></ToolbarTitle>
        </ToolbarGroup>
        <ToolbarGroup className="main-logo" style={{position:"relative", display:"block"}}>
          <img src={logo} alt="logo" style={{height:"100%"}}></img>
        </ToolbarGroup>
        <ToolbarGroup className="main-icons" lastChild={true} style={{marginRight:"10px", width:"30%"}}>
          <IconMenu
            iconButtonElement= {<IconButton tooltip="Home"><Link to="/"><Home color={white} hoverColor={blue500}></Home></Link></IconButton>}
            open={false}
            style={{height:"100%", width:"auto", marginLeft:"auto"}}
          ></IconMenu>
          <IconMenu
            iconButtonElement={<IconButton tooltip="Edit Profile">
              <Link to="/profile"><Person color={white} hoverColor={blue500}></Person></Link>
            </IconButton>}
            open={false}
            style={{height:"100%", width:"auto", marginRight:0}}
          ></IconMenu>
          <IconMenu
            iconButtonElement={<IconButton tooltip="Logout">
              <DirectionsRun color={white} hoverColor={blue500}/>
            </IconButton>}
            onTouchTap={this.props.onLogout}
            open={false}
            style={{height:"100%", width:"auto", marginRight:0}}
          ></IconMenu>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

export default Navbar;