import { Component } from 'react'

/**
 * Catches render/runtime failures inside a 3D scene so the surrounding page
 * keeps working and a static fallback can be shown instead.
 */
export class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error('3D scene failed to render:', error)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
