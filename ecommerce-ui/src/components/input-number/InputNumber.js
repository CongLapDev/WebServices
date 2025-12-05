import React, { useRef } from 'react';
import style from './style.module.scss';
import clsx from 'clsx';
import ButtonGroup from 'antd/es/button/button-group';
function InputNumber({ className, onChange, disabled, ...props }) {
    const ref = useRef();
    function increate() {
        ref.current.stepUp()
        onChange(ref.current.value)
    }
    function decreate() {
        ref.current.stepDown();
        onChange(ref.current.value)
    }
    function changing(e) {
        onChange(e.target.value);
    }
    return (<ButtonGroup className={clsx(className, style.inputNumber)}>
        {!disabled && <button onClick={decreate}>-</button>}
        <input type="number" onChange={onChange} disabled={disabled} {...props} ref={ref}></input>
        {!disabled && <button onClick={increate}>+</button>}
    </ButtonGroup>)
}

export default InputNumber;