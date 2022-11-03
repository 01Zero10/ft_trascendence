import React from "react";

type BallProps = {
   x: string
   y: string
}

class Ball extends React.Component<BallProps> {
   render() {
      return (
         <div
            style={{
               width: "30px",
               height: "30px",
               top: `${this.props.y}px`,
               left: `${this.props.x}px`,
               position: "absolute",
               backgroundColor: "white"
            }}
            className="PongBall"
         />
      );
   }
}

export default Ball;