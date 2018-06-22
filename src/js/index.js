import 'babel-polyfill';
import React, { Component } from 'react';
import ReactDOM, { render } from 'react-dom';
import App from './containers/App';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/normalize.css';
import '../css/route-editor-app.css';

ReactDOM.render(<App />, document.getElementById('root'));
