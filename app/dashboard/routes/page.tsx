'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Map,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
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

// Import route service and types
import { routeService } from '@/services/routes/routeService';
import { Route } from '@/types/route';

// Zod Schema for validation
const routeSchema = z.object({
  name: z.string().min(3, "Route Name must be at least 3 characters"),
  from: z.string().min(3, "Origin Terminal must be at least 3 characters"),
  to: z.string().min(3, "Destination Terminal must be at least 3 characters"),
  distance: z.number().positive("Distance must be a positive number"),
  duration: z.string().min(2, "Duration is required (e.g. 1h 30m)"),
  fare: z.number().positive("Fare must be a positive number"),
  status: z.enum(['Active', 'Inactive']),
});

type RouteFormValues = z.infer<typeof routeSchema>;

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
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
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: '',
      from: '',
      to: '',
      distance: undefined,
      duration: '',
      fare: undefined,
      status: 'Active',
    },
  });

  // Load routes on mount
  const loadRoutes = async () => {
    try {
      const data = await routeService.getAll();
      setRoutes(data);
    } catch {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoutes();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter & Sort
  const filteredAndSortedRoutes = useMemo(() => {
    const result = routes.filter((route) => {
      return (
        (route.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route.from || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route.to || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route.id || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (sortField) {
      result.sort((a: Route, b: Route) => {
        const aVal = a[sortField as keyof Route];
        const bVal = b[sortField as keyof Route];
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
  }, [routes, searchQuery, sortField, sortDirection]);

  // Pagination
  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRoutes.slice(start, start + itemsPerPage);
  }, [filteredAndSortedRoutes, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedRoutes.length / itemsPerPage);

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
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await routeService.update(id, { status: nextStatus });
      if (updated) {
        setRoutes((prev) => prev.map((r) => (r.id === id ? updated : r)));
        toast.success(`Route status changed to ${nextStatus}`);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Add Route
  const onAddSubmit = async (values: RouteFormValues) => {
    setSubmitting(true);
    try {
      const created = await routeService.create(values);
      setRoutes((prev) => [created, ...prev]);
      toast.success(`Route ${created.id} created successfully`);
      setIsAddOpen(false);
      reset();
    } catch {
      toast.error("Failed to create route");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Route
  const handleEditClick = (route: Route) => {
    setSelectedRoute(route);
    setValue('name', route.name);
    setValue('from', route.from);
    setValue('to', route.to);
    setValue('distance', route.distance);
    setValue('duration', route.duration);
    setValue('fare', route.fare);
    setValue('status', route.status);
    setIsEditOpen(true);
  };

  const onEditSubmit = async (values: RouteFormValues) => {
    if (!selectedRoute) return;
    setSubmitting(true);
    try {
      const updated = await routeService.update(selectedRoute.id, values);
      if (updated) {
        setRoutes((prev) => prev.map((r) => (r.id === selectedRoute.id ? updated : r)));
        toast.success(`Route details updated`);
        setIsEditOpen(false);
        reset();
        setSelectedRoute(null);
      }
    } catch {
      toast.error("Failed to update route");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Route
  const handleDeleteClick = (route: Route) => {
    setSelectedRoute(route);
    setIsDeleteOpen(true);
  };

  const confirmDeleteRoute = async () => {
    if (!selectedRoute) return;
    try {
      const success = await routeService.remove(selectedRoute.id);
      if (success) {
        setRoutes((prev) => prev.filter((r) => r.id !== selectedRoute.id));
        toast.error(`Route ${selectedRoute.id} removed successfully`);
        setIsDeleteOpen(false);
        setSelectedRoute(null);
      }
    } catch {
      toast.error("Failed to delete route");
    }
  };

  // Columns Configuration
  const columns: TableColumn[] = [
    { key: 'name', label: 'Route Info', sortable: true },
    { key: 'from', label: 'Visual Connection Map', sortable: false },
    { key: 'distance', label: 'Distance', sortable: true },
    { key: 'duration', label: 'Duration', sortable: true },
    { key: 'fare', label: 'Base Fare', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Routes Management"
        description="Configure operational bus routes, terminals, distances, and core pricing variables."
        actions={
          <Button
            onClick={() => {
              reset();
              setIsAddOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-4 h-10 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Route</span>
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
          placeholder="Search terminals or route..."
        />
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        ) : paginatedRoutes.length > 0 ? (
          <div className="flex flex-col justify-between min-h-[460px]">
            <DataTable
              columns={columns}
              data={paginatedRoutes}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              renderMobileCard={(route) => (
                <div key={route.id} className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{route.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono font-bold uppercase tracking-wide mt-0.5">{route.id}</p>
                    </div>
                    <StatusBadge status={route.status} />
                  </div>
                  {/* Route path */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">{route.from}</span>
                    <span className="text-indigo-400 font-black">────▶</span>
                    <span className="font-semibold text-slate-500">{route.to}</span>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Distance</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{route.distance} km</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Duration</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{route.duration}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Fare</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">₹{route.fare}</p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleToggleStatus(route.id, route.status)}
                      className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        route.status === 'Active'
                          ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {route.status === 'Active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {route.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditClick(route)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(route)}
                      className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
              renderRow={(route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{route.name}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{route.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-slate-800 font-medium">
                      <div className="text-xs font-bold text-slate-700">{route.from}</div>
                      <div className="flex items-center space-x-2 my-0.5 text-slate-400 select-none">
                        <span className="text-[10px] tracking-widest font-mono text-indigo-400/70 font-black">─────────────▶</span>
                      </div>
                      <div className="text-xs font-bold text-slate-500">{route.to}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {route.distance} km
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {route.duration}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    ₹{route.fare}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={route.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(route.id, route.status)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          route.status === 'Active'
                            ? 'hover:bg-rose-50 text-slate-450 hover:text-rose-600'
                            : 'hover:bg-emerald-50 text-slate-450 hover:text-emerald-600'
                        }`}
                        title={route.status === 'Active' ? 'Deactivate Route' : 'Activate Route'}
                      >
                        {route.status === 'Active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(route)}
                        className="p-1.5 hover:bg-slate-50 text-slate-450 hover:text-indigo-650 rounded-lg transition-colors cursor-pointer"
                        title="Edit Route"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(route)}
                        className="p-1.5 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Route"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            />


            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedRoutes.length}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <EmptyState
            icon={Map}
            title="No Routes Found"
            description="Create custom operational routes or clear query filters."
            actionText="Clear Search Query"
            onAction={() => setSearchQuery('')}
          />
        )}
      </Card>

      {/* Add Route Modal */}
      <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if (!val) reset(); }}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Map className="h-5 w-5 text-indigo-600" />
              <span>Configure New Route</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Add operational start/end terminals, fare, and distances.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 my-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Route Name</label>
              <input
                type="text"
                placeholder="e.g. Hinjewadi-Kothrud Express"
                {...register('name')}
                className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
              />
              {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From Terminal</label>
                <input
                  type="text"
                  placeholder="e.g. Hinjewadi Depot"
                  {...register('from')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.from && <p className="text-xs text-rose-500 font-semibold">{errors.from.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To Terminal</label>
                <input
                  type="text"
                  placeholder="e.g. Kothrud Depot"
                  {...register('to')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.to && <p className="text-xs text-rose-500 font-semibold">{errors.to.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance (km)</label>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  {...register('distance', { valueAsNumber: true })}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.distance && <p className="text-xs text-rose-500 font-semibold">{errors.distance.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 45m"
                  {...register('duration')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.duration && <p className="text-xs text-rose-500 font-semibold">{errors.duration.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Fare (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  {...register('fare', { valueAsNumber: true })}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.fare && <p className="text-xs text-rose-500 font-semibold">{errors.fare.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                <select
                  {...register('status')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
                {submitting ? 'Creating...' : 'Create Route'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Route Modal */}
      {selectedRoute && (
        <Dialog open={isEditOpen} onOpenChange={(val) => { setIsEditOpen(val); if (!val) reset(); }}>
          <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Edit className="h-5 w-5 text-indigo-650" />
                <span>Edit Route - {selectedRoute.id}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-1">
                Modify parameters of the operational bus route.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 my-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Route Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                />
                {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From Terminal</label>
                  <input
                    type="text"
                    {...register('from')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.from && <p className="text-xs text-rose-500 font-semibold">{errors.from.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To Terminal</label>
                  <input
                    type="text"
                    {...register('to')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.to && <p className="text-xs text-rose-500 font-semibold">{errors.to.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance (km)</label>
                  <input
                    type="number"
                    {...register('distance', { valueAsNumber: true })}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.distance && <p className="text-xs text-rose-500 font-semibold">{errors.distance.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Duration</label>
                  <input
                    type="text"
                    {...register('duration')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.duration && <p className="text-xs text-rose-500 font-semibold">{errors.duration.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Fare (₹)</label>
                  <input
                    type="number"
                    {...register('fare', { valueAsNumber: true })}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200"
                  />
                  {errors.fare && <p className="text-xs text-rose-500 font-semibold">{errors.fare.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-10 px-3 text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Route Configuration"
        description={`Are you sure you want to delete route "${selectedRoute?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteRoute}
        variant="danger"
        confirmText="Delete Route"
      />
    </PageContainer>
  );
}
