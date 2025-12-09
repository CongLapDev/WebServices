import { Modal, notification } from 'antd';
import CategoryForm from './category-add-form';
import APIBase from '../../../api/ApiBase';
import { useContext } from 'react';
import { GlobalContext } from '../../../context';

function CategoryEditModal({ state, setState, category, onUpdate }) {
    const globalContext = useContext(GlobalContext);
    
    function editCategorySubmit(data) {
        globalContext.loader(true);
        APIBase
            .put(`api/v1/category/${category.id}`, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(payload => {
                globalContext.message.success("Category updated successfully");
                onUpdate(payload.data);
                setState(false);
            }).catch(err => {
                globalContext.message.error("Error updating category");
                console.error(err);
            }).finally(() => {
                globalContext.loader(false);
            });
    }
    
    return (
        <Modal 
            footer={null} 
            title="Edit Category" 
            open={state} 
            onCancel={() => setState(false)}
            width={600}
        >
            <CategoryForm 
                submitHandler={editCategorySubmit} 
                initialValues={{
                    name: category?.name || "",
                    description: category?.description || ""
                }}
            />
        </Modal>
    );
}

export default CategoryEditModal;