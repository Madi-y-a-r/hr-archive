import prisma from "../../lib/prisma";
import OrderForm from "@/components/OrderForm";
import Search from "@/components/Search";
import OrderRow from "@/components/OrderRow";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; // <-- Указали, что это Promise (Требование Next.js 15)
}) {
  // Распаковываем параметры поиска
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';

  // Просим Prisma найти приказы
  const orders = await prisma.order.findMany({
    where: query ? {
      OR: [
        { orderNumber: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
        { employeeName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { basis: { contains: query, mode: 'insensitive' } },
      ]
    } : {},
    orderBy: { createdAt: 'desc' }
  });
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Шапка */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Электронный архив приказов</h1>
          <OrderForm />
        </div>

        {/* Наш новый рабочий компонент поиска */}
        <Search />

        {/* Таблица результатов */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-medium border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">№ и Дата</th>
                <th className="py-4 px-6">Тип приказа</th>
                <th className="py-4 px-6">Сотрудник / Содержание</th>
                <th className="py-4 px-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    {query ? 'По вашему запросу ничего не найдено.' : 'База приказов пока пуста. Загрузите первый документ!'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}