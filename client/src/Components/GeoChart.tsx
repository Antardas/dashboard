import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { API_URL, GEO_API_KEY } from '../CONSTANT';
import { MapLocations } from '../types';
interface DistributionResponse {
	_id: {
		city: string;
		country: string;
	};
	count: number;
}
const GeoChart: React.FC = () => {
	const [locations, setLocations] = useState<MapLocations[]>([]);


	useEffect(() => {
		fetch(`${API_URL}/customers/distribution`)
			.then((res) => res.json())
			.then((response) => {
				const data: DistributionResponse[] = response.data;
				const savedLocations = JSON.parse(localStorage.getItem('locations') || '{}') ?? {};

				const fetchCoordinates = async (
					location: DistributionResponse
				): Promise<MapLocations | null> => {
					const city = location._id.city;
					const count = location.count;

					if (savedLocations[city]) {
						return {
							city,
							count,
							lat: savedLocations[city].lat,
							lon: savedLocations[city].lon,
						};
					}

					const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
						city
					)}&key=${GEO_API_KEY}&limit=1`;

					try {
						const res = await fetch(url);
						const data = await res.json();
						if (data.results.length > 0) {
							const { lat, lng } = data.results[0].geometry;

							savedLocations[city] = { lat, lon: lng };
							localStorage.setItem('locations', JSON.stringify(savedLocations));

							return { city, count, lat, lon: lng };
						}
					} catch (error) {
						console.error('Error fetching coordinates:', error);
					}
					return null;
				};

				// Fetch coordinates for all locations
				const fetchAllCoordinates = async () => {
					const promises = data.map((location) => fetchCoordinates(location));
					const results = await Promise.all(promises);
					setLocations(() => results.filter((location) => location !== null));
				};

				fetchAllCoordinates();
			})
			.catch((error) => {
				console.error('Error fetching customer data:', error);
			});
	}, []);

	const handleMouseOver = (e: {
		target: {
			openPopup: () => void;
		};
	}) => {
		if (e && e.target && e.target.openPopup) {
			e.target.openPopup();
		}
	};

	const handleMouseOut = (e: {
		target: {
			closePopup: () => void;
		};
	}) => {
		e.target.closePopup();
	};
	return (
		<div>
			<div>
				<h3>Customer Geographical Data</h3>
			</div>
			<div
				style={{
					width: '800px',
					height: '800px',
				}}
			>
				<MapContainer
					center={{
						lat: 37.7749,
						lng: -122.4194,
					}}
					zoom={4}
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					{locations.map((location, index) => (
						<CircleMarker
							key={index}
							center={[location.lat, location.lon]}
							radius={
								30 *
								Math.log(
									location.count === 1 ? location.count * 1.3 : location.count
								)
							}
							fillOpacity={0.5}
							stroke={false}
							eventHandlers={{
								mouseover: handleMouseOver,
								mouseout: handleMouseOut,
							}}
						>
							<Popup>
								<p>
									<strong>City:</strong> {location.city}
								</p>
								<p>
									<strong>Count:</strong> {location.count}
								</p>
							</Popup>
						</CircleMarker>
					))}
				</MapContainer>
			</div>
		</div>
	);
};

export default GeoChart;
