import { cn } from "@/lib/utils";

type Priority = "Low" | "Medium" | "High" | "Critical";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  Low: {
    label: "Low",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "🔵"
  },
  Medium: {
    label: "Medium", 
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "🟡"
  },
  High: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "🟠"
  },
  Critical: {
    label: "EMERGENCY",
    className: "bg-red-100 text-red-700 border-red-200 animate-pulse",
    icon: "🚨"
  }
};

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};