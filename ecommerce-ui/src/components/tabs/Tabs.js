import Card from '../card/Card';
import style from './style.module.scss';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
function Tabs({ items, defaultActiveKey }) {
    const [activeTab, setActiveTab] = useState(defaultActiveKey || 1);
    
    // Update activeTab when defaultActiveKey changes
    useEffect(() => {
        if (defaultActiveKey !== undefined) {
            setActiveTab(defaultActiveKey);
        }
    }, [defaultActiveKey]);
    
    return (
        <div>
            <div className={style.tabPanel}>
                {items.map((item_, key) =>
                    <div key={key} onClick={() => {
                        setActiveTab(item_.key);
                    }} className={clsx(style.tab, {
                        [style.active]: activeTab === item_.key
                    })} >
                        <span>{item_.label}</span>
                    </div>)}
            </div>
            <div className={style.content}>
                {items.find(item_ => item_.key === activeTab)?.children}
            </div>
        </div>);
}

export default Tabs;