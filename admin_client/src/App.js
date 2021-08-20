import React, { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import Login from './screens/Login'
import Landing from './screens/Landing'
import Student from './screens/Student'


function App() {
  const [isLoggedIn, setLogin] = useState(false)

  useEffect(() => {
    apiRequest();
  }, []); 
  
  const apiRequest = () => {
    fetch('https://vaccination.bits-dvm.org/api/admin/details/',
    {   
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
    }
    }).then(response => 
    response.json().then(data => ({
        data: {},
        status: response.status
    })).then(res => 
    {
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
            {isLoggedIn ? <Landing /> :  <Redirect to="/login" />}
          </Route>

          <Route path="/">
            {isLoggedIn ? <Landing /> : <Login />}
          </Route>

          <Route path="*">
            <Redirect to="/" />
          </Route>

          <Route path="/student/:id">
              <Student />
          </Route>
        </Switch>
      </>
    </Router>
  );
}
  
export default App;
