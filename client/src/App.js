// import react components
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

// import pages
import Home from './Pages/Home/Home';
import Registration from './Pages/Registration/Registration';
import Login from './Pages/Login/Login';
import NotFound from './Pages/NotFound/NotFound';
import Map from './Pages/Map/Map';
import Settings from './Pages/Settings/Settings';

// import custom components
import Navigation from './Components/Navbar/Navbar';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';

// import css
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false
        }
    }

    componentWillMount() {
        if (localStorage.getItem('token') !== null) {
            this.setState({
                isLoggedIn: true
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                { this.state.isLoggedIn
                ?   <Navigation isLoggedIn={this.state.isLoggedIn} />
                :   null
                }
                
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Registration} />
                    <PrivateRoute isLoggedIn={this.state.isLoggedIn} path="/map" component={Map} />
                    <PrivateRoute isLoggedIn={this.state.isLoggedIn} path="/settings" component={Settings} />
                    <Route path="*" component={NotFound} />
                </Switch>
            </React.Fragment>
            
        );
    }
}

export default App;
