'use client';
import React, { useState } from 'react';
import {
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

type OrdersTableProps = {
    initialOrders: Order[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(initialOrders.length / ITEMS_PER_PAGE);
  const currentOrders = initialOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>订单ID</TableHead>
          <TableHead>用户</TableHead>
          <TableHead>套餐</TableHead>
          <TableHead>金额</TableHead>
          <TableHead>日期</TableHead>
          <TableHead>状态</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>
              <div>{order.user_name}</div>
              <div className="text-sm text-muted-foreground">{order.user_email}</div>
            </TableCell>
            <TableCell>{order.plan_name}</TableCell>
            <TableCell>¥{order.amount}</TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell>
              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                {order.status === 'completed' ? '已完成' : (order.status === 'pending' ? '待处理' : '失败')}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>操作</DropdownMenuLabel>
                  <DropdownMenuItem>查看详情</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
     <CardFooter className="pt-6">
       <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
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
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </CardFooter>
    </>
  );
}
