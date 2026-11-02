import { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SceneFallback } from './SceneFallback.jsx'
import { SceneErrorBoundary } from './SceneErrorBoundary.jsx'
import { useDeviceCapability } from '../../hooks/useDeviceCapability.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { useInView } from '../../hooks/useInView.js'
import { useTheme } from '../../features/theme/themeContext.js'
import { profile } from '../../data/profile.js'

const HeroScene = lazy(() => import('./HeroScene.jsx'))

/**
 * Decides between the real 3D hero scene and the static fallback, and keeps
 * the scene paused while it is scrolled out of view.
 */
export function HeroVisual({ projects, compact = false, className = '' }) {
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const { webgl, tier } = useDeviceCapability()
  const { theme } = useTheme()
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [containerRef, inView] = useInView({ rootMargin: '120px' })

  const use3D = theme.hero.scene3d && webgl && !reduced && !failed && tier !== 'low'
  const onSelectProject = useCallback((slug) => navigate(`/projects/${slug}`), [navigate])
  const sceneColors = useMemo(
    () => ({
      cyan: theme.colors.accent,
      orange: theme.colors.accentAlt,
      muted: theme.colors.muted,
      surface: theme.colors.elevated,
      bg: theme.colors.bg,
    }),
    [theme.colors],
  )

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {use3D ? (
        <SceneErrorBoundary fallback={<SceneFallback />} onError={() => setFailed(true)}>
          <Suspense fallback={<SceneFallback loading />}>
            <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
              <HeroScene
                projects={projects}
                tier={tier}
                compact={compact}
                active={inView}
                colors={sceneColors}
                stars={theme.hero.stars}
                satellites={theme.hero.satellites}
                initials={profile.initials || profile.preferredName?.[0] || 'R'}
                onSelectProject={onSelectProject}
                onReady={() => setReady(true)}
                onError={() => setFailed(true)}
              />
            </div>
            {!ready ? <SceneFallback loading /> : null}
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <SceneFallback />
      )}
    </div>
  )
}
