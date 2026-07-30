'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
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

// Import bus service, routes service, and types
import { busService } from '@/services/buses/busService';
import { routeService } from '@/services/routes/routeService';
import { Bus } from '@/types/bus';
import { Route } from '@/types/route';

// Zod Schema for validation
const busSchema = z.object({
  busNumber: z.string().min(5, "Bus Number must be at least 5 characters"),
  name: z.string().min(3, "Bus Name must be at least 3 characters"),
  type: z.enum(['AC Sleeper', 'AC Seater', 'Semi Sleeper', 'Non AC']),
  capacity: z.number().int("Capacity must be an integer").positive("Capacity must be positive"),
  regNumber: z.string().min(5, "Registration Number is required"),
  modelYear: z.string().regex(/^\d{4}$/, "Model Year must be a 4-digit number (e.g. 2024)"),
  status: z.enum(['Active', 'Maintenance', 'Inactive']),
  assignedRouteId: z.string().nullable().optional(),
});

type BusFormValues = z.infer<typeof busSchema>;

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Sorting & Pagination states
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog overlays
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      busNumber: '',
      name: '',
      type: 'AC Sleeper',
      capacity: 0,
      regNumber: '',
      modelYear: '',
      status: 'Active',
      assignedRouteId: 'none',
    },
  });

  // Load buses and routes on mount
  const loadData = async () => {
    try {
      const [busesData, routesData] = await Promise.all([
        busService.getAll(),
        routeService.getAll(),
      ]);
      setBuses(busesData);
      setRoutes(routesData);
    } catch {
      toast.error("Failed to load buses data");
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
  const filteredAndSortedBuses = useMemo(() => {
    const result = buses.filter((bus) => {
      const routeName = routes.find((r) => r.id === bus.assignedRouteId)?.name || '';
      return (
        (bus.busNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bus.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bus.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (routeName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (sortField) {
      result.sort((a: Bus, b: Bus) => {
        const aVal = a[sortField as keyof Bus];
        const bVal = b[sortField as keyof Bus];
        if (typeof aVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare((bVal ?? '') as string)
            : ((bVal ?? '') as string).localeCompare(aVal);
        } else if (typeof aVal === 'number') {
          return sortDirection === 'asc'
            ? aVal - ((bVal ?? 0) as number)
            : ((bVal ?? 0) as number) - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [buses, routes, searchQuery, sortField, sortDirection]);

  // Pagination
  const paginatedBuses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBuses.slice(start, start + itemsPerPage);
  }, [filteredAndSortedBuses, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedBuses.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Status/Maintenance Toggle
  const handleToggleMaintenance = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Maintenance' : 'Active';
    try {
      const updated = await busService.update(id, { status: nextStatus });
      if (updated) {
        setBuses((prev) => prev.map((b) => (b.id === id ? updated : b)));
        toast.success(`Bus status updated to ${nextStatus}`);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Add Bus
  const onAddSubmit = async (values: BusFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        assignedRouteId: values.assignedRouteId === 'none' || !values.assignedRouteId ? null : values.assignedRouteId,
      };
      const created = await busService.create(payload);
      setBuses((prev) => [created, ...prev]);
      toast.success(`Bus ${created.busNumber} registered successfully`);
      setIsAddOpen(false);
      reset();
    } catch {
      toast.error("Failed to register bus");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Bus
  const handleEditClick = (bus: Bus) => {
    setSelectedBus(bus);
    setValue('busNumber', bus.busNumber);
    setValue('name', bus.name);
    setValue('type', bus.type);
    setValue('capacity', bus.capacity);
    setValue('regNumber', bus.regNumber);
    setValue('modelYear', bus.modelYear);
    setValue('status', bus.status);
    setValue('assignedRouteId', bus.assignedRouteId || 'none');
    setIsEditOpen(true);
  };

  const onEditSubmit = async (values: BusFormValues) => {
    if (!selectedBus) return;
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        assignedRouteId: values.assignedRouteId === 'none' || !values.assignedRouteId ? null : values.assignedRouteId,
      };
      const updated = await busService.update(selectedBus.id, payload);
      if (updated) {
        setBuses((prev) => prev.map((b) => (b.id === selectedBus.id ? updated : b)));
        toast.success(`Bus registry details updated`);
        setIsEditOpen(false);
        reset();
        setSelectedBus(null);
      }
    } catch {
      toast.error("Failed to update bus");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Bus
  const handleDeleteClick = (bus: Bus) => {
    setSelectedBus(bus);
    setIsDeleteOpen(true);
  };

  const confirmDeleteBus = async () => {
    if (!selectedBus) return;
    try {
      const success = await busService.remove(selectedBus.id);
      if (success) {
        setBuses((prev) => prev.filter((b) => b.id !== selectedBus.id));
        toast.error(`Bus ${selectedBus.busNumber} removed from registry`);
        setIsDeleteOpen(false);
        setSelectedBus(null);
      }
    } catch {
      toast.error("Failed to delete bus");
    }
  };

  // Columns Configuration
  const columns: TableColumn[] = [
    { key: 'busNumber', label: 'Plate & Model', sortable: true },
    { key: 'name', label: 'Bus Details', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'capacity', label: 'Capacity', sortable: true },
    { key: 'assignedRouteId', label: 'Assigned Route', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Bus Management"
        description="Register and manage physical vehicle fleets, capacities, types, and operational maintenance states."
        actions={
          <Button
            onClick={() => {
              reset();
              setIsAddOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-4 h-10 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Bus</span>
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
          placeholder="Search bus number, name, or route..."
        />
      </div>

      {/* Buses Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        ) : paginatedBuses.length > 0 ? (
          <div className="flex flex-col justify-between min-h-[460px]">
            <DataTable
              columns={columns}
              data={paginatedBuses}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              renderMobileCard={(bus) => {
                const assignedRoute = routes.find((r) => r.id === bus.assignedRouteId);
                return (
                  <div key={bus.id} className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 font-mono text-sm tracking-wide">{bus.busNumber}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{bus.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Reg: {bus.regNumber} · {bus.modelYear}</p>
                      </div>
                      <StatusBadge status={bus.status} />
                    </div>
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Type</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5">{bus.type}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Capacity</p>
                        <p className="font-semibold text-slate-800 text-sm mt-0.5">{bus.capacity} Seats</p>
                      </div>
                    </div>
                    {/* Assigned route */}
                    {assignedRoute ? (
                      <div className="bg-indigo-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">Assigned Route</p>
                        <p className="font-semibold text-indigo-700 text-xs mt-0.5">{assignedRoute.name}</p>
                        <p className="text-[11px] text-indigo-400">{assignedRoute.from} ➔ {assignedRoute.to}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Assigned Route</p>
                        <p className="text-slate-400 italic text-xs mt-0.5">Unassigned</p>
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleToggleMaintenance(bus.id, bus.status)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {bus.status === 'Active' ? 'Maintenance' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEditClick(bus)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bus)}
                        className="flex items-center justify-center h-10 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }}
              renderRow={(bus) => {
                const assignedRoute = routes.find((r) => r.id === bus.assignedRouteId);
                return (
                  <TableRow key={bus.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 font-mono tracking-wide">{bus.busNumber}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{bus.modelYear} Model</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{bus.name}</span>
                        <span className="text-xs text-slate-400 font-medium">Reg: {bus.regNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{bus.type}</TableCell>
                    <TableCell className="font-semibold text-slate-700">{bus.capacity} Seats</TableCell>
                    <TableCell className="text-slate-650 font-medium max-w-[200px] truncate">
                      {assignedRoute ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-indigo-650">{assignedRoute.name}</span>
                          <span className="text-[10px] text-slate-400">{assignedRoute.from} ➔ {assignedRoute.to}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={bus.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleMaintenance(bus.id, bus.status)}
                          className="p-1.5 hover:bg-slate-50 text-slate-450 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                          title={bus.status === 'Active' ? 'Put under Maintenance' : 'Activate Bus'}
                        >
                          <ShieldAlert className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(bus)}
                          className="p-1.5 hover:bg-slate-50 text-slate-450 hover:text-indigo-650 rounded-lg transition-colors cursor-pointer"
                          title="Edit Bus"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(bus)}
                          className="p-1.5 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Bus"
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
              totalItems={filteredAndSortedBuses.length}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <EmptyState
            icon={Plus}
            title="No Buses Found"
            description="Clear search or register a new bus to display fleet information."
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        )}
      </Card>

      {/* Add Bus Modal */}
      <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) reset(); }}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              <span>Register Fleet Bus</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Add bus specifications, seating layout, and route mappings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 my-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bus Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. MH-12-AB-1234"
                  {...register('busNumber')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 uppercase"
                />
                {errors.busNumber && <p className="text-xs text-rose-500 font-semibold">{errors.busNumber.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bus Name</label>
                <input
                  type="text"
                  placeholder="e.g. SwiftAir Elite"
                  {...register('name')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bus Configuration Type</label>
                <select
                  {...register('type')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="AC Seater">AC Seater</option>
                  <option value="Semi Sleeper">Semi Sleeper</option>
                  <option value="Non AC">Non AC</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seating Capacity</label>
                <input
                  type="number"
                  placeholder="e.g. 36"
                  {...register('capacity', { valueAsNumber: true })}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.capacity && <p className="text-xs text-rose-500 font-semibold">{errors.capacity.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. MH12AB1234"
                  {...register('regNumber')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.regNumber && <p className="text-xs text-rose-500 font-semibold">{errors.regNumber.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  {...register('modelYear')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.modelYear && <p className="text-xs text-rose-500 font-semibold">{errors.modelYear.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                <select
                  {...register('status')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Route</label>
                <select
                  {...register('assignedRouteId')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none text-slate-650"
                >
                  <option value="none">No Route Assigned</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.from} ➔ {r.to})
                    </option>
                  ))}
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
                {submitting ? 'Registering...' : 'Register Bus'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Modal */}
      {selectedBus && (
        <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) reset(); }}>
          <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Edit className="h-5 w-5 text-indigo-650" />
                <span>Edit Bus details - {selectedBus.id}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Modify vehicle attributes, route mappings or active states.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bus Plate Number</label>
                  <input
                    type="text"
                    {...register('busNumber')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 uppercase"
                  />
                  {errors.busNumber && <p className="text-xs text-rose-500 font-semibold">{errors.busNumber.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bus Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bus Configuration Type</label>
                  <select
                    {...register('type')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option value="AC Slee">AC Sleeper</option>
                    <option value="AC Seater">AC Seater</option>
                    <option value="Semi Sleeper">Semi Sleeper</option>
                    <option value="Non AC">Non AC</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seating Capacity</label>
                  <input
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.capacity && <p className="text-xs text-rose-500 font-semibold">{errors.capacity.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Number</label>
                  <input
                    type="text"
                    {...register('regNumber')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.regNumber && <p className="text-xs text-rose-500 font-semibold">{errors.regNumber.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Year</label>
                  <input
                    type="text"
                    {...register('modelYear')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.modelYear && <p className="text-xs text-rose-500 font-semibold">{errors.modelYear.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Route</label>
                  <select
                    {...register('assignedRouteId')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none text-slate-650"
                  >
                    <option value="none">No Route Assigned</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.from} ➔ {r.to})
                      </option>
                    ))}
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
        title="Remove Bus Configuration"
        description={`Are you sure you want to remove bus "${selectedBus?.busNumber}" from the registry?`}
        onConfirm={confirmDeleteBus}
        variant="danger"
        confirmText="Remove Bus"
      />
    </PageContainer>
  );
}
