var get_date_offset = function(date) {
    var offset = -date.getTimezoneOffset();
    return (offset !== null ? offset : 0);
};

var get_date = function(year, month, date) {
    var d = new Date();
    if (year !== undefined) {
        d.setFullYear(year);
    }
    d.setMonth(month);
    d.setDate(date);
    return d;
};

module.exports = function() {
    var january_offset = get_date_offset(get_date(year, 0, 2)),
        june_offset = get_date_offset(get_date(year, 5, 2)),
        diff = january_offset - june_offset;

    if (diff < 0) {
        return january_offset + ",1";
    } else if (diff > 0) {
        return june_offset + ",1," + HEMISPHERE_SOUTH;
    }

    return january_offset + ",0";
};
