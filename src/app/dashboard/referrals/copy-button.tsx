'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export function CopyButton({ textToCopy }: { textToCopy: string }) {
    const { toast } = useToast();
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(textToCopy);
        toast({
        title: '已复制',
        description: '推广链接已成功复制到剪贴板。',
        });
    };

    return (
        <Button type="button" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
        </Button>
    )
}
