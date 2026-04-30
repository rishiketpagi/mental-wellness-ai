/**
 * Date formatting utilities shared across the app.
 */

export const formatDate = (ts) => {
    if (!ts) return "";

    let date;

    if (typeof ts.toDate === "function") {
        date = ts.toDate();
    } else {
        date = new Date(ts);
    }

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
};

export const formatDateFull = (ts) => {
    if (!ts) return "";

    let date;

    if (typeof ts.toDate === "function") {
        date = ts.toDate();
    } else {
        date = new Date(ts);
    }

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};