// src/utils/dateUtils.js
import { format, formatDistance, formatRelative, parseISO, isValid, isBefore, isAfter, differenceInDays } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatString - The format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';

        return format(dateObj, formatString);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format a date with time
 * @param {string|Date} date - The date to format
 * @param {boolean} includeSeconds - Whether to include seconds
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date, includeSeconds = false) => {
    const formatString = includeSeconds ? 'MMM d, yyyy HH:mm:ss' : 'MMM d, yyyy HH:mm';
    return formatDate(date, formatString);
};

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - The date to format
 * @param {Date} baseDate - The date to compare against (default: now)
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, baseDate = new Date()) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';

        return formatDistance(dateObj, baseDate, { addSuffix: true });
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return '';
    }
};

/**
 * Format a date as relative with fallback to absolute date
 * @param {string|Date} date - The date to format
 * @returns {string} Relative or absolute date string
 */
export const formatRelativeDate = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';

        return formatRelative(dateObj, new Date());
    } catch (error) {
        console.error('Error formatting relative date:', error);
        return '';
    }
};

/**
 * Get time since a date in a specific unit
 * @param {string|Date} date - The start date
 * @param {string} unit - The unit ('days', 'months', 'years')
 * @returns {number} Time difference in the specified unit
 */
export const getTimeSince = (date, unit = 'days') => {
    if (!date) return 0;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return 0;

        const now = new Date();

        switch (unit) {
            case 'days':
                return differenceInDays(now, dateObj);
            case 'months':
                return Math.floor(differenceInDays(now, dateObj) / 30);
            case 'years':
                return Math.floor(differenceInDays(now, dateObj) / 365);
            default:
                return differenceInDays(now, dateObj);
        }
    } catch (error) {
        console.error('Error calculating time since:', error);
        return 0;
    }
};

/**
 * Format duration in days to a human-readable string
 * @param {number} days - Number of days
 * @returns {string} Formatted duration
 */
export const formatDuration = (days) => {
    if (!days || days < 0) return '0 days';

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    const parts = [];

    if (years > 0) {
        parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }

    if (months > 0) {
        parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    }

    if (remainingDays > 0 || parts.length === 0) {
        parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);
    }

    return parts.join(', ');
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPast = (date) => {
    if (!date) return false;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isValid(dateObj) && isBefore(dateObj, new Date());
    } catch (error) {
        console.error('Error checking if date is past:', error);
        return false;
    }
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isFuture = (date) => {
    if (!date) return false;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isValid(dateObj) && isAfter(dateObj, new Date());
    } catch (error) {
        console.error('Error checking if date is future:', error);
        return false;
    }
};

/**
 * Format a date range
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '';

    const start = formatDate(startDate);

    if (!endDate) {
        return `${start} - Present`;
    }

    const end = formatDate(endDate);

    // If same date, just show once
    if (start === end) {
        return start;
    }

    return `${start} - ${end}`;
};

/**
 * Get a human-readable time of day
 * @param {string|Date} date - The date to format
 * @returns {string} Time of day (e.g., "Morning", "Afternoon")
 */
export const getTimeOfDay = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';

        const hours = dateObj.getHours();

        if (hours < 6) return 'Night';
        if (hours < 12) return 'Morning';
        if (hours < 17) return 'Afternoon';
        if (hours < 21) return 'Evening';
        return 'Night';
    } catch (error) {
        console.error('Error getting time of day:', error);
        return '';
    }
};

/**
 * Format military time
 * @param {string|Date} date - The date to format
 * @returns {string} Military time (e.g., "1430")
 */
export const formatMilitaryTime = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return '';

        return format(dateObj, 'HHmm');
    } catch (error) {
        console.error('Error formatting military time:', error);
        return '';
    }
};

/**
 * Calculate age from a birth date
 * @param {string|Date} birthDate - The birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return 0;

    try {
        const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
        if (!isValid(dateObj)) return 0;

        const today = new Date();
        let age = today.getFullYear() - dateObj.getFullYear();
        const monthDiff = today.getMonth() - dateObj.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
            age--;
        }

        return age;
    } catch (error) {
        console.error('Error calculating age:', error);
        return 0;
    }
};

/**
 * Get days until a future date
 * @param {string|Date} date - The future date
 * @returns {number} Days until the date (negative if past)
 */
export const getDaysUntil = (date) => {
    if (!date) return 0;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return 0;

        return differenceInDays(dateObj, new Date());
    } catch (error) {
        console.error('Error calculating days until:', error);
        return 0;
    }
};

/**
 * Format a date for API submission
 * @param {Date} date - The date to format
 * @returns {string} ISO string format
 */
export const formatForAPI = (date) => {
    if (!date || !isValid(date)) return null;

    return date.toISOString();
};

/**
 * Get start and end of a period
 * @param {string} period - The period ('day', 'week', 'month', 'year')
 * @param {Date} date - The reference date (default: now)
 * @returns {Object} Object with start and end dates
 */
export const getPeriodBounds = (period = 'month', date = new Date()) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (period) {
        case 'day':
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'week':
            const day = start.getDay();
            const diff = start.getDate() - day;
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);
            end.setDate(diff + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case 'month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(end.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'year':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31);
            end.setHours(23, 59, 59, 999);
            break;
    }

    return { start, end };
};