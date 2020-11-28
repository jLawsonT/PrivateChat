import TreeLogo from "../treelogo2.svg"

function Header(props) {
    return (
        <div>
            {props.title ? <img src={TreeLogo} style={{width: "400px", marginTop: "10px"}}/> : <h1>"You're not logged in</h1>}
        </div>
    )
};

export default Header