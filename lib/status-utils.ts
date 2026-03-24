const STATUS_COLOR_MAP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  assigned: 'bg-blue-100 text-blue-700 border-blue-300',
  available: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-300',
  completed: 'bg-violet-100 text-violet-700 border-violet-300',
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  failed: 'bg-red-100 text-red-700 border-red-300',
  in_progress: 'bg-sky-100 text-sky-700 border-sky-300',
  inactive: 'bg-slate-100 text-slate-700 border-slate-300',
  needs_rework: 'bg-rose-100 text-rose-700 border-rose-300',
  pending: 'bg-amber-100 text-amber-700 border-amber-300',
  pending_admin_review: 'bg-orange-100 text-orange-700 border-orange-300',
  processing: 'bg-blue-100 text-blue-700 border-blue-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
  review: 'bg-amber-100 text-amber-700 border-amber-300',
  submitted: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  under_review: 'bg-sky-100 text-sky-700 border-sky-300',
};

export function getStatusColor(status: string): string {
  return STATUS_COLOR_MAP[status] ?? 'bg-slate-100 text-slate-700 border-slate-300';
}
