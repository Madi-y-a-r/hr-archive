import prisma from "../../lib/prisma";
import OrderForm from "@/components/OrderForm";
import Search from "@/components/Search";

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
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <th className="py-4 px-6 font-semibold">№ и Дата</th>
                <th className="py-4 px-6 font-semibold">Тип приказа</th>
                <th className="py-4 px-6 font-semibold">Сотрудник / Содержание</th>
                <th className="py-4 px-6 font-semibold text-center">Действия</th>
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
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-blue-50/50 transition">
                    <td className="py-4 px-6 font-medium">
                      № {order.orderNumber}<br />
                      <span className="text-xs text-gray-400">{order.orderDate.toLocaleDateString('ru-RU')}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                        {order.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      {order.employeeName || '—'}<br />
                      <span className="font-normal text-xs text-gray-500">{order.description}</span>
                      {order.basis && (
                        <div className="text-xs text-gray-400 mt-1 italic">
                          Основание: {order.basis}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <a href={order.pdfUrl} target="_blank" className="text-blue-600 hover:text-blue-800 font-medium mr-4">
                        Открыть PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}