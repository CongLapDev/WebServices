import { Card as AntCard } from "antd";
import clsx from "clsx";
import style from './style.module.scss';
function Card({ className, children, ...props }) {
    return (<AntCard
        className={clsx(className, style.card)}
        {...props}
    >
        {children}
    </AntCard>);
}

export default Card;