import { useState } from 'react'
import './App.css'
import TextEditor from './TextEditor'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import {
  Redirect ,
} from 'react-router-dom';
import {Switch
} from 'react-router-dom';
import {v4 as uuidV4} from "uuid";
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
    <Switch>
      <Route path='/' exact>
<Redirect to={`/documents/${uuidV4()}`}/>
      </Route>
      <Route path='/documents/:id'>
      <TextEditor/>

      </Route>
    </Switch>


    </Router>
  )
}

export default App
