import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context";
import APIBase from "../../../api/ApiBase";
import { Card } from "antd";
import CategoryList from "../../../part/category-list/CategoryList";
function AdminCategoryManagePage() {
    const globalContext = useContext(GlobalContext);
    const [data, setData] = useState(null);

    useEffect(() => {
        globalContext.loader("  ");
        APIBase.get("api/v1/category/1")
            .then(payload => setData(payload.data))
            .catch(console.log)
            .finally(
                () => {
                    globalContext.loader(false);
                }
            );
    }, [])
    return (<Card>
        {data && <CategoryList items={data.children} />}
    </Card>);
}

export default AdminCategoryManagePage;