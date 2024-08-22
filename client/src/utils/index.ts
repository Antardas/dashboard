export const formatDate = (year: number, month?: number, day?: number): string => {
	if (month === undefined && day === undefined) {
		return year.toString();
	}

	if (day === undefined && month) {
		const date = new Date(year, month - 1);
		return date.toLocaleDateString('en-us', {
			month: 'short',
			year: 'numeric',
		});
	}
	if (day && month && year) {
		const date = new Date(year, month - 1, day);
		return date.toLocaleDateString('en-us', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	}
	return '';
};
