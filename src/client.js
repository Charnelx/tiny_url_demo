import React from 'react';
import ReactDOM   from 'react-dom';
import { Provider } from 'react-redux';

// React app import
import App from 'components/App';
import store from 'components/Store';

ReactDOM.render(
  <Provider store={store}><App/></Provider>,
  document.getElementById('root')
);
