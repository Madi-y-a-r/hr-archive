'use client'

import { useRef, useState } from 'react';
import { addOrder } from '@/app/actions';

export default function OrderForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false); // Состояние для лоадера ИИ
    const formRef = useRef<HTMLFormElement>(null);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition font-medium"
            >
                + Добавить приказ
            </button>
        );
    }

    // --- МАГИЯ ИИ: Функция, которая срабатывает при выборе файла ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Отправляем файл на наш скрытый API
            const res = await fetch('/api/parse-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Ошибка распознавания');

            const data = await res.json();

            // Автоматически заполняем поля формы (если ИИ их нашел)
            if (formRef.current) {
                const form = formRef.current;
                if (data.orderNumber) (form.elements.namedItem('orderNumber') as HTMLInputElement).value = data.orderNumber;
                if (data.orderDate) (form.elements.namedItem('orderDate') as HTMLInputElement).value = data.orderDate;
                if (data.type) (form.elements.namedItem('type') as HTMLSelectElement).value = data.type;
                if (data.employeeName) (form.elements.namedItem('employeeName') as HTMLInputElement).value = data.employeeName;
                if (data.description) (form.elements.namedItem('description') as HTMLInputElement).value = data.description;
                if (data.basis) (form.elements.namedItem('basis') as HTMLInputElement).value = data.basis;
            }
        } catch (error) {
            console.error(error);
            alert('ИИ не смог прочитать этот скан. Пожалуйста, заполните поля вручную.');
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
            alert('Произошла ошибка при загрузке. Проверьте консоль.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Загрузка нового приказа</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">✖</button>
            </div>

            <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Поле файла подняли наверх, чтобы с него начиналась магия */}
                <div className="md:col-span-2 mb-2 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-2">1. Загрузите отсканированный PDF-файл *</label>
                    <input
                        name="pdfFile"
                        type="file"
                        accept="application/pdf"
                        required
                        onChange={handleFileChange} // <--- Прицепили обработчик
                        className="w-full text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    {isParsing && <div className="mt-3 text-sm text-blue-600 font-medium flex items-center">✨ Нейросеть читает документ...</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Номер приказа *</label>
                    <input name="orderNumber" type="text" required placeholder="Например: 45-К" className={inputStyles} disabled={isParsing} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата подписания *</label>
                    <input name="orderDate" type="date" required className={inputStyles} disabled={isParsing} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Тип приказа *</label>
                    <select name="type" className={inputStyles} disabled={isParsing}>
                        <option value="Отпуск">Отпуск</option>
                        <option value="Прием на работу">Прием на работу</option>
                        <option value="Увольнение">Увольнение</option>
                        <option value="Командировка">Командировка</option>
                        <option value="Основная деятельность">Основная деятельность</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ФИО сотрудника</label>
                    <input name="employeeName" type="text" placeholder="Иванов И.И." className={inputStyles} disabled={isParsing} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Краткое содержание</label>
                    <input name="description" type="text" placeholder="О предоставлении ежегодного отпуска..." className={inputStyles} disabled={isParsing} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Основание</label>
                    <input name="basis" type="text" placeholder="Например: Личное заявление..." className={inputStyles} disabled={isParsing} />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Отмена</button>
                    <button type="submit" disabled={loading || isParsing} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-300 flex items-center">
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Сохраняем...
                            </>
                        ) : 'Сохранить в архив'}
                    </button>
                </div>
            </form>
        </div>
    );
}