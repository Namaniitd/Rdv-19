import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar'
import './App.css';
import routes from './routes'

class App extends Component {
  onLogout() {
    localStorage.removeItem('RDV_JWT');
    window.location.reload();
  }
  render() {
    return (
      <BrowserRouter basename='/admin'>
        <div className="App">
          <Navbar onLogout={this.onLogout}/>
          {routes}
        </div>
      </BrowserRouter>
    );
  }
}

export default App;