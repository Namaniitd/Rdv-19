/**
 * Created by Nikhil on 23/05/17.
 */
import React, { Component } from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';

class Loading extends Component {
  render() {
    return (
      <div style={{marginTop:"15%"}}>
        <RefreshIndicator
          size={100}
          left={0}
          top={-20}
          status="loading"
          style={{display: 'inline-block', position: 'relative'}}
        />
      </div>
    )
  }
}

export default Loading;