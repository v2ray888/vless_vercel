'use client';
import React, { useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { RedemptionCode } from '@/lib/types';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { CardFooter } from '@/components/ui/card';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type RedemptionCodesTableProps = {
  initialCodes: RedemptionCode[];
  totalCount: number;
  itemsPerPage: number;
};

export function RedemptionCodesTable({
  initialCodes,
  totalCount,
  itemsPerPage,
}: RedemptionCodesTableProps) {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };
  
  // Don't render pagination if there's only one page
  const showPagination = totalPages > 1;

  return (
    <>
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className={`transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>兑换码</TableHead>
                <TableHead>套餐</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建日期</TableHead>
                <TableHead>使用者</TableHead>
                <TableHead>使用日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialCodes.length > 0 ? (
                initialCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>{code.plan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          code.status === 'available' ? 'secondary' : 'default'
                        }
                      >
                        {code.status === 'available' ? '可用' : '已使用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{code.created_at}</TableCell>
                    <TableCell>{code.used_by || '-'}</TableCell>
                    <TableCell>{code.used_at || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        暂无兑换码
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {showPagination && (
        <CardFooter className="pt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => handlePageChange(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </>
  );
}
