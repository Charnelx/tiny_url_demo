import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, Form } from 'react-bootstrap';
import store from './Store';

import LinksList from './parts/LinksList';

// import './general.css';


function getCookieData(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
        cookieValue = decodeURIComponent(
          cookie.substring(name.length + 1)
        );
        break;
      }
    }
  }
  return cookieValue;
}

function isUrlValid(userInput) {
  const regex = '(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z‌​]{2,6}\\b([-a-zA-Z0-9‌​@:%_\\+.~#?&=]*)';
  const pattern = new RegExp(regex);
  const res = userInput.match(pattern);

  return res !== null;
}

class App extends Component {

  constructor(props) {
    super(props);
    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleRunBtn = this.handleRunBtn.bind(this);
  }

  handleUrlChange(e) {
    store.dispatch({
      type: 'BASE_URL_SET',
      url: e.target.value
    });
  }

  handleRunBtn(e) {
    if(isUrlValid(this.props.baseURL)){
      const csrfToken = getCookieData('csrftoken');

      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-csrftoken': csrfToken
        },
        withCredentials: true
      };
      const body = { url: this.props.baseURL };
      axios.post('http://127.0.0.1:8000', body, config).then(response => {
        const data = response.data;
        console.log('body:', data);
        if (!('errors' in data)) {
          store.dispatch({
            type: 'UPDATE_HISTORY',
            historyList: data.history,
            url: data.url,
            link: data.link
          });
        }
      }).catch((error) => {
        store.dispatch({
          type: 'BASE_URL_SET',
          url: 'Error occurred. Try again later.'
        });
        console.log(error);
      });
    } else {
      store.dispatch({
        type: 'BASE_URL_SET',
        url: 'Invalid link'
      });
    }
    e.preventDefault();
  }

  render() {
    return (
      <div>
        <Form inline>
          <div className='container form-control-col-centered'>
            <fieldset id='tlink'>
              <div id='urlbox'>
                <FormGroup bsSize='large'>
                  <span>
                    <FormControl
                      type='text'
                      id='formControlsText'
                      placeholder='Past your link here'
                      bsSize='large'
                      value={this.props.baseURL}
                      onChange={this.handleUrlChange}
                    />
                    <Button bsStyle='warning' bsSize='large' onClick={this.handleRunBtn}>Run</Button>
                  </span>
                </FormGroup>
              </div>
            </fieldset>
            <LinksList/>
          </div>
        </Form>
      </div>
    );
  }
}

App.propType = {
  baseURL: PropTypes.object
};


function mapStateToProps(storage) {
  return {
    baseURL: storage.baseURL.url,
    historyList: storage.historyList.history
  };
}

export default connect(mapStateToProps)(App);
