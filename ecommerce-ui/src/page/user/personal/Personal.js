import { Col, Row, Button, Modal } from "antd";
import { useDispatch } from "react-redux";
import UserInfor from "../../../part/user-infor/UserInfor";
import PrefixIcon from "../../../components/prefix-icon/PrefixIcon";
import Logout from "../../../part/logout/Logout";
import { useContext, useState } from "react";
import UpdateUserForm from "../../../part/user/update-user-form/UpdateUserForm";
import APIBase from "../../../api/ApiBase";
import { fetchUser } from "../../../store/user/userSlide";
import { GlobalContext } from "../../../context";
import useAuth from "../../../secure/useAuth";
function Personal() {
    const dispatch = useDispatch();
    const [state, user] = useAuth();
    const [modal, setModal] = useState(false);
    const globalContext = useContext(GlobalContext);

    function onUpdateUser(data) {
        globalContext.loader(true);
        APIBase.put(`/api/v1/user/${user.id}`, data).then(payload => {
            dispatch(fetchUser)
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            globalContext.loader()
        })
    }
    return (
        <>
            <Modal title="Update Personal information" footer={null} open={modal} onCancel={() => { setModal(false) }}>
                <UpdateUserForm user={user} onSubmit={onUpdateUser} />
            </Modal>
            <Col span={24} lg={{ span: 8 }} >
                <UserInfor user={user} />
                <Row gutter={[0, 16]} style={{ padding: "16px 0px" }}>
                    <Col span={24}><Button onClick={() => { setModal(true) }} icon={<PrefixIcon><i style={{ color: "white" }} className="fi fi-rr-edit"></i></PrefixIcon>} type="primary" block>Update</Button></Col>
                    <Col span={24}><Logout trigger={<Button icon={<PrefixIcon></PrefixIcon>} type="primary" block danger>Logout</Button>} /></Col>
                    <Col span={24}><Button type="primary" block danger>Inactive</Button></Col>
                </Row>
            </Col>
        </>

    );
}

export default Personal;