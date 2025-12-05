import { memo } from "react";
import { Switch } from "antd";
import useDarkMode from "../../hooks/useDarkmode";

function DarkModeToggle() {
    const [state, reverse] = useDarkMode();
    return <Switch defaultChecked={state} onChange={reverse} />;
}

export default memo(DarkModeToggle);
