'use client'

import React, { useState } from 'react'
import { Bell, Loader2, Pencil, RefreshCw, Save, Trash2, X } from 'lucide-react'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/components/app-context'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { RestaurantAudit } from '@/components/inventory/multi-restaurant-data'

type SupabaseDataClient = Omit<ReturnType<typeof createSupabaseBrowserClient>, "from"> & {
  from: (table: string) => any
}

const createSupabaseDataClient = () => createSupabaseBrowserClient() as unknown as SupabaseDataClient

export default function AssignedWorkPage() {
  const {
    selectedRestaurant,
    updateSelectedRestaurant,
    t,
    isAdmin,
    assignedAuditWork,
    refreshAssignedWork,
  } = useAppContext()
  const [isRefreshingAssignedWork, setIsRefreshingAssignedWork] = useState(false)
  const [isSavingAssignedWork, setIsSavingAssignedWork] = useState(false)
  const [editingAssignedWork, setEditingAssignedWork] = useState<RestaurantAudit | null>(null)
  const [deleteAssignedWorkTarget, setDeleteAssignedWorkTarget] = useState<RestaurantAudit | null>(null)
  const [deleteAssignedWorkWord, setDeleteAssignedWorkWord] = useState('')
  const [deleteAssignedWorkId, setDeleteAssignedWorkId] = useState('')
  const [collaboratorFilter, setCollaboratorFilter] = useState('all')

  const teamMembers = selectedRestaurant.teamMembers ?? []
  const filteredAssignedAuditWork = assignedAuditWork.filter((audit) => {
    if (collaboratorFilter === 'all') return true
    return (audit.auditorId ?? audit.auditor) === collaboratorFilter
  })

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

  const buildAssignmentNotes = (audit: RestaurantAudit) => [
    audit.notes,
    audit.helperName ? `${t('helper')}: ${audit.helperName}` : '',
    audit.temporaryHelperName ? `${t('temporaryCollaborator')}: ${audit.temporaryHelperName}` : '',
    audit.assignedByAdminId ? `[AuditFlowAssignment:${audit.assignedByAdminId}:${audit.assignedByAdminName ?? ''}]` : '',
  ].filter(Boolean).join('\n')

  const handleRefreshAssignedWork = () => {
    setIsRefreshingAssignedWork(true)
    void refreshAssignedWork().finally(() => {
      setIsRefreshingAssignedWork(false)
    })
  }

  const handleSaveAssignedWork = async () => {
    if (!editingAssignedWork?.remoteId) return
    setIsSavingAssignedWork(true)
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
      setIsSavingAssignedWork(false)
    }
  }

  const handleDeleteAssignedWork = async () => {
    if (!deleteAssignedWorkTarget?.remoteId) return
    setIsSavingAssignedWork(true)
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
      setIsSavingAssignedWork(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-6">
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <Bell size={34} className="text-muted-foreground" />
                <p className="text-muted-foreground">{t('noPermission')}</p>
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
            <h1 className="text-3xl font-bold text-foreground">{t('assignedWork')}</h1>
            <p className="mt-1 text-muted-foreground">{t('assignedWorkSubtitle')} · {selectedRestaurant.name}</p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{t('assignedWork')}</CardTitle>
                  <CardDescription>{t('assignedWorkSubtitle')}</CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="sr-only" htmlFor="assigned-work-collaborator-filter">{t('filterByCollaborator')}</label>
                  <select
                    id="assigned-work-collaborator-filter"
                    value={collaboratorFilter}
                    onChange={(event) => setCollaboratorFilter(event.target.value)}
                    className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                    title={t('filterByCollaborator')}
                  >
                    <option value="all">{t('allCollaborators')}</option>
                    {teamMembers.map((member) => (
                      <option key={member.userId ?? member.email} value={member.userId ?? member.name}>{member.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" className="gap-2 bg-transparent" onClick={handleRefreshAssignedWork} disabled={isRefreshingAssignedWork}>
                    {isRefreshingAssignedWork ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {t('refresh')}
                  </Button>
                </div>
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
                    {filteredAssignedAuditWork.length ? filteredAssignedAuditWork.map((audit) => {
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
                              {isEditingWork ? (
                                <>
                                  <Button size="sm" className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveAssignedWork} disabled={isSavingAssignedWork}>
                                    {isSavingAssignedWork ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {t('save')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8 bg-transparent" onClick={() => setEditingAssignedWork(null)} disabled={isSavingAssignedWork}>
                                    {t('cancel')}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => setEditingAssignedWork({ ...audit })}>
                                    <Pencil size={14} />
                                    {t('edit')}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 gap-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteAssignedWorkTarget(audit)}>
                                    <Trash2 size={14} />
                                    {t('delete')}
                                  </Button>
                                </>
                              )}
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
                  disabled={isSavingAssignedWork}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 gap-2 bg-destructive text-white hover:bg-destructive/90"
                  disabled={isSavingAssignedWork || deleteAssignedWorkWord !== 'delete' || deleteAssignedWorkId.trim() !== deleteAssignedWorkTarget.id}
                  onClick={handleDeleteAssignedWork}
                >
                  {isSavingAssignedWork ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isSavingAssignedWork ? t('saving') : t('delete')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
