function Currency({ value, sign, ...props }) {
    return (<span {...props}>{value && Number.parseInt(value)?.toLocaleString('de-DE')}{sign}</span>);
}

export default Currency;