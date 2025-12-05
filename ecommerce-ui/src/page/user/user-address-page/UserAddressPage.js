import { List, Card, Row, Button, Col } from "antd";
import AddressTag from "../../../components/address-tag/AddressTag";
import style from './style.module.scss';
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { findAllByUserId, setDefaultUserAddress, deleteUserAddress } from "../../../store/address/addressSlide";
import AddressAddModal from "../../../part/address-add-modal/AddressAddModal";
import useAuth from "../../../secure/useAuth";
function UserAddressPage() {
    const address = useSelector(state => state.userAddress);
    const [state, user] = useAuth();
    const dispatch = useDispatch();
    const selectDefaultAddress = useRef();
    const [editable, setEditable] = useState(false);
    const [addressModal, setAddressModal] = useState(false);
    function onChange(e) {
        if (e.target.checked) {
            dispatch(setDefaultUserAddress({
                userId: user.id,
                addressId: e.target.value
            }))
        }
    }
    useEffect(() => {
        if (user !== null && user.id !== undefined) {
            dispatch(findAllByUserId({ userId: user.id }));
        }
    }, [user]);
    function deleteUserUserAddress(value) {
        dispatch(deleteUserAddress(value))
    }
    return (<Card title="Address">
        <Row justify="end">
            <Col span={editable ? 3 : 0}><Button onClick={() => { setEditable(false) }} className={clsx(style.editEnable)}>Save</Button></Col>
        </Row>
        <ul ref={selectDefaultAddress}>
            {
                address && address.map((item, index) =>
                (<List.Item key={index} variant="flush" className={style.addressTag}>
                    <input type="radio" checked={item.isDefault} onChange={onChange} value={item.id && item.id.addressId} name="address" />
                    <div className={clsx(style.address)}>
                        <AddressTag data={item} />
                        <button onClick={() => deleteUserUserAddress(item.id)} className={clsx(style.deleteBtn)} style={{ display: !editable ? "none" : "block" }}><i className="fi fi-sr-minus-circle"></i></button>
                    </div>
                </List.Item>))
            }
        </ul>

        <button onClick={() => setAddressModal(true)} className={clsx(style.addAddressButton)}>
            <div className={clsx(style.content)}>
                <span className={clsx(style.icon)}>+</span>
                <span>Add Address</span>
            </div>
        </button>
        <Row justify="center">
            <Col span={editable ? 0 : 3}><Button onClick={() => { setEditable(true) }} className={clsx(style.editEnable)}>Edit</Button></Col>
        </Row>

        <AddressAddModal open={addressModal} onCancel={() => setAddressModal(false)} />
    </Card>);
}

export default UserAddressPage;