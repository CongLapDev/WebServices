import { useContext } from "react";
import { DarkModeContext } from "../context";

function useDarkMode() {
    const context = useContext(DarkModeContext);
    function reverse() {
        context.value = !context.value;
    }
    return ([context.value, reverse]);
}

export default useDarkMode;