/**
 * Created by Nikhil on 26/05/17.
 */
import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  TableFooter,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton'
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Delete from 'material-ui/svg-icons/action/delete';
import Add from 'material-ui/svg-icons/content/add';
import { checkLogin } from '../utils/sessionAPI'
import { getCategories, addCategory, deleteCategory } from '../utils/categoryAPI'
import Loading from './Loading'
import Error from './Error'
import Alert from './Alert'

class EventCategoryDelete extends Component {
  constructor() {
    super();

    this.state = {
      alert: null,
      error: null,
    };

    this.onDelete = this.onDelete.bind(this);
  }
  message() {return "Are you sure you wish to delete " + this.props.category.name + "?"}
  onDelete() {
    this.setState({alert: null});
    deleteCategory(this.props.category.key)
      .then(function (response) {
          if (!response.error)
            this.props.onDelete();
          else
            this.setState({error: response.message});
      }.bind(this));
  }
  render() {
    return (
      <div>
        <IconButton onClick={() => this.setState({alert: this.message()})} tooltip="Delete Category" style={{width:'30px'}}>
          <Delete hoverColor="firebrick"/>
        </IconButton>
        {this.state.alert && <Alert message={this.state.alert} onAccept={this.onDelete} onReject={() => this.setState({alert: null})}/>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

class EventCategoryAdd extends Component {
  render() {
    return (
      <TableRow>
        <TableRowColumn colSpan="3">
          <TextField
            id="name"
            type="text"
            value={this.props.category.name}
            onChange={this.props.handleInputChange}
            fullWidth={true}
            hintText="Category Name"
            hintStyle={{top: "5px", width: "100%", textAlign:"center"}}
            style={{backgroundColor: "white", height: "40px", borderRadius: "7px"}}
            inputStyle={{textAlign:"center"}}
          />
        </TableRowColumn>
        <TableRowColumn colSpan="2">
          <TextField
            id="key"
            type="text"
            value={this.props.category.key}
            onChange={this.props.handleInputChange}
            fullWidth={true}
            hintText="Category Key"
            hintStyle={{top: "5px", width: "100%", textAlign:"center"}}
            style={{backgroundColor: "white", height: "40px", borderRadius: "7px"}}
            inputStyle={{textAlign:"center"}}
          />
        </TableRowColumn>
        <TableRowColumn colSpan="1" style={{overflow:"visible"}}>
          <FloatingActionButton mini={true} onTouchTap={this.props.onAdd}>
            <Add/>
          </FloatingActionButton>
        </TableRowColumn>
      </TableRow>
    )
  }
}

class EventCategoryRow extends Component {
  render() {
    return (
      <TableRow key={this.props.category.key}>
        <TableRowColumn colSpan="3">{this.props.category.name}</TableRowColumn>
        <TableRowColumn colSpan="2">{this.props.category.key}</TableRowColumn>
        <TableRowColumn colSpan="1" style={{overflow:"visible"}}>
          <EventCategoryDelete category={this.props.category} onDelete={this.props.onDelete}/>
        </TableRowColumn>
      </TableRow>
    )
  }
}

class EventCategory extends Component {
  constructor() {
    super();

    this.state = {
      categories: null,
      newCategory: {
        name: "",
        key: "",
      },
      error: null,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.updateCategoriesFromServer = this.updateCategoriesFromServer.bind(this);
  }
  componentWillMount() {
    checkLogin.call(this, (response) => {
      this.setState({user: response.user});
      this.updateCategoriesFromServer();
    })
  }
  updateCategoriesFromServer() {
    getCategories()
      .then(function (response) {
        if (!response.error)
          this.setState({categories: response.categories});
        else
          this.setState({error: response.message});
      }.bind(this));
  }
  handleInputChange(event) {
    this.setState({
      newCategory: {
        ...this.state.newCategory,
        [event.target.id]: event.target.value,
      }
    })
  }
  handleAdd(event) {
    event.preventDefault();
    addCategory(this.state.newCategory)
      .then(function (response) {
        this.setState({error: response.message});
        if (!response.error) {
          this.setState({newCategory: {name: "", key: ""}});
          this.updateCategoriesFromServer();
        }
      }.bind(this));
  }
  render() {
    return (
      <div>
        {!this.state.categories && <Loading/>}
        {this.state.categories &&
        <div>
          <Paper style={{width:"100%", maxWidth:"500px", margin: "50px auto"}}>
            <Table fixedHeader={true} selectable={false}>
              <TableHeader displaySelectAll={false} enableSelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn colSpan="6" style={{textAlign: 'center', backgroundColor:"firebrick", fontSize:"20px", color:"white", fontFamily:"cursive"}}>
                    Rendezvous Event Categories
                  </TableHeaderColumn>
                </TableRow>
                <TableRow>
                  <TableHeaderColumn colSpan="3">Name</TableHeaderColumn>
                  <TableHeaderColumn colSpan="2">Key</TableHeaderColumn>
                  <TableHeaderColumn colSpan="1">Action</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} showRowHover={true}>
                {this.state.categories.map( (row, index) => (
                  <EventCategoryRow key={index} category={row} onDelete={this.updateCategoriesFromServer}/>
                ))}
              </TableBody>
              <TableFooter style={{backgroundColor: "firebrick"}}>
                <EventCategoryAdd
                  category={this.state.newCategory}
                  handleInputChange={this.handleInputChange}
                  onAdd={this.handleAdd}
                />
              </TableFooter>
            </Table>
          </Paper>
        </div>}
        {this.state.error && <Error message={this.state.error} onCancel={() => this.setState({error: null})}/>}
      </div>
    )
  }
}

export default EventCategory;