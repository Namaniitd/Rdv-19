/**
 * Created by Nikhil on 18/09/17.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import IconButton from 'material-ui/IconButton'
import { checkLogin } from '../utils/sessionAPI'
import { getBudgetRequests, updateBudgetRequest } from '../utils/budgetAPI'
import Paper from 'material-ui/Paper'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Delete from 'material-ui/svg-icons/action/delete';
import Edit from 'material-ui/svg-icons/editor/mode-edit';
import Expand from 'material-ui/svg-icons/content/add-circle';
import ThumbsUp from 'material-ui/svg-icons/action/thumb-up';
import ThumbsDown from 'material-ui/svg-icons/action/thumb-down';
import {Tabs, Tab} from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import Error from './Error'
import Loading from './Loading'

class All extends Component {
  render() {
    return (
      <Table fixedHeader={true} selectable={false}>
        <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
            <TableHeaderColumn colSpan="3">Title</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Amount</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Type</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Added By</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Status</TableHeaderColumn>
            <TableHeaderColumn colSpan="2"> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {this.props.requests.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
              <TableRowColumn colSpan="3">{row.title}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.amount}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.request_type}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.added_by.name}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.status}</TableRowColumn>
              <TableRowColumn colSpan="2" style={{overflow:"visible"}}>
                <IconButton tooltip="Expand Request" style={{width:'30px'}}>
                  <Expand onClick={this.props.onExpand(row)} hoverColor="dodgerblue"/>
                </IconButton>
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

class Rejected extends Component {
  render() {
    return (
      <Table fixedHeader={true} selectable={false}>
        <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
            <TableHeaderColumn colSpan="3">Title</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Amount</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Type</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Added By</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Rejected By</TableHeaderColumn>
            <TableHeaderColumn colSpan="3"> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {this.props.requests.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
              <TableRowColumn colSpan="3">{row.title}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.amount}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.request_type}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.added_by.name}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.last_modifier.name}</TableRowColumn>
              <TableRowColumn colSpan="3" style={{overflow:"visible", marginLeft:0}}>
                <Link to={"budget-request?id=" + row.id}><IconButton tooltip="Edit Request" style={{width:'30px'}}>
                  <Edit hoverColor="dodgerblue"/>
                </IconButton></Link>
                <IconButton tooltip="Expand Request" style={{width:'30px'}}>
                  <Expand onClick={this.props.onExpand(row)} hoverColor="dodgerblue"/>
                </IconButton>
                <IconButton tooltip="Delete Request" style={{width:'30px'}}>
                  <Delete/>
                </IconButton>
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

class Pending extends Component {
  render() {
    return (
      <Table fixedHeader={true} selectable={false}>
        <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
            <TableHeaderColumn colSpan="3">Title</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Amount</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Type</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Added By</TableHeaderColumn>
            <TableHeaderColumn colSpan="3"> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {this.props.requests.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
              <TableRowColumn colSpan="3">{row.title}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.amount}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.request_type}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.added_by.name}</TableRowColumn>
              <TableRowColumn colSpan="3" style={{overflow:"visible", marginLeft:0}}>
                <Link to={"budget-request?id=" + row.id}><IconButton tooltip="Edit Request" style={{width:'30px'}}>
                  <Edit hoverColor="dodgerblue"/>
                </IconButton></Link>
                <IconButton tooltip="Expand Request" style={{width:'30px'}}>
                  <Expand onClick={this.props.onExpand(row)} hoverColor="dodgerblue"/>
                </IconButton>
                <IconButton tooltip="Reject Request" style={{width:'30px', marginLeft:"20px"}}>
                  <ThumbsDown onClick={this.props.onStatusChange(row.id,"Rejected")} hoverColor="red"/>
                </IconButton>
                <IconButton tooltip="Approve Request" style={{width:'30px', marginLeft:"20px"}}>
                  <ThumbsUp onClick={this.props.onStatusChange(row.id,"Approved")} hoverColor="green"/>
                </IconButton>
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

class Approved extends Component {
  render() {
    return (
      <Table fixedHeader={true} selectable={false}>
        <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
            <TableHeaderColumn colSpan="3">Title</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Amount</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Type</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Added By</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Approved By</TableHeaderColumn>
            <TableHeaderColumn colSpan="3"> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {this.props.requests.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
              <TableRowColumn colSpan="3">{row.title}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.amount}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.request_type}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.added_by.name}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.last_modifier.name}</TableRowColumn>
              <TableRowColumn colSpan="3" style={{overflow:"visible", marginLeft:0}}>
                <IconButton tooltip="Expand Request" style={{width:'30px'}}>
                  <Expand onClick={this.props.onExpand(row)} hoverColor="dodgerblue"/>
                </IconButton>
                <IconButton tooltip="Move to Pending" style={{width:'30px', marginLeft:"20px"}}>
                  <ThumbsDown onClick={this.props.onStatusChange(row.id,"Pending")} hoverColor="red"/>
                </IconButton>
                <IconButton tooltip="Move to Paid" style={{width:'30px', marginLeft:"20px"}}>
                  <ThumbsUp onClick={this.props.onStatusChange(row.id,"Paid")} hoverColor="green"/>
                </IconButton>
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

class Paid extends Component {
  render() {
    return (
      <Table fixedHeader={true} selectable={false}>
        <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn colSpan="1">SNo</TableHeaderColumn>
            <TableHeaderColumn colSpan="3">Title</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Amount</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Type</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Added By</TableHeaderColumn>
            <TableHeaderColumn colSpan="2">Updated By</TableHeaderColumn>
            <TableHeaderColumn colSpan="3"> </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {this.props.requests.map( (row, index) => (
            <TableRow key={index}>
              <TableRowColumn colSpan="1">{index+1}</TableRowColumn>
              <TableRowColumn colSpan="3">{row.title}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.amount}</TableRowColumn>
              <TableRowColumn colSpan="2">{row.request_type}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.added_by.name}</TableRowColumn>
              <TableRowColumn colSpan="2" >{row.last_modifier.name}</TableRowColumn>
              <TableRowColumn colSpan="3" style={{overflow:"visible", marginLeft:0}}>
                <IconButton tooltip="Expand Request" style={{width:'30px'}}>
                  <Expand onClick={this.props.onExpand(row)} hoverColor="dodgerblue"/>
                </IconButton>
                <IconButton tooltip="Move to Approved" style={{width:'30px', marginLeft:"20px"}}>
                  <ThumbsDown onClick={this.props.onStatusChange(row.id,"Approved")} hoverColor="red"/>
                </IconButton>
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

class DetailedInfo extends Component {
  render() {
    let request = this.props.request;
    return (
      <Dialog
        open={request != null}
        title={request.title}
        onRequestClose={this.props.onClose}
      >
        <b>Amount:</b> {request.amount}<br/><br/>
        <b>Payment Type:</b> {request.request_type}<br/><br/>
        <b>Description:</b><br/>{request.description}<br/><br/>
        <b>Reimbursable From Institute?</b> {(request.reimbursable)? 'Yes' : 'No'}<br/><br/>
        <b>Payment Mode:</b> {request.payment_mode}<br/>
        <b>Payment Date:</b> {new Date(request.payment_date).toLocaleDateString()}<br/><br/>
        <b>Added By:</b> {request.added_by.name}<br/>
        <b>Added on:</b> {new Date(request.add_date).toLocaleDateString()}<br/><br/>
      </Dialog>
    )
  }
}

class ManageBudget extends Component {
  constructor() {
    super();

    this.state = {
      requests: null,
      expandedRequest: null,
      error: null,
    }
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateRequestsFromServer();
    })
  }
  updateRequestsFromServer = () => {
    getBudgetRequests()
      .then(function (response) {
        if (!response.error) {
          response.requests.sort(function (a, b) {
            return new Date(b.add_date) - new Date(a.add_date);
          });
          this.setState({requests: response.requests});
        }
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  onStatusChange = (id, status) => () => {
    updateBudgetRequest(id, status, this.state.user)
      .then(function (response) {
        if (!response.error)
          this.updateRequestsFromServer();
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  onExpandOpen = (request) => () => {
    this.setState({expandedRequest: request});
  };
  onExpandClose = () => {
    this.setState({expandedRequest: null});
  };
  render() {
    return (
      <div>
        {!this.state.requests && <Loading/>}
        {this.state.requests &&
          <Paper style={{width:"100%", maxWidth:"1000px", margin: "auto", marginTop: "50px"}}>
            <Tabs initialSelectedIndex={2}>
              <Tab label="All">
                <All
                  requests={this.state.requests}
                  onExpand={this.onExpandOpen}
                />
              </Tab>
              <Tab label="Rejected">
                <Rejected
                  requests={this.state.requests.filter(r => r.status === "Rejected")}
                  onExpand={this.onExpandOpen}
                />
              </Tab>
              <Tab label="Pending">
                <Pending
                  requests={this.state.requests.filter(r => r.status === "Pending")}
                  onExpand={this.onExpandOpen}
                  onStatusChange={this.onStatusChange}
                />
              </Tab>
              <Tab label="Approved">
                <Approved
                  requests={this.state.requests.filter(r => r.status === "Approved")}
                  onExpand={this.onExpandOpen}
                  onStatusChange={this.onStatusChange}
                />
              </Tab>
              <Tab label="Paid">
                <Paid
                  requests={this.state.requests.filter(r => r.status === "Paid")}
                  onExpand={this.onExpandOpen}
                  onStatusChange={this.onStatusChange}
                />
              </Tab>
            </Tabs>
          </Paper>}
      {this.state.expandedRequest && <DetailedInfo request={this.state.expandedRequest} onClose={this.onExpandClose}/>}
      {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
    </div>
    )
  }
}

export default ManageBudget;