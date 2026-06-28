import { cn } from "@/lib/utils";

type Status = "pending" | "in-progress" | "resolved";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-status-pending-bg text-status-pending border-status-pending/20",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-status-progress-bg text-status-progress border-status-progress/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-status-resolved-bg text-status-resolved border-status-resolved/20",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};