/**
 * Created by Nikhil on 26/05/17.
 */
/**
 * Created by Nikhil on 23/05/17.
 */
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

class Alert extends Component {
  render() {
    const actions = [
      <FlatButton
        key="0"
        label="No"
        primary={true}
        onTouchTap={this.props.onReject}
      />,
      <RaisedButton
        key="1"
        label="Yes"
        primary={true}
        onTouchTap={this.props.onAccept}
      />,
    ];
    return (
      <Dialog
        title="Alert!"
        actions={actions}
        open={true}
        onRequestClose={this.props.onReject}
        contentStyle={{width:"80%", maxWidth:"450px"}}
      >
        {this.props.message}
      </Dialog>
    )
  }
}

export default Alert;