import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';

/**
 * Admin Dashboard - Clean, Premium, Data-Focused Design
 *
 * Access: #admin or /admin
 * Auth: Requires admin role in Clerk metadata
 *
 * Design Philosophy: Brutalist minimalism - high contrast, bold typography, data-first
 */
export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'health' | 'demographics'>('overview');

  // Analytics queries
  const realtimeStats = useQuery(api.analyticsQueries.getRealtimeDashboard, {});
  const demographics = useQuery(api.adminQueries.getUserDemographics, {});
  const deviceStats = useQuery(api.adminQueries.getDeviceStats, {});
  const healthStats = useQuery(api.adminQueries.getHealthMetricsAggregate, { days: 30 });
  const retention = useQuery(api.adminQueries.getRetentionMetrics, { days: 30 });
  const trainingPrefs = useQuery(api.adminQueries.getTrainingPreferencesStats, {});
  const userList = useQuery(api.adminQueries.getUserList, { limit: 100, offset: 0 });

  // Auth checks
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  const isAdmin = user.publicMetadata?.role === 'admin';
  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b-2 border-[var(--border-strong)] bg-[var(--surface-primary)] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
                ADMIN DASHBOARD
              </h1>
              <p className="text-sm text-[var(--text-secondary)] font-mono">
                Real-time platform analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-[var(--text-tertiary)] font-mono">LOGGED IN AS</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {user.primaryEmailAddress?.emailAddress}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold">
                {user.firstName?.charAt(0) ?? 'A'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-6 border-b-2 border-[var(--border-default)]">
            <TabButton active={selectedTab === 'overview'} onClick={() => setSelectedTab('overview')}>
              OVERVIEW
            </TabButton>
            <TabButton active={selectedTab === 'users'} onClick={() => setSelectedTab('users')}>
              USERS
            </TabButton>
            <TabButton active={selectedTab === 'health'} onClick={() => setSelectedTab('health')}>
              HEALTH DATA
            </TabButton>
            <TabButton active={selectedTab === 'demographics'} onClick={() => setSelectedTab('demographics')}>
              DEMOGRAPHICS
            </TabButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {selectedTab === 'overview' && (
          <OverviewTab
            realtimeStats={realtimeStats}
            retention={retention}
            demographics={demographics}
          />
        )}
        {selectedTab === 'users' && (
          <UsersTab userList={userList} trainingPrefs={trainingPrefs} />
        )}
        {selectedTab === 'health' && (
          <HealthTab healthStats={healthStats} />
        )}
        {selectedTab === 'demographics' && (
          <DemographicsTab demographics={demographics} deviceStats={deviceStats} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border-default)] bg-[var(--surface-primary)] mt-16">
        <div className="max-w-[1400px] mx-auto px-6 py-6 text-center">
          <p className="text-xs text-[var(--text-tertiary)] font-mono">
            REBLD ADMIN • LAST UPDATED: {new Date().toLocaleString()}
          </p>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════

function OverviewTab({ realtimeStats, retention, demographics }: any) {
  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <section>
        <SectionHeader>KEY METRICS (24H)</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="ACTIVE USERS"
            value={realtimeStats?.last24h.activeUsers || 0}
            subtitle={`${realtimeStats?.last7d.activeUsers || 0} in 7d`}
          />
          <MetricCard
            label="WORKOUTS"
            value={realtimeStats?.last24h.workoutsCompleted || 0}
            subtitle={`${realtimeStats?.last7d.workoutsCompleted || 0} in 7d`}
          />
          <MetricCard
            label="PLANS GENERATED"
            value={realtimeStats?.last24h.plansGenerated || 0}
            subtitle={`${realtimeStats?.last7d.plansGenerated || 0} in 7d`}
          />
          <MetricCard
            label="EVENTS TRACKED"
            value={realtimeStats?.last24h.totalEvents || 0}
            subtitle={`${realtimeStats?.last7d.totalEvents || 0} in 7d`}
          />
        </div>
      </section>

      {/* Retention Metrics */}
      <section>
        <SectionHeader>RETENTION (30D)</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="TOTAL USERS" value={retention?.totalUsers || 0} />
          <MetricCard label="NEW USERS" value={retention?.newUsers || 0} />
          <MetricCard
            label="ACTIVE RATE"
            value={`${retention?.activeUserRate || 0}%`}
            valueColor="text-green-500"
          />
          <MetricCard
            label="CHURN RATE"
            value={`${retention?.churnRate || 0}%`}
            valueColor="text-red-500"
          />
        </div>
      </section>

      {/* Geographic Distribution */}
      <section>
        <SectionHeader>TOP COUNTRIES</SectionHeader>
        <DataTable>
          <thead>
            <tr>
              <th>COUNTRY</th>
              <th className="text-right">USERS</th>
              <th className="text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {demographics?.topCountries?.slice(0, 10).map((item: any, i: number) => (
              <tr key={i}>
                <td className="font-bold">{item.country}</td>
                <td className="text-right font-mono">{item.count}</td>
                <td className="text-right font-mono text-[var(--text-tertiary)]">
                  {Math.round((item.count / (demographics.totalUsers || 1)) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}

function UsersTab({ userList, trainingPrefs }: any) {
  return (
    <div className="space-y-8">
      {/* Training Preferences Stats */}
      <section>
        <SectionHeader>TRAINING GOALS</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(trainingPrefs?.byGoal || {}).map(([goal, count]: any) => (
            <div
              key={goal}
              className="bg-[var(--surface-primary)] border-2 border-[var(--border-default)] p-4"
            >
              <div className="text-xs text-[var(--text-tertiary)] font-mono mb-1">{goal.toUpperCase()}</div>
              <div className="text-3xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* User List */}
      <section>
        <SectionHeader>USER LIST ({userList?.total || 0})</SectionHeader>
        <DataTable>
          <thead>
            <tr>
              <th>USER CODE</th>
              <th>LOCATION</th>
              <th className="text-right">WORKOUTS</th>
              <th className="text-right">PLANS</th>
              <th>LAST SEEN</th>
            </tr>
          </thead>
          <tbody>
            {userList?.users?.map((u: any, i: number) => (
              <tr key={i}>
                <td className="font-mono font-bold">{u.userCode || 'N/A'}</td>
                <td>{u.location || 'Unknown'}</td>
                <td className="text-right font-mono">{u.workoutsCompleted}</td>
                <td className="text-right font-mono">{u.plansCreated}</td>
                <td className="text-[var(--text-tertiary)] font-mono text-sm">
                  {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}

function HealthTab({ healthStats }: any) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHeader>HEALTH METRICS (30D AVG)</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="AVG WEIGHT" value={`${healthStats?.averages?.weight || 0} kg`} />
          <MetricCard label="AVG BODY FAT" value={`${healthStats?.averages?.bodyFat || 0}%`} />
          <MetricCard label="AVG SLEEP" value={`${healthStats?.averages?.sleepHours || 0}h`} />
          <MetricCard label="AVG STEPS" value={healthStats?.averages?.stepsPerDay || 0} />
          <MetricCard label="AVG CALORIES" value={healthStats?.averages?.caloriesPerDay || 0} />
          <MetricCard label="TOTAL ENTRIES" value={healthStats?.totalEntries || 0} />
        </div>
      </section>

      <section>
        <SectionHeader>DATA POINTS</SectionHeader>
        <DataTable>
          <thead>
            <tr>
              <th>METRIC</th>
              <th className="text-right">ENTRIES</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold">Weight Logs</td>
              <td className="text-right font-mono">{healthStats?.dataPoints?.weightEntries || 0}</td>
            </tr>
            <tr>
              <td className="font-bold">Body Fat Logs</td>
              <td className="text-right font-mono">{healthStats?.dataPoints?.bodyFatEntries || 0}</td>
            </tr>
            <tr>
              <td className="font-bold">Sleep Logs</td>
              <td className="text-right font-mono">{healthStats?.dataPoints?.sleepEntries || 0}</td>
            </tr>
            <tr>
              <td className="font-bold">Steps Logs</td>
              <td className="text-right font-mono">{healthStats?.dataPoints?.stepsEntries || 0}</td>
            </tr>
            <tr>
              <td className="font-bold">Nutrition Logs</td>
              <td className="text-right font-mono">{healthStats?.dataPoints?.caloriesEntries || 0}</td>
            </tr>
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}

function DemographicsTab({ demographics, deviceStats }: any) {
  return (
    <div className="space-y-8">
      {/* Device Types */}
      <section>
        <SectionHeader>DEVICE TYPES</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(deviceStats?.byDeviceType || {}).map(([type, count]: any) => (
            <MetricCard key={type} label={type.toUpperCase()} value={count} />
          ))}
        </div>
      </section>

      {/* Operating Systems */}
      <section>
        <SectionHeader>OPERATING SYSTEMS</SectionHeader>
        <DataTable>
          <thead>
            <tr>
              <th>OS</th>
              <th className="text-right">USERS</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(deviceStats?.byOS || {}).map(([os, count]: any) => (
              <tr key={os}>
                <td className="font-bold">{os}</td>
                <td className="text-right font-mono">{count}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      {/* Timezones */}
      <section>
        <SectionHeader>TOP TIMEZONES</SectionHeader>
        <DataTable>
          <thead>
            <tr>
              <th>TIMEZONE</th>
              <th className="text-right">USERS</th>
            </tr>
          </thead>
          <tbody>
            {demographics?.topTimezones?.map((item: any, i: number) => (
              <tr key={i}>
                <td className="font-mono">{item.timezone}</td>
                <td className="text-right font-mono">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 text-sm font-bold tracking-wide
        transition-all duration-150
        ${
          active
            ? 'bg-[var(--brand-primary)] text-white border-b-4 border-[var(--brand-primary)]'
            : 'bg-transparent text-[var(--text-secondary)] border-b-4 border-transparent hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
        }
      `}
    >
      {children}
    </button>
  );
}

function SectionHeader({ children }: any) {
  return (
    <h2 className="text-xs font-bold text-[var(--text-tertiary)] tracking-widest mb-4 uppercase">
      {children}
    </h2>
  );
}

function MetricCard({ label, value, subtitle, valueColor }: any) {
  return (
    <div className="bg-[var(--surface-primary)] border-2 border-[var(--border-default)] p-6 hover:border-[var(--brand-primary)] transition-all">
      <div className="text-xs font-mono text-[var(--text-tertiary)] mb-2">{label}</div>
      <div className={`text-4xl font-bold mb-1 ${valueColor || 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-[var(--text-secondary)] font-mono">{subtitle}</div>
      )}
    </div>
  );
}

function DataTable({ children }: any) {
  return (
    <div className="bg-[var(--surface-primary)] border-2 border-[var(--border-default)] overflow-hidden">
      <table className="w-full">
        <style>{`
          thead {
            background: var(--bg-secondary);
            border-bottom: 2px solid var(--border-strong);
          }
          thead th {
            padding: 12px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-tertiary);
            letter-spacing: 0.05em;
          }
          tbody tr {
            border-bottom: 1px solid var(--border-default);
          }
          tbody tr:hover {
            background: var(--surface-hover);
          }
          tbody tr:last-child {
            border-bottom: none;
          }
          tbody td {
            padding: 16px;
            font-size: 14px;
            color: var(--text-primary);
          }
        `}</style>
        {children}
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTH SCREENS
// ═══════════════════════════════════════════════════════════════

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="text-[var(--text-secondary)] font-mono">Loading...</div>
    </div>
  );
}

function AuthRequired() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">AUTHENTICATION REQUIRED</h2>
        <p className="text-[var(--text-secondary)]">Please sign in to access the admin dashboard.</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="text-center max-w-md border-2 border-red-500 p-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">ACCESS DENIED</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          You need admin privileges to access this dashboard.
        </p>
        <p className="text-sm text-[var(--text-tertiary)] font-mono">
          Contact your administrator to request access.
        </p>
      </div>
    </div>
  );
}
