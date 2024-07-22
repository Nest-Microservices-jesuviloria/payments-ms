import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentsSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService implements OnModuleInit {
  onModuleInit() {
    const logger = new Logger('PaymentsService');
    logger.log('PaymentsService initialized');
  }

  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentsSessionDto: PaymentsSessionDto) {
    const { currency, items, orderId } = paymentsSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      // Colocar aqui el Id de mi orden
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:3003/payments/success`,
      cancel_url: `http://localhost:3003/payments/cancel`,
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    /* const endpointSecret =
      'whsec_861478bc568c3645905ee3c87176d4303d8cf418e12ff46241015b0a9b707ea0'; */

    const endpointSecret = 'whsec_xXeNnawVOISmCtTLoj0Xvp4QdU26jG7y';

    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        // TODO: llamar nuestro miscroservice
        console.log({
          metadata: chargeSucceeded.metadata,
          orderId: chargeSucceeded.metadata.orderId,
        });
        break;

      default:
        console.log(`Event ${event.type} not handled`);
    }

    return res.status(200).json({ sig });
  }
}
