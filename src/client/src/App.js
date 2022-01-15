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


// /api/student/details

function App() {

  const [isLoggedIn, setLogin] = useState(false)

  useEffect(() => {
    apiRequest();
}, []); 

const apiRequest = () => {
    fetch('https://vaccination.bits-dvm.org/api/student/details/',
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
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/dashboard">
          {isLoggedIn ? <Dashboard /> :  <Redirect to="/login" />}
        </Route>
        <Route exact path="/">
          {isLoggedIn ? <Dashboard /> : <Login />}
        </Route>
        <Route path="/devs">
          <Devs />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
       
      </Switch>
      </>
    </Router>
  );
}

export default App;
