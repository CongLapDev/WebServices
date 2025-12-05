import { Card, Modal } from "antd";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { postNewUserAddress } from "../../store/address/addressSlide";
import { useContext } from "react";
import { GlobalContext } from "../../context";
import UserAddressForm from "../user/user-address-form/UserAddressForm";
function AddressAddModal({ ...props }) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const globalContext = useContext(GlobalContext);
    function onSubmit(data) {
        if (user) {
            dispatch(postNewUserAddress({
                user: {
                    id: user.id
                },
                phoneNumber: data.phoneNumber,
                address: data
            }))
            globalContext.message.success("Add new address successfully");
        }
    }
    return (<Modal footer={null} {...props}>
        <Card title="Add new Address">
            <UserAddressForm onSubmit={onSubmit} />
        </Card>
    </Modal>);
}

export default AddressAddModal;