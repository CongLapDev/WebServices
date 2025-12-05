import { Modal, Button, notification } from 'antd';
import CategoryForm from './category-add-form';
import APIBase from '../../../api/ApiBase';
import { useContext } from 'react';
import { GlobalContext } from '../../../context';

function CategoryAddModal({ state, setState, parent, addNestedCategory }) {
    const globalContext = useContext(GlobalContext);
    function addCategorySubmit(data) {
        globalContext.loader(true);
        APIBase
            .post(`api/v1/category/${parent.id}`, [data], {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(payload => {
                addNestedCategory(payload.data);
                return payload.data;
            }).catch(err => {
                globalContext.message.error("Error")
                return err;
            }).finally((data) => {
                globalContext.loader(false);
                setState(false);
            })

    }
    return (
        <Modal footer={null} title="Add nested Category" open={state} onCancel={() => setState(false)}>
            <CategoryForm submitHandler={addCategorySubmit} />
        </Modal>);
}

export default CategoryAddModal;