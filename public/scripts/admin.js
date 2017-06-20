/**
 * Created by tfeue on 6/16/2017.
 */
/**
 * Created by tfeue on 6/16/2017.
 */
/*global $*/
/*global React*/
/*global ReactDOM*/


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

class Admin extends React.Component {
    logout(){
        deleteCookie('user');
        this.props.setMode(Mode.LOGIN);
    }

    render(){
        return(
            <div>Admin component - NEI</div>
        )
    }
}

class Login extends React.Component{
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



class App extends React.Component {
    state = {mode: Mode.LOGIN};

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

ReactDOM.render(<App />, document.getElementById('root'));