import { Request, Response } from 'express';
import catchAsyncError from '../shared/global/helpers/catch-async-error';
import mongoose from 'mongoose';
const dashboardController = {
	getSales: catchAsyncError(async (req: Request, res: Response) => {
		console.time('tookTime');
		const timeframe = req.query?.timeframe ?? 'monthly';

		let aggregationPipeline = [];

		switch (timeframe) {
			case 'daily':
				aggregationPipeline = [
					{
						$addFields: {
							created_at_date: {
								$dateFromString: { dateString: '$created_at' },
							},
						},
					},
					{
						$group: {
							_id: '$created_at_date',
							totalSales: {
								$sum: {
									$toDouble: '$total_price_set.shop_money.amount',
								},
							},
							count: { $sum: 1 },
						},
					},
					{
						$sort: { _id: 1 },
					},
					{
						$project: {
							year: { $year: '$_id' },
							month: { $month: '$_id' },
							day: { $dayOfMonth: '$_id' },
							totalSales: 1,
							count: 1,
							_id: 0,
						},
					},
				];
				break;

			case 'monthly':
				aggregationPipeline = [
					{
						$addFields: {
							created_at_date: {
								$dateFromString: { dateString: '$created_at' },
							},
						},
					},
					{
						$group: {
							_id: {
								$dateTrunc: {
									date: '$created_at_date',
									unit: 'month',
								},
							},
							totalSales: {
								$sum: {
									$toDouble: '$total_price_set.shop_money.amount',
								},
							},
							count: { $sum: 1 },
						},
					},
					{
						$sort: { _id: 1 },
					},
					{
						$project: {
							year: { $year: '$_id' },
							month: { $month: '$_id' },
							totalSales: 1,
							count: 1,
							_id: 0,
						},
					},
				];
				break;

			case 'quarterly':
				aggregationPipeline = [
					{
						$addFields: {
							created_at_date: {
								$dateFromString: { dateString: '$created_at' },
							},
						},
					},
					{
						$group: {
							_id: {
								$dateTrunc: {
									date: '$created_at_date',
									unit: 'quarter',
								},
							},
							totalSales: {
								$sum: {
									$toDouble: '$total_price_set.shop_money.amount',
								},
							},
							count: { $sum: 1 },
						},
					},
					{
						$sort: { _id: 1 },
					},
					{
						$project: {
							quarter: {
								$concat: [
									{ $toString: { $year: '$_id' } },
									'-',
									{
										$switch: {
											branches: [
												{
													case: { $lte: [{ $month: '$_id' }, 3] },
													then: 'first',
												},
												{
													case: { $lte: [{ $month: '$_id' }, 6] },
													then: 'second',
												},
												{
													case: { $lte: [{ $month: '$_id' }, 9] },
													then: 'third',
												},
											],
											default: 'fourth',
										},
									},
								],
							},
							totalSales: 1,
							count: 1,
							_id: 0,
						},
					},
				];
				break;

			case 'yearly':
				aggregationPipeline = [
					{
						$addFields: {
							created_at_date: {
								$dateFromString: { dateString: '$created_at' },
							},
						},
					},
					{
						$group: {
							_id: {
								year: { $year: '$created_at_date' },
							},
							totalSales: {
								$sum: {
									$toDouble: '$total_price_set.shop_money.amount',
								},
							},
							count: { $sum: 1 },
						},
					},
					{
						$sort: { '_id.year': 1 },
					},
					{
						$project: {
							year: '$_id.year',
							totalSales: 1,
							count: 1,
							_id: 0,
						},
					},
				];
				break;

			default:
				throw new Error('Invalid timeframe provided');
		}

		const data = await mongoose.connection.db
			?.collection('shopifyOrders')
			.aggregate(aggregationPipeline)
			.toArray();

		console.timeEnd('tookTime');
		return res
			.status(200)
			.json({ message: 'Sales with growth rate', data: data?.length ? data : [] });
	}),
	getSalesGrowth: catchAsyncError(async (req: Request, res: Response) => {
		console.time('tookTime');

		let aggregationPipeline = [
			{
				$addFields: {
					created_at_date: {
						$dateFromString: { dateString: '$created_at' },
					},
				},
			},
			{
				$group: {
					_id: {
						$dateTrunc: {
							date: '$created_at_date',
							unit: 'month',
						},
					},
					totalSales: {
						$sum: {
							$toDouble: '$total_price_set.shop_money.amount',
						},
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: {
					_id: 1,
				},
			},
			{
				$setWindowFields: {
					partitionBy: null,
					sortBy: { _id: 1 },
					output: {
						previousTotalSales: {
							$sum: '$totalSales',
							window: {
								documents: [-1, -1],
							},
						},
					},
				},
			},
			{
				$addFields: {
					salesGrowthRate: {
						$cond: [
							{ $eq: ['$previousTotalSales', 0] },
							0,
							{
								$multiply: [
									{
										$divide: [
											{
												$subtract: ['$totalSales', '$previousTotalSales'],
											},
											'$previousTotalSales',
										],
									},
									100,
								],
							},
						],
					},
				},
			},
			{
				$project: {
					year: { $year: '$_id' },
					month: { $month: '$_id' },
					totalSales: 1,
					count: 1,
					previousTotalSales: 1,
					salesGrowthRate: 1,
					_id: 0,
				},
			},
		];

		const data = await mongoose.connection.db
			?.collection('shopifyOrders')
			.aggregate(aggregationPipeline)
			.toArray();

		console.timeEnd('tookTime');
		return res
			.status(200)
			.json({ message: 'Sales with growth rate', data: data?.length ? data : [] });
	}),
	getNewCustomers: catchAsyncError(async (req: Request, res: Response) => {
		const timeframe = req.query?.timeframe ?? 'monthly';
		const commonStage = {
			$addFields: {
				created_at_date: {
					$dateFromString: { dateString: '$created_at' },
				},
			},
		};
		let aggregationPipeline = [];

		switch (timeframe) {
			case 'daily':
				aggregationPipeline = [
					commonStage,
					{
						$group: {
							_id: {
								year: { $year: '$created_at_date' },
								month: { $month: '$created_at_date' },
								day: { $dayOfMonth: '$created_at_date' },
							},
							newCustomer: {
								$sum: 1,
							},
						},
					},
					{
						$sort: {
							_id: 1,
						},
					},
					{
						$project: {
							year: '$_id.year',
							month: '$_id.month',
							day: '$_id.day',
							newCustomer: 1,
							_id: 0,
						},
					},
				];
				break;
			case 'monthly':
				aggregationPipeline = [
					commonStage,
					{
						$group: {
							_id: {
								year: { $year: '$created_at_date' },
								month: { $month: '$created_at_date' },
							},
							newCustomer: {
								$sum: 1,
							},
						},
					},
					{
						$sort: {
							_id: 1,
						},
					},
					{
						$project: {
							year: '$_id.year',
							month: '$_id.month',
							newCustomer: 1,
							_id: 0,
						},
					},
				];
				break;
			case 'yearly':
				aggregationPipeline = [
					commonStage,
					{
						$group: {
							_id: {
								year: { $year: '$created_at_date' },
							},
							newCustomer: {
								$sum: 1,
							},
						},
					},
					{
						$sort: {
							_id: 1,
						},
					},
					{
						$project: {
							year: '$_id.year',
							newCustomer: 1,
							_id: 0,
						},
					},
				];
				break;
			default:
				throw new Error('Invalid timeframe provided');
		}
		const data = await mongoose.connection.db
			?.collection('shopifyCustomers')
			.aggregate(aggregationPipeline)
			.toArray();
		return res.status(200).json({ message: 'customer data', data });
	}),
	getRepeatCustomers: catchAsyncError(async (req: Request, res: Response) => {
		const page = parseInt((req.query?.page as string) ?? '1', 10); // Current page number (default is 1)
		const limit = parseInt((req.query?.limit as string) ?? '10', 10) || 10; // Number of items per page (default is 10)
		const skip = (page - 1) * limit; // Number of items to skip
		console.log({ page, limit, skip });
		const totalDocuments = await mongoose.connection.db
			?.collection('shopifyOrders')
			.aggregate([
				{
					$group: {
						_id: '$email',
						count: {
							$sum: 1,
						},
					},
				},
				{
					$match: {
						count: {
							$gte: 2,
						},
					},
				},

				{
					$sort: {
						count: 1,
					},
				},
				{
					$count: 'totalCustomer', 
				},
			])
			.toArray();
		console.log(totalDocuments);
		const data = await mongoose.connection.db
			?.collection('shopifyOrders')
			.aggregate([
				{
					$addFields: {
						created_at_date: {
							$dateFromString: { dateString: '$created_at' },
						},
					},
				},
				{
					$group: {
						_id: '$email',
						count: {
							$sum: 1,
						},
						customer: { $first: '$customer' },
						created_at_date: { $first: '$created_at_date' },
					},
				},
				{
					$match: {
						count: {
							$gte: 2,
						},
					},
				},
				{
					$sort: {
						count: 1,
						_id: 1,
					},
				},
				{
					$project: {
						customer: {
							id: 1,
							email: 1,
							first_name: 1,
							last_name: 1,
						},
						year: { $year: '$created_at_date' },
						month: { $month: '$created_at_date' },
						day: { $dayOfMonth: '$created_at_date' },
						totalPurchase: '$count',
					},
				},
				{
					$skip: skip,
				},
				{
					$limit: limit,
				},
			])
			.toArray();

		console.log(data);
		const totalPage = totalDocuments?.length ? totalDocuments[0].totalCustomer : 0;

		return res.status(200).json({
			message: 'Repeated customer data',
			data,
			totalPage: Math.ceil(totalPage / limit),
		});
	}),
	getCustomerDistribution: catchAsyncError(async (req: Request, res: Response) => {
		const data = await mongoose.connection.db
			?.collection('shopifyCustomers')
			.aggregate([
				{
					$group: {
						_id: {
							city: '$default_address.city',
							country: '$default_address.country',
						},
						count: {
							$sum: 1,
						},
					},
				},
			])
			.toArray();
		return res.status(200).json({ message: 'Customer Distribution', data });
	}),
	getCustomerLifetimeValue: catchAsyncError(async (req: Request, res: Response) => {
		const data = await mongoose.connection.db
			?.collection('shopifyOrders')
			.aggregate([
				{
					$addFields: {
						created_at_date: {
							$dateFromString: {
								dateString: '$created_at',
							},
						},
					},
				},
				{
					$group: {
						_id: '$email',
						totalSpent: {
							$sum: {
								$toDecimal: '$total_price',
							},
						},
						firstPurchasedDate: {
							$min: '$created_at_date',
						},
					},
				},
				{
					$group: {
						_id: {
							year: {
								$year: '$firstPurchasedDate',
							},
							month: {
								$month: '$firstPurchasedDate',
							},
						},
						cohortTotalSpent: {
							$sum: '$totalSpent',
						},
						cohortTotalCustomer: {
							$sum: 1,
						},
					},
				},
				{
					$sort: {
						_id: 1,
					},
				},
				{
					$project: {
						cohort: {
							year: '$_id.year',
							month: '$_id.month',
						},
						averageCLV: { $divide: ['$cohortTotalSpent', '$cohortTotalCustomer'] },
						_id: 0,
					},
				},
			])
			.toArray();
		console.log(data);
		return res.status(200).json({ message: 'Customer Cohorts', data });
	}),
};
export default dashboardController;
