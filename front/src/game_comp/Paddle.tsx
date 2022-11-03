import { useEffect } from "react"

function Paddle(props: any) {
   // static propTypes = {
   //    x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
   //    y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
   //    onKeyDown: PropTypes.func,
   //    tabIndex: PropTypes.string
   // };

   // static defaultProps = {
   //    onKeyDown: Function.prototype,
   //    tabIndex: ""
   // };

   return (
      <div
         role="button"
         className="Paddle"
         //tabIndex={this.props.tabIndex}
         style={{
            width: "15px",
            height: "150px",
            position: "absolute",
            backgroundColor: "#ffffff",
            opacity: "0.7",
            top: `${props.y}px`,
            left: `${props.x}px`
         }}
      >
         <input type="text" className="paddleInput" />
      </div>
   );

}
export default Paddle;