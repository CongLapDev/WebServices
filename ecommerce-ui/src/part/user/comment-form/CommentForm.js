import { Form, Flex, Button, Rate, Input } from "antd";
import { useFormik } from "formik";
function CommentForm({ onSubmit }) {
    const formik = useFormik({
        initialValues: {
            rate: 0,
            comment: ""
        },
        onSubmit: onSubmit
    })
    return (<form onSubmit={formik.handleSubmit}>
        <Flex justify="center" style={{ padding: "2rem 0px" }}>
            <Rate defaultValue={formik.values.rate} onChange={value => formik.setFieldValue("rate", value)} />
        </Flex>
        <Form.Item>
            <Input.TextArea onChange={formik.handleChange} value={formik.values.comment} name="comment" />
        </Form.Item>
        <Flex justify="end" style={{ paddingTop: " 1rem" }}>
            <Button htmlType="submit" type="primary">Commit</Button>
        </Flex>
    </form>);
}

export default CommentForm;