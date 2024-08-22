import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import './App.css';
import 'chartjs-adapter-moment';
import { useEffect, useState } from 'react';
import { API_URL } from './CONSTANT';
import {
	CohortResponse,
	DailyData,
	MonthData,
	NewCustomerData,
	QuarterData,
	RepeatedCustomer,
	SalesGrowthData,
	YearData,
} from './types';
import { formatDate } from './utils';
import ChartJS from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import CustomerTableTwo from './Components/CustomerTable';
import GeoChart from './Components/GeoChart';
import type { ChartData as ChartDataType } from 'chart.js';
ChartJS.register(zoomPlugin);

type TimeFrame = 'daily' | 'monthly' | 'yearly' | 'quarterly';
type SalesData = DailyData[] | MonthData[] | YearData[] | QuarterData[];
type ChartData = {
	data: number[];
	labels: string[];
};
type StackChartData = {
	[key: string]: ChartData;
};
const labels = (data: SalesData | NewCustomerData[]) => {
	return data.map((item) => {
		if ('quarter' in item) {
			return item.quarter;
		} else if ('day' in item) {
			return formatDate(item.year, item.month, item.day);
		} else if ('month' in item) {
			return formatDate(item.year, item.month);
		} else if ('year' in item) {
			return formatDate(item.year);
		} else {
			throw new Error('Unexpected data type');
		}
	});
};
const getSalesData = (type: TimeFrame, data: SalesData) => {
	switch (type) {
		case 'daily':
			return {
				data: data.map((data) => data.totalSales),
				labels: labels(data),
			};
		case 'monthly':
			return {
				data: data.map((data) => data.totalSales),
				labels: labels(data),
			};
		case 'yearly':
			return {
				data: data.map((data) => data.totalSales),
				labels: labels(data),
			};
		case 'quarterly':
			return {
				data: data.map((data) => data.totalSales),
				labels: labels(data),
			};

		default:
			break;
	}
};
const getNewCustomerData = (data: NewCustomerData[]) => {
	return {
		data: data.map((data) => data.newCustomer),
		labels: labels(data),
	};
};
const getSalesGrowthData = (data: SalesGrowthData[]) => {
	return {
		data: data.map((data) => data.salesGrowthRate),
		labels: labels(data),
	};
};

const getCohortsData = (data: CohortResponse[]) => {
	const transformedData: StackChartData = {};
	data.forEach((i) => {
		if (!Object.keys(transformedData[i.cohort.year] ?? {}).length) {
			transformedData[i.cohort.year] = {
				data: [],
				labels: [],
			};
		}
		console.log(transformedData, 'data---------');
		transformedData[i.cohort.year].data.push(i.averageCLV.$numberDecimal);
		transformedData[i.cohort.year].labels.push(
			new Date(i.cohort.year, i.cohort.month).toLocaleDateString('en-us', { month: 'short' })
		);
	});

	return transformedData;
};
function App() {
	const [salesData, setSalesData] = useState<ChartData>();
	const [salesGrowth, setSalesGrowth] = useState<ChartData>();
	const [newCustomerData, setNewCustomerData] = useState<ChartData>();
	const [cohortData, setCohortData] = useState<StackChartData>({});
	const [repeatedCustomerChartData, setRepeatedCustomerChartData] = useState<ChartData>();
	const [repeatedCustomer, setRepeatedCustomer] = useState<RepeatedCustomer[]>([]);
	const [cohortChartConfig, setCohortChartConfig] =
		useState<ChartDataType<'line', (number | null)[], unknown>>();
	const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
	const [timeFrameNewCustomer, setTimeFrameNewCustomer] = useState<TimeFrame>('monthly');
	useEffect(() => {
		fetch(`${API_URL}/sales?timeframe=${timeFrame}`)
			.then((res) => res.json())
			.then((data) => {
				const chatData = getSalesData(timeFrame, data.data);
				setSalesData(chatData);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [timeFrame]);
	useEffect(() => {
		fetch(`${API_URL}/sales/growth`)
			.then((res) => res.json())
			.then((data) => {
				const chatData = getSalesGrowthData(data.data);
				setSalesGrowth(chatData);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);
	useEffect(() => {
		fetch(`${API_URL}/customers?timeframe=${timeFrameNewCustomer}`)
			.then((res) => res.json())
			.then((data) => {
				const chatData = getNewCustomerData(data.data);
				setNewCustomerData(chatData);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [timeFrameNewCustomer]);

	useEffect(() => {
		fetch(`${API_URL}/customers/lifetime-value`)
			.then((res) => res.json())
			.then((data) => {
				console.log(data.data);
				const chatData = getCohortsData(data.data);
				setCohortData(chatData);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		const configData: ChartDataType<'line', (number | null)[], unknown> = {
			labels: [],
			datasets: [],
		};
		Object.keys(cohortData).forEach((key, index) => {
			configData.labels = cohortData[key].labels;
			configData.datasets[index] = {
				data: [],
				label: '',
				fill: true,
			};
			configData.datasets[index].data = cohortData[key].data;
			configData.datasets[index].label = `Cohort-${key}`;
			console.log(configData, 'config data ---------------');
		});
		setCohortChartConfig(configData);
	}, [cohortData]);

	useEffect(() => {
		fetch(`${API_URL}/customers/repeats?limit=1000`)
			.then((res) => res.json())
			.then((data) => {
				setRepeatedCustomer(data.data);
				const chartData = {
					labels: data.data.map((order: RepeatedCustomer) =>
						formatDate(order.year, order.month, order.day)
					) as Array<string>,
					data: data.data.map(
						(order: RepeatedCustomer) => order.totalPurchase
					) as Array<number>,
				};
				setRepeatedCustomerChartData(chartData);
			});
	}, []);
	return (
		<>
			<div className="container">
				<div className="line-chart-container">
					<div className="line-chart">
						<select
							defaultValue={'monthly'}
							onChange={(e) => {
								setTimeFrame(e.target.value as TimeFrame);
							}}
						>
							<option value="daily"> Daily</option>
							<option value="monthly"> Monthly</option>
							<option value="yearly"> Yearly</option>
							<option value="quarterly">Quarterly</option>
						</select>
						{salesData && Object.keys(salesData).length ? (
							<Line
								data={{
									labels: salesData.labels,

									datasets: [
										{
											label: `${
												timeFrame.charAt(0).toUpperCase() +
												timeFrame.slice(1)
											}`,
											data: salesData.data,
										},
									],
								}}
								options={{
									plugins: {
										zoom: {
											pan: {
												enabled: false,
												mode: 'x',
											},
											zoom: {
												drag: {
													enabled: true,
												},
												wheel: {
													enabled: true,
												},
												mode: 'x',
											},
										},
									},
								}}
							/>
						) : null}
					</div>
					<div className="line-chart">
						{salesGrowth && Object.keys(salesGrowth).length ? (
							<Line
								data={{
									labels: salesGrowth.labels,

									datasets: [
										{
											label: `Sales Growth every month`,
											data: salesGrowth.data,
											fill: true,
											borderColor: 'blue',
											backgroundColor: 'pink',
										},
									],
								}}
								options={{
									plugins: {
										zoom: {
											pan: {
												enabled: false,
												mode: 'x',
											},
											zoom: {
												drag: {
													enabled: true,
												},
												wheel: {
													enabled: true,
												},
												mode: 'x',
											},
										},
									},
								}}
							/>
						) : null}
					</div>
					<div className="line-chart">
						<select
							defaultValue={'monthly'}
							onChange={(e) => {
								setTimeFrameNewCustomer(e.target.value as TimeFrame);
							}}
						>
							<option value="daily"> Daily</option>
							<option value="monthly"> Monthly</option>
							<option value="yearly"> Yearly</option>
						</select>
						{newCustomerData && Object.keys(newCustomerData).length ? (
							<Line
								data={{
									labels: newCustomerData.labels,

									datasets: [
										{
											label: `New Customer`,
											data: newCustomerData.data,
										},
									],
								}}
								options={{
									plugins: {
										zoom: {
											pan: {
												enabled: false,
												mode: 'x',
											},
											zoom: {
												drag: {
													enabled: true,
												},
												wheel: {
													enabled: true,
												},
												mode: 'x',
											},
										},
									},
								}}
							/>
						) : null}
					</div>

					<div className="line-chart">
						<select
							defaultValue={'monthly'}
							onChange={(e) => {
								setTimeFrameNewCustomer(e.target.value as TimeFrame);
							}}
						>
							<option value="daily"> Daily</option>
							<option value="monthly"> Monthly</option>
							<option value="yearly"> Yearly</option>
						</select>
						{cohortChartConfig && Object.keys(cohortChartConfig).length ? (
							<Line
								data={cohortChartConfig}
								options={{
									plugins: {
										zoom: {
											pan: {
												enabled: false,
												mode: 'x',
											},
											zoom: {
												drag: {
													enabled: true,
												},
												wheel: {
													enabled: true,
												},
												mode: 'x',
											},
										},
									},
								}}
							/>
						) : null}
					</div>
					<div className="line-chart">
						{repeatedCustomerChartData &&
						Object.keys(repeatedCustomerChartData).length ? (
							<Line
								data={{
									labels: repeatedCustomerChartData.labels,

									datasets: [
										{
											label: `Repeated Customer Purchase Data`,
											data: repeatedCustomerChartData.data,
										},
									],
								}}
								options={{
									plugins: {
										zoom: {
											pan: {
												enabled: false,
												mode: 'x',
											},
											zoom: {
												drag: {
													enabled: true,
												},
												wheel: {
													enabled: true,
												},
												mode: 'x',
											},
										},
										tooltip: {
											callbacks: {
												footer: (data) => {
													return `
													Email: ${repeatedCustomer[data[0].dataIndex]._id} \n
													Name: ${repeatedCustomer[data[0].dataIndex].customer.first_name}
													`;
												},
											},
										},
									},
								}}
							/>
						) : null}
					</div>
				</div>

				<div className="map-and-table-container">
					<div className="table">
						<h3>Customer with repeated order</h3>
						<CustomerTableTwo />
					</div>
					<div></div>
					<GeoChart />
				</div>
			</div>
		</>
	);
}

export default App;
