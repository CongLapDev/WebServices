import style from './style.module.scss';
function Loader() {
    return (<div className={style.loader}>
        <div className={style.bar}></div>
    </div>);
}

export default Loader;