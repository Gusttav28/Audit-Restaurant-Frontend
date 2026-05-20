'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { Save, Lock, Bell, Users, Palette, CreditCard, Check, ArrowUpRight, AlertCircle, Loader2, Plus, X, Pencil, Trash2, RefreshCw, Package, Eye, EyeOff } from 'lucide-react'
import { useAppContext } from '@/components/app-context'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { RestaurantAudit } from '@/components/inventory/multi-restaurant-data'

type SupabaseDataClient = Omit<ReturnType<typeof createSupabaseBrowserClient>, "from"> & {
  from: (table: string) => any
}

const createSupabaseDataClient = () => createSupabaseBrowserClient() as unknown as SupabaseDataClient

const countryOptions = ['Costa Rica', 'United States', 'Mexico', 'Spain']

const planDetails: Record<string, { name: string; price: number; features: string[] }> = {
  basic: {
    name: 'Basic',
    price: 0,
    features: ['Up to 2 inventories', '50 items per inventory', '30-day audit history', 'Basic reporting', 'Email support']
  },
  professional: {
    name: 'Professional',
    price: 29,
    features: ['Unlimited inventories', 'Unlimited items', '1-year audit history', 'Advanced analytics', 'Custom units & categories', 'Team collaboration (5 users)', 'Priority support']
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: ['Everything in Professional', 'Unlimited audit history', 'Unlimited team members', 'API access', 'Custom integrations', 'Dedicated account manager', '24/7 phone support', 'SLA guarantee']
  }
}

interface Subscription {
  plan: string
  status: string
  startDate: string
  billingCycle?: string
  nextBillingDate?: string
}

interface TeamMember {
  id?: string
  userId?: string
  restaurantIds?: string[]
  name: string
  email: string
  password?: string
  role: 'Admin' | 'Auditor' | 'Collaborator'
  permissions: { read: boolean; audit: boolean; create: boolean; edit: boolean; delete: boolean }
}

export default function SettingsPage() {
  const { restaurants, selectedRestaurant, updateSelectedRestaurant, createRestaurant, t, formatCurrency, isAdmin, isPrimaryAdmin, currentUserEmail, assignedAuditWork, refreshAssignedWork, addTeamMember, updateTeamMember, deleteTeamMember } = useAppContext()
  const [activeTab, setActiveTab] = useState('general')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isSavingEditedMember, setIsSavingEditedMember] = useState(false)
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<TeamMember | null>(null)
  const [deleteMemberWord, setDeleteMemberWord] = useState('')
  const [deleteMemberEmail, setDeleteMemberEmail] = useState('')
  const [isDeletingMember, setIsDeletingMember] = useState(false)
  const [isRefreshingAssignedWork, setIsRefreshingAssignedWork] = useState(false)
  const [editingAssignedWork, setEditingAssignedWork] = useState<RestaurantAudit | null>(null)
  const [deleteAssignedWorkTarget, setDeleteAssignedWorkTarget] = useState<RestaurantAudit | null>(null)
  const [deleteAssignedWorkWord, setDeleteAssignedWorkWord] = useState('')
  const [deleteAssignedWorkId, setDeleteAssignedWorkId] = useState('')
  const [teamError, setTeamError] = useState("")
  const [showNewMemberPassword, setShowNewMemberPassword] = useState(false)
  const [newTeamMember, setNewTeamMember] = useState<TeamMember>({
    name: '',
    email: '',
    password: '',
    role: 'Auditor',
    restaurantIds: selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
    permissions: { read: true, audit: true, create: false, edit: true, delete: false },
  })
  const [settings, setSettings] = useState({
    restaurantName: selectedRestaurant.name,
    email: selectedRestaurant.email,
    phone: selectedRestaurant.phone,
    address: selectedRestaurant.address,
    auditNotifications: selectedRestaurant.settings.auditNotifications,
    inventoryAlerts: selectedRestaurant.settings.inventoryAlerts,
    weeklyReports: selectedRestaurant.settings.weeklyReports,
    lowStockThreshold: selectedRestaurant.settings.lowStockThreshold,
  })
  const [savedSettings, setSavedSettings] = useState(settings)
  const [newRestaurant, setNewRestaurant] = useState({ name: '', location: '', email: '', phone: '', address: '' })
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("auditflow_user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.subscription) {
        setSubscription(user.subscription)
      }
    }
  }, [])

  useEffect(() => {
    setSettings({
      restaurantName: selectedRestaurant.name,
      email: selectedRestaurant.email,
      phone: selectedRestaurant.phone,
      address: selectedRestaurant.address,
      auditNotifications: selectedRestaurant.settings.auditNotifications,
      inventoryAlerts: selectedRestaurant.settings.inventoryAlerts,
      weeklyReports: selectedRestaurant.settings.weeklyReports,
      lowStockThreshold: selectedRestaurant.settings.lowStockThreshold,
    })
    setSavedSettings({
      restaurantName: selectedRestaurant.name,
      email: selectedRestaurant.email,
      phone: selectedRestaurant.phone,
      address: selectedRestaurant.address,
      auditNotifications: selectedRestaurant.settings.auditNotifications,
      inventoryAlerts: selectedRestaurant.settings.inventoryAlerts,
      weeklyReports: selectedRestaurant.settings.weeklyReports,
      lowStockThreshold: selectedRestaurant.settings.lowStockThreshold,
    })
    setEditingAssignedWork(null)
    setNewTeamMember((member) => ({
      ...member,
      restaurantIds: member.restaurantIds?.length ? member.restaurantIds : selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
    }))
  }, [selectedRestaurant])

  const currentPlan = subscription?.plan ? planDetails[subscription.plan] : null
  const teamMembers = selectedRestaurant.teamMembers ?? []
  const getRestaurantNames = (restaurantIds?: string[]) => {
    const names = restaurants
      .filter((restaurant) => restaurant.remoteId && restaurantIds?.includes(restaurant.remoteId))
      .map((restaurant) => restaurant.name)
    return names.length ? names.join(', ') : selectedRestaurant.name
  }
  const getAssignedWorkStatusLabel = (status: string) => {
    if (status === 'completed') return t('completed')
    if (status === 'in-progress') return t('inProgress')
    return t('notStarted')
  }
  const getAssignedWorkStatusClass = (status: string) => {
    if (status === 'completed') return 'border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-100'
    if (status === 'in-progress') return 'border-yellow-500/40 bg-yellow-500/20 text-yellow-700 dark:text-yellow-100'
    return 'border-border bg-secondary/50 text-muted-foreground'
  }

  const isGeneralDirty =
    settings.restaurantName !== savedSettings.restaurantName ||
    settings.email !== savedSettings.email ||
    settings.phone !== savedSettings.phone ||
    settings.address !== savedSettings.address
  const isInventoryPreferencesDirty = String(settings.lowStockThreshold) !== String(savedSettings.lowStockThreshold)
  const isNotificationsDirty =
    settings.auditNotifications !== savedSettings.auditNotifications ||
    settings.inventoryAlerts !== savedSettings.inventoryAlerts ||
    settings.weeklyReports !== savedSettings.weeklyReports
  const isAssignedWorkDirty = Boolean(editingAssignedWork)
  const hasActiveSectionChanges =
    (activeTab === 'general' && isGeneralDirty) ||
    (activeTab === 'inventory-preferences' && isInventoryPreferencesDirty) ||
    (activeTab === 'notifications' && isNotificationsDirty) ||
    (activeTab === 'assigned-work' && isAssignedWorkDirty)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const buildAssignmentNotes = (audit: RestaurantAudit) => [
    audit.notes,
    audit.helperName ? `${t('helper')}: ${audit.helperName}` : '',
    audit.temporaryHelperName ? `${t('temporaryCollaborator')}: ${audit.temporaryHelperName}` : '',
    audit.assignedByAdminId ? `[AuditFlowAssignment:${audit.assignedByAdminId}:${audit.assignedByAdminName ?? ''}]` : '',
  ].filter(Boolean).join('\n')

  const handleSaveAssignedWork = async () => {
    if (!editingAssignedWork?.remoteId) return
    setIsSavingSettings(true)
    try {
      const targetInventory = selectedRestaurant.inventoryTypes.find((type) => type.id === editingAssignedWork.inventoryId)
      const { error } = await createSupabaseDataClient()
        .from('audits')
        .update({
          inventory_type_id: targetInventory?.remoteId,
          auditor_id: editingAssignedWork.auditorId ?? null,
          auditor_name: editingAssignedWork.auditor,
          created_date: editingAssignedWork.dueDate ?? editingAssignedWork.createdDate,
          started_date: editingAssignedWork.startedDate ?? editingAssignedWork.dueDate ?? editingAssignedWork.createdDate,
          status: editingAssignedWork.status,
          notes: buildAssignmentNotes(editingAssignedWork),
        })
        .eq('id', editingAssignedWork.remoteId)
      if (error) throw error
      updateSelectedRestaurant((restaurant) => ({
        ...restaurant,
        audits: restaurant.audits.map((audit) => audit.id === editingAssignedWork.id ? editingAssignedWork : audit),
      }))
      setEditingAssignedWork(null)
      await refreshAssignedWork()
    } catch (error) {
      console.error('Failed to update assigned work', error)
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleSave = () => {
    setIsSavingSettings(true)
    if (activeTab === 'assigned-work') {
      void handleSaveAssignedWork()
      return
    }
    const nextRestaurantSettings = {
      auditNotifications: activeTab === 'notifications' ? settings.auditNotifications : savedSettings.auditNotifications,
      inventoryAlerts: activeTab === 'notifications' ? settings.inventoryAlerts : savedSettings.inventoryAlerts,
      weeklyReports: activeTab === 'notifications' ? settings.weeklyReports : savedSettings.weeklyReports,
      lowStockThreshold: activeTab === 'inventory-preferences' ? Number(settings.lowStockThreshold) : Number(savedSettings.lowStockThreshold),
    }
    const nextRestaurantInfo = {
      name: activeTab === 'general' ? settings.restaurantName : savedSettings.restaurantName,
      email: activeTab === 'general' ? settings.email : savedSettings.email,
      phone: activeTab === 'general' ? settings.phone : savedSettings.phone,
      address: activeTab === 'general' ? settings.address : savedSettings.address,
    }
    void (async () => {
      try {
        if (selectedRestaurant.remoteId) {
          const { error } = await createSupabaseDataClient()
            .from('restaurants')
            .update({
              name: nextRestaurantInfo.name,
              email: nextRestaurantInfo.email,
              phone: nextRestaurantInfo.phone,
              address: nextRestaurantInfo.address,
              settings: nextRestaurantSettings,
            })
            .eq('id', selectedRestaurant.remoteId)
          if (error) throw error
        }
        updateSelectedRestaurant((restaurant) => ({
          ...restaurant,
          ...nextRestaurantInfo,
          settings: nextRestaurantSettings,
        }))
        setSavedSettings({
          restaurantName: nextRestaurantInfo.name,
          email: nextRestaurantInfo.email,
          phone: nextRestaurantInfo.phone,
          address: nextRestaurantInfo.address,
          ...nextRestaurantSettings,
        })
      } catch (error) {
        console.error('Failed to save settings section', error)
      } finally {
        setIsSavingSettings(false)
      }
    })()
  }

  const handleCancelActiveSection = () => {
    if (activeTab === 'assigned-work') {
      setEditingAssignedWork(null)
      return
    }
    setSettings((current) => ({
      ...current,
      ...(activeTab === 'general' ? {
        restaurantName: savedSettings.restaurantName,
        email: savedSettings.email,
        phone: savedSettings.phone,
        address: savedSettings.address,
      } : {}),
      ...(activeTab === 'inventory-preferences' ? {
        lowStockThreshold: savedSettings.lowStockThreshold,
      } : {}),
      ...(activeTab === 'notifications' ? {
        auditNotifications: savedSettings.auditNotifications,
        inventoryAlerts: savedSettings.inventoryAlerts,
        weeklyReports: savedSettings.weeklyReports,
      } : {}),
    }))
  }

  const handleCreateRestaurant = async () => {
    if (!newRestaurant.name.trim() || !newRestaurant.location.trim()) return
    const createdRestaurantId = await createRestaurant({ ...newRestaurant, country: newRestaurant.location })
    if (!createdRestaurantId) return
    setNewRestaurant({ name: '', location: '', email: '', phone: '', address: '' })
  }

  const detectCountry = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
        const data = await response.json()
        const country = data?.address?.country
        if (country) setNewRestaurant((prev) => ({ ...prev, location: country }))
      } catch {
        // Optional convenience only.
      }
    })
  }

  const fetchAddressSuggestions = async (address: string) => {
    setNewRestaurant((prev) => ({ ...prev, address }))
    if (address.trim().length < 3) {
      setAddressSuggestions([])
      return
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=4&country=${encodeURIComponent(newRestaurant.location)}&q=${encodeURIComponent(address)}`)
      const data = await response.json()
      setAddressSuggestions((Array.isArray(data) ? data : []).map((item) => item.display_name).filter(Boolean))
    } catch {
      setAddressSuggestions([])
    }
  }

  const handleAddTeamMember = () => {
    if (!newTeamMember.name.trim() || !newTeamMember.email.trim() || !(newTeamMember.password ?? '').trim()) return
    if (!newTeamMember.restaurantIds?.length) {
      setTeamError(t('selectAtLeastOneRestaurant'))
      return
    }
    if ((newTeamMember.password ?? '').length < 8 || !/[A-Z]/.test(newTeamMember.password ?? '')) {
      setTeamError(t('passwordRequirements'))
      return
    }
    setIsSavingTeamMember(true)
    setTeamError("")
    void addTeamMember({
      name: newTeamMember.name,
      email: newTeamMember.email,
      password: newTeamMember.password ?? '',
      role: newTeamMember.role,
      permissions: newTeamMember.permissions,
      restaurantIds: newTeamMember.restaurantIds,
    }).then((result) => {
      if (result.ok) {
        setNewTeamMember({
          name: '',
          email: '',
          password: '',
          role: 'Auditor',
          restaurantIds: selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
          permissions: { read: true, audit: true, create: false, edit: true, delete: false },
        })
        setIsTeamModalOpen(false)
      } else {
        setTeamError(result.error ?? 'Unable to create team member')
      }
      setIsSavingTeamMember(false)
    })
  }

  const startEditingMember = (member: TeamMember) => {
    setTeamError("")
    setEditingMember({
      ...member,
      restaurantIds: member.restaurantIds?.length ? member.restaurantIds : selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
      permissions: { ...member.permissions },
    })
  }

  const handleSaveEditedMember = () => {
    if (!editingMember || !editingMember.name.trim()) return
    if (!editingMember.restaurantIds?.length) {
      setTeamError(t('selectAtLeastOneRestaurant'))
      return
    }
    setIsSavingEditedMember(true)
    setTeamError("")
    void updateTeamMember({
      id: editingMember.id,
      userId: editingMember.userId,
      name: editingMember.name,
      email: editingMember.email,
      role: editingMember.role,
      permissions: editingMember.permissions,
      restaurantId: selectedRestaurant.remoteId,
      restaurantIds: editingMember.restaurantIds,
    }).then((result) => {
      if (result.ok) {
        setEditingMember(null)
      } else {
        setTeamError(result.error ?? 'Unable to update team member')
      }
      setIsSavingEditedMember(false)
    })
  }

  const handleDeleteMember = () => {
    if (!deleteMemberTarget) return
    setIsDeletingMember(true)
    setTeamError("")
    void deleteTeamMember({
      id: deleteMemberTarget.id,
      userId: deleteMemberTarget.userId,
      restaurantId: selectedRestaurant.remoteId,
    }).then((result) => {
      if (result.ok) {
        setDeleteMemberTarget(null)
        setDeleteMemberWord('')
        setDeleteMemberEmail('')
      } else {
        setTeamError(result.error ?? 'Unable to delete team member')
      }
      setIsDeletingMember(false)
    })
  }

  const handleRefreshAssignedWork = () => {
    setIsRefreshingAssignedWork(true)
    void refreshAssignedWork().finally(() => {
      setIsRefreshingAssignedWork(false)
    })
  }

  const handleDeleteAssignedWork = async () => {
    if (!deleteAssignedWorkTarget?.remoteId) return
    setIsSavingSettings(true)
    try {
      const { error } = await createSupabaseDataClient()
        .from('audits')
        .delete()
        .eq('id', deleteAssignedWorkTarget.remoteId)
      if (error) throw error
      updateSelectedRestaurant((restaurant) => ({
        ...restaurant,
        audits: restaurant.audits.filter((audit) => audit.id !== deleteAssignedWorkTarget.id),
      }))
      setDeleteAssignedWorkTarget(null)
      setDeleteAssignedWorkWord('')
      setDeleteAssignedWorkId('')
      await refreshAssignedWork()
    } catch (error) {
      console.error('Failed to delete assigned work', error)
    } finally {
      setIsSavingSettings(false)
    }
  }

  const roleLabel = (role: TeamMember['role']) => {
    if (role === 'Admin') return t('admin')
    if (role === 'Collaborator') return t('collaborator')
    return t('auditorRole')
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-6">
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Lock size={34} className="text-muted-foreground" />
                <h1 className="text-2xl font-bold text-foreground">{t('accessDenied')}</h1>
                <p className="max-w-md text-sm text-muted-foreground">{t('accessDeniedBody')}</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('settings')}</h1>
            <p className="text-muted-foreground mt-1">{t('settingsSubtitle')} · {selectedRestaurant.name}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: Palette },
              { id: 'inventory-preferences', label: t('inventoryPreferences'), icon: Package },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Lock },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-accent border-accent'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="max-w-none space-y-6">
            {activeTab === 'general' && (
              <>
                <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {isPrimaryAdmin && <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>{t('restaurantInfo')}</CardTitle>
                    <CardDescription>{t('updateRestaurantDetails')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('restaurantName')}</label>
                      <input
                        type="text"
                        name="restaurantName"
                        value={settings.restaurantName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('email')}</label>
                      <input
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={settings.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('address')}</label>
                      <input
                        type="text"
                        name="address"
                        value={settings.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                  </CardContent>
                </Card>}

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>{t('createRestaurantTitle')}</CardTitle>
                    <CardDescription>{t('createRestaurant')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    {[
                      ['name', t('restaurantName'), true],
                      ['location', t('country'), true],
                      ['email', t('email'), false],
                      ['phone', t('phone'), false],
                      ['address', t('address'), false],
                    ].map(([key, label, required]) => (
                      <div key={key as string} className={key === 'address' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          {label}{required ? ' *' : ''}
                        </label>
                        {key === 'location' ? (
                          <select
                            value={newRestaurant.location}
                            onFocus={detectCountry}
                            onChange={(event) => setNewRestaurant((prev) => ({ ...prev, location: event.target.value }))}
                            className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                          >
                            <option value="">{t('country')}</option>
                            {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
                          </select>
                        ) : (
                          <input
                            value={newRestaurant[key as keyof typeof newRestaurant]}
                            onChange={(event) => key === 'address' ? fetchAddressSuggestions(event.target.value) : setNewRestaurant((prev) => ({ ...prev, [key as string]: event.target.value }))}
                            className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                          />
                        )}
                        {key === 'address' && addressSuggestions.length > 0 && (
                          <div className="mt-2 rounded-lg border border-border bg-secondary/20">
                            {addressSuggestions.map((suggestion) => (
                              <button key={suggestion} type="button" onClick={() => {
                                setNewRestaurant((prev) => ({ ...prev, address: suggestion }))
                                setAddressSuggestions([])
                              }} className="block w-full px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground">
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <Button onClick={handleCreateRestaurant} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        {t('createRestaurant')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </div>
                {isAdmin && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>{t('managedRestaurants')}</CardTitle>
                      <CardDescription>{t('managedRestaurantsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {restaurants.map((restaurant) => {
                          const itemCount = restaurant.inventoryTypes.reduce((total, type) => total + type.items.length, 0)
                          const teamCount = restaurant.teamMembers?.length ?? 0
                          return (
                            <div key={restaurant.remoteId ?? restaurant.id} className="rounded-lg border border-border bg-secondary/20 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate text-base font-semibold text-foreground">{restaurant.name}</h3>
                                  <p className="mt-1 text-xs text-muted-foreground">{restaurant.country || restaurant.location}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                                  {restaurant.defaultCurrency}
                                </span>
                              </div>
                              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-md border border-border bg-background/40 p-2">
                                  <p className="text-xs text-muted-foreground">{t('inventoryTypes')}</p>
                                  <p className="font-medium text-foreground">{restaurant.inventoryTypes.length}</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/40 p-2">
                                  <p className="text-xs text-muted-foreground">{t('items')}</p>
                                  <p className="font-medium text-foreground">{itemCount}</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/40 p-2">
                                  <p className="text-xs text-muted-foreground">{t('teamMembers')}</p>
                                  <p className="font-medium text-foreground">{teamCount}</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/40 p-2">
                                  <p className="text-xs text-muted-foreground">{t('currentRole')}</p>
                                  <p className="font-medium text-foreground">{restaurant.currentUserRole === 'owner' ? t('admin') : roleLabel(restaurant.teamMembers?.find((member) => member.email.toLowerCase() === currentUserEmail.toLowerCase())?.role ?? 'Collaborator')}</p>
                                </div>
                              </div>
                              <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                                <p><span className="text-foreground">{t('email')}:</span> {restaurant.email || '-'}</p>
                                <p><span className="text-foreground">{t('phone')}:</span> {restaurant.phone || '-'}</p>
                                <p><span className="text-foreground">{t('address')}:</span> {restaurant.address || '-'}</p>
                                <p><span className="text-foreground">{t('location')}:</span> {restaurant.location || '-'}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'inventory-preferences' && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t('inventoryPreferences')}</CardTitle>
                  <CardDescription>Configure inventory management settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('lowStockThreshold')}</label>
                    <select
                      name="lowStockThreshold"
                      value={settings.lowStockThreshold}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="3">3 items</option>
                      <option value="5">5 items</option>
                      <option value="10">10 items</option>
                      <option value="15">15 items</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'subscription' && (
              <>
                {/* Current Plan */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>Manage your subscription and billing</CardDescription>
                      </div>
                      {subscription?.status === 'active' && (
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentPlan ? (
                      <>
                        <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{currentPlan.name}</h3>
                              <p className="text-muted-foreground">
                                {formatCurrency(currentPlan.price)}<span className="text-sm">/month</span>
                              </p>
                            </div>
                            <Link href="/subscription">
                              <Button variant="outline" className="gap-2 bg-transparent">
                                Change Plan
                                <ArrowUpRight size={16} />
                              </Button>
                            </Link>
                          </div>
                          
                          <div className="pt-4 border-t border-border">
                            <p className="text-sm font-medium text-foreground mb-3">Plan includes:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {currentPlan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Check size={14} className="text-primary flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Billing Info */}
                        {subscription?.billingCycle && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-foreground">Billing Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Billing Cycle</p>
                                <p className="text-sm font-medium text-foreground capitalize">{subscription.billingCycle}</p>
                              </div>
                              <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Next Billing Date</p>
                                <p className="text-sm font-medium text-foreground">
                                  {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                                <p className="text-sm font-medium text-foreground">
                                  {new Date(subscription.startDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                                <p className="text-sm font-medium text-foreground">**** **** **** 4242</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                          <Button variant="outline" className="bg-transparent">
                            Update Payment Method
                          </Button>
                          <Button variant="outline" className="bg-transparent">
                            View Billing History
                          </Button>
                          {subscription?.plan !== 'basic' && (
                            <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                              Cancel Subscription
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Active Subscription</h3>
                        <p className="text-muted-foreground mb-4">Choose a plan to start managing your inventory.</p>
                        <Link href="/subscription">
                          <Button className="bg-foreground text-background hover:bg-foreground/90">
                            View Plans
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Usage Stats */}
                {currentPlan && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Usage</CardTitle>
                      <CardDescription>Your current plan usage this billing period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Inventories</span>
                          <span className="text-foreground">
                            3 / {subscription?.plan === 'basic' ? '2' : 'Unlimited'}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${subscription?.plan === 'basic' ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: subscription?.plan === 'basic' ? '100%' : '15%' }} 
                          />
                        </div>
                        {subscription?.plan === 'basic' && (
                          <p className="text-xs text-destructive mt-1">You have exceeded your inventory limit</p>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Audits This Month</span>
                          <span className="text-foreground">12</span>
                        </div>
                        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Team Members</span>
                          <span className="text-foreground">
                            3 / {subscription?.plan === 'basic' ? '1' : subscription?.plan === 'professional' ? '5' : 'Unlimited'}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: subscription?.plan === 'professional' ? '60%' : '10%' }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'notifications' && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">Audit Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive alerts when audits are completed</p>
                    </div>
                    <input
                      type="checkbox"
                      name="auditNotifications"
                      checked={settings.auditNotifications}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-current cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">Inventory Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified when stock is low</p>
                    </div>
                    <input
                      type="checkbox"
                      name="inventoryAlerts"
                      checked={settings.inventoryAlerts}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-current cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">Weekly Reports</p>
                      <p className="text-xs text-muted-foreground">Receive weekly summary reports</p>
                    </div>
                    <input
                      type="checkbox"
                      name="weeklyReports"
                      checked={settings.weeklyReports}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-current cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'assigned-work' && isAdmin && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{t('assignedWork')}</CardTitle>
                      <CardDescription>{t('assignedWorkSubtitle')}</CardDescription>
                    </div>
                    <Button variant="outline" className="gap-2 bg-transparent" onClick={handleRefreshAssignedWork} disabled={isRefreshingAssignedWork}>
                      {isRefreshingAssignedWork ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      {t('refresh')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    {isRefreshingAssignedWork && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60 backdrop-blur-sm">
                        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
                          <Loader2 size={16} className="mr-2 inline animate-spin text-primary" />
                          {t('loadingData')}
                        </div>
                      </div>
                    )}
                    <table className="min-w-[1100px] w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('assignedUser')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('taskType')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('restaurant')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('inventory')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('helper')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('helperType')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('assignedDate')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('dueDate')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('status')}</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedAuditWork.length ? assignedAuditWork.map((audit) => {
                          const isEditingWork = editingAssignedWork?.id === audit.id
                          return (
                            <tr key={audit.id} className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">
                                {isEditingWork ? (
                                  <select
                                    value={editingAssignedWork.auditorId ?? editingAssignedWork.auditor}
                                    onChange={(event) => {
                                      const member = teamMembers.find((teamMember) => (teamMember.userId ?? teamMember.email) === event.target.value)
                                      setEditingAssignedWork((current) => current ? {
                                        ...current,
                                        auditorId: member?.userId,
                                        auditor: member?.name ?? event.target.value,
                                      } : current)
                                    }}
                                    className="min-w-40 rounded-lg border border-border bg-background/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:border-accent"
                                  >
                                    {teamMembers.map((member) => (
                                      <option key={member.userId ?? member.email} value={member.userId ?? member.email}>{member.name}</option>
                                    ))}
                                  </select>
                                ) : audit.auditor}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{t('assignAudit')}</td>
                              <td className="px-4 py-3 text-muted-foreground">{selectedRestaurant.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {isEditingWork ? (
                                  <select
                                    value={editingAssignedWork.inventoryId}
                                    onChange={(event) => {
                                      const inventory = selectedRestaurant.inventoryTypes.find((type) => type.id === Number(event.target.value))
                                      setEditingAssignedWork((current) => current && inventory ? {
                                        ...current,
                                        inventoryId: inventory.id,
                                        inventoryName: inventory.name,
                                        inventoryColor: inventory.color,
                                      } : current)
                                    }}
                                    className="min-w-40 rounded-lg border border-border bg-background/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:border-accent"
                                  >
                                    {selectedRestaurant.inventoryTypes.map((inventory) => (
                                      <option key={inventory.id} value={inventory.id}>{inventory.name}</option>
                                    ))}
                                  </select>
                                ) : audit.inventoryName}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {isEditingWork ? (
                                  <input
                                    value={editingAssignedWork.helperName ?? editingAssignedWork.temporaryHelperName ?? ''}
                                    onChange={(event) => setEditingAssignedWork((current) => current ? {
                                      ...current,
                                      helperName: event.target.value,
                                      temporaryHelperName: '',
                                    } : current)}
                                    className="min-w-40 rounded-lg border border-border bg-background/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:border-accent"
                                  />
                                ) : audit.helperName ?? audit.temporaryHelperName ?? t('none')}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {audit.helperName ? t('teamMember') : audit.temporaryHelperName ? t('temporaryCollaborator') : t('none')}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{audit.assignedDate ?? audit.createdDate}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {isEditingWork ? (
                                  <input
                                    type="date"
                                    value={editingAssignedWork.dueDate ?? editingAssignedWork.createdDate}
                                    onChange={(event) => setEditingAssignedWork((current) => current ? {
                                      ...current,
                                      dueDate: event.target.value,
                                      createdDate: event.target.value,
                                      startedDate: event.target.value,
                                    } : current)}
                                    className="rounded-lg border border-border bg-background/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:border-accent"
                                  />
                                ) : audit.dueDate ?? audit.createdDate}
                              </td>
                              <td className="px-4 py-3">
                                {isEditingWork ? (
                                  <select
                                    value={editingAssignedWork.status}
                                    onChange={(event) => setEditingAssignedWork((current) => current ? {
                                      ...current,
                                      status: event.target.value as RestaurantAudit['status'],
                                    } : current)}
                                    className="rounded-lg border border-border bg-background/60 px-2 py-1 text-sm text-foreground focus:outline-none focus:border-accent"
                                  >
                                    <option value="not-started">{t('notStarted')}</option>
                                    <option value="in-progress">{t('inProgress')}</option>
                                    <option value="completed">{t('completed')}</option>
                                  </select>
                                ) : (
                                  <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getAssignedWorkStatusClass(audit.status)}`}>
                                    {getAssignedWorkStatusLabel(audit.status)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setEditingAssignedWork({ ...audit })}>
                                    <Pencil size={14} />
                                    {t('edit')}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteAssignedWorkTarget(audit)}>
                                    <Trash2 size={14} />
                                    {t('delete')}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        }) : (
                          <tr>
                            <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">{t('noAssignedAuditTasks')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Lock size={18} className="mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Lock size={18} className="mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                  <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Active Sessions</p>
                    <p className="text-xs text-muted-foreground">You are currently logged in on this device</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'team' && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{t('teamManagement')}</CardTitle>
                  <CardDescription>{t('teamDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isPrimaryAdmin && (
                    <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsTeamModalOpen(true)}>
                      <Plus size={16} />
                      {t('addTeamMember')}
                    </Button>
                  )}
                  {teamError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{teamError}</p>}
                  <div className="space-y-3">
                    {teamMembers.map((member, i) => (
                      <div key={member.id ?? member.userId ?? member.email ?? i} className="rounded-lg border border-border bg-secondary/20 p-3">
                        {editingMember && ((member.id && editingMember.id === member.id) || (member.userId && editingMember.userId === member.userId)) ? (
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('memberName')}</label>
                                <input
                                  value={editingMember.name}
                                  onChange={(event) => setEditingMember((current) => current ? { ...current, name: event.target.value } : current)}
                                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('assignedRestaurants')}</label>
                                <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-border bg-background/50 p-2">
                                  {restaurants.filter((restaurant) => restaurant.remoteId).map((restaurant) => (
                                    <label key={restaurant.remoteId} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-white">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(restaurant.remoteId && editingMember.restaurantIds?.includes(restaurant.remoteId))}
                                        onChange={(event) => setEditingMember((current) => {
                                          if (!current || !restaurant.remoteId) return current
                                          const currentIds = current.restaurantIds ?? []
                                          return {
                                            ...current,
                                            restaurantIds: event.target.checked
                                              ? Array.from(new Set([...currentIds, restaurant.remoteId]))
                                              : currentIds.filter((id) => id !== restaurant.remoteId),
                                          }
                                        })}
                                        className="accent-current"
                                      />
                                      {restaurant.name}
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('email')}</label>
                                <input
                                  type="email"
                                  value={editingMember.email}
                                  onChange={(event) => setEditingMember((current) => current ? { ...current, email: event.target.value } : current)}
                                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('role')}</label>
                                <select
                                  value={editingMember.role}
                                  onChange={(event) => {
                                    const role = event.target.value as TeamMember['role']
                                    setEditingMember((current) => current ? {
                                      ...current,
                                      role,
                                      permissions: role === 'Admin' ? { read: true, audit: true, create: true, edit: true, delete: true } : current.permissions,
                                    } : current)
                                  }}
                                  className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                                >
                                  <option value="Auditor">{t('auditorRole')}</option>
                                  <option value="Admin">{t('admin')}</option>
                                  <option value="Collaborator">{t('collaborator')}</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {(['read', 'audit', 'create', 'edit', 'delete'] as const).map((permission) => (
                                  <label key={permission} className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground">
                                    <input
                                      type="checkbox"
                                      checked={editingMember.permissions[permission]}
                                      disabled={editingMember.role === 'Admin' || permission === 'read'}
                                      onChange={(event) => setEditingMember((current) => current ? {
                                        ...current,
                                        permissions: { ...current.permissions, [permission]: event.target.checked },
                                      } : current)}
                                      className="accent-current"
                                    />
                                    {permission === 'audit' ? t('auditPermission') : t(permission)}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                              <Button variant="outline" className="bg-transparent" onClick={() => setEditingMember(null)} disabled={isSavingEditedMember}>
                                {t('cancel')}
                              </Button>
                              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveEditedMember} disabled={isSavingEditedMember || !editingMember.name.trim() || !editingMember.email.trim() || !editingMember.restaurantIds?.length}>
                                {isSavingEditedMember ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSavingEditedMember ? t('saving') : t('save')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-foreground">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{t('assignedRestaurants')}: {getRestaurantNames(member.restaurantIds)}</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:items-end">
                              <span className="w-fit rounded bg-accent/20 px-2 py-1 text-xs font-medium text-accent">{roleLabel(member.role)}</span>
                              <p className="text-xs text-muted-foreground">
                                {Object.entries(member.permissions).filter(([, allowed]) => allowed).map(([permission]) => permission === 'audit' ? t('auditPermission') : t(permission as 'read' | 'create' | 'edit' | 'delete')).join(' + ')}
                              </p>
                              {isPrimaryAdmin && member.email.toLowerCase() !== currentUserEmail.toLowerCase() && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="h-8 gap-1 bg-transparent" onClick={() => startEditingMember(member)}>
                                    <Pencil size={14} />
                                    {t('edit')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8 gap-1 border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteMemberTarget(member)}>
                                    <Trash2 size={14} />
                                    {t('delete')}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab !== 'team' && activeTab !== 'subscription' && hasActiveSectionChanges && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" className="bg-transparent" onClick={handleCancelActiveSection} disabled={isSavingSettings}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} disabled={isSavingSettings} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSavingSettings ? t('saving') : t('saveChanges')}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
      {deleteAssignedWorkTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('deleteAssignedWork')}</h2>
                <p className="text-sm text-muted-foreground">{deleteAssignedWorkTarget.id}</p>
              </div>
              <button
                onClick={() => {
                  setDeleteAssignedWorkTarget(null)
                  setDeleteAssignedWorkWord('')
                  setDeleteAssignedWorkId('')
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">{t('deleteAssignedWorkBody')}</p>
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('typeAuditId')}</p>
                <p className="mt-1 break-all font-mono text-sm text-foreground">{deleteAssignedWorkTarget.id}</p>
              </div>
              <input
                value={deleteAssignedWorkWord}
                onChange={(event) => setDeleteAssignedWorkWord(event.target.value)}
                placeholder="delete"
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
              />
              <input
                value={deleteAssignedWorkId}
                onChange={(event) => setDeleteAssignedWorkId(event.target.value)}
                placeholder={deleteAssignedWorkTarget.id}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setDeleteAssignedWorkTarget(null)
                    setDeleteAssignedWorkWord('')
                    setDeleteAssignedWorkId('')
                  }}
                  disabled={isSavingSettings}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 gap-2 bg-destructive text-white hover:bg-destructive/90"
                  disabled={isSavingSettings || deleteAssignedWorkWord !== 'delete' || deleteAssignedWorkId.trim() !== deleteAssignedWorkTarget.id}
                  onClick={handleDeleteAssignedWork}
                >
                  {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isSavingSettings ? t('saving') : t('delete')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 sm:p-4" onClick={() => setIsTeamModalOpen(false)}>
          <div className="auditflow-thin-scrollbar w-full max-w-3xl rounded-lg border border-border bg-card shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4 sm:p-5">
              <h2 className="text-lg font-bold text-foreground">{t('addTeamMember')}</h2>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('memberName')}</label>
                <input
                  value={newTeamMember.name}
                  onChange={(event) => setNewTeamMember((member) => ({ ...member, name: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('email')}</label>
                <input
                  type="email"
                  value={newTeamMember.email}
                  onChange={(event) => setNewTeamMember((member) => ({ ...member, email: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('password')}</label>
                <div className="relative">
                  <input
                    type={showNewMemberPassword ? "text" : "password"}
                    value={newTeamMember.password}
                    onChange={(event) => setNewTeamMember((member) => ({ ...member, password: event.target.value }))}
                    className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 pr-11 text-foreground focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    aria-label={showNewMemberPassword ? t('hidePassword') : t('showPassword')}
                    onClick={() => setShowNewMemberPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {showNewMemberPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('passwordRequirements')}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t('role')}</label>
                <select
                  value={newTeamMember.role}
                  onChange={(event) => {
                    const role = event.target.value as TeamMember['role']
                    setNewTeamMember((member) => ({
                      ...member,
                      role,
                      permissions: role === 'Admin' ? { read: true, audit: true, create: true, edit: true, delete: true } : member.permissions,
                    }))
                  }}
                  className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="Auditor">{t('auditorRole')}</option>
                  <option value="Admin">{t('admin')}</option>
                  <option value="Collaborator">{t('collaborator')}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">{t('assignedRestaurants')}</label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/20 p-2">
                  {restaurants.filter((restaurant) => restaurant.remoteId).map((restaurant) => (
                    <label key={restaurant.remoteId} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground hover:bg-accent hover:text-white">
                      <input
                        type="checkbox"
                        checked={Boolean(restaurant.remoteId && newTeamMember.restaurantIds?.includes(restaurant.remoteId))}
                        onChange={(event) => setNewTeamMember((member) => {
                          if (!restaurant.remoteId) return member
                          const currentIds = member.restaurantIds ?? []
                          return {
                            ...member,
                            restaurantIds: event.target.checked
                              ? Array.from(new Set([...currentIds, restaurant.remoteId]))
                              : currentIds.filter((id) => id !== restaurant.remoteId),
                          }
                        })}
                        className="accent-current"
                      />
                      {restaurant.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-4 md:col-span-2">
                <p className="mb-3 text-sm font-medium text-foreground">{t('permissions')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {(['read', 'audit', 'create', 'edit', 'delete'] as const).map((permission) => (
                    <label key={permission} className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={newTeamMember.permissions[permission]}
                        disabled={newTeamMember.role === 'Admin' || permission === 'read'}
                        onChange={(event) => setNewTeamMember((member) => ({
                          ...member,
                          permissions: { ...member.permissions, [permission]: event.target.checked },
                        }))}
                        className="accent-current"
                      />
                      {permission === 'audit' ? t('auditPermission') : t(permission)}
                    </label>
                  ))}
                </div>
              </div>
              {teamError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">{teamError}</p>}
            </div>
            <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card p-4 sm:p-5">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsTeamModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddTeamMember} disabled={isSavingTeamMember || !newTeamMember.name.trim() || !newTeamMember.email.trim() || !newTeamMember.restaurantIds?.length || (newTeamMember.password ?? '').length < 8 || !/[A-Z]/.test(newTeamMember.password ?? '')}>
                {isSavingTeamMember ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSavingTeamMember ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        </div>
      )}
      {deleteMemberTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t('deleteTeamMember')}</h2>
                <p className="text-sm text-muted-foreground">{deleteMemberTarget.name}</p>
              </div>
              <button
                onClick={() => {
                  setDeleteMemberTarget(null)
                  setDeleteMemberWord('')
                  setDeleteMemberEmail('')
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">{t('deleteTeamMemberBody')}</p>
              <div className="rounded-lg border border-border bg-secondary/20 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('email')}</p>
                <p className="mt-1 break-all font-mono text-sm text-foreground">{deleteMemberTarget.email}</p>
              </div>
              <input
                value={deleteMemberWord}
                onChange={(event) => setDeleteMemberWord(event.target.value)}
                placeholder="delete"
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
              />
              <input
                value={deleteMemberEmail}
                onChange={(event) => setDeleteMemberEmail(event.target.value)}
                placeholder={deleteMemberTarget.email}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setDeleteMemberTarget(null)
                    setDeleteMemberWord('')
                    setDeleteMemberEmail('')
                  }}
                  disabled={isDeletingMember}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 gap-2 bg-destructive text-white hover:bg-destructive/90"
                  disabled={isDeletingMember || deleteMemberWord !== 'delete' || deleteMemberEmail.trim().toLowerCase() !== deleteMemberTarget.email.toLowerCase()}
                  onClick={handleDeleteMember}
                >
                  {isDeletingMember ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isDeletingMember ? t('saving') : t('delete')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
