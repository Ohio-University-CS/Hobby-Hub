export function getDayFromCreatedAt(createdAt: Date) {
    const date = new Date(createdAt);
    const day = date.toLocaleDateString(navigator.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return day;
};