import { Component } from "react";
import "./App.css";
import BestCoffeeItem from "../best-coffee-item/best-coffee-item";
import AppHeader from "../app-header/app-header";
import AppFooter from "../app-footer/app-footer";
import GalleryCoffee from "../gallery-coffee/gallery-coffee";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      best: [
        { id: "wsG9Ic1Nz7ip39cw4xh8" },
        { id: "KMWP64Zu7cnfX9soJM7U" },
        { id: "UVmpSyBnkF86vdHdxpXQ" },
      ],
    };
  }

  render() {
    const { best } = this.state;

    return (
      <div className="body-wrapper" id="home">
        <AppHeader password={"main"} />
        <main>
          <section className="info" id="about">
            <span className="info-leadingtext">About TujuhSatuKopi</span>
            <div className="info-maintext">
              With passion and love for the art of coffee, TujuhSatuKopi was
              born on October 21, 2021. It's a journey that began with a simple
              coffee roaster who had a deep passion for the world of coffee,
              along with a strong determination to bring a unique coffee
              experience through his coffee shop business named TujuhSatuKopi.
            </div>
            <div className="info-maintext">
              At TujuhSatuKopi, we not only serve coffee but also create moments
              of togetherness and warmth for every guest. Our mission is simple:
              to ensure that every visitor feels genuine hospitality and
              exceptional service quality. With our cups of coffee, we provide
              not just delicious beverages but also a space for the community to
              come together, share stories, and create valuable memories
              collectively.
            </div>
          </section>
          <section className="best">
            <span className="best-leadingtext">Best Seller</span>
            <div className="best-items">
              {best.map((item) => (
                <BestCoffeeItem key={item.id} itemId={item.id} />
              ))}
            </div>
          </section>
          {/* Tambahkan komponen GalleryCoffee di sini */}
          <section className="gallery">
            <GalleryCoffee />
          </section>
        </main>
        <AppFooter />
      </div>
    );
  }
}

export default App;