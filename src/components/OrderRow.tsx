'use client'

import { useState } from 'react';
import { deleteOrder, updateOrder } from '@/app/actions';
// Импортируем иконки
import { FileText, Edit, Trash2 } from 'lucide-react';

// Умный справочник кадровика РК
const ORDER_CATEGORIES: Record<string, string[]> = {
    'Қ - Кадровые': ['Прием на работу', 'Увольнение (расторжение ТД)', 'Перевод на другую должность', 'Изменение оклада', 'Совмещение должностей'],
    'ЖҚ - Личный состав': ['Ежегодный трудовой отпуск', 'Отпуск без сохранения з/п', 'Отпуск по беременности/уходу', 'Командировка', 'Премирование', 'Материальная помощь', 'Дисциплинарное взыскание'],
    'Ө - Производственные': ['Основная деятельность', 'Создание комиссии', 'Утверждение графиков/инструкций', 'Проведение инвентаризации', 'Возложение обязанностей']
};

export default function OrderRow({ order }: { order: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(false);
    // Добавили состояние, чтобы отслеживать, какой тип выбран при редактировании
    const [editMainType, setEditMainType] = useState(order.type || 'Қ - Кадровые');

    // Цвета для бейджиков
    const badgeColors: Record<string, string> = {
        'Қ - Кадровые': 'bg-blue-100 text-blue-800 border-blue-200',
        'Ө - Производственные': 'bg-purple-100 text-purple-800 border-purple-200',
        'ЖҚ - Личный состав': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    const badgeClass = badgeColors[order.type] || 'bg-gray-100 text-gray-800 border-gray-200';

    const handleDelete = async () => {
        if (!confirm(`Вы точно хотите безвозвратно удалить приказ № ${order.orderNumber}?`)) return;
        setIsDeleting(true);
        await deleteOrder(order.id, order.pdfUrl);
    };

    const handleEditSubmit = async (formData: FormData) => {
        if (loading) return;
        setLoading(true);
        await updateOrder(order.id, formData);
        setLoading(false);
        setIsEditing(false);
    };

    const inputStyles = "w-full border border-gray-300 p-2.5 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition";
    const cellStyles = "block md:table-cell px-4 py-3 md:px-6 md:py-4";
    const mobileLabel = "block md:hidden text-xs font-semibold text-gray-400 uppercase mb-1";

    return (
        <>
            {/* Основная строка (на мобильном превращается в карточку) */}
            <tr className={`bg-white border-b border-gray-100 hover:bg-blue-50/30 transition flex flex-col md:table-row mb-4 md:mb-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border md:border-b-0 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>

                {/* Ячейка 1: Номер и Дата */}
                <td className={cellStyles}>
                    <span className={mobileLabel}>№ и Дата</span>
                    <div className="flex items-center justify-between md:block">
                        <div className="font-bold text-gray-900 text-lg md:text-base">№ {order.orderNumber}</div>
                        <div className="text-sm text-gray-500 md:mt-1 flex items-center">
                            <span className="md:hidden mr-2">от</span> {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                </td>

                {/* Ячейка 2: Тип (Бейджик) + Категория */}
                <td className={cellStyles}>
                    <span className={mobileLabel}>Тип</span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${badgeClass} whitespace-nowrap inline-block mb-1`}>
                        {order.type}
                    </span>
                    {/* Выводим подтип (Категорию) приказа */}
                    {order.subType && (
                        <div className="text-xs text-gray-500 font-medium">{order.subType}</div>
                    )}
                </td>

                {/* Ячейка 3: Сотрудник и Описание */}
                <td className={`${cellStyles} md:w-5/12`}>
                    <span className={mobileLabel}>Сотрудник / Содержание</span>
                    <div className="font-semibold text-gray-800 text-base mb-1">{order.employeeName || '—'}</div>
                    <div className="text-sm text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-none">{order.description}</div>
                    {order.basis && (
                        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100 inline-block">
                            <span className="font-medium">Осн:</span> {order.basis}
                        </div>
                    )}
                </td>

                {/* Ячейка 4: ДЕЙСТВИЯ (ИКОНКИ) */}
                <td className={`${cellStyles} md:text-right border-t md:border-t-0 mt-2 md:mt-0 pt-4 md:pt-4 bg-gray-50 md:bg-transparent rounded-b-xl md:rounded-none`}>
                    <div className="flex md:justify-end items-center gap-2">
                        <a href={order.pdfUrl} target="_blank" className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-0 px-3 py-2 md:p-2 text-sm font-medium text-blue-600 bg-blue-50 md:bg-transparent rounded-lg hover:bg-blue-100 md:hover:bg-blue-50 transition group" title="Открыть PDF">
                            <FileText size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="md:hidden">Открыть</span>
                        </a>
                        <button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-0 px-3 py-2 md:p-2 text-sm font-medium text-gray-600 bg-gray-100 md:bg-transparent rounded-lg hover:bg-gray-200 md:hover:bg-gray-50 hover:text-orange-600 transition group" title="Редактировать">
                            <Edit size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="md:hidden">Изм.</span>
                        </button>
                        <button onClick={handleDelete} disabled={isDeleting} className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-0 px-3 py-2 md:p-2 text-sm font-medium text-red-600 bg-red-50 md:bg-transparent rounded-lg hover:bg-red-100 md:hover:bg-red-50 transition group" title="Удалить">
                            {isDeleting ? <span className="animate-pulse">...</span> : <Trash2 size={18} className="group-hover:scale-110 transition-transform" />}
                            <span className="md:hidden">Удалить</span>
                        </button>
                    </div>
                </td>
            </tr>

            {/* --- Панель редактирования --- */}
            {isEditing && (
                <tr className="md:table-row flex flex-col mb-4 shadow-lg md:shadow-inner rounded-xl overflow-hidden">
                    <td colSpan={4} className="p-0">
                        <div className="bg-orange-50/80 p-6 border-2 border-orange-200 rounded-xl md:rounded-none">
                            <div className="flex items-center gap-2 mb-4 text-orange-800 font-bold">
                                <Edit size={20} /> Редактирование приказа №{order.orderNumber}
                            </div>
                            <form action={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Номер</label>
                                    <input name="orderNumber" defaultValue={order.orderNumber} required placeholder="Номер" className={inputStyles} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Дата</label>
                                    <input name="orderDate" type="date" defaultValue={new Date(order.orderDate).toISOString().split('T')[0]} required className={inputStyles} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Индекс</label>
                                    <select name="type" value={editMainType} onChange={(e) => setEditMainType(e.target.value)} className={inputStyles}>
                                        {Object.keys(ORDER_CATEGORIES).map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>

                                {/* Динамический список Категорий (зависит от Индекса) */}
                                <div className="md:col-span-3">
                                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Категория</label>
                                    <select name="subType" defaultValue={order.subType} className={inputStyles}>
                                        {ORDER_CATEGORIES[editMainType]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-3"><label className="text-xs text-gray-500 ml-1 mb-1 block">Сотрудник</label><input name="employeeName" defaultValue={order.employeeName || ''} placeholder="ФИО сотрудника" className={inputStyles} /></div>
                                <div className="md:col-span-3">
                                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Содержание</label>
                                    <textarea name="description" defaultValue={order.description || ''} rows={2} placeholder="Краткое содержание" className={`${inputStyles} resize-y min-h-[60px]`} />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Основание</label>
                                    <textarea name="basis" defaultValue={order.basis || ''} rows={2} placeholder="Основание" className={`${inputStyles} resize-y min-h-[60px]`} />
                                </div>
                                <div className="md:col-span-3 flex justify-end gap-3 mt-2 pt-4 border-t border-orange-200/50">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">Отмена</button>
                                    <button type="submit" disabled={loading} className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-bold disabled:bg-orange-300 flex items-center gap-2 shadow-sm">
                                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}