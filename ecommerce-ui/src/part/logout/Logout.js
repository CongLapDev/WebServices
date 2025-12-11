import { Button } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { userAddress } from "../../store/address/addressSlide";
import { userSlide } from "../../store/user/userSlide";
import PrefixIcon from "../../components/prefix-icon/PrefixIcon";
import APIBase from "../../api/ApiBase";
import { useContext } from "react";
import { GlobalContext } from "../../context";
const Wrapper = styled.div`
    width: 100%;
    height: 100%;
`
function Logout({ trigger }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const globalContext = useContext(GlobalContext);
    function logout() {
        dispatch(userAddress.actions.clear);
        dispatch(userSlide.actions.clear);
        // Clear token from localStorage
        window.localStorage.removeItem("AUTH_TOKEN");
        APIBase.post("/logout")
            .then(() => {
                navigate("/login");
            })
            .catch(e => {
                globalContext.message.error("Error");
                console.log(e);
                // Navigate to login even if API call fails
                navigate("/login");
            })
    }
    return (<Wrapper onClick={logout}>{trigger || <Button icon={<PrefixIcon></PrefixIcon>} type="primary" block danger>Logout</Button>}</Wrapper>);
}

export default Logout;