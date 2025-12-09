import { Modal } from 'antd';
import CategoryForm from './category-add-form';
import APIBase from '../../../api/ApiBase';
import { useContext } from 'react';
import { GlobalContext } from '../../../context';

function CategoryAddRootModal({ state, setState, onAdd }) {
    const globalContext = useContext(GlobalContext);
    
    function addRootCategorySubmit(data) {
        globalContext.loader(true);
        // Root categories should be children of category id=1
        APIBase
            .post(`api/v1/category/1`, [data], {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(payload => {
                globalContext.message.success("Root category added successfully");
                // API returns array, get first element
                const newCategory = Array.isArray(payload.data) ? payload.data[0] : payload.data;
                onAdd(newCategory);
                setState(false);
            }).catch(err => {
                globalContext.message.error("Error adding category");
                console.error(err);
            }).finally(() => {
                globalContext.loader(false);
            });
    }
    
    return (
        <Modal 
            footer={null} 
            title="Add Root Category" 
            open={state} 
            onCancel={() => setState(false)}
            width={600}
        >
            <CategoryForm submitHandler={addRootCategorySubmit} />
        </Modal>
    );
}

export default CategoryAddRootModal;