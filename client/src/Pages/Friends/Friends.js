import React from "react";
import Axios from 'axios';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import SpyGlass from '@material-ui/icons/ControlPoint';
import './Friends.css';

class Friends extends React.Component {
    constructor() {
        super();
        this.state = {
            search: '',
            friends: [],
            pending: [],
            added: false,
            success: ''
        }
        this.searchFriends = this.searchFriends.bind(this);
        this.onChange = this.onChange.bind(this);
        this.addFriend = this.addFriend.bind(this);
    }

    componentWillMount() {
        Axios.get('/friends', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            this.setState({
                friends: res.data.friends,
                pending: res.data.pending
            })
        })
        .catch(err => {
            console.log('error');
        })
    }

    searchFriends() {
        Axios.get(`/friends?friend=${this.state.search}`)
        .then(res => {
            Axios.post(`/friends/${res.data.friend.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(done => {
                this.setState({
                    added: true,
                });
            })
        })
        .catch(err => {
            this.setState({
                added: false,
            })
        })
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    addFriend(id) {
        Axios.put(`/friends/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            this.setState({
                success: 'Friend added successfully!'
            })
        })
        .catch(err => {
            console.log(err);
        })
    }

    render() {
        let friends = this.state.friends.map((friend, key) => {
            return (
                <li key={key}>{friend.username}</li>
            )
        })

        let pending = this.state.pending.map((pending, key) => {
            return (
                <li key={key} onClick={() => this.addFriend(pending._id)}>{pending.username}</li>
            )
        })

        return (
            <div className="Friends">
                <div className="FriendsList">
                    { this.state.added ? <p>Friend added!</p> : null}
                    { this.state.success.length > 0 ? <p>{this.state.success}</p>: null}
                    <form onSubmit={e => e.preventDefault()}>
                        <TextField
                            name="search"
                            fullWidth={true}
                            onChange={this.onChange}
                            label="Add your friends!"
                            error={this.state.searchSuccess ? true : false}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                <IconButton
                                    type="submit"
                                    aria-label="Toggle password visibility"
                                    onClick={this.searchFriends}
                                >
                                    <SpyGlass />
                                </IconButton>
                                </InputAdornment>
                                )
                            }}
                        />
                    </form>
                    <div className="YourFriends">
                        <div>
                            <h3>Friends</h3>
                            {friends}
                        </div>
                        <div>
                            <h3>Pending</h3>
                            {pending}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Friends;