import { useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './components/sections/Hero'
import { HowItWorks } from './components/sections/HowItWorks'
import { InteractiveDemo } from './components/sections/InteractiveDemo'
import { Pricing } from './components/sections/Pricing'
import { ProblemBento } from './components/sections/ProblemBento'
import { TrustSignals } from './components/sections/TrustSignals'
import { WaitlistCTA } from './components/sections/WaitlistCTA'
import { copy } from './content/translations'

function App() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--text)]">
      <div className="grain-layer" aria-hidden="true" />

      <Navbar copy={copy.nav} isScrolled={isScrolled} />

      <main className="overflow-x-clip">
        <Hero copy={copy.hero} />
        <InteractiveDemo copy={copy.demo} />
        <ProblemBento copy={copy.stats} />
        <HowItWorks copy={copy.how} />
        <TrustSignals copy={copy.trust} />
        <Pricing copy={copy.pricing} />
        <WaitlistCTA copy={copy.waitlist} />
      </main>

      <Footer copy={copy.footer} />
    </div>
  )
}

export default App
