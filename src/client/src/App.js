import { React, useState, useEffect } from 'react'
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";


// import { Heading } from '@chakra-ui/react'

import Dashboard from './screens/Dashboard.js'
import Login from './screens/Login.js'
import Devs from './screens/Devs.js'

// added by --- Mohit
// Setting appropriate host 
let host;
if (process.env.REACT_APP_CLIENT_ENV === 'development') {
    host = 'http://localhost:1370';
} else if (process.env.REACT_APP_CLIENT_ENV === 'production') {
    host = 'https://vaccination.bits-dvm.org';
}

// /api/student/details

function App() {

  const [isLoggedIn, setLogin] = useState(false)

  useEffect(() => {
    apiRequest();
}, []); 

const apiRequest = () => {
    fetch(host + '/api/student/details/',
      {   
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
      }).then(response => 
        response.json().then(data => ({
            data: data,
            status: response.status
        })).then(res => {
    if(res.data.error){
        setLogin(false)
    } else {
        setLogin(true)
    }
  }))
}

  return (
    <Router>
      <>
      <Switch>
        <Route path="/rejoining/login">
          <Login />
        </Route>
        <Route path="/rejoining/dashboard">
          {isLoggedIn ? <Dashboard /> :  <Redirect to="/rejoining/login" />}
        </Route>
        <Route exact path="/rejoining">
          {isLoggedIn ? <Dashboard /> : <Login />}
        </Route>
        <Route path="/rejoining/devs">
          <Devs />
        </Route>
        <Route path="*">
          <Redirect to="/rejoining" />
        </Route>
       
      </Switch>
      </>
    </Router>
  );
}

export default App;
