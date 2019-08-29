/**
 * Created by Nikhil on 28/05/17.
 */
import queryString from 'query-string'
import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';
import Delete from 'material-ui/svg-icons/action/delete';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Card, CardText, CardTitle, CardActions} from 'material-ui'
import TextField from 'material-ui/TextField';
import { checkLogin } from '../utils/sessionAPI'
import { getVenues } from '../utils/venueAPI'
import { uploadPhoto, addEvent, getEvent } from '../utils/eventAPI'
import { getCategories } from '../utils/categoryAPI'
import Error from './Error'
import Loading from './Loading'

class DateTimeVenueRow extends Component {
  render() {
    let key = this.props.index;
    return (
      <div  style={{display: "flex", flexWrap: "wrap", width:"80%", margin: "auto"}}>
        <SelectField
          floatingLabelText="Type"
          value={this.props.dtv.type}
          onChange={this.props.onDTVSelectChange("type", key)}
          style={{width: "20%", margin: "auto"}}
        >
          <MenuItem value={null} primaryText=""/>
          <MenuItem value="Prelims" primaryText="Prelims"/>
          <MenuItem value="Finals" primaryText="Finals"/>
          <MenuItem value="Theme Release" primaryText="Theme Release"/>
        </SelectField>
        <SelectField
          floatingLabelText="Date"
          value={this.props.dtv.date}
          onChange={this.props.onDTVSelectChange("date", key)}
          style={{width: "20%", margin: "auto"}}
        >
          <MenuItem value="Day 1 (13/10)" primaryText="Day 1 (13/10)"/>
          <MenuItem value="Day 2 (14/10)" primaryText="Day 2 (14/10)"/>
          <MenuItem value="Day 3 (15/10)" primaryText="Day 3 (15/10)"/>
          <MenuItem value="Day 4 (16/10)" primaryText="Day 4 (16/10)"/>
        </SelectField>
        <TimePicker
          hintText="Start Time"
          value={this.props.dtv.start_time}
          onChange={this.props.onDTVTimeChange("start_time", key)}
          style={{width: "10%", margin: "auto"}}
          textFieldStyle={{width: "100%", margin: "auto", marginTop: "25px"}}
        />
        <TimePicker
          hintText="End Time"
          value={this.props.dtv.end_time}
          onChange={this.props.onDTVTimeChange("end_time", key)}
          style={{width: "10%", margin: "auto"}}
          textFieldStyle={{width: "100%", margin: "auto", marginTop: "25px"}}
        />
        <SelectField
          floatingLabelText="Venue"
          value={this.props.dtv.venue}
          onChange={this.props.onDTVSelectChange("venue", key)}
          style={{width: "15%", margin: "auto"}}
          maxHeight={200}
        >
        {this.props.venues.map((row, index) => (
          <MenuItem key={index} value={row.key} primaryText={row.key}/>
        ))}
        </SelectField>
        <IconButton onClick={this.props.deleteDTV(key)} style={{marginTop:'25px'}}>
          <Delete hoverColor="firebrick"/>
        </IconButton>
      </div>

    )
  }
}

