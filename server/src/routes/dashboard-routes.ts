import express, { Router } from 'express';
import dashboardController from '../controllers/dashboard';


const router: Router = express.Router();

router.route('/sales').get(dashboardController.getSales)
router.route('/sales/growth').get(dashboardController.getSalesGrowth)
router.route('/customers').get(dashboardController.getNewCustomers)
router.route('/customers/repeats').get(dashboardController.getRepeatCustomers)
router.route('/customers/distribution').get(dashboardController.getCustomerDistribution)
router.route('/customers/lifetime-value').get(dashboardController.getCustomerLifetimeValue)

export default router;
