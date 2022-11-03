import { Box } from "@mantine/core";
import "./GameMenu.css"

function GameMenu() {

    return (
        <div className="square_container">


            <Box id="_left" className="square_box" sx={{ backgroundColor: 'white' }}>

            </Box>
            <Box id="_right" className="square_box" sx={{ backgroundColor: 'red' }}>

            </Box>
        </div>
    );
}
export default GameMenu;