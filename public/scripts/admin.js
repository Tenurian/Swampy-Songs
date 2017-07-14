/**
 * Created by tfeue on 6/16/2017.
 */
/*global $*/
/*global React*/
/*global PropTypes*/
/*global ReactDOM*/
/*global Redux*/

// const socket = io('https://swampy-songs-tenurian.c9users.io:8082');
const socket = io('http://localhost:8082');

const { Component } = React;

const Song = (state, action) => {
    switch (action.type){
        case 'song-update':
            if(action.id !== state._id){
                return state;
            }
            switch (action.edit){
                case 'votes':
                    return {
                        ...state,
                        votes: action.val
                    };
                case 'name':
                    return {
                        ...state,
                        name: action.val
                    };
                case 'url':
                    return {
                        ...state,
                        url: action.val
                    };
                default:
                    return state;
            }
    }
};

const SongsApp = (state = [], action) => {
    switch (action.type){
        case 'load_data':
            return action.obj;
        case 'song-update':
            return state.map((s) => Song(s,action));
        default:
            return state;
    }
};

const { createStore } = Redux;
let store = createStore(SongsApp);

socket.on('load_data', (data) => {
    console.log(data);
    store.dispatch({type: 'load_data', obj: data.songs});
});
socket.on('update', (data) => {
    console.log(data);
    store.dispatch({type: 'update', obj: data.songs});
});

function setCookie(cookie_name, cookie_value, expiration_seconds) {
    let d = new Date();
    d.setTime(d.getTime() + ( expiration_seconds * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cookie_name + "=" + cookie_value + ";" + expires + ";path=/";
}

function getCookie(cookie_name) {
    let name = cookie_name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const Mode = {
    LOGIN: 100,
    ADMIN: 500,
};

class Admin extends Component {

    componentDidMount(){
        // /*this is pretty f***ing nifty*/
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        socket.close();
        this.unsubscribe();
    }

    logout(){
        deleteCookie('user');
        this.props.setMode(Mode.LOGIN);
    }

    render(){
        const { store } = this.context;
        const state = store.getState();
        const { user } = JSON.parse(getCookie('user'));
        console.log(state);
        return(
            <div>
                <div style={{textAlign: 'center', width: '100%'}}>
                    <h1 style={{textAlign: 'center'}}>Welcome, {user.username}.</h1>
                    <div><button className="btn btn-danger" onClick={() => this.logout}>Logout</button></div>
                    <h3>Songs:</h3>
                </div>
                <table id="songsTable">
                    <thead>
                        <tr>
                            <th>Votes</th>
                            <th>Song Name</th>
                            <th>Src</th>
                        </tr>
                    </thead>
                    <tbody>
                    {state.map((song) => {
                        return (
                            <tr key={song._id}>
                                {/*<td className="songName">{song.name}</td>*/}
                                <td>
                                    <input
                                        style={{paddingLeft: '10px', paddingRight: '10px'}}
                                        className="form-input"
                                        value={song.votes}
                                        type="number"
                                        onChange={e => {
                                            store.dispatch({
                                                type: 'song-update',
                                                edit:'votes',
                                                id: song._id,
                                                val: e.target.value
                                            });

                                            socket.emit('admin-update',{
                                                user,
                                                song: {
                                                    ...song,
                                                    votes: e.target.value
                                                }
                                            });
                                        }}
                                    />
                                </td>
                                <td className="songName">
                                    <input
                                        value={song.name}
                                        onChange={e => {
                                            store.dispatch({
                                                type: 'song-update',
                                                edit:'name',
                                                id: song._id,
                                                val: e.target.value
                                            });

                                            socket.emit('admin-update',{
                                                user,
                                                song: {
                                                    ...song,
                                                    name: e.target.value
                                                }
                                            });
                                        }}
                                    />
                                </td>
                                <td className="songSrc">
                                    <input
                                        value={song.url}
                                        onChange={e => {
                                            store.dispatch({
                                                type: 'song-update',
                                                edit:'url',
                                                id: song._id,
                                                val: e.target.value
                                            });

                                            socket.emit('admin-update',{
                                                user,
                                                song: {
                                                    ...song,
                                                    url: e.target.value
                                                }
                                            });
                                        }}
                                    />
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}
Admin.contextTypes = {
    store: PropTypes.object
};

class Login extends Component{
    state = {error: null};
    attemptLogin(e) {
        e.preventDefault();
        let that = this;
        let z_username = $('#login_username').val().toString();
        let z_password = $('#login_password').val().toString();
        z_password = CryptoJS.SHA256(z_password).toString();
        if (z_username === "" || z_password === CryptoJS.SHA256("").toString()) {
            this.setState({
                error: <ErrorAlert msg="You need to provide a username and password" />
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/login',
                contentType: 'application/json',
                data: JSON.stringify({
                    username: z_username,
                    password: z_password
                }),
                success(data) {
                    let d = JSON.parse(data);
                    console.log(d);
                    setCookie('user', JSON.stringify(d), 15 * 60);
                    that.props.setMode(Mode.ADMIN);
                },
                error(err) {
                    console.error('Whoops!', err);
                }
            });
        }
    }

    componentDidMount() {
        $('#login-form').validator();
    }

    render() {
        return (
            <div className="container">
                <h1>Login</h1>
                <div id="login-errors">
                    {(this.state.error === undefined)?"":this.state.error}
                </div>
                <form id="login-form" data-toggle="validator" onSubmit={this.attemptLogin.bind(this)}>
                    <div className="form-group">
                        <label htmlFor="username"> Username: </label>
                        <input id="login_username" className="form-control" name="username" type="text" placeholder="Username" required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password"> Password: </label> <input id="login_password" className="form-control" name="password" type="password" placeholder="Password" required/>
                    </div>
                    <input className="btn btn-success" type="submit" value="Submit" onClick={ this.attemptLogin.bind(this) }/>
                </form>
            </div>
        );
    };
}

class App extends Component {
    state = {mode: Mode.LOGIN};

    componentDidMount(){
        let that = this;
        let login_token = JSON.parse(getCookie('user'));
        console.log(login_token);
        if(login_token){
            $.ajax({
                type: 'POST',
                url: '/login',
                contentType: 'application/json',
                data: JSON.stringify({
                    username: login_token.user.username,
                    password: login_token.user.password
                }),
                success(data) {
                    let d = JSON.parse(data);
                    console.log(d);
                    setCookie('user', JSON.stringify(d), 15 * 60);
                    that.setMode(Mode.ADMIN);
                },
                error(err) {
                    console.error('Whoops!', err);
                }
            });
        }
    }

    setMode(mode){
        this.setState({mode: mode});
    }

    renderMode(){
        switch(this.state.mode){
            case Mode.LOGIN:
                return <Login setMode={this.setMode.bind(this)} /> ;
            case Mode.ADMIN:
                return <Admin setMode={this.setMode.bind(this)} /> ;
            default:
                return <div>Component does not exist.</div> ;
        }
    }

    render() {
        return(this.renderMode());
    }
}

class Provider extends Component {
    getChildContext(){
        return {
            store: this.props.store
        };
    }
    render() {
        return this.props.children;
    }
}
Provider.childContextTypes = {
    store: PropTypes.object
};

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root'));