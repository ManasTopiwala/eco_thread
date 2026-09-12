import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import type {
  EmissionResults, ProcessData, Recommendation, IndustryProfile,
} from '../types'
import { DEMO_EMISSION_RESULTS, DEMO_PROCESS_DATA, DEMO_PROFILE } from '../lib/demo'
import { useAuth } from './useAuth'
import {
  getLatestIndustryProfile,
  saveIndustryProfile,
  getLatestProcessData,
  saveProcessData,
  getLatestEmissionAssessment,
  saveEmissionAssessment,
  getRecommendations,
  saveRecommendations,
  updateRecommendationStatus,
} from '../lib/db'

interface AppState {
  industryProfile: IndustryProfile | null
  processData: ProcessData | null
  emissionResults: EmissionResults | null
  recommendations: Recommendation[]
  isDemo: boolean
  loadingData: boolean
}

interface AppContextType extends AppState {
  setIndustryProfile: (p: IndustryProfile) => void
  setProcessData: (d: ProcessData) => void
  setEmissionResults: (r: EmissionResults) => void
  setRecommendations: (r: Recommendation[]) => void
  loadDemoData: () => void
  saveIndustryProfileData: (p: IndustryProfile) => Promise<void>
  saveProcessAndAssessment: (d: ProcessData, r: EmissionResults) => Promise<void>
  saveRecommendationsData: (recs: Recommendation[]) => Promise<void>
  updateRecommendationStatusData: (id: string, status: string) => Promise<void>
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<AppState>({
    industryProfile: null,
    processData: null,
    emissionResults: null,
    recommendations: [],
    isDemo: false,
    loadingData: false,
  })

  // Fetch persisted data from Supabase when user is logged in
  const refreshData = useCallback(async () => {
    if (!user?.id) return

    setState(s => ({ ...s, loadingData: true }))
    try {
      const [profile, process, assessment, recs] = await Promise.allSettled([
        getLatestIndustryProfile(user.id),
        getLatestProcessData(user.id),
        getLatestEmissionAssessment(user.id),
        getRecommendations(user.id),
      ])

      setState({
        industryProfile: profile.status === 'fulfilled' ? profile.value : null,
        processData: process.status === 'fulfilled' ? process.value : null,
        emissionResults: assessment.status === 'fulfilled' ? assessment.value : null,
        recommendations: recs.status === 'fulfilled' && recs.value?.length ? recs.value : [],
        isDemo: false,
        loadingData: false,
      })
    } catch (err) {
      console.warn('Failed to load user database data:', err)
      setState(s => ({ ...s, loadingData: false }))
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      refreshData()
    } else {
      // Clear data on logout
      setState({
        industryProfile: null,
        processData: null,
        emissionResults: null,
        recommendations: [],
        isDemo: false,
        loadingData: false,
      })
    }
  }, [user?.id, refreshData])

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

  // Database persistence helpers
  const saveIndustryProfileData = async (p: IndustryProfile) => {
    setIndustryProfile(p)
    if (user?.id) {
      await saveIndustryProfile(p, user.id)
    }
  }

  const saveProcessAndAssessment = async (d: ProcessData, r: EmissionResults) => {
    setProcessData(d)
    setEmissionResults(r)
    if (user?.id) {
      const savedProcess = await saveProcessData(d, user.id)
      await saveEmissionAssessment(r, user.id, savedProcess?.id)
    }
  }

  const saveRecommendationsData = async (recs: Recommendation[]) => {
    setRecommendations(recs)
    if (user?.id && recs.length) {
      await saveRecommendations(recs, user.id)
    }
  }

  const updateRecommendationStatusData = async (id: string, status: string) => {
    // Optimistic state update
    setState(s => ({
      ...s,
      recommendations: s.recommendations.map(r => r.id === id ? { ...r, status } : r),
    }))
    if (user?.id) {
      try {
        await updateRecommendationStatus(id, status)
      } catch (e) {
        console.error('Failed to update recommendation status in database:', e)
      }
    }
  }

  return (
    <AppContext.Provider value={{
      ...state,
      setIndustryProfile,
      setProcessData,
      setEmissionResults,
      setRecommendations,
      loadDemoData,
      saveIndustryProfileData,
      saveProcessAndAssessment,
      saveRecommendationsData,
      updateRecommendationStatusData,
      refreshData,
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
