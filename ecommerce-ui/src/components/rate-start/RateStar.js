import clsx from 'clsx';
import style from './style.module.scss';
function RateStar({ fontSize = 12, count = 5, percent, className, ...props }) {
    var starts = [];
    for (let i = 0; i < count; i++) {
        starts.push(<div key={i} style={{ fontSize: fontSize + "px", paddingRight: Math.log10(fontSize * fontSize) + "px" }} className={style.star}><i className="fi fi-sr-star"></i></div>)
    }
    return (<div className={clsx(style.rateStars, className)} {...props}>
        <div className={style.layer}></div>
        <div className={style.container}>
            {starts}
        </div>
    </div>);
}

export default RateStar;