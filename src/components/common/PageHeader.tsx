"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: Breadcrumb[];
  title: React.ReactNode;
  badge?: React.ReactNode;
  description?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, title, badge, description, rightContent }: PageHeaderProps) {
  const { t } = useLanguage();

  return (
    <section className="bg-white pt-2 pb-6 sm:pt-4 sm:pb-8 border-b border-slate-100 mb-6 sm:mb-8">
      <div className="w-full mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap">
            {t("common.home") || "Trang chủ"}
          </Link>
          
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={index} className="flex items-center gap-2">
                <span className="text-slate-300">/</span>
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="text-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-900 whitespace-nowrap">{crumb.label}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {title}
              {badge && (
                <span className="inline-flex items-center justify-center shrink-0 w-max self-start mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-black bg-slate-100 text-slate-700">
                  {badge}
                </span>
              )}
            </h1>
            {description && (
              <p className="text-slate-500 mt-4 sm:mt-4 text-[13px] sm:text-sm font-medium max-w-md leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {rightContent && (
            <div className="w-full md:w-auto">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
