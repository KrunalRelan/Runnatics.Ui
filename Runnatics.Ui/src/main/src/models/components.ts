import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';

// StatCard Component
export interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    color?: string;
    growth?: string;
    onClick?: () => void;
}

// PageHeader Component
export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// DataTable Component
export interface TableColumn<T = any> {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    render?: (value: any, row: T) => ReactNode;
}

export interface DataTableProps<T = any> {
    columns: TableColumn<T>[];
    data: T[];
    pagination?: boolean;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    actions?: (row: T) => ReactNode;
}

// Card Component
export interface CardProps {
    children: ReactNode;
    title?: string;
    action?: ReactNode;
    sx?: SxProps<Theme>;
}

// EmptyState Component
export interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

// LoadingSpinner Component
export interface LoadingSpinnerProps {
    message?: string;
    size?: number;
}

// Metric Component
export interface MetricProps {
    label: string;
    value: string;
    trend?: string;
    trendColor?: string;
}

// LeftNavigation Component
export interface MenuItem {
    text: string;
    icon: ReactNode;
    path: string;
    submenu?: SubMenuItem[];
}

export interface SubMenuItem {
    text: string;
    icon: ReactNode;
    path: string;
}

export interface LeftNavigationProps {
    children: ReactNode;
}