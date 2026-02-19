'use client'

import { useRef, useState, useEffect } from 'react';
import { addOrder } from '@/app/actions';
import { X, Plus } from 'lucide-react';

// Умный справочник кадровика РК
const ORDER_CATEGORIES: Record<string, string[]> = {
    'Қ - Кадровые': ['Прием на работу', 'Увольнение (расторжение ТД)', 'Перевод на другую должность', 'Изменение оклада', 'Совмещение должностей'],
    'ЖҚ - Личный состав': ['Ежегодный трудовой отпуск', 'Отпуск без сохранения з/п', 'Отпуск по беременности/уходу', 'Командировка', 'Премирование', 'Материальная помощь', 'Дисциплинарное взыскание'],
    'Ө - Производственные': ['Основная деятельность', 'Создание комиссии', 'Утверждение графиков/инструкций', 'Проведение инвентаризации', 'Возложение обязанностей']
};

export default function OrderForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [mainType, setMainType] = useState('Қ - Кадровые'); // Состояние для главного типа
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition font-medium flex items-center gap-2">
                <Plus size={18} /> <span className="hidden sm:inline">Добавить приказ</span>
            </button>
        );
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Ошибка распознавания');
            const data = await res.json();

            if (formRef.current) {
                const form = formRef.current;
                if (data.orderNumber) (form.elements.namedItem('orderNumber') as HTMLInputElement).value = data.orderNumber;
                if (data.orderDate) (form.elements.namedItem('orderDate') as HTMLInputElement).value = data.orderDate;
                if (data.description) (form.elements.namedItem('description') as HTMLTextAreaElement).value = data.description;
                if (data.employeeName) (form.elements.namedItem('employeeName') as HTMLInputElement).value = data.employeeName;
                if (data.basis) (form.elements.namedItem('basis') as HTMLTextAreaElement).value = data.basis;

                // Умное заполнение выпадающих списков
                if (data.type) {
                    setMainType(data.type); // Меняем состояние, чтобы React перерисовал второй список
                    (form.elements.namedItem('type') as HTMLSelectElement).value = data.type;

                    // Даем React миллисекунду на перерисовку категорий, затем ставим subType
                    setTimeout(() => {
                        if (data.subType && form.elements.namedItem('subType')) {
                            (form.elements.namedItem('subType') as HTMLSelectElement).value = data.subType;
                        }
                    }, 50);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        if (loading) return;
        setLoading(true);
        try {
            await addOrder(formData);
            formRef.current?.reset();
            setIsOpen(false);
        } catch (e) {
            alert('Ошибка при сохранении!');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Загрузка нового приказа</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 mb-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <label className="block text-sm font-semibold text-blue-900 mb-2">1. Загрузите скан PDF *</label>
                            <input name="pdfFile" type="file" accept="application/pdf" required onChange={handleFileChange} className="w-full text-gray-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                            {isParsing && <div className="mt-3 text-sm text-blue-600 font-medium animate-pulse">✨ Читаю документ...</div>}
                        </div>

                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Номер *</label><input name="orderNumber" type="text" required placeholder="Напр: 45-Қ" className={inputStyles} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label><input name="orderDate" type="date" required className={inputStyles} /></div>

                        {/* ДИНАМИЧЕСКИЕ СПИСКИ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Индекс (Тип) *</label>
                            <select name="type" className={inputStyles} value={mainType} onChange={(e) => setMainType(e.target.value)}>
                                {Object.keys(ORDER_CATEGORIES).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
                            <select name="subType" className={inputStyles}>
                                {ORDER_CATEGORIES[mainType].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>

                        <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">ФИО сотрудника (если есть)</label><input name="employeeName" type="text" placeholder="Иванов И.И." className={inputStyles} /></div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Краткое содержание</label>
                            <textarea name="description" rows={2} placeholder="О приеме на работу..." disabled={isParsing} className={`${inputStyles} resize-y min-h-[60px]`} />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Основание</label>
                            <textarea name="basis" rows={2} placeholder="Напр: Заявление Иванова И.И." disabled={isParsing} className={`${inputStyles} resize-y min-h-[60px]`} />
                        </div>
                        <div className="sm:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium">Отмена</button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400">
                                {loading ? 'Сохраняем...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}