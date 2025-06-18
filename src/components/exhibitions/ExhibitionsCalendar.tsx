'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Exhibition {
  id: string
  title: string
  start_date: string
  end_date: string
}

interface ExhibitionsCalendarProps {
  exhibitions: Exhibition[]
  selectedDate: Date | null
  onDateSelect: (date: Date | null) => void
}

export function ExhibitionsCalendar({ exhibitions, selectedDate, onDateSelect }: ExhibitionsCalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const hasExhibition = (date: Date) => {
    return exhibitions.some(exhibition => {
      const start = new Date(exhibition.start_date)
      const end = new Date(exhibition.end_date)
      return date >= start && date <= end
    })
  }

  const getExhibitionCount = (date: Date) => {
    return exhibitions.filter(exhibition => {
      const start = new Date(exhibition.start_date)
      const end = new Date(exhibition.end_date)
      return date >= start && date <= end
    }).length
  }

  const isSelectedDate = (date: Date) => {
    return selectedDate && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const selectDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (hasExhibition(date)) {
      onDateSelect(isSelectedDate(date) ? null : date)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            →
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* 빈 칸 채우기 */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        
        {/* 날짜 */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const hasExh = hasExhibition(date)
          const exhibitionCount = getExhibitionCount(date)
          const isSelected = isSelectedDate(date)
          const isToday = date.toDateString() === today.toDateString()
          
          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              disabled={!hasExh}
              className={`
                p-2 text-sm rounded transition-colors relative min-h-[36px]
                ${hasExh ? 'cursor-pointer hover:bg-blue-50' : 'cursor-not-allowed text-gray-300'}
                ${isSelected ? 'bg-blue-500 text-white' : ''}
                ${isToday && !isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span>{day}</span>

              </div>
            </button>
          )
        })}
      </div>
      

      
      {/* 범례 */}
      <div className="mt-4 pt-3 border-t">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>전시 진행일</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-100 rounded-full"></div>
            <span>오늘</span>
          </div>
        </div>
      </div>
    </Card>
  )
}