import { Controller, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-order')
    async createOrder(@Req() req: Request & { user: { id: string } }, @Body() body: { plan: string }) {
        if (!body.plan) throw new BadRequestException('Plan is required');
        return this.paymentsService.createOrder(req.user.id, body.plan);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify')
    async verifyPayment(@Req() req: Request & { user: { id: string } }, @Body() body: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        plan: string;
    }) {
        return this.paymentsService.verifyPayment(
            req.user.id,
            body.razorpay_order_id,
            body.razorpay_payment_id,
            body.razorpay_signature,
            body.plan
        );
    }
}
