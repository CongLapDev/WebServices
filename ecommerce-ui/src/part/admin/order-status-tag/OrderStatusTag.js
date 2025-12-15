import { Tag } from "antd";
import { getStatusLabel, getStatusColor, getStatusIcon } from "../../../utils/orderUtils";

function OrderStatusTag({ status }) {
    const label = getStatusLabel(status);
    const color = getStatusColor(status);
    const icon = getStatusIcon(status);
    
    return (
        <Tag color={color}>
            {icon} {label}
        </Tag>
    );
}

export default OrderStatusTag;
