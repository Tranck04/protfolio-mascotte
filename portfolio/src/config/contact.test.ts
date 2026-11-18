import { expect, it } from 'vitest'
import { contactEndpoint, contactMailto, createContactConfig } from './contact'

it('uses the public coordinates supplied by the owner, without a fictional submission endpoint', () => {
  const config = createContactConfig({})
  expect(config.email).toBe('tfmukendi@gmail.com')
  expect(config.github).toBe('https://github.com/Tranck04')
  expect(config.linkedin).toBe('https://www.linkedin.com/in/tracy-franck-mukendi-8bb90242a')
  expect(config.endpoint).toBeUndefined()
  expect(contactMailto(config)).toMatch(/^mailto:tfmukendi@gmail\.com\?subject=/)
})
it('rejects unsafe or incomplete coordinates rather than presenting fake links', () => {
  const config = createContactConfig({ VITE_CONTACT_EMAIL: '', VITE_CONTACT_GITHUB: 'javascript:alert(1)', VITE_CONTACT_LINKEDIN: 'https://other.example/profile' })
  expect(config.email).toBeUndefined()
  expect(config.github).toBeUndefined()
  expect(config.linkedin).toBeUndefined()
  expect(contactMailto(config)).toBeUndefined()
  expect(contactEndpoint('//other.example/contact')).toBeUndefined()
  expect(contactEndpoint('javascript:alert(1)')).toBeUndefined()
  expect(contactEndpoint('/api/contact')).toBe('/api/contact')
})
