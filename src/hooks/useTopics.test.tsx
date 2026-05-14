import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTopics } from './useTopics'

describe('useTopics', () => {
  it('builds a nested tree from topic list', async () => {
    const { result } = renderHook(() => useTopics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const rootTitles = result.current.tree.map((topic) => topic.title)
    expect(rootTitles).toContain('Algebra')
    expect(rootTitles).toContain('Geometry')

    const algebra = result.current.tree.find((topic) => topic.title === 'Algebra')
    expect(algebra?.children.map((child) => child.title)).toContain('Linear equations')
  })
})
