'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function Search() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        // Обновляем URL без перезагрузки страницы
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Умный поиск по базе</label>
            <input
                type="text"
                defaultValue={searchParams.get('q')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-400"
                placeholder="Введите номер, фамилию, тип или фрагмент содержания..."
            />
        </div>
    );
}