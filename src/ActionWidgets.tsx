import Fab from '@mui/material/Fab';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React from 'react'
import Backdrop from '@mui/material/Backdrop';

export interface ActionIconProps {
    onClick: () => void
}
export const ActionIcon = ({onClick}: ActionIconProps) => {
    return (
        <div onClick={() => onClick()} style={{
            position:'fixed',
            bottom: '1rem',
            right:'1rem',
            zIndex: 1,
            display:'flex',
            flexDirection:'row',
            justifyContent:'space-between'
        }}>
            <Fab color="primary" aria-label="add">
            <InfoOutlinedIcon />
            </Fab>
        </div>
    )
}

export const ActionWidgets = () => {
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
      setOpen(false);
    };
    const handleOpen = () => {
      setOpen(true);
    };
    // const codeString =   
    return (
      <div>
        <ActionIcon onClick={handleOpen} />
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open}
          onClick={handleClose}
        >
          <div style={{
            background:'white',
            width: '50vw',
            height:'80vh',
            border: '1px solid black',
            borderRadius:'5px',
            display:'flex',
            flexDirection:'column',
          }}>
            <div style={{width:'100%',height:'6vh',background:'black'}}>
                <span style={{
                    fontSize:'2rem',
                    fontWeight:'bold',
                    fontFamily:'sans-serif',
                    letterSpacing:'-0.1rem',
                    lineHeight:'4.5rem',
                    marginBottom:'1rem',
                    display:'block',
                    textAlign:'left',
                    width:'auto',
                    height:'auto',
                    border:'none',
                }}>
                    Code Examples
                </span>
            </div>
            {/* <SyntaxHighlighter language="python" style={docco}>
                {codeString}
            </SyntaxHighlighter> */}
          </div>
        </Backdrop>
      </div>
    );
  }