class BasicInfo extends Component {
  isPOC() {
    if (!this.props.data.poc)
      return false;
    if (!this.props.data.poc.find(p => p.email === this.props.user.email))
      return false;
    return true;
  }
  render() {
    return (
      <div style={{display: "flex", flexWrap: "wrap"}}>
        <div style={{display: "flex", flexWrap: "wrap", width:"100%"}}>
          <TextField
            id="id"
            type="text"
            disabled={this.props.data.photos.some(p => p !== "None") || this.props.data.update}
            value={this.props.data.id}
            floatingLabelText="Unique ID (Alphanumerics Or Underscore, Eg. facc_trunk_painting)"
            inputStyle={{textAlign: "center"}}
            onChange={this.props.onInputChange}
            style={{width: "50%", margin: "auto"}}
          />
        </div>
        <TextField
          id="name"
          type="text"
          value={this.props.data.name}
          floatingLabelText="Name"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "40%", margin: "auto"}}
        />
        <TextField
          id="subheading"
          type="text"
          value={this.props.data.subheading}
          floatingLabelText="Subheading"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "40%", margin: "auto"}}
        />
        <SelectField
          floatingLabelText="Type"
          value={this.props.data.type}
          onChange={this.props.onSelectChange("type")}
          style={{width: "40%", margin: "auto"}}
        >
          <MenuItem value="Competitive" primaryText="Competitive Event"/>
          <MenuItem value="Professional" primaryText="Professional Performance"/>
          <MenuItem value="Informal" primaryText="Informal Event"/>
          <MenuItem value="Workshop" primaryText="Workshop"/>
          <MenuItem value="Activity" primaryText="Activity"/>
        </SelectField>
        <SelectField
          floatingLabelText="Category"
          value={this.props.data.category}
          onChange={this.props.onSelectChange("category")}
          style={{width: "40%", margin: "auto"}}
          maxHeight={200}
        >
        {this.props.data.categories.map((row, index) => (
          <MenuItem key={index} value={row.key} primaryText={row.name}/>
        ))}
        </SelectField>
        <div style={{width:"100%"}}>
          <Toggle id="poc" label="Are you a Point of Contact for this event?" toggled={this.isPOC()} onToggle={this.props.onPOCToggle} style={{width: "40%", margin: "auto", marginTop: "20px", fontSize: "16px"}}/>
        </div>
        <div style={{width:"100%"}}>
          <Toggle id="registration" label="Will Registration be required for this event?" toggled={this.props.data.registration} onToggle={this.props.onToggle} style={{width: "40%", margin: "auto", marginTop: "20px", fontSize: "16px"}}/>
        </div>
        {this.props.data.dtv.map((row, index) => (
          <DateTimeVenueRow
            key={index}
            index={index}
            dtv={row}
            venues={this.props.data.venues}
            onDTVSelectChange={this.props.onDTVSelectChange}
            onDTVTimeChange={this.props.onDTVTimeChange}
            deleteDTV={this.props.deleteDTV}
          />
        ))}
        <FlatButton
          label="Add Schedule Row"
          onTouchTap={this.props.addDTV}
          style={{width: "25%", margin: "auto", marginTop: "20px"}}
        />
      </div>
    )
  }
}

