import prisma from "../../lib/prisma";
import OrderForm from "@/components/OrderForm";
import Search from "@/components/Search";
import OrderRow from "@/components/OrderRow";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';

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
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

      {/* --- КОРПОРАТИВНАЯ ШАПКА --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner">
              АЗ
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 leading-tight">Астана-Зеленстрой</h1>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Электронный архив</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <OrderForm />
            <form action={async () => {
              'use server';
              const { logout } = await import('@/app/actions');
              await logout();
            }}>
              <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-600 transition bg-red-100 hover:bg-red-50 px-4 py-3 rounded-lg">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Search />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-gray-50 text-gray-500 uppercase text-xs tracking-wider font-semibold border-b border-gray-100">
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
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    {query ? 'По вашему запросу ничего не найдено.' : 'База приказов пока пуста.'}
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
      </main>

    </div>
  );
}