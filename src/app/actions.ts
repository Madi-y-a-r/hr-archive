'use server'

import { createClient } from '@supabase/supabase-js'
import prisma from '../../lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// Подключаемся к Supabase с админскими правами для загрузки файла
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function addOrder(formData: FormData) {
    const file = formData.get('pdfFile') as File;
    const orderNumber = formData.get('orderNumber') as string;
    const orderDate = formData.get('orderDate') as string;
    const type = formData.get('type') as string;
    const subType = formData.get('subType') as string;
    const employeeName = formData.get('employeeName') as string;
    const description = formData.get('description') as string;
    const basis = formData.get('basis') as string;
  
    if (!file || !orderNumber || !orderDate || !type) {
      throw new Error('Заполните обязательные поля');
    }
  
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  
    const { error: uploadError } = await supabase.storage
      .from('orders')
      .upload(fileName, file);
  
    if (uploadError) throw new Error('Ошибка загрузки файла в хранилище');
  
    const { data: { publicUrl } } = supabase.storage
      .from('orders')
      .getPublicUrl(fileName);
  
    await prisma.order.create({
      data: {
        orderNumber,
        orderDate: new Date(orderDate),
        type,
        subType,
        employeeName,
        description,
        basis, // <--- Сохраняем в БД
        pdfUrl: publicUrl,
      }
    });
  
    revalidatePath('/');
  }

  // --- ФУНКЦИЯ УДАЛЕНИЯ ---
export async function deleteOrder(id: string, pdfUrl: string) {
    // 1. Вытаскиваем имя файла из ссылки
    const fileName = pdfUrl.split('/').pop();
    if (fileName) {
      // 2. Удаляем сам PDF из хранилища Supabase
      await supabase.storage.from('orders').remove([fileName]);
    }
    // 3. Удаляем запись из базы данных
    await prisma.order.delete({ where: { id } });
    revalidatePath('/'); // Обновляем страницу
  }
  
  // --- ФУНКЦИЯ РЕДАКТИРОВАНИЯ ---
  export async function updateOrder(id: string, formData: FormData) {
    const orderNumber = formData.get('orderNumber') as string;
    const orderDate = formData.get('orderDate') as string;
    const type = formData.get('type') as string;
    const subType = formData.get('subType') as string;
    const employeeName = formData.get('employeeName') as string;
    const description = formData.get('description') as string;
    const basis = formData.get('basis') as string;
  
    // Обновляем данные в базе (сам PDF-файл остается старым)
    await prisma.order.update({
      where: { id },
      data: { orderNumber, orderDate: new Date(orderDate), type, employeeName, description, basis }
    });
    revalidatePath('/');
  }

  export async function login(formData: FormData) {
    const password = formData.get('password');
    // В идеале пароль хранится в .env файле, но для старта зададим жесткий пароль
    const correctPassword = process.env.HR_PASSWORD || 'az2026';
  
    if (password === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set('hr-auth-token', 'authenticated', {
        httpOnly: true, // Защита от кражи куки через расширения браузера
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 60 * 60 * 24 * 7, // Пропуск действует 7 дней, чтобы кадровикам не вводить пароль каждый день
        path: '/',
      });
      redirect('/'); // Если пароль верный, пускаем на главную
    } else {
      throw new Error('Неверный пароль');
    }
  }
  
  export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('hr-auth-token'); // Забираем пропуск
    redirect('/login'); // Выкидываем на страницу входа
  }