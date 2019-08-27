/**
 * Created by Nikhil on 23/05/17.
 */
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class Error extends Component {
  isSuccess() {
    return (this.props.message.indexOf("success") !== -1)
  }
  render() {
    const actions = [
      <FlatButton
        label="OK"
        primary={true}
        onTouchTap={this.props.onCancel}
      />,
    ];
    return (
      <Dialog
        title={this.isSuccess()? "Success!" : "Error!"}
        actions={actions}
        open={true}
        onRequestClose={this.props.onCancel}
        contentStyle={{width:"80%", maxWidth:"400px"}}
      >
        {this.props.message}
      </Dialog>
    )
  }
}

export default Error;