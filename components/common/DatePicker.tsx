
import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

// Helper to format date to YYYY-MM-DD
const toYyyyMmDd = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to format date to DD/MM/YYYY for display
const toDdMmYyyy = (isoDate: string): string => {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
};

// Helper to parse YYYY-MM-DD string into a local Date object
const parseYyyyMmDd = (isoDate: string): Date => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
};


interface DatePickerProps {
    id: string;
    label: string;
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void; // YYYY-MM-DD
    required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ id, label, value, onChange, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? parseYyyyMmDd(value) : new Date());
    const datePickerRef = useRef<HTMLDivElement>(null);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleToggle = () => setIsOpen(!isOpen);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(toYyyyMmDd(selected));
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Sync view date with value prop
    useEffect(() => {
        setViewDate(value ? parseYyyyMmDd(value) : new Date());
    }, [value]);

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDayOfMonth).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const selectedDate = value ? parseYyyyMmDd(value) : null;
        const today = new Date();

        return (
            <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 z-20">
                <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700">
                        <ChevronLeftIcon className="h-5 w-5 text-slate-300" />
                    </button>
                    <div className="font-semibold text-white">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700">
                        <ChevronRightIcon className="h-5 w-5 text-slate-300" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                    {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map(day => {
                        const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                        
                        let classes = "w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors text-sm ";
                        if (isSelected) {
                            classes += "bg-blue-600 text-white font-bold";
                        } else if (isToday) {
                            classes += "bg-slate-700 text-white";
                        } else {
                            classes += "text-slate-200 hover:bg-slate-700";
                        }

                        return (
                            <div key={day} onClick={() => handleDayClick(day)} className={classes}>
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full" ref={datePickerRef}>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    id={id}
                    type="text"
                    value={toDdMmYyyy(value)}
                    onClick={handleToggle}
                    readOnly
                    placeholder="dd/mm/yyyy"
                    required={required}
                    className="w-full pl-11 pr-4 !bg-slate-800 !border-slate-700 !text-white !placeholder-slate-400 !py-3 !rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                />
            </div>
            {isOpen && renderCalendar()}
        </div>
    );
};

export default DatePicker;
