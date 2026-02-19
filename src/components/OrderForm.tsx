'use client'

import { useRef, useState } from 'react';
import { addOrder } from '@/app/actions';

export default function OrderForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await addOrder(formData);
            formRef.current?.reset();
            setIsOpen(false); // Закрываем форму при успехе
        } catch (e) {
            alert('Произошла ошибка при загрузке. Проверьте консоль.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Вынесли стили в переменную: задаем белый фон, темно-серый текст и синюю рамку при фокусе
    const inputStyles = "w-full border border-gray-300 p-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Загрузка нового приказа</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">✖</button>
            </div>

            <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Номер приказа *</label>
                    <input name="orderNumber" type="text" required placeholder="Например: 45-К" className={inputStyles} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата подписания *</label>
                    <input name="orderDate" type="date" required className={inputStyles} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Тип приказа *</label>
                    <select name="type" className={inputStyles}>
                        <option value="Отпуск">Отпуск</option>
                        <option value="Прием на работу">Прием на работу</option>
                        <option value="Увольнение">Увольнение</option>
                        <option value="Командировка">Командировка</option>
                        <option value="Основная деятельность">Основная деятельность</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ФИО сотрудника</label>
                    <input name="employeeName" type="text" placeholder="Иванов И.И." className={inputStyles} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Краткое содержание</label>
                    <input name="description" type="text" placeholder="О предоставлении ежегодного отпуска..." className={inputStyles} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Основание</label>
                    <input name="basis" type="text" placeholder="Например: Личное заявление, Служебная записка..." className={inputStyles} />
                </div>
                <div className="md:col-span-2 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Файл приказа (только PDF) *</label>
                    <input name="pdfFile" type="file" accept="application/pdf" required className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Отмена</button>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-300 flex items-center">
                        {loading ? 'Загрузка...' : 'Сохранить в архив'}
                    </button>
                </div>
            </form>
        </div>
    );
}