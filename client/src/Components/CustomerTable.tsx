import React, { useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { RepeatedCustomer } from '../types';
import { API_URL } from '../CONSTANT';

const columns = [
	{
		name: 'First Name',
		selector: (row: RepeatedCustomer) => row.customer.first_name,
		sortable: true,
	},
	{
		name: 'Second Number',
		selector: (row: RepeatedCustomer) => row.customer.last_name,
		sortable: true,
	},
	{
		name: 'Email',
		selector: (row: RepeatedCustomer) => row.customer.email,
		sortable: true,
	},
	{
		name: 'Total Purchased',
		selector: (row: RepeatedCustomer) => row.totalPurchase,
		sortable: true,
	},
];

const CustomerTableTwo: React.FC = () => {
	const [data, setData] = useState<RepeatedCustomer[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [perPage] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const fetchData = useCallback((page: number, size: number) => {
		console.log('args', 'HI');
		setLoading(true);
		fetch(`${API_URL}/customers/repeats?page=${page}&limit=${size}`)
			.then((res) => res.json())
			.then((data) => {
				setData(data.data);
				setTotalRows(data.totalPage * perPage);
				setCurrentPage(currentPage);
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		fetchData(1, 10);
	}, []);
	return (
		<div>
			<DataTable
				columns={columns}
				data={data}
				progressPending={loading}
				pagination
				paginationTotalRows={totalRows}
				paginationServer
				onChangePage={async (page, newPerPage) => {
					console.log(page, newPerPage);
					const newPage = page === 0 ? 1 : page;
					fetchData(newPage, perPage);
				}}
				paginationPerPage={perPage}
				onChangeRowsPerPage={(currentRowPerPage) => {
					fetchData(1, currentRowPerPage);
				}}
			/>
		</div>
	);
};

export default CustomerTableTwo;