class DetailedInfo extends Component {
  render() {
    return (
      <div style={{display: "flex", flexWrap: "wrap"}}>
        <TextField value ="<b> ... </b> for Bold"/>
        <TextField value ="<i> ... </i> for Italics"/>
        <TextField value ="<u> ... </u> for Underline"/>
        <TextField style={{width: "20%", margin: "auto"}}
         value ="<br> for line breaks"/>

        <TextField
          id="description"
          type="text"
          value={this.props.data.description}
          floatingLabelText="Description"
          onChange={this.props.onInputChange}
          style={{width: "80%", margin: "auto"}}
          multiLine={true}
          rows={2}
          rowsMax={5}
        />
        <TextField
          id="rules"
          type="text"
          value={this.props.data.rules}
          floatingLabelText="Rules"
          onChange={this.props.onInputChange}
          style={{width: "80%", margin: "auto"}}
          multiLine={true}
          rows={2}
          rowsMax={5}
        />
        <TextField
          id="prizes"
          type="text"
          value={this.props.data.prizes}
          floatingLabelText="Prizes"
          onChange={this.props.onInputChange}
          style={{width: "80%", margin: "auto"}}
          multiLine={true}
          rows={2}
          rowsMax={5}
        />
        <div style={{display: "flex", flexWrap: "wrap", width: "80%", margin: "auto", marginTop: "20px"}}>
          <div style={{width: "20%", margin: "auto"}}>
            {(this.props.data.photos[0] === 'None') &&
            <RaisedButton
              containerElement='label'
              disabled={!this.props.data.id}
              label='Upload Image 1'>
              <input name="file" type="file" accept=".jpg, .jpeg" onChange={this.props.uploadPhoto(0)} disabled={!this.props.data.id} style={{display: "none"}}/>
            </RaisedButton>}
            {!(this.props.data.photos[0] === 'None') &&
            <div>
              <a href={this.props.data.photos[0]} target="_blank" rel="noopener noreferrer" style={{width: "80%"}}>
                <RaisedButton
                  label='View Image 1'
                />
              </a>
              <IconButton onClick={this.props.removePhoto(0)} style={{width: "10%"}}>
                <Delete hoverColor="firebrick"/>
              </IconButton>
            </div>}
          </div>
          <div style={{width: "20%", margin: "auto"}}>
            {(this.props.data.photos[1] === 'None') &&
            <RaisedButton
              containerElement='label'
              disabled={!this.props.data.id}
              label='Upload Image 2'>
              <input name="file" type="file" accept=".jpg, .jpeg" onChange={this.props.uploadPhoto(1)} disabled={!this.props.data.id} style={{display: "none"}}/>
            </RaisedButton>}
            {!(this.props.data.photos[1] === 'None') &&
            <div>
              <a href={this.props.data.photos[1]} target="_blank" rel="noopener noreferrer" style={{width: "80%"}}>
                <RaisedButton
                  label='View Image 2'
                />
              </a>
              <IconButton onClick={this.props.removePhoto(1)} style={{width: "10%"}}>
                <Delete hoverColor="firebrick"/>
              </IconButton>
            </div>}
          </div>
          <div style={{width: "20%", margin: "auto"}}>
            {(this.props.data.photos[2] === 'None') &&
            <RaisedButton
              containerElement='label'
              disabled={!this.props.data.id}
              label='Upload Image 3'>
              <input name="file" type="file" accept=".jpg, .jpeg" onChange={this.props.uploadPhoto(2)} disabled={!this.props.data.id} style={{display: "none"}}/>
            </RaisedButton>}
            {!(this.props.data.photos[2] === 'None') &&
            <div>
              <a href={this.props.data.photos[2]} target="_blank" rel="noopener noreferrer" style={{width: "80%"}}>
                <RaisedButton
                  label='View Image 3'
                />
              </a>
              <IconButton onClick={this.props.removePhoto(2)} style={{width: "10%"}}>
                <Delete hoverColor="firebrick"/>
              </IconButton>
            </div>}
          </div>
          <div style={{width: "20%", margin: "auto"}}>
            {(this.props.data.photos[3] === 'None') &&
            <RaisedButton
              containerElement='label'
              disabled={!this.props.data.id}
              label='Upload Image 4'>
              <input name="file" type="file" accept=".jpg, .jpeg" onChange={this.props.uploadPhoto(3)} disabled={!this.props.data.id} style={{display: "none"}}/>
            </RaisedButton>}
            {!(this.props.data.photos[3] === 'None') &&
            <div>
              <a href={this.props.data.photos[3]} target="_blank" rel="noopener noreferrer" style={{width: "80%"}}>
                <RaisedButton
                  label='View Image 4'
                />
              </a>
              <IconButton onClick={this.props.removePhoto(3)} style={{width: "10%"}}>
                <Delete hoverColor="firebrick"/>
              </IconButton>
            </div>}
          </div>
        </div>
      </div>
    )
  }
}

