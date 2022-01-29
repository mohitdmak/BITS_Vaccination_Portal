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

// added by --- Mohit
// Setting appropriate host 
let host;
if (process.env.REACT_APP_ADMIN_CLIENT_ENV === 'development') {
    host = 'http://localhost:1370';
} else if (process.env.REACT_APP_ADMIN_CLIENT_ENV === 'production') {
    host = 'https://vaccination.bits-dvm.org';
}

function App() {
  const [isLoggedIn, setLogin] = useState(localStorage.getItem('jwt') ? true : false)

  useEffect(() => {
    apiRequest();
  }, []);

  const apiRequest = () => {
    fetch(host + '/api/admin/details/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
      })
      .then(response => {
        if (response.ok) {
          setLogin(true);
          return response.json();
        }
        return Promise.reject(response);
      }
      )
      .then(data => {
        console.log(data);
      })
      .catch((response) => {
        setLogin(false);
        try {
        console.log(response.status, response.statusText);
        // 3. get error messages, if any
        response.json().then((json) => {
          console.log(json);
        })
      } catch (e) {
        console.log(response);
        console.log(e);
      }
      });
  }


  return (
    <Router>
      <>
        <Switch>

          <Route path="/student/:id">
            <Student />
          </Route>

          <Route path="/dashboard">
            {localStorage.getItem('jwt') ? <Landing /> : <Redirect to="/" />}
          </Route>

          <Route path="/">
            {localStorage.getItem('jwt') ? <Landing /> : <Login />}
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
