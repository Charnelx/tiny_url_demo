import { createStore, combineReducers } from 'redux';

const defaultBaseURL = { url: '' };
const defaultHistoryList = { history: [], url: '', link: '' };

// URL input reducer
function urlReducer(state = defaultBaseURL, action) {
  switch (action.type) {
    case 'BASE_URL_SET':
      return Object.assign({}, state, { url: action.url });

    default: return state;
  }
}

function historyListReducer(state = defaultHistoryList, action) {
  switch (action.type) {
    case 'UPDATE_HISTORY':
      return Object.assign({}, state, { history: action.historyList,
        url: action.url,
        link: action.link });

    default: return state;
  }
}

// Combine Reducers
const reducers = combineReducers({
  baseURL: urlReducer,
  historyList: historyListReducer
});

const store = createStore(reducers);

export default store;
