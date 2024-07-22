import {
  Body,
  Controller,
  Get,
  Logger,
  OnModuleInit,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController implements OnModuleInit {
  constructor(private readonly paymentsService: PaymentsService) {}
  onModuleInit() {
    const logger = new Logger('PaymentsController');
    logger.log('PaymentsController initialized');
  }

  @Post('create-payment-session')
  createPaymentSessions(@Body() paymentsSessionDto: PaymentsSessionDto) {
    return this.paymentsService.createPaymentSession(paymentsSessionDto);
  }

  @Get('success')
  success() {
    return { ok: true, message: 'Payment successful' };
  }

  @Get('cancel')
  cancel() {
    return { ok: false, message: 'Payment cancelled' };
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
