'use client';

import { useEffect, useState } from 'react';
import React from 'react';

// List of common timezones with user-friendly names
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Vancouver', label: 'Vancouver' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
];

interface TimezoneOffsetInfo {
  timezone: string;
  offset: number;
  label: string;
  name: string;
}

interface TimezoneSelectorProps {
  currentTimezone: string;
  onTimezoneChange: (timezone: string) => void;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ currentTimezone, onTimezoneChange }) => {
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [localTime, setLocalTime] = useState<string>('');
  const [showAllTimezones, setShowAllTimezones] = useState(false);
  const [timezoneList, setTimezoneList] = useState<TimezoneOffsetInfo[]>([]);
  
  // Get current time in the selected timezone
  useEffect(() => {
    const updateLocalTime = () => {
      const now = new Date();
      
      try {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: selectedTimezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        };
        
        const formatter = new Intl.DateTimeFormat('en-US', options);
        setLocalTime(formatter.format(now));
      } catch (e) {
        console.error('Error formatting time for timezone:', selectedTimezone, e);
        setLocalTime('Invalid timezone');
      }
    };
    
    // Update time immediately
    updateLocalTime();
    
    // Update time every second
    const interval = setInterval(updateLocalTime, 1000);
    
    return () => clearInterval(interval);
  }, [selectedTimezone]);
  
  // Generate a full list of timezones with offsets for the "All Timezones" view
  useEffect(() => {
    if (showAllTimezones) {
      const now = new Date();
      const timezones = Intl.supportedValuesOf('timeZone');
      
      // Get timezone information including offsets
      const timezoneInfoList = timezones.map(timezone => {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'long'
          });
          
          // Get the offset in minutes
          const offset = new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTimezoneOffset() * -1;
          
          // Format offset as +/-HH:MM
          const hours = Math.abs(Math.floor(offset / 60));
          const minutes = Math.abs(offset % 60);
          const offsetStr = `${offset >= 0 ? '+' : '-'}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          // Get the timezone name
          const name = formatter.formatToParts(now)
            .find(part => part.type === 'timeZoneName')?.value || timezone;
          
          return {
            timezone,
            offset,
            label: `(UTC${offsetStr}) ${timezone.replace(/_/g, ' ').replace(/\//g, ' / ')}`,
            name
          };
        } catch (_error) {
          // Handle any errors that might occur when formatting timezones
          return {
            timezone,
            offset: 0,
            label: timezone.replace(/_/g, ' ').replace(/\//g, ' / '),
            name: timezone
          };
        }
      });
      
      // Sort by offset then by name
      const sortedTimezones = timezoneInfoList.sort((a, b) => {
        if (a.offset !== b.offset) {
          return a.offset - b.offset;
        }
        return a.timezone.localeCompare(b.timezone);
      });
      
      setTimezoneList(sortedTimezones);
    }
  }, [showAllTimezones]);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setSelectedTimezone(newTimezone);
  };
  
  const handleSubmit = () => {
    onTimezoneChange(selectedTimezone);
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone:
        </label>
        
        <select
          value={selectedTimezone}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        >
          {!showAllTimezones ? (
            // Show common timezones first
            COMMON_TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.value})
              </option>
            ))
          ) : (
            // Show all timezones when requested
            timezoneList.map(tz => (
              <option key={tz.timezone} value={tz.timezone}>
                {tz.label}
              </option>
            ))
          )}
        </select>
      </div>
      
      <div className="mb-4">
        <div className="p-3 bg-gray-100 rounded-md text-sm">
          <p className="font-medium">Current time in selected timezone:</p>
          <p className="font-mono">{localTime}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAllTimezones(!showAllTimezones)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAllTimezones ? 'Show Common Timezones' : 'Show All Timezones'}
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0"
          disabled={selectedTimezone === currentTimezone}
        >
          Save Timezone
        </button>
      </div>
    </div>
  );
};

export default TimezoneSelector;