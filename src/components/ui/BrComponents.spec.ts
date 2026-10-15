import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrButton from './BrButton.vue'
import BrBadge from './BrBadge.vue'
import BrChip from './BrChip.vue'

describe('Neo-Brutalism UI Components', () => {
  it('renders BrButton with custom slot and triggers click event', async () => {
    const wrapper = mount(BrButton, {
      slots: {
        default: 'KLIK SAYA',
      },
      props: {
        variant: 'primary',
      },
    })

    expect(wrapper.text()).toBe('KLIK SAYA')
    expect(wrapper.classes()).toContain('bg-blue')
    expect(wrapper.classes()).toContain('border-[3px]')

    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('renders BrBadge with dot and text', () => {
    const wrapper = mount(BrBadge, {
      slots: {
        default: 'STATUS AKTIF',
      },
      props: {
        variant: 'lime',
        dot: true,
      },
    })

    expect(wrapper.text()).toBe('STATUS AKTIF')
    expect(wrapper.classes()).toContain('bg-lime')
    expect(wrapper.find('span.rounded-full').exists()).toBe(true)
  })

  it('renders BrChip corresponding to exam status', () => {
    const wrapper = mount(BrChip, {
      props: {
        status: 'scheduled',
      },
    })
    expect(wrapper.text()).toBe('TERJADWAL')
    expect(wrapper.classes()).toContain('bg-blue')
  })
})
