import { Tag } from "antd";
function OrderStatusTag({ status }) {
    switch (status) {
        case 1:
            return <Tag color="cyan">PENDING</Tag>;
        case 2:
            return <Tag color="purple">PREPARING</Tag>
        case 3:
            return <Tag color="yellow">DELIVERING</Tag>
        case 4:
            return <Tag color="lime">DELIVERED</Tag>
        case 5:
            return <Tag color="green">COMPLETED</Tag>
        case 6:
            return <Tag color="red">CANCEL</Tag>;
        case 7:
            return <Tag color="pink">RETURN</Tag>
        case 0:
            return <Tag color="lime">PAID</Tag>
        default:
            return <Tag color="lime">UNKNOWN</Tag>
    }
}

export default OrderStatusTag;