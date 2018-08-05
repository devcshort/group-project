import React, { Component } from "react";
import "./Registration.css";
import RegistrationForm from "./RegistrationForm";
import { Redirect } from 'react-router-dom';


class Registration extends Component {
    state = {
        fields: {}
    };
    //onChange stuff goes here:
    onChange = update => {
        this.setState({
            fields: {
                ...this.state.fields,
                ...update
            }
        });
    };

    render() {
        if (localStorage.getItem('token') !== null) {
            return <Redirect to='/dashboard' />
        } else {
            return (
                <div className="Registration">
                    <div className="Registration-header">
                        <h1>Registration</h1>
                        <h2>Welcome new user!</h2>
                    </div>
                    <RegistrationForm onChange={fields => this.onChange(fields)} />
                </div>
            );
        }
    }
}

export default Registration;