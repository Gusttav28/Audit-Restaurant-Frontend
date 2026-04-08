'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { Save, Lock, Bell, Users, Palette, CreditCard, Check, ArrowUpRight, AlertCircle } from 'lucide-react'

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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [settings, setSettings] = useState({
    restaurantName: 'Downtown Bistro',
    email: 'admin@downtownbistro.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    auditNotifications: true,
    inventoryAlerts: true,
    weeklyReports: true,
    lowStockThreshold: 5,
  })

  useEffect(() => {
    const userData = localStorage.getItem("auditflow_user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.subscription) {
        setSubscription(user.subscription)
      }
    }
  }, [])

  const currentPlan = subscription?.plan ? planDetails[subscription.plan] : null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSave = () => {
    console.log('Settings saved:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: Palette },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'team', label: 'Team', icon: Users },
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
          <div className="max-w-2xl space-y-6">
            {activeTab === 'general' && (
              <>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Restaurant Information</CardTitle>
                    <CardDescription>Update your restaurant details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Restaurant Name</label>
                      <input
                        type="text"
                        name="restaurantName"
                        value={settings.restaurantName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={settings.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={settings.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Inventory Preferences</CardTitle>
                    <CardDescription>Configure inventory management settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Low Stock Threshold</label>
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
              </>
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
                                ${currentPlan.price}<span className="text-sm">/month</span>
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
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage team members and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    + Add Team Member
                  </Button>
                  <div className="space-y-3">
                    {[
                      { name: 'John Smith', email: 'john@restaurant.com', role: 'Admin' },
                      { name: 'Sarah Johnson', email: 'sarah@restaurant.com', role: 'Auditor' },
                      { name: 'Michael Chen', email: 'michael@restaurant.com', role: 'Auditor' },
                    ].map((member, i) => (
                      <div key={i} className="p-3 bg-secondary/20 rounded-lg border border-border flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-accent/20 text-accent rounded">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Save size={18} />
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
