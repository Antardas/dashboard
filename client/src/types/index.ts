export interface DailyData {
	totalSales: number;
	count: number;
	year: number;
	month: number;
	day: number;
}

export interface MonthData {
	totalSales: number;
	count: number;
	year: number;
	month: number;
}
export interface YearData {
	totalSales: number;
	count: number;
	year: number;
}

export interface QuarterData {
	totalSales: number;
	quarter: string;
}
export interface SalesGrowthData {
	totalSales: number;
	count: number;
	year: number;
	month: number;
	previousTotalSales: number;
	salesGrowthRate: number;
}
export interface NewCustomerData {
	count: number;
	year: number;
	month: number;
	newCustomer: number;
}

export interface RepeatedCustomer {
	_id: string;
	customer: {
		id: number;
		email: string;
		first_name: string;
		last_name: string;
	};
	totalPurchase: number;
	day: number;
	year: number;
	month: number;
}

export interface MapLocations {
	city: string;
	count: number;
	lat: number;
	lon: number;
}

export interface CohortResponse {
	cohort: {
		year: number;
		month: number;
	};
	averageCLV: {
		$numberDecimal: number;
	};
}
export interface CohortData {
	[key: string]: CohortResponse[];
}
