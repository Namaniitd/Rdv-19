/**
 * Created by Nikhil on 23/05/17.
 */
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Login from './components/Login'
import Home from './components/Home'
import Profile from './components/Profile'
import ManageTeam from './components/ManageTeam'
import ManageEvents from './components/ManageEvents'
import AddMember from './components/AddMember'
import EventCategory from './components/EventCategory'
import Venue from './components/Venue'
import Schedule from './components/Schedule'
import Permission from './components/Permission'
import EventCreate from './components/EventCreate'
import EventReg from './components/EventReg'
import BudgetRequest from './components/BudgetRequest'
import ManageBudget from './components/ManageBudget'
import Invite from './components/Invite'

export default (
  <Switch>
    <Route exact path='/' component={Home}/>
    <Route path='/login' component={Login}/>
    <Route path='/profile' component={Profile}/>
    <Route path='/manage-team' component={ManageTeam}/>
    <Route path='/add-member' component={AddMember}/>
    <Route path='/create-event' component={EventCreate}/>
    <Route path='/update-event' component={EventCreate}/>
    <Route path='/manage-events' component={ManageEvents}/>
    <Route path='/event-category' component={EventCategory}/>
    <Route path='/venue' component={Venue}/>
    <Route path='/schedule' component={Schedule}/>
    <Route path='/permission' component={Permission}/>
    <Route path='/event-reg' component={EventReg}/>
    <Route path='/budget-request' component={BudgetRequest}/>
    <Route path='/manage-budget' component={ManageBudget}/>
    <Route path='/invite' component={Invite}/>
    <Route render={function () {
      return <p>Not Found!</p>
    }}/>
  </Switch>
);