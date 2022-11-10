import React from "react";
import PropsTypes from "prop-types"

type ScoreProps = {
    total: number
    position: string
    player: string
}

class Score extends React.Component<ScoreProps> {
    static propTypes = {
        total: PropsTypes.number,
        position: PropsTypes.oneOf(["left", "right"]).isRequired,
        player: PropsTypes.string.isRequired
     };

    static defaultProps = {
        total: 0
    }
 
    render() {
       return (
          <div  className={this.props.position}>
            <h2>Player {this.props.player}</h2>
            <h2 >{this.props.total}</h2>
          </div>
       );
    }
 }
 
 export default Score