import { useMemo, useState } from 'react';
import { Col, Row } from 'antd';
import SelectVariation from '../../components/select-variaion/SelectVariaton';
import clsx from 'clsx';
import style from './style.module.scss';
import { memo } from 'react';
function ProductItemSelect({ productItems, onChange }) {
    const [status, setStatus] = useState();
    const variations = useMemo(() => {
        if (productItems && Array.isArray(productItems)) {
            var productOptions = productItems.reduce((pre, cur) => {
                return [...pre, ...cur.options];
            }, []);
            return productOptions.map(option => option.variation)
                .reduce((pre, cur) => {
                    if (pre.find(variation => variation.id === cur.id)) {
                        return pre;
                    }
                    pre.push(cur);
                    return pre;
                }, []).map(variation => {
                    variation.options = productOptions.reduce((pre, cur) => {
                        if (cur.variation.id === variation.id && !pre.find(option => option.value === cur.value)) {
                            return [...pre, cur];
                        }
                        return pre;
                    }, []);
                    return variation;
                })
        }
        return []
    }, [productItems]);
    const productItem = useMemo(() => {
        var initialObject = {};
        return Object.assign({
            options: []
        }, initialObject);
    }, []);
    function update(value) {
        if (!productItem.options.find(option => option.variation.name === value.variation.name)) {
            productItem.options.push(value);
        } else {
            productItem.options.forEach(element => {
                if (element.variation.name === value.variation.name) {
                    element.value = value.value;
                }
            });
        }
        if (onChange) {
            let item = productItems.find(item => {
                return item.options.every(option => {
                    return productItem.options.some(option_ => option_.value === option.value);
                })
            });
            if (!item) setStatus("Unavailable");
            else if (item.warehouses) {
                var qty = item.warehouses.reduce((pre, warehouseItem) => {
                    if (warehouseItem && warehouseItem.qty) return pre + warehouseItem.qty;
                    return pre;
                }, 0)
                setStatus(qty);
            } else {
                setStatus(0)
            }
            onChange(item);
        }
    }
    return (<Row gutter={[6, 6]}>
        <Col span={24} className={clsx(style.status, { "text-primary": status > 0 })}><span className='text'>Status: </span>{status}</Col>
        <Col>
            {variations.map((variation, index) =>
                <SelectVariation key={index} onChange={update} variation={variation} label={variation.name} />
            )}
        </Col>
    </Row>);
}

export default memo(ProductItemSelect);