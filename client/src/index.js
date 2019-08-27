import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './index.css';

const AppUI = () => (
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
);

injectTapEventPlugin();
ReactDOM.render(<AppUI />, document.getElementById('root'));
registerServiceWorker();
