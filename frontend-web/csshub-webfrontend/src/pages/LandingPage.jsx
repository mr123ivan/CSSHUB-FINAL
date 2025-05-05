import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import ProductSection from '../components/ProductSection'
import Executives from '../components/Executives'

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Product Section */}
      <section id="products">
        <ProductSection />
      </section>

      {/* Executives Section */}
      <section id="executives">
        <Executives />
      </section>
      
      <Footer />
    </div>
  )
}

export default LandingPage
