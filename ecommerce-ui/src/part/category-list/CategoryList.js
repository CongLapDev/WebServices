import { Collapse } from "antd";
import { Link } from "react-router-dom";
function CategoryList({ items }) {
    const itemList = items.map((item, index) => (
        {
            key: index,
            label: <Link to={`/admin/category/${item.id}`}>{item.name}</Link>,
            children: <p>{item.description}</p>
        }
    ))
    return (<Collapse items={itemList} />);
}

export default CategoryList;