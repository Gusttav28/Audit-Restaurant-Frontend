'use client'

import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Pencil, Plus, Save, Trash2, Users, X } from 'lucide-react'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { useAppContext } from '@/components/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

const defaultPermissions: TeamMember['permissions'] = {
  read: true,
  audit: true,
  create: false,
  edit: true,
  delete: false,
}

export default function TeamPage() {
  const {
    restaurants,
    selectedRestaurant,
    t,
    isPrimaryAdmin,
    currentUserEmail,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
  } = useAppContext()
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isSavingTeamMember, setIsSavingTeamMember] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isSavingEditedMember, setIsSavingEditedMember] = useState(false)
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<TeamMember | null>(null)
  const [deleteMemberWord, setDeleteMemberWord] = useState('')
  const [deleteMemberEmail, setDeleteMemberEmail] = useState('')
  const [isDeletingMember, setIsDeletingMember] = useState(false)
  const [teamError, setTeamError] = useState('')
  const [showNewMemberPassword, setShowNewMemberPassword] = useState(false)
  const [newTeamMember, setNewTeamMember] = useState<TeamMember>({
    name: '',
    email: '',
    password: '',
    role: 'Auditor',
    restaurantIds: selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
    permissions: defaultPermissions,
  })

  const teamMembers = selectedRestaurant.teamMembers ?? []

  useEffect(() => {
    setEditingMember(null)
    setNewTeamMember((member) => ({
      ...member,
      restaurantIds: member.restaurantIds?.length ? member.restaurantIds : selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
    }))
  }, [selectedRestaurant.remoteId])

  const roleLabel = (role: TeamMember['role']) => {
    if (role === 'Admin') return t('admin')
    if (role === 'Collaborator') return t('collaborator')
    return t('auditorRole')
  }

  const getRestaurantNames = (restaurantIds?: string[]) => {
    const names = restaurants
      .filter((restaurant) => restaurant.remoteId && restaurantIds?.includes(restaurant.remoteId))
      .map((restaurant) => restaurant.name)
    return names.length ? names.join(', ') : selectedRestaurant.name
  }

  const startEditingMember = (member: TeamMember) => {
    setTeamError('')
    setEditingMember({
      ...member,
      restaurantIds: member.restaurantIds?.length ? member.restaurantIds : selectedRestaurant.remoteId ? [selectedRestaurant.remoteId] : [],
      permissions: { ...member.permissions },
    })
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
    setTeamError('')
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
          permissions: defaultPermissions,
        })
        setShowNewMemberPassword(false)
        setIsTeamModalOpen(false)
      } else {
        setTeamError(result.error ?? 'Unable to create team member')
      }
      setIsSavingTeamMember(false)
    })
  }

  const handleSaveEditedMember = () => {
    if (!editingMember || !editingMember.name.trim()) return
    if (!editingMember.restaurantIds?.length) {
      setTeamError(t('selectAtLeastOneRestaurant'))
      return
    }
    setIsSavingEditedMember(true)
    setTeamError('')
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
    setTeamError('')
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

  const nextRestaurantIds = (currentIds: string[] | undefined, restaurantId: string, checked: boolean) =>
    checked
      ? Array.from(new Set([...(currentIds ?? []), restaurantId]))
      : (currentIds ?? []).filter((id) => id !== restaurantId)

  if (!isPrimaryAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-6">
            <Card className="border-border bg-card">
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
        <main className="space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('teamMembers')}</h1>
            <p className="mt-1 text-muted-foreground">{t('teamDescription')} · {selectedRestaurant.name}</p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{t('teamManagement')}</CardTitle>
                  <CardDescription>{t('teamDescription')}</CardDescription>
                </div>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsTeamModalOpen(true)}>
                  <Plus size={16} />
                  {t('addTeamMember')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{teamError}</p>}
              <div className="space-y-3">
                {teamMembers.map((member, index) => {
                  const isEditingMember = Boolean(editingMember && ((member.id && editingMember.id === member.id) || (member.userId && editingMember.userId === member.userId)))
                  return (
                    <div key={member.id ?? member.userId ?? member.email ?? index} className="rounded-lg border border-border bg-secondary/20 p-3">
                      {isEditingMember && editingMember ? (
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
                            <div>
                              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('assignedRestaurants')}</label>
                              <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-border bg-background/50 p-2">
                                {restaurants.filter((restaurant) => restaurant.remoteId).map((restaurant) => (
                                  <label key={restaurant.remoteId} className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-white">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(restaurant.remoteId && editingMember.restaurantIds?.includes(restaurant.remoteId))}
                                      onChange={(event) => setEditingMember((current) => current && restaurant.remoteId ? {
                                        ...current,
                                        restaurantIds: nextRestaurantIds(current.restaurantIds, restaurant.remoteId, event.target.checked),
                                      } : current)}
                                      className="accent-current"
                                    />
                                    {restaurant.name}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:grid-cols-5">
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
                            {member.email.toLowerCase() !== currentUserEmail.toLowerCase() && (
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
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 sm:p-4" onClick={() => setIsTeamModalOpen(false)}>
          <div className="auditflow-thin-scrollbar max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card shadow-xl" onClick={(event) => event.stopPropagation()}>
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
                    type={showNewMemberPassword ? 'text' : 'password'}
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
                        onChange={(event) => setNewTeamMember((member) => restaurant.remoteId ? {
                          ...member,
                          restaurantIds: nextRestaurantIds(member.restaurantIds, restaurant.remoteId, event.target.checked),
                        } : member)}
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
