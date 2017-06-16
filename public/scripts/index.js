/**
 * Created by tfeue on 6/16/2017.
 */
/*global $*/
/*global React*/
/*global ReactDOM*/

class App extends React.Component {
    state = {
        user: {},
        songs: []
    };

    componentDidMount() {
        let that = this;
        $.ajax({
            url: '/pull',
            success(d){
                console.log('Success!');
                let data = JSON.parse(d);
                console.log(data);
                that.setState(data);
            }
        });
    }

    doVote(song_id){
        let that = this;
        console.log('do vote');
        console.log(this);
        console.log(song_id);
        $.ajax({
            url: '/vote',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                song_id: song_id
            }),
            success(d){
                console.log('success!');
                let data = JSON.parse(d);
                console.log(data);
                that.setState(data);
            }
        });
    }

    render() {
        return(
            <div>
                <h1>Welcome to Swampy Songs!</h1>
                <h3>Songs:</h3>
                <ul>
                    {this.state.songs.map((song) => {
                        return(
                            <li key={song._id}>
                                <span className="votes">{song.votes}</span>
                                <span className="songName"> {song.name}</span>
                                <span className="voteButtonContainer">
                                    <button id={song._id + "-btn"} className={"voteButton btn " + ((this.state.user.votes.indexOf(song._id) === -1)?"btn-primary":"btn-success")} onClick={this.doVote.bind(this, song._id)}>
                                        <i className="fa fa-arrow-up">
                                        </i>
                                    </button>
                                </span>
                            </li>)
                    })}
                </ul>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));