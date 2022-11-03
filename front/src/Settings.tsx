import { Box, Fab, Fade, IconButton, Modal, Popover, Switch, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import React, { useContext, useRef, useState } from 'react';
import { Student } from './App';
import './Settings.css'


const style2 = {
  position: 'absolute' as 'absolute',
  right: '15%',
  bottom: '12%',
  color: '#781C9C',
};

const style_badge = {
  position: 'absolute' as 'absolute',
  right: '38%',
  top: '25%',
  color: '#fff',
  bgcolor: '#781C9C',
}

const style_edit = {
  color: '#fff',
  bgcolor: '#781C9C',
  left: '4%',
  height: '35px',
  width: '35px ',
}

//Per sistemar il lose focus(pin da inserire e chiamata back)
const PinComponent = (prop: { setOpen: any, setChecked: any, checked: boolean }) => {

  const contextData = useContext(Student)

  const [pin, setPin] = React.useState("");

  const pinInput = (e: React.ChangeEvent<HTMLInputElement>) => {

    setPin(e.target.value)
    //console.log(e.target.value)
  }

  const clickPin = async (e: React.MouseEvent) => {
    e.preventDefault();
    //console.log('handleClick 👉️', pin);

    await fetch(`http://${process.env.REACT_APP_IP_ADDR}:3001/enable2fa`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: `${pin}`, id: `${contextData.id}` }),
    }).then(response => response.json())
      .then(data => contextData.two_fa_auth = (data.res));

    if (contextData.two_fa_auth == true) {
      //console.log("Context True");
      prop.setOpen(false);
      prop.setChecked(true);
    }
    else {
      //console.log("Context False");
      prop.setOpen(false);
      prop.setChecked(false);
    }
    //console.log(contextData);
  }


  return (
    <>
      <TextField id="outlined-number" value={pin} onChange={pinInput} type="number" label="PIN" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
      <IconButton sx={style2} onClick={event => { clickPin(event) }} aria-label="sendIcon" disabled={pin.length !== 6 ? true : false}/*onChange={handlePin}*/>
        <SendIcon />
      </IconButton>
    </>
  );
}