class Registration extends Component {
  render() {
    return (
      <div style={{display: "flex", flexWrap: "wrap"}}>
        <SelectField
          floatingLabelText="Type"
          value={this.props.data.reg_type}
          onChange={this.props.onSelectChange("reg_type")}
          style={{width: "30%", margin: "auto"}}
        >
          <MenuItem value="Single" primaryText="Single"/>
          <MenuItem value="Team" primaryText="Team"/>
        </SelectField>
        <SelectField
          floatingLabelText="Mode"
          value={this.props.data.reg_mode}
          onChange={this.props.onSelectChange("reg_mode")}
          style={{width: "30%", margin: "auto"}}
        >
          <MenuItem value="Website" primaryText="RDV Website"/>
          <MenuItem value="Email" primaryText="Over Email"/>
          <MenuItem value="External" primaryText="External Link/Form"/>
        </SelectField>
        <DatePicker
          hintText="Deadline"
          value={this.props.data.reg_deadline}
          onChange={this.props.onDeadlineChange}
          style={{width: "30%", margin: "auto", marginTop: "25px"}}
        />
        {this.props.data.reg_mode === "Email" &&
        <TextField
          id="reg_email"
          type="text"
          value={this.props.data.reg_email}
          floatingLabelText="Email For Registration"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "30%", margin: "auto"}}
        />}
        {this.props.data.reg_mode === "External" &&
        <TextField
          id="reg_link"
          type="text"
          value={this.props.data.reg_link}
          floatingLabelText="Link For Registration"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "30%", margin: "auto"}}
        />}
        {this.props.data.reg_type === "Team" &&
        <TextField
          id="reg_min_team_size"
          type="number"
          value={this.props.data.reg_min_team_size}
          floatingLabelText="Minimum Team Size"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "30%", margin: "auto"}}
        />}
        {this.props.data.reg_type === "Team" &&
        <TextField
          id="reg_max_team_size"
          type="number"
          value={this.props.data.reg_max_team_size}
          floatingLabelText="Maximum Team Size"
          inputStyle={{textAlign: "center"}}
          onChange={this.props.onInputChange}
          style={{width: "30%", margin: "auto"}}
        />}
        <div style={{width:"100%"}}>
          <Toggle id="reg_link_upload" label="Is Link Upload Required?" toggled={this.props.data.reg_link_upload} onToggle={this.props.onToggle} style={{width: "40%", margin: "auto", marginTop: "20px", fontSize: "16px"}}/>
        </div>
        <div style={{width:"100%"}}>
          <Toggle id="reg_status" label="Currently Taking Registrations?" toggled={this.props.data.reg_status} onToggle={this.props.onToggle} style={{width: "40%", margin: "auto", marginTop: "20px", fontSize: "16px"}}/>
        </div>
      </div>
    )
  }
}

