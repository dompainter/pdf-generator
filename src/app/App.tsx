import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import DocumentView from './components/DocumentView/DocumentView';

function App(): JSX.Element {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <DocumentView />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
