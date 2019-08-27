/**
 * Created by Nikhil on 23/05/17.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardText, CardTitle} from 'material-ui'
import Divider from 'material-ui/Divider';
import {List, ListItem} from 'material-ui/List';
import { validateToken, getToken } from '../utils/sessionAPI'
import Loading from './Loading'

class Home extends Component {
  constructor() {
    super();

    this.state = {
      user : {},
      numReg : 0,
    }
  }
  componentWillMount() {
    const token = getToken();
    if(!token) {
      this.props.history.push('/login');
    } else {
      validateToken(token)
        .then(function (response) {
          if (response.error) {
            this.props.history.push('/login');
          } else {
            if (!response.user.contact)
              this.props.history.push('/profile');
            else {
              this.setState({user: response.user});
            }
          }
        }.bind(this))
    }
  }
  getNumDays() {
    var curDate = new Date();
    var rdvDate = new Date("2019/10/02");
    return Math.ceil((rdvDate - curDate) / (1000*60*60*24));
  }
  render() {
    const style = {
      height: 450,
      width: '30%',
      margin: 20,
      minWidth: 300,
      textAlign: 'center',
      display: 'inline-block',
    };
    function textStyle(color) {
      return {
        fontSize: "20px",
        color: color,
        textAlign: "centre",
        fontFamily: "monospace"
      }
    }
    return (
      <div className="home" style={{backgroundColor:"ivory"}}>
      {!this.state.user.email && <Loading/>}
      {this.state.user.email &&
      <div>
        <Card style={{width:"90%", height:"40px", textAlign:"centre", display:'inline-block', marginTop:'20px'}} zDepth={4}>
          <CardText style={{fontSize: "20px", padding:0, marginTop:"10px"}}>Hello, {this.state.user.name}! {this.getNumDays()} days to go till Rendezvous!</CardText>
        </Card>
        <Card style={style} zDepth={4}>
          <CardTitle title="Event Management" style={{backgroundColor:"dodgerblue", fontFamily:"cursive"}} titleColor={"white"}/>
          <CardText style={{backgroundColor:"white"}}>
            <List>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/create-event"><ListItem style={textStyle("darkblue")} primaryText="Create New Event" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/manage-events"><ListItem style={textStyle("darkblue")} primaryText="View/Update Event" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to=""><ListItem style={textStyle("darkblue")} primaryText="View RDV Registrations" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/schedule"><ListItem style={textStyle("darkblue")} primaryText="View Schedule" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
            </List>
          </CardText>
        </Card>
        <Card style={style} zDepth={4}>
          <CardTitle title="Fest Management" style={{backgroundColor:"firebrick", fontFamily:"cursive"}} titleColor={"white"}/>
          <CardText style={{backgroundColor:"white"}}>
            <List>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/add-member"><ListItem style={textStyle("darkred")} primaryText="Add Team Member" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/manage-team"><ListItem style={textStyle("darkred")} primaryText="Manage Team"/></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/venue"><ListItem style={textStyle("darkred")} primaryText="Manage Venues" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/event-category"><ListItem style={textStyle("darkred")} primaryText="Manage Event Categories" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
            </List>
          </CardText>
        </Card>
        <Card style={style} zDepth={4}>
          <CardTitle title="Budget Management" style={{backgroundColor:"darkcyan", fontFamily:"cursive"}} titleColor={"white"}/>
          <CardText style={{backgroundColor:"white"}}>
            <List>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/budget-request"><ListItem style={textStyle("darkgreen")} primaryText="Generate Budget Request"/></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <Link to="/manage-budget"><ListItem style={textStyle("darkgreen")} primaryText="Manage Budget Requests" /></Link>
              <Divider style={{backgroundColor:"black"}}/>
              <ListItem style={textStyle("darkgreen")} primaryText="Add Sponsor" />
              <Divider style={{backgroundColor:"black"}}/>
              <ListItem style={textStyle("darkgreen")} primaryText="Update Inflow" />
              <Divider style={{backgroundColor:"black"}}/>
              <ListItem style={textStyle("darkgreen")} primaryText="View Budget" />
              <Divider style={{backgroundColor:"black"}}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
              <ListItem style={textStyle("white")} primaryText="Empty Function" disabled={true}/>
            </List>
          </CardText>
        </Card>
      </div>}
      </div>
    )
  }
}

export default Home;
