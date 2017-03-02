import React from 'react'
import ReactDOM from 'react-dom'
import JQuery from 'jquery'


import {hashHistory, Router, Route, Redirect} from 'react-router'

import Layout from './layout/Layout'

import BlogPage from './pages/BlogPage'
import PicturePage from './pages/PicturePage'
import VideoPage from './pages/VideoPage'
//on this Route, / component Layout is being rendered

/*
this.props.children (<Routex§>)are being passed here (nested) when declaring
this.props.children on the parent class 
*/
const app = (
  <Router history={hashHistory}>
    <Redirect from="/" to="/blog" />
   
    <Route path="/" component={Layout}>

      <Route path="blog" component={BlogPage}/>
      <Route path="picture" component={PicturePage}/>
      <Route path="video" component={VideoPage}/>
    </Route>

  </Router>
)

JQuery(function() {
    ReactDOM.render(
    app,
        document.getElementById('app'),
        function() {
            console.timeEnd('react-time')
        }
    );
});
