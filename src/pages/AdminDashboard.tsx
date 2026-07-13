import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Home,
  CalendarDays,
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  Inbox,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Status badge helper                                                */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    confirmed: { variant: 'default', className: 'bg-deep-forest text-white hover:bg-deep-forest/90' },
    pending: { variant: 'secondary', className: 'bg-savanna-gold/20 text-amber-800 hover:bg-savanna-gold/30' },
    cancelled: { variant: 'destructive', className: '' },
    completed: { variant: 'outline', className: 'border-deep-forest text-deep-forest hover:bg-deep-forest/10' },
    approved: { variant: 'default', className: 'bg-deep-forest text-white hover:bg-deep-forest/90' },
    rejected: { variant: 'destructive', className: '' },
  }

  const cfg = variantMap[status.toLowerCase()] ?? { variant: 'secondary', className: '' }
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

/* ------------------------------------------------------------------ */
/*  Format currency to UGX                                             */
/* ------------------------------------------------------------------ */
function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/* ------------------------------------------------------------------ */
/*  Format date                                                        */
/* ------------------------------------------------------------------ */
function fmtDate(d: string | Date | null): string {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  Tab 1: Pending Properties                                          */
/* ------------------------------------------------------------------ */
function PendingPropertiesTab() {
  const utils = trpc.useUtils()
  const { data: pendingList, isLoading } = trpc.admin.listPendingProperties.useQuery()

  const approve = trpc.admin.approveProperty.useMutation({
    onSuccess: () => utils.admin.listPendingProperties.invalidate(),
  })
  const reject = trpc.admin.rejectProperty.useMutation({
    onSuccess: () => utils.admin.listPendingProperties.invalidate(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sunset border-t-transparent" />
      </div>
    )
  }

  if (!pendingList || pendingList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate">
        <Inbox className="mb-4 h-12 w-12 opacity-40" />
        <p className="text-lg font-medium">No pending properties</p>
        <p className="text-sm">All property submissions have been reviewed.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-warm-sand hover:bg-warm-sand">
            <TableHead className="font-semibold text-charcoal">ID</TableHead>
            <TableHead className="font-semibold text-charcoal">Title</TableHead>
            <TableHead className="font-semibold text-charcoal">Location</TableHead>
            <TableHead className="font-semibold text-charcoal">Price/Night</TableHead>
            <TableHead className="font-semibold text-charcoal">Owner</TableHead>
            <TableHead className="font-semibold text-charcoal">Submitted</TableHead>
            <TableHead className="font-semibold text-charcoal">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingList.map((property) => (
            <TableRow key={property.id} className="hover:bg-cream">
              <TableCell className="font-mono text-sm text-slate">#{property.id}</TableCell>
              <TableCell className="font-medium text-charcoal">{property.title}</TableCell>
              <TableCell className="text-slate">{property.location}</TableCell>
              <TableCell className="font-medium text-deep-forest">
                {formatUGX(property.pricePerNight)}
              </TableCell>
              <TableCell className="text-slate">{property.ownerId}</TableCell>
              <TableCell className="text-slate">{fmtDate(property.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-deep-forest text-white hover:bg-deep-forest/90"
                    onClick={() => approve.mutate({ id: property.id })}
                    disabled={approve.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => reject.mutate({ id: property.id })}
                    disabled={reject.isPending}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 2: All Bookings                                                */
/* ------------------------------------------------------------------ */
function AllBookingsTab() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = trpc.admin.listAllBookings.useQuery(
    { page, limit },
    { keepPreviousData: true }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sunset border-t-transparent" />
      </div>
    )
  }

  const bookings = data?.bookings ?? []
  const pagination = data?.pagination

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-warm-sand hover:bg-warm-sand">
              <TableHead className="font-semibold text-charcoal">Booking Ref</TableHead>
              <TableHead className="font-semibold text-charcoal">Property ID</TableHead>
              <TableHead className="font-semibold text-charcoal">Guest ID</TableHead>
              <TableHead className="font-semibold text-charcoal">Dates</TableHead>
              <TableHead className="font-semibold text-charcoal">Total</TableHead>
              <TableHead className="font-semibold text-charcoal">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-slate">
                  <Inbox className="mx-auto mb-2 h-10 w-10 opacity-40" />
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-cream">
                  <TableCell className="font-mono text-sm font-medium text-charcoal">
                    {booking.bookingRef}
                  </TableCell>
                  <TableCell className="text-slate">#{booking.propertyId}</TableCell>
                  <TableCell className="text-slate">#{booking.userId}</TableCell>
                  <TableCell className="text-slate">
                    {fmtDate(booking.checkIn)} — {fmtDate(booking.checkOut)}
                  </TableCell>
                  <TableCell className="font-medium text-deep-forest">
                    {formatUGX(booking.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <p className="text-sm text-slate">
            Showing {(page - 1) * limit + 1} –{' '}
            {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount} bookings
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="flex items-center px-2 text-sm text-slate">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Platform Stats                                              */
/* ------------------------------------------------------------------ */
function PlatformStatsTab() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sunset border-t-transparent" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate">
        <BarChart3 className="mb-4 h-12 w-12 opacity-40" />
        <p>Failed to load stats.</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Home,
      color: 'text-deep-forest',
      bg: 'bg-deep-forest/10',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: CalendarDays,
      color: 'text-sunset',
      bg: 'bg-sunset/10',
    },
    {
      title: 'Total Revenue',
      value: formatUGX(stats.totalRevenue),
      icon: CreditCard,
      color: 'text-savanna-gold',
      bg: 'bg-savanna-gold/10',
    },
    {
      title: 'Active Hosts',
      value: stats.approvedProperties,
      icon: Users,
      color: 'text-teal-depth',
      bg: 'bg-teal-depth/10',
    },
  ]

  // Mock monthly bookings data for bar chart
  const monthlyData = [
    { month: 'Jan', value: 12 },
    { month: 'Feb', value: 19 },
    { month: 'Mar', value: 25 },
    { month: 'Apr', value: 18 },
    { month: 'May', value: 32 },
    { month: 'Jun', value: 45 },
    { month: 'Jul', value: 38 },
    { month: 'Aug', value: 28 },
    { month: 'Sep', value: 22 },
    { month: 'Oct', value: 35 },
    { month: 'Nov', value: 30 },
    { month: 'Dec', value: 42 },
  ]
  const maxValue = Math.max(...monthlyData.map((d) => d.value))

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border border-light-grey">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl ${card.bg} p-3`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate">{card.title}</p>
                <p className="text-2xl font-bold text-charcoal">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Bookings Bar Chart */}
      <Card className="border border-light-grey">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-charcoal">
            Monthly Bookings Overview
          </CardTitle>
          <CardDescription className="text-slate">
            Booking volume across the year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs text-slate">{d.value}</span>
                  <div
                    className="w-full rounded-t-md bg-sunset transition-all duration-500 hover:bg-sunset/80"
                    style={{
                      height: `${Math.max((d.value / maxValue) * 200, 8)}px`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-slate">{d.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-light-grey">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate">Booking Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Confirmed</span>
              <Badge className="bg-deep-forest text-white">{stats.confirmedBookings}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Pending</span>
              <Badge className="bg-savanna-gold text-amber-900">{stats.pendingBookings}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Cancelled</span>
              <Badge variant="destructive">{stats.cancelledBookings}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Completed</span>
              <Badge variant="outline" className="border-deep-forest text-deep-forest">
                {stats.completedBookings}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-light-grey">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate">Property Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Total</span>
              <span className="text-lg font-bold text-charcoal">{stats.totalProperties}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Approved</span>
              <span className="font-medium text-deep-forest">{stats.approvedProperties}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Pending Approval</span>
              <span className="font-medium text-sunset">{stats.pendingProperties}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-light-grey">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Total Revenue</span>
              <span className="font-bold text-deep-forest">{formatUGX(stats.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal">Avg. per Booking</span>
              <span className="font-medium text-charcoal">
                {stats.totalBookings > 0
                  ? formatUGX(Math.round(stats.totalRevenue / stats.totalBookings))
                  : formatUGX(0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Admin Dashboard                                               */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  // Route guard — placeholder for now; real auth check will come later
  const isAdmin = true // TODO: wire up to real auth check

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-16 w-16 text-earth-red" />
        <h1 className="text-2xl font-bold text-charcoal">Access Denied</h1>
        <p className="text-slate">You need admin privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-sand">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="mt-1 text-slate">Manage properties, bookings, and platform analytics.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6 bg-cream">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-sunset data-[state=active]:text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              Pending Properties
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="data-[state=active]:bg-sunset data-[state=active]:text-white"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              All Bookings
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-sunset data-[state=active]:text-white"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Platform Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            <Card className="border border-light-grey">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-charcoal">
                  Pending Property Submissions
                </CardTitle>
                <CardDescription className="text-slate">
                  Review and approve or reject property listings submitted by hosts.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <PendingPropertiesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-0">
            <Card className="border border-light-grey">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-charcoal">
                  All Bookings
                </CardTitle>
                <CardDescription className="text-slate">
                  View every booking made on the platform with status and pagination.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <AllBookingsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <PlatformStatsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
