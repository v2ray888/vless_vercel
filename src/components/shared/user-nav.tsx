'use client';

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

export function UserNav() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/auth/login">登录</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">注册</Link>
        </Button>
      </div>
    );
  }

  const fallbackInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const isAdmin = user?.isAdmin;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={user?.name ?? 'User'} />
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <Icons.dashboard className="mr-2 h-4 w-4" />
              <span>仪表板</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Icons.user className="mr-2 h-4 w-4" />
              <span>个人设置</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">
                <Icons.settings className="mr-2 h-4 w-4" />
                <span>后台管理</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <Icons.logout className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}