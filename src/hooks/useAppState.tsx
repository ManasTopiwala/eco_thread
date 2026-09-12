import { createContext, useContext, useState, ReactNode } from 'react'
import type {
  EmissionResults, ProcessData, Recommendation, IndustryProfile,
} from '../types'
import { DEMO_EMISSION_RESULTS, DEMO_PROCESS_DATA, DEMO_PROFILE } from '../lib/demo'

interface AppState {
  industryProfile: IndustryProfile | null
  processData: ProcessData | null
  emissionResults: EmissionResults | null
  recommendations: Recommendation[]
  isDemo: boolean
}

interface AppContextType extends AppState {
  setIndustryProfile: (p: IndustryProfile) => void
  setProcessData: (d: ProcessData) => void
  setEmissionResults: (r: EmissionResults) => void
  setRecommendations: (r: Recommendation[]) => void
  loadDemoData: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    industryProfile: null,
    processData: null,
    emissionResults: null,
    recommendations: [],
    isDemo: false,
  })

  const loadDemoData = () => {
    setState(s => ({
      ...s,
      industryProfile: DEMO_PROFILE,
      processData: DEMO_PROCESS_DATA,
      emissionResults: DEMO_EMISSION_RESULTS,
      isDemo: true,
    }))
  }

  const setIndustryProfile = (p: IndustryProfile) =>
    setState(s => ({ ...s, industryProfile: p, isDemo: false }))

  const setProcessData = (d: ProcessData) =>
    setState(s => ({ ...s, processData: d, isDemo: false }))

  const setEmissionResults = (r: EmissionResults) =>
    setState(s => ({ ...s, emissionResults: r }))

  const setRecommendations = (r: Recommendation[]) =>
    setState(s => ({ ...s, recommendations: r }))

  return (
    <AppContext.Provider value={{
      ...state,
      setIndustryProfile,
      setProcessData,
      setEmissionResults,
      setRecommendations,
      loadDemoData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
