/**
 * Created by tfeue on 6/16/2017.
 */
/*global $*/
/*global React*/
/*global PropType*/
/*global ReactDOM*/
/*global Redux*/
// const socket = io('http://localhost:31415');
const socket = io('https://swampy-songs-tenurian.c9users.io:8082');
const Component = React.Component;

const SongsApp = (state = {user: {}, songs: []}, action) => {
    switch (action.type){
        case 'load_data':
            return action.obj;
        case 'update':
            if(state.user){
                if(state.user._id === action.obj.user._id){
                    return action.obj;
                } else {
                    return Object.assign({}, action.obj, {user: state.user});
                }
            }
        default:
            return state;
    }
};

class App extends Component{
    componentDidMount(){
        // /*this is pretty f***ing nifty*/
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    doVote(song_id){
        // const { store } = this.context;
        // const state = store.getState();
        // let that = this;
        console.log('do vote');
        // console.log(this);
        // console.log(song_id);
        socket.emit('vote',song_id);
        // $.ajax({
        //     url: '/vote',
        //     type: 'POST',
        //     contentType: 'application/json',
        //     data: JSON.stringify({
        //         song_id: song_id
        //     }),
        //     success(d){
        //         console.log('success!');
        //         let data = JSON.parse(d);
        //         console.log(data);
        //         that.setState(data);
        //     }
        // });
    }

    render() {
        const { store } = this.context;
        const state = store.getState();
        console.log(state);
        const songs = state.songs;
        const user = state.user;
        return (
            <div>
                <h1>Welcome to Swampy Songs!</h1>
                <h3>Songs:</h3>
                <table id="songsTable">
                    <thead>
                    <tr>
                        <th>Votes</th>
                        <th>Song Name</th>
                        <th>Upvote</th>
                    </tr>
                    </thead>
                    <tbody>
                    {songs.map((song) => {
                        return (
                            <tr key={song._id}>
                                {/*<td className="songName">{song.name}</td>*/}
                                <td>{song.votes}</td>
                                <td className="songName"><a href={song.url}>{song.name}</a></td>
                                <td className="voteButtonContainer">
                                    <button id={song._id + "-btn"}
                                            className={"voteButton btn " + ((user.votes.indexOf(song._id) === -1) ? "" : "btn-success")}
                                            onClick={this.doVote.bind(this, song._id)}>
                                        <i className="fa fa-arrow-up">
                                        </i>
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        );
    }
}
App.contextTypes = {
    store: PropTypes.object
};

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

const { createStore } = Redux;
let store = createStore(SongsApp);

socket.on('load_data', (data) => {
    console.log(data);
    store.dispatch({type: 'load_data', obj: data});
});
socket.on('update', (data) => {
    console.log(data);
    store.dispatch({type: 'update', obj: data});
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>

    , document.getElementById('root'));
