import { Carousel } from "antd";
import style from './style.module.scss';
import banner1 from '../../../assets/image/banner1.jpg';
import banner2 from '../../../assets/image/banner2.jpg';
import clsx from "clsx";
function UserCarousel({ className, ...props }) {
  return (<Carousel className={clsx(style.carousel, className)} {...props}>
    <div className={style.content}><img alt="banner" src={banner1} /></div>
    <div className={style.content}><img alt="banner" src={banner2} /></div>
  </Carousel>);
}

export default UserCarousel;