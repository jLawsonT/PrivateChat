import Button from 'react-bootstrap/Button';
function Body(props) {
    const changeUsername = (event) => {
        props.setLoginInfo({...props.loginInfo, un: event.target.value })
    }
    const changePassword = (event) => {
        props.setLoginInfo({...props.loginInfo, ps: event.target.value })
    }
    return (
        <div>
            <input type='text' value={props.loginInfo.un} onChange={changeUsername}/>
            <input type='password' value={props.loginInfo.ps} onChange={changePassword}/>
            <Button variant='dark' onClick={props.loginButton}>Login</Button>
        </div>
    )
}

export default Body;