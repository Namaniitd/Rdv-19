/**
 * Created by Nikhil on 27/05/17.
 */
import React, { Component } from 'react';
import queryString from 'query-string'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import {Tabs, Tab} from 'material-ui/Tabs';
import { checkLogin } from '../utils/sessionAPI'
import { getTeamMember, updatePermissions } from '../utils/teamAPI'
import { getCategories } from '../utils/categoryAPI'
import Loading from './Loading'
import Error from './Error'

let perms = {};

class PermissionTab extends Component {
  componentWillMount() {
    if (this.props.label === 'event') {
      perms.event = [{
        key: "can_manage_all_event",
        label: "Can Manage All Events?",
      }];
      perms.event = perms.event.concat(this.props.categories.map( function (category) {
        return {
          key: "can_manage_event_" + category.key,
          label: "Can Manage " + category.name + "?",
        }
      }));
    }
  };
  render() {
    const style = {maxWidth: "300px", margin: "auto", padding: "10px 0 0 0"};
    return (
      <div>
        {perms[this.props.label].map(function (perm, index) {
          return (
            <Toggle key={index} id={perm.key} label={perm.label} toggled={this.props.permissions[perm.key]} onToggle={this.props.onToggle} style={style} />
          )
        }.bind(this))}
      </div>
    )
  }
}

class Permission extends Component {
  constructor() {
    super();

    this.state = {
      member: null,
      user: null,
      permissions: {},
      categories: null,
      error: null,
      unchanged: true,
    };

    this.onToggle = this.onToggle.bind(this);
    this.onSubmitPermissions = this.onSubmitPermissions.bind(this);
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.getMemberFromServer();
      this.getCategoriesFromServer();
    })
  }
  getCategoriesFromServer() {
    getCategories()
      .then(function (response) {
        if (!response.error)
          this.setState({categories: response.categories});
        else
          this.setState({error: response.message});
      }.bind(this))
  };
  getMemberFromServer() {
    const email = queryString.parse(this.props.location.search).member;
    getTeamMember(email)
      .then(function (response) {
        if (!response.error)
          this.setState({member: response.member, permissions: response.member.permissions});
        else
          this.setState({error: response.message});
      }.bind(this));
  }
  onSubmitPermissions() {
    const email = queryString.parse(this.props.location.search).member;
    updatePermissions(email, this.state.permissions)
      .then(function (response) {
        this.setState({error: response.message});
        if (!response.error)
          this.setState({unchanged: true});
      }.bind(this));
  }
  onToggle(event, toggled) {
    this.setState({
      unchanged: false,
      permissions: {
        ...this.state.permissions,
        [event.target.id]: toggled,
      }
    });
  }
  render() {
    const actions = [
      <p style={{padding:"none", margin:"none", fontSize:"10px"}}>* - Does not come under the 'All' of respective cateogry</p>,
      <FlatButton
        key="0"
        label="Close"
        primary={true}
        onTouchTap={() => this.props.history.goBack()}
      />,
      <RaisedButton
        key="1"
        label="Set"
        primary={true}
        onTouchTap={this.onSubmitPermissions}
        disabled={this.state.unchanged}
      />,
    ];
    return (
      <div>
        {(!this.state.categories || !this.state.member) && <Loading/>}
        {this.state.categories && this.state.member &&
        <div>
          <Dialog
            title={"Set Permissions (" + this.state.member.name + ")"}
            open={true}
            modal={true}
            actions={actions}
            contentStyle={{width:"80%", maxWidth:"500px"}}
            titleStyle={{backgroundColor:"white", color:"black"}}
            autoScrollBodyContent={true}
          >
            <Tabs>
              <Tab label="Event">
                <PermissionTab label="event" permissions={this.state.permissions} onToggle={this.onToggle} categories={this.state.categories}/>
              </Tab>
              <Tab label="Fest">
                <PermissionTab label="fest" permissions={this.state.permissions} onToggle={this.onToggle}/>
              </Tab>
              <Tab label="Budget">
                <PermissionTab label="budget" permissions={this.state.permissions} onToggle={this.onToggle}/>
              </Tab>
            </Tabs>
          </Dialog>
        </div>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

export default Permission;

perms = {
  event: [],
  fest: [
    {
      key: "can_manage_all_fest",
      label: "Can Manage All Fest?",
    },
    {
      key: "can_add_achead",
      label: "Can Add Acheads?",
    },
    {
      key: "can_add_coordi",
      label: "Can Add Coordis?",
    },
    {
      key: "can_update_team",
      label: "Can Update Team?",
    },
    {
      key: "can_manage_event_categories",
      label: "Can Manage Event Categories?",
    },
    {
      key: "can_manage_venues",
      label: "Can Manage Venues?",
    },
    {
      key: "can_manage_dates",
      label: "Can Manage RDV Dates?*",
    },
    {
      key: "can_update_perms",
      label: "Can Update Permissions?*",
    },
  ],
  budget: [
    {
      key: "can_manage_all_budget",
      label: "Can Manage All Budget?",
    },
    {
      key: "can_create_budget_request",
      label: "Can Create Budget Request?",
    },
    {
      key: "can_approve_budget_request",
      label: "Can Approve Budget Request?",
    },
    {
      key: "can_view_budget",
      label: "Can View Budget?",
    },
    {
      key: "can_add_sponsor",
      label: "Can Add Sponsor?",
    },
    {
      key: "can_manage_inflow",
      label: "Can Manage Inflow?",
    },
  ],
};