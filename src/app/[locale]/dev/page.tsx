import '@/components/dev/dev.css'
import { DevHero } from '@/components/dev/DevHero'
import { DevPrinciples } from '@/components/dev/DevPrinciples'
import { DevDomains } from '@/components/dev/DevDomains'
import { DevWhy } from '@/components/dev/DevWhy'
import { DevShowcase } from '@/components/dev/DevShowcase'
import { DevProcess } from '@/components/dev/DevProcess'
import { DevContact } from '@/components/dev/DevContact'

export default function DevPage() {
  return (
    <main id="main-content">
      <div className="wrap">
        <DevHero />
        <DevPrinciples />
        <DevDomains />
        <DevWhy />
        <DevShowcase />
        <DevProcess />
        <DevContact />
      </div>
    </main>
  )
}
