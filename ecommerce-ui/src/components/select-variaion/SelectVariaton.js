import { Col, Row } from 'antd';
import CheckRadio from '../input-radio/CheckRadio';
import clsx from 'clsx';
import style from './style.module.scss';
import { memo, useEffect, useRef } from 'react';
function SelectVariation({ onChange, variation, ...props }) {
    const inputGroup = useRef();
    function change(e) {
        onChange({
            value: e.target.value,
            variation: variation
        })
    }
    useEffect(() => {
        inputGroup.current.querySelectorAll("input[type=radio]").forEach(element => {
            element.addEventListener("change", change);
        });
    }, [])
    return (
        <Row ref={inputGroup} {...props} gutter={[0, 4]} className={clsx("gx-2", style.inputGroup)} >
            <Col>
                <Row><label>{variation.name}</label></Row>
                <Row gutter={[8, 4]}>
                    {variation.options.map((option, index) => {
                        return <Col style={{ width: "fit-content" }} key={variation.name + index}><CheckRadio className={clsx(style.option)} onChange={(e) => { change(e) }} value={option.value} name={variation.name}>{option.value}</CheckRadio></Col>
                    })}
                </Row>
            </Col>
        </Row>);
}

export default memo(SelectVariation);