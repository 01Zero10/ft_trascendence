import { IconArrowBack, IconDoor } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import './PageNotFound.css'

export default function PageNotFound() {


	let navigate = useNavigate(); 
	const routeChange = () =>{ 
	  let path = `home`; 
	  navigate(path);
	}

	return (
		<>
			<div className="pageNotFound_container">
				<p className="pageNotFoundText pageNotFound404">404</p>
				<p className="pageNotFoundText">HAI SBAGLIATO QUALCOSA</p>
				<button className="pageNotFound_backHomeButton" onClick={routeChange}>
					<div className="pageNotFound_backHomeButton_content">
						BACK HOME <IconArrowBack size={"2.5rem"}/>
					</div>
				</button>
			</div>
			<div className='_prv_'></div>
		</>
	)
}