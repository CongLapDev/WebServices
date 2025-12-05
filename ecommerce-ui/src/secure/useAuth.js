import { useDispatch, useSelector } from "react-redux";
import APIBase from "../api/ApiBase";
import { userSlide } from "../store/user/userSlide";
import { useEffect, useState } from "react";

function useAuth() {
    const user = useSelector(state => state.user);
    const [state, setState] = useState(2)
    const dispatch = useDispatch();
    function requestAuth() {
        if (!user) {
            setState(2);
            APIBase.get("/api/v1/auth/user").then(payload => payload.data)
                .then(data => {
                    dispatch(userSlide.actions.create(data));
                    setState(1);
                })
                .catch(e => {
                    setState(1);
                })
        } else {
            setState(1)
        }
    }
    useEffect(() => {
        requestAuth();
    }, [])

    function role() {
        if (!user && state === 1) return ["GUEST"];
        else if (state === 1) {
            return user.account.roles.map(role_ => role_.name);
        }
        return null;
    }
    function hasRole(role_param) {
        if (!role()) return null;
        if (Array.isArray(role_param)) {
            for (let param of role_param) {
                if (role().some(role_ => role_ === param)) return true;
            }
            return false;
        } else {
            return role().some(role_ => role_ === role_param);
        }
    }
    return [state, user, hasRole, requestAuth];

}
export default useAuth;