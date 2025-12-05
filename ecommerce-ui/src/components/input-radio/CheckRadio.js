import style from './style.module.scss';
import clsx from 'clsx';
function CheckRadio({disabled, value, name,onChange, children, className, ...props }) {
    function change(e){
        onChange(e)
    }
    return (
        <div className={clsx(style.inputRadio,{
            [style.disabled]:disabled
        }, className)}>
            <input type="radio" onChange={change}  name={name}  value={value} {...props} />
            <span className={clsx(style.icon)}><i className="fi fi-ss-check-circle"></i></span>
            <div className={clsx(style.label,"rounded")}>{children || value}</div>
        </div>
    );
}

export default CheckRadio;
