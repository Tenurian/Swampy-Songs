/**
 * Created by tfeue on 6/16/2017.
 */
/**
 * Created by tfeue on 6/16/2017.
 */
/*global $*/
/*global React*/
/*global ReactDOM*/

const Mode = {
    LOGIN: 100,
    ADMIN: 500,
};

class Admin extends React.component {
    logout(){

    }

    render(){
        return(
            <div>Admin component - NEI</div>
        )
    }
}

class Login extends React.component{
    login(){
        console.warn('Login is not implemented');
    }

    render(){
        return(
            <div>Login component - NEI</div>
        )
    }
}



class App extends React.Component {
    state = Mode.LOGIN;

    setMode(mode){
        this.setState(mode);
    }

    renderMode(){
        switch(this.state){
            case Mode.LOGIN:
                return( <Login setMode={this.setMode.bind(this)}/> );
            case Mode.ADMIN:
                return( <Admin setMode={this.setMode.bind(this)}/> );
            default:
                return (
                    <div>Component does not exist.</div>
                )
        }
    }

    render() {
        this.renderMode();
    }
}

ReactDOM.render(<App />, document.getElementById('root'));