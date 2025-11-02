'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createManualCodeAction, createBulkCodesAction } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

type PlanForForm = {
  id: string;
  name: string;
}

const manualFormSchema = z.object({
  planId: z.string({ required_error: '请选择一个套餐。' }),
  code: z
    .string()
    .min(4, '兑换码至少4位')
    .max(50, '兑换码最多50位')
    .refine((s) => !s.includes(' '), '兑换码不能包含空格'),
});

const bulkFormSchema = z.object({
  planId: z.string({ required_error: '请选择一个套餐。' }),
  quantity: z.coerce
    .number({invalid_type_error: '请输入有效数字'})
    .int('数量必须是整数')
    .min(1, '数量至少为1')
    .max(100, '一次最多生成100个'),
});


interface GenerateCodeFormProps {
  plans: PlanForForm[];
}

export function GenerateCodeForm({ plans }: GenerateCodeFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
        code: '',
        planId: '',
    }
  });

  const bulkForm = useForm<z.infer<typeof bulkFormSchema>>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
        quantity: 10,
        planId: '',
    }
  });

  // This function is a bit of a workaround to ensure the table on the main page re-fetches data.
  const onFormSubmit = () => {
    router.refresh();
  };

  function onManualSubmit(values: z.infer<typeof manualFormSchema>) {
    setGeneratedCodes([]);
    startTransition(async () => {
      const result = await createManualCodeAction(values);
      toast({
        title: result.success ? '创建成功' : '错误',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      if (result.success) {
        manualForm.reset({ code: '', planId: values.planId });
        onFormSubmit();
      }
    });
  }

  function onBulkSubmit(values: z.infer<typeof bulkFormSchema>) {
    setGeneratedCodes([]);
    startTransition(async () => {
        const result = await createBulkCodesAction(values);
        toast({
            title: result.success ? '生成成功' : '错误',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
        if (result.success && result.codes) {
            setGeneratedCodes(result.codes);
            onFormSubmit();
        }
    });
  }

  const handleCopyAll = () => {
    if (!navigator.clipboard) {
         toast({
            title: '复制失败',
            description: '您的浏览器不支持剪贴板API。',
            variant: 'destructive'
        });
        return;
    }
    const textToCopy = generatedCodes.join('\n');
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: '已复制',
      description: `${generatedCodes.length} 个兑换码已复制到剪贴板。`,
    });
  };

  const handleExport = () => {
    const textToExport = generatedCodes.join('\n');
    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'redemption_codes.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: '导出成功',
      description: '兑换码已开始下载。',
    });
  };

  return (
     <Tabs defaultValue="manual" className="w-full" onValueChange={() => { setGeneratedCodes([]); manualForm.reset(); bulkForm.reset({ quantity: 10 }); }}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">手动创建</TabsTrigger>
        <TabsTrigger value="bulk">批量生成</TabsTrigger>
      </TabsList>
      <TabsContent value="manual">
        <Form {...manualForm}>
          <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-6 pt-4">
            <FormField
              control={manualForm.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>关联套餐</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择一个套餐" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={manualForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自定义兑换码</FormLabel>
                  <FormControl>
                    <Input placeholder="MANUALCODE2024" {...field} />
                  </FormControl>
                  <FormDescription>输入一个唯一的兑换码。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? '正在创建...' : '立即创建'}
            </Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="bulk">
        <Form {...bulkForm}>
          <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6 pt-4">
             <FormField
              control={bulkForm.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>关联套餐</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择一个套餐" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={bulkForm.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>生成数量</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="例如: 50" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>单次最多可生成100个兑换码。</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? '正在生成...' : '立即生成'}
            </Button>
          </form>
        </Form>
         {generatedCodes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">已生成的兑换码 ({generatedCodes.length} 个):</h4>
            <ScrollArea className="h-40 w-full rounded-md border p-4 font-mono text-sm">
                {generatedCodes.join('\n')}
            </ScrollArea>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <Copy className="mr-2 h-4 w-4" />
                复制全部
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                导出为 .txt
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