function Settings() {

  const contextData = useContext(Student);

  const [qrCode, setQrCode] = React.useState("");
  const [checked, setChecked] = React.useState(contextData.two_fa_auth);

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const API_URL = `http://${process.env.REACT_APP_IP_ADDR}:3001/generate`


  //Per il qrcode
  const handleChange_ = async () => {
    if (!contextData.two_fa_auth) {
      await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contextData.id }),
      })
        .then(response => response.blob())
        .then(blob => {
          setQrCode(URL.createObjectURL(blob))
        })
    }
  }

  //Model Component 
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    alignItems: 'center',
    textAlign: 'center'
  };


  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
    handleChange_();
  }
  const handleClose = () => setOpen(false);


  const qrcode = (
    <div>
      <Modal
        open={open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <button className="close_button" type="button" onClick={handleClose}>X</button>
          <img id="qrcode" className="qrcode_" src={qrCode}></img>
          <PinComponent setOpen={setOpen} checked={checked} setChecked={setChecked} />
        </Box>
      </Modal>
    </div>
  );

  function SimpleFade() {
    return (
      <Box sx={{ height: 180 }}>
        <Box sx={{ display: 'flex' }}>
          <Fade in={checked}>{qrcode}</Fade>
        </Box>
      </Box>
    );
  }

  //Parte Avatar

  const API_URL_AVATAR = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/changeAvatar`

  let [selectedImage, setSelectedImage] = useState(contextData.avatar); //

  const inputRef = useRef<HTMLInputElement>(null); //

  // const loadFile = async (event: React.ChangeEvent<HTMLInputElement>) => { //

  //console.log(event.target.files![0]);
  //   // if (!event.target.files || event.target.files.length === 0) return; //
  //   // setSelectedImage(URL.createObjectURL(event.target.files![0])) //

  //   // let image = document.getElementById("output") as HTMLImageElement | null;
  //   // if (image != null) {
  //   //  let image = event.target.files![0] as string & File 
  //   //   //image.src = URL.createObjectURL(event.target.files![0])
  //   // selectedImage = image



  // }

  const [newPP, setNewPP] = React.useState<FormData | null>(null);
  const loadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.files![0]) {
      const formData = new FormData();
      formData.append('file', event.target.files![0]);
      formData.append('client', String(contextData.id)); //
      setNewPP(formData);
    }
  }

  const fileUpload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (null !== inputRef.current) {
      //console.log("img :", selectedImage);
      inputRef.current.click();
    }

    //console.log("pp ===", newPP);

    if (newPP) {
      await fetch(`http://${process.env.REACT_APP_IP_ADDR}/users/changeAvatar`, {
        method: 'POST',
        credentials: 'include',
        //headers: { 'Content-Type': 'nessuno, lol' },
        //DA STACKOVERFLOW:
        //"The solution to the problem is to explicitly set Content-Type 
        //to undefined so that your browser or whatever client you're using 
        //can set it and add that boundary value in there for you. 
        //Disappointing but true."
        body: newPP,
      })
        .then((response) => { (response.json().then(function (data) { contextData.avatar = data.img })) })
      //console.log(contextData);
    }
  }

  //Parte per Textfield username

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const Click_text = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const AnchorClose = () => {
    setAnchorEl(null);
  };

  const open_ = Boolean(anchorEl);
  const id = open_ ? 'simple-popover' : undefined;

  //PROVA

  // @function  App

  const API_URL_USER = `http://${process.env.REACT_APP_IP_ADDR}:3001/users/changeUsername`

  function UnauthApp() {
    const [name, setName] = React.useState(contextData.username)

    const testOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
    }

    const fetchUser = async (e: React.MouseEvent) => {
      e.preventDefault();
      //console.log('newname 👉️', name);
      await fetch(API_URL_USER, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldname: `${contextData.username}`, newname: `${name}` })
      })
        .then((response) => response.json())
        .then((data) => contextData.username = (data.res))
        .catch((error) => console.log("An error occured: ", error));

      contextData.username = name
      // fetchUser();
    }
    return (
      <>
        <TextField label={`${contextData.username}`} value={name} type="text" onChange={testOnChange} inputProps={{ maxLength: 15, minLength: 1, }} />
        <IconButton sx={style2} onClick={(event) => { fetchUser(event) }} disabled={name.length !== 0 && 2 ? false : true}>
          <SendIcon />
        </IconButton>
      </>
    )
  }
  return (
    <>
      <div className="wrapper_settings">
        <div className="profile-card_settings">

          <div className="avatar__img">

            <input
              hidden
              ref={inputRef}
              name="sample_image"
              type="file"
              id="fileUpload"
              accept="image/*"
              onChange={loadFile}
            //value={selectedImage}
            />

            <Fab size="small" sx={style_badge} onClick={fileUpload}>
              <PhotoCameraIcon />
            </Fab>
            <img id="output" src={contextData.avatar}></img>
          </div>

          <div className="profile-card__cnt">
            <div className="profile-card__txt" id='chance_username'>User <strong className="username">{contextData.username}</strong>
              <input
                hidden
                type="text"
              />
              <Fab sx={style_edit} onClick={Click_text}>
                <EditIcon fontSize='small' />
              </Fab>
              <Popover
                id={id}
                open={open_}
                anchorEl={anchorEl}
                onClose={AnchorClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                {/* Mettere funzione username */}
                <UnauthApp />

              </Popover>
            </div>
            <div className="profile-card-ctr">
              <div className="switch">Two factor auth</div>
              < SimpleFade />
              <div id='profile-card-ctr_switch'>
                <Switch checked={checked} onClick={handleOpen} onChange={() => { }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;