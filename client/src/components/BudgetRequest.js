/**
 * Created by Nikhil on 17/09/17.
 */
import queryString from 'query-string'
import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import { Card, CardText, CardTitle, CardActions} from 'material-ui'
import TextField from 'material-ui/TextField';
import { checkLogin } from '../utils/sessionAPI'
import { addBudgetRequest, getBudgetRequest } from '../utils/budgetAPI'
import Error from './Error'
import Loading from './Loading'

class RequestInfo extends Component {
  render() {
    const types = ["Event Prize", "Event Judge", "Event Hospi/Infra", "Artist Fees", "Artist Hospi", "Service", "Team Expense", "Other"];
    const modes = ["Cash", "Cheque", "Online Transfer"];
    return (
      <div style={{display: "flex", flexWrap: "wrap", marginTop:"-20px"}}>
        <div style={{display: "flex", flexWrap: "wrap", width:"100%"}}>
          <TextField
            id="amount"
            type="number"
            value={this.props.data.amount}
            floatingLabelText="Amount (INR)"
            inputStyle={{textAlign: "center"}}
            onChange={this.props.onInputChange}
            style={{width: "30%", margin: "auto"}}
          />
        </div>
        <TextField
          id="title"
          type="text"
          value={this.props.data.title}
          floatingLabelText="Request Title"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "40%", margin: "auto"}}
        />
        <SelectField
          floatingLabelText="Request Type"
          value={this.props.data.request_type}
          onChange={this.props.onSelectChange("request_type")}
          style={{width: "40%", margin: "auto", textAlign: "left"}}
          maxHeight={200}
        >
          {types.map((row, index) => (
            <MenuItem key={index} value={row} primaryText={row}/>
          ))}
        </SelectField>
        <SelectField
          floatingLabelText="Mode of Payment"
          value={this.props.data.payment_mode}
          onChange={this.props.onSelectChange("payment_mode")}
          style={{width: "40%", margin: "auto", textAlign: "left"}}
          maxHeight={200}
        >
          {modes.map((row, index) => (
            <MenuItem key={index} value={row} primaryText={row}/>
          ))}
        </SelectField>
        <DatePicker
          hintText="Date of Payment"
          value={this.props.data.payment_date}
          onChange={this.props.onDateChange}
          textFieldStyle={{width:"100%"}}
          style={{width: "40%", margin: "auto", marginTop: "25px"}}
        />
        <TextField
          id="description"
          type="text"
          value={this.props.data.description}
          floatingLabelText="Request Description"
          onChange={this.props.onInputChange}
          style={{width: "90%", margin: "auto", textAlign: "left"}}
          multiLine={true}
          rows={2}
          rowsMax={5}
        />
        <div style={{width:"100%"}}>
          <Toggle
            id="reimbursable"
            label="Is this Reimbursable from the Institute?"
            toggled={this.props.data.reimbursable}
            onToggle={this.props.onToggle}
            style={{width: "40%", margin: "auto", marginTop: "20px", fontSize: "16px"}}
          />
        </div>
        <TextField
          id="title"
          type="text"
          disabled={true}
          value={this.props.data.added_by.name}
          floatingLabelText="Added By"
          inputStyle={{textAlign: "center"}}
          style={{width: "40%", margin: "auto"}}
        />
        <DatePicker
          floatingLabelText="Date Added"
          value={this.props.data.add_date}
          disabled={true}
          inputStyle={{textAlign: "center"}}
          textFieldStyle={{width:"100%"}}
          style={{width: "40%", margin: "auto"}}
        />
      </div>
    )
  }
}

class BudgetRequest extends Component {
  constructor() {
    super();

    this.initState = {
      id: "",
      title: "",
      amount: "",
      request_type: null,
      payment_mode: null,
      payment_date: null,
      description: "",
      added_by: null,
      add_date: null,
      reimbursable: false,
      error: null,
    };
    this.state = this.initState;
  }
  componentWillMount() {
    const id = queryString.parse(this.props.location.search).id;
    checkLogin.call(this, (response) => {
      let date = new Date();
      this.setState({
        id: "Outflow_" + response.user.email + "_" + date.getTime(),
        added_by: response.user,
        add_date: date,
        user: response.user,
      });
      if (id)
        this.updateRequestFromServer(id);
    })
  }
  handleInputChange = (event) => {
    this.setState({[event.target.id]: event.target.value});
  };
  handleSelectChange = (id) => (event, index, value) => {
    this.setState({[id]: value});
  };
  handleToggle = (event, toggled) => {
    this.setState({[event.target.id]: toggled});
  };
  handleDateChange = (event, date) => {
    this.setState({payment_date: date});
  };
  updateRequestFromServer = (id) => {
    getBudgetRequest(id)
      .then(function (response) {
        if (!response.error) {
          this.setState(response.request);
          this.setState({update: true, add_date: new Date(response.request.add_date)});
          if (response.request.payment_date)
            this.setState({payment_date: new Date(response.request.payment_date)});
        }
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  handleSubmit = (e) => {
    e.preventDefault();
    let request = JSON.parse(JSON.stringify(this.state));
    delete request.error;
    delete request.user;
    delete request.update;
    if (!request.amount) {
      this.setState({error: "Please enter Amount"});
      return
    }
    if (!request.title) {
      this.setState({error: "Please enter Title"});
      return
    }
    if (!request.request_type) {
      this.setState({error: "Please enter Request Type"});
      return
    }
    addBudgetRequest(request)
      .then(function (response) {
        if (!response.error && !this.state.update) {
          this.setState(this.initState);
          let date = new Date();
          if (!this.update) {
            this.setState({
              id: "Outflow_" + this.state.user.email + "_" + date.getTime(),
              added_by: this.state.user,
              add_date: date,
              error: response.message,
            });
          } else
            this.setState({error: response.message});
        }
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  render() {
    return (
      <div>
        {((this.state.update && !this.state.id) || !this.state.added_by) && <Loading/>}
        {(((this.state.update && this.state.id) || !this.state.update) && this.state.added_by) &&
        <div style={{alignItems: "centre"}}>
          <Card style={{width:"100%", maxWidth:"1000px", display:"inline-block", height: "auto", marginTop:'20px'}} zDepth={1}>
            <CardTitle title="Create Budget Request" style={{backgroundColor: "DarkSeaGreen"}}/>
            <CardText>
              <RequestInfo
                data={this.state}
                onInputChange={this.handleInputChange}
                onSelectChange={this.handleSelectChange}
                onToggle={this.handleToggle}
                onDateChange={this.handleDateChange}
              />
            </CardText>
            <CardActions>
              <RaisedButton
                label="Submit Budget Request"
                onTouchTap={this.handleSubmit}
                backgroundColor="lightgray"
                style={{width: "80%", margin: "auto"}}
              />
            </CardActions>
          </Card>
        </div>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

export default BudgetRequest;