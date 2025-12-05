import { Button, Flex, Result } from "antd";
import { Link, useLocation } from "react-router-dom";
function UserResultPage() {
    const { state } = useLocation();
    return <Flex justify="center">
        <Result
            {...state}
            extra={[
                <Link to="/"><Button>Home</Button></Link>
            ]}
        />
    </Flex>;
}

export default UserResultPage;