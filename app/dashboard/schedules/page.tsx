'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';
import { PageContainer } from '@/components/dashboard/page-container';
import { SectionHeader } from '@/components/dashboard/section-header';
import { Card } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
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
import { scheduleService } from '@/services/schedules/scheduleService';
import { routeService } from '@/services/routes/routeService';
import { busService } from '@/services/buses/busService';
import { Schedule } from '@/types/schedule';
import { Route } from '@/types/route';
import { Bus } from '@/types/bus';

// Zod Schema for validation
const scheduleSchema = z.object({
  routeId: z.string().min(1, "Route selection is required"),
  busId: z.string().min(1, "Bus assignment is required"),
  departureTime: z.string().min(2, "Departure Time is required (e.g. 08:30 AM)"),
  arrivalTime: z.string().min(2, "Arrival Time is required (e.g. 09:45 AM)"),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Travel Date must be in YYYY-MM-DD format"),
  status: z.enum(['Active', 'Suspended', 'Completed']),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog overlays
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      routeId: '',
      busId: '',
      departureTime: '',
      arrivalTime: '',
      travelDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    },
  });

  // Load data on mount
  const loadData = async () => {
    try {
      const [schedulesData, routesData, busesData] = await Promise.all([
        scheduleService.getAll(),
        routeService.getAll(),
        busService.getAll(),
      ]);
      setSchedules(schedulesData);
      setRoutes(routesData);
      setBuses(busesData);
    } catch {
      toast.error("Failed to load schedules details");
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

  // Filter & Sort
  const filteredAndSortedSchedules = useMemo(() => {
    const result = schedules.filter((sch) => {
      const route = routes.find((r) => r.id === sch.routeId);
      const bus = buses.find((b) => b.id === sch.busId);
      const routeName = route ? `${route.from} ➔ ${route.to} ${route.name}` : '';
      const busName = bus ? `${bus.busNumber} ${bus.name}` : '';

      return (
        (routeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (busName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sch.departureTime || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sch.travelDate || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (sortField) {
      result.sort((a: Schedule, b: Schedule) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        // Custom lookup field sorting helpers
        if (sortField === 'route') {
          aVal = routes.find((route) => route.id === a.routeId)?.name || '';
          bVal = routes.find((route) => route.id === b.routeId)?.name || '';
        } else if (sortField === 'bus') {
          aVal = buses.find((bus) => bus.id === a.busId)?.busNumber || '';
          bVal = buses.find((bus) => bus.id === b.busId)?.busNumber || '';
        } else {
          const valA = a[sortField as keyof Schedule];
          const valB = b[sortField as keyof Schedule];
          if (typeof valA === 'string' || typeof valA === 'number') {
            aVal = valA;
          }
          if (typeof valB === 'string' || typeof valB === 'number') {
            bVal = valB;
          }
        }

        return sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [schedules, routes, buses, searchQuery, sortField, sortDirection]);

  // Pagination
  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSchedules.slice(start, start + itemsPerPage);
  }, [filteredAndSortedSchedules, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedSchedules.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Status Toggle
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const updated = await scheduleService.update(id, { status: nextStatus });
      if (updated) {
        setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
        toast.success(`Trip status updated to ${nextStatus}`);
      }
    } catch {
      toast.error("Failed to toggle trip status");
    }
  };

  // Add Schedule
  const onAddSubmit = async (values: ScheduleFormValues) => {
    setSubmitting(true);
    try {
      const created = await scheduleService.create(values);
      setSchedules((prev) => [created, ...prev]);
      toast.success(`Schedule trip ${created.id} created successfully`);
      setIsAddOpen(false);
      reset();
    } catch {
      toast.error("Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Schedule
  const handleEditClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setValue('routeId', schedule.routeId);
    setValue('busId', schedule.busId);
    setValue('departureTime', schedule.departureTime);
    setValue('arrivalTime', schedule.arrivalTime);
    setValue('travelDate', schedule.travelDate);
    setValue('status', schedule.status);
    setIsEditOpen(true);
  };

  const onEditSubmit = async (values: ScheduleFormValues) => {
    if (!selectedSchedule) return;
    setSubmitting(true);
    try {
      const updated = await scheduleService.update(selectedSchedule.id, values);
      if (updated) {
        setSchedules((prev) => prev.map((s) => (s.id === selectedSchedule.id ? updated : s)));
        toast.success(`Schedule details updated`);
        setIsEditOpen(false);
        reset();
        setSelectedSchedule(null);
      }
    } catch {
      toast.error("Failed to edit schedule");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Schedule
  const handleDeleteClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteOpen(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      const success = await scheduleService.remove(selectedSchedule.id);
      if (success) {
        setSchedules((prev) => prev.filter((s) => s.id !== selectedSchedule.id));
        toast.error(`Schedule ${selectedSchedule.id} deleted successfully`);
        setIsDeleteOpen(false);
        setSelectedSchedule(null);
      }
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  // Table Columns
  const columns: TableColumn[] = [
    { key: 'route',         label: 'Route',      sortable: true,  className: 'w-[28%]' },
    { key: 'bus',           label: 'Bus',        sortable: true,  className: 'w-[18%]' },
    { key: 'travelDate',   label: 'Date',       sortable: true,  className: 'w-[10%]' },
    { key: 'timings',       label: 'Timings',    sortable: false, className: 'w-[14%]' },
    { key: 'availableSeats',label: 'Seats',      sortable: true,  className: 'w-[8%]'  },
    { key: 'status',        label: 'Status',     sortable: true,  className: 'w-[10%]' },
    { key: 'actions',       label: 'Actions',    className: 'text-right w-[12%]' },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Schedule Management"
        description="Establish operational timelines, assign buses to routes, and configure departure clocks."
        actions={
          <Button
            onClick={() => {
              reset();
              setIsAddOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-4 h-10 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100/80 shadow-sm">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search schedules by route, bus, or date..."
        />
      </div>

      {/* Schedules Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        ) : paginatedSchedules.length > 0 ? (
          <div className="flex flex-col justify-between min-h-[460px]">
            <DataTable
              columns={columns}
              data={paginatedSchedules}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              renderMobileCard={(sch) => {
                const route = routes.find((r) => r.id === sch.routeId);
                const bus = buses.find((b) => b.id === sch.busId);
                return (
                  <div key={sch.id} className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {route ? (
                          <>
                            <p className="font-semibold text-slate-900 text-sm truncate">{route.name}</p>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{route.from} ➔ {route.to}</p>
                          </>
                        ) : (
                          <p className="text-slate-400 italic text-xs">{sch.routeId}</p>
                        )}
                      </div>
                      <StatusBadge status={sch.status} />
                    </div>
                    {/* Bus info */}
                    {bus && (
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Bus</p>
                        <p className="font-bold text-slate-800 font-mono text-xs mt-0.5">{bus.busNumber}</p>
                        <p className="text-[11px] text-slate-400">{bus.type}</p>
                      </div>
                    )}
                    {/* Timing grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2.5 col-span-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Date</p>
                        <p className="font-semibold text-slate-800 text-xs mt-0.5">{sch.travelDate}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5 col-span-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Departs</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{sch.departureTime}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5 col-span-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Arrives</p>
                        <p className="font-semibold text-slate-600 text-xs mt-0.5">{sch.arrivalTime}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{sch.availableSeats} seats available</p>
                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleToggleStatus(sch.id, sch.status)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          sch.status === 'Active'
                            ? 'border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {sch.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEditClick(sch)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sch)}
                        className="flex items-center justify-center h-10 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }}
              renderRow={(sch) => {
                const route = routes.find((r) => r.id === sch.routeId);
                const bus = buses.find((b) => b.id === sch.busId);

                return (
                  <TableRow key={sch.id}>
                    {/* Route */}
                    <TableCell>
                      {route ? (
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-semibold text-slate-900 truncate text-sm" title={route.name}>{route.name}</span>
                          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide truncate">{route.from} ➔ {route.to}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unknown ({sch.routeId})</span>
                      )}
                    </TableCell>
                    {/* Bus */}
                    <TableCell>
                      {bus ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 font-mono text-xs">{bus.busNumber}</span>
                          <span className="text-[11px] text-slate-400">{bus.type}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">{sch.busId}</span>
                      )}
                    </TableCell>
                    {/* Date */}
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {sch.travelDate}
                    </TableCell>
                    {/* Timings */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-slate-800">{sch.departureTime}</span>
                        <span className="font-mono text-[11px] text-slate-400">{sch.arrivalTime}</span>
                      </div>
                    </TableCell>
                    {/* Seats */}
                    <TableCell className="font-semibold text-slate-800 text-sm">
                      {sch.availableSeats}
                    </TableCell>
                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={sch.status} />
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleToggleStatus(sch.id, sch.status)}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          title={sch.status === 'Active' ? 'Suspend Trip' : 'Activate Trip'}
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(sch)}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Schedule"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sch)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Schedule"
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
              totalItems={filteredAndSortedSchedules.length}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Schedules Found"
            description="Create custom operational departure timetables or clear search query."
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        )}
      </Card>

      {/* Add Schedule Modal */}
      <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) reset(); }}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              <span>Schedule New Trip</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Select standard routes and map available fleet vehicles.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 my-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operational Route</label>
              <select
                {...register('routeId')}
                className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-855 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.from} ➔ {r.to})
                  </option>
                ))}
              </select>
              {errors.routeId && <p className="text-xs text-rose-500 font-semibold">{errors.routeId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Vehicle Assigned</label>
              <select
                {...register('busId')}
                className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-855 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
              >
                <option value="">Select Bus</option>
                {buses.filter(b => b.status === 'Active').map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} - {b.name} ({b.type}, {b.capacity} Seats)
                  </option>
                ))}
              </select>
              {errors.busId && <p className="text-xs text-rose-500 font-semibold">{errors.busId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departure Time</label>
                <input
                  type="text"
                  placeholder="e.g. 08:30 AM"
                  {...register('departureTime')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.departureTime && <p className="text-xs text-rose-500 font-semibold">{errors.departureTime.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Arrival Time</label>
                <input
                  type="text"
                  placeholder="e.g. 09:45 AM"
                  {...register('arrivalTime')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.arrivalTime && <p className="text-xs text-rose-500 font-semibold">{errors.arrivalTime.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel Date</label>
                <input
                  type="date"
                  {...register('travelDate')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer"
                />
                {errors.travelDate && <p className="text-xs text-rose-500 font-semibold">{errors.travelDate.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                <select
                  {...register('status')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <DialogFooter className="sm:justify-end border-t border-slate-100 pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  reset();
                }}
                className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Schedule'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      {selectedSchedule && (
        <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) reset(); }}>
          <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Edit className="h-5 w-5 text-indigo-650" />
                <span>Edit Schedule - {selectedSchedule.id}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Modify departure dates, bus allocations or active trip statuses.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 my-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operational Route</label>
                <select
                  {...register('routeId')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-855 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.from} ➔ {r.to})
                    </option>
                  ))}
                </select>
                {errors.routeId && <p className="text-xs text-rose-500 font-semibold">{errors.routeId.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Vehicle Assigned</label>
                <select
                  {...register('busId')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-855 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} - {b.name} ({b.type})
                    </option>
                  ))}
                </select>
                {errors.busId && <p className="text-xs text-rose-500 font-semibold">{errors.busId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departure Time</label>
                  <input
                    type="text"
                    {...register('departureTime')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.departureTime && <p className="text-xs text-rose-500 font-semibold">{errors.departureTime.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Arrival Time</label>
                  <input
                    type="text"
                    {...register('arrivalTime')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.arrivalTime && <p className="text-xs text-rose-500 font-semibold">{errors.arrivalTime.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel Date</label>
                  <input
                    type="date"
                    {...register('travelDate')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer"
                  />
                  {errors.travelDate && <p className="text-xs text-rose-500 font-semibold">{errors.travelDate.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="sm:justify-end border-t border-slate-100 pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    reset();
                  }}
                  className="h-10 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Cancel Scheduled Departure"
        description={`Are you sure you want to delete schedule "${selectedSchedule?.id}"? This is non-reversible.`}
        onConfirm={confirmDeleteSchedule}
        variant="danger"
        confirmText="Delete Schedule"
      />
    </PageContainer>
  );
}
