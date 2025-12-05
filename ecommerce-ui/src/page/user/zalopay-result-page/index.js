import { Button, Flex, Result, Col, Row, QRCode, Descriptions } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import APIBase from "../../../api/ApiBase";
import Statistic from "antd/es/statistic/Statistic";
const { Countdown } = Statistic;
var interval = null;
function ZaloPayProcess() {
    const [state, setState] = useState(3);
    const [data, setData] = useState(undefined)
    const [urlparams, setUrlParams] = useSearchParams();

    useEffect(() => {
        APIBase.get(`api/v1/purchase/${urlparams.get("id")}/zalopay`)
            .then(payload => payload.data)
            .then(data => {
                console.log(data)
                setData(data);
                if (data.return_code === 1) {
                    if (interval) clearInterval(interval);
                    interval = setInterval(() => {
                        APIBase.get(`api/v1/purchase/zalopay/status?app_trans_id=${data.app_trans_id}`)
                            .then(payload => payload.data)
                            .then(data => {
                                console.log(data)
                                if (data.return_code != 3) {
                                    setState(data.return_code);
                                    clearInterval(interval);
                                }
                            })
                    }, 4000)
                }
            })


    }, [])

    return <Row gutter={{ xs: 0, sm: 0, md: 8, lg: 12 }} align="middle" justify="center">
        <Col span={24}>
            {state === 1 && <Result status="success" title="Successful Payment! Purchase information will be updated after at least 15 minutes" />}
            {state === 2 && <Result status="error" title="Order Error" />}
        </Col>
        {state == 3 &&
            <>
                <Col span={24}>
                    <Flex justify="center" >  <QRCode value={data && data.qr_code} /></Flex>
                </Col>
                <Col span={24}>
                    <Flex justify="center"><Descriptions title="QR Code will be expired after" /><Countdown value={Date.now() + 1000 * 60 * 15} format="HH:mm:ss" /></Flex>
                </Col>
            </>}
    </Row>;
}

export default ZaloPayProcess;