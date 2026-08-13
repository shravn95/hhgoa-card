import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import CurvedLoop from "./components/CurvedLoop.jsx";
import { IDCardBuilder } from "./components/IDBuilder.js";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-[#0B6839] text-[#FEE101]">
      <div className="relative overflow-hidden">
        <Header />
        <Hero />
      </div>

      <CurvedLoop
        marqueeText="2:47 PM STUDIO  GOA, INDIA  28–31 OCT 2026  #FRAMEINGOA"
        speed={1.5}
        curveAmount={110}
        interactive={false}
        className="fill-[#FEE101] text-[0.95rem] font-black tracking-[0.22em] md:text-[1.1rem]"
      />
      <IDCardBuilder />
      <Footer />
    </div>
  );
}

export default App;
