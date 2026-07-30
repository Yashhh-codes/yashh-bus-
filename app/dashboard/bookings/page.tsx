'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Ticket,
  Eye,
  Trash2,
  XCircle,
} from 'lucide-react';
import { PageContainer } from '@/components/dashboard/page-container';
import { SectionHeader } from '@/components/dashboard/section-header';
import { Card } from '@/components/dashboard/card';
import { TableRow, TableCell } from '@/components/dashboard/table';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Reusable components
import { DataTable, TableColumn } from '@/components/tables/data-table';
import { SearchBar } from '@/components/forms/search-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/tables/pagination';
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog';

// Import services and types
import { bookingService } from '@/services/bookings/bookingService';
import { scheduleService } from '@/services/schedules/scheduleService';
import { routeService } from '@/services/routes/routeService';
import { Booking } from '@/types/booking';
import { Schedule } from '@/types/schedule';
import { Route } from '@/types/route';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Booking for Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load bookings, schedules, routes on mount
  const loadData = async () => {
    try {
      const [bookingsData, schedulesData, routesData] = await Promise.all([
        bookingService.getAll(),
        scheduleService.getAll(),
        routeService.getAll(),
      ]);
      setBookings(bookingsData);
      setSchedules(schedulesData);
      setRoutes(routesData);
    } catch {
      toast.error("Failed to load bookings details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter & Sort logic
  const filteredAndSortedBookings = useMemo(() => {
    const result = bookings.filter((booking) => {
      const schedule = schedules.find((s) => s.id === booking.scheduleId);
      const route = schedule ? routes.find((r) => r.id === schedule.routeId) : null;
      const routeName = route ? `${route.from} ➔ ${route.to} ${route.name}` : '';

      const matchesSearch =
        (booking.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.passengerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.phoneNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (routeName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortField) {
      result.sort((a: Booking, b: Booking) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        if (sortField === 'route') {
          const schA = schedules.find((s) => s.id === a.scheduleId);
          const schB = schedules.find((s) => s.id === b.scheduleId);
          aVal = schA ? routes.find((r) => r.id === schA.routeId)?.name || '' : '';
          bVal = schB ? routes.find((r) => r.id === schB.routeId)?.name || '' : '';
        } else {
          const valA = a[sortField as keyof Booking];
          const valB = b[sortField as keyof Booking];
          if (typeof valA === 'string' || typeof valA === 'number') {
            aVal = valA;
          }
          if (typeof valB === 'string' || typeof valB === 'number') {
            bVal = valB;
          }
        }

        if (typeof aVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal);
        } else {
          return sortDirection === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number);
        }
      });
    }

    return result;
  }, [bookings, schedules, routes, searchQuery, statusFilter, sortField, sortDirection]);

  // Paginated bookings
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBookings, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openCancelModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelOpen(true);
  };

  // Cancel Booking handler
  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      // Refund if status is Paid, otherwise keep Pending or Refunded
      const nextPaymentStatus = selectedBooking.paymentStatus === 'Paid' ? 'Refunded' : selectedBooking.paymentStatus;
      const updated = await bookingService.update(selectedBooking.id, {
        bookingStatus: 'Cancelled',
        paymentStatus: nextPaymentStatus,
      });
      if (updated) {
        setBookings((prev) => prev.map((bk) => (bk.id === selectedBooking.id ? updated : bk)));
        toast.error(`Booking ${selectedBooking.id} marked as Cancelled`);
        setIsCancelOpen(false);
        setSelectedBooking(null);
      }
    } catch {
      toast.error("Failed to cancel ticket reservation");
    }
  };

  const openViewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteOpen(true);
  };

  // Delete Booking handler
  const confirmDeleteBooking = async () => {
    if (!selectedBooking) return;
    try {
      const success = await bookingService.remove(selectedBooking.id);
      if (success) {
        setBookings((prev) => prev.filter((bk) => bk.id !== selectedBooking.id));
        toast.error(`Booking record ${selectedBooking.id} deleted from logs`);
        setIsDeleteOpen(false);
        setSelectedBooking(null);
      }
    } catch {
      toast.error("Failed to delete booking log");
    }
  };

  // Table Columns
  const columns: TableColumn[] = [
    { key: 'id', label: 'Booking ID', sortable: true },
    { key: 'passengerName', label: 'Passenger', sortable: true },
    { key: 'route', label: 'Route info', sortable: true },
    { key: 'seats', label: 'Seats count', sortable: true },
    { key: 'amount', label: 'Total Fare', sortable: true },
    { key: 'paymentStatus', label: 'Payment', sortable: true },
    { key: 'bookingStatus', label: 'Booking Status', sortable: true },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Booking Management"
        description="Search passenger logs, review payment clearings, cancel tickets, and manage bookings."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100/80 shadow-sm">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search ID, passenger name, or phone..."
        />

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto">
          {['All', 'Confirmed', 'Pending', 'Cancelled'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        ) : paginatedBookings.length > 0 ? (
          <div className="flex flex-col justify-between min-h-[460px]">
            <DataTable
              columns={columns}
              data={paginatedBookings}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              renderMobileCard={(booking) => {
                const schedule = schedules.find((s) => s.id === booking.scheduleId);
                const route = schedule ? routes.find((r) => r.id === schedule.routeId) : null;
                return (
                  <div key={booking.id} className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm font-mono">{booking.id}</p>
                        <p className="font-semibold text-slate-700 text-sm mt-0.5">{booking.passengerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{booking.phoneNumber}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={booking.bookingStatus} />
                        <StatusBadge status={booking.paymentStatus} />
                      </div>
                    </div>
                    {/* Route */}
                    {route ? (
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Route</p>
                        <p className="font-semibold text-slate-800 text-xs mt-0.5">{route.name}</p>
                        <p className="text-[11px] text-slate-400">{route.from} ➔ {route.to}</p>
                      </div>
                    ) : null}
                    {/* Amount + seats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Amount</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">₹{booking.amount}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Seats</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{booking.seats} {booking.seats > 1 ? 'Seats' : 'Seat'}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openViewModal(booking)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      {booking.bookingStatus !== 'Cancelled' && (
                        <button
                          onClick={() => openCancelModal(booking)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="flex items-center justify-center h-10 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }}
              renderRow={(booking) => {
                const schedule = schedules.find((s) => s.id === booking.scheduleId);
                const route = schedule ? routes.find((r) => r.id === schedule.routeId) : null;
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-semibold text-slate-900">{booking.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{booking.passengerName}</span>
                        <span className="text-xs text-slate-400 font-mono">{booking.phoneNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {route ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-800">{route.name}</span>
                          <span className="text-[10px] text-slate-400">{route.from} ➔ {route.to}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unresolved route</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {booking.seats} {booking.seats > 1 ? 'Seats' : 'Seat'}
                    </TableCell>
                    <TableCell className="font-bold text-slate-850">₹{booking.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={booking.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.bookingStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openViewModal(booking)}
                          className="p-1.5 hover:bg-slate-50 text-slate-450 hover:text-indigo-650 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {booking.bookingStatus !== 'Cancelled' && (
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="p-1.5 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(booking)}
                          className="p-1.5 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Booking Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }}
            />


            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedBookings.length}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <EmptyState
            icon={Ticket}
            title="No Bookings Found"
            description="We couldn't find any passenger reservations matching your filters."
            actionText="Reset All Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
          />
        )}
      </Card>

      {/* Details View Modal */}
      {selectedBooking && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-indigo-600" />
                <span>Booking Details - {selectedBooking.id}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Overview of passenger ticket purchase and booking status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Passenger</span>
                <span className="text-slate-800 font-bold">{selectedBooking.passengerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Phone Number</span>
                <span className="text-slate-800 font-mono font-semibold">{selectedBooking.phoneNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Route Info</span>
                <span className="text-slate-800 font-bold">
                  {routes.find(r => r.id === (schedules.find(s => s.id === selectedBooking.scheduleId)?.routeId))?.name || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Travel Date</span>
                <span className="text-slate-850 font-mono font-semibold">
                  {schedules.find(s => s.id === selectedBooking.scheduleId)?.travelDate || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Seats Booked</span>
                <span className="text-slate-855 font-bold">{selectedBooking.seats} {selectedBooking.seats > 1 ? 'Seats' : 'Seat'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Amount Paid</span>
                <span className="text-slate-900 font-extrabold text-sm">₹{selectedBooking.amount}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Payment Status</span>
                <StatusBadge status={selectedBooking.paymentStatus} />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Booking Status</span>
                <StatusBadge status={selectedBooking.bookingStatus} />
              </div>
            </div>

            <DialogFooter className="sm:justify-end border-t border-slate-100 pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        title="Cancel Ticket Reservation"
        description={`Are you sure you want to cancel booking "${selectedBooking?.id}"? This will update reservation tables.`}
        onConfirm={confirmCancelBooking}
        variant="danger"
        confirmText="Cancel Reservation"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Passenger Booking Log"
        description={`Are you sure you want to delete passenger booking log "${selectedBooking?.id}"? This is destructive and restricted to admin roles.`}
        onConfirm={confirmDeleteBooking}
        variant="danger"
        confirmText="Delete Log Record"
      />
    </PageContainer>
  );
}