class EventCreate extends Component {
  constructor() {
    super();
    this.initState = {
      id: "",
      name: "",
      subheading: "",
      type: "",
      category: "",
      registration: false,
      dtv: [],
      photos: ["None", "None", "None", "None"],
      description: "",
      rules: "",
      prizes: "",
      reg_type: "",
      reg_mode: "",
      reg_deadline: null,
      reg_email: "",
      reg_status: true,
      reg_min_team_size: null,
      reg_max_team_size: null,
      reg_link_upload: false,
      error: null,
    };
    this.state = this.initState;
  }
  componentWillMount() {
    const id = queryString.parse(this.props.location.search).id;
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateVenuesFromServer();
      this.updateCategoriesFromServer();
      if (id)
        this.updateEventFromServer(id);
    })
  }
  updateEventFromServer = (id) => {
    getEvent(id)
      .then(function (response) {
        if (!response.error) {
          this.setState(response.event);
          this.setState({dtv: response.event.dtv, photos: response.event.photos, update: true});
        }
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  updateVenuesFromServer = () => {
    getVenues()
      .then(function (response) {
        if (!response.error)
          this.setState({venues: response.venues});
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  updateCategoriesFromServer = () => {
    getCategories()
      .then(function (response) {
        if (!response.error)
          this.setState({categories: response.categories});
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  handleUploadPhoto = (index) => (event) => {
    const photoData = new FormData();
    if (event.target.files[0].size > 1024 * 1024) {
      this.setState({error: "Photo cannot be larger than 1MB"});
      return;
    }
    photoData.append('photo', event.target.files[0], this.state.id + "_" + (index + 1) + ".jpg");
    uploadPhoto(photoData).then((res) => {
      if (!res.error) {
        let photos = this.state.photos;
        photos[index] = res.img;
        this.setState({photos: photos, error: res.message});
      } else {
        this.setState({error: res.message});
      }
    }).bind(this);
  };
  handleRemovePhoto = (index) => () => {
    let photos = this.state.photos;
    photos[index] = "None";
    this.setState({photos: photos});
  };
  handleInputChange = (event) => {
    if (event.target.id === 'id' && !event.target.value.match(/^[A-Za-z0-9_]*$/))
      return;
    this.setState({[event.target.id]: event.target.value});
  };
  handleSelectChange = (id) => (event, index, value) => {
    this.setState({[id]: value});
  };
  handleToggle = (event, toggled) => {
    this.setState({[event.target.id]: toggled});
  };
  handleDeadlineChange = (event, date) => {
    this.setState({reg_deadline: date});
  };
  addDTV = () => {
    let dtv = this.state.dtv;
    dtv.push({type:null, date:"", start_time:null, end_time:null, venue:""});
    this.setState({dtv: dtv});
  };
  handleDTVSelectChange = (id, key) => (event, index, value) => {
    let dtv = this.state.dtv;
    dtv[key][id] = value;
    this.setState({dtv: dtv});
  };
  handleDTVTimeChange = (id, key) => (event, time) => {
    let dtv = this.state.dtv;
    dtv[key][id] = time;
    this.setState({dtv: dtv});
  };
  deleteDTV = (key) => () => {
    let dtv = this.state.dtv;
    dtv.splice(key, 1);
    this.setState({dtv: dtv});
  };
  handlePOCToggle = (event, toggled) => {
    if (toggled) {
      let poc = this.state.poc;
      if (!poc)
        poc = [];
      poc.push(this.state.user);
      this.setState({poc: poc});
    } else {
      let poc = this.state.poc;
      poc = poc.filter(p => p.email !== this.state.user.email);
      if (poc.length === 0)
        poc = null;
      this.setState({poc: poc});
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    let event = JSON.parse(JSON.stringify(this.state));
    delete event.venues;
    delete event.categories;
    delete event.user;
    delete event.error;
    if (!event.id) {
      this.setState({error: "Please enter ID"});
      return
    }
    if (!event.name) {
      this.setState({error: "Please enter Name"});
      return
    }
    if (!event.type) {
      this.setState({error: "Please enter Type"});
      return
    }
    if (!event.category) {
      this.setState({error: "Please enter Category"});
      return
    }
    if (!event.description) {
      this.setState({error: "Please enter Description"});
      return
    }
    if (event.dtv.some(d => !d.date || !d.start_time || !d.end_time || !d.venue)) {
      this.setState({error: "Please fill Schedule Row"});
      return
    }
    if (event.registration) {
      if (!event.reg_type) {
        this.setState({error: "Please enter Registration Type"});
        return
      }
      if (!event.reg_mode) {
        this.setState({error: "Please enter Registration Mode"});
        return
      }
    }
    event.category_name = this.state.categories.find(c => c.key === event.category).name;
    addEvent(event)
      .then(function (response) {
        if (!response.error && !this.state.update) {
          this.setState(this.initState);
          this.setState({dtv:[]});
          this.setState({photos:["None","None","None","None"]});
          this.setState({error: response.message});
        }
        else
          this.setState({error: response.message});
      }.bind(this));
  };
  render() {
    return (
      <div>
        {(!this.state.categories || !this.state.venues || (this.state.update && !this.state.id)) && <Loading/>}
        {(this.state.categories && this.state.venues && ((this.state.update && this.state.id) || !this.state.update)) &&
        <div style={{alignItems: "centre"}}>
          <Card style={{width:"100%", maxWidth:"1000px", display:"inline-block", height: "auto", marginTop:'20px'}} zDepth={1}>
            <CardTitle title="Create Event"/>
            <CardText>
              <Tabs>
                <Tab label="Basic Info">
                  <BasicInfo
                    data={this.state}
                    onInputChange={this.handleInputChange}
                    onSelectChange={this.handleSelectChange}
                    onToggle={this.handleToggle}
                    onDTVSelectChange={this.handleDTVSelectChange}
                    onDTVTimeChange={this.handleDTVTimeChange}
                    addDTV={this.addDTV}
                    deleteDTV={this.deleteDTV}
                    onPOCToggle={this.handlePOCToggle}
                    user={this.state.user}
                  />
                </Tab>
                <Tab label="Detailed Info">
                  <DetailedInfo
                    data={this.state}
                    onInputChange={this.handleInputChange}
                    uploadPhoto={this.handleUploadPhoto}
                    removePhoto={this.handleRemovePhoto}
                  />
                </Tab>
                {this.state.registration && <Tab label="Registration">
                  <Registration
                    data={this.state}
                    onInputChange={this.handleInputChange}
                    onSelectChange={this.handleSelectChange}
                    onDeadlineChange={this.handleDeadlineChange}
                    onToggle={this.handleToggle}
                  />
                </Tab>}
              </Tabs>
            </CardText>
            <CardActions>
              <RaisedButton
                label="Submit Event Data"
                primary={true}
                onTouchTap={this.handleSubmit}
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

export default EventCreate;
