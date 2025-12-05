import { Tag } from "antd";

function AccountStatusTag({ status }) {
    switch (status) {
        case 1:
            return <Tag color="green">ACTIVE</Tag>
        case 2:
            return <Tag color="red">INACTIVE</Tag>
        case 3:
            return <Tag color="yellow">LOCKED</Tag>
        case 4:
            return <Tag color="blue">VERIFYING</Tag>
    }
}

export default AccountStatusTag;