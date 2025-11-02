'use server';

import { getDb } from '@/db';
import { settings } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

type SettingsData = {
  [key: string]: any;
};

// Define a schema for the settings we expect to handle.
// This helps with validation and type safety.
const settingsSchema = z.object({
    'site_name': z.string().optional(),
    'site_url': z.string().url().or(z.literal('')).optional(),
    'payment_gateway_apikey': z.string().optional(),
    'smtp_host': z.string().optional(),
    'smtp_user': z.string().optional(),
    'smtp_pass': z.string().optional(),
});

type SettingsPayload = z.infer<typeof settingsSchema>;

export async function getSettings(keys: (keyof SettingsPayload)[]): Promise<SettingsData> {
  const db = getDb();
  if (!keys || keys.length === 0) {
    return {};
  }
  const result = await db.query.settings.findMany({
    where: inArray(settings.key, keys),
  });

  const settingsData: SettingsData = {};
  result.forEach(item => {
    // For security, never return password fields.
    if (item.key === 'smtp_pass') {
      settingsData[item.key] = item.value ? '••••••••' : '';
    } else {
      settingsData[item.key] = (item.value as any)?.value ?? '';
    }
  });

  return settingsData;
}


export async function updateSettings(payload: SettingsPayload): Promise<{success: boolean, message: string}> {
   const db = getDb();
   const validatedFields = settingsSchema.safeParse(payload);

    if (!validatedFields.success) {
        return { success: false, message: '输入数据无效。' };
    }

    const updates = Object.entries(validatedFields.data)
      .filter(([key, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({
        key: key,
        value: { value: value },
      }));

    if (updates.length === 0) {
        return { success: true, message: '没有需要更新的设置。' };
    }
    
    try {
        await db.transaction(async tx => {
            for (const update of updates) {
                 // Do not save an empty password, just skip it
                if (update.key === 'smtp_pass' && update.value.value === '') {
                    continue;
                }
                await tx.insert(settings)
                    .values(update)
                    .onConflictDoUpdate({ 
                        target: settings.key, 
                        set: { value: update.value }
                    });
            }
        });

        revalidatePath('/admin/settings');
        return { success: true, message: '设置已成功保存。' };

    } catch (error) {
        console.error('Failed to update settings:', error);
        return { success: false, message: '保存设置时发生数据库错误。' };
    }
}
