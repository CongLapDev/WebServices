import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import { memo } from "react";

function RoleBaseAuthorize({ path, role, onFail, onSuccess, fail, children }) {
    const navigate = useNavigate();
    const [state, user, hasRole] = useAuth();
    var isValid = hasRole(role);
    if (isValid && state == 1) {
        if (onSuccess) return onSuccess();
        return <>{children}</>
    } else if (state == 1) {
        if (onFail) return onFail();
        else navigate("/login");
    }
}

export default RoleBaseAuthorize